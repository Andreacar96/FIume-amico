import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const [{ data: spots }, { data: catches }, { data: readings }, { data: threads }] = await Promise.all([
    supabase.from("spots").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("catches")
      .select("*, fish_species(name)")
      .eq("user_id", user.id)
      .order("caught_at", { ascending: false }),
    supabase
      .from("temperature_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false }),
    supabase.from("forum_threads").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="wrap max-w-[900px] mx-auto px-6 py-10">
      <h1 className="text-2xl">La tua dashboard</h1>
      <p className="text-text-muted mt-1">
        Bentornato, {profile?.username}. Qui trovi tutto quello che hai condiviso con la community.
      </p>
      {profile && (
        <Link href={`/profilo/${profile.username}`} className="text-sm text-primary hover:underline">
          Vedi il tuo profilo pubblico →
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <section>
          <h2 className="text-lg mb-3">I tuoi spot ({(spots ?? []).length})</h2>
          <div className="space-y-2">
            {(spots ?? []).map((s) => (
              <Card key={s.id} className="p-3.5">
                <Link href={`/mappa/${s.id}`} className="font-medium hover:text-primary">
                  {s.name}
                </Link>
                <span className="text-text-muted text-sm"> · {s.water_body_name}</span>
              </Card>
            ))}
            {(spots ?? []).length === 0 && (
              <p className="text-sm text-text-muted">Non hai ancora segnalato spot.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg mb-3">Le tue catture ({(catches ?? []).length})</h2>
          <div className="space-y-2">
            {(catches ?? []).map((c) => (
              <Card key={c.id} className="p-3.5">
                <span className="font-medium">{c.fish_species?.name}</span>
                <span className="text-text-muted text-sm"> · {c.caught_at}</span>
              </Card>
            ))}
            {(catches ?? []).length === 0 && (
              <p className="text-sm text-text-muted">Non hai ancora registrato catture.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg mb-3">I tuoi rilievi ({(readings ?? []).length})</h2>
          <div className="space-y-2">
            {(readings ?? []).map((r) => (
              <Card key={r.id} className="p-3.5">
                <span className="font-medium">{r.water_body_name}</span>
                <span className="text-text-muted text-sm">
                  {" "}
                  · {r.temperature_celsius}°C · {new Date(r.recorded_at).toLocaleDateString("it-IT")}
                </span>
              </Card>
            ))}
            {(readings ?? []).length === 0 && (
              <p className="text-sm text-text-muted">Non hai ancora aggiunto rilievi.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg mb-3">Le tue discussioni ({(threads ?? []).length})</h2>
          <div className="space-y-2">
            {(threads ?? []).map((t) => (
              <Card key={t.id} className="p-3.5">
                <Link href={`/forum/${t.id}`} className="font-medium hover:text-primary">
                  {t.title}
                </Link>
                <span className="text-text-muted text-sm"> · {t.category}</span>
              </Card>
            ))}
            {(threads ?? []).length === 0 && (
              <p className="text-sm text-text-muted">Non hai ancora aperto discussioni.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
