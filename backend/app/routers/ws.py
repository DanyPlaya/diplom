# backend/app/routers/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws_manager import manager

router = APIRouter()

@router.websocket("/ws/ais")
async def websocket_ais(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            # чтобы connection stay alive, читаем, но игнорируем
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)
