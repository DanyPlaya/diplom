# ShipTracker

This project consists of a FastAPI backend, a React frontend and a machine learning service.

## Database migrations

Alembic is used for managing database schema changes. Start the database container first and run the migrations before launching the backend service:

```bash
# start postgres in the background
docker-compose up -d db
# run migrations inside the backend container
docker-compose run backend alembic upgrade head
```

Once migrations have been applied you can start the rest of the application:

```bash
docker-compose up
```
