"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui";
import type { FishSpecies } from "@/lib/types/database";

export function CatchFilters({ species }: { species: FishSpecies[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-3 flex-wrap mb-6">
      <Select
        aria-label="Filtra per specie"
        value={searchParams.get("species") ?? ""}
        onChange={(e) => updateParam("species", e.target.value)}
        className="w-auto"
      >
        <option value="">Tutte le specie</option>
        {species.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Ordina"
        value={searchParams.get("sort") ?? "recent"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="w-auto"
      >
        <option value="recent">Più recenti</option>
        <option value="oldest">Meno recenti</option>
      </Select>
    </div>
  );
}
