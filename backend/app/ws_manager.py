# backend/app/ws_manager.py
from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, message: dict):
        living = []
        for ws in self.active:
            try:
                await ws.send_json(message)
                living.append(ws)
            except:
                # dead connection
                pass
        self.active = living

manager = ConnectionManager()
