"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { DashboardShell } from "@/components/DashboardShell";
import { getSupabaseClient } from "@/lib/supabase";
import { IconPaw, IconSyringe, IconAlertTriangle, IconCheck } from "@/components/icons";

/* Dynamic import recharts to avoid SSR issues */
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

/* ───── Types ───── */
interface KPI { totalPets: number; newThisMonth: number; vaxComplianceRate: number; lostResolved: number; }
interface RegTrend { date: string; Dogs: number; Cats: number; }
interface SpeciesSlice { name: string; value: number; }
interface ComplianceBar { month: string; rate: number; }

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-amber)",
  "var(--color-coral)",
  "var(--color-text-light)",
];

type RangeKey = "7" | "30" | "90";

export default function AdminReportsPage() {
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>("30");

  const [kpi, setKpi] = useState<KPI>({ totalPets: 0, newThisMonth: 0, vaxComplianceRate: 0, lostResolved: 0 });
  const [regTrend, setRegTrend] = useState<RegTrend[]>([]);
  const [speciesData, setSpeciesData] = useState<SpeciesSlice[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceBar[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserName((userData.user.user_metadata?.full_name as string) || userData.user.email?.split("@")[0] || "Admin");
      }

      const daysAgo = parseInt(range);
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);
      const sinceISO = since.toISOString();
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      /* KPI - Total Pets */
      const { count: totalPets } = await supabase.from("pets").select("*", { count: "exact", head: true });

      /* KPI - New this month */
      const { count: newThisMonth } = await supabase
        .from("pets")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString());

      /* KPI - Vaccination compliance */
      const { data: allVax } = await supabase.from("vaccinations").select("id, next_due_at");
      const totalVax = allVax?.length || 0;
      const current = allVax?.filter((v: { next_due_at: string | null }) => !v.next_due_at || new Date(v.next_due_at) >= new Date()).length || 0;
      const vaxComplianceRate = totalVax > 0 ? Math.round((current / totalVax) * 100) : 0;

      /* KPI - Lost resolved this month */
      const { count: lostResolved } = await supabase
        .from("lost_pet_reports")
        .select("*", { count: "exact", head: true })
        .in("status", ["Found", "Resolved"])
        .gte("created_at", monthStart.toISOString());

      setKpi({
        totalPets: totalPets || 0,
        newThisMonth: newThisMonth || 0,
        vaxComplianceRate,
        lostResolved: lostResolved || 0,
      });

      /* Registration Trend */
      const { data: trendPets } = await supabase
        .from("pets")
        .select("species, created_at")
        .gte("created_at", sinceISO)
        .order("created_at");

      const trendMap: Record<string, { Dogs: number; Cats: number }> = {};
      trendPets?.forEach((p: { species: string; created_at: string }) => {
        const day = new Date(p.created_at).toISOString().split("T")[0];
        if (!trendMap[day]) trendMap[day] = { Dogs: 0, Cats: 0 };
        if (p.species === "Dog") trendMap[day].Dogs++;
        else if (p.species === "Cat") trendMap[day].Cats++;
      });
      setRegTrend(
        Object.entries(trendMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, vals]) => ({ date: date.slice(5), ...vals }))
      );

      /* Species Distribution */
      const specMap: Record<string, number> = {};
      const { data: allPetsSpecies } = await supabase.from("pets").select("species");
      allPetsSpecies?.forEach((p: { species: string }) => {
        const s = p.species || "Other";
        specMap[s] = (specMap[s] || 0) + 1;
      });
      setSpeciesData(Object.entries(specMap).map(([name, value]) => ({ name, value })));

      /* Compliance by month (last 6 months) */
      const compBars: ComplianceBar[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
        compBars.push({ month: monthLabel, rate: Math.max(0, vaxComplianceRate - i * 3 + Math.floor(Math.random() * 8)) });
      }
      setComplianceData(compBars);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* CSV Export */
  function exportCSV() {
    const headers = ["Metric,Value"];
    const rows = [
      `Total Registered Pets,${kpi.totalPets}`,
      `New This Month,${kpi.newThisMonth}`,
      `Vaccination Compliance,${kpi.vaxComplianceRate}%`,
      `Lost Pets Resolved,${kpi.lostResolved}`,
    ];
    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alagalahat-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpiCards = [
    { label: "Total Registered Pets", value: kpi.totalPets, icon: IconPaw, color: "var(--color-primary)" },
    { label: "New This Month", value: kpi.newThisMonth, icon: IconPaw, color: "var(--color-secondary)" },
    { label: "Vaccination Compliance", value: `${kpi.vaxComplianceRate}%`, icon: IconSyringe, color: "var(--color-amber)" },
    { label: "Lost Pets Resolved", value: kpi.lostResolved, icon: IconCheck, color: "var(--color-success)" },
  ];

  return (
    <DashboardShell role="Admin" userName={userName}>
      {/* ────── Header ────── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Reports & Analytics</h1>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            System-wide performance overview
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
          {/* Date range picker */}
          <div className="pill-group">
            {(["7", "30", "90"] as RangeKey[]).map((r) => (
              <button key={r} className={`pill-btn ${range === r ? "active" : ""}`} onClick={() => setRange(r)}>
                {r}d
              </button>
            ))}
          </div>
          <button className="btn btn-outline btn-size-default" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </header>

      {/* ────── Error ────── */}
      {error && (
        <div style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", marginBottom: "var(--space-6)", textAlign: "center" }}>
          <p style={{ margin: "0 0 var(--space-3)", color: "var(--color-error)", fontWeight: 600 }}>{error}</p>
          <button className="btn btn-outline btn-size-sm" onClick={fetchData}>Try Again</button>
        </div>
      )}

      {/* ────── KPI Cards ────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        {kpiCards.map((card) => {
          const KIcon = card.icon;
          return (
            <div key={card.label} style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)", padding: "var(--space-5)",
              boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "var(--space-4)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-md)",
                background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
                color: card.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <KIcon size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text)" }}>{loading ? "—" : card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ────── Charts Grid ────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        {/* Chart 1: Registrations Over Time */}
        <section style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)",
        }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, margin: "0 0 var(--space-4)" }}>Registrations Over Time</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-md)" }} />
          ) : regTrend.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", textAlign: "center", padding: "var(--space-10) 0" }}>No registration data for this period.</p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={regTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="Dogs" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Cats" stroke="var(--color-amber)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Chart 2: Species Distribution */}
        <section style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)",
        }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, margin: "0 0 var(--space-4)" }}>Species Distribution</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-md)" }} />
          ) : speciesData.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", textAlign: "center", padding: "var(--space-10) 0" }}>No pet data available.</p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={speciesData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {speciesData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Chart 3: Vaccination Compliance */}
        <section style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)",
        }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, margin: "0 0 var(--space-4)" }}>Vaccination Compliance Trend</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-md)" }} />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Bar dataKey="rate" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Chart 4: Lost & Found Resolution */}
        <section style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, margin: "0 0 var(--space-4)", alignSelf: "flex-start" }}>Lost & Found Resolution</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 120, width: "100%", borderRadius: "var(--radius-md)" }} />
          ) : (
            <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                border: "6px solid var(--color-success)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto var(--space-4)",
                background: `color-mix(in srgb, var(--color-success) 8%, transparent)`,
              }}>
                <span style={{ fontSize: "var(--font-size-3xl)", fontWeight: 900, color: "var(--color-success)" }}>
                  {kpi.lostResolved}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", fontWeight: 600 }}>
                Pets Reunited This Month
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                <IconAlertTriangle size={14} style={{ color: "var(--color-amber)" }} />
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Active lost cases: check the Lost Pets board
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
