"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IconPaw, IconAlertTriangle, IconCheck, IconSpinner, IconSyringe } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabase";

interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  color_markings: string | null;
  size: string | null;
  sex: string | null;
  photo_url: string | null;
  registration_number: string | null;
  spayed_neutered: boolean | null;
  status: string;
  owner_name: string | null;
  owner_contact?: string | null;
  owner_user_id?: string | null;
}

export default function PublicPetPage() {
  const params = useParams();
  const qrId = typeof params.qrId === "string" ? decodeURIComponent(params.qrId) : "";

  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      if (!qrId) { setNotFound(true); setLoading(false); return; }

      const supabase = getSupabaseClient();

      // Try to find by registration_number first, then by ID
      let { data } = await supabase
        .from("pets")
        .select("id, name, species, breed, color_markings, size, sex, registration_number, spayed_neutered, status, owner_name, owner_user_id")
        .eq("registration_number", qrId)
        .single();

      if (!data) {
        const res = await supabase
          .from("pets")
          .select("id, name, species, breed, color_markings, size, sex, registration_number, spayed_neutered, status, owner_name, owner_user_id")
          .eq("id", qrId)
          .single();
        data = res.data;
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Get owner contact (masked)
      let ownerContact: string | null = null;
      if (data.owner_user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", data.owner_user_id)
          .single();
        if (profile?.phone) {
          const phone = profile.phone;
          ownerContact = phone.slice(0, 4) + "****" + phone.slice(-3);
        }
      }

      setPet({ ...data, owner_contact: ownerContact } as PetData);
      setLoading(false);
    }
    load();
  }, [qrId]);

  async function reportFound() {
    if (!pet) return;
    setSending(true);
    try {
      const supabase = getSupabaseClient();
      // Log the found report as an activity
      await supabase.from("activity_logs").insert({
        action: "pet_found_via_qr",
        details: `Someone scanned QR for ${pet.name} (${pet.registration_number || pet.id}) and reported found.`,
        user_id: null
      });

      // Send a direct notification to the owner
      if (pet.owner_user_id) {
        await supabase.from("notifications").insert({
          user_id: pet.owner_user_id,
          type: "FOUND_PET",
          message: `Someone scanned the QR code for ${pet.name} and reported them as FOUND! Check your local area immediately.`,
          link: `/pets/${pet.id}`
        });
      }

      setReportSent(true);
    } catch {
      // Still show success to the finder
      setReportSent(true);
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.loadingBox}>
          <IconSpinner size={32} />
          <p style={{ marginTop: 12, color: "var(--color-text-muted)" }}>Loading pet profile…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <IconPaw size={48} style={{ color: "var(--color-text-light)", marginBottom: 16 }} />
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Pet Not Found</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 15, margin: "0 0 24px" }}>
              This QR code doesn&apos;t match any registered pet. The pet may have been removed or the code is invalid.
            </p>
            <Button variant="primary" asChild href="/">
              <span>Go to AlagaLahat</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#fff" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconPaw size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>AlagaLahat</span>
        </Link>
        <span style={{ fontSize: 12, opacity: 0.7 }}>Pet Safety Network</span>
      </div>

      <div style={S.card}>
        {/* Pet Photo */}
        <div style={S.photoSection}>
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} style={S.photo} />
          ) : (
            <div style={S.photoPlaceholder}>
              <IconPaw size={48} style={{ color: "var(--color-text-light)" }} />
            </div>
          )}
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            background: pet.status === "Approved" ? "#52B78820" : "#E9C46A20",
            color: pet.status === "Approved" ? "#52B788" : "#E9C46A",
            backdropFilter: "blur(8px)"
          }}>
            {pet.status === "Approved" ? (
              <><IconCheck size={12} /> Registered</>
            ) : (
              <>{pet.status}</>
            )}
          </div>
        </div>

        {/* Pet Info */}
        <div style={S.infoSection}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--color-text)" }}>
            {pet.name}
          </h1>
          {pet.registration_number && (
            <p style={{ margin: "0 0 16px", fontSize: 13, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 600 }}>
              {pet.registration_number}
            </p>
          )}

          <div style={S.infoGrid}>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Species</span>
              <span style={S.infoValue}>{pet.species || "—"}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Breed</span>
              <span style={S.infoValue}>{pet.breed || "Mixed / Unknown"}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Sex</span>
              <span style={S.infoValue}>{pet.sex || "—"}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Size</span>
              <span style={S.infoValue}>{pet.size || "—"}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Color / Markings</span>
              <span style={S.infoValue}>{pet.color_markings || "—"}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Spayed / Neutered</span>
              <span style={S.infoValue}>{pet.spayed_neutered ? "Yes" : pet.spayed_neutered === false ? "No" : "—"}</span>
            </div>
          </div>

          {/* Owner Contact */}
          <div style={S.ownerBox}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "var(--color-text)" }}>Owner Information</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)" }}>
              <strong>{pet.owner_name || "Pet Owner"}</strong>
              {pet.owner_contact && <span> · {pet.owner_contact}</span>}
            </p>
          </div>

          {/* Action Buttons */}
          {reportSent ? (
            <div style={S.successBox}>
              <IconCheck size={20} style={{ color: "#52B788" }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>Report Sent!</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
                  The owner has been notified that their pet was found. Thank you for helping! 
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
              <Button
                variant="primary"
                size="lg"
                onClick={reportFound}
                disabled={sending}
                style={{ width: "100%", fontSize: 16, fontWeight: 700, height: 52 }}
              >
                {sending ? (
                  <><IconSpinner size={18} /> Sending…</>
                ) : (
                  <><IconAlertTriangle size={18} /> I Found This Pet</>
                )}
              </Button>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", margin: 0 }}>
                This will notify the owner that their pet has been found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
          Powered by <Link href="/" style={{ color: "var(--color-primary)", fontWeight: 600 }}>AlagaLahat</Link> — Pet Safety Network
        </p>
      </div>
    </div>
  );
}

/* ============================================
   Styles
   ============================================ */
const S = {
  page: {
    minHeight: "100vh",
    background: "var(--color-background)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    padding: "0 16px 32px"
  },
  header: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: "16px 0",
    background: "linear-gradient(135deg, #1B4F8A 0%, #153d6b 100%)",
    margin: "0 -16px",
    paddingInline: 24,
    borderRadius: "0 0 16px 16px",
    color: "#fff",
    marginBottom: 24
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "60vh",
    color: "var(--color-primary)"
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "var(--color-card)",
    borderRadius: 16,
    overflow: "hidden" as const,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid var(--color-border)"
  },
  photoSection: {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "16/10",
    background: "var(--color-background)",
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const
  },
  photoPlaceholder: {
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: "100%",
    height: "100%"
  },
  infoSection: {
    padding: 24
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 20
  },
  infoItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em"
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text)"
  },
  ownerBox: {
    padding: 16,
    borderRadius: 12,
    background: "var(--color-background)",
    border: "1px solid var(--color-border)"
  },
  successBox: {
    display: "flex",
    alignItems: "flex-start" as const,
    gap: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    background: "#52B78810",
    border: "1px solid #52B78830"
  },
  footer: {
    marginTop: 32,
    textAlign: "center" as const
  }
} satisfies Record<string, React.CSSProperties>;

