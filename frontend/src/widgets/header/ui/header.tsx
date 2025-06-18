import ShipLegendMini from "@/features/map/legend/ui/legend";
import { ModeToggle } from "@/features/mode-toggle";
import { MapLayers } from "@/features/ship-filter";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Menu } from "lucide-react";

export const Header = () => {
  return (
    <header className="p-3 relative justify-between w-full flex items-center">
      <SidebarTrigger>
        <Menu className="h-5 w-5" />
      </SidebarTrigger>
      <div className="flex gap-10 items-center">
        <ModeToggle />
        <ShipLegendMini />
        <MapLayers />
      </div>
    </header>
  );
};
