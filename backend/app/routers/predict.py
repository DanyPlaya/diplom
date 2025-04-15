from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter()

class AISPoint(BaseModel):
    latitude: float
    longitude: float
    sog: float
    cog: float

class PredictionRequest(BaseModel):
    history: list[AISPoint]

@router.post("/predict")
def predict_route(request: PredictionRequest):
    try:
        response = requests.post("http://ml-service:8001/predict", json=request.dict())
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e)}
