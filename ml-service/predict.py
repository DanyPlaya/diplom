
import joblib
import numpy as np
from sklearn.neighbors import KNeighborsRegressor

# Загружаем модель
model = joblib.load("model.pkl")

def predict_next_point(history):
    if len(history) < 3:
        return {"error": "Need at least 3 points"}

    X = []
    for point in history:
        X.append([point.latitude, point.longitude, point.sog, point.cog])

    last_known = np.array(X[-1]).reshape(1, -1)
    pred = model.predict(last_known)

    return {
        "latitude": float(pred[0][0]),
        "longitude": float(pred[0][1])
    }
    