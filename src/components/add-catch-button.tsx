"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { createCatch } from "@/app/catture/actions";
import type { FishSpecies, Spot } from "@/lib/types/database";

export function AddCatchButton({
  loggedIn,
  species,
  spots,
}: {
  loggedIn: boolean;
  species: FishSpecies[];
  spots: Spot[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        + Registra una cattura
      </Button>
      {open && (
        <Modal
          title="Registra una cattura"
          hint={loggedIn ? undefined : "Devi accedere per registrare una cattura."}
          onClose={() => setOpen(false)}
        >
          {loggedIn ? (
            <form action={createCatch}>
              <Field label="Specie">
                <Select name="species_id" required defaultValue="">
                  <option value="" disabled>
                    Scegli una specie
                  </option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso (kg)">
                  <Input name="weight_kg" type="number" step="0.1" placeholder="1.2" />
                </Field>
                <Field label="Lunghezza (cm)">
                  <Input name="length_cm" type="number" placeholder="38" />
                </Field>
              </div>
              <Field label="Spot (opzionale)">
                <Select name="spot_id" defaultValue="">
                  <option value="">Nessuno spot collegato</option>
                  {spots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Data della cattura">
                <Input name="caught_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </Field>
              <Field label="Note">
                <Textarea name="notes" placeholder="Esca, condizioni, dettagli..." />
              </Field>
              <div className="flex justify-end gap-2.5 mt-5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" variant="primary">
                  Registra cattura
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end gap-2.5 mt-5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Chiudi
              </Button>
              <a href="/auth" className="inline-flex items-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium bg-primary text-bg hover:bg-primary-light">
                Accedi
              </a>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
