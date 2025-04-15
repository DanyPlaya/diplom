import joblib
import numpy as np
from sklearn.neighbors import KNeighborsRegressor

X = []
y = []


start_lat = 59.93
start_lon = 20.20

# Генерируем 100 обучающих точек с небольшим прогрессом по маршруту
for i in range(100):
    lat = start_lat + i * 0.0005
    lon = start_lon + i * 0.0005
    sog = 12 + (i % 3)          # скорость с небольшими колебаниями
    cog = 90 + (i % 5)          # курс с небольшими изменениями

    X.append([lat, lon, sog, cog])
    y.append([lat + 0.0005, lon + 0.0005])  # следующая точка вперёд по маршруту

X = np.array(X)
y = np.array(y)

model = KNeighborsRegressor(n_neighbors=3)
model.fit(X, y)

joblib.dump(model, "model.pkl")
print("✅ Модель обучена и сохранена как model.pkl")
