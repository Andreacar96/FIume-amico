import { createClient } from "@/lib/supabase/server";
import { SectionHead, Card } from "@/components/ui";
import { AddCatchButton } from "@/components/add-catch-button";
import { CatchFilters } from "@/components/catch-filters";

function FishIcon() {
  return (
    <svg viewBox="0 0 64 40" className="w-14 h-14">
      <path
        d="M4 20 C14 4 40 4 54 20 C40 36 14 36 4 20 Z"
        fill="#ffffff"
        opacity="0.9"
      />
      <path d="M54 20 L64 10 L64 30 Z" fill="#ffffff" />
      <circle cx="16" cy="17" r="2" fill="var(--surface)" />
    </svg>
  );
}

export default async function CatturePage({ searchParams }: PageProps<"/catture">) {
  const params = await searchParams;
  const speciesFilter = typeof params.species === "string" ? params.species : "";
  const sort = params.sort === "oldest" ? "oldest" : "recent";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let catchesQuery = supabase
    .from("catches")
    .select("*, fish_species(name), profiles(username), spots(name)")
    .order("caught_at", { ascending: sort === "oldest" })
    .limit(60);
  if (speciesFilter) catchesQuery = catchesQuery.eq("species_id", Number(speciesFilter));

  const [{ data: catches }, { data: species }, { data: spots }] = await Promise.all([
    catchesQuery,
    supabase.from("fish_species").select("*").order("name"),
    supabase.from("spots").select("*").order("name"),
  ]);

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Catture della community"
        description="Le ultime segnalazioni di pesca dei membri."
        action={<AddCatchButton loggedIn={!!user} species={species ?? []} spots={spots ?? []} />}
      />
      <CatchFilters species={species ?? []} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(catches ?? []).map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="h-[120px] flex items-center justify-center bg-gradient-to-br from-primary to-primary-light">
              <FishIcon />
            </div>
            <div className="p-4">
              <h3 className="text-base mb-1">{c.fish_species?.name}</h3>
              <div className="text-[0.83rem] text-text-muted">
                {c.profiles?.username}
                {c.spots?.name && <> · {c.spots.name}</>} · {c.caught_at}
              </div>
              <div className="flex gap-3.5 mt-2.5 text-[0.88rem]">
                {c.weight_kg != null && (
                  <span>
                    Peso <b className="text-primary">{c.weight_kg} kg</b>
                  </span>
                )}
                {c.length_cm != null && (
                  <span>
                    Lunghezza <b className="text-primary">{c.length_cm} cm</b>
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
        {(catches ?? []).length === 0 && (
          <p className="text-text-muted text-sm">
            {speciesFilter
              ? "Nessuna cattura trovata per questa specie."
              : "Nessuna cattura registrata ancora."}
          </p>
        )}
      </div>
    </div>
  );
}
