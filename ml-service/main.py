from fastapi import FastAPI

from schemas import (
    AISPoint,
    WeatherPoint,
    TrajectoryRequest,
    TrajectoryResponse,
    CollisionPair,
    CollisionRequest,
    CollisionResponse,
    AnomalyRequest,
    AnomalyResponse,
)
from predict import predict_trajectory, evaluate_collision_risk, detect_anomaly

app = FastAPI(title="Ship ML Service")

@app.post("/predict/trajectory", response_model=TrajectoryResponse)
def trajectory_endpoint(req: TrajectoryRequest):
    pred = predict_trajectory(req)
    return pred

@app.post("/predict/collision", response_model=CollisionResponse)
def collision_endpoint(req: CollisionRequest):
    risks = evaluate_collision_risk(req)
    return {"risks": risks}

@app.post("/predict/anomaly", response_model=AnomalyResponse)
def anomaly_endpoint(req: AnomalyRequest):
    res = detect_anomaly(req)
    return res
