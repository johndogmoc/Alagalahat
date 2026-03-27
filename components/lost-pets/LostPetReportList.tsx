"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { LostPetStatusBadge } from "@/components/lost-pets/LostPetStatusBadge";
import { getSupabaseClient } from "@/lib/supabase";
import type { FilingUserRole, LostPetReport, LostPetReportStatus, LostPetRegistrationSnapshot } from "@/lib/types/lostPet";

interface LostPetReportRow {
  id: string;
  status: LostPetReportStatus;
  last_known_location: string;
  missing_at: string;
  notes: string | null;
  filing_user_role: FilingUserRole;
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

function fmt(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function LostPetReportList() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<LostPetReport[]>([]);

  const [editing, setEditing] = useState<LostPetReport | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editMissingAt, setEditMissingAt] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);

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

      const role = (user.user_metadata?.role as FilingUserRole | undefined) ?? "Owner";
      if (role !== "Admin") {
        router.replace("/");
        return;
      }

      setIsAuthLoading(false);
      await refresh();
    }

    async function refresh() {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      const { data: rows, error } = await supabase
        .from("lost_pet_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        toast.error(error.message);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const grouped = useMemo(() => reports, [reports]);

  async function refresh() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data: rows, error } = await supabase
      .from("lost_pet_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    setReports((rows as LostPetReportRow[]).map(mapRowToReport));
    setIsLoading(false);
  }

  async function updateStatus(id: string, status: LostPetReportStatus) {
    setIsMutatingId(id);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("lost_pet_reports")
      .update({ status } as never)
      .eq("id", id);
    setIsMutatingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Status updated to ${status}.`);
    await refresh();
  }

  function openEdit(report: LostPetReport) {
    setEditing(report);
    setEditLocation(report.lastKnownLocation);
    setEditMissingAt(report.missingAt.slice(0, 16));
    setEditNotes(report.notes ?? "");
  }

  async function saveEditAndApprove() {
    if (!editing) return;
    const id = editing.id;

    setIsSavingEdit(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("lost_pet_reports")
      .update({
        last_known_location: editLocation.trim(),
        missing_at: new Date(editMissingAt).toISOString(),
        notes: editNotes.trim() ? editNotes.trim() : null,
        status: "Active" as LostPetReportStatus
      } as never)
      .eq("id", id);
    setIsSavingEdit(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Report updated and approved.");
    setEditing(null);
    await refresh();
  }

  if (isAuthLoading) return null;

  return (
    <div className="container" style={{ paddingBlock: 24 }}>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Lost Pet Reports</CardTitle>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div style={{ color: "hsl(var(--muted-foreground))" }}>Loading reports...</div>
          ) : grouped.length === 0 ? (
            <div style={{ color: "hsl(var(--muted-foreground))" }}>No reports yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {grouped.map((r, idx) => (
                <div key={r.id} style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 700 }}>
                          {r.pet.petName}{" "}
                          <span style={{ fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
                            ({r.pet.species})
                          </span>
                        </div>
                        <LostPetStatusBadge status={r.status} />
                      </div>
                      <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                        Reg #: {r.pet.registrationNumber} • Owner: {r.pet.ownerName}
                        {r.pet.ownerContactNumber ? ` • ${r.pet.ownerContactNumber}` : null}
                      </div>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>Last known:</span> {r.lastKnownLocation} •{" "}
                        <span style={{ fontWeight: 600 }}>Missing:</span> {fmt(r.missingAt)}
                      </div>
                      {r.notes ? (
                        <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{r.notes}</div>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Button
                        disabled={isMutatingId === r.id}
                        onClick={() => updateStatus(r.id, "Active")}
                        variant={r.status === "Active" ? "outline" : "primary"}
                      >
                        Approve
                      </Button>
                      <Button disabled={isMutatingId === r.id} variant="outline" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                      <Button
                        disabled={isMutatingId === r.id}
                        variant="outline"
                        onClick={() => updateStatus(r.id, "Resolved")}
                      >
                        Mark as Resolved
                      </Button>
                      <Button
                        disabled={isMutatingId === r.id || r.status !== "Resolved"}
                        variant="ghost"
                        onClick={() => updateStatus(r.id, "Archived")}
                      >
                        Archive
                      </Button>
                    </div>
                  </div>

                  {idx !== grouped.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => (open ? null : setEditing(null))}>
        {editing ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit report before approving</DialogTitle>
              <DialogDescription>
                Update key details, then approve to publish as an announcement.
              </DialogDescription>
            </DialogHeader>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="editLocation">Last Known Location</Label>
                <Input
                  id="editLocation"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Street / landmark / purok"
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="editMissingAt">Date & Time Pet Went Missing</Label>
                <Input
                  id="editMissingAt"
                  type="datetime-local"
                  value={editMissingAt}
                  onChange={(e) => setEditMissingAt(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditing(null)} disabled={isSavingEdit}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEditAndApprove} disabled={isSavingEdit}>
                {isSavingEdit ? "Saving..." : "Save & Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

