import { useState } from "react";
import { useMapEvents } from "react-leaflet";

export const MapCoord = () => {
  const [coord, setCoord] = useState({ lat: 0, lon: 0 });

  useMapEvents({
    mousemove(e) {
      setCoord({
        lat: e.latlng.lat,
        lon: e.latlng.lng,
      });
    },
  });

  return (
    <div className="p-1 bg-blue-50 opacity-90 border flex items-center gap-4 select-none border-teal-600 rounded-sm shadow-lg">
      <p className="text-teal-600">Lat:&nbsp;{coord.lat.toFixed(5)}</p>
      <p className="text-teal-600">Lon:&nbsp;{coord.lon.toFixed(5)}</p>
    </div>
  );
};
