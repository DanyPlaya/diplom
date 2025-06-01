import { useMapEvents } from "react-leaflet";

export const MapEvents = () => {
  useMapEvents({
    click(e) {
      // setState your coords here
      // coords exist in "e.latlng.lat" and "e.latlng.lng"
      console.log(e.latlng.lat);
      console.log(e.latlng.lng);
    },
  });
  return false;
};
