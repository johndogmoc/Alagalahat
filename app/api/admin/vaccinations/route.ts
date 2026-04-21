import { NextResponse } from "next/server";

import { requireAdminVaccinationAccess } from "@/lib/server/admin-features";
import { getServerSupabaseClient } from "@/lib/server/supabase";

export async function POST(request: Request) {
  const supabase = await getServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = requireAdminVaccinationAccess(authData.user.user_metadata?.role);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }

  const body = await request.json();
  const petId = String(body.petId ?? "").trim();
  const vaccineName = String(body.vaccineName ?? "").trim();
  const dateGiven = String(body.dateGiven ?? "").trim();
  const nextDueAt = String(body.nextDueAt ?? "").trim();
  const administeredBy = String(body.administeredBy ?? "").trim();

  if (!petId || !vaccineName || !dateGiven) {
    return NextResponse.json(
      { error: "Pet, vaccine name, and date given are required." },
      { status: 400 }
    );
  }

  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id")
    .eq("id", petId)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("vaccinations")
    .insert({
      pet_id: petId,
      vaccine_name: vaccineName,
      date_given: dateGiven,
      next_due_at: nextDueAt || null,
      administered_by: administeredBy || null
    })
    .select("id, vaccine_name, date_given, next_due_at, administered_by, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ data: inserted }, { status: 201 });
}
