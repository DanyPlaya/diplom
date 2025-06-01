import { baseApi } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";

type GetShips = {
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
};

export const useGetShips = (props: GetShips) => {
  //   const { maxLat, maxLon, minLat, minLon } = props;
  const fetcher = async () =>
    await baseApi.get<unknown>("/v1/ships/in_bbox", {
      params: props,
    });
  return useQuery({
    queryKey: ["Ships"],
    queryFn: fetcher,
  });
};
