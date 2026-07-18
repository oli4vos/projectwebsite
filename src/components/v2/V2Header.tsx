"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { ENABLE_PROFILE } from "@/lib/feature-flags";

const navItems = [
  { href: "/v2", label: "Home" },
  { href: "/v2/apps", label: "Tools" },
  { href: "/v2/kennisbank", label: "Kennisbank" },
  { href: "/v2/variabelen", label: "Aannames" },
  { href: "/v2/over", label: "Over" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/v2/apps") {
    return pathname.startsWith("/v2/apps");
  }

  return pathname === href;
}

export function V2Header() {
  const pathname = usePathname();

  return (
    <header className="v2-header">
      <div className="mx-auto flex w-full max-w-[72rem] items-center justify-between gap-4">
        <Link href="/v2" className="v2-logo">
          Grip <span className="v2-logo-tld">v2</span>
        </Link>

        <nav aria-label="Hoofdnavigatie" className="v2-nav flex flex-wrap justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <VersionSwitcher currentVersion="v2" />
          {ENABLE_PROFILE ? (
            <Link href="/v2/profiel" className="v2-btn v2-btn--sm shrink-0">
              Profiel
            </Link>
          ) : null}
          <Link href="/v2/apps" className="v2-btn v2-btn--dark v2-btn--sm shrink-0">
            Alle tools
          </Link>
        </div>
      </div>
    </header>
  );
}
