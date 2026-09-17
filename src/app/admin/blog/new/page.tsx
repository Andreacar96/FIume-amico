import { requireAdmin } from "@/lib/require-admin";
import { PostForm } from "@/components/post-form";
import { createPost } from "../actions";

export default async function NewPostPage({ searchParams }: PageProps<"/admin/blog/new">) {
  await requireAdmin();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <h1 className="text-2xl mb-6">Nuovo articolo</h1>
      {error && <p className="text-sm text-accent mb-4">{error}</p>}
      <PostForm action={createPost} />
    </div>
  );
}
