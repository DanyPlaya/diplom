import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { Header } from "@/widgets/header";
import { AppSidebar } from "@/widgets/sidebar";
import { Outlet } from "react-router";
import { ThemeProvider } from "./theme-provider/theme-provider";

export const Layout = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex w-full h-screen">
          <SidebarInset className="flex-grow ">
            <Header />
            <main className="h-full ">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};
