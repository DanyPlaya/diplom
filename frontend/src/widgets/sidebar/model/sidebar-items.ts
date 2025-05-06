import { routes } from "@/shared";
import {
  BarChart3,
  Bell,
  Clock,
  FileText,
  LucideIcon,
  Map,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
type SidebarItems = {
  label: string;
  icon: LucideIcon;
  path: string;
};
export const sidebarItems: SidebarItems[] = [
  { icon: Map, label: "Мониторинг", path: routes.monitoring },
  { icon: BarChart3, label: "Аналитика", path: routes.analytics },
  { icon: Sparkles, label: "Прогнозы", path: routes.prediction },
  { icon: Bell, label: "Уведомления", path: routes.alerts },
  { icon: Clock, label: "История", path: routes.history },
  { icon: FileText, label: "Документация", path: routes.docs },
  { icon: Settings, label: "Настройки", path: routes.settings },
  { icon: User, label: "Профиль", path: routes.profile },
];
