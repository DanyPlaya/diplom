import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Info } from "lucide-react";

const shipColors: Record<string, string> = {
  UNKNOWN: `#777777`,
  PASSENGER: "#2ECC71",
  CARGO: "#3498DB",
  TANKER: "#E74C3C",
  FISHING: "#F39C12",
  HIGH_SPEED: "#9B59B6",
  PILOT: "#1ABC9C",
  TOWING: "#95A5A6",
  OTHER: "#34495E",
};

const shipCategories = [
  { category: "PASSENGER", name: "Пассажирские", color: shipColors.PASSENGER },
  { category: "CARGO", name: "Грузовые", color: shipColors.CARGO },
  { category: "TANKER", name: "Танкеры", color: shipColors.TANKER },
  { category: "FISHING", name: "Рыболовные", color: shipColors.FISHING },
  { category: "HIGH_SPEED", name: "Скоростные", color: shipColors.HIGH_SPEED },
  { category: "PILOT", name: "Лоцманские", color: shipColors.PILOT },
  { category: "TOWING", name: "Буксиры", color: shipColors.TOWING },
  { category: "OTHER", name: "Прочие", color: shipColors.OTHER },
  { category: "UNKNOWN", name: "Неизвестные", color: shipColors.UNKNOWN },
];

export default function ShipLegendMini() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Легенда
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 z-[1000] p-3">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-2">Типы судов</h4>
          <div className="grid grid-cols-1 gap-1">
            {shipCategories.map((ship) => (
              <div key={ship.category} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ship.color }}
                />
                <span className="text-xs">{ship.name}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
