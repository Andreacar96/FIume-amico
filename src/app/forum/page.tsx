import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHead, Card } from "@/components/ui";
import { NewThreadButton } from "@/components/new-thread-button";
import { FORUM_CATEGORIES } from "@/lib/forum-categories";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "poco fa";
  if (hours < 24) return `${hours} h fa`;
  const days = Math.floor(hours / 24);
  return `${days} giorn${days === 1 ? "o" : "i"} fa`;
}

export default async function ForumPage({ searchParams }: PageProps<"/forum">) {
  const params = await searchParams;
  const activeCat = typeof params.cat === "string" ? params.cat : "Tutte";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("forum_threads")
    .select("*, profiles(username), forum_posts(count)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (activeCat !== "Tutte") query = query.eq("category", activeCat);

  const { data: threads } = await query;

  const cats = ["Tutte", ...FORUM_CATEGORIES];

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Forum"
        description="Discussioni per genere, tecnica, attrezzatura e normative."
        action={<NewThreadButton loggedIn={!!user} />}
      />
      <div className="flex gap-2.5 flex-wrap mb-6">
        {cats.map((c) => (
          <Link
            key={c}
            href={c === "Tutte" ? "/forum" : `/forum?cat=${encodeURIComponent(c)}`}
            className={`px-4 py-2 border rounded-full text-[0.88rem] ${
              c === activeCat
                ? "bg-primary text-bg border-primary"
                : "bg-surface text-text-muted border-border"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>
      <Card className="px-6">
        {(threads ?? []).length === 0 && (
          <p className="py-5 text-text-muted">Nessuna discussione in questa categoria per ora.</p>
        )}
        {(threads ?? []).map((t, i) => (
          <Link
            key={t.id}
            href={`/forum/${t.id}`}
            className={`flex items-center justify-between gap-4 py-4 ${
              i < (threads?.length ?? 0) - 1 ? "border-b border-border" : ""
            }`}
          >
            <div>
              {t.pinned && (
                <span className="text-[0.7rem] text-accent border border-accent rounded px-1.5 py-0.5 mr-2">
                  In evidenza
                </span>
              )}
              <span className="text-[1rem] font-medium">{t.title}</span>
              <div className="text-[0.82rem] text-text-muted mt-1">
                {t.category} · aperta da {t.profiles?.username}
              </div>
            </div>
            <div className="text-[0.82rem] text-text-muted text-right whitespace-nowrap">
              <b className="block text-text text-base font-medium">
                {(t.forum_posts as unknown as { count: number }[])?.[0]?.count ?? 0}
              </b>
              risposte · {timeAgo(t.created_at)}
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
