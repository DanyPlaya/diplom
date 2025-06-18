# backend/app/ais_ingestor.py

import os
import json
import asyncio
import websockets

from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, inf
from shapely.geometry import Point
from geoalchemy2.shape import from_shape
from geoalchemy2.functions import ST_X, ST_Y, ST_DWithin
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import SessionLocal
from .models import Vessel, AISData
from .notifier import manager

API_KEY = os.getenv("AISSTREAM_TOKEN")
WS_URL = "wss://stream.aisstream.io/v0/stream"
GLOBAL_BBOX = [[[-180, -90], [180, 90]]]


def lonlat_to_xy(lon: float, lat: float, ref_lon: float, ref_lat: float) -> tuple[float, float]:
    """Project lon/lat to local tangent plane in meters."""
    R = 6371000.0
    x = radians(lon - ref_lon) * R * cos(radians(ref_lat))
    y = radians(lat - ref_lat) * R
    return x, y


def compute_cpa_tcpa(
    x1: float,
    y1: float,
    vx1: float,
    vy1: float,
    x2: float,
    y2: float,
    vx2: float,
    vy2: float,
) -> tuple[float, float]:
    """Return CPA (m) and TCPA (s) for two moving objects."""

    dx = x2 - x1
    dy = y2 - y1
    dvx = vx2 - vx1
    dvy = vy2 - vy1
    den = dvx ** 2 + dvy ** 2
    if den == 0:
        return (inf, inf)
    tcpa = - (dx * dvx + dy * dvy) / den
    if tcpa < 0:
        return (inf, tcpa)
    x1p = x1 + vx1 * tcpa
    y1p = y1 + vy1 * tcpa
    x2p = x2 + vx2 * tcpa
    y2p = y2 + vy2 * tcpa
    cpa = sqrt((x2p - x1p) ** 2 + (y2p - y1p) ** 2)
    return (cpa, tcpa)

async def consume_aisstream():
    print(f"[AIS] Connecting to {WS_URL}")
    async with websockets.connect(WS_URL) as ws:
        # send subscription
        subscribe = {
            "APIKey": API_KEY,
            "BoundingBoxes": GLOBAL_BBOX,
            "FilterMessageTypes": ["PositionReport", "ShipStaticData"],
        }
        await ws.send(json.dumps(subscribe))
        print(f"[AIS] Subscribed: {subscribe}")

        # process incoming messages
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("MessageType")
            if msg_type == "ShipStaticData":
                static = msg["Message"]["ShipStaticData"]
                mmsi = str(static["UserID"])
                ship_type = static.get("Type")

                db: Session = SessionLocal()
                try:
                    vessel = db.query(Vessel).filter_by(mmsi=mmsi).first()
                    if not vessel:
                        vessel = Vessel(mmsi=mmsi, type=ship_type)
                        db.add(vessel)
                        db.commit()
                    elif ship_type is not None and vessel.type is None:
                        vessel.type = ship_type
                        db.add(vessel)
                        db.commit()
                finally:
                    db.close()
                continue

            if msg_type != "PositionReport":
                continue

            pr = msg["Message"]["PositionReport"]
            mmsi = str(pr["UserID"])
            lat = float(pr["Latitude"])
            lon = float(pr["Longitude"])
            sog = pr.get("Sog")
            cog = pr.get("Cog")
            heading = pr.get("TrueHeading")
            timestamp = msg.get("Timestamp")
            try:
                ts = datetime.fromisoformat(timestamp)
            except Exception:
                ts = datetime.utcnow()

            # save to PostGIS
            db: Session = SessionLocal()
            try:
                vessel = db.query(Vessel).filter_by(mmsi=mmsi).first()
                if not vessel:
                    vessel = Vessel(mmsi=mmsi)
                    db.add(vessel)
                    db.commit()
                    db.refresh(vessel)
                vessel_id = vessel.id

                point = AISData(
                    vessel_id=vessel_id,
                    timestamp=ts,
                    sog=sog,
                    cog=cog,
                    heading=heading,
                    geom=from_shape(Point(lon, lat), srid=4326)
                )
                db.add(point)
                db.commit()
            finally:
                db.close()

            # find nearby vessels and compute collision risk
            if sog is not None and cog is not None:
                db = SessionLocal()
                try:
                    point_geom = from_shape(Point(lon, lat), srid=4326)
                    sub = (
                        db.query(
                            AISData.vessel_id,
                            func.max(AISData.timestamp).label("max_ts"),
                        )
                        .filter(AISData.vessel_id != vessel_id)
                        .group_by(AISData.vessel_id)
                        .subquery()
                    )

                    neighbors = (
                        db.query(
                            Vessel.mmsi,
                            AISData.sog,
                            AISData.cog,
                            ST_Y(AISData.geom).label("lat"),
                            ST_X(AISData.geom).label("lon"),
                        )
                        .join(Vessel, Vessel.id == AISData.vessel_id)
                        .join(
                            sub,
                            (sub.c.vessel_id == AISData.vessel_id)
                            & (sub.c.max_ts == AISData.timestamp),
                        )
                        .filter(ST_DWithin(AISData.geom, point_geom, 0.1))
                        .all()
                    )
                finally:
                    db.close()

                for n in neighbors:
                    if n.sog is None or n.cog is None:
                        continue

                    x1, y1 = 0.0, 0.0
                    x2, y2 = lonlat_to_xy(n.lon, n.lat, lon, lat)

                    spd1 = sog * 0.514444
                    spd2 = n.sog * 0.514444
                    vx1 = spd1 * sin(radians(cog))
                    vy1 = spd1 * cos(radians(cog))
                    vx2 = spd2 * sin(radians(n.cog))
                    vy2 = spd2 * cos(radians(n.cog))

                    cpa, tcpa = compute_cpa_tcpa(x1, y1, vx1, vy1, x2, y2, vx2, vy2)
                    if cpa < 500 and 0 <= tcpa < 120:
                        alert = {
                            "type": "collision_risk",
                            "timestamp": ts.isoformat(),
                            "self_mmsi": mmsi,
                            "other_mmsi": n.mmsi,
                            "cpa": cpa,
                            "tcpa": tcpa,
                        }
                        asyncio.create_task(manager.broadcast(alert))
