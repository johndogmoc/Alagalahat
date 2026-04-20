"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LostPetAnnouncementCard } from "@/components/lost-pets/LostPetAnnouncementCard";
import { FoundPetAnnouncementCard, type FoundPetReport } from "@/components/lost-pets/FoundPetAnnouncementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";
import type { LostPetReport, LostPetRegistrationSnapshot } from "@/lib/types/lostPet";
import { getWatchlistReportIds, toggleWatchlistReportId } from "@/lib/watchlist";
import { OverviewMapLoader } from "@/components/OverviewMapLoader";

import "./LostPetAnnouncement.css";

type ReportTypeFilter = "All" | "Lost" | "Found";
type BoardStatusFilter = "All" | "Pending" | "Active" | "Resolved";
type SpeciesFilter = "All" | "Dog" | "Cat" | "Other";

/* ── Row mappers ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToLostReport(row: any): LostPetReport {
  const pet: LostPetRegistrationSnapshot = {
    petPhotoUrl: row.pet_photo_url || null,
    petName: row.pet_name || "Unknown Pet",
    species: row.species || "Other",
    breed: row.breed || null,
    color: row.color || null,
    size: row.size || null,
    vaccinationDetails: row.vaccination_details || null,
    registrationNumber: row.registration_number || "—",
    ownerName: row.owner_name || "Owner",
    ownerContactNumber: row.owner_contact_number || row.contact_info || null
  };
  return {
    id: row.id, pet,
    lastKnownLocation: row.last_known_location || "Unknown location",
    missingAt: row.missing_at || row.created_at,
    notes: row.notes || null,
    filingUserRole: row.filing_user_role || "Owner",
    status: row.status || "Pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    latitude: row.latitude || null, longitude: row.longitude || null,
    petBehavior: row.pet_behavior || null,
    rewardOffered: row.reward_amount || null,
    specificPurok: row.specific_purok || null,
    alternateContact: row.contact_info || null
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToFoundReport(row: any): FoundPetReport {
  return {
    id: row.id,
    petPhotoUrl: row.pet_photo_url || null,
    species: row.species || "Unknown",
    breedGuess: row.breed_guess || null,
    colorMarkings: row.color_markings || "Unknown",
    size: row.size || null,
    petCondition: row.pet_condition || "Unknown",
    hasCollar: row.has_collar || false,
    collarDetails: row.collar_details || null,
    foundLocation: row.found_location || "Unknown",
    foundAt: row.found_at || row.created_at,
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    specificPurok: row.specific_purok || null,
    finderName: row.finder_name || "Anonymous",
    finderContact: row.finder_contact || "—",
    petBehavior: row.pet_behavior || null,
    notes: row.notes || null,
    currentlyWithFinder: row.currently_with_finder ?? true,
    temporaryShelter: row.temporary_shelter || null,
    status: row.status || "Active",
    createdAt: row.created_at
  };
}

/* ── Unified item type ── */
type UnifiedReport = 
  | { type: "lost"; data: LostPetReport; createdAt: string }
  | { type: "found"; data: FoundPetReport; createdAt: string };

/* ── Inline icons ── */
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);
const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

