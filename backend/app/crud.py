from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.functions import ST_X, ST_Y, ST_MakeEnvelope, ST_Within
from datetime import datetime
from .models import Vessel, AISData

def get_ais(db: Session, mmsi: str | None = None):
    q = (
        db.query(
            Vessel.mmsi,
            AISData.timestamp,
            ST_Y(AISData.geom).label("latitude"),
            ST_X(AISData.geom).label("longitude"),
            AISData.sog,
            AISData.cog,
            AISData.heading
        )
        .join(AISData, Vessel.id == AISData.vessel_id)
    )
    if mmsi:
        q = q.filter(Vessel.mmsi == mmsi)
    return q.order_by(AISData.timestamp).all()


def get_latest_ais_in_bbox(
    db: Session,
    bbox: tuple[float, float, float, float] | None = None,
    since: datetime | None = None,
):
    """Return latest AIS points for each vessel filtered by bbox and time."""

    sub = db.query(
        AISData.vessel_id, func.max(AISData.timestamp).label("max_ts")
    )

    if since is not None:
        sub = sub.filter(AISData.timestamp >= since)

    if bbox is not None:
        west, south, east, north = bbox
        envelope = ST_MakeEnvelope(west, south, east, north, 4326)
        sub = sub.filter(ST_Within(AISData.geom, envelope))

    sub = sub.group_by(AISData.vessel_id).subquery()

    q = (
        db.query(
            Vessel.mmsi,
            AISData.timestamp,
            ST_Y(AISData.geom).label("latitude"),
            ST_X(AISData.geom).label("longitude"),
            AISData.sog,
            AISData.cog,
            AISData.heading,
        )
        .join(AISData, Vessel.id == AISData.vessel_id)
        .join(
            sub,
            (sub.c.vessel_id == AISData.vessel_id)
            & (sub.c.max_ts == AISData.timestamp),
        )
    )

    return q.all()
