import { RouterProvider } from "react-router";
import { appRouter } from "./app/router/app-router";

export const App = () => {
  return <RouterProvider router={appRouter} />;
};
