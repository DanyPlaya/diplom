from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import AISDataOut
from ..crud import get_ais


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
