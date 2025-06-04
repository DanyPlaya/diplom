# backend/app/main.py
import asyncio, threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ais  # HTTP API
from app.ais_ingestor import consume_aisstream
from app.database import Base, engine

app = FastAPI(title="ShipTracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ais.router, tags=["AIS"])


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

def start_ais_task():
    asyncio.run(consume_aisstream())

threading.Thread(target=start_ais_task, daemon=True).start()
