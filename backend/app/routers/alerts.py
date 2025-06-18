from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
_connections: set[WebSocket] = set()

@router.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket):
    await websocket.accept()
    _connections.add(websocket)
    try:
        while True:
            # Keep the connection alive; ignore incoming data
            await websocket.receive_text()
    except WebSocketDisconnect:
        _connections.discard(websocket)

async def broadcast_alert(message: dict):
    dead = []
    for ws in list(_connections):
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _connections.discard(ws)
