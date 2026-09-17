import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { SectionHead, Card, LinkButton, Button } from "@/components/ui";
import { deletePost } from "./actions";

export default async function AdminBlogPage() {
  const { supabase } = await requireAdmin();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Amministrazione blog"
        description="Crea, pubblica e modifica gli articoli del blog."
        action={<LinkButton href="/admin/blog/new" variant="accent">+ Nuovo articolo</LinkButton>}
      />
      <div className="space-y-3">
        {(posts ?? []).map((p) => (
          <Card key={p.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base">{p.title}</h3>
              <p className="text-sm text-text-muted mt-0.5">
                {p.published ? "Pubblicato" : "Bozza"}
                {p.published_at && <> · {new Date(p.published_at).toLocaleDateString("it-IT")}</>}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/blog/${p.id}`}
                className="inline-flex items-center gap-2 rounded-[3px] px-4 py-2 text-sm font-medium border border-border hover:border-primary"
              >
                Modifica
              </Link>
              <form action={deletePost.bind(null, p.id)}>
                <Button type="submit" variant="ghost">
                  Elimina
                </Button>
              </form>
            </div>
          </Card>
        ))}
        {(posts ?? []).length === 0 && (
          <p className="text-text-muted text-sm">Nessun articolo ancora.</p>
        )}
      </div>
    </div>
  );
}
