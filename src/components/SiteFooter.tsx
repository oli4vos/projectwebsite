import Link from "next/link";
import { Logo } from "@/components/ui";
import { ENABLE_PROFILE } from "@/lib/feature-flags";

export function SiteFooter() {
  const footerLinkClassName =
    "inline-flex min-h-11 items-center rounded-lg px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";

  return (
    <footer className="hair-t mt-16">
      <div className="page-shell flex flex-col gap-5 py-6 text-[12.5px] text-[var(--muted)] lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <Logo size={16} />
          <span>Scenario&apos;s voor studieschuld, extra geld en wonen. Geen advies.</span>
        </div>
        <div className="flex flex-wrap gap-6 sm:gap-10">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
              Oriëntatie
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <Link href="/#apps" className={footerLinkClassName}>
                Alle tools
              </Link>
              <Link href="/kennisbank" className={footerLinkClassName}>
                Kennisbank
              </Link>
              <Link href="/#aannames" className={footerLinkClassName}>
                Aannames
              </Link>
              <Link href="/over" className={footerLinkClassName}>
                Over
              </Link>
              {ENABLE_PROFILE ? (
                <Link href="/#persoonlijk" className={footerLinkClassName}>
                  Persoonlijk
                </Link>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
              Direct naar
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <Link href="/apps/duo-maandbedrag" className={footerLinkClassName}>
                DUO-maandbedrag
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
