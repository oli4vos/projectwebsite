import Link from "next/link";
import { Logo } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="hair-t mt-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 text-[12.5px] text-[var(--muted)] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex items-center gap-4">
          <Logo size={16} />
          <span>Onafhankelijke rekentools voor meer grip, regie en inzicht.</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/#werkwijze" className="hover:text-[var(--ink)]">
            Werkwijze
          </Link>
          <Link href="/#apps" className="hover:text-[var(--ink)]">
            Rekentools
          </Link>
          <Link href="/apps/studieschuld-vs-beleggen" className="hover:text-[var(--ink)]">
            Voorbeeldtool
          </Link>
        </div>
      </div>
    </footer>
  );
}
