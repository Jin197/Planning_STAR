"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, MapPin, Clock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Apercu statique de l'ecran planning (Increment 3 : connecte a Supabase).
const SLOTS: { label: string; people: string[]; state: "full" | "partial" | "empty" }[] = [
  { label: "LEAD", people: ["Marie K.", "David T."], state: "full" },
  { label: "Tenor", people: ["Joel A."], state: "partial" },
  { label: "Alto", people: ["Grace Y."], state: "partial" },
  { label: "Soprano", people: [], state: "empty" },
  { label: "Piano", people: ["Samuel B."], state: "partial" },
  { label: "Batterie", people: [], state: "empty" },
];

const STATE_DOT: Record<string, string> = {
  full: "text-ok",
  partial: "text-warn",
  empty: "text-ink-faint",
};

export default function CommunityPage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/communities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4" />
              Communautes
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Badge tone="accent">MLA</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Mass Choir Adoration
        </h1>

        {/* En-tete d'evenement */}
        <div className="glass mt-7 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="eyebrow">Prochain evenement</span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                Culte de Pentecote
              </h2>
            </div>
            <Badge tone="ok" dot>
              Planning ouvert
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5 tnum">
              <Clock className="size-4 text-ink-faint" />
              sam. 14 juin · 18:30
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-ink-faint" />
              Temple central — Salle principale
            </span>
          </div>
        </div>

        {/* Grille de planning */}
        <div className="mt-6 overflow-hidden rounded-lg border border-line">
          {SLOTS.map((slot, i) => (
            <div
              key={slot.label}
              className={cn(
                "flex items-center gap-4 px-5 py-4",
                i !== SLOTS.length - 1 && "border-b border-line",
                "transition-colors hover:bg-white/[0.02]"
              )}
            >
              <span
                className={cn("text-sm", STATE_DOT[slot.state])}
                aria-hidden
              >
                {slot.state === "full" ? "●" : slot.state === "partial" ? "◐" : "▢"}
              </span>

              <div className="w-40 shrink-0">
                <span className="text-sm font-medium text-ink">{slot.label}</span>
              </div>

              <div className="flex flex-1 flex-wrap gap-1.5">
                {slot.people.length === 0 ? (
                  <span className="text-2xs text-ink-faint">Non pourvu</span>
                ) : (
                  slot.people.map((p) => (
                    <Badge key={p} tone="neutral">
                      {p}
                    </Badge>
                  ))
                )}
              </div>

              <button className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-2xs text-ink-muted transition-colors hover:border-white/15 hover:text-ink">
                Affecter
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-2xs text-ink-faint">
          Apercu statique · la connexion temps reel arrive a l&apos;increment 3.
        </p>
      </div>
    </main>
  );
}
