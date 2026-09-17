import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHead, Card } from "@/components/ui";

function BlogIcon() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34">
      <path
        d="M4 30 Q10 22 16 30 T28 30 T40 30"
        stroke="var(--primary-light)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*, profiles(username)")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Blog"
        description="Articoli tecnici e guide, pubblicati dalla redazione di Acque Dolci."
      />
      <p className="text-[0.82rem] text-text-muted -mt-4 mb-6 border-l-2 border-border pl-2.5">
        Solo gli amministratori possono pubblicare articoli.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(posts ?? []).map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <Link href={`/blog/${p.slug}`}>
              <div className="h-[120px] flex items-center justify-center bg-bg-alt">
                <BlogIcon />
              </div>
              <div className="p-4">
                <h3 className="text-base mb-1">{p.title}</h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">
                  {p.content.slice(0, 140)}
                </p>
                <div className="text-[0.83rem] text-text-muted mt-2.5">
                  {p.profiles?.username}
                </div>
              </div>
            </Link>
          </Card>
        ))}
        {(posts ?? []).length === 0 && (
          <p className="text-text-muted text-sm">Nessun articolo pubblicato ancora.</p>
        )}
      </div>
    </div>
  );
}
