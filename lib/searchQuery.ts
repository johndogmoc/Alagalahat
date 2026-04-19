/** Strip chars that break PostgREST `or()` / `ilike` filters; cap length. */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .trim()
    .replace(/[%_,()'"]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}
