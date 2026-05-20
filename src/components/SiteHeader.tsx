"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BtnLink, Logo } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";
import { toAnchorId } from "@/lib/anchor-ids";

const navItems = [
  { href: "/#apps", label: "Overzicht" },
  { href: "/#persoonlijk", label: "Persoonlijk" },
  { href: "/#aannames", label: "Aannames" },
] as const;

const headerCategories = Array.from(
  new Set(appRegistry.map((app) => app.category)),
);

function navClassName() {
  return "inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[var(--muted)] transition hover:bg-white/70 hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";
}

function categoryHref(category: string) {
  const categoryToGroupTitle: Record<string, string> = {
    Schulden: "Studieschuld",
    Hypotheek: "Wonen",
    Beleggen: "Sparen & beleggen",
    Belasting: "Belasting",
    Werk: "Werk & ZZP",
    "Persoonlijke financiën": "Persoonlijke financiën",
  };

  const groupTitle = categoryToGroupTitle[category] ?? "Persoonlijke financiën";
  return `/#${toAnchorId(groupTitle, "groep")}`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onToolPage = pathname.startsWith("/apps/");
  const [isMobileCompact, setIsMobileCompact] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      if (window.innerWidth >= 768) {
        setIsMobileCompact(false);
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentY = window.scrollY;

      if (currentY <= 24) {
        setIsMobileCompact(false);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY > lastScrollY.current + 8 && currentY > 84) {
        setIsMobileCompact(true);
      } else if (currentY > 24) {
        setIsMobileCompact(true);
      }

      lastScrollY.current = currentY;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="hair-b sticky top-0 z-20 bg-[rgba(245,241,234,0.78)] backdrop-blur-md">
      <div className="page-shell py-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Naar home"
            className="rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            <Logo size={22} />
          </Link>
          <nav className="hidden items-center gap-2 text-[13.5px] md:flex">
            {headerCategories.map((category) => (
              <Link
                key={category}
                href={categoryHref(category)}
                className={navClassName()}
              >
                {category}
              </Link>
            ))}
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClassName()}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <BtnLink href="/profiel" kind={pathname === "/profiel" ? "outline" : "ghost"} size="sm">
              Mijn profiel
            </BtnLink>
            <BtnLink href="/variabelen" kind={pathname === "/variabelen" ? "outline" : "ghost"} size="sm">
              Variabelen
            </BtnLink>
            <BtnLink href="/#apps" kind={onHome ? "outline" : "ghost"} size="sm">
              Overzicht
            </BtnLink>
            <BtnLink
              href="/apps/studieschuld-vs-beleggen"
              kind={onToolPage ? "outline" : "primary"}
              size="sm"
            >
              Start met voorbeeldwaarden
            </BtnLink>
          </div>
        </div>

        {isMobileCompact ? (
          <>
            <nav className="mt-3 flex min-h-11 items-center gap-2 overflow-x-auto pb-1 text-[13.5px] md:hidden">
              {headerCategories.map((category) => (
                <Link
                  key={category}
                  href={categoryHref(category)}
                  className={`${navClassName()} shrink-0`}
                >
                  {category}
                </Link>
              ))}
            </nav>
            <div className="mt-2 flex items-center justify-between gap-2 md:hidden">
              <BtnLink
                href="/#apps"
                kind={onHome ? "outline" : "ghost"}
                size="sm"
                className="min-w-0 flex-1 justify-center"
              >
                Rekentools
              </BtnLink>
              <BtnLink
                href="/profiel"
                kind={pathname === "/profiel" ? "outline" : "ghost"}
                size="sm"
                className="min-w-0 flex-1 justify-center"
              >
                Mijn profiel
              </BtnLink>
            </div>
          </>
        ) : (
          <>
            <nav className="mt-3 flex min-h-11 items-center gap-2 overflow-x-auto pb-1 text-[13.5px] md:hidden">
              {headerCategories.map((category) => (
                <Link
                  key={category}
                  href={categoryHref(category)}
                  className={`${navClassName()} shrink-0`}
                >
                  {category}
                </Link>
              ))}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${navClassName()} shrink-0`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 grid grid-cols-1 gap-2 md:hidden">
              <BtnLink
                href="/profiel"
                kind={pathname === "/profiel" ? "outline" : "ghost"}
                size="sm"
                className="w-full justify-center"
              >
                Mijn profiel
              </BtnLink>
              <BtnLink
                href="/variabelen"
                kind={pathname === "/variabelen" ? "outline" : "ghost"}
                size="sm"
                className="w-full justify-center"
              >
                Variabelen
              </BtnLink>
              <BtnLink
                href="/#apps"
                kind={onHome ? "outline" : "ghost"}
                size="sm"
                className="w-full justify-center"
              >
                Overzicht
              </BtnLink>
              <BtnLink
                href="/apps/studieschuld-vs-beleggen"
                kind={onToolPage ? "outline" : "primary"}
                size="sm"
                className="w-full justify-center"
              >
                Start met voorbeeldwaarden
              </BtnLink>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
