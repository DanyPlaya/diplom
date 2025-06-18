import { useFPS } from "@/shared/hooks/use-fps";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge, Ship } from "lucide-react";

export const ShipCount = ({ shipCount }: { shipCount: number }) => {
  const fps = useFPS();
  return (
    <Card className="backdrop-blur-sm p-0 bg-white/90 border-slate-200 shadow-lg">
      <CardContent className="p-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
            <Ship className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium text-sm">
              Судов на карте:
            </span>
            <span className="font-mono text-slate-700 font-semibold">
              {shipCount.toLocaleString()}
            </span>
            |
            <span className="font-mono text-slate-700 font-semibold">
              {fps} FPS
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
