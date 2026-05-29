import Link from "next/link";
import { Logo } from "@/components/ui";
import { ENABLE_PROFILE } from "@/lib/feature-flags";

export function SiteFooter() {
  return (
    <footer className="hair-t mt-16">
      <div className="page-shell flex flex-col gap-5 py-6 text-[12.5px] text-[var(--muted)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Logo size={16} />
          <span>Onafhankelijke rekentools voor meer grip, regie en inzicht.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Link
            href="/#apps"
            className="rounded-full px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Overzicht
          </Link>
          {ENABLE_PROFILE ? (
            <Link
              href="/#persoonlijk"
              className="rounded-full px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            >
              Persoonlijk
            </Link>
          ) : null}
          <Link
            href="/kennisbank"
            className="rounded-full px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Kennisbank
          </Link>
          <Link
            href="/#aannames"
            className="rounded-full px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Aannames
          </Link>
          <Link
            href="/apps/studieschuld-vs-beleggen"
            className="rounded-full px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Voorbeeldtool
          </Link>
        </div>
      </div>
    </footer>
  );
}
