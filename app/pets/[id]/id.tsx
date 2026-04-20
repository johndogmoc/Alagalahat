"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import type { SidebarRole } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import { generateQRDataURL, getPetPublicURL } from "@/lib/qrcode";
import { QRCodeSVG } from "qrcode.react";
import {
  IconPaw, IconClipboard, IconAlertTriangle, IconSyringe,
  IconChevronRight, IconCheck, IconQrCode, IconDownload, IconPrinter,
  IconClock
} from "@/components/icons";

/* ---- Types ---- */
interface PetData {
  id: string;
  owner_user_id?: string | null;
  name: string;
  species: string;
  breed: string | null;
  color_markings: string | null;
  size: string | null;
  photo_url: string | null;
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
  owner_name: string;
  owner_contact_number: string | null;
  date_of_birth: string | null;
  sex: string | null;
  spayed_neutered: boolean | null;
  microchip_number: string | null;
  created_at: string;
}

interface VaxRow {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_at: string | null;
  administered_by: string | null;
}

interface LostReport {
  id: string;
  last_seen_location: string;
  created_at: string;
  status: string;
  notes: string | null;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  created_at: string;
}

/* ---- Tab names ---- */
const TABS = ["Overview", "Vaccination History", "Lost Reports", "QR Code", "Activity Log"] as const;
type TabName = typeof TABS[number];

/* ---- Status badge helper ---- */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Approved: { bg: "rgba(82,183,136,0.15)", color: "var(--color-success)" },
    Pending: { bg: "rgba(233,196,106,0.15)", color: "var(--color-amber)" },
    Rejected: { bg: "rgba(231,111,81,0.15)", color: "var(--color-coral)" }
  };
  const s = map[status] ?? map.Pending;
  return (
    <span className="status-badge" style={{
      padding: "4px 14px", borderRadius: "var(--radius-full)",
      fontSize: "var(--font-size-xs)", fontWeight: 700,
      background: s.bg, color: s.color
    }}>
      {status}
    </span>
  );
}

function roleFromUser(user: { user_metadata?: Record<string, unknown> } | null): SidebarRole {
  const r = user?.user_metadata?.role;
  if (r === "Admin" || r === "Staff" || r === "Owner") return r;
  return "Owner";
}

