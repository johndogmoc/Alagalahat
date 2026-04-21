import { NextResponse } from "next/server";

import {
  buildFoundReportInsert,
  getFoundThisPetEligibility,
  validateFoundReportPayload
} from "@/lib/server/found-reports";
import { getServerSupabaseClient } from "@/lib/server/supabase";

function isAcceptedUpload(file: File) {
  return file.type === "image/jpeg" || file.type === "image/png";
}

async function cleanupUploadedFiles(supabase: Awaited<ReturnType<typeof getServerSupabaseClient>>, objectPaths: string[]) {
  if (objectPaths.length === 0) {
    return;
  }

  await supabase.storage.from("pet-photos").remove(objectPaths);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: lostPetReportId } = await context.params;
  const supabase = await getServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = authData.user;
  const filteredLookup = await supabase
    .from("lost_pet_reports")
    .select("id, reporter_id, status")
    .eq("id", lostPetReportId)
    .neq("reporter_id", user.id)
    .single();

  const eligibleReport = filteredLookup.data;

  if (!eligibleReport) {
    const fallbackLookup = await supabase
      .from("lost_pet_reports")
      .select("id, reporter_id, status")
      .eq("id", lostPetReportId)
      .single();

    const eligibility = getFoundThisPetEligibility({
      role: user.user_metadata?.role,
      requesterId: user.id,
      report: fallbackLookup.data
    });

    if (eligibility.reason === "original_poster") {
      return NextResponse.json(
        { error: "Original posters cannot submit a found report for their own post." },
        { status: 403 }
      );
    }

    if (eligibility.reason === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot use the Found this Pet workflow." },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: "Lost pet report not found." }, { status: 404 });
  }

  const eligibility = getFoundThisPetEligibility({
    role: user.user_metadata?.role,
    requesterId: user.id,
    report: eligibleReport
  });

  if (!eligibility.allowed) {
    return NextResponse.json(
      { error: "You are not allowed to submit a found report for this post." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("images").filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Please upload at least 1 image." }, { status: 400 });
  }

  if (files.length > 5) {
    return NextResponse.json({ error: "You can upload up to 5 images only." }, { status: 400 });
  }

  for (const file of files) {
    if (!isAcceptedUpload(file)) {
      return NextResponse.json({ error: "Only JPG and PNG images are allowed." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Each image must be 5 MB or smaller." }, { status: 400 });
    }
  }

  const uploadedUrls: string[] = [];
  const uploadedObjectPaths: string[] = [];

  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectPath = `found-reports/${user.id}/${lostPetReportId}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(objectPath, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      await cleanupUploadedFiles(supabase, uploadedObjectPaths);
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    uploadedObjectPaths.push(objectPath);
    const { data: publicUrlData } = supabase.storage.from("pet-photos").getPublicUrl(objectPath);
    uploadedUrls.push(publicUrlData.publicUrl);
  }

  const payload = {
    foundLocation: String(formData.get("foundLocation") ?? ""),
    foundAt: String(formData.get("foundAt") ?? ""),
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    description: String(formData.get("description") ?? ""),
    contactPreference: String(formData.get("contactPreference") ?? "") as
      | "phone"
      | "email"
      | "in_app_chat",
    contactValue: formData.get("contactValue") ? String(formData.get("contactValue")) : null,
    imageUrls: uploadedUrls
  };

  const validation = validateFoundReportPayload(payload);
  if (!validation.isValid) {
    await cleanupUploadedFiles(supabase, uploadedObjectPaths);
    return NextResponse.json(
      { error: "Invalid found report submission.", details: validation.errors },
      { status: 400 }
    );
  }

  const insertPayload = buildFoundReportInsert(lostPetReportId, user.id, payload);
  const { data: inserted, error: insertError } = await supabase
    .from("found_reports")
    .insert(insertPayload)
    .select("id, lost_pet_report_id, reporter_id, status, created_at")
    .single();

  if (insertError) {
    await cleanupUploadedFiles(supabase, uploadedObjectPaths);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ data: inserted }, { status: 201 });
}
