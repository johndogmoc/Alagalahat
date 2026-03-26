"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecommendationsPage() {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
            This is a placeholder route to match the reference structure.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