function dashboardHome(role: SidebarRole): string {
  if (role === "Admin") return "/admin";
  if (role === "Staff") return "/staff";
  return "/owner";
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

async function printRegistrationCertificate(p: PetData) {
  const w = typeof window !== "undefined" ? window.open("", "_blank") : null;
  if (!w) return;
  
  const issued = new Date().toLocaleDateString("en-PH");
  const identifier = p.registration_number || p.id;
  const publicUrl = getPetPublicURL(identifier);
  
  let qrDataUrl = "";
  try {
    qrDataUrl = await generateQRDataURL(publicUrl, { width: 150, margin: 2 });
  } catch(e) {
    console.error("Failed to generate QR for print", e);
  }

  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Certificate of Registration — ${p.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
    
    @media print {
      @page { size: portrait; margin: 0; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
    }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .certificate-container {
      background: #ffffff;
      width: 210mm; /* A4 width */
      height: 297mm; /* A4 height */
      padding: 20mm;
      box-sizing: border-box;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      position: relative;
    }
    
    .certificate-border {
      border: 8px double #1B3A6B;
      height: 100%;
      padding: 10mm;
      box-sizing: border-box;
      position: relative;
    }
    
    .bg-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.04;
      width: 400px;
      height: auto;
      pointer-events: none;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .header h2 {
      font-family: 'Merriweather', serif;
      font-size: 16px;
      margin: 0 0 4px;
      text-transform: uppercase;
      font-weight: 700;
      color: #0f172a;
    }
    .header h3 {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      margin: 0;
      color: #475569;
      font-weight: 600;
    }
    
    .title-area {
      text-align: center;
      margin: 40px 0;
    }
    
    .title-area h1 {
      font-family: 'Merriweather', serif;
      font-size: 32px;
      color: #1B3A6B;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0;
    }
    
    .cert-no {
      text-align: center;
      font-family: monospace;
      color: #ef4444;
      font-size: 14px;
      margin-top: 10px;
      font-weight: bold;
    }
    
    .content {
      font-family: 'Merriweather', serif;
      font-size: 16px;
      line-height: 1.8;
      text-align: justify;
      margin: 40px 40px;
      color: #1e293b;
    }
    
    .input-line {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #0f172a;
      border-bottom: 1px solid #1B3A6B;
      padding: 0 10px;
      display: inline-block;
    }
    
    .details-table {
      width: 100%;
      margin-top: 30px;
      border-collapse: collapse;
      font-family: 'Inter', sans-serif;
    }
    .details-table th, .details-table td {
      padding: 12px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
    }
    .details-table th {
      background: #f8fafc;
      width: 35%;
      text-align:left;
      color: #475569;
    }
    .details-table td {
      font-weight: 600;
      color: #1e293b;
    }
    
    .footer-area {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .sign-box {
      text-align: center;
      width: 200px;
    }
    .sign-line {
      border-top: 1px solid #1B3A6B;
      margin-top: 60px;
      padding-top: 8px;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: #1e293b;
    }
    .sign-sub {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #64748b;
    }
    
    .qr-box {
      text-align: center;
      background: #fff;
    }
    .qr-box img {
      width: 100px;
      height: 100px;
      image-rendering: crisp-edges;
      border: 2px solid #1B3A6B;
      padding: 4px;
      border-radius: 8px;
    }
    .qr-text {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="certificate-border">
      
      <!-- Seal background watermark -->
      <svg class="bg-logo" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="7" />
        <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
        <path d="M7.76 7.76l1.41 1.41M14.83 14.83l1.41 1.41M7.76 16.24l1.41-1.41M14.83 9.17l1.41-1.41" />
        <circle cx="12" cy="12" r="2" fill="#1B3A6B" />
      </svg>
      
      <div class="header">
        <h2>Republic of the Philippines</h2>
        <h3>Local Government Unit</h3>
        <h3 style="margin-top: 4px;">Office of the Punong Barangay</h3>
      </div>
      
      <div class="title-area">
        <h1>Certificate of Pet Registration</h1>
        <div class="cert-no">REG. NO: ${p.registration_number || "PENDING"}</div>
      </div>
      
      <div class="content">
        This is to certify that the pet formally known as <span class="input-line" style="width: 250px; text-align: center;">${p.name}</span> 
        owned by <span class="input-line" style="width: 300px; text-align: center;">${p.owner_name}</span> 
        has been officially registered in the AlagaLahat Pet Safety Network in accordance with barangay ordinances and regulations.
        
        <table class="details-table">
          <tr>
            <th>Species / Breed</th>
            <td>${p.species} / ${p.breed || "Not specified"}</td>
          </tr>
          <tr>
            <th>Color & Markings</th>
            <td>${p.color_markings || "Not specified"}</td>
          </tr>
          <tr>
            <th>Sex / Size</th>
            <td>${p.sex || "Not specified"} / ${p.size || "Not specified"}</td>
          </tr>
          <tr>
            <th>Date of Birth / Registration</th>
            <td>${p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString("en-PH") : "Unknown"} / ${issued}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td style="color: ${p.status === 'Approved' ? '#16A34A' : '#EAB308'}">${p.status}</td>
          </tr>
        </table>
      </div>
      
      <div class="footer-area">
        <div class="sign-box">
          <div class="sign-line">${p.owner_name}</div>
          <div class="sign-sub">Signature of Pet Owner</div>
        </div>
        
        <div class="qr-box">
          ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Tag" />` : `<div style="width:100px;height:100px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">No QR</div>`}
          <div class="qr-text">Scan to verify record</div>
        </div>
        
        <div class="sign-box">
          <div class="sign-line">Barangay Official</div>
          <div class="sign-sub">Authorized Signature</div>
        </div>
      </div>
      
    </div>
  </div>
</body>
</html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

/* ============================================ */
export default function PetProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [pet, setPet] = useState<PetData | null>(null);
  const [vaccinations, setVaccinations] = useState<VaxRow[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [userName, setUserName] = useState("User");
  const [shellRole, setShellRole] = useState<SidebarRole>("Owner");

  // QR state
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
        setShellRole(roleFromUser(user));
      }

      const { data, error } = await supabase.from("pets").select("*").eq("id", id).single();
      if (!mounted) return;
      if (error || !data) {
        setPet(null);
        setLoading(false);
        return;
      }
      const row = data as PetData;
      const role = user ? roleFromUser(user) : "Owner";
      if (role === "Owner" && row.owner_user_id && user && row.owner_user_id !== user.id) {
        setPet(null);
        setLoading(false);
        return;
      }

      setPet(row);

      const { data: vaxData } = await supabase
        .from("vaccinations")
        .select("id, vaccine_name, date_given, next_due_at, administered_by")
        .eq("pet_id", id)
        .order("date_given", { ascending: false });
      if (mounted) setVaccinations((vaxData as VaxRow[]) ?? []);

      let lostQuery = supabase
        .from("lost_pet_reports")
        .select("id, last_seen_location, created_at, status, notes")
        .order("created_at", { ascending: false });

      if (row.registration_number) {
        lostQuery = lostQuery.or(`pet_id.eq.${id},registration_number.eq.${row.registration_number}`);
      } else {
        lostQuery = lostQuery.eq("pet_id", id);
      }

      const { data: lostData } = await lostQuery;
      const rawLost = (lostData as LostReport[]) ?? [];
      const deduped = [...new Map(rawLost.map((r) => [r.id, r])).values()];
      if (mounted) setLostReports(deduped);

      // Activity logs for this pet
      const { data: logData } = await supabase
        .from("activity_logs")
        .select("id, action, details, created_at")
        .or(`details.ilike.%${id}%,details.ilike.%${row.name}%`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (mounted) setActivityLogs((logData as ActivityLog[]) ?? []);

      setLoading(false);
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  // Generate QR when tab is selected
  useEffect(() => {
    if (activeTab !== "QR Code" || !pet) return;
    if (qrDataUrl) return; // Already generated

    async function genQR() {
      setQrLoading(true);
      try {
        const identifier = pet!.registration_number || pet!.id;
        const publicUrl = getPetPublicURL(identifier);
        const dataUrl = await generateQRDataURL(publicUrl, { width: 400, margin: 3 });
        setQrDataUrl(dataUrl);
      } catch {
        // Fallback
        setQrDataUrl(null);
      }
      setQrLoading(false);
    }
    genQR();
  }, [activeTab, pet, qrDataUrl]);

  const petAge = pet?.date_of_birth ? (() => {
    const d = new Date(pet.date_of_birth!);
    const now = new Date();
    const totalMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
    const y = Math.floor(totalMonths / 12);
    return `${y} year${y !== 1 ? "s" : ""}`;
  })() : null;

  /* ---- QR helpers ---- */
  function downloadQR() {
    if (!qrDataUrl || !pet) return;
    const link = document.createElement("a");
    link.download = `${pet.name}-QR-tag.png`;
    link.href = qrDataUrl;
    link.click();
  }

  function printQR() {
    if (!qrDataUrl || !pet) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const identifier = pet.registration_number || pet.id;
    w.document.write(`<!DOCTYPE html><html><head><title>QR Tag — ${pet.name}</title>
    <style>
      body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
      img { width: 300px; height: 300px; margin: 24px 0; }
      h1 { font-size: 24px; color: #1B4F8A; margin: 0; }
      p { font-size: 14px; color: #6b7280; margin: 4px 0; }
      .reg { font-family: monospace; font-size: 16px; font-weight: 700; color: #1B4F8A; letter-spacing: 0.06em; }
      .footer { margin-top: 16px; font-size: 11px; color: #9ca3af; }
    </style></head><body>
    <h1>${pet.name}</h1>
    <p>${pet.species}${pet.breed ? " • " + pet.breed : ""}</p>
    <img src="${qrDataUrl}" alt="QR Code" />
    <p class="reg">${identifier}</p>
    <p>Scan to view pet profile & contact owner</p>
    <p class="footer">AlagaLahat — Barangay Pet Safety Network</p>
    </body></html>`);
    w.document.close();
    w.focus();
    requestAnimationFrame(() => w.print());
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <DashboardShell role={shellRole} userName={userName}>
        <div style={{ padding: 24 }}>
          <div className="skeleton" style={{ width: "100%", height: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: "60%", height: 24, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "40%", height: 16 }} />
        </div>
      </DashboardShell>
    );
  }

  /* ---- Not found ---- */
  if (!pet) {
    return (
      <DashboardShell role={shellRole} userName={userName}>
        <div style={{ textAlign: "center", padding: 64 }}>
          <IconPaw size={64} style={{ color: "var(--color-text-light)", marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Pet Not Found</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 8 }}>This pet profile doesn&apos;t exist or you don&apos;t have access.</p>
          <Button variant="primary" onClick={() => router.push(dashboardHome(shellRole))} style={{ marginTop: 24 }}>
            Back to dashboard
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={shellRole} userName={userName}>
      <div className="page-fade-in">
        <div style={{ marginBottom: 16 }}>
          <Link
            href={shellRole === "Staff" || shellRole === "Admin" ? "/staff/pets" : "/pets"}
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              color: "var(--color-secondary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <IconChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            {shellRole === "Staff" || shellRole === "Admin" ? "Back to queue" : "All my pets"}
          </Link>
        </div>
        {/* ===== HERO SECTION ===== */}
        <div className="card-base card-hover" style={{
          display: "flex", gap: 28, flexWrap: "wrap", padding: 32,
          marginBottom: 32, alignItems: "flex-start"
        }}>
          {/* Pet photo */}
          <div style={{
            width: 220, height: 220, borderRadius: "var(--radius-lg)",
            background: "var(--color-background)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", border: "3px solid var(--color-border)"
          }}>
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <IconPaw size={72} style={{ color: "var(--color-text-light)" }} />
            )}
          </div>

          {/* Pet info */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>{pet.name}</h1>
              <StatusBadge status={pet.status} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{
                padding: "4px 12px", borderRadius: "var(--radius-full)",
                fontSize: "var(--font-size-xs)", fontWeight: 600,
                background: "var(--color-primary)" + "18", color: "var(--color-primary)"
              }}>{pet.species}</span>
              {pet.breed && (
                <span style={{
                  padding: "4px 12px", borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-size-xs)", fontWeight: 600,
                  background: "var(--color-secondary)" + "18", color: "var(--color-secondary)"
                }}>{pet.breed}</span>
              )}
            </div>

            {/* Registration number */}
            <div style={{
              display: "inline-block", padding: "8px 16px",
              background: "var(--color-background)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)", marginBottom: 16
            }}>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Registration #</span>
              <div style={{ fontFamily: "monospace", fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary)", letterSpacing: "0.05em" }}>
                {pet.registration_number || "—"}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="primary" size="sm" asChild href={`/pets/${id}/vaccinations`}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconSyringe size={14} /> Manage vaccinations
                </span>
              </Button>
              <Button variant="destructive" size="sm" asChild href="/lost-pets/report">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconAlertTriangle size={14} /> Report as lost
                </span>
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab("QR Code")}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconQrCode size={14} /> QR Tag
                </span>
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => printRegistrationCertificate(pet)}>
                Print certificate
              </Button>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="tab-list" role="tablist" aria-label="Pet profile sections" style={{
          display: "flex",
          gap: 8,
          borderBottom: "2px solid var(--color-border)",
          marginBottom: 32,
          overflowX: "auto",
          paddingBottom: 12
        }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                background: activeTab === tab ? "var(--color-primary)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--color-text)",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                fontWeight: activeTab === tab ? 700 : 600,
                cursor: "pointer",
                transition: "all 200ms cubic-bezier(0.2, 0.9, 0.2, 1)",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = "var(--color-background-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== TAB PANELS ===== */}
        <div className="tab-panel" role="tabpanel" key={activeTab}>
          {activeTab === "Overview" && (
            <div className="info-grid" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
              <div className="info-item"><span className="info-label">Name</span><span className="info-value">{pet.name}</span></div>
              <div className="info-item"><span className="info-label">Species</span><span className="info-value">{pet.species}</span></div>
              <div className="info-item"><span className="info-label">Breed</span><span className="info-value">{pet.breed || "—"}</span></div>
              <div className="info-item"><span className="info-label">Color / Markings</span><span className="info-value">{pet.color_markings || "—"}</span></div>
              <div className="info-item"><span className="info-label">Size</span><span className="info-value">{pet.size || "—"}</span></div>
              <div className="info-item"><span className="info-label">Sex</span><span className="info-value">{pet.sex || "—"}</span></div>
              <div className="info-item"><span className="info-label">Age</span><span className="info-value">{petAge || "—"}</span></div>
              <div className="info-item"><span className="info-label">Spayed / Neutered</span><span className="info-value">{pet.spayed_neutered === true ? "Yes" : pet.spayed_neutered === false ? "No" : "—"}</span></div>
              <div className="info-item"><span className="info-label">Microchip</span><span className="info-value" style={{ fontFamily: "monospace" }}>{pet.microchip_number || "—"}</span></div>
              <div className="info-item"><span className="info-label">Registration #</span><span className="info-value" style={{ fontFamily: "monospace" }}>{pet.registration_number || "—"}</span></div>
              <div className="info-item"><span className="info-label">Owner</span><span className="info-value">{pet.owner_name}</span></div>
              <div className="info-item"><span className="info-label">Registered</span><span className="info-value">{new Date(pet.created_at).toLocaleDateString("en-PH")}</span></div>
            </div>
          )}

          {activeTab === "Vaccination History" && (
            <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {vaccinations.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)" }}>
                  <IconSyringe size={40} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No vaccination records yet.</p>
                  <Button variant="primary" size="sm" asChild href={`/pets/${id}/vaccinations`} style={{ marginTop: 16 }}>
                    <span>Add vaccination record</span>
                  </Button>
                </div>
              ) : (
                <div style={{ padding: 20 }}>
                  {vaccinations.map((v, i) => {
                    const now = new Date();
                    const due = v.next_due_at ? new Date(v.next_due_at) : null;
                    const isOverdue = due ? due < now : false;
                    const isUpcoming = due ? (due > now && due < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) : false;
                    const vaxStatus = isOverdue ? "Overdue" : isUpcoming ? "Upcoming" : "Complete";
                    const vaxColor = isOverdue ? "var(--color-coral)" : isUpcoming ? "var(--color-amber)" : "var(--color-success)";

                    return (
                      <div key={v.id} style={{
                        display: "flex", gap: 16, padding: "16px 0",
                        borderBottom: i < vaccinations.length - 1 ? "1px solid var(--color-border)" : "none"
                      }}>
                        {/* Timeline dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <div style={{
                            width: 12, height: 12, borderRadius: "50%",
                            background: vaxColor, border: `3px solid ${vaxColor}18`
                          }} />
                          {i < vaccinations.length - 1 && (
                            <div style={{ width: 2, flex: 1, background: "var(--color-border)" }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{v.vaccine_name}</p>
                            <span className="status-badge" style={{
                              padding: "2px 10px", borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)", fontWeight: 700,
                              background: vaxColor + "18", color: vaxColor
                            }}>{vaxStatus}</span>
                          </div>
                          <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            Given: {new Date(v.date_given).toLocaleDateString("en-PH")}
                            {due ? ` • Next due: ${due.toLocaleDateString("en-PH")}` : ""}
                            {v.administered_by ? ` • By: ${v.administered_by}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {shellRole !== "Owner" && (
                    <div style={{ paddingTop: 16 }}>
                      <Button variant="outline" size="sm" asChild href={`/pets/${id}/vaccinations`}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <IconSyringe size={14} /> Manage all records
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "Lost Reports" && (
            <div style={{ display: "grid", gap: 12 }}>
              {lostReports.length === 0 ? (
                <div style={{
                  background: "var(--color-card)", border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)", padding: 32, textAlign: "center",
                  color: "var(--color-text-muted)"
                }}>
                  <IconCheck size={40} style={{ color: "var(--color-success)", marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No lost reports have been filed for this pet.</p>
                </div>
              ) : (
                lostReports.map((r) => (
                  <div key={r.id} style={{
                    background: "var(--color-card)", border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>Report #{r.id.slice(0, 8)}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                       Last seen: {r.last_seen_location} •  {new Date(r.created_at).toLocaleDateString("en-PH")}
                    </p>
                    {r.notes && <p style={{ margin: 0, marginTop: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>{r.notes}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "QR Code" && (
            <div style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden"
            }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <IconQrCode size={20} style={{ color: "var(--color-primary)" }} />
                  Pet QR Tag
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Print this QR code and attach it to your pet&apos;s collar. Anyone who scans it can view the pet&apos;s profile and contact you.
                </p>
              </div>

              <div style={{ padding: 32, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 24 }}>
                {qrLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 32 }}>
                    <div className="skeleton" style={{ width: 280, height: 280, borderRadius: "var(--radius-lg)" }} />
                    <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>Generating QR code…</p>
                  </div>
                ) : qrDataUrl ? (
                  <>
                    {/* QR Display */}
                    <div style={{
                      padding: 24, background: "#fff", borderRadius: "var(--radius-xl)",
                      border: "2px solid var(--color-border)", boxShadow: "var(--shadow-md)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 16
                    }}>
                      <QRCodeSVG
                        value={getPetPublicURL(pet.registration_number || pet.id)}
                        size={260}
                        level="H"
                        marginSize={2}
                        fgColor="#1B4F8A"
                      />
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "var(--color-text)" }}>{pet.name}</p>
                        <p style={{ margin: "2px 0 0", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "var(--color-primary)", letterSpacing: "0.04em" }}>
                          {pet.registration_number || pet.id.slice(0, 12)}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-muted)" }}>
                          AlagaLahat Pet Safety Network
                        </p>
                      </div>
                    </div>

                    {/* Public URL */}
                    <div style={{
                      width: "100%", maxWidth: 420, padding: "12px 16px",
                      background: "var(--color-background)", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)", textAlign: "center"
                    }}>
                      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: 4 }}>Public Profile URL</p>
                      <p style={{
                        margin: 0, fontSize: "var(--font-size-xs)", fontFamily: "monospace",
                        color: "var(--color-primary)", wordBreak: "break-all", fontWeight: 600
                      }}>
                        {getPetPublicURL(pet.registration_number || pet.id)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                      <Button variant="primary" onClick={downloadQR} style={{ gap: 8 }}>
                        <IconDownload size={16} /> Download PNG
                      </Button>
                      <Button variant="outline" onClick={printQR} style={{ gap: 8 }}>
                        <IconPrinter size={16} /> Print QR Tag
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 32, textAlign: "center" }}>
                    <IconQrCode size={48} style={{ color: "var(--color-text-light)", marginBottom: 12 }} />
                    <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Unable to generate QR code. Please try again.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Activity Log" && (
            <div style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
            }}>
              {activityLogs.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center" }}>
                  <IconClipboard size={40} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>No activity recorded yet</h4>
                  <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
                    Activity will appear here as changes are made to this pet&apos;s profile.
                  </p>
                </div>
              ) : (
                <div style={{ padding: "8px 0" }}>
                  {activityLogs.map((log, i) => (
                    <div
                      key={log.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "14px 24px",
                        borderBottom: i < activityLogs.length - 1 ? "1px solid var(--color-border)" : "none"
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "var(--radius-md)",
                        background: "var(--color-primary)" + "12", color: "var(--color-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2
                      }}>
                        <IconClock size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                          {log.action}
                        </p>
                        {log.details && (
                          <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                            {log.details}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", flexShrink: 0, whiteSpace: "nowrap" }}>
                        {timeAgo(log.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
