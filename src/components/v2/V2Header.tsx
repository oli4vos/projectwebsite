import Link from "next/link";

export function V2Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--v2-sage)]/10">
      <nav className="v2-container flex items-center justify-between h-16">
        <Link href="/v2" className="flex items-center gap-2">
          <div className="text-xl font-serif font-bold text-[var(--v2-sage)]">
            GRIP v2
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/v2/apps"
            className="v2-small text-[var(--v2-text-secondary)] hover:text-[var(--v2-sage)] transition"
          >
            Tools
          </Link>
          <Link
            href="/kennisbank"
            className="v2-small text-[var(--v2-text-secondary)] hover:text-[var(--v2-sage)] transition"
          >
            Kennisbank
          </Link>
          <Link
            href="/variabelen"
            className="v2-small text-[var(--v2-text-secondary)] hover:text-[var(--v2-sage)] transition"
          >
            Aannames
          </Link>

          {/* Design Switcher */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[var(--v2-sage)]/10">
            <span className="v2-small text-[var(--v2-text-muted)]">Design:</span>
            <Link
              href="/"
              className="v2-small px-2 py-1 rounded-lg text-[var(--v2-text-secondary)] hover:bg-[var(--v2-bg-soft)] transition"
            >
              v1
            </Link>
            <span className="v2-small text-[var(--v2-text-muted)]">/</span>
            <span className="v2-small px-2 py-1 rounded-lg bg-[var(--v2-sage)] text-white">
              v2
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
