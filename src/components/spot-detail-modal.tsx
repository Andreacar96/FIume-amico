"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/modal";
import { Button, Tag } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { Spot, SpotPhoto } from "@/lib/types/database";

export function SpotDetailModal({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const [photos, setPhotos] = useState<SpotPhoto[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("spot_photos")
      .select("*")
      .eq("spot_id", spot.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setPhotos(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [spot.id]);

  return (
    <Modal title={spot.name} hint={spot.water_body_name} onClose={onClose}>
      {!spot.is_mapped_river && <Tag>torrente non mappato</Tag>}
      {spot.description && <p className="text-sm mt-3">{spot.description}</p>}
      {spot.access_notes && (
        <p className="text-sm text-text-muted mt-2">
          <strong className="text-text">Come raggiungerlo:</strong> {spot.access_notes}
        </p>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Foto</h4>
        {photos === null ? (
          <p className="text-sm text-text-muted">Caricamento foto...</p>
        ) : photos.length === 0 ? (
          <p className="text-sm text-text-muted">Nessuna foto ancora.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.photo_url}
                alt=""
                className="w-full aspect-square object-cover rounded-md border border-border"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2.5 mt-5">
        <Link href={`/mappa/${spot.id}`} className="text-sm text-primary hover:underline">
          Apri la pagina completa →
        </Link>
        <Button type="button" variant="ghost" onClick={onClose}>
          Chiudi
        </Button>
      </div>
    </Modal>
  );
}
