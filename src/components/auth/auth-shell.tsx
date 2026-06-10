import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="bg-aura flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="animate-fade-up w-full max-w-md">
          <div className="mb-7 text-center">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
            )}
          </div>

          <div className="glass rounded-lg p-6 shadow-elevated">{children}</div>

          {footer && (
            <p className="mt-5 text-center text-sm text-ink-muted">{footer}</p>
          )}
        </div>
      </div>
    </main>
  );
}
