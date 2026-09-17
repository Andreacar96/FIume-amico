import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { PostForm } from "@/components/post-form";
import { updatePost } from "../actions";

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <h1 className="text-2xl mb-6">Modifica articolo</h1>
      {error && <p className="text-sm text-accent mb-4">{error}</p>}
      <PostForm post={post} action={updatePost.bind(null, post.id)} />
    </div>
  );
}
