# backend/app/socket_manager.py
import socketio
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=[])
app_sio = socketio.ASGIApp(sio, socketio_path="socket.io")