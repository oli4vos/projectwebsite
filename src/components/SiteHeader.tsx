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
  return "rounded-[var(--radius-soft)] px-3 py-2 text-[var(--muted)] transition hover:bg-white/70 hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";
}

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onToolPage = pathname.startsWith("/apps/");

  return (
    <header className="hair-b sticky top-0 z-20 bg-[rgba(245,241,234,0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8 sm:py-4 lg:px-10">
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

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <BtnLink
            href="/#apps"
            kind={onHome ? "outline" : "ghost"}
            size="sm"
            className="w-full"
          >
            Overzicht
          </BtnLink>
          <BtnLink
            href="/apps/hypotheek-impact-studieschuld"
            kind={onToolPage ? "outline" : "primary"}
            size="sm"
            className="w-full"
          >
            Start voorbeeld
          </BtnLink>
        </div>
      </div>
    </header>
  );
}
