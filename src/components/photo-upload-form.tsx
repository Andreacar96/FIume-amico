"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui";

export function PhotoUploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => action(formData))}
      className="flex items-center gap-3 flex-wrap"
    >
      <label className="inline-flex items-center gap-2 rounded-[3px] px-4 py-2 text-sm font-medium border border-border hover:border-primary cursor-pointer">
        {fileName ?? "Scegli una foto"}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      <Button type="submit" variant="accent" disabled={pending || !fileName}>
        {pending ? "Caricamento..." : "Carica foto"}
      </Button>
    </form>
  );
}
