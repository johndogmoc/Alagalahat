import { NextResponse } from "next/server";

import { requireAdminCertificateAccess } from "@/lib/server/admin-features";
import { getServerSupabaseClient } from "@/lib/server/supabase";

export async function GET(
  _request: Request,
  context: { params: Promise<{ petId: string }> }
) {
  const { petId } = await context.params;
  const supabase = await getServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = requireAdminCertificateAccess(authData.user.user_metadata?.role);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }

  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select(`
      id,
      name,
      species,
      breed,
      color_markings,
      size,
      photo_url,
      registration_number,
      status,
      owner_name,
      owner_contact_number,
      date_of_birth,
      sex,
      spayed_neutered,
      microchip_number,
      created_at
    `)
    .eq("id", petId)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  }

  const { data: vaccinations, error: vaccinationsError } = await supabase
    .from("vaccinations")
    .select("id, vaccine_name, date_given, next_due_at, administered_by")
    .eq("pet_id", petId)
    .order("date_given", { ascending: false });

  if (vaccinationsError) {
    return NextResponse.json({ error: vaccinationsError.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      data: {
        pet,
        vaccinations: vaccinations ?? []
      }
    },
    { status: 200 }
  );
}
