"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MovieCardProps {
  id: string;
  title: string;
  subtitle?: string | null;
  tag?: string | null;
}

export function MovieCard({ id, title, subtitle, tag }: MovieCardProps) {
  return (
    <Link href={`/movie/${encodeURIComponent(id)}`}>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {tag ? <Badge>{tag}</Badge> : null}
        </CardHeader>
        <CardContent className="text-sm text-[hsl(var(--muted-foreground))]">
          {subtitle ?? "Open details"}
        </CardContent>
      </Card>
    </Link>
  );
}

