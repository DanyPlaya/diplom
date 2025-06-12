from __future__ import annotations
from typing import List
from datetime import datetime, timedelta
import math
from statistics import mean, pstdev

from geopy import Point
from geopy.distance import geodesic

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

def _avg_velocity(history: List) -> tuple[float, float]:
    """Return average delta lat/lon per minute over recent points."""
    window = history[-5:]  # last N points
    velocities = []
    for p1, p2 in zip(window, window[1:]):
        dt = (p2.ts - p1.ts).total_seconds() / 60 or 1
        velocities.append(((p2.lat - p1.lat) / dt, (p2.lon - p1.lon) / dt))
    if not velocities:
        return 0.0, 0.0
    avg_dlat = sum(v[0] for v in velocities) / len(velocities)
    avg_dlon = sum(v[1] for v in velocities) / len(velocities)
    return avg_dlat, avg_dlon


def predict_trajectory(req: TrajectoryRequest) -> TrajectoryResponse:
    history = req.history
    last = history[-1]
    horizon = req.horizon_minutes

    if len(history) < 2:
        return TrajectoryResponse(
            mmsi=req.mmsi,
            predicted_lat=last.lat,
            predicted_lon=last.lon,
            horizon_minutes=horizon,
        )

    avg_dlat, avg_dlon = _avg_velocity(history)

    # Incorporate heading and speed if present
    if last.heading is not None and last.sog is not None:
        speed_nm_per_min = last.sog / 60
        theta = math.radians(last.heading)
        dlat_h = speed_nm_per_min * math.cos(theta) / 60
        dlon_h = speed_nm_per_min * math.sin(theta) / (
            60 * math.cos(math.radians(last.lat))
        )
        avg_dlat = (avg_dlat + dlat_h) / 2
        avg_dlon = (avg_dlon + dlon_h) / 2

    bearing = math.degrees(math.atan2(avg_dlon, avg_dlat)) if (avg_dlat or avg_dlon) else (last.heading or 0)
    speed_knots = last.sog if last.sog is not None else math.hypot(avg_dlat, avg_dlon) * 60 * 60 / 1.852
    distance_nm = speed_knots * horizon / 60
    origin = Point(last.lat, last.lon)
    dest = geodesic(kilometers=distance_nm * 1.852).destination(origin, bearing)

    return TrajectoryResponse(
        mmsi=req.mmsi,
        predicted_lat=dest.latitude,
        predicted_lon=dest.longitude,
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

    headings = [p.heading or p.cog or 0.0 for p in history]
    smoothed = []
    alpha = 0.3
    prev = headings[0]
    for h in headings:
        prev = alpha * h + (1 - alpha) * prev
        smoothed.append(prev)

    baseline_angle = smoothed[0]
    last_angle = smoothed[-1]
    deviation_angle = abs(last_angle - baseline_angle)

    deviation_distance = _haversine(start.lat, start.lon, end.lat, end.lon)

    speeds = [p.sog for p in history if p.sog is not None]
    speed_anomaly = False
    if len(speeds) >= 2:
        avg_speed = mean(speeds)
        std_speed = pstdev(speeds)
        last_speed = speeds[-1]
        speed_anomaly = last_speed > avg_speed + 3 * std_speed

    is_anomalous = (
        deviation_angle > req.threshold_deg
        or deviation_distance > req.threshold_km
        or speed_anomaly
    )
    return AnomalyResponse(
        mmsi=req.mmsi,
        is_anomalous=is_anomalous,
        deviation_angle=deviation_angle,
        deviation_distance=deviation_distance,
    )
