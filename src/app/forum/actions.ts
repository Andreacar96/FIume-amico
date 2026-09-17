"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FORUM_CATEGORIES } from "@/lib/forum-categories";

export async function createThread(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!title || !message || !FORUM_CATEGORIES.includes(category as (typeof FORUM_CATEGORIES)[number])) {
    redirect("/forum?error=Compila+tutti+i+campi");
  }

  const { data: thread, error } = await supabase
    .from("forum_threads")
    .insert({ user_id: user.id, category, title })
    .select()
    .single();

  if (error || !thread) {
    redirect(`/forum?error=${encodeURIComponent(error?.message ?? "Errore")}`);
  }

  await supabase.from("forum_posts").insert({ thread_id: thread.id, user_id: user.id, content: message });

  revalidatePath("/forum");
  revalidatePath("/");
  redirect(`/forum/${thread.id}`);
}

export async function replyToThread(threadId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const { error } = await supabase.from("forum_posts").insert({ thread_id: threadId, user_id: user.id, content });
  if (error) {
    redirect(`/forum/${threadId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/forum/${threadId}`);
}
