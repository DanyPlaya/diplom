from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

models.Base.metadata.create_all(bind=engine)
db: Session = SessionLocal()

base_time = datetime.utcnow().replace(minute=0, second=0, microsecond=0)


start_lat = 59.93
start_lon = 20.20

for vessel_num in range(1, 11):
    mmsi = f"10000000{vessel_num}"
    vessel = models.Vessel(
        mmsi=mmsi,
        name=f"Vessel {vessel_num}",
        imo=f"IMO10000{vessel_num}",
        destination="St. Petersburg"
    )
    db.add(vessel)
    db.commit()
    db.refresh(vessel)

    for i in range(5):
        ais_point = models.AISData(
            vessel_id=vessel.id,
            timestamp=base_time + timedelta(minutes=i * 10),
            latitude=start_lat + 0.001 * i + 0.01 * vessel_num,  
            longitude=start_lon + 0.001 * i,
            sog=12.0 + i,
            cog=90 + i * 2,
            heading=85 + i
        )
        db.add(ais_point)

db.commit()
db.close()
print("✅ Моки с координатами на воде успешно добавлены.")
