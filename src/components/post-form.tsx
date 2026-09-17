"use client";

import { Button, Field, Input, Textarea } from "@/components/ui";
import type { BlogPost } from "@/lib/types/database";

export function PostForm({
  post,
  action,
}: {
  post?: BlogPost;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-[640px]">
      <Field label="Titolo">
        <Input name="title" required defaultValue={post?.title} />
      </Field>
      <Field label="URL immagine di copertina (opzionale)">
        <Input name="cover_image_url" defaultValue={post?.cover_image_url ?? ""} placeholder="https://..." />
      </Field>
      <Field label="Contenuto">
        <Textarea name="content" required rows={12} className="min-h-64!" defaultValue={post?.content} />
      </Field>
      <label className="flex items-center gap-2 text-sm mb-5">
        <input type="checkbox" name="published" defaultChecked={post?.published} />
        Pubblicato
      </label>
      <Button type="submit" variant="primary">
        {post ? "Salva modifiche" : "Crea articolo"}
      </Button>
    </form>
  );
}
