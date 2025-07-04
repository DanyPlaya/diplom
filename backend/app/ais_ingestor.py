# backend/app/ais_ingestor.py

import os
import json
import asyncio
import websockets

from datetime import datetime
from shapely.geometry import Point
from geoalchemy2.shape import from_shape
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Vessel, AISData

API_KEY = os.getenv("AISSTREAM_TOKEN")
WS_URL = "wss://stream.aisstream.io/v0/stream"
GLOBAL_BBOX = [[[-180, -90], [180, 90]]]

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

            # broadcast to all connected WebSocket clients
            # point was stored in DB; broadcasting disabled
