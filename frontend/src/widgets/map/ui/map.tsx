import React from "react";
import ReactDOMServer from "react-dom/server";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { MousePointer2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import { AISPoint, useAISSocket } from "@/shared/hooks/use-AIS-socket";
import { MapEvents } from "../lib/map-events";
import { useGetShips } from "@/entity/ship";
import { cn } from "@/shared/lib/utils";
import { MapCoord } from "@/features/map";

export function Map() {
  const { points, stopWs } = useAISSocket();

  const { data } = useGetShips({
    min_lat: 51.0,
    min_lon: 6.0,
    max_lat: 60.0,
    max_lon: 10.0,
  });

  const createRotatedIcon = (heading: number) => {
    const pointerSvg = ReactDOMServer.renderToStaticMarkup(
      <MousePointer2 fill="red" size={16} />
    );
    return L.divIcon({
      html: `<div style="transform: rotate(${heading}deg); width:32px; height:32px;">${pointerSvg}</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16], // Adjust anchor point if needed
      popupAnchor: [0, -16],
    });
  };

  const byVessel: Record<string, AISPoint[]> = {};
  data?.data.forEach((p) => {
    (byVessel[p.mmsi] ||= []).push(p);
  });

  return (
    <MapContainer
      className={cn("markercluster-map", "h-full")}
      attributionControl={false}
      center={[59.93, 30.2]}
      zoom={8}
    >
      <TileLayer
        eventHandlers={{ click: (e) => console.log(e.latlng.lat) }}
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <div className="absolute bottom-2 left-4 z-[1000]">
        <MapCoord />
      </div>
      <MapEvents />
      <MarkerClusterGroup>
        {Object.entries(byVessel).map(([mmsi, vesselPts]) => {
          const coords = vesselPts.map(
            (p) => [p.latitude, p.longitude] as [number, number]
          );

          return (
            <React.Fragment key={mmsi}>
              {vesselPts.map((p, i) => (
                <Marker
                  icon={createRotatedIcon(p.heading ?? 0)}
                  key={`${mmsi}-${i}`}
                  position={[p.latitude, p.longitude]}
                >
                  <Popup>
                    MMSI: {p.mmsi}
                    <br />
                    Время: {new Date(p.timestamp).toLocaleTimeString()}
                    <br />
                    SOG: {p.sog} kn, COG: {p.cog}°
                    <br />
                    Heading: {p?.heading}
                  </Popup>
                </Marker>
              ))}
              {coords.length > 1 && (
                <Polyline
                  positions={coords}
                  pathOptions={{
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
      </MarkerClusterGroup>
      <div
        className="z-[9999] cursor-pointer w-20 h-6  text-center rounded-sm top-2  bg-teal-400 absolute right-4"
        onClick={() => stopWs(true)}
      >
        <span>close</span>
      </div>
    </MapContainer>
  );
}
