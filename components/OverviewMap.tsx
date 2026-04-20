"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LostPetReport } from "@/lib/types/lostPet";

// Fix Leaflet marker icons in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Butuan City center & bounds
const BUTUAN_CENTER: [number, number] = [8.9475, 125.5406];
const BUTUAN_BOUNDS: L.LatLngBoundsExpression = [
  [8.85, 125.42],
  [9.05, 125.66]
];

interface OverviewMapProps {
  reports: LostPetReport[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function OverviewMap({ reports }: OverviewMapProps) {
  const markers = reports.filter(r => r.latitude != null && r.longitude != null);

  return (
    <div style={{
      height: 500,
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid var(--color-border)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)"
    }}>
      <MapContainer
        center={markers.length > 0 ? [markers[0].latitude as number, markers[0].longitude as number] : BUTUAN_CENTER}
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
        {markers.map((report) => (
          <Marker key={report.id} position={[report.latitude as number, report.longitude as number]}>
            <Popup>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200, padding: 4 }}>
                {/* Pet photo + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {report.pet.petPhotoUrl && (
                    <img
                      src={report.pet.petPhotoUrl}
                      alt={report.pet.petName}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "2px solid #e2e8f0" }}
                    />
                  )}
                  <div>
                    <strong style={{ fontSize: 15, display: "block" }}>{report.pet.petName}</strong>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {report.pet.species}{report.pet.breed ? ` • ${report.pet.breed}` : ""}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em",
                  padding: "3px 10px", borderRadius: 20, display: "inline-block", width: "fit-content",
                  background: report.status === "Active" ? "#DC2626" : report.status === "Pending" ? "#F5A623" : "#22c55e",
                  color: report.status === "Pending" ? "#1A1A2E" : "#fff"
                }}>
                  {report.status === "Active" ? "⚠ MISSING" : report.status === "Pending" ? "⏳ PENDING" : "✓ FOUND"}
                </span>

                {/* Location + time */}
                <div style={{ fontSize: 12, color: "#475569" }}>
                  📍 {report.lastKnownLocation}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Missing since {formatDate(report.missingAt)}
                </div>

                {/* Reward */}
                {report.rewardOffered && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F5A623" }}>
                    💰 Reward: ₱{report.rewardOffered}
                  </div>
                )}

                {/* Owner */}
                <div style={{
                  marginTop: 4, padding: "8px 12px", borderRadius: 8,
                  background: "linear-gradient(135deg, #264653, #2a9d8f)",
                  color: "#fff", fontSize: 12, fontWeight: 600
                }}>
                  📞 {report.pet.ownerName}
                  {report.pet.ownerContactNumber ? ` • ${report.pet.ownerContactNumber}` : ""}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