export function LostPetAnnouncementBoard() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lostReports, setLostReports] = useState<LostPetReport[]>([]);
  const [foundReports, setFoundReports] = useState<FoundPetReport[]>([]);

  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<BoardStatusFilter>("All");
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("All");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  useEffect(() => { setWatchedIds(getWatchlistReportIds()); }, []);

  function handleToggleWatch(reportId: string) {
    toggleWatchlistReportId(reportId);
    setWatchedIds(getWatchlistReportIds());
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsAuthLoading(true);
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) { router.replace("/login"); return; }

      setIsAuthLoading(false);
      setIsLoading(true);

      // Fetch both lost and found reports
      const [lostRes, foundRes] = await Promise.all([
        supabase
          .from("lost_pet_reports")
          .select("*")
          .in("status", ["Pending", "Active", "Resolved"])
          .order("created_at", { ascending: false }),
        supabase
          .from("found_pet_reports")
          .select("*")
          .in("status", ["Active", "Claimed", "Transferred"])
          .order("created_at", { ascending: false })
      ]);

      if (!mounted) return;

      if (lostRes.error) console.error("Lost reports error:", lostRes.error);
      if (foundRes.error) console.error("Found reports error:", foundRes.error);

      setLostReports((lostRes.data || []).map(mapRowToLostReport));
      setFoundReports((foundRes.data || []).map(mapRowToFoundReport));
      setIsLoading(false);
    }
    init();
    return () => { mounted = false; };
  }, [router]);

  /* ── Unified + filtered list ── */
  const unified = useMemo<UnifiedReport[]>(() => {
    const items: UnifiedReport[] = [];

    if (typeFilter !== "Found") {
      for (const r of lostReports) {
        const statusOk = statusFilter === "All" || r.status === statusFilter;
        const speciesOk = speciesFilter === "All" || r.pet.species === speciesFilter;
        if (statusOk && speciesOk) items.push({ type: "lost", data: r, createdAt: r.createdAt });
      }
    }

    if (typeFilter !== "Lost") {
      for (const r of foundReports) {
        const statusOk = statusFilter === "All" || 
          (statusFilter === "Active" && r.status === "Active") || 
          (statusFilter === "Resolved" && (r.status === "Claimed" || r.status === "Transferred"));
        const speciesOk = speciesFilter === "All" || r.species === speciesFilter;
        if (statusOk && speciesOk) items.push({ type: "found", data: r, createdAt: r.createdAt });
      }
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [lostReports, foundReports, typeFilter, statusFilter, speciesFilter]);

  /* ── Map reports (only lost reports with coordinates for now) ── */
  const mapReports = useMemo(() => {
    return lostReports.filter(r => r.latitude != null && r.longitude != null);
  }, [lostReports]);

  if (isAuthLoading) {
    return (
      <div className="lpb-board">
        <Skeleton className="h-10 w-64" />
        <div style={{ display: "grid", gap: 16 }}>
          <Skeleton className="h-[200px] w-full" style={{ borderRadius: 20 }} />
          <Skeleton className="h-[200px] w-full" style={{ borderRadius: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="lpb-board">
      {/* ── Toolbar ── */}
      <div className="lpb-toolbar">
        <div className="lpb-filters">
          {/* Type filter */}
          <div className="lpb-filter-group">
            <span className="lpb-filter-label">Type</span>
            <select className="lpb-filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ReportTypeFilter)}>
              <option value="All">All Reports</option>
              <option value="Lost">🔴 Lost Pets</option>
              <option value="Found">🟢 Found Pets</option>
            </select>
          </div>
          <div className="lpb-filter-group">
            <span className="lpb-filter-label">Status</span>
            <select className="lpb-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BoardStatusFilter)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved / Claimed</option>
            </select>
          </div>
          <div className="lpb-filter-group">
            <span className="lpb-filter-label">Species</span>
            <select className="lpb-filter-select" value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value as SpeciesFilter)}>
              <option value="All">All Species</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="lpb-actions">
          <button className={`lpb-btn ${viewMode === "list" ? "lpb-btn-active" : "lpb-btn-outline"}`} onClick={() => setViewMode("list")}>
            <ListIcon /> List
          </button>
          <button className={`lpb-btn ${viewMode === "map" ? "lpb-btn-active" : "lpb-btn-outline"}`} onClick={() => setViewMode("map")}>
            <MapIcon /> Map
          </button>
          <button className="lpb-btn lpb-btn-cta" onClick={() => router.push("/lost-pets/report")}>
            <PlusIcon /> File Report
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{
          padding: "10px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8,
          background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)",
          fontSize: 13, fontWeight: 700, color: "#DC2626", fontFamily: "'DM Sans', sans-serif"
        }}>
          🔴 {lostReports.filter(r => r.status !== "Resolved").length} Lost
        </div>
        <div style={{
          padding: "10px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)",
          fontSize: 13, fontWeight: 700, color: "#22c55e", fontFamily: "'DM Sans', sans-serif"
        }}>
          🟢 {foundReports.filter(r => r.status === "Active").length} Found
        </div>
        <div style={{
          padding: "10px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8,
          background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.15)",
          fontSize: 13, fontWeight: 600, color: "#64748b", fontFamily: "'DM Sans', sans-serif"
        }}>
          ✓ {lostReports.filter(r => r.status === "Resolved").length + foundReports.filter(r => r.status === "Claimed").length} Resolved
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div style={{ display: "grid", gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" style={{ borderRadius: 20 }} />
          ))}
        </div>
      ) : unified.length === 0 ? (
        <div className="lpb-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="8" cy="6" rx="2" ry="2.5"/><ellipse cx="16" cy="6" rx="2" ry="2.5"/><ellipse cx="5" cy="11" rx="2" ry="2.5"/><ellipse cx="19" cy="11" rx="2" ry="2.5"/>
            <path d="M12 18c-2.5 0-4.5-1.5-5-3.5 0-1 1-2 2-2.5.6-.3 1.3-.5 2-.5h2c.7 0 1.4.2 2 .5 1 .5 2 1.5 2 2.5-.5 2-2.5 3.5-5 3.5z"/>
          </svg>
          <p>No reports match your filters.</p>
        </div>
      ) : viewMode === "map" ? (
        <OverviewMapLoader reports={mapReports} />
      ) : (
        <div className="lpb-grid">
          {unified.map((item) =>
            item.type === "lost" ? (
              <LostPetAnnouncementCard
                key={`lost-${item.data.id}`}
                report={item.data}
                isWatched={watchedIds.includes(item.data.id)}
                onToggleWatch={handleToggleWatch}
              />
            ) : (
              <FoundPetAnnouncementCard
                key={`found-${item.data.id}`}
                report={item.data}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
