"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LostPetAnnouncementCard } from "@/components/lost-pets/LostPetAnnouncementCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";
import type { LostPetReport, LostPetReportStatus, LostPetRegistrationSnapshot } from "@/lib/types/lostPet";

type BoardStatusFilter = "All" | "Active" | "Resolved";
type SpeciesFilter = "All" | "Dog" | "Cat" | "Other";

interface LostPetReportRow {
  id: string;
  status: LostPetReportStatus;
  last_known_location: string;
  missing_at: string;
  notes: string | null;
  filing_user_role: "Owner" | "Staff" | "Admin";
  created_at: string;
  updated_at: string;
  pet_photo_url: string | null;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  color: string | null;
  size: string | null;
  vaccination_details: string | null;
  registration_number: string;
  owner_name: string;
  owner_contact_number: string | null;
}

function mapRowToReport(row: LostPetReportRow): LostPetReport {
  const pet: LostPetRegistrationSnapshot = {
    petPhotoUrl: row.pet_photo_url,
    petName: row.pet_name,
    species: row.species,
    breed: row.breed,
    color: row.color,
    size: row.size,
    vaccinationDetails: row.vaccination_details,
    registrationNumber: row.registration_number,
    ownerName: row.owner_name,
    ownerContactNumber: row.owner_contact_number
  };

  return {
    id: row.id,
    pet,
    lastKnownLocation: row.last_known_location,
    missingAt: row.missing_at,
    notes: row.notes,
    filingUserRole: row.filing_user_role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function LostPetAnnouncementBoard() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<LostPetReport[]>([]);

  const [statusFilter, setStatusFilter] = useState<BoardStatusFilter>("All");
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("All");

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsAuthLoading(true);
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setIsAuthLoading(false);
      setIsLoading(true);

      const { data: rows, error } = await supabase
        .from("lost_pet_reports")
        .select("*")
        .in("status", ["Active", "Resolved"])
        .order("missing_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setReports([]);
        setIsLoading(false);
        return;
      }

      setReports((rows as LostPetReportRow[]).map(mapRowToReport));
      setIsLoading(false);
    }

    init();
    return () => {
      mounted = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const statusOk =
        statusFilter === "All" ? true : statusFilter === "Active" ? r.status === "Active" : r.status === "Resolved";
      const speciesOk = speciesFilter === "All" ? true : r.pet.species === speciesFilter;
      return statusOk && speciesOk;
    });
  }, [reports, speciesFilter, statusFilter]);

  if (isAuthLoading) {
    return (
      <div className="container" style={{ paddingBlock: 24 }}>
        <div className="grid gap-12">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 6, minWidth: 180 }}>
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Status</div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BoardStatusFilter)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
            </Select>
          </div>

          <div style={{ display: "grid", gap: 6, minWidth: 180 }}>
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Species</div>
            <Select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value as SpeciesFilter)}>
              <option value="All">All</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>

        <Button variant="outline" onClick={() => router.push("/lost-pets/report")}>
          File a report
        </Button>
      </div>

      <div style={{ marginTop: 16 }}>
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12
            }}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[220px] w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ paddingBlock: 28, color: "hsl(var(--muted-foreground))" }}>
            No announcements found for the current filters.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12
            }}
          >
            {filtered.map((r) => (
              <LostPetAnnouncementCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

