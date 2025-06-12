from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Literal

class AISDataOut(BaseModel):
    mmsi: str
    timestamp: datetime
    latitude: float
    longitude: float
    sog: Optional[float]
    cog: Optional[float]
    heading: Optional[float]
    ship_type: Optional[int]

    class Config:
        from_attributes = True


class GeoJSONFeature(BaseModel):
    """GeoJSON Feature representing a single point."""

    type: Literal["Feature"] = "Feature"
    geometry: dict = Field(..., description="Point geometry")
    properties: dict


class GeoJSONFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[GeoJSONFeature]
