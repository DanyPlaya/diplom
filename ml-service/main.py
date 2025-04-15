
from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_next_point

app = FastAPI()

class AISPoint(BaseModel):
    latitude: float
    longitude: float
    sog: float
    cog: float

class PredictionRequest(BaseModel):
    history: list[AISPoint]

@app.post("/predict")
def predict(request: PredictionRequest):
    result = predict_next_point(request.history)
    return {"prediction": result}
    