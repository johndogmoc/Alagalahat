"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface HomeSearchProps {
  placeholder?: string;
}

export function HomeSearch({ placeholder = "Search..." }: HomeSearchProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const canGo = useMemo(() => Boolean(q.trim()), [q]);

  function go() {
    if (!canGo) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
      <Button type="button" variant="outline" disabled={!canGo} onClick={go}>
        Search
      </Button>
    </div>
  );
}

