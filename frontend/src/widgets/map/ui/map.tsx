import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

type AISData = {
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  timestamp: string;
  vessel_id: number;
};

export const Map = () => {
  const [data, setData] = useState<AISData[]>([]);
  const [mmsi, setMmsi] = useState("100000001");
  const [prediction, setPrediction] = useState<[number, number] | null>(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/ais/?mmsi=${mmsi}`
      );
      setData(res.data);
      setPrediction(null); // сбрасываем предсказание при новом запросе
    } catch (error) {
      console.error("Ошибка загрузки AIS:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const requestPrediction = async () => {
    const lastPoints = data.slice(-3).map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      sog: point.sog,
      cog: point.cog,
    }));

    try {
      const res = await axios.post("http://localhost:8000/api/predict", {
        history: lastPoints,
      });
      const coords = res.data.prediction;
      setPrediction([coords.latitude, coords.longitude]);
    } catch (err) {
      console.error("Ошибка предсказания:", err);
    }
  };

  const route: [number, number][] = data.map((p) => [p.latitude, p.longitude]);

  return (
    <div>
      {/* Панель управления */}
      <div className="p-4 bg-white shadow z-10 absolute top-4 left-4 rounded-md flex gap-2">
        <Input
          value={mmsi}
          onChange={(e) => setMmsi(e.target.value)}
          placeholder="Введите MMSI"
          className="w-52"
        />
        <Button onClick={fetchData}>🔍 Найти</Button>
        <Button onClick={requestPrediction} variant="outline">
          🤖 Предсказать
        </Button>
      </div>

      <MapContainer
        center={[59.95, 30.32]}
        zoom={12}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((point, idx) => (
          <Marker key={idx} position={[point.latitude, point.longitude]}>
            <Popup>
              ID: {point.vessel_id}
              <br />
              SOG: {point.sog} kn
              <br />
              COG: {point.cog}°<br />
              Время: {new Date(point.timestamp).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}

        {route.length > 1 && <Polyline positions={route} />}

        {prediction && (
          <>
            <Marker position={prediction}>
              <Popup>📍 Предсказание маршрута</Popup>
            </Marker>
            <Polyline
              positions={[route[route.length - 1], prediction]}
              pathOptions={{ color: "purple", dashArray: "5, 5" }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
