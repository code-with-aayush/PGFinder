"use client";

import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import { icon, type LatLngExpression } from "leaflet";

const propertyPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52"><path d="M22 2C11.5 2 3 10.2 3 20.4 3 34.7 22 50 22 50s19-15.3 19-29.6C41 10.2 32.5 2 22 2Z" fill="#5B35F2" stroke="#fff" stroke-width="3"/><circle cx="22" cy="20" r="7" fill="#fff"/><circle cx="22" cy="20" r="3" fill="#5B35F2"/></svg>`;
const propertyPin = icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(propertyPinSvg)}`,
  iconSize: [44, 52],
  iconAnchor: [22, 50],
});
interface LocationPickerProps {
  coordinates: [number, number];
  onChange: (coordinates: [number, number]) => void;
}

function MapSizeFixer() {
  const map = useMap();
  useEffect(() => {
    const refresh = () => map.invalidateSize();
    const timer = window.setTimeout(refresh, 150);
    window.addEventListener("resize", refresh);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", refresh); };
  }, [map]);
  return null;
}
function MapClickHandler({ onChange }: Pick<LocationPickerProps, "onChange">) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lng, event.latlng.lat]);
    },
  });
  return null;
}

export default function LocationPicker({ coordinates, onChange }: LocationPickerProps) {
  const center: LatLngExpression = [coordinates[1], coordinates[0]];

  return (
    <div className="overflow-hidden rounded-lg border">
      <MapContainer key={coordinates.join(",")} center={center} zoom={17} className="h-72 min-h-[18rem] w-full sm:h-80">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSizeFixer />
        <MapClickHandler onChange={onChange} />
        <Marker
          position={center}
          icon={propertyPin}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const point = event.target.getLatLng();
              onChange([point.lng, point.lat]);
            },
          }}
        />
      </MapContainer>
      <p className="border-t bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Click the exact building position or drag the pin to fine-tune it.
      </p>
    </div>
  );
}
