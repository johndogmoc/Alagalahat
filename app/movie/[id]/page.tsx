"use client";

import { useParams } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div style={{ color: "hsl(var(--muted-foreground))" }}>
              This is a placeholder route to match the reference structure.
            </div>
            <div>
              ID: <span style={{ fontWeight: 700 }}>{id}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

