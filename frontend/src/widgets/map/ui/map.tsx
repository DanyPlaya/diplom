// src/components/LiveMap.tsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AISPoint, useAISSocket } from "@/shared/hooks/use-AIS-socket";
import React from "react";

export function Map() {
  const points = useAISSocket();

  // Группируем точки по MMSI, чтобы нарисовать каждое судно своей линией
  const byVessel: Record<string, AISPoint[]> = {};
  points.forEach((p) => {
    (byVessel[p.mmsi] ||= []).push(p);
  });
  console.log(points);
  return (
    <MapContainer
      center={[59.93, 30.2]}
      zoom={8}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.entries(byVessel).map(([mmsi, vesselPts]) => {
        const coords = vesselPts.map(
          (p) => [p.latitude, p.longitude] as [number, number]
        );
        return (
          <React.Fragment key={mmsi}>
            {vesselPts.map((p, i) => (
              <Marker key={`${mmsi}-${i}`} position={[p.latitude, p.longitude]}>
                <Popup>
                  MMSI: {p.mmsi}
                  <br />
                  Время: {new Date(p.timestamp).toLocaleTimeString()}
                  <br />
                  SOG: {p.sog} kn, COG: {p.cog}°
                </Popup>
              </Marker>
            ))}
            {coords.length > 1 && (
              <Polyline
                positions={coords}
                pathOptions={{
                  // каждому судну можно свой цвет, например из массива заранее
                  color:
                    "#" +
                    ((parseInt(mmsi.slice(-6)) * 123456) % 0xffffff).toString(
                      16
                    ),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
