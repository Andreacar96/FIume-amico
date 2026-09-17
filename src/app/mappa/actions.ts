"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSpot(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const name = String(formData.get("name") ?? "").trim();
  const waterBodyName = String(formData.get("water_body_name") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const isMappedRiver = formData.get("is_mapped_river") === "true";
  const description = String(formData.get("description") ?? "").trim() || null;
  const accessNotes = String(formData.get("access_notes") ?? "").trim() || null;

  if (!name || !waterBodyName || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    redirect("/mappa?error=Compila+tutti+i+campi+obbligatori");
  }

  const { error } = await supabase.from("spots").insert({
    user_id: user.id,
    name,
    water_body_name: waterBodyName,
    latitude,
    longitude,
    is_mapped_river: isMappedRiver,
    description,
    access_notes: accessNotes,
  });

  if (error) {
    redirect(`/mappa?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/mappa");
  revalidatePath("/");
  redirect("/mappa");
}

export async function addSpotPhoto(spotId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${spotId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("spot-photos").upload(path, file);
  if (uploadError) {
    redirect(`/mappa/${spotId}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("spot-photos").getPublicUrl(path);

  const { error } = await supabase.from("spot_photos").insert({
    spot_id: spotId,
    photo_url: publicUrl,
    uploaded_by: user.id,
  });
  if (error) {
    redirect(`/mappa/${spotId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/mappa/${spotId}`);
}
