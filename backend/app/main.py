# backend/app/main.py
import asyncio, threading
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import ais, vessel  # HTTP API
from app.ais_ingestor import consume_aisstream
from app.database import Base, engine
from app.notifier import manager

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


@app.websocket("/ws/alerts")
async def alerts_ws(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

def start_ais_task():
    asyncio.run(consume_aisstream())

threading.Thread(target=start_ais_task, daemon=True).start()
