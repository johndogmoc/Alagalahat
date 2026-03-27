"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconAlertTriangle, IconSyringe, IconCheck,
  IconChevronRight, IconClipboard
} from "@/components/icons";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  registration_number: string;
  status: "Pending" | "Approved" | "Rejected";
  photo_url?: string;
  vaccination_status?: string;
}

interface VaxRow {
  id: string;
  pet_id: string;
  pet_name?: string;
  vaccine_name: string;
  next_due_at: string | null;
  date_given: string;
}

interface LostPetRow {
  id: string;
  pet_name: string;
  last_seen_location: string;
  created_at: string;
  status: string;
  photo_url?: string;
}

export default function OwnerDashboardPage() {
  const [userName, setUserName] = useState("Pet Owner");
  const [pets, setPets] = useState<PetRow[]>([]);
  const [vaxDue, setVaxDue] = useState<VaxRow[]>([]);
  const [lostAlerts, setLostAlerts] = useState<LostPetRow[]>([]);
  const [stats, setStats] = useState({ pets: 0, vaxDue: 0, lostReports: 0, certified: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Pet Owner");

      // Fetch pets
      const { data: petData } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status, photo_url")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      const myPets = (petData as PetRow[]) ?? [];
      setPets(myPets);

      // Fetch vaccinations due
      const now = new Date().toISOString();
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);

      if (myPets.length > 0) {
        const { data: vaxData } = await supabase
          .from("vaccinations")
          .select("id, pet_id, vaccine_name, next_due_at, date_given")
          .in("pet_id", myPets.map((p) => p.id))
          .not("next_due_at", "is", null)
          .lte("next_due_at", thirtyDays.toISOString())
          .order("next_due_at", { ascending: true })
          .limit(10);

        if (mounted) {
          const vax = ((vaxData as VaxRow[]) ?? []).map((v) => ({
            ...v,
            pet_name: myPets.find((p) => p.id === v.pet_id)?.name ?? "Unknown"
          }));
          setVaxDue(vax);
        }
      }

      // Lost pet alerts (community-wide)
      const { data: lostData } = await supabase
        .from("lost_pet_reports")
        .select("id, pet_name, last_seen_location, created_at, status, photo_url")
        .order("created_at", { ascending: false })
        .limit(3);

      if (mounted) setLostAlerts((lostData as LostPetRow[]) ?? []);

      // Compute stats
      const overdueVax = vaxDue.filter((v) => v.next_due_at && new Date(v.next_due_at) < new Date()).length;
      setStats({
        pets: myPets.length,
        vaxDue: vaxDue.length || overdueVax,
        lostReports: myPets.filter((p) => p.status === "Pending").length, // placeholder
        certified: myPets.length > 0 && myPets.every((p) => p.status === "Approved")
      });

      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const statCards = [
    { label: "My Registered Pets", value: stats.pets, color: "var(--color-success)", icon: IconPaw },
    { label: "Vaccinations Due", value: stats.vaxDue, color: "var(--color-amber)", icon: IconSyringe, href: "#vaccinations" },
    { label: "Active Lost Reports", value: stats.lostReports, color: "var(--color-coral)", icon: IconAlertTriangle },
    { label: "Certification", value: stats.certified ? "Complete" : "Incomplete", color: stats.certified ? "var(--color-success)" : "var(--color-amber)", icon: IconClipboard, isBadge: true }
  ];

  return (
    <DashboardShell role="Owner" userName={userName}>
      {/* Welcome bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
              {greeting}, {userName}! 🐾
            </h1>
            <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              {today} — Barangay Pet Management System
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="primary" asChild href="/owner/register-pet">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>+ Register a Pet</span>
            </Button>
            <Button variant="outline" asChild href="/lost-pets/report">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>+ Report Lost Pet</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => {
          const StatIcon = card.icon;
          return (
            <div
              key={card.label}
              role="region"
              aria-label={`${card.label}: ${card.value}`}
              style={{
                background: "var(--color-card)", border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)",
                display: "flex", alignItems: "flex-start", gap: 14,
                cursor: card.href ? "pointer" : "default",
                transition: "box-shadow var(--transition-fast)"
              }}
              onClick={() => card.href && document.querySelector(card.href)?.scrollIntoView({ behavior: "smooth" })}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: card.color + "18", color: card.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <StatIcon size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 500 }}>{card.label}</p>
                {card.isBadge ? (
                  <span style={{
                    display: "inline-block", marginTop: 4, padding: "2px 10px",
                    borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: 700,
                    background: card.color + "18", color: card.color
                  }}>
                    {card.value}
                  </span>
                ) : (
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2, marginTop: 2 }}>{card.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* My Pets section */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0 }}>My Pets</h2>
          <Link href="/pets" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, minHeight: 44 }}>
            View All <IconChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }} role="list" tabIndex={0} aria-label="My pets list, scrollable">
          {pets.map((pet) => (
            <div key={pet.id} role="listitem" style={{
              minWidth: 200, maxWidth: 220, background: "var(--color-card)",
              border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
              padding: 16, boxShadow: "var(--shadow-sm)", flexShrink: 0,
              display: "flex", flexDirection: "column", gap: 10
            }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: "var(--radius-md)",
                background: "var(--color-background)", display: "flex", alignItems: "center",
                justifyContent: "center", overflow: "hidden"
              }}>
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <IconPaw size={40} style={{ color: "var(--color-text-light)" }} />
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{pet.name}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-size-xs)", fontWeight: 600,
                    background: "var(--color-primary)" + "18", color: "var(--color-primary)"
                  }}>
                    {pet.species}
                  </span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-size-xs)", fontWeight: 600,
                    background: pet.status === "Approved" ? "var(--color-success)" + "18" : "var(--color-amber)" + "18",
                    color: pet.status === "Approved" ? "var(--color-success)" : "var(--color-amber)"
                  }}>
                    {pet.status}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild href={`/pets/${pet.id}`} style={{ marginTop: "auto" }}>
                View Profile
              </Button>
            </div>
          ))}

          {/* Add new pet card */}
          <Link href="/owner/register-pet" role="listitem" style={{
            minWidth: 200, maxWidth: 220, border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)", padding: 16, flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 10, textDecoration: "none",
            color: "var(--color-text-muted)", transition: "all var(--transition-fast)",
            minHeight: 280
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "2px dashed var(--color-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 300
            }}>
              +
            </div>
            <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Add New Pet</span>
          </Link>

          {loading && pets.length === 0 && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  minWidth: 200, background: "var(--color-background)",
                  borderRadius: "var(--radius-lg)", padding: 16, flexShrink: 0,
                  animation: "pulse 2s ease infinite"
                }}>
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: "var(--radius-md)", background: "var(--color-border)" }} />
                  <div style={{ height: 14, width: "70%", background: "var(--color-border)", borderRadius: 4, marginTop: 12 }} />
                  <div style={{ height: 10, width: "50%", background: "var(--color-border)", borderRadius: 4, marginTop: 8 }} />
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Upcoming Vaccinations */}
      <section id="vaccinations" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0, marginBottom: 16 }}>Upcoming Vaccinations</h2>
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {vaxDue.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              <IconSyringe size={32} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
              <p style={{ margin: 0 }}>No upcoming vaccinations. All pets are up to date!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-background)" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Pet Name</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Vaccine</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Due Date</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Status</th>
                    <th style={{ textAlign: "right", padding: "12px 16px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {vaxDue.map((v) => {
                    const isOverdue = v.next_due_at ? new Date(v.next_due_at) < new Date() : false;
                    return (
                      <tr key={v.id} style={{
                        borderBottom: "1px solid var(--color-border)",
                        background: isOverdue ? "var(--color-error-bg)" : "transparent"
                      }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{v.pet_name}</td>
                        <td style={{ padding: "12px 16px" }}>{v.vaccine_name}</td>
                        <td style={{ padding: "12px 16px" }}>{v.next_due_at ? new Date(v.next_due_at).toLocaleDateString("en-PH") : "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "2px 10px", borderRadius: "var(--radius-full)",
                            fontSize: "var(--font-size-xs)", fontWeight: 700,
                            background: isOverdue ? "var(--color-coral)" + "18" : "var(--color-amber)" + "18",
                            color: isOverdue ? "var(--color-coral)" : "var(--color-amber)"
                          }}>
                            {isOverdue ? "Overdue" : "Due Soon"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <Button variant="outline" size="sm">Record Vaccination</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Lost Pet Alerts */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0 }}>Lost Pet Alerts</h2>
          <Link href="/lost-pets" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, minHeight: 44 }}>
            View All Alerts <IconChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {lostAlerts.length === 0 ? (
            <div style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)", padding: 24, textAlign: "center",
              color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)"
            }}>
              <IconAlertTriangle size={32} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
              <p style={{ margin: 0 }}>No recent lost pet alerts in your community.</p>
            </div>
          ) : (
            lostAlerts.map((alert) => (
              <div key={alert.id} style={{
                background: "var(--color-card)", border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-sm)",
                display: "flex", alignItems: "center", gap: 14
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--radius-md)",
                  background: "var(--color-background)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                }}>
                  {alert.photo_url ? (
                    <img src={alert.photo_url} alt={alert.pet_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <IconPaw size={24} style={{ color: "var(--color-text-light)" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{alert.pet_name}</p>
                  <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                    Last seen: {alert.last_seen_location || "Unknown"} • {new Date(alert.created_at).toLocaleDateString("en-PH")}
                  </p>
                </div>
                <span style={{
                  padding: "4px 10px", borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-size-xs)", fontWeight: 700, flexShrink: 0,
                  background: alert.status === "Found" ? "var(--color-success)" + "18" : "var(--color-coral)" + "18",
                  color: alert.status === "Found" ? "var(--color-success)" : "var(--color-coral)"
                }}>
                  {alert.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
