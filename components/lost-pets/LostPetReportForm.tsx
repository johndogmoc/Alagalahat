"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import type { FilingUserRole, LostPetRegistrationSnapshot, LostPetReportStatus } from "@/lib/types/lostPet";

type PetSpecies = "Dog" | "Cat" | "Other";

interface PetRegistrationRow {
  id: string;
  photo_url: string | null;
  name: string;
  species: PetSpecies;
  breed: string | null;
  color: string | null;
  size: string | null;
  vaccination_details: string | null;
  registration_number: string;
  owner_name: string;
  owner_contact_number: string | null;
}

function mapPetRow(row: PetRegistrationRow): LostPetRegistrationSnapshot {
  return {
    petPhotoUrl: row.photo_url,
    petName: row.name,
    species: row.species,
    breed: row.breed,
    color: row.color,
    size: row.size,
    vaccinationDetails: row.vaccination_details,
    registrationNumber: row.registration_number,
    ownerName: row.owner_name,
    ownerContactNumber: row.owner_contact_number
  };
}

export function LostPetReportForm() {
  const router = useRouter();

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [role, setRole] = useState<FilingUserRole | null>(null);

  const [ownerPets, setOwnerPets] = useState<PetRegistrationRow[]>([]);
  const [selectedPetRegNumber, setSelectedPetRegNumber] = useState<string>("");
  const selectedPet = useMemo(() => {
    const row = ownerPets.find((p) => p.registration_number === selectedPetRegNumber);
    return row ? mapPetRow(row) : null;
  }, [ownerPets, selectedPetRegNumber]);

  const [staffSearch, setStaffSearch] = useState("");
  const [staffSearchResults, setStaffSearchResults] = useState<PetRegistrationRow[]>([]);
  const [selectedStaffPetId, setSelectedStaffPetId] = useState<string>("");
  const selectedStaffPet = useMemo(() => {
    const row = staffSearchResults.find((p) => p.id === selectedStaffPetId);
    return row ? mapPetRow(row) : null;
  }, [selectedStaffPetId, staffSearchResults]);

  const petSnapshot = role === "Staff" ? selectedStaffPet : selectedPet;

  const [lastKnownLocation, setLastKnownLocation] = useState("");
  const [missingAt, setMissingAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(petSnapshot) && Boolean(lastKnownLocation.trim()) && Boolean(missingAt);
  }, [lastKnownLocation, missingAt, petSnapshot]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsAuthLoading(true);
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const userRole = (user.user_metadata?.role as FilingUserRole | undefined) ?? "Owner";
      if (userRole !== "Owner" && userRole !== "Staff") {
        router.replace("/");
        return;
      }

      setRole(userRole);
      setIsAuthLoading(false);

      if (userRole === "Owner") {
        const { data: rows, error } = await supabase
          .from("pets")
          .select(
            "id, photo_url, name, species, breed, color, size, vaccination_details, registration_number, owner_name, owner_contact_number"
          )
          .eq("owner_user_id", user.id)
          .eq("status", "Approved")
          .order("name", { ascending: true });

        if (!mounted) return;
        if (!error) setOwnerPets((rows as PetRegistrationRow[]) ?? []);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function runStaffSearch() {
    const q = staffSearch.trim();
    if (!q) return;

    setIsSearching(true);
    const supabase = getSupabaseClient();
    const { data: rows, error } = await supabase
      .from("pets")
      .select(
        "id, photo_url, name, species, breed, color, size, vaccination_details, registration_number, owner_name, owner_contact_number"
      )
      .or(`registration_number.ilike.%${q}%,owner_name.ilike.%${q}%`)
      .limit(25);

    setIsSearching(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSelectedStaffPetId("");
    setStaffSearchResults((rows as PetRegistrationRow[]) ?? []);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!role || !petSnapshot || !canSubmit) return;

    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    const payload = {
      status: "Pending" as LostPetReportStatus,
      filing_user_role: role,
      last_known_location: lastKnownLocation.trim(),
      missing_at: new Date(missingAt).toISOString(),
      notes: notes.trim() ? notes.trim() : null,
      pet_photo_url: petSnapshot.petPhotoUrl,
      pet_name: petSnapshot.petName,
      species: petSnapshot.species,
      breed: petSnapshot.breed,
      color: petSnapshot.color,
      size: petSnapshot.size,
      vaccination_details: petSnapshot.vaccinationDetails,
      registration_number: petSnapshot.registrationNumber,
      owner_name: petSnapshot.ownerName,
      owner_contact_number: petSnapshot.ownerContactNumber
    };

    const { error } = await supabase.from("lost_pet_reports").insert(payload as never);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Lost pet report submitted for review.");
    router.replace("/lost-pets");
  }

  if (isAuthLoading) {
    return (
      <div className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>Preparing the report form.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: 24 }}>
      <Card>
        <CardHeader>
          <CardTitle>File a Lost Pet Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
            {role === "Owner" ? (
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="petSelect">Select your certified registered pet</Label>
                <Select
                  id="petSelect"
                  value={selectedPetRegNumber}
                  onChange={(e) => setSelectedPetRegNumber(e.target.value)}
                >
                  <option value="">Select a pet...</option>
                  {ownerPets.map((p) => (
                    <option key={p.id} value={p.registration_number}>
                      {p.name} — {p.registration_number}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="staffSearch">Search pet (Reg # or Owner name)</Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Input
                      id="staffSearch"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      placeholder="e.g. BRGY-000123 or Juan Dela Cruz"
                    />
                    <Button type="button" variant="outline" disabled={isSearching} onClick={runStaffSearch}>
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="staffPetSelect">Select a pet from results</Label>
                  <Select
                    id="staffPetSelect"
                    value={selectedStaffPetId}
                    onChange={(e) => setSelectedStaffPetId(e.target.value)}
                    disabled={staffSearchResults.length === 0}
                  >
                    <option value="">
                      {staffSearchResults.length === 0 ? "Search first..." : "Select a pet..."}
                    </option>
                    {staffSearchResults.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.registration_number} — {p.owner_name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            <Card className="bg-[hsl(var(--muted))]">
              <CardHeader>
                <CardTitle className="text-base">Pet & Owner Details (read-only)</CardTitle>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 12 }}>
                {!petSnapshot ? (
                  <div style={{ color: "hsl(var(--muted-foreground))" }}>
                    Select a pet to auto-populate details.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar className="h-14 w-14">
                        {petSnapshot.petPhotoUrl ? (
                          <AvatarImage src={petSnapshot.petPhotoUrl} alt={petSnapshot.petName} />
                        ) : (
                          <AvatarFallback>{petSnapshot.petName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 700 }}>{petSnapshot.petName}</div>
                        <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                          {petSnapshot.species}
                          {petSnapshot.breed ? ` • ${petSnapshot.breed}` : null}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 10
                      }}
                    >
                      <Input readOnly value={petSnapshot.registrationNumber} aria-label="Registration number" />
                      <Input readOnly value={petSnapshot.color ?? ""} placeholder="Color" aria-label="Color" />
                      <Input readOnly value={petSnapshot.size ?? ""} placeholder="Size" aria-label="Size" />
                      <Input
                        readOnly
                        value={petSnapshot.vaccinationDetails ?? ""}
                        placeholder="Vaccination details"
                        aria-label="Vaccination details"
                      />
                      <Input readOnly value={petSnapshot.ownerName} aria-label="Owner name" />
                      <Input
                        readOnly
                        value={petSnapshot.ownerContactNumber ?? ""}
                        placeholder="Owner contact number"
                        aria-label="Owner contact number"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="lastKnownLocation">Last Known Location</Label>
                <Input
                  id="lastKnownLocation"
                  value={lastKnownLocation}
                  onChange={(e) => setLastKnownLocation(e.target.value)}
                  placeholder="Street / landmark / purok"
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="missingAt">Date & Time Pet Went Missing</Label>
                <Input
                  id="missingAt"
                  type="datetime-local"
                  value={missingAt}
                  onChange={(e) => setMissingAt(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Distinguishing marks, collar, behavior, etc."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

