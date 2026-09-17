import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

export default async function ProfilePage({ params }: PageProps<"/profilo/[username]">) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single();
  if (!profile) notFound();

  const [{ data: spots }, { data: catches }] = await Promise.all([
    supabase.from("spots").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase
      .from("catches")
      .select("*, fish_species(name)")
      .eq("user_id", profile.id)
      .order("caught_at", { ascending: false }),
  ]);

  return (
    <div className="wrap max-w-[820px] mx-auto px-6 py-10">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary text-bg flex items-center justify-center text-xl font-serif">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl">{profile.username}</h1>
          {profile.role === "admin" && (
            <span className="text-xs text-accent border border-accent rounded px-1.5 py-0.5">
              amministratore
            </span>
          )}
        </div>
      </div>
      {profile.bio && <p className="mt-4 max-w-[60ch] text-text-muted">{profile.bio}</p>}

      <section className="mt-10">
        <h2 className="text-lg mb-3">Spot segnalati ({(spots ?? []).length})</h2>
        <div className="space-y-2">
          {(spots ?? []).map((s) => (
            <Card key={s.id} className="p-3.5">
              <span className="font-medium">{s.name}</span>
              <span className="text-text-muted text-sm"> · {s.water_body_name}</span>
            </Card>
          ))}
          {(spots ?? []).length === 0 && <p className="text-sm text-text-muted">Nessuno spot ancora.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg mb-3">Catture registrate ({(catches ?? []).length})</h2>
        <div className="space-y-2">
          {(catches ?? []).map((c) => (
            <Card key={c.id} className="p-3.5">
              <span className="font-medium">{c.fish_species?.name}</span>
              <span className="text-text-muted text-sm"> · {c.caught_at}</span>
            </Card>
          ))}
          {(catches ?? []).length === 0 && <p className="text-sm text-text-muted">Nessuna cattura ancora.</p>}
        </div>
      </section>
    </div>
  );
}
