import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

const features = [
  {
    title: "Segnala uno spot",
    meta: "Su fiumi mappati o su torrenti che non trovi su nessuna mappa.",
  },
  {
    title: "Registra una cattura",
    meta: "Specie, peso, lunghezza e una foto per ogni pesce che tiri fuori.",
  },
  {
    title: "Monitora la temperatura",
    meta: "Segui l'andamento dell'acqua nei tuoi spot durante l'anno.",
  },
  {
    title: "Confrontati",
    meta: "Blog con articoli tecnici e forum per parlare con la community.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  const [{ count: spotsCount }, { count: catchesCount }, { count: tempCount }, { count: threadsCount }] =
    await Promise.all([
      supabase.from("spots").select("*", { count: "exact", head: true }),
      supabase.from("catches").select("*", { count: "exact", head: true }),
      supabase.from("temperature_readings").select("*", { count: "exact", head: true }),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { value: spotsCount ?? 0, label: "Spot segnalati" },
    { value: catchesCount ?? 0, label: "Catture registrate" },
    { value: tempCount ?? 0, label: "Rilievi temperatura" },
    { value: threadsCount ?? 0, label: "Discussioni" },
  ];

  return (
    <>
      <div className="bg-bg-alt pt-14">
        <div className="wrap max-w-[1080px] mx-auto px-6 pb-10 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <h1 className="text-[clamp(2.1rem,4.4vw,3.1rem)] leading-[1.08]">
              Il fiume racconta molto
              <br />a chi sa dove guardare.
            </h1>
            <p className="text-text-muted text-[1.05rem] max-w-[46ch] mt-4">
              Segnala spot, registra le tue catture e la temperatura dell&apos;acqua,
              confrontati con altri pescatori di acqua dolce in tutta Italia.
            </p>
            <div className="flex gap-7 flex-wrap mt-7">
              {stats.map((s) => (
                <div key={s.label}>
                  <b className="font-serif text-[1.6rem] text-primary block">{s.value}</b>
                  <span className="text-[0.85rem] text-text-muted">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap mt-7">
              <Link
                href="/mappa"
                className="inline-flex items-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium bg-primary text-bg hover:bg-primary-light"
              >
                Esplora la mappa
              </Link>
              <Link
                href="/forum"
                className="inline-flex items-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium border border-border hover:border-primary"
              >
                Vai al forum
              </Link>
            </div>
          </div>
          <svg viewBox="0 0 360 300" fill="none" className="w-full h-auto">
            <path d="M40 0 C90 60 20 100 80 160 C140 220 60 260 110 300" stroke="var(--primary-light)" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
            <path d="M180 0 C140 70 230 110 170 180 C120 240 210 260 190 300" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round" />
            <path d="M300 0 C260 50 320 90 270 150 C230 200 300 230 260 300" stroke="var(--moss-light)" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
            <g transform="translate(150,150) rotate(-18)">
              <path d="M0 0 C18 -10 40 -10 58 0 C40 10 18 10 0 0 Z" fill="var(--accent)" />
              <path d="M-14 0 L0 -7 L0 7 Z" fill="var(--accent)" />
            </g>
          </svg>
        </div>
      </div>

      <div className="wrap max-w-[1080px] mx-auto px-6 mt-12 pb-16">
        <div className="mb-7">
          <h2 className="text-2xl">Cosa puoi fare</h2>
          <p className="text-text-muted mt-1.5">
            Quattro strumenti pensati da pescatori, per pescatori d&apos;acqua dolce.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-4">
              <h3 className="text-base mb-1">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.meta}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
