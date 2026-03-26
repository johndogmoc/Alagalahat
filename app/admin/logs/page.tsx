"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

interface LogRow {
  id: string;
  action: string;
  actor_user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminLogsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<LogRow[]>([]);

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, actor_user_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error(error.message);
      setRows([]);
      setIsLoading(false);
      return;
    }
    setRows((data as LogRow[]) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Reports & Logs</CardTitle>
            <Button variant="outline" onClick={load} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : rows.length === 0 ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>
                No activity logs found. (Create `activity_logs` table to enable this.)
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {rows.map((l, idx) => (
                  <div key={l.id} style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{l.action}</div>
                        <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                          {new Date(l.created_at).toLocaleString()}
                          {l.actor_user_id ? ` • Actor: ${l.actor_user_id}` : ""}
                        </div>
                      </div>
                    </div>
                    {l.metadata ? (
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          background: "hsl(var(--muted))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          padding: 12,
                          fontSize: 12
                        }}
                      >
                        {JSON.stringify(l.metadata, null, 2)}
                      </pre>
                    ) : null}
                    {idx !== rows.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

