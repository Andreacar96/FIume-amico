"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button, Field, Input } from "@/components/ui";
import { createTemperatureReading } from "@/app/temperature/actions";

export function AddTemperatureButton({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        + Aggiungi rilievo
      </Button>
      {open && (
        <Modal
          title="Aggiungi un rilievo di temperatura"
          hint={loggedIn ? undefined : "Devi accedere per aggiungere un rilievo."}
          onClose={() => setOpen(false)}
        >
          {loggedIn ? (
            <form action={createTemperatureReading}>
              <Field label="Corso d'acqua">
                <Input name="water_body_name" required placeholder="Es. Adige" />
              </Field>
              <Field label="Temperatura (°C)">
                <Input name="temperature_celsius" type="number" step="0.1" required placeholder="14.5" />
              </Field>
              <Field label="Data rilievo">
                <Input name="recorded_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </Field>
              <div className="flex justify-end gap-2.5 mt-5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" variant="primary">
                  Salva rilievo
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
