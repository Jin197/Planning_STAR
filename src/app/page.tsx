import Link from "next/link";
import { ArrowRight, CalendarRange, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: CalendarRange,
    title: "Plannings structures",
    body: "Modeles MLA et Star generes automatiquement. Affectation multi-personnes, disponibilites en temps reel.",
  },
  {
    icon: ShieldCheck,
    title: "Controle des roles",
    body: "Responsables et membres, admins par communaute. Permissions appliquees jusqu'a la base de donnees.",
  },
  {
    icon: Users,
    title: "Communautes",
    body: "MLA, Accueil, Sonorisation, Integration. Demande d'adhesion, validation, messagerie par evenement.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-aura relative min-h-dvh overflow-hidden">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Creer un compte</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 text-center">
        <span className="eyebrow animate-fade-up">
          Service · Musique · Ministeres
        </span>
        <h1 className="animate-fade-up mt-5 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Le planning du service,
          <br />
          <span className="text-accent">orchestre a la perfection.</span>
        </h1>
        <p className="animate-fade-up mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
          Planning STAR centralise la planification de chaque evenement de
          l'eglise. Composez vos equipes, suivez les disponibilites et
          coordonnez vos ministeres avec une precision absolue.
        </p>
        <div className="animate-fade-up mt-9 flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="group">
              Commencer
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/communities">
            <Button size="lg" variant="secondary">
              Explorer les communautes
            </Button>
          </Link>
        </div>
      </section>

      {/* Piliers */}
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-28 sm:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="glass rounded-lg p-6 transition-colors hover:border-white/15"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-2xs text-ink-faint">
          <span>© {new Date().getFullYear()} Planning STAR</span>
          <span className="tnum">v0.1 · Increment 1</span>
        </div>
      </footer>
    </main>
  );
}
