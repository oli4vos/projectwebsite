import Link from "next/link";
import { BtnLink, Logo } from "@/components/ui";

export function SiteHeader() {
  return (
    <header className="hair-b sticky top-0 z-20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Naar home">
            <Logo size={22} />
          </Link>
          <nav className="hidden items-center gap-6 text-[13.5px] text-[var(--muted)] md:flex">
            <Link href="/#apps" className="hover:text-[var(--ink)]">
              Rekentools
            </Link>
            <Link href="/#werkwijze" className="hover:text-[var(--ink)]">
              Werkwijze
            </Link>
            <Link href="/#scenario" className="hover:text-[var(--ink)]">
              Scenario&apos;s
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <BtnLink href="/#apps" kind="ghost" size="sm">
            Overzicht
          </BtnLink>
          <BtnLink href="/apps/studieschuld-vs-beleggen" kind="primary" size="sm">
            Open voorbeeldtool
          </BtnLink>
        </div>
      </div>
    </header>
  );
}
