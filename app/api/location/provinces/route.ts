import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://barangay-api.hawitsu.xyz";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region");

  if (!region) {
    return NextResponse.json({ error: "region parameter is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(region)}/provinces_and_highly_urbanized_cities`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    let data = await res.json();
    
    // CUSTOM OVERRIDE: Hide "City of Butuan" from the province list so it can be nested inside Agusan del Norte
    if (Array.isArray(data)) {
      data = data.filter((p: string) => p !== "City of Butuan");
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch provinces";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
