"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Button } from "@/components/ui";

export function WaterBodySearch({ allBodies }: { allBodies: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const selected = (searchParams.get("corsi") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function updateSelected(next: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set("corsi", next.join(","));
    else params.delete("corsi");
    router.push(`${pathname}?${params.toString()}`);
  }

  function addBody(name: string) {
    const match = allBodies.find((b) => b.toLowerCase() === name.trim().toLowerCase());
    setQuery("");
    if (!match || selected.includes(match)) return;
    updateSelected([...selected, match]);
  }

  function removeBody(name: string) {
    updateSelected(selected.filter((b) => b !== name));
  }

  return (
    <div className="mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addBody(query);
        }}
        className="flex gap-2 max-w-sm"
      >
        <Input
          list="water-bodies"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un corso d'acqua da mostrare..."
        />
        <datalist id="water-bodies">
          {allBodies.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        <Button type="submit" variant="ghost">
          Aggiungi
        </Button>
      </form>
      {selected.length > 0 ? (
        <div className="flex gap-2 flex-wrap mt-3">
          {selected.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => removeBody(b)}
              className="text-xs px-2.5 py-1 rounded-full bg-primary text-bg flex items-center gap-1.5"
            >
              {b}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted mt-2">
          Nessun corso d&apos;acqua selezionato: vengono mostrati quelli più monitorati.
        </p>
      )}
    </div>
  );
}
