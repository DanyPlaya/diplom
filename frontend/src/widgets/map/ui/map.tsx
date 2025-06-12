import { shipColor, useGetShips } from "@/entity/ship";
import { MapCoord } from "@/features/map";
import { baseApi } from "@/shared/api";
import { AISPoint } from "@/shared/hooks/use-AIS-socket";
import { cn } from "@/shared/lib/utils";
import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
// import "react-leaflet-markercluster/styles";
import ReactLeafletPixiOverlay, {
  MarkerPropsPixiOverlay,
} from "react-leaflet-pixi-overlay";
import { useSearchParams } from "react-router";
import { MapEvents } from "../lib/map-events";
import { MousePointer2, ShieldQuestion } from "lucide-react";
import { MapLayers, ShipFilter } from "@/features/ship-filter";
const PointerIcon = (color: string, heading: number) => (
  <MousePointer2
    style={{
      transform: `rotate(${heading}deg)`,
    }}
    fill={color}
  />
);
export function Map() {
  const [searchParams, _] = useSearchParams();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [historyGeoJson, setHistoryGeoJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data } = useGetShips({

    min_lat: Number(searchParams.get("swLat")),
    min_lon: Number(searchParams.get("swLng")),
    max_lat: Number(searchParams.get("neLat")),
    max_lon: Number(searchParams.get("neLng")),

  });

  const createRotatedIcon = (heading: number, type: number) => {
    const color = shipColor(type);

    const pointerSvg = ` <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="12"
    height="12"
   
    viewBox="0 0 188.324 188.324"
 
    fill="red"
    style="transform: rotate(${heading}deg)"
  >
    <path

      stroke="none"
      fillRule="nonzero"
      d="m104.552 188.324-1.126-.023c-8.686-.485-16.159-6.421-18.601-14.758L70.661 125.14l-52.088-10.344c-8.548-1.675-15.124-8.622-16.348-17.279-1.224-8.638 3.162-17.134 10.91-21.137l143.16-74.152c7.49-3.883 17.143-2.596 23.369 3.119 6.336 5.827 8.371 15.078 5.083 23.018l-61.193 147.287c-3.22 7.703-10.682 12.672-19.002 12.672zm61.189-176.681a8.922 8.922 0 0 0-4.055.989L18.516 86.789a8.841 8.841 0 0 0-4.697 9.092 8.855 8.855 0 0 0 7.022 7.445l59.061 11.71 16.154 55.225a8.878 8.878 0 0 0 8.011 6.358h.48a8.845 8.845 0 0 0 8.183-5.467l61.188-147.261a8.898 8.898 0 0 0-2.184-9.907 8.824 8.824 0 0 0-5.993-2.341z"
    />
  </svg>`;

    return renderToStaticMarkup(PointerIcon(color, heading));
    // return L.divIcon({
    //   html: `<div style="transform: rotate(${heading}deg); width:32px; height:32px;">${pointerSvg}</div>`,
    //   className: "",
    //   iconSize: [32, 32],
    //   iconAnchor: [16, 16], // Adjust anchor point if needed
    //   popupAnchor: [0, -16],
    // });
  };

  async function showHistory(mmsi: number) {
    if (!start || !end) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${baseApi.defaults.baseURL}/vessel/${mmsi}/history?start=${start}&end=${end}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("failed");
      const geo = await res.json();
      setHistoryGeoJson(geo);
    } catch (e) {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  }
  // const marks = [
  //   {
  //     mmsi: "629009234",
  //     timestamp: "2025-06-04T20:31:21.967657",
  //     latitude: 60.01455833333333,
  //     longitude: 29.35335,
  //     sog: 1.2,
  //     cog: 360.0,
  //     heading: 511.0,
  //     ship_type: null,
  //   },
  //   {
  //     mmsi: "667002335",
  //     timestamp: "2025-05-24T11:53:40.317064",
  //     latitude: 60.095235,
  //     longitude: 29.372211666666665,
  //     sog: null,
  //     cog: null,
  //     heading: null,
  //     ship_type: null,
  //   },
  //   {
  //     mmsi: "314001030",
  //     timestamp: "2025-06-01T16:23:44.114323",
  //     latitude: 60.11179333333334,
  //     longitude: 29.334400000000002,
  //     sog: null,
  //     cog: null,
  //     heading: null,
  //     ship_type: null,
  //   },
  //   {
  //     mmsi: "215114000",
  //     timestamp: "2025-06-04T20:42:42.177374",
  //     latitude: 60.03422,
  //     longitude: 29.1811,
  //     sog: 12.0,
  //     cog: 273.4,
  //     heading: 275.0,
  //     ship_type: 79,
  //   },
  //   {
  //     mmsi: "273336230",
  //     timestamp: "2025-06-04T22:02:54.757871",
  //     latitude: 59.894305,
  //     longitude: 29.827471666666668,
  //     sog: 52.5,
  //     cog: 204.8,
  //     heading: 511.0,
  //     ship_type: null,
  //   },
  // ];

  const byVessel: Record<string, AISPoint[]> = {};
  // data?.data.forEach((p) => {
  //   (byVessel[p.mmsi] ||= []).push(p);
  // });
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);

  const markers: MarkerPropsPixiOverlay[] = useMemo(
    () =>
      data?.map((vessel) => {
        const html = renderToString(
          <div>
            MMSI: {vessel.mmsi}
            <br />
            heading: {vessel.heading}
            <br />
            Время: {new Date(vessel.timestamp).toLocaleString()}
            <br />
            SOG: {vessel.sog} kn, COG: {vessel.cog}°
          </div>
        );

        return {
          id: vessel.mmsi,
          position: [vessel.latitude, vessel.longitude] as [number, number],
          popup: html,
          // ставим popupOpen=true только для выбранного mmsi
          popupOpen: selectedMmsi === vessel?.mmsi,
          // по клику меняем selectedMmsi — PixiOverlay поймёт, что надо открыть попап
          onClick: () => {
            showHistory(+vessel?.mmsi);
            setSelectedMmsi((prev) =>
              prev === vessel.mmsi ? null : vessel.mmsi
            );
          },
          customIcon: createRotatedIcon(
            vessel.heading ?? 0,
            vessel.ship_type ?? 0
          ),
          iconId: `pointer-${shipColor(vessel.ship_type ?? 0)}`,
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
      preferCanvas
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

      <div className="absolute bottom-2 left-4 z-[1000]">
        <MapCoord />
      </div>
      {/* <div className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded ">
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="mb-1 block border"
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="mb-1 block border"
        />
        {loading && <span className="text-sm">Loading...</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div> */}
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
        })} */}
      {/* </MarkerClusterGroup> */}
      {historyGeoJson && <GeoJSON interactive data={historyGeoJson} />}
    </MapContainer>
  );
}
