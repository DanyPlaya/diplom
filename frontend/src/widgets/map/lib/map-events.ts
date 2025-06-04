import { useEffect, useCallback } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { useSearchParams } from "react-router";

export const MapEvents = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();
  const map = useMap();

  /* вспомогательная функция, которая кладёт текущие границы карты в URL */
  const writeBoundsToUrl = useCallback(() => {
    const b = map.getBounds(); // L.LatLngBounds
    const sw = b.getSouthWest(); // юго-западный угол
    const ne = b.getNorthEast(); // северо-восточный угол

    // four numbers → query-string
    setSearchParams({
      swLat: sw.lat.toFixed(5),
      swLng: sw.lng.toFixed(5),
      neLat: ne.lat.toFixed(5),
      neLng: ne.lng.toFixed(5),
    });
  }, [map, setSearchParams]);

  /* один раз при монтировании пишем стартовые границы */
  useEffect(writeBoundsToUrl, [writeBoundsToUrl]);

  /* реагируем на окончание масштабирования */
  useMapEvents({
    move: writeBoundsToUrl,
    zoomend: writeBoundsToUrl, // когда пользователь «отпустил» зум
    click(e) {
      console.log(e.latlng.lat, e.latlng.lng);
    },
  });

  return null; // компонент не рисует DOM-узлов
};
