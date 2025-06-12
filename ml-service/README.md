# ML Service

This microservice exposes simple prediction endpoints for ship trajectory,
collision risk and anomaly detection. It is implemented with FastAPI.

## Endpoints

- `POST /predict/trajectory` – predict next location using the last two points
  in the provided history.
- `POST /predict/collision` – compute a dummy collision risk score for pairs of
  MMSI numbers.
- `POST /predict/anomaly` – detect course deviation.

Build and run with Docker:

```bash
docker build -t ml-service .
docker run -p 8001:8001 ml-service
```
