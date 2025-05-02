import { routes } from "@/shared";
import { createBrowserRouter } from "react-router";
import { Layout } from "../app-layout";
import { MainPage } from "@/pages/main";

export const appRouter = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: routes.main,
        element: <MainPage />,
      },
    ],
  },
]);
