from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class AISPoint(BaseModel):
    lat: float
    lon: float
    ts: datetime
    sog: Optional[float] = None
    cog: Optional[float] = None
    heading: Optional[float] = None
    source: Optional[str] = None

class WeatherPoint(BaseModel):
    lat: float
    lon: float
    ts: datetime
    wind_speed: float
    wind_dir: float

class TrajectoryRequest(BaseModel):
    mmsi: str
    history: List[AISPoint]
    horizon_minutes: int = Field(ge=1, le=120)
    weather: Optional[List[WeatherPoint]] = None

class TrajectoryResponse(BaseModel):
    mmsi: str
    predicted_lat: float
    predicted_lon: float
    horizon_minutes: int

class CollisionPair(BaseModel):
    mmsi1: str
    mmsi2: str
    collision_risk_score: float
    closest_approach_time: datetime
    closest_distance: float

class CollisionRequest(BaseModel):
    mmsi_list: List[str]
    lookahead_minutes: int = Field(ge=1, le=60)

class CollisionResponse(BaseModel):
    risks: List[CollisionPair]

class AnomalyRequest(BaseModel):
    mmsi: str
    history: List[AISPoint]
    threshold_deg: float = 5
    threshold_km: float = 1

class AnomalyResponse(BaseModel):
    mmsi: str
    is_anomalous: bool
    deviation_angle: float
    deviation_distance: float
