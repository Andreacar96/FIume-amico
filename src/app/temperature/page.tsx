import { createClient } from "@/lib/supabase/server";
import { SectionHead } from "@/components/ui";
import { AddTemperatureButton } from "@/components/add-temperature-button";
import { TemperatureChart } from "@/components/temperature-chart";
import { buildTemperatureSeries } from "@/lib/temperature-chart";

export default async function TemperaturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: readings } = await supabase
    .from("temperature_readings")
    .select("*")
    .order("recorded_at", { ascending: true });

  const series = buildTemperatureSeries(readings ?? []);

  return (
    <div className="wrap max-w-[1080px] mx-auto px-6 py-10">
      <SectionHead
        title="Temperatura dell'acqua"
        description="Andamento medio mensile rilevato dalla community sui corsi d'acqua più monitorati."
        action={<AddTemperatureButton loggedIn={!!user} />}
      />
      <TemperatureChart series={series} />
    </div>
  );
}
