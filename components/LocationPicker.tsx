"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Dynamically import the Map component because leaflet needs the 'window' object, which is unavailable during SSR.
export const LocationPicker = ({
  position,
  onChangePosition,
  readOnly = false,
}: {
  position?: [number, number] | null;
  onChangePosition?: (pos: [number, number]) => void;
  readOnly?: boolean;
}) => {
  const Map = useMemo(
    () =>
      dynamic(() => import("./Map"), {
        loading: () => <div style={{ height: "100%", width: "100%", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}><p style={{ color: "var(--color-text-muted)" }}>Loading map...</p></div>,
        ssr: false,
      }),
    []
  );

  return <Map position={position} onChangePosition={onChangePosition} readOnly={readOnly} />;
};
