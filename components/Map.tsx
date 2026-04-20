"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Butuan City bounds (restrict map view)
const BUTUAN_CENTER: [number, number] = [8.9475, 125.5406];
const BUTUAN_BOUNDS: L.LatLngBoundsExpression = [
  [8.85, 125.42], // SW corner
  [9.05, 125.66]  // NE corner
];

interface MapProps {
  position?: [number, number] | null; // [lat, lng]
  onChangePosition?: (pos: [number, number]) => void;
  readOnly?: boolean;
}

function LocationMarker({ position, setPosition, readOnly }: { position: [number, number] | null, setPosition: (p: [number, number]) => void, readOnly?: boolean }) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function Map({ position, onChangePosition, readOnly = false }: MapProps) {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(position || null);

  useEffect(() => {
    if (position) setCurrentPos(position);
  }, [position]);

  const handlePositionChange = (pos: [number, number]) => {
    setCurrentPos(pos);
    if (onChangePosition) onChangePosition(pos);
  };

  return (
    <div style={{ height: "100%", width: "100%", minHeight: 300, zIndex: 0, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border)" }}>
      <MapContainer
        center={currentPos || BUTUAN_CENTER}
        zoom={14}
        minZoom={12}
        maxBounds={BUTUAN_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={currentPos} setPosition={handlePositionChange} readOnly={readOnly} />
      </MapContainer>
    </div>
  );
}
