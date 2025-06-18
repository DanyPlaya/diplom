import { Card, CardContent } from "@/shared/ui/card";
import { MapPin } from "lucide-react";
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
    <Card className="backdrop-blur-sm p-0 bg-white/90 border-slate-200 shadow-lg">
      <CardContent className="p-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Lat:</span>
              <span className="font-mono text-slate-700 font-semibold">
                {coord.lat.toFixed(5)}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Lon:</span>
              <span className="font-mono text-slate-700 font-semibold">
                {coord.lon.toFixed(5)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
