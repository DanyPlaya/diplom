# ML Service

This microservice exposes prediction endpoints for ship trajectory, collision
risk and anomaly detection. It is implemented with FastAPI. Trajectory
predictions are computed using a sliding window of recent points with optional
heading and speed data. Geodesic calculations from `geopy` improve accuracy at
longer horizons. Anomaly detection smooths course values and checks for
statistical outliers in speed.

## Endpoints

- `POST /predict/trajectory` – predict the vessel position after a given
  horizon.
- `POST /predict/collision` – compute a dummy collision risk score for pairs of
  MMSI numbers.
- `POST /predict/anomaly` – detect course deviation.

Build and run with Docker:

```bash
docker build -t ml-service .
docker run -p 8001:8001 ml-service
```
