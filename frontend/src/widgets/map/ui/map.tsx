import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  Circle,
  FeatureGroup,
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

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

  // ссылка на WebSocket
  const wsRef = useRef<WebSocket | null>(null);

  // REST-запрос для исторических точек
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/ais/?mmsi=${mmsi}`
      );
      setData(res.data);
      setPrediction(null);
    } catch (error) {
      console.error("Ошибка загрузки AIS:", error);
    }
  };

  // Запрос предсказания
  const requestPrediction = async () => {
    const lastPoints = data.slice(-3).map((pt) => ({
      latitude: pt.latitude,
      longitude: pt.longitude,
      sog: pt.sog,
      cog: pt.cog,
    }));
    try {
      const res = await axios.post("http://localhost:8000/api/predict", {
        history: lastPoints,
      });
      const { latitude, longitude } = res.data.prediction;
      setPrediction([latitude, longitude]);
    } catch (err) {
      console.error("Ошибка предсказания:", err);
    }
  };

  // Функция запуска стрима через WebSocket
  const startStreaming = () => {
    // если уже висит соединение — закрываем
    if (wsRef.current) {
      wsRef.current.close();
    }

    // в браузере WebSocket глобальный
    const socket = new WebSocket("wss://stream.aistream.io/v0/stream");
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");

      const subscriptionMessage = {
        Apikey: "75e4ef6bfc7dd71027706ee40d817eb77cf1a14a",
        BoundingBoxes: [
          [
            [-90, -180],
            [90, 180],
          ],
        ],
      };

      socket.send(JSON.stringify(subscriptionMessage));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // предполагаем, что msg содержит нужные поля:
        setData((prev) => [
          ...prev,
          {
            latitude: msg.latitude,
            longitude: msg.longitude,
            sog: msg.sog,
            cog: msg.cog,
            timestamp: msg.timestamp,
            vessel_id: msg.mmsi,
          },
        ]);
      } catch (e) {
        console.error("Не удалось распарсить WS сообщение:", e);
      }
    };

    socket.onclose = (ev) => {
      console.log("WebSocket closed:", ev.reason);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  };

  // при размонтировании — закрываем WS
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const route: [number, number][] = data.map((p) => [p.latitude, p.longitude]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Панель управления */}
      <div style={{ padding: 12, display: "flex", gap: 8 }}>
        <Input
          value={mmsi}
          onChange={(e) => setMmsi(e.target.value)}
          placeholder="MMSI судна"
        />
        <Button onClick={fetchData}>Загрузить</Button>
        <Button onClick={startStreaming}>Стрим AIS</Button>
        <Button onClick={requestPrediction}>Предсказать</Button>
      </div>

      {/* Карта */}
      <MapContainer
        attributionControl={false}
        center={[59.95, 30.32]}
        zoom={12}
        style={{ flex: 1 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="topright">
          <LayersControl.Overlay name="Тестовый маркер">
            <Marker position={[59.95, 30.32]}>
              <Popup>Тестовая точка</Popup>
            </Marker>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Круги">
            <LayerGroup>
              <Circle center={[59.95, 30.32]} radius={200} />
              <Circle center={[59.95, 30.32]} radius={100} stroke={false} />
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="FeatureGroup">
            <FeatureGroup pathOptions={{ color: "purple" }}>
              <Popup>FeatureGroup</Popup>
              <Circle center={[51.51, -0.06]} radius={200} />
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {/* AIS-точки */}
        {data.map((pt, i) => (
          <Marker key={i} position={[pt.latitude, pt.longitude]}>
            <Popup>
              MMSI: {pt.vessel_id}
              <br />
              SOG: {pt.sog} kn
              <br />
              COG: {pt.cog}°
              <br />
              {new Date(pt.timestamp).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}

        {/* Линия маршрута */}
        {route.length > 1 && <Polyline positions={route} />}

        {/* Предсказание */}
        {prediction && (
          <>
            <Marker position={prediction}>
              <Popup>📍 Predicted</Popup>
            </Marker>
            <Polyline
              positions={[route[route.length - 1], prediction]}
              pathOptions={{ dashArray: "5,5" }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
