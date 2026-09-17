import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Tag } from "@/components/ui";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { addSpotPhoto } from "../actions";

export default async function SpotDetailPage({ params }: PageProps<"/mappa/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: spot }, { data: photos }, { data: catches }] = await Promise.all([
    supabase.from("spots").select("*, profiles(username)").eq("id", id).single(),
    supabase.from("spot_photos").select("*").eq("spot_id", id).order("created_at", { ascending: false }),
    supabase
      .from("catches")
      .select("*, fish_species(name), profiles(username)")
      .eq("spot_id", id)
      .order("caught_at", { ascending: false }),
  ]);

  if (!spot) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <Link href="/mappa" className="text-sm text-text-muted hover:text-primary">
        ← Torna alla mappa
      </Link>
      <div className="mt-3 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl">{spot.name}</h1>
          <p className="text-text-muted mt-1">
            {spot.water_body_name}
            {spot.profiles && <> · segnalato da {spot.profiles.username}</>}
          </p>
        </div>
        {!spot.is_mapped_river && <Tag>torrente non mappato</Tag>}
      </div>

      {spot.description && <p className="mt-4 max-w-[70ch]">{spot.description}</p>}
      {spot.access_notes && (
        <p className="mt-3 text-sm text-text-muted max-w-[70ch]">
          <strong className="text-text">Come raggiungerlo:</strong> {spot.access_notes}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg mb-3">Foto</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {(photos ?? []).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.photo_url}
              alt=""
              className="w-full aspect-square object-cover rounded-md border border-border"
            />
          ))}
          {(photos ?? []).length === 0 && (
            <p className="text-sm text-text-muted col-span-full">Nessuna foto ancora.</p>
          )}
        </div>
        {user && <PhotoUploadForm action={addSpotPhoto.bind(null, spot.id)} />}
      </section>

      <section className="mt-10">
        <h2 className="text-lg mb-3">Catture in questo spot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(catches ?? []).map((c) => (
            <Card key={c.id} className="p-4">
              <h3 className="text-base">{c.fish_species?.name}</h3>
              <p className="text-sm text-text-muted mt-1">
                {c.profiles?.username} · {c.caught_at}
              </p>
            </Card>
          ))}
          {(catches ?? []).length === 0 && (
            <p className="text-sm text-text-muted">Nessuna cattura registrata qui ancora.</p>
          )}
        </div>
      </section>
    </div>
  );
}
