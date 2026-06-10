"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const payload = {
      email: String(f.get("email")),
      password: String(f.get("password")),
      nom: String(f.get("nom")),
      prenom: String(f.get("prenom")),
      ministere: String(f.get("ministere")),
      description: String(f.get("description")),
    };

    const supabase = createClient();

    // Mode demo (Supabase non configure) : on memorise et on passe a l'etape role.
    if (!supabase) {
      sessionStorage.setItem("star_pending_profile", JSON.stringify(payload));
      router.push("/onboarding");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          nom: payload.nom,
          prenom: payload.prenom,
          ministere: payload.ministere,
          description: payload.description,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <AuthShell
      eyebrow="Bienvenue"
      title="Creer votre compte"
      subtitle="Renseignez votre identite de service."
      footer={
        <>
          Deja un compte ?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="prenom">Prenom</Label>
            <Input id="prenom" name="prenom" required placeholder="Marie" />
          </div>
          <div>
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" name="nom" required placeholder="Kouassi" />
          </div>
        </div>

        <div>
          <Label htmlFor="ministere">Ministere</Label>
          <Input
            id="ministere"
            name="ministere"
            placeholder="Louange, Accueil…"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Quelques mots sur votre service…"
          />
        </div>

        <div className="h-px bg-line" />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="marie@exemple.fr"
          />
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Continuer
        </Button>
      </form>
    </AuthShell>
  );
}
