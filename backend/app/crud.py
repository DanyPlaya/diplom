from sqlalchemy.orm import Session
from geoalchemy2.functions import ST_X, ST_Y
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
