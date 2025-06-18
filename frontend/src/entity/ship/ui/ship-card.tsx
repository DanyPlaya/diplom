import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Ship, Navigation, Gauge, Compass, MapPin } from "lucide-react";
import { Vessel } from "../model/types";

interface ShipInfoCardProps {
  vessel: Vessel;
  className?: string;
}

const getShipTypeName = (type: number | null): string => {
  if (!type) return "Unknown";
  const shipTypes: Record<number, string> = {
    30: "Fishing",
    31: "Towing",
    35: "Military",
    36: "Sailing",
    37: "Pleasure",
    50: "Pilot",
    52: "Tug",
    60: "Passenger",
    70: "Cargo",
    80: "Tanker",
    90: "Other",
  };
  return shipTypes[type] || `T${type}`;
};

const getShipTypeColor = (type: number | null): string => {
  if (!type) return "secondary";
  if (type >= 60 && type <= 69) return "orange";
  if (type >= 70 && type <= 79) return "red";
  if (type >= 80 && type <= 89) return "destructive";
  return "secondary";
};

export default function ShipInfoCard({ vessel, className }: ShipInfoCardProps) {
  const shipTypeName = getShipTypeName(vessel.ship_type);
  const shipTypeColor = getShipTypeColor(vessel.ship_type);

  return (
    <Card className={`w-64 ${className}`}>
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Ship className="h-3 w-3 text-blue-600" />
            <span className="text-sm font-medium truncate">{vessel.mmsi}</span>
          </div>
          <Badge variant={shipTypeColor as any} className="text-xs px-1 py-0">
            {shipTypeName}
          </Badge>
        </div>

        {/* Position */}
        <div className="flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono">
            {vessel.latitude.toFixed(4)}°, {vessel.longitude.toFixed(4)}°
          </span>
        </div>

        {/* Navigation data in grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3 text-muted-foreground" />
            <span>{vessel.sog !== null ? `${vessel.sog}kn` : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Navigation className="h-3 w-3 text-muted-foreground" />
            <span>{vessel.cog !== null ? `${vessel.cog}°` : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Compass className="h-3 w-3 text-muted-foreground" />
            <span>
              {vessel.heading !== null && vessel.heading !== 511
                ? `${vessel.heading}°`
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Status and time */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                vessel.sog && vessel.sog > 0.1 ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span>{vessel.sog && vessel.sog > 0.1 ? "Moving" : "Static"}</span>
          </div>
          <span>{new Date(vessel.timestamp).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
