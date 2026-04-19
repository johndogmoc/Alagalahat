"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconAlertTriangle, IconSyringe, IconCheck,
  IconChevronRight, IconClipboard, IconSearch, IconBell, IconShield
} from "@/components/icons";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
  photo_url?: string;
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

/* ================================================
   Care Tips — rotates daily
   ================================================ */
const careTips = [
  { category: "Health", tip: "Regular deworming every 3 months helps prevent parasitic infections in dogs and cats.", icon: "" },
  { category: "Nutrition", tip: "Never feed your pets chocolate, onions, or grapes — these are toxic and can be fatal.", icon: "" },
  { category: "Safety", tip: "Always keep your pet's QR tag on their collar. It's the fastest way to reunite if lost.", icon: "️" },
  { category: "Training", tip: "Use positive reinforcement! Treats and praise work better than punishment.", icon: "" },
  { category: "Grooming", tip: "Check your pet's ears weekly for redness or odor — early detection prevents infections.", icon: "️" },
  { category: "First Aid", tip: "Keep a pet first aid kit at home with gauze, antiseptic, tweezers, and your vet's number.", icon: "" },
  { category: "Summer", tip: "During hot months, always provide fresh water and shade. Walk dogs early morning or late evening.", icon: "️" },
];

/* ================================================
   Activity Feed — simulated community events
   ================================================ */
const communityActivity = [
  { text: "Juan reported Bantay lost in Zone 4", time: "30min ago", type: "lost" },
  { text: "Mingming has been reunited! ", time: "2h ago", type: "reunion" },
  { text: "New care tip: Heatstroke prevention", time: "5h ago", type: "tip" },
  { text: "Maria registered a new pet: Cookie", time: "8h ago", type: "register" },
  { text: "Sighting reported for Brownie in Brgy. 3", time: "12h ago", type: "sighting" },
];

