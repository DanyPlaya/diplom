import { ReactNode } from "react";

type SidebarItems = {
  title: string;
  icon: ReactNode;
  path: string;
};
export const sidebarItems: SidebarItems[] = [
  {
    title: "Мониторинг",
    icon: "map", // Icons.map
    path: "/dashboard",
  },
  {
    title: "Аналитика",
    icon: "chart", // Icons.chart
    path: "/analytics",
  },
  {
    title: "Прогнозы",
    icon: "brain", // Icons.brain
    path: "/predictions",
  },
  {
    title: "Уведомления",
    icon: "bell", // Icons.bell
    path: "/alerts",
  },
  {
    title: "История",
    icon: "history", // Icons.history
    path: "/history",
  },
  {
    title: "Документация",
    icon: "bookOpen", // Icons.bookOpen
    path: "/docs",
  },
  {
    title: "Настройки",
    icon: "settings", // Icons.settings
    path: "/settings",
  },
  {
    title: "Профиль",
    icon: "user", // Icons.user
    path: "/profile",
  },
];
