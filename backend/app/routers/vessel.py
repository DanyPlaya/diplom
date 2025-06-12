from datetime import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import httpx
from ..database import SessionLocal
from ..crud import get_vessel_history
from ..schemas import GeoJSONFeatureCollection, GeoJSONFeature

AISSTREAM_TOKEN = os.getenv("AISSTREAM_TOKEN")
AISSTREAM_URL = "https://stream.aisstream.io/v0/events"  # hypothetical

router = APIRouter(prefix="/api/vessel", tags=["Vessel"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def fetch_history_from_aisstream(mmsi: int, start: datetime, end: datetime):
    if not AISSTREAM_TOKEN:
        return []
    params = {
        "mmsi": mmsi,
        "start": start.isoformat(),
        "end": end.isoformat(),
    }
    headers = {"APIKey": AISSTREAM_TOKEN}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(AISSTREAM_URL, params=params, headers=headers)
            r.raise_for_status()
            data = r.json()
            events = data.get("events", [])
            result = []
            for ev in events:
                pr = ev.get("Message", {}).get("PositionReport", {})
                if not pr:
                    continue
                result.append({
                    "timestamp": ev.get("Timestamp"),
                    "sog": pr.get("Sog"),
                    "cog": pr.get("Cog"),
                    "latitude": pr.get("Latitude"),
                    "longitude": pr.get("Longitude"),
                })
            return result
    except Exception:
        return []


@router.get("/{mmsi}/history", response_model=GeoJSONFeatureCollection)
async def vessel_history(
    mmsi: int,
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: Session = Depends(get_db),
):
    if start >= end:
        raise HTTPException(status_code=400, detail="start must be before end")

    points = await fetch_history_from_aisstream(mmsi, start, end)
    if not points:
        rows = get_vessel_history(db, str(mmsi), start, end)
        points = [
            {
                "timestamp": r.timestamp,
                "sog": r.sog,
                "cog": r.cog,
                "latitude": r.latitude,
                "longitude": r.longitude,
            }
            for r in rows
        ]

    features = [
        GeoJSONFeature(
            geometry={"type": "Point", "coordinates": [p["longitude"], p["latitude"]]},
            properties={"ts": p["timestamp"], "speed": p["sog"], "course": p["cog"]},
        )
        for p in points
    ]
    return GeoJSONFeatureCollection(features=features)
