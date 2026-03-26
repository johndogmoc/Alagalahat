"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LostPetReport } from "@/lib/types/lostPet";
import { LostPetStatusBadge } from "@/components/lost-pets/LostPetStatusBadge";

export interface LostPetAnnouncementCardProps {
  report: LostPetReport;
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function LostPetAnnouncementCard({ report }: LostPetAnnouncementCardProps) {
  const isResolved = report.status === "Resolved";

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isResolved ? "opacity-80 grayscale-[0.6]" : "opacity-100"
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {report.pet.petPhotoUrl ? (
              <AvatarImage src={report.pet.petPhotoUrl} alt={report.pet.petName} />
            ) : (
              <AvatarFallback>{report.pet.petName.slice(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-base">{report.pet.petName}</CardTitle>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              {report.pet.species}
              {report.pet.breed ? ` • ${report.pet.breed}` : null}
              {report.pet.color ? ` • ${report.pet.color}` : null}
              {report.pet.size ? ` • ${report.pet.size}` : null}
            </div>
          </div>
        </div>
        <LostPetStatusBadge status={report.status} />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <div>
              <span className="font-medium">Reg #:</span> {report.pet.registrationNumber}
            </div>
            <div>
              <span className="font-medium">Vaccination:</span>{" "}
              {report.pet.vaccinationDetails ? report.pet.vaccinationDetails : "—"}
            </div>
          </div>

          <div>
            <span className="font-medium">Last known location:</span> {report.lastKnownLocation}
          </div>
          <div>
            <span className="font-medium">Missing since:</span> {formatDateTime(report.missingAt)}
          </div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-sm">
          <div className="font-medium">Owner contact</div>
          <div className="text-[hsl(var(--muted-foreground))]">
            {report.pet.ownerName}
            {report.pet.ownerContactNumber ? ` • ${report.pet.ownerContactNumber}` : null}
          </div>
        </div>

        {report.notes ? (
          <div className="text-sm">
            <div className="font-medium">Notes</div>
            <div className="text-[hsl(var(--muted-foreground))]">{report.notes}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

