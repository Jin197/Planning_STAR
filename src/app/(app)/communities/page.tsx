"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  COMMUNITY_TYPE_LABELS,
  type AccountType,
  type CommunityType,
} from "@/lib/types";

type DirectoryItem = {
  id: string;
  name: string;
  type: CommunityType;
  description: string;
  responsable: string;
  members: number;
  joined?: boolean;
  pending?: boolean;
};

// Donnees de demonstration (remplacees par Supabase une fois configure).
const DEMO: DirectoryItem[] = [
  {
    id: "1",
    name: "Mass Choir Adoration",
    type: "mla",
    description: "Choeur principal du culte dominical.",
    responsable: "Marie Kouassi",
    members: 28,
    joined: true,
  },
  {
    id: "2",
    name: "Equipe Accueil",
    type: "accueil",
    description: "Accueil et orientation des fideles.",
    responsable: "David Tano",
    members: 16,
    pending: true,
  },
  {
    id: "3",
    name: "Regie Son",
    type: "sonorisation",
    description: "Sonorisation et captation des cultes.",
    responsable: "Joel Amani",
    members: 9,
  },
  {
    id: "4",
    name: "Pole Integration",
    type: "integration",
    description: "Suivi des nouveaux arrivants.",
    responsable: "Grace Yao",
    members: 12,
  },
];

const TYPE_TONE: Record<CommunityType, "accent" | "ok" | "warn" | "neutral"> = {
  mla: "accent",
  accueil: "ok",
  sonorisation: "warn",
  integration: "neutral",
  autre: "neutral",
};

export default function CommunitiesPage() {
  const [accountType, setAccountType] = useState<AccountType>("membre");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(DEMO);

  useEffect(() => {
    const stored = sessionStorage.getItem("star_account_type") as AccountType | null;
    if (stored) setAccountType(stored);
  }, []);

  const filtered = items.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function requestJoin(id: string) {
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pending: true } : c))
    );
  }

  return (
    <main className="min-h-dvh">
      {/* App header */}
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Badge tone={accountType === "responsable" ? "accent" : "neutral"} dot>
              {accountType === "responsable" ? "Responsable" : "Membre"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Titre + actions */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Annuaire</span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              Communautes
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Rejoignez un ministere ou consultez vos plannings.
            </p>
          </div>

          {accountType === "responsable" && (
            <Link href="/communities/new">
              <Button>
                <Plus className="size-4" />
                Creer une communaute
              </Button>
            </Link>
          )}
        </div>

        {/* Recherche */}
        <div className="relative mt-7 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une communaute…"
            className="pl-9"
          />
        </div>

        {/* Grille */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="group flex flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-white/15"
            >
              <div className="flex items-center justify-between">
                <Badge tone={TYPE_TONE[c.type]}>
                  {COMMUNITY_TYPE_LABELS[c.type]}
                </Badge>
                <span className="tnum text-2xs text-ink-faint">
                  {c.members} membres
                </span>
              </div>

              <h2 className="mt-3 text-base font-semibold tracking-tight text-ink">
                {c.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                {c.description}
              </p>
              <p className="mt-3 text-2xs text-ink-faint">
                Responsable · <span className="text-ink-muted">{c.responsable}</span>
              </p>

              <div className="mt-5 flex-1" />

              {c.joined ? (
                <Link href={`/communities/${c.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ouvrir
                  </Button>
                </Link>
              ) : c.pending ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className={cn("w-full border border-line")}
                >
                  Demande envoyee
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => requestJoin(c.id)}
                >
                  Demande d&apos;ajout
                </Button>
              )}
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-sm text-ink-muted">
            Aucune communaute ne correspond a « {query} ».
          </div>
        )}
      </div>
    </main>
  );
}
