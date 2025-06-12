from __future__ import annotations
from typing import List
from datetime import datetime, timedelta
import math

from schemas import (
    TrajectoryRequest,
    TrajectoryResponse,
    CollisionRequest,
    CollisionPair,
    AnomalyRequest,
    AnomalyResponse,
)


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great circle distance in kilometers."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------- trajectory prediction -----------------

def predict_trajectory(req: TrajectoryRequest) -> TrajectoryResponse:
    history = req.history
    if len(history) < 2:
        last = history[-1]
        return TrajectoryResponse(
            mmsi=req.mmsi,
            predicted_lat=last.lat,
            predicted_lon=last.lon,
            horizon_minutes=req.horizon_minutes,
        )
    p1, p2 = history[-2], history[-1]
    dt = (p2.ts - p1.ts).total_seconds() / 60 or 1
    dlat = (p2.lat - p1.lat) / dt
    dlon = (p2.lon - p1.lon) / dt
    horizon = req.horizon_minutes
    pred_lat = p2.lat + dlat * horizon
    pred_lon = p2.lon + dlon * horizon
    return TrajectoryResponse(
        mmsi=req.mmsi,
        predicted_lat=pred_lat,
        predicted_lon=pred_lon,
        horizon_minutes=horizon,
    )


# ---------------- collision risk -----------------

def evaluate_collision_risk(req: CollisionRequest) -> List[CollisionPair]:
    risks = []
    now = datetime.utcnow()
    for idx in range(len(req.mmsi_list) - 1):
        score = max(0.0, 1.0 - 0.1 * idx)
        pair = CollisionPair(
            mmsi1=req.mmsi_list[idx],
            mmsi2=req.mmsi_list[idx + 1],
            collision_risk_score=score,
            closest_approach_time=now + timedelta(minutes=req.lookahead_minutes),
            closest_distance=0.5 + idx,
        )
        risks.append(pair)
    return risks


# ---------------- anomaly detection -----------------

def detect_anomaly(req: AnomalyRequest) -> AnomalyResponse:
    history = req.history
    if len(history) < 2:
        return AnomalyResponse(
            mmsi=req.mmsi,
            is_anomalous=False,
            deviation_angle=0.0,
            deviation_distance=0.0,
        )

    start = history[0]
    end = history[-1]
    baseline_angle = math.degrees(math.atan2(end.lon - start.lon, end.lat - start.lat))
    last_angle = history[-1].cog or baseline_angle
    deviation_angle = abs(last_angle - baseline_angle)
    deviation_distance = _haversine(start.lat, start.lon, end.lat, end.lon)
    is_anomalous = deviation_angle > req.threshold_deg or deviation_distance > req.threshold_km
    return AnomalyResponse(
        mmsi=req.mmsi,
        is_anomalous=is_anomalous,
        deviation_angle=deviation_angle,
        deviation_distance=deviation_distance,
    )
