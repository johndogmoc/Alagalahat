"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthShell } from "@/components/AuthShell";
import {
  IconAlertTriangle,
  IconCheck,
  IconClipboard,
  IconClock,
  IconFilter,
  IconPaw,
  IconSearch,
  IconShield,
  IconUser,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  owner_name: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

function makeRegNumber(id: string) {
  const short = id.replace(/-/g, "").slice(0, 10).toUpperCase();
  return `BRGY-${short}`;
}

function getHoursWaiting(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}

function getQueueAgeLabel(createdAt: string) {
  const hours = getHoursWaiting(createdAt);
  if (hours < 1) return "Just submitted";
  if (hours < 24) return `${hours}h in queue`;

  const days = Math.floor(hours / 24);
  return `${days}d in queue`;
}

export default function StaffPetQueuePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<PetRow[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<"All" | PetRow["species"]>("All");
  const [reviewChecks, setReviewChecks] = useState<Record<string, boolean>>({});

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, owner_name, status, created_at")
      .eq("status", "Pending")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      setRows([]);
      setIsLoading(false);
      return;
    }
    setRows((data as PetRow[]) ?? []);
    setReviewChecks({});
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(pet: PetRow) {
    if (!reviewChecks[pet.id]) {
      toast.error("Confirm the review checklist before approving.");
      return;
    }

    if (!window.confirm(`Approve ${pet.name} and assign registration number ${makeRegNumber(pet.id)}?`)) {
      return;
    }

    setMutatingId(pet.id);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("pets")
      .update({ status: "Approved", registration_number: makeRegNumber(pet.id) } as never)
      .eq("id", pet.id);
    setMutatingId(null);
    if (error) return toast.error(error.message);
    toast.success(`Approved ${pet.name}. Registration number ${makeRegNumber(pet.id)} is ready.`);
    await load();
  }

  async function reject(pet: PetRow) {
    if (!reviewChecks[pet.id]) {
      toast.error("Confirm the review checklist before rejecting.");
      return;
    }

    if (!window.confirm(`Reject ${pet.name}? This will remove it from the active review queue.`)) {
      return;
    }

    setMutatingId(pet.id);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("pets").update({ status: "Rejected" } as never).eq("id", pet.id);
    setMutatingId(null);
    if (error) return toast.error(error.message);
    toast.success(`Rejected ${pet.name}.`);
    await load();
  }

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSpecies = speciesFilter === "All" || row.species === speciesFilter;
      const matchesQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.owner_name.toLowerCase().includes(q) ||
        makeRegNumber(row.id).toLowerCase().includes(q);

      return matchesSpecies && matchesQuery;
    });
  }, [rows, searchQuery, speciesFilter]);

  const summary = useMemo(() => {
    const urgent = rows.filter((row) => getHoursWaiting(row.created_at) >= 48).length;
    const ready = rows.filter((row) => reviewChecks[row.id]).length;
    const dogs = rows.filter((row) => row.species === "Dog").length;

    return {
      total: rows.length,
      urgent,
      ready,
      dogs,
    };
  }, [rows, reviewChecks]);

  const summaryCards = [
    {
      key: "pending",
      icon: IconClipboard,
      label: "Pending Cases",
      value: summary.total,
      description: "Records waiting for staff action",
      tone: "primary",
    },
    {
      key: "urgent",
      icon: IconAlertTriangle,
      label: "Needs Attention",
      value: summary.urgent,
      description: "Waiting 48 hours or longer",
      tone: "warning",
    },
    {
      key: "ready",
      icon: IconCheck,
      label: "Ready To Decide",
      value: summary.ready,
      description: "Checklist confirmed by staff",
      tone: "success",
    },
    {
      key: "dogs",
      icon: IconPaw,
      label: "Dogs In Queue",
      value: summary.dogs,
      description: "Quick species snapshot",
      tone: "neutral",
    },
  ] as const;

  return (
    <AuthShell>
      <div className="pet-queue-page">
        <Card className="pet-queue-card pet-queue-card-hero">
          <div className="pet-queue-section">
            <div className="pet-queue-hero-header">
              <div className="pet-queue-hero-copy">
                <div className="pet-queue-kicker">
                  <IconShield size={14} />
                  Strict Review Queue
                </div>
                <h1 className="pet-queue-page-title">Pet Queue</h1>
                <p className="pet-queue-page-copy">
                  Review pending registrations with a stricter approval flow. Each record now
                  requires a confirmed review step before staff can approve or reject it.
                </p>
              </div>

              <div className="pet-queue-hero-action">
                <Button variant="outline" onClick={load} disabled={isLoading} style={{ width: "100%" }}>
                  {isLoading ? "Refreshing..." : "Refresh Queue"}
                </Button>
              </div>
            </div>

            <div className="pet-queue-summary-grid">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.key} className={`pet-queue-summary-card tone-${card.tone}`}>
                    <div className="pet-queue-summary-label">
                      <Icon size={18} />
                      <span>{card.label}</span>
                    </div>
                    <strong>{card.value}</strong>
                    <p>{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="pet-queue-card">
          <div className="pet-queue-section">
            <div className="pet-queue-section-head">
              <h2 className="pet-queue-section-title">
                <IconFilter size={18} />
                <span>Filter Queue</span>
              </h2>
            </div>

            <div className="pet-queue-filter-grid">
              <div className="pet-queue-field">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by pet name, owner, or preview registration number"
                  leftIcon={<IconSearch size={18} />}
                  aria-label="Search pending pet registrations"
                />
              </div>

              <div className="pet-queue-field">
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value as "All" | PetRow["species"])}
                  aria-label="Filter by species"
                  className="pet-queue-select"
                >
                  <option value="All">All species</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Other">Other pets</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pet-queue-card">
          <div className="pet-queue-section">
            <div className="pet-queue-list-header">
              <div className="pet-queue-list-title-wrap">
                <h2 className="pet-queue-list-title">Pending Registrations</h2>
                <p className="pet-queue-list-subtitle">
                  {isLoading
                    ? "Loading pending registrations..."
                    : `Showing ${filteredRows.length} of ${rows.length} pending cases`}
                </p>
              </div>
            </div>

            <div className="pet-queue-scroll-region">
              {isLoading ? (
                <div className="pet-queue-skeleton-grid">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : rows.length === 0 ? (
                <div className="pet-queue-empty-state tone-success">
                  <IconCheck size={32} />
                  <strong>Queue is clear</strong>
                  <p>No pending registrations need staff review right now.</p>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="pet-queue-empty-state tone-primary">
                  <IconSearch size={28} />
                  <strong>No matching records</strong>
                  <p>Try a different search term or switch the species filter.</p>
                </div>
              ) : (
                filteredRows.map((pet) => {
                  const waitingHours = getHoursWaiting(pet.created_at);
                  const isUrgent = waitingHours >= 48;
                  const isReviewed = Boolean(reviewChecks[pet.id]);
                  const isBusy = mutatingId === pet.id;

                  return (
                    <article
                      key={pet.id}
                      className={`pet-queue-item${isReviewed ? " is-reviewed" : ""}${isUrgent ? " is-urgent" : ""}`}
                    >
                      <div className="pet-queue-item-main">
                        <div className="pet-queue-item-copy">
                          <div className="pet-queue-badge-row">
                            <span className="pet-queue-badge tone-primary">
                              <IconClipboard size={14} />
                              Pending
                            </span>
                            <span className={`pet-queue-badge ${isUrgent ? "tone-warning" : "tone-muted"}`}>
                              <IconClock size={14} />
                              {getQueueAgeLabel(pet.created_at)}
                            </span>
                            <span className={`pet-queue-badge ${isReviewed ? "tone-success" : "tone-amber"}`}>
                              <IconShield size={14} />
                              {isReviewed ? "Review confirmed" : "Strict check required"}
                            </span>
                          </div>

                          <div className="pet-queue-item-heading">
                            <h3>{pet.name}</h3>
                            <span>{pet.species}</span>
                          </div>

                          <div className="pet-queue-meta-grid">
                            <div className="pet-queue-meta-row">
                              <IconUser size={16} />
                              <span>Owner: {pet.owner_name}</span>
                            </div>
                            <div className="pet-queue-meta-row">
                              <IconClock size={16} />
                              <span>Submitted: {new Date(pet.created_at).toLocaleString()}</span>
                            </div>
                            <div className="pet-queue-meta-row">
                              <IconClipboard size={16} />
                              <span>Registration preview: {makeRegNumber(pet.id)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pet-queue-actions">
                          <Button
                            variant="outline"
                            asChild
                            href={`/pets/${encodeURIComponent(pet.id)}`}
                            style={{ width: "100%" }}
                          >
                            Review Profile
                          </Button>
                          <Button
                            disabled={isBusy || !isReviewed}
                            onClick={() => approve(pet)}
                            style={{ width: "100%" }}
                          >
                            {isBusy ? "Saving..." : "Approve"}
                          </Button>
                          <Button
                            disabled={isBusy || !isReviewed}
                            variant="destructive"
                            onClick={() => reject(pet)}
                            style={{ width: "100%" }}
                          >
                            {isBusy ? "Saving..." : "Reject"}
                          </Button>
                        </div>
                      </div>

                      <div className="pet-queue-review-gate">
                        <div className="pet-queue-review-title">Review gate</div>
                        <label className="pet-queue-review-check">
                          <input
                            type="checkbox"
                            checked={isReviewed}
                            onChange={(e) => {
                              setReviewChecks((current) => ({ ...current, [pet.id]: e.target.checked }));
                            }}
                          />
                          <span>
                            I reviewed the pet profile, verified the owner details, and I am ready
                            to make a final queue decision for this registration.
                          </span>
                        </label>
                        <p className={`pet-queue-review-note${isReviewed ? " is-reviewed" : ""}`}>
                          {isReviewed
                            ? "Approval and rejection actions are unlocked for this record."
                            : "Approve and Reject stay disabled until the checklist is confirmed."}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        .pet-queue-page,
        .pet-queue-page * {
          box-sizing: border-box;
        }

        .pet-queue-page {
          display: grid;
          gap: 24px;
          width: 100%;
          min-width: 0;
          padding: 0 0 8px;
        }

        .pet-queue-card {
          width: 100%;
          min-width: 0;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(210, 216, 224, 0.88);
          box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
          background: var(--color-card);
          position: relative;
          z-index: 0;
        }

        .pet-queue-card-hero {
          background:
            linear-gradient(180deg, rgba(0, 82, 204, 0.04), rgba(0, 82, 204, 0.01)),
            var(--color-card);
        }

        .pet-queue-section {
          display: grid;
          gap: 24px;
          width: 100%;
          min-width: 0;
          padding: 24px;
        }

        .pet-queue-hero-header,
        .pet-queue-list-header,
        .pet-queue-section-head,
        .pet-queue-item-main {
          display: grid;
          gap: 16px;
          min-width: 0;
        }

        .pet-queue-hero-header {
          grid-template-columns: minmax(0, 1fr) minmax(200px, 240px);
          align-items: start;
        }

        .pet-queue-hero-copy,
        .pet-queue-list-title-wrap,
        .pet-queue-item-copy {
          min-width: 0;
        }

        .pet-queue-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 32px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(0, 82, 204, 0.08);
          color: #0052CC;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .pet-queue-page-title {
          margin: 0;
          font-size: clamp(32px, 3vw, 40px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--color-text);
        }

        .pet-queue-page-copy,
        .pet-queue-list-subtitle,
        .pet-queue-empty-state p,
        .pet-queue-summary-card p,
        .pet-queue-review-note,
        .pet-queue-meta-row {
          margin: 0;
          font-size: 14px;
          line-height: 1.75;
          color: var(--color-text-muted);
        }

        .pet-queue-section-title,
        .pet-queue-list-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: clamp(24px, 2vw, 32px);
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--color-text);
          min-width: 0;
        }

        .pet-queue-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          min-width: 0;
        }

        .pet-queue-summary-card {
          display: grid;
          gap: 12px;
          min-width: 0;
          min-height: 160px;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(210, 216, 224, 0.24);
          overflow: hidden;
          position: relative;
          z-index: 0;
        }

        .pet-queue-summary-card strong {
          display: block;
          font-size: clamp(28px, 3vw, 40px);
          line-height: 1;
          font-weight: 900;
          color: var(--color-text);
        }

        .pet-queue-summary-label {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .pet-queue-summary-label span {
          overflow-wrap: anywhere;
        }

        .pet-queue-summary-card.tone-primary {
          background: linear-gradient(135deg, rgba(0, 82, 204, 0.10), rgba(59, 130, 246, 0.08));
          color: #0052CC;
        }

        .pet-queue-summary-card.tone-warning {
          background: linear-gradient(135deg, rgba(231, 111, 81, 0.12), rgba(245, 158, 11, 0.10));
          color: #E76F51;
        }

        .pet-queue-summary-card.tone-success {
          background: linear-gradient(135deg, rgba(42, 157, 143, 0.12), rgba(46, 204, 113, 0.08));
          color: #2A9D8F;
        }

        .pet-queue-summary-card.tone-neutral {
          background: linear-gradient(135deg, rgba(27, 79, 138, 0.10), rgba(42, 157, 143, 0.08));
          color: #1B4F8A;
        }

        .pet-queue-filter-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
          gap: 16px;
          align-items: stretch;
          min-width: 0;
        }

        .pet-queue-field {
          min-width: 0;
        }

        .pet-queue-select {
          width: 100%;
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid var(--color-border);
          background: var(--color-card);
          color: var(--color-text);
          font-size: 14px;
          line-height: 1.5;
          font-family: inherit;
          outline: none;
        }

        .pet-queue-scroll-region {
          display: grid;
          gap: 16px;
          min-width: 0;
          max-height: min(68vh, 960px);
          padding-right: 4px;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .pet-queue-skeleton-grid {
          display: grid;
          gap: 16px;
        }

        .pet-queue-empty-state {
          display: grid;
          place-items: center;
          gap: 12px;
          min-height: 224px;
          padding: 32px 24px;
          border-radius: 20px;
          text-align: center;
          overflow: hidden;
        }

        .pet-queue-empty-state strong {
          font-size: 28px;
          line-height: 1.2;
          font-weight: 900;
          color: var(--color-text);
        }

        .pet-queue-empty-state.tone-success {
          background: rgba(42, 157, 143, 0.05);
          border: 1px dashed rgba(42, 157, 143, 0.28);
        }

        .pet-queue-empty-state.tone-primary {
          background: rgba(0, 82, 204, 0.04);
          border: 1px dashed rgba(0, 82, 204, 0.22);
        }

        .pet-queue-item {
          display: grid;
          gap: 16px;
          min-width: 0;
          padding: 20px;
          border-radius: 22px;
          border: 1px solid rgba(210, 216, 224, 0.92);
          background: var(--color-card);
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          position: relative;
          z-index: 0;
        }

        .pet-queue-item.is-reviewed {
          border-color: rgba(42, 157, 143, 0.22);
          background: linear-gradient(180deg, rgba(42, 157, 143, 0.05), var(--color-card));
        }

        .pet-queue-item.is-urgent::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 4px;
          background: linear-gradient(180deg, #E76F51, #F59E0B);
        }

        .pet-queue-item-main {
          grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
          align-items: start;
        }

        .pet-queue-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }

        .pet-queue-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 32px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          line-height: 1;
          font-weight: 800;
          max-width: 100%;
        }

        .pet-queue-badge.tone-primary {
          background: rgba(0, 82, 204, 0.08);
          color: #0052CC;
        }

        .pet-queue-badge.tone-warning {
          background: rgba(231, 111, 81, 0.12);
          color: #D95D39;
        }

        .pet-queue-badge.tone-success {
          background: rgba(42, 157, 143, 0.12);
          color: #1F8C80;
        }

        .pet-queue-badge.tone-amber {
          background: rgba(245, 158, 11, 0.12);
          color: #B26A00;
        }

        .pet-queue-badge.tone-muted {
          background: rgba(15, 23, 42, 0.06);
          color: var(--color-text-muted);
        }

        .pet-queue-item-heading {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: baseline;
          min-width: 0;
        }

        .pet-queue-item-heading h3 {
          margin: 0;
          font-size: clamp(22px, 2vw, 28px);
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--color-text);
          overflow-wrap: anywhere;
        }

        .pet-queue-item-heading span {
          font-size: 14px;
          line-height: 1.5;
          font-weight: 700;
          color: var(--color-text-muted);
        }

        .pet-queue-meta-grid {
          display: grid;
          gap: 8px;
          margin-top: 4px;
          min-width: 0;
        }

        .pet-queue-meta-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          min-width: 0;
        }

        .pet-queue-meta-row span,
        .pet-queue-review-check span {
          overflow-wrap: anywhere;
        }

        .pet-queue-actions {
          display: grid;
          gap: 8px;
          min-width: 0;
          align-content: start;
        }

        .pet-queue-review-gate {
          display: grid;
          gap: 12px;
          min-width: 0;
          padding: 16px;
          border-radius: 16px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(210, 216, 224, 0.78);
          overflow: hidden;
        }

        .pet-queue-review-title {
          font-size: 12px;
          line-height: 1.5;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text);
        }

        .pet-queue-review-check {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          min-width: 0;
          font-size: 14px;
          line-height: 1.75;
          color: var(--color-text);
        }

        .pet-queue-review-check input {
          flex-shrink: 0;
          margin: 4px 0 0;
        }

        .pet-queue-review-note.is-reviewed {
          color: #1F8C80;
        }

        @media (max-width: 1120px) {
          .pet-queue-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .pet-queue-page {
            gap: 20px;
          }

          .pet-queue-section {
            padding: 20px;
            gap: 20px;
          }

          .pet-queue-hero-header,
          .pet-queue-filter-grid,
          .pet-queue-item-main {
            grid-template-columns: 1fr;
          }

          .pet-queue-hero-action {
            width: 100%;
          }

          .pet-queue-summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .pet-queue-scroll-region {
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }
        }

        @media (max-width: 560px) {
          .pet-queue-page {
            gap: 16px;
          }

          .pet-queue-section {
            padding: 16px;
            gap: 16px;
          }

          .pet-queue-card {
            border-radius: 20px;
          }

          .pet-queue-summary-grid {
            grid-template-columns: 1fr;
          }

          .pet-queue-summary-card,
          .pet-queue-item,
          .pet-queue-empty-state,
          .pet-queue-review-gate {
            padding: 16px;
          }

          .pet-queue-badge-row,
          .pet-queue-actions {
            gap: 8px;
          }

          .pet-queue-empty-state strong {
            font-size: 24px;
          }
        }
      `}</style>
    </AuthShell>
  );
}
