import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server-side gate for admin-only pages/actions. This is a UX convenience —
// the RLS policies in supabase/migrations are the actual enforcement layer.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/blog");

  return { supabase, user, profile };
}
