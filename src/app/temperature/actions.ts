"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTemperatureReading(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const waterBodyName = String(formData.get("water_body_name") ?? "").trim();
  const temperature = Number(formData.get("temperature_celsius"));
  const recordedAtDate = String(formData.get("recorded_at") ?? "");

  if (!waterBodyName || Number.isNaN(temperature)) {
    redirect("/temperature?error=Compila+tutti+i+campi");
  }

  const { error } = await supabase.from("temperature_readings").insert({
    user_id: user.id,
    water_body_name: waterBodyName,
    temperature_celsius: temperature,
    recorded_at: recordedAtDate ? new Date(recordedAtDate).toISOString() : new Date().toISOString(),
  });

  if (error) {
    redirect(`/temperature?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/temperature");
  revalidatePath("/");
  redirect("/temperature");
}