export default function OwnerDashboardPage() {
  const [userName, setUserName] = useState("Pet Owner");
  const [pets, setPets] = useState<PetRow[]>([]);
  const [vaxDue, setVaxDue] = useState<VaxRow[]>([]);
  const [lostAlerts, setLostAlerts] = useState<LostPetRow[]>([]);
  const [stats, setStats] = useState({ pets: 0, vaxDue: 0, lostReports: 0, certified: false });
  const [loading, setLoading] = useState(true);

  const todayTip = careTips[new Date().getDate() % careTips.length];

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      setUserName(user.user_metadata?.full_name as string || user.email?.split("@")[0] || "Pet Owner");

      // Fetch pets
      const { data: petData } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      const myPets = (petData as PetRow[]) ?? [];
      setPets(myPets);

      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);

      let vaxList: VaxRow[] = [];
      if (myPets.length > 0) {
        const { data: vaxData } = await supabase
          .from("vaccinations")
          .select("id, pet_id, vaccine_name, next_due_at, date_given")
          .in("pet_id", myPets.map((p) => p.id))
          .not("next_due_at", "is", null)
          .lte("next_due_at", thirtyDays.toISOString())
          .order("next_due_at", { ascending: true })
          .limit(10);

        vaxList = ((vaxData as VaxRow[]) ?? []).map((v) => ({
          ...v,
          pet_name: myPets.find((p) => p.id === v.pet_id)?.name ?? "Unknown"
        }));
        if (mounted) setVaxDue(vaxList);
      } else if (mounted) {
        setVaxDue([]);
      }

      const { data: lostData } = await supabase
        .from("lost_pet_reports")
        .select("id, pet_name, last_seen_location, created_at, status, photo_url")
        .order("created_at", { ascending: false })
        .limit(5);

      if (mounted) setLostAlerts((lostData as LostPetRow[]) ?? []);

      const regNums = myPets
        .map((p) => p.registration_number)
        .filter((n): n is string => typeof n === "string" && n.length > 0);

      let activeLostCount = 0;
      if (regNums.length > 0) {
        const { data: myLost } = await supabase
          .from("lost_pet_reports")
          .select("id, status")
          .in("registration_number", regNums);
        const lostRows = (myLost ?? []) as { status: string }[];
        activeLostCount = lostRows.filter((x) => x.status !== "Resolved" && x.status !== "Archived").length;
      }

      if (mounted) {
        setStats({
          pets: myPets.length,
          vaxDue: vaxList.length,
          lostReports: activeLostCount,
          certified: myPets.length > 0 && myPets.every((p) => p.status === "Approved")
        });
      }

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
    { label: "Registered Pets", value: stats.pets, color: "var(--color-success)", icon: IconPaw },
    { label: "Vaccinations Due", value: stats.vaxDue, color: "var(--color-amber)", icon: IconSyringe, href: "#vaccinations" },
    { label: "Active Lost Reports", value: stats.lostReports, color: "var(--color-coral)", icon: IconAlertTriangle },
    { label: "Certification", value: stats.certified ? "Complete" : "Incomplete", color: stats.certified ? "var(--color-success)" : "var(--color-amber)", icon: IconClipboard, isBadge: true }
  ];

  return (
    <DashboardShell role="Owner" userName={userName}>
      {/* Premium Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1B3A6B 0%, #152B52 100%)",
        borderRadius: "24px",
        padding: "48px 40px",
        color: "#fff",
        marginBottom: 40,
        boxShadow: "0 20px 40px rgba(27,58,107,0.15)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decor */}
        <div style={{ position: "absolute", top: -80, right: -40, opacity: 0.04, transform: "rotate(-15deg)" }}>
          <IconPaw size={320} />
        </div>
        <div style={{ position: "absolute", bottom: -40, left: '20%', opacity: 0.05, filter: 'blur(2px)' }}>
          <IconPaw size={120} />
        </div>
        
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 32 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.03em" }}>
              {greeting}, {userName}! 
            </h1>
            <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 500, lineHeight: 1.6, fontWeight: 500 }}>
              {today} — Barangay Pet Management System
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Button variant="outline" asChild href="/lost-pets/report" style={{ 
              background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)", 
              color: "#fff", backdropFilter: "blur(4px)", padding: "24px 28px", borderRadius: "16px",
              fontSize: 15, fontWeight: 600, transition: "all 0.3s ease" 
            }}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>+ Report Lost Pet</span>
            </Button>
            <Button variant="primary" asChild href="/owner/register-pet" style={{ 
              background: "#E9C46A", color: "#1B3A6B", padding: "24px 32px", borderRadius: "16px",
              fontSize: 15, fontWeight: 800, boxShadow: "0 8px 16px rgba(233,196,106,0.25)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e: any) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 20px rgba(233,196,106,0.3)"; }}
            onMouseOut={(e: any) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(233,196,106,0.25)"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>+ Register a Pet</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 48 }}>
        {statCards.map((card) => {
          const StatIcon = card.icon;
          return (
            <div
              key={card.label}
              role="region"
              aria-label={`${card.label}: ${card.value}`}
              style={{
                background: "#fff", border: "1px solid rgba(0,0,0,0.04)",
                borderRadius: "20px", padding: "28px", boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                display: "flex", alignItems: "flex-start", gap: 20,
                cursor: card.href ? "pointer" : "default",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = "translateY(-6px)"; 
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
                e.currentTarget.style.border = "1px solid rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = "none"; 
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.03)";
                e.currentTarget.style.border = "1px solid rgba(0,0,0,0.04)";
              }}
              onClick={() => card.href && document.querySelector(card.href)?.scrollIntoView({ behavior: "smooth" })}
            >
              <div style={{
                width: 56, height: 56, borderRadius: "16px",
                background: card.color + "12", color: card.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: `inset 0 0 0 1px ${card.color}20`
              }}>
                <StatIcon size={28} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 56 }}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.02em" }}>{card.label}</p>
                {card.isBadge ? (
                  <span style={{
                    display: "inline-block", marginTop: 8, padding: "6px 14px",
                    borderRadius: "100px", fontSize: 13, fontWeight: 800,
                    background: card.color + "15", color: card.color, alignSelf: "flex-start"
                  }}>
                    {card.value}
                  </span>
                ) : (
                  <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: "var(--color-text)", lineHeight: 1.1, marginTop: 6, letterSpacing: "-0.03em" }}>{card.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============= MIDDLE SECTION — 2 columns ============= */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Recently Lost Pets Nearby */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--color-text)", letterSpacing: "-0.01em" }}>Lost Pets Nearby</h2>
              <Link href="/lost-pets" style={{ fontSize: 14, color: "#1B3A6B", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: "100px", background: "#1B3A6B10", transition: "background 0.2s" }}
                onMouseOver={(e: any) => e.currentTarget.style.background = "#1B3A6B20"}
                onMouseOut={(e: any) => e.currentTarget.style.background = "#1B3A6B10"}>
                View All <IconChevronRight size={14} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lostAlerts.length === 0 ? (
                <div style={{
                  background: "#fff", border: "1px dashed rgba(0,0,0,0.1)",
                  borderRadius: "20px", padding: 32, textAlign: "center",
                  color: "var(--color-text-muted)", fontSize: 15, fontWeight: 500
                }}>
                  <IconCheck size={32} style={{ color: "var(--color-success)", margin: "0 auto 12px" }} />
                  <p style={{ margin: 0 }}>No recent lost pet alerts in your community.</p>
                </div>
              ) : (
                lostAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} style={{
                    background: "#fff", border: "1px solid rgba(0,0,0,0.04)",
                    borderLeft: "6px solid #E76F51",
                    borderRadius: "16px", padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    display: "flex", alignItems: "center", gap: 16, transition: "transform 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateX(4px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "12px",
                      background: "#F4F6F8", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                    }}>
                      {alert.photo_url ? (
                        <img src={alert.photo_url} alt={alert.pet_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <IconPaw size={24} style={{ color: "var(--color-text-light)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "var(--color-text)" }}>{alert.pet_name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>
                        {alert.last_seen_location || "Unknown"} • {new Date(alert.created_at).toLocaleDateString("en-PH")}
                      </p>
                    </div>
                    <span style={{
                      padding: "6px 12px", borderRadius: "100px",
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                      background: alert.status === "Found" ? "var(--color-success)" + "18" : "#E76F5115",
                      color: alert.status === "Found" ? "var(--color-success)" : "#E76F51"
                    }}>
                      {alert.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* My Pets Panel */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--color-text)", letterSpacing: "-0.01em" }}>My Pets</h2>
              <Link href="/pets" style={{ fontSize: 14, color: "#1B3A6B", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: "100px", background: "#1B3A6B10", transition: "background 0.2s" }}
                onMouseOver={(e: any) => e.currentTarget.style.background = "#1B3A6B20"}
                onMouseOut={(e: any) => e.currentTarget.style.background = "#1B3A6B10"}>
                Manage <IconChevronRight size={14} />
              </Link>
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, margin: "0 -4px", padding: "0 4px" }}>
              {pets.slice(0, 4).map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`} style={{
                  minWidth: 140, background: "#fff", border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "20px", padding: "20px 16px", textDecoration: "none", color: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)"; }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: "#F4F6F8",
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                    border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }}>
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <IconPaw size={28} style={{ color: "var(--color-text-light)" }} />
                    )}
                  </div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 15, textAlign: "center", color: "var(--color-text)" }}>{pet.name}</p>
                  <span style={{
                    padding: "4px 12px", borderRadius: "100px", fontSize: 11, fontWeight: 800,
                    background: pet.status === "Approved" ? "var(--color-success)" + "18" : "var(--color-amber)" + "18",
                    color: pet.status === "Approved" ? "var(--color-success)" : "var(--color-amber)"
                  }}>
                    {pet.status}
                  </span>
                </Link>
              ))}
              <Link href="/owner/register-pet" style={{
                minWidth: 140, border: "2px dashed rgba(0,0,0,0.15)", borderRadius: "20px",
                padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, textDecoration: "none", color: "var(--color-text-muted)", flexShrink: 0,
                background: "rgba(0,0,0,0.01)", transition: "all 0.2s"
              }}
              onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)"; }}
              onMouseOut={(e: any) => { e.currentTarget.style.background = "rgba(0,0,0,0.01)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; }}>
                <span style={{ width: 44, height: 44, borderRadius: '50%', background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: 24, fontWeight: 300, color: "var(--color-text)", marginBottom: 4 }}>+</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Add Pet</span>
              </Link>
            </div>
          </section>

          {/* Upcoming Vaccinations */}
          <section id="vaccinations">
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px", color: "var(--color-text)", letterSpacing: "-0.01em" }}>Upcoming Vaccinations</h2>
            <div style={{
              background: "#fff", border: "1px solid rgba(0,0,0,0.04)",
              borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.03)"
            }}>
              {vaxDue.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)", fontSize: 15, fontWeight: 500 }}>
                  <IconSyringe size={36} style={{ color: "var(--color-text-light)", marginBottom: 12, opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>All pets are excellently up to date!</p>
                </div>
              ) : (
                vaxDue.slice(0, 3).map((v, i) => {
                  const isOverdue = v.next_due_at ? new Date(v.next_due_at) < new Date() : false;
                  return (
                    <div key={v.id} style={{
                      display: "flex", alignItems: "center", gap: 16, padding: "20px",
                      borderBottom: i < Math.min(vaxDue.length, 3) - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                      background: isOverdue ? "#FAEEF0" : "transparent"
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "12px",
                        background: isOverdue ? "#E76F5115" : "#E9C46A20",
                        color: isOverdue ? "#E76F51" : "#D4A017",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        <IconSyringe size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>{v.vaccine_name}</p>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>
                          {v.pet_name} • Due: <strong style={{ color: isOverdue ? "#E76F51" : "inherit" }}>{v.next_due_at ? new Date(v.next_due_at).toLocaleDateString("en-PH") : "—"}</strong>
                        </p>
                      </div>
                      <span style={{
                        padding: "6px 14px", borderRadius: "100px", fontSize: 12, fontWeight: 800,
                        background: isOverdue ? "#E76F5115" : "#E9C46A20",
                        color: isOverdue ? "#E76F51" : "#D4A017"
                      }}>
                        {isOverdue ? "Overdue" : "Due Soon"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Community Activity Feed */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px", color: "var(--color-text)", letterSpacing: "-0.01em" }}>Community Activity</h2>
            <div style={{
              background: "#fff", border: "1px solid rgba(0,0,0,0.04)",
              borderRadius: "20px", boxShadow: "0 8px 24px rgba(0,0,0,0.03)", overflow: "hidden"
            }}>
              {communityActivity.map((event, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                  borderBottom: i < communityActivity.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                  transition: "background 0.2s", cursor: "pointer"
                }}
                onMouseOver={(e: any) => e.currentTarget.style.background = "#F8FAFC"}
                onMouseOut={(e: any) => e.currentTarget.style.background = "transparent"}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: event.type === "lost" ? "#E76F5115" :
                      event.type === "reunion" ? "var(--color-success)15" :
                      event.type === "sighting" ? "#E9C46A15" : "#1B3A6B15",
                    color: event.type === "lost" ? "#E76F51" :
                      event.type === "reunion" ? "var(--color-success)" :
                      event.type === "sighting" ? "#D4A017" : "#1B3A6B",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {event.type === 'lost' ? <IconAlertTriangle size={16}/> : event.type === 'reunion' ? <IconPaw size={16}/> : <IconBell size={16}/>}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--color-text)", flex: 1, fontWeight: 500, lineHeight: 1.5 }}>{event.text}</p>
                  <span style={{ fontSize: 12, color: "var(--color-text-light)", whiteSpace: "nowrap", fontWeight: 600 }}>{event.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Care Tip of the Day */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px", color: "var(--color-text)", letterSpacing: "-0.01em" }}>Care Tip of the Day</h2>
            <div style={{
              background: "linear-gradient(135deg, #1B3A6B08 0%, #2A9D8F08 100%)",
              border: "1px solid rgba(27,58,107,0.1)",
              borderRadius: "20px", padding: 28, boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                 <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                   <span style={{ fontSize: 24 }}>{todayTip.icon || "💡"}</span>
                 </div>
                <span style={{
                  padding: "6px 14px", borderRadius: "100px",
                  fontSize: 13, fontWeight: 800, background: "#1B3A6B",
                  color: "#fff"
                }}>
                  {todayTip.category}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 16, color: "var(--color-text)", lineHeight: 1.6, fontWeight: 500 }}>
                {todayTip.tip}
              </p>
              <Link href="/care-guide" style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20,
                fontSize: 14, fontWeight: 700, color: "#1B3A6B", padding: "8px 16px", borderRadius: "100px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}
              onMouseOver={(e: any) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e: any) => e.currentTarget.style.transform = "none"}>
                Browse all tips <IconChevronRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Responsive override for 2-column layout */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ============= BOTTOM — Quick Actions ============= */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "var(--color-text)", letterSpacing: "-0.01em" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { label: "Report Lost Pet", href: "/lost-pets/report", icon: IconAlertTriangle, color: "#E76F51" },
            { label: "Register New Pet", href: "/owner/register-pet", icon: IconPaw, color: "#1B3A6B" },
            { label: "Browse Care Guide", href: "/care-guide", icon: IconShield, color: "#2A9D8F" },
            { label: "My Watchlist", href: "/watchlist", icon: IconBell, color: "#D4A017" },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link key={action.label} href={action.href} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "20px",
                background: "#fff", border: "1px solid rgba(0,0,0,0.04)",
                borderRadius: "16px", textDecoration: "none", color: "var(--color-text)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.04)"; }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "12px",
                  background: action.color + "12", color: action.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <ActionIcon size={24} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
