from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AISDataOut(BaseModel):
    mmsi: str
    timestamp: datetime
    latitude: float
    longitude: float
    sog: Optional[float]
    cog: Optional[float]
    heading: Optional[float]

    class Config:
        from_attributes = True
