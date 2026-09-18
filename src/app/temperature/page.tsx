import { createClient } from "@/lib/supabase/server";
import { SectionHead } from "@/components/ui";
import { AddTemperatureButton } from "@/components/add-temperature-button";
import { TemperatureChart } from "@/components/temperature-chart";
import { WaterBodySearch } from "@/components/water-body-search";
import { buildTemperatureSeries, distinctWaterBodies } from "@/lib/temperature-chart";

export default async function TemperaturePage({ searchParams }: PageProps<"/temperature">) {
  const params = await searchParams;
  const corsiParam = typeof params.corsi === "string" ? params.corsi : "";
  const selected = corsiParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: readings } = await supabase
    .from("temperature_readings")
    .select("*")
    .order("recorded_at", { ascending: true });

  const allReadings = readings ?? [];
  const series = buildTemperatureSeries(allReadings, { only: selected });

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Temperatura dell'acqua"
        description="Andamento medio mensile rilevato dalla community sui corsi d'acqua più monitorati."
        action={<AddTemperatureButton loggedIn={!!user} />}
      />
      <WaterBodySearch allBodies={distinctWaterBodies(allReadings)} />
      <TemperatureChart series={series} />
    </div>
  );
}
