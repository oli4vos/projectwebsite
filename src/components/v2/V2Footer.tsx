import Link from "next/link";

export function V2Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-container space-y-4">
        <p className="max-w-[65ch] text-[var(--v2-ink-soft)]">
          GRIP v2 is een rustige, parallelle presentatie boven op dezelfde
          rekenlogica. De bestaande site blijft ongewijzigd beschikbaar.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[var(--v2-ink)]">
          <Link href="/v2">Home</Link>
          <Link href="/v2/apps">Tools</Link>
          <Link href="/kennisbank">Kennisbank</Link>
          <Link href="/variabelen">Aannames</Link>
        </div>
        <p className="text-[12px] text-[var(--v2-ink-soft)]">
          Geen advies. Gebruik de uitkomsten als scenario-inzicht en controleer
          bron en aannames bij de onderliggende tools.
        </p>
      </div>
    </footer>
  );
}
