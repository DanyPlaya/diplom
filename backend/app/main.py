from fastapi import FastAPI
from app.routers import ais
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # разрешаем ВСЕХ, или можно указать ['http://localhost:5173']
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

app.include_router(ais.router, prefix="/api/ais", tags=["AIS"])
app.include_router(predict.router, prefix="/api", tags=["Predict"])