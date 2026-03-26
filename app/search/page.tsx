"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MovieCard } from "@/components/MovieCard";

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  const results = useMemo(() => {
    if (!q.trim()) return [];
    // Placeholder dataset — replace with real app search later.
    return [
      { id: "sample-1", title: `Result for: ${q}`, subtitle: "Sample item", tag: "Demo" },
      { id: "sample-2", title: "Another result", subtitle: "Sample item", tag: null }
    ];
  }, [q]);

  return (
    <main className="container" style={{ paddingBlock: 24 }}>
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <div style={{ color: "hsl(var(--muted-foreground))" }}>
            Query: <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{q || "—"}</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {results.length === 0 ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>No results.</div>
            ) : (
              results.map((r) => <MovieCard key={r.id} {...r} />)
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div>
      <Navbar />
      <Suspense
        fallback={
          <main className="container" style={{ paddingBlock: 24, color: "hsl(var(--muted-foreground))" }}>
            Loading search…
          </main>
        }
      >
        <SearchInner />
      </Suspense>
    </div>
  );
}

