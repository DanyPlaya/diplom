from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AISDataOut(BaseModel):
    mmsi: str
    timestamp: datetime
    latitude: float
    longitude: float
    sog: float
    cog: float
    heading: Optional[float] = None
    name: Optional[str] = None
    imo: Optional[str] = None
    destination: Optional[str] = None

    class Config:
        orm_mode = True
