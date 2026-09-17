import { createClient } from "@/lib/supabase/server";
import { SectionHead } from "@/components/ui";
import { AddSpotButton } from "@/components/add-spot-button";
import { MappaExplorer } from "@/components/mappa-explorer";

export default async function MappaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: spots } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Mappa degli spot"
        description="Spot segnalati dalla community su fiumi mappati e torrenti fuori mappa."
        action={<AddSpotButton loggedIn={!!user} />}
      />
      <MappaExplorer spots={spots ?? []} />
    </div>
  );
}
