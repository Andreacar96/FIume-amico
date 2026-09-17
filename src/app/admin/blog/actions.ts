"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";

export async function createPost(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageUrl = String(formData.get("cover_image_url") ?? "").trim() || null;
  const published = formData.get("published") === "on";

  if (!title || !content) {
    redirect("/admin/blog/new?error=Titolo+e+contenuto+sono+obbligatori");
  }

  const { error } = await supabase.from("blog_posts").insert({
    author_id: user.id,
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    content,
    cover_image_url: coverImageUrl,
    published,
    published_at: published ? new Date().toISOString() : null,
  });

  if (error) {
    redirect(`/admin/blog/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageUrl = String(formData.get("cover_image_url") ?? "").trim() || null;
  const published = formData.get("published") === "on";

  const { data: existing } = await supabase.from("blog_posts").select("published").eq("id", id).single();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      content,
      cover_image_url: coverImageUrl,
      published,
      published_at: published && !existing?.published ? new Date().toISOString() : undefined,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/blog/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}
