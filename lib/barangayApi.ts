/**
 * Barangay API Client
 * 
 * Uses the official Philippine Barangay API (PSGC-based) from
 * https://github.com/bendlikeabamboo/barangay-api
 * 
 * Provides cascading lookups: Regions → Provinces → Cities → Barangays
 */

const BASE_URL = "https://barangay-api.hawitsu.xyz";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Barangay API error: ${res.status}`);
  return res.json();
}

/** Return all Philippine regions */
export async function getRegions(): Promise<string[]> {
  return apiFetch<string[]>("/regions");
}

/** Return provinces/HUCs under a region */
export async function getProvinces(region: string): Promise<string[]> {
  return apiFetch<string[]>(
    `/${encodeURIComponent(region)}/provinces_and_highly_urbanized_cities`
  );
}

/** Return cities/municipalities under a region + province */
export async function getCities(
  region: string,
  province: string
): Promise<string[]> {
  return apiFetch<string[]>(
    `/${encodeURIComponent(region)}/${encodeURIComponent(province)}/municipalities_and_cities`
  );
}

/** Return barangays under a region + province + city */
export async function getBarangays(
  region: string,
  province: string,
  city: string
): Promise<string[]> {
  return apiFetch<string[]>(
    `/${encodeURIComponent(region)}/${encodeURIComponent(province)}/${encodeURIComponent(city)}/barangays`
  );
}
