export type Vessel = {
  mmsi: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number | null;
  cog: number | null;
  heading: number | null;
  ship_type: number | null;
};
