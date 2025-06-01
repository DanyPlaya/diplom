import { routes } from "@/shared";
import { createBrowserRouter } from "react-router";
import { Layout } from "../app-layout";
import { MainPage } from "@/pages/main";
import { MonitoringPage } from "@/pages/monitoring";
import { AlertsPage } from "@/pages/alerts";
import { DocumentationPage } from "@/pages/documentation";

export const appRouter = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: routes.main,
        element: <MainPage />,
      },
      {
        path: routes.monitoring,
        element: <MonitoringPage />,
      },
      {
        path: routes.alerts,
        element: <AlertsPage />,
      },
      {
        path: routes.docs,
        element: <DocumentationPage />,
      },
    ],
  },
]);
