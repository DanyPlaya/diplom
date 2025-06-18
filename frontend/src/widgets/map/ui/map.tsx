import { shipColor, useGetShips } from "@/entity/ship";
import { MapCoord } from "@/features/map";
import { cn } from "@/shared/lib/utils";
import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
// import "react-leaflet-markercluster/styles";
import { Vessel } from "@/entity/ship/model/types";
import { ShipCount } from "@/features/map/ship-count";
import WeatherWidget from "@/features/weather/ui/weather";
import { Circle, MousePointer2 } from "lucide-react";
import ReactLeafletPixiOverlay, {
  MarkerPropsPixiOverlay,
} from "react-leaflet-pixi-overlay";
import { useSearchParams } from "react-router";
import { MapEvents } from "../lib/map-events";
import WeatherWidgetExpandable from "@/features/weather/ui/weather";
const PointerIcon = (color: string, heading: number, speed: number) =>
  speed > 0 ? (
    <MousePointer2
      style={{
        transform: `rotate(${heading}deg)`,
      }}
      fill={color}
    />
  ) : (
    <Circle size={"14px"} fill={color} />
  );

export function Map() {
  const [searchParams, _] = useSearchParams();

  const [historyGeoJson, setHistoryGeoJson] = useState<any>(null);

  const { data } = useGetShips({
    min_lat: Number(searchParams.get("swLat")),
    min_lon: Number(searchParams.get("swLng")),
    max_lat: Number(searchParams.get("neLat")),
    max_lon: Number(searchParams.get("neLng")),
  });

  const createRotatedIcon = (heading: number, type: number, speed: number) => {
    const color = shipColor(type);

    return renderToStaticMarkup(PointerIcon(color, heading, speed));
    // return L.divIcon({
    //   html: `<div style="transform: rotate(${heading}deg); width:32px; height:32px;">${pointerSvg}</div>`,
    //   className: "",
    //   iconSize: [32, 32],
    //   iconAnchor: [16, 16], // Adjust anchor point if needed
    //   popupAnchor: [0, -16],
    // });
  };

  const [selectedMmsi, setSelectedMmsi] = useState<Vessel | null>(null);

  const markers: MarkerPropsPixiOverlay[] = useMemo(
    () =>
      data?.map((vessel) => {
        // const html = renderToString(ShipInfoCard({ vessel: vessel }));

        return {
          id: vessel.mmsi,
          position: [vessel.latitude, vessel.longitude] as [number, number],
          popup: `<div></div>`,
          // ставим popupOpen=true только для выбранного mmsi
          popupOpen: selectedMmsi?.mmsi === vessel?.mmsi,
          // по клику меняем selectedMmsi — PixiOverlay поймёт, что надо открыть попап
          onClick: () => {
            setSelectedMmsi((prev) =>
              prev?.mmsi === vessel.mmsi ? null : vessel
            );
          },
          customIcon: createRotatedIcon(
            vessel.heading ?? 0,
            vessel.ship_type ?? 0,
            vessel.sog ?? 0
          ),
          iconId: `pointer-${shipColor(vessel.ship_type ?? 0)}-${
            vessel?.sog > 0 ? "stay" : "stop"
          }
          }`,
        };
      }) ?? [],
    [data]
  );
  return (
    <MapContainer
      className={cn("markercluster-map", "h-full w-full")}
      attributionControl={false}
      center={[59.93, 30.2]}
      zoom={8}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <TileLayer
        eventHandlers={{ click: (e) => console.log(e.latlng.lat) }}
        attribution="&copy; OpenStreetMap"
        url="http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
      />
      <div className="absolute z-[1000] top-4 right-4">
        <WeatherWidgetExpandable />
      </div>
      <div className="absolute flex flex-col gap-4 bottom-2 left-4 z-[1000]">
        <ShipCount shipCount={markers.length} />
        <MapCoord />
      </div>

      <MapEvents />
      {/* <MarkerClusterGroup> */}
      <ReactLeafletPixiOverlay markers={markers} />

      {/* {Object.entries(byVessel).map(([mmsi, vesselPts]) => {
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
                  eventHandlers={{ click: () => showHistory(Number(mmsi)) }}
                >
                
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
        })} */}
      {/* </MarkerClusterGroup> */}
      {historyGeoJson && <GeoJSON interactive data={historyGeoJson} />}
    </MapContainer>
  );
}
