import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://barangay-api.hawitsu.xyz";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region");
  const province = searchParams.get("province");

  if (!region || !province) {
    return NextResponse.json({ error: "region and province parameters are required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(region)}/${encodeURIComponent(province)}/municipalities_and_cities`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
