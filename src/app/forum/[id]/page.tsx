import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { ReplyForm } from "@/components/reply-form";
import { replyToThread } from "../actions";

export default async function ThreadPage({ params }: PageProps<"/forum/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: thread }, { data: posts }] = await Promise.all([
    supabase.from("forum_threads").select("*, profiles(username)").eq("id", id).single(),
    supabase
      .from("forum_posts")
      .select("*, profiles(username)")
      .eq("thread_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!thread) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="wrap max-w-[760px] mx-auto px-6 py-10">
      <Link href="/forum" className="text-sm text-text-muted hover:text-primary">
        ← Torna al forum
      </Link>
      <div className="mt-3">
        {thread.pinned && (
          <span className="text-[0.7rem] text-accent border border-accent rounded px-1.5 py-0.5 mr-2">
            In evidenza
          </span>
        )}
        <h1 className="text-2xl inline">{thread.title}</h1>
      </div>
      <p className="text-text-muted text-sm mt-1">
        {thread.category} · aperta da {thread.profiles?.username}
      </p>

      <div className="mt-6 space-y-3">
        {(posts ?? []).map((p) => (
          <Card key={p.id} className="p-4">
            <p className="text-[0.85rem] text-text-muted mb-1.5">
              {p.profiles?.username} · {new Date(p.created_at).toLocaleString("it-IT")}
            </p>
            <p className="whitespace-pre-wrap">{p.content}</p>
          </Card>
        ))}
      </div>

      {user ? (
        <ReplyForm action={replyToThread.bind(null, thread.id)} />
      ) : (
        <p className="mt-6 text-sm text-text-muted">
          <Link href="/auth" className="text-primary hover:underline">
            Accedi
          </Link>{" "}
          per rispondere a questa discussione.
        </p>
      )}
    </div>
  );
}
