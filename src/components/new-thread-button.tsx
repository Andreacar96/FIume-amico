"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { createThread } from "@/app/forum/actions";
import { FORUM_CATEGORIES } from "@/lib/forum-categories";

export function NewThreadButton({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        + Nuova discussione
      </Button>
      {open && (
        <Modal
          title="Nuova discussione"
          hint={loggedIn ? undefined : "Devi accedere per aprire una discussione."}
          onClose={() => setOpen(false)}
        >
          {loggedIn ? (
            <form action={createThread}>
              <Field label="Categoria">
                <Select name="category" defaultValue={FORUM_CATEGORIES[0]}>
                  {FORUM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Titolo">
                <Input name="title" required placeholder="Di cosa vuoi parlare?" />
              </Field>
              <Field label="Messaggio">
                <Textarea name="message" required placeholder="Scrivi qui..." />
              </Field>
              <div className="flex justify-end gap-2.5 mt-5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" variant="primary">
                  Pubblica discussione
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
