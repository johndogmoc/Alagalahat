const STORAGE_KEY = "alagalahat_watchlist_report_ids";

export function getWatchlistReportIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function setWatchlistReportIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

/** Returns true if the report is now watched after the toggle. */
export function toggleWatchlistReportId(id: string): boolean {
  const ids = getWatchlistReportIds();
  if (ids.includes(id)) {
    setWatchlistReportIds(ids.filter((i) => i !== id));
    return false;
  }
  setWatchlistReportIds([...ids, id]);
  return true;
}
