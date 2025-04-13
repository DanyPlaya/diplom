import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "./App.css";

const ComponentResize = () => {
  const map = useMap();

  setTimeout(() => {
    map.invalidateSize();
  }, 0);

  return null;
};

const App = () => {
  const position = [36.0339, 1.6596];

  return (
    <MapContainer
      style={{ width: "1400px", height: "1400px" }}
      center={position}
      attributionControl={false}
      zoom={8}
      minZoom={3}
      scrollWheelZoom={true}
    >
      <ComponentResize />
      <TileLayer
        // className={'ion-hide'}
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default App;
