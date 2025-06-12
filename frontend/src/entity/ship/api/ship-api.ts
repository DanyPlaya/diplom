import { baseApi } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { Vessel } from "../model/types";

type GetShips = {
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
};

export const useGetShips = (props: GetShips) => {
  //   const { maxLat, maxLon, minLat, minLon } = props;
  const fetcher = async () =>
    (
      await baseApi.get<Vessel[]>("/ais/in_bbox", {
        params: props,
      })
    ).data;
  return useQuery({
    queryKey: ["Ships"],
    queryFn: fetcher,
    refetchInterval: 1 * 1000 * 2,
  });
};
