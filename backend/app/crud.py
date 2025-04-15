from sqlalchemy.orm import Session
from app import models

def get_ais_data(db: Session):
    return db.query(models.AISData).all()
