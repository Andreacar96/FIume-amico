"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";
import type { Profile } from "@/lib/types/database";

const links = [
  { href: "/", label: "Home" },
  { href: "/mappa", label: "Mappa" },
  { href: "/catture", label: "Catture" },
  { href: "/temperature", label: "Temperature" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
];

export function Nav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-bg border-b border-border">
      <div className="wrap flex items-center justify-between gap-4 py-4 max-w-[1080px] mx-auto px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" fill="none" className="w-[30px] h-[30px] shrink-0">
            <path d="M4 20 Q10 12 16 20 T28 20" stroke="var(--primary-light)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M4 25 Q10 19 16 25 T28 25" stroke="var(--moss)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M17 10 c4 0 6 3 6 6 c0 3 -2 5 -6 6 l1.5 -6 z" fill="var(--accent)" />
          </svg>
          <span className="font-serif text-xl font-semibold">Acque Dolci</span>
        </Link>

        <button
          className="md:hidden border border-border rounded-md p-2"
          aria-label="Apri il menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5">
            <line x1="2" y1="5" x2="18" y2="5" stroke="var(--text)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="2" y1="10" x2="18" y2="10" stroke="var(--text)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="2" y1="15" x2="18" y2="15" stroke="var(--text)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <nav
          className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row gap-1 md:gap-1 absolute md:static top-full left-0 right-0 md:top-auto bg-surface-2 md:bg-transparent border-b md:border-0 border-border px-6 md:px-0 py-3 md:py-0 shadow-lg md:shadow-none`}
        >
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded text-[0.95rem] whitespace-nowrap ${
                  active ? "text-primary font-medium" : "text-text-muted hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {profile?.role === "admin" && (
            <Link
              href="/admin/blog"
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded text-[0.95rem] whitespace-nowrap ${
                pathname.startsWith("/admin") ? "text-primary font-medium" : "text-text-muted hover:text-primary"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {profile ? (
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard" className="text-sm text-text-muted hover:text-primary hidden sm:inline">
              {profile.username}
            </Link>
            <form action={signOut}>
              <button className="inline-flex items-center gap-2 rounded-[3px] px-4 py-2 text-sm font-medium border border-border hover:border-primary">
                Esci
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium bg-primary text-bg hover:bg-primary-light shrink-0"
          >
            Accedi
          </Link>
        )}
      </div>
      <svg viewBox="0 0 1200 14" preserveAspectRatio="none" className="block w-full h-3.5">
        <path
          d="M0,6 C150,14 300,0 450,6 C600,12 750,0 900,6 C1050,12 1150,2 1200,6 L1200,14 L0,14 Z"
          fill="var(--bg-alt)"
        />
      </svg>
    </div>
  );
}
