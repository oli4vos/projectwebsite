import Link from "next/link";

export function V2Footer() {
  return (
    <footer className="v2-section border-t border-[var(--v2-sage)]/10 mt-auto">
      <div className="v2-container">
        <div className="grid v2-grid-cols-2 gap-8 mb-8">
          <div>
            <p className="v2-eyebrow mb-2">Over deze versie</p>
            <p className="v2-body max-w-md">
              Dit is de v2 van Project Site — dezelfde tools, warmer en meer begrijpelijk ontwerp. Alle berekeningen blijven gelijk.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/" className="v2-small text-[var(--v2-sage)] hover:underline">
                Terug naar v1
              </Link>
              <Link href="/over" className="v2-small text-[var(--v2-sage)] hover:underline">
                Over deze site
              </Link>
            </div>
          </div>
          <div>
            <p className="v2-eyebrow mb-2">Navigatie</p>
            <ul className="space-y-2">
              <li>
                <Link href="/v2/apps" className="v2-small text-[var(--v2-text-secondary)] hover:text-[var(--v2-sage)]">
                  Alle tools
                </Link>
              </li>
              <li>
                <Link href="/kennisbank" className="v2-small text-[var(--v2-text-secondary)] hover:text-[var(--v2-sage)]">
                  Kennisbank
                </Link>
              </li>
              <li>
                <Link href="/variabelen" className="v2-small text-[var(--v2-text-secondary)] hover:text-[var(--v2-sage)]">
                  Aannames & bronnen
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--v2-sage)]/10 pt-6">
          <p className="v2-small text-[var(--v2-text-light)]">
            © {new Date().getFullYear()} Project. Geen advies. Jouw cijfers, jouw keuzes.
          </p>
        </div>
      </div>
    </footer>
  );
}
