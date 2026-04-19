import { NextResponse } from "next/server";

const BASE_URL = "https://barangay-api.hawitsu.xyz";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/regions`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch regions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
