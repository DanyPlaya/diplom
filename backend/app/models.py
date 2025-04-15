from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Vessel(Base):
    __tablename__ = "vessels"
    id = Column(Integer, primary_key=True, index=True)
    mmsi = Column(String, unique=True, index=True)
    name = Column(String)
    imo = Column(String)  # ➕ добавь это
    destination = Column(String)  # ➕ и это

class AISData(Base):
    __tablename__ = "ais_data"

    id = Column(Integer, primary_key=True, index=True)
    vessel_id = Column(Integer, ForeignKey("vessels.id"))
    timestamp = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    sog = Column(Float)
    cog = Column(Float)
    heading = Column(Float)
