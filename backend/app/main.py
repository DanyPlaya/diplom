# backend/app/main.py
import asyncio, threading
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import ais, vessel, alerts  # HTTP API
from app.ais_ingestor import consume_aisstream
from app.database import Base, engine

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app = FastAPI(title="ShipTracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ais.router, tags=["AIS"])
app.include_router(vessel.router, tags=["Vessel"])
app.include_router(alerts.router, tags=["Alerts"])


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

def start_ais_task():
    asyncio.run(consume_aisstream())

threading.Thread(target=start_ais_task, daemon=True).start()
