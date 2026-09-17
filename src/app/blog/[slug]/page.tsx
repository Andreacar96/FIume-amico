import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, profiles(username)")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  return (
    <article className="wrap max-w-[720px] mx-auto px-6 py-10">
      <Link href="/blog" className="text-sm text-text-muted hover:text-primary">
        ← Torna al blog
      </Link>
      <h1 className="text-3xl mt-3">{post.title}</h1>
      <p className="text-text-muted mt-2 text-sm">
        {post.profiles?.username}
        {post.published_at && <> · {new Date(post.published_at).toLocaleDateString("it-IT")}</>}
      </p>
      <div className="mt-6 space-y-4 leading-relaxed">
        {post.content.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
