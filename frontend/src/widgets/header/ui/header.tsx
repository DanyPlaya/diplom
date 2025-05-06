import { ModeToggle } from "@/features/mode-toggle";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Menu } from "lucide-react";

export const Header = () => {
  return (
    <header className="p-6 w-full flex items-center justify-between">
      <SidebarTrigger>
        <Menu className="h-5 w-5" />
      </SidebarTrigger>
      <ModeToggle />
    </header>
  );
};
