import { cn } from "@/lib/utils";

/** Marque "STAR" — etoile geometrique + wordmark a chasse serree. */
export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 24 24"
        className="size-6 text-accent"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 1.5l2.96 6.32 6.84.86-5.06 4.66 1.36 6.86L12 17.7l-6.06 3.16 1.36-6.86L2.24 9.04l6.84-.86L12 1.5z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      {showWord && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-[0.2em] text-ink">
            PLANNING
          </span>
          <span className="text-[0.65rem] font-medium tracking-[0.42em] text-accent">
            STAR
          </span>
        </span>
      )}
    </span>
  );
}
