from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas import AISDataOut
from app import models

router = APIRouter()  # 💡 вот он!

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[AISDataOut])
def read_ais_data(mmsi: str = None, db: Session = Depends(get_db)):
    query = db.query(
        models.Vessel.mmsi,
        models.Vessel.name,
        models.Vessel.imo,
        models.Vessel.destination,
        models.AISData.timestamp,
        models.AISData.latitude,
        models.AISData.longitude,
        models.AISData.sog,
        models.AISData.cog,
        models.AISData.heading,
    ).join(models.Vessel, models.Vessel.id == models.AISData.vessel_id)

    if mmsi:
        query = query.filter(models.Vessel.mmsi == mmsi)

    return query.order_by(models.AISData.timestamp).all()
