"use client";

import { Button, Textarea } from "@/components/ui";

export function ReplyForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="mt-6">
      <Textarea name="content" required placeholder="Scrivi una risposta..." className="mb-3" />
      <Button type="submit" variant="primary">
        Rispondi
      </Button>
    </form>
  );
}
