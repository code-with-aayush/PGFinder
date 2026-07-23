"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { divIcon, type LatLngExpression } from "leaflet";

const propertyPin = divIcon({
  className: "",
  html: `<div class="pgfinder-map-pin"><span></span></div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 42],
});
interface LocationPickerProps {
  coordinates: [number, number];
  onChange: (coordinates: [number, number]) => void;
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
      <MapContainer key={coordinates.join(",")} center={center} zoom={17} className="h-64 w-full sm:h-80">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        <Marker
          position={center}
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
