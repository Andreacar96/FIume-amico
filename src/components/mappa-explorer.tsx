"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Tag } from "@/components/ui";
import { SpotDetailModal } from "@/components/spot-detail-modal";
import type { Spot } from "@/lib/types/database";

// Rough bounding box for continental Italy, used only for the placeholder
// map when no Google Maps API key is configured.
const ITALY_BOUNDS = { minLat: 36.5, maxLat: 47.1, minLng: 6.6, maxLng: 18.6 };

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - ITALY_BOUNDS.minLng) / (ITALY_BOUNDS.maxLng - ITALY_BOUNDS.minLng)) * w;
  const y = h - ((lat - ITALY_BOUNDS.minLat) / (ITALY_BOUNDS.maxLat - ITALY_BOUNDS.minLat)) * h;
  return { x, y };
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function GoogleMap({
  spots,
  selectedId,
  onSelect,
}: {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<string, google.maps.Marker>>(new Map());
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && !!window.google?.maps);

  useEffect(() => {
    if (!apiKey || loaded) return;
    const existing = document.getElementById("gmaps-script");
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 42.5, lng: 12.5 },
        zoom: 5.5,
        mapId: "acque-dolci-map",
      });
    }
    markers.current.forEach((m) => m.setMap(null));
    markers.current.clear();

    spots.forEach((s) => {
      const marker = new google.maps.Marker({
        position: { lat: s.latitude, lng: s.longitude },
        map: mapInstance.current!,
        title: s.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: s.is_mapped_river ? "#c97a3a" : "#5c7c4f",
          fillOpacity: 1,
          strokeColor: "#fbfaf5",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelect(s.id));
      markers.current.set(s.id, marker);
    });
  }, [loaded, spots, onSelect]);

  useEffect(() => {
    if (!selectedId) return;
    const spot = spots.find((s) => s.id === selectedId);
    if (spot && mapInstance.current) {
      mapInstance.current.panTo({ lat: spot.latitude, lng: spot.longitude });
    }
  }, [selectedId, spots]);

  if (!apiKey) return null;
  return <div ref={mapRef} className="w-full h-[420px] rounded" />;
}

function PlaceholderMap({
  spots,
  selectedId,
  onSelect,
}: {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const w = 480;
  const h = 520;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <rect x={0} y={0} width={w} height={h} fill="var(--bg-alt)" rx={6} />
      {spots.map((s) => {
        const { x, y } = project(s.latitude, s.longitude, w, h);
        const selected = s.id === selectedId;
        return (
          <g
            key={s.id}
            transform={`translate(${x},${y})`}
            className="cursor-pointer"
            onClick={() => onSelect(s.id)}
          >
            <circle
              r={selected ? 8 : 6}
              fill={s.is_mapped_river ? "var(--accent)" : "var(--moss)"}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <text x={9} y={4} fontSize={9} fill="var(--text-muted)">
              {s.water_body_name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MappaExplorer({ spots }: { spots: Spot[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalSpot, setModalSpot] = useState<Spot | null>(null);

  function openSpot(id: string) {
    setSelectedId(id);
    setModalSpot(spots.find((s) => s.id === id) ?? null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-7 items-start">
      <Card className="p-2.5">
        {apiKey ? (
          <GoogleMap spots={spots} selectedId={selectedId} onSelect={openSpot} />
        ) : (
          <PlaceholderMap spots={spots} selectedId={selectedId} onSelect={openSpot} />
        )}
        <div className="flex gap-4 mt-2.5 text-[0.82rem] text-text-muted flex-wrap px-1 pb-1">
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent mr-1.5 align-middle" />
            Spot su corso mappato
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-moss mr-1.5 align-middle" />
            Torrente non mappato
          </span>
        </div>
        {!apiKey && (
          <p className="text-xs text-text-muted px-1 pb-1">
            Mappa dimostrativa: imposta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY per la mappa reale.
          </p>
        )}
      </Card>

      <div>
        {spots.length === 0 && (
          <p className="text-text-muted text-sm">Nessuno spot segnalato ancora. Sii il primo!</p>
        )}
        {spots.map((s) => {
          const selected = s.id === selectedId;
          return (
            <div
              key={s.id}
              onClick={() => openSpot(s.id)}
              className={`bg-surface border border-border px-4.5 py-4 mb-3 rounded-sm border-l-[3px] cursor-pointer ${
                selected ? "border-l-accent bg-surface-2" : "border-l-primary-light"
              }`}
            >
              <h3 className="text-base">{s.name}</h3>
              <div className="text-[0.85rem] text-text-muted mt-1">{s.water_body_name}</div>
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {!s.is_mapped_river && <Tag>torrente non mappato</Tag>}
              </div>
            </div>
          );
        })}
      </div>

      {modalSpot && <SpotDetailModal spot={modalSpot} onClose={() => setModalSpot(null)} />}
    </div>
  );
}
