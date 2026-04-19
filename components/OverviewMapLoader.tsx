"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LostPetReport } from "@/lib/types/lostPet";

export const OverviewMapLoader = ({ reports }: { reports: LostPetReport[] }) => {
  const Map = useMemo(
    () =>
      dynamic(() => import("./OverviewMap"), {
        loading: () => <div style={{ height: "100%", width: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}><p style={{ color: "var(--color-text-muted)" }}>Loading map...</p></div>,
        ssr: false,
      }),
    []
  );

  return <Map reports={reports} />;
};
