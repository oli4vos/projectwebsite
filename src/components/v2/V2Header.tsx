"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/v2", label: "Home" },
  { href: "/v2/apps", label: "Tools" },
  { href: "/kennisbank", label: "Kennisbank" },
  { href: "/variabelen", label: "Aannames" },
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

        <Link href="/v2/apps" className="v2-btn v2-btn--dark v2-btn--sm shrink-0">
          Alle tools
        </Link>
      </div>
    </header>
  );
}
