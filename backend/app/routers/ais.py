from fastapi import APIRouter, Depends, Query
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal, Base, engine
from ..schemas import AISDataOut
from ..crud import get_ais, get_latest_ais_in_bbox

# Создаём таблицы, если их ещё нет
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/ais", tags=["AIS"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[AISDataOut])
def read_ais(mmsi: str | None = None, db: Session = Depends(get_db)):
    return get_ais(db, mmsi)


@router.get("/in_bbox", response_model=list[AISDataOut])
def read_latest_in_bbox(
    min_lat: float = Query(...),
    min_lon: float = Query(...),
    max_lat: float = Query(...),
    max_lon: float = Query(...),
    since: datetime | None = None,
    db: Session = Depends(get_db),
):
    bbox = (min_lon, min_lat, max_lon, max_lat)
    return get_latest_ais_in_bbox(db, bbox=bbox, since=since)
