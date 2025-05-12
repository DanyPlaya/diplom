# backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship
from .database import Base

class Vessel(Base):
    __tablename__ = "vessels"
    id          = Column(Integer, primary_key=True, index=True)
    mmsi        = Column(String, unique=True, index=True, nullable=False)
    name        = Column(String, nullable=True)
    imo         = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    ais_points  = relationship("AISData", back_populates="vessel")

class AISData(Base):
    __tablename__ = "ais_data"
    id         = Column(Integer, primary_key=True, index=True)
    vessel_id  = Column(Integer, ForeignKey("vessels.id"), nullable=False)
    timestamp  = Column(DateTime, nullable=False)
    sog        = Column(Float,  nullable=True)
    cog        = Column(Float,  nullable=True)
    heading    = Column(Float,  nullable=True)
    # Просто указываем Point с SRID 4326
    geom       = Column(Geometry("POINT", srid=4326), nullable=False, index=True)

    vessel     = relationship("Vessel", back_populates="ais_points")
