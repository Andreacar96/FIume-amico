"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { createSpot } from "@/app/mappa/actions";

export function AddSpotButton({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        + Segnala uno spot
      </Button>
      {open && (
        <Modal
          title="Segnala uno spot"
          hint={
            loggedIn
              ? "Indica le coordinate del punto (puoi leggerle da Google Maps facendo tap prolungato sul punto)."
              : "Devi accedere per segnalare uno spot."
          }
          onClose={() => setOpen(false)}
        >
          {loggedIn ? (
            <form action={createSpot}>
              <Field label="Nome dello spot">
                <Input name="name" required placeholder="Es. Ansa del fiume presso..." />
              </Field>
              <Field label="Fiume o torrente">
                <Input name="water_body_name" required placeholder="Nome del corso d'acqua" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitudine">
                  <Input name="latitude" type="number" step="any" required placeholder="45.123" />
                </Field>
                <Field label="Longitudine">
                  <Input name="longitude" type="number" step="any" required placeholder="7.456" />
                </Field>
              </div>
              <Field label="È su un corso mappato?">
                <Select name="is_mapped_river" defaultValue="true">
                  <option value="true">Sì, fiume/torrente noto</option>
                  <option value="false">No, non presente sulle mappe</option>
                </Select>
              </Field>
              <Field label="Descrizione">
                <Textarea name="description" placeholder="Corrente, fondale, specie presenti..." />
              </Field>
              <Field label="Note di accesso">
                <Textarea name="access_notes" placeholder="Come raggiungerlo..." />
              </Field>
              <div className="flex justify-end gap-2.5 mt-5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" variant="primary">
                  Segnala spot
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
