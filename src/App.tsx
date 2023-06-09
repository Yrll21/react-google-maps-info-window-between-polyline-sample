import "./styles.css";
import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
  InfoWindow,
  StreetViewPanorama
} from "@react-google-maps/api";
type Libraries = (
  | "drawing"
  | "geometry"
  | "localContext"
  | "places"
  | "visualization"
)[];
const data = [
  {
    source: { lat: 58.14, lng: 14.6074 },
    destination: { lat: 57.906969506453116, lng: 16.697856507261587 },
    distance: 123
  },
  {
    source: { lat: 57.09402001135807, lng: 15.361428911804866 },
    destination: { lat: 58.14, lng: 14.6074 },
    distance: 158
  }
];

const libraries: Libraries = ["drawing"];
export default function App() {
  const [
    polylineCenter,
    setPolylineCenter
  ] = useState<google.maps.LatLng | null>(null);

  // use as a value for pixel offset
  const [pixelOffset, setPixelOffset] = useState<google.maps.Size | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "",
    libraries
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    const defaultLocation = { lat: 57.4217705, lng: 15.0437262 };
    //Set the bounds to the furthest north and south points on the map in order to avoid zooming out or panning further than those bounds
    const maxBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180)
    );

    map.setOptions({
      center: defaultLocation,
      zoom: 7,
      controlSize: 30,
      restriction: {
        latLngBounds: maxBounds,
        strictBounds: true
      },
      fullscreenControl: true,
      mapTypeControl: false
    });
    map.setTilt(45);

    setMap(map);

    //Set the pixel offset of the infoWindow
    setPixelOffset(new google.maps.Size(10, -20));
    //Use the source and destination coordinates to create a bounds object.
    const bounds = new google.maps.LatLngBounds(
      data[1].destination,
      data[1].source
    );
    // Get the center of the path through this method.
    const center = bounds.getCenter();
    setPolylineCenter(center);
  }, []);

  const onUnmount = useCallback((map: google.maps.Map) => {
    setMap(null);
  }, []);

  return !isLoaded ? null : (
    <GoogleMap
      id="react-google-maps"
      mapContainerClassName={"google-map-container-style"}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onZoomChanged={() => {}}
    >
      <InfoWindow
        options={{
          position: polylineCenter,
          pixelOffset: pixelOffset
        }}
      >
        <div>
          <p>Distance Between Points: {data[1].distance}</p>
        </div>
      </InfoWindow>
      {data.map(({ source, destination, distance }, index) => (
        <Marker key={index} position={source}></Marker>
      ))}
      {data.map(({ source, destination, distance }, index) => (
        <Polyline
          key={index}
          options={{
            strokeColor: "#4468E1",
            icons: [
              {
                icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW },
                offset: "50%"
              }
            ]
          }}
          path={[source, destination]}
        />
      ))}
    </GoogleMap>
  );
}
