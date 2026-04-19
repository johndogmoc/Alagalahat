import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://barangay-api.hawitsu.xyz";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region");
  const province = searchParams.get("province");
  const city = searchParams.get("city");

  if (!region || !province || !city) {
    return NextResponse.json({ error: "region, province, and city parameters are required" }, { status: 400 });
  }

  try {
    // OVERRIDE: If city is City of Butuan, the PSGC API actually stores it under the "City of Butuan" province.
    let fetchProvince = province;
    if (city === "City of Butuan") {
      fetchProvince = "City of Butuan"; 
    }

    const res = await fetch(`${BASE_URL}/${encodeURIComponent(region)}/${encodeURIComponent(fetchProvince)}/${encodeURIComponent(city)}/barangays`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch barangays";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
