"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WatchlistPage() {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
            This is a placeholder route to match the reference structure.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

