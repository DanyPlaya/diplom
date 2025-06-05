# backend/app/main.py
import asyncio, threading
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic import command
from alembic.config import Config
from app.routers import ais  # HTTP API
from app.ais_ingestor import consume_aisstream

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
    alembic_cfg = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    command.upgrade(alembic_cfg, "head")

def start_ais_task():
    asyncio.run(consume_aisstream())

threading.Thread(target=start_ais_task, daemon=True).start()
