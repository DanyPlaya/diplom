import React, { useCallback, useEffect, useState } from "react";
import { useRef } from "react";

export function useReconnectWebSocket(
  url: string,
  onMessage: (data: any) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      if (!isMounted) return;
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WS connected");
        reconnectDelay.current = 1000; // сброс задержки
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          onMessage(msg);
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        console.log(`WS closed, reconnect in ${reconnectDelay.current}ms`);
        socketRef.current = null;
        setTimeout(connect, reconnectDelay.current);
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      };

      ws.onerror = (e) => {
        console.error("WS error", e);
        ws.close();
      };
    }

    connect();
    return () => {
      isMounted = false;
      socketRef.current?.close();
    };
  }, [url, onMessage]);
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  // Обработчик пришедшего события
  const handleMessage = useCallback((msg: any) => {
    if (msg.type === "collision_risk") {
      setAlerts((prev) => [
        ...prev,
        {
          self: msg.self_mmsi,
          other: msg.other_mmsi,
          cpa: msg.cpa.toFixed(1),
          tcpa: msg.tcpa.toFixed(0),
          time: msg.timestamp,
        },
      ]);
    }
  }, []);

  // Подключаемся с автопереподключением
  useReconnectWebSocket("ws://localhost:8000/ws/alerts", handleMessage);

  return (
    <div>
      <h2>Alerts</h2>
      <button onClick={() => Notification.requestPermission()}>
        Включить desktop-уведомления
      </button>
      <ul>
        {alerts.map((a, i) => (
          <li key={`${a.self}-${a.other}-${i}`}>
            [{a.time}] {a.self} vs {a.other} — CPA: {a.cpa} m, TCPA: {a.tcpa}s
          </li>
        ))}
      </ul>
    </div>
  );
}
