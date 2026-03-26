"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LostPetReportStatus } from "@/lib/types/lostPet";

export interface LostPetStatusBadgeProps {
  status: LostPetReportStatus;
  className?: string;
}

export function LostPetStatusBadge({ status, className }: LostPetStatusBadgeProps) {
  const styles: Record<LostPetReportStatus, string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-900",
    Active: "border-emerald-200 bg-emerald-50 text-emerald-900",
    Resolved: "border-blue-200 bg-blue-50 text-blue-900",
    Archived: "border-zinc-200 bg-zinc-50 text-zinc-800"
  };

  return <Badge className={cn(styles[status], className)}>{status}</Badge>;
}

