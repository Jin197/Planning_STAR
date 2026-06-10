"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, UserRound } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { AccountType } from "@/lib/types";

const ROLES: {
  value: AccountType;
  label: string;
  icon: typeof Crown;
  body: string;
  perks: string[];
}[] = [
  {
    value: "responsable",
    label: "Responsable de ministere",
    icon: Crown,
    body: "Vous pilotez un ou plusieurs ministeres.",
    perks: [
      "Creer des communautes",
      "Composer les plannings",
      "Affecter & valider les membres",
    ],
  },
  {
    value: "membre",
    label: "Membre",
    icon: UserRound,
    body: "Vous servez au sein des ministeres.",
    perks: [
      "Rejoindre des communautes",
      "Declarer vos disponibilites",
      "Suivre vos evenements",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (!selected) return;
    setLoading(true);

    const supabase = createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ account_type: selected })
          .eq("id", user.id);
      }
    } else {
      sessionStorage.setItem("star_account_type", selected);
    }
    router.push("/communities");
  }

  return (
    <AuthShell
      eyebrow="Une derniere etape"
      title="Quel est votre role ?"
      subtitle="Etes-vous responsable de ministere ou un membre ?"
    >
      <div className="space-y-3">
        {ROLES.map(({ value, label, icon: Icon, body, perks }) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                "group w-full rounded-md border p-4 text-left transition-all duration-200",
                active
                  ? "border-accent/50 bg-accent-soft shadow-glow"
                  : "border-line bg-surface-2 hover:border-white/15"
              )}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md transition-colors",
                    active
                      ? "bg-accent text-canvas"
                      : "bg-white/5 text-ink-muted group-hover:text-ink"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">
                      {label}
                    </span>
                    {active && <Check className="size-4 text-accent" />}
                  </div>
                  <p className="mt-0.5 text-2xs text-ink-muted">{body}</p>
                  <ul className="mt-2.5 space-y-1">
                    {perks.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-1.5 text-2xs text-ink-muted"
                      >
                        <span className="size-1 rounded-full bg-accent/60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}

        <Button
          size="lg"
          className="w-full"
          disabled={!selected}
          loading={loading}
          onClick={confirm}
        >
          Acceder a Planning STAR
        </Button>
      </div>
    </AuthShell>
  );
}
