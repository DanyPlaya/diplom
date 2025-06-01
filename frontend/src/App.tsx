import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { appRouter } from "./app/router/app-router";
const queryClient = new QueryClient();
export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  );
};
