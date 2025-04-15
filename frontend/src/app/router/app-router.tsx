import { Main } from "@/pages/main";
import { routes } from "@/shared";
import { createBrowserRouter } from "react-router";
import { Layout } from "../app-layout";

export const appRouter = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: routes.main,
        element: <Main />,
      },
    ],
  },
]);
