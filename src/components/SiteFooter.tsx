import Link from "next/link";
import { Logo } from "@/components/ui";

export function SiteFooter() {
  const footerLinkClassName =
    "inline-flex min-h-11 items-center rounded-lg px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";

  return (
    <footer className="hair-t mt-16">
      <div className="page-shell flex flex-col gap-4 py-6 text-[12.5px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Logo size={16} />
          <span>Rekentools voor studieschuld en wonen.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Link href="/apps" className={footerLinkClassName}>
            Alle tools
          </Link>
          <Link href="/variabelen" className={footerLinkClassName}>
            Aannames
          </Link>
          <Link href="/over" className={footerLinkClassName}>
            Over
          </Link>
        </div>
      </div>
    </footer>
  );
}
