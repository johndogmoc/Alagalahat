"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import type { SidebarRole } from "@/components/Sidebar";
import { IconPaw, IconChevronRight, IconClipboard, IconSyringe } from "@/components/icons";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
  photo_url?: string | null;
}

function roleFromUser(user: { user_metadata?: Record<string, unknown> } | null): SidebarRole | null {
  const r = user?.user_metadata?.role;
  if (r === "SuperAdmin" || r === "Admin") return "Admin";
  if (r === "Owner" || r === "Staff") return r;
  return null;
}

function PageHeader() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  
  const title = tab === "vaccinations" ? "Vaccination Schedules" : tab === "certificates" ? "Pet Certificates" : "My Pets";
  const desc = tab === "vaccinations" ? "Select a pet below to manage its vaccination history." : tab === "certificates" ? "Select a pet below to view or print its official certificate." : "Manage your registered animals.";
  const icon = tab === "vaccinations" ? <IconSyringe size={120} /> : tab === "certificates" ? <IconClipboard size={120} /> : <IconPaw size={120} />;

  return (
    <div className="post-card" style={{ marginBottom: 20, padding: 24, background: "linear-gradient(135deg, #1B4F8A 0%, #173b63 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -10, opacity: 0.05, transform: "rotate(-15deg)" }}>
        {icon}
      </div>
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.01em" }}>{title}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.85, maxWidth: "100%", lineHeight: 1.5 }}>
            {desc}
          </p>
        </div>
        <Button variant="primary" size="sm" asChild href="/owner/register-pet" style={{ background: "#E9C46A", color: "#1A1A2E", fontWeight: 700 }}>
          <span><IconClipboard size={16} style={{ marginRight: 6 }} /> Register Pet</span>
        </Button>
      </div>
    </div>
  );
}

function FallbackHeader() {
  return (
    <div className="post-card" style={{ marginBottom: 20, padding: 24, background: "linear-gradient(135deg, #1B4F8A 0%, #173b63 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -10, opacity: 0.05, transform: "rotate(-15deg)" }}>
        <IconPaw size={120} />
      </div>
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.01em" }}>My Pets</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.85, maxWidth: "100%", lineHeight: 1.5 }}>
            Manage your registered animals.
          </p>
        </div>
        <Button variant="primary" size="sm" asChild href="/owner/register-pet" style={{ background: "#E9C46A", color: "#1A1A2E", fontWeight: 700 }}>
          <span><IconClipboard size={16} style={{ marginRight: 6 }} /> Register Pet</span>
        </Button>
      </div>
    </div>
  );
}

export default function PetsListPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [shellRole, setShellRole] = useState<SidebarRole>("Owner");
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      const r = roleFromUser(user);
      if (r === "Staff") {
        router.replace("/staff");
        return;
      }

      setUserName((user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "User");
      setShellRole(r === "Admin" ? "Admin" : "Owner");

      const { data: petData } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status, photo_url")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (mounted) {
        setPets((petData as PetRow[]) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <DashboardShell role={shellRole} userName={userName}>
      <Suspense fallback={<FallbackHeader />}>
        <PageHeader />
      </Suspense>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="post-card" style={{ textAlign: "center", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary)" + "11",
            color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <IconPaw size={32} />
          </div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>No pets registered yet</h3>
          <p style={{ margin: "8px 0 20px", color: "var(--color-text-muted)", fontSize: 14, maxWidth: 360, lineHeight: 1.5 }}>
            Register your dog or cat today to receive a barangay QR tag.
          </p>
          <Button variant="primary" asChild href="/owner/register-pet">
            <span style={{ fontWeight: 600 }}>Start Registration</span>
          </Button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="pet-card-hover"
              role="link"
              tabIndex={0}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => router.push(`/pets/${pet.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/pets/${pet.id}`);
                }
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-background)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)"
                }}
              >
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} />
                ) : (
                  <IconPaw size={48} style={{ color: "var(--color-text-light)" }} />
                )}
              </div>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>{pet.name}</h3>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: 11,
                      fontWeight: 700,
                      background:
                        pet.status === "Approved" ? "rgba(82, 183, 136, 0.15)"
                          : pet.status === "Rejected" ? "rgba(231, 111, 81, 0.15)"
                          : "rgba(233, 196, 106, 0.2)",
                      color:
                        pet.status === "Approved" ? "#2D6A4F"
                          : pet.status === "Rejected" ? "#B53C1F"
                          : "#9E7B1A"
                    }}
                  >
                    {pet.status === "Approved" ? "Active" : pet.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-primary)", fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.02em" }}>
                  #{pet.registration_number || "PENDING"}
                </p>
                
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 14 }}>{pet.species === "Dog" ? "" : pet.species === "Cat" ? "" : ""}</span> {pet.species}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 16, borderTop: "1px dashed var(--color-border)" }}>
                <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); router.push(`/pets/${pet.id}/vaccinations`); }}>
                  View Records
                </Button>
                <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); router.push(`/pets/${pet.id}`); }}>
                  Profile <IconChevronRight size={14} style={{ marginLeft: 2 }} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 32, textAlign: "center", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
        Alternate form: <Link href="/pets/new" style={{ color: "var(--color-secondary)", fontWeight: 600 }}>quick register (legacy)</Link>
      </p>
    </DashboardShell>
  );
}
