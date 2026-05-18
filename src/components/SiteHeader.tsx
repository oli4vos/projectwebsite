"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BtnLink, Logo } from "@/components/ui";

const navItems = [
  { href: "/#apps", label: "Rekentools" },
  { href: "/#werkwijze", label: "Werkwijze" },
  { href: "/#scenario", label: "Scenario's" },
] as const;

function navClassName() {
  return "inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[var(--muted)] transition hover:bg-white/70 hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";
}

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onToolPage = pathname.startsWith("/apps/");

  return (
    <header className="hair-b sticky top-0 z-20 bg-[rgba(245,241,234,0.78)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            aria-label="Naar home"
            className="rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            <Logo size={22} />
          </Link>
          <nav className="hidden items-center gap-2 text-[13.5px] md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClassName()}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <BtnLink href="/profiel" kind={pathname === "/profiel" ? "outline" : "ghost"} size="sm">
            Mijn profiel
          </BtnLink>
          <BtnLink href="/#apps" kind={onHome ? "outline" : "ghost"} size="sm">
            Overzicht
          </BtnLink>
          <BtnLink
            href="/apps/studieschuld-vs-beleggen"
            kind={onToolPage ? "outline" : "primary"}
            size="sm"
          >
            Open voorbeeldtool
          </BtnLink>
        </div>
      </div>
    </header>
  );
}
