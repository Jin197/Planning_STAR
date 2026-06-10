"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  COMMUNITY_TYPE_LABELS,
  MLA_TEMPLATE,
  STAR_TEMPLATE,
  type CommunityType,
} from "@/lib/types";

export default function NewCommunityPage() {
  const router = useRouter();
  const [type, setType] = useState<CommunityType>("mla");
  const [loading, setLoading] = useState(false);

  const preview = type === "mla" ? MLA_TEMPLATE : STAR_TEMPLATE;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Increment 3 : appel Supabase insert communities (le trigger seed le planning).
    setTimeout(() => router.push("/communities"), 600);
  }

  return (
    <main className="min-h-dvh">
      <header className="border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/communities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <span className="eyebrow">Nouvelle communaute</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Creer une communaute
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Le modele de planning est genere automatiquement selon le type choisi.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Formulaire */}
          <form
            onSubmit={onSubmit}
            className="glass space-y-4 rounded-lg p-6"
          >
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" required placeholder="Mass Choir Adoration" />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as CommunityType)}
              >
                {(
                  Object.keys(COMMUNITY_TYPE_LABELS) as CommunityType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {COMMUNITY_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Role et mission de la communaute…"
              />
            </div>

            <div>
              <Label htmlFor="responsable">Nom de la responsable</Label>
              <Input
                id="responsable"
                name="responsable"
                placeholder="Marie Kouassi"
              />
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Creer la communaute
            </Button>
          </form>

          {/* Apercu du modele de planning */}
          <aside className="rounded-lg border border-line bg-surface-2 p-5">
            <div className="flex items-center gap-2 text-ink">
              <Info className="size-4 text-accent" />
              <span className="text-sm font-semibold tracking-tight">
                Modele genere
              </span>
            </div>
            <p className="mt-1.5 text-2xs text-ink-muted">
              {type === "mla"
                ? "Le planning MLA contient ces postes (modifiables ensuite)."
                : "Postes Star de depart (ajout illimite ensuite)."}
            </p>
            <ul className="mt-4 space-y-1.5">
              {preview.map((label, i) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-ink-muted"
                >
                  <span className="tnum w-5 text-2xs text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
