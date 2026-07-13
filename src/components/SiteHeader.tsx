"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BtnLink, Logo } from "@/components/ui";
import { ENABLE_PROFILE } from "@/lib/feature-flags";

const navItems = [
  { href: "/#route", label: "Stappenplan", mobileLabel: "Stappen" },
  { href: "/#apps", label: "Alle tools", mobileLabel: "Tools" },
  { href: "/kennisbank", label: "Kennisbank", mobileLabel: "Kennis" },
  { href: "/variabelen", label: "Aannames", mobileLabel: "Aannames" },
  { href: "/over", label: "Over", mobileLabel: "Over" },
] as const;

function navClassName(active: boolean) {
  return `inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2 text-[13px] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
    active
      ? "bg-white text-[var(--ink)] shadow-paper"
      : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
  }`;
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="hair-b sticky top-0 z-20 bg-[rgba(246,246,244,0.88)] backdrop-blur-md">
      <div className="page-shell py-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Naar home"
            className="inline-flex min-h-11 items-center rounded-lg px-1 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            <Logo size={22} />
          </Link>

          <nav
            aria-label="Hoofdnavigatie"
            className="hidden items-center gap-1 text-[13px] md:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navClassName(pathname === item.href)}
              >
                {item.label}
              </Link>
            ))}
            {ENABLE_PROFILE ? (
              <Link
                href="/profiel"
                className={navClassName(pathname === "/profiel")}
              >
                Profiel
              </Link>
            ) : null}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/v2"
              className="text-[11px] px-2 py-1 rounded text-[var(--muted)] hover:text-[var(--ink)] transition"
              title="Probeer de nieuwe design versie"
            >
              v2 →
            </Link>
            <BtnLink href="/#route" kind="primary" size="sm">
              Begin bij stap 1
            </BtnLink>
          </div>
        </div>

        <nav
          aria-label="Mobiele navigatie"
          className="mt-3 flex min-h-11 items-center gap-2 overflow-x-auto pb-1 text-[13px] md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navClassName(pathname === item.href)}
            >
              {item.mobileLabel}
            </Link>
          ))}
          {ENABLE_PROFILE ? (
            <Link href="/profiel" className={navClassName(pathname === "/profiel")}>
              Profiel
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
