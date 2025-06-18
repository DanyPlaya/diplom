# backend/app/ais_ingestor.py

import os
import json
import asyncio
import math
import websockets

from datetime import datetime
from shapely.geometry import Point
from geoalchemy2.shape import from_shape
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Vessel, AISData
from .routers.alerts import broadcast_alert

API_KEY = os.getenv("AISSTREAM_TOKEN")
WS_URL = "wss://stream.aisstream.io/v0/stream"
GLOBAL_BBOX = [[[-180, -90], [180, 90]]]

# store latest position and velocity for each vessel
_state: dict[str, dict[str, float]] = {}

def _project(lat: float, lon: float) -> tuple[float, float]:
    """Approximate projection of lat/lon to meters using spherical earth."""
    R = 6371000.0
    x = math.radians(lon) * R * math.cos(math.radians(lat))
    y = math.radians(lat) * R
    return x, y

def _calc_cpa_tcpa(x1: float, y1: float, vx1: float, vy1: float,
                   x2: float, y2: float, vx2: float, vy2: float) -> tuple[float, float]:
    dx = x2 - x1
    dy = y2 - y1
    dvx = vx2 - vx1
    dvy = vy2 - vy1
    den = dvx * dvx + dvy * dvy
    if den == 0:
        return float("inf"), float("inf")
    tcpa = -(dx * dvx + dy * dvy) / den
    if tcpa < 0:
        return float("inf"), tcpa
    x1p = x1 + vx1 * tcpa
    y1p = y1 + vy1 * tcpa
    x2p = x2 + vx2 * tcpa
    y2p = y2 + vy2 * tcpa
    cpa = math.sqrt((x2p - x1p) ** 2 + (y2p - y1p) ** 2)
    return cpa, tcpa

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

                point = AISData(
                    vessel_id=vessel.id,
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

            # update in-memory state for collision detection
            if sog is not None and cog is not None:
                x, y = _project(lat, lon)
                speed = sog * 0.514444  # knots to m/s
                vx = speed * math.sin(math.radians(cog))
                vy = speed * math.cos(math.radians(cog))
                _state[mmsi] = {"x": x, "y": y, "vx": vx, "vy": vy}

                for other_mmsi, other in _state.items():
                    if other_mmsi == mmsi:
                        continue
                    cpa, tcpa = _calc_cpa_tcpa(
                        x, y, vx, vy,
                        other["x"], other["y"], other["vx"], other["vy"]
                    )
                    if cpa < 500 and 0 <= tcpa < 120:
                        alert = {
                            "type": "collision_risk",
                            "self_mmsi": mmsi,
                            "other_mmsi": other_mmsi,
                            "cpa": cpa,
                            "tcpa": tcpa,
                            "timestamp": ts.isoformat(),
                        }
                        await broadcast_alert(alert)

            # broadcast to all connected WebSocket clients
            # point was stored in DB; broadcasting disabled
