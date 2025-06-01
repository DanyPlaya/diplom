// src/hooks/useAISWebSocket.ts
import { useEffect, useState } from "react";

export interface AISPoint {
  mmsi: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  sog?: number;
  cog?: number;
  heading?: number;
}

export function useAISSocket() {
  const [points, setPoints] = useState<AISPoint[]>([]);
  const [isStopWs, setIsStopWs] = useState(false);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/ais");
    if (isStopWs) ws.close();

    ws.onopen = () => console.log("WSS connected");
    ws.onmessage = (evt) => {
      try {
        const pt: AISPoint = JSON.parse(evt.data);
        setPoints((prev) => [...prev, pt]);
      } catch {
        /* empty */
      }
    };
    ws.onerror = (e) => console.error("WSS error", e);
    ws.onclose = () => console.log("WSS closed");

    // пингуем сервер раз в минуту, чтобы соединение не умирало
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send("ping");
    }, 60_000);

    return () => {
      clearInterval(ping);
      ws.close();
    };
  }, [isStopWs]);

  return {
    points: points,
    stopWs: setIsStopWs,
  };
}
