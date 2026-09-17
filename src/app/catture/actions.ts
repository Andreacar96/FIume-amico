"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCatch(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const speciesId = Number(formData.get("species_id"));
  const weightRaw = formData.get("weight_kg");
  const lengthRaw = formData.get("length_cm");
  const spotId = String(formData.get("spot_id") ?? "") || null;
  const caughtAt = String(formData.get("caught_at") ?? "") || new Date().toISOString().slice(0, 10);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!speciesId) {
    redirect("/catture?error=Seleziona+una+specie");
  }

  const { error } = await supabase.from("catches").insert({
    user_id: user.id,
    species_id: speciesId,
    weight_kg: weightRaw ? Number(weightRaw) : null,
    length_cm: lengthRaw ? Number(lengthRaw) : null,
    spot_id: spotId,
    caught_at: caughtAt,
    notes,
  });

  if (error) {
    redirect(`/catture?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/catture");
  revalidatePath("/");
  redirect("/catture");
}
