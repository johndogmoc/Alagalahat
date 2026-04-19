/**
 * Barangay API Client
 * 
 * Uses local Next.js API routes that proxy the official Philippine
 * Barangay API (PSGC-based) to avoid CORS issues.
 * 
 * Provides cascading lookups: Regions → Provinces → Cities → Barangays
 */

/** Return all Philippine regions */
export async function getRegions(): Promise<string[]> {
  const res = await fetch("/api/location/regions");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Return provinces/HUCs under a region */
export async function getProvinces(region: string): Promise<string[]> {
  const res = await fetch(`/api/location/provinces?region=${encodeURIComponent(region)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Return cities/municipalities under a region + province */
export async function getCities(
  region: string,
  province: string
): Promise<string[]> {
  const res = await fetch(`/api/location/cities?region=${encodeURIComponent(region)}&province=${encodeURIComponent(province)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Return barangays under a region + province + city */
export async function getBarangays(
  region: string,
  province: string,
  city: string
): Promise<string[]> {
  const res = await fetch(`/api/location/barangays?region=${encodeURIComponent(region)}&province=${encodeURIComponent(province)}&city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
