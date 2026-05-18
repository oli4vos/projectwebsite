import { Logo, Pill, CategoryDot } from "../../components/ui";
import { CATEGORY_LABEL, type Category } from "../../lib/categories";

/**
 * Mobiel — Dashboard scherm. Layout-richting: 360-400px breed, gestapelde lijst,
 * sticky tab-bar onderaan. Het component vult zijn parent (een phone viewport).
 */
export function MobileDashboard() {
  const cards: Array<[Category, string, string, string, boolean, string?]> = [
    ["hyp",    "Annuïteit of lineair",   "€ 1.642 / mnd", "Hypotheek · 30 jr",     false, undefined],
    ["beleg",  "Rendement vs. spaargeld","+ € 38.214",    "Eindverschil · 20 jr",  true,  "Live"],
    ["studie", "DUO‑maandlast",          "€ 87,40 / mnd", "Sociaal leenstelsel",   false, undefined],
    ["maand",  "Netto besteedbaar",      "€ 1.180",       "Per maand vrij",        false, undefined],
  ];

  return (
    <div className="h-full bg-[var(--paper)] flex flex-col relative">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <Logo size={18} />
        <div className="size-8 rounded-full bg-white border hair grid place-items-center text-[12px]">JV</div>
      </div>

      <div className="px-5 pb-4">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">Goedenavond, Jelle</div>
        <h1 className="font-serif text-[26px] leading-[1.18] tracking-[-0.01em] mt-1.5">
          Vergelijk je <em className="italic text-[var(--muted)]">scenario's</em>.
        </h1>

        <div className="mt-4 flex items-center gap-2 h-10 px-3 bg-white border hair rounded-full">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--muted)]">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span className="text-[13px] text-[var(--soft)]">Zoek een rekentool…</span>
        </div>
      </div>

      <div className="px-5 mt-1">
        <div className="flex items-center gap-2 overflow-hidden mb-3 text-[12px]">
          {([["Alle", true], ["Studieschuld", false], ["Beleggen", false], ["Hypotheek", false]] as const).map(([l, a], i) => (
            <span key={i} className={`h-7 px-3 inline-flex items-center rounded-full ${
              a ? "bg-[var(--deep)] text-[var(--paper)]" : "bg-white border hair text-[var(--muted)]"
            }`}>{l}</span>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3 flex-1 overflow-y-auto pb-28">
        {cards.map(([cat, title, stat, sub, pos, badge], i) => (
          <MobileCard key={i} cat={cat} title={title} stat={stat} sub={sub} pos={pos} badge={badge} />
        ))}
      </div>

      {/* tab bar */}
      <nav className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-2 bg-[var(--paper)]/95 backdrop-blur hair-t">
        <div className="grid grid-cols-4 text-[10.5px] text-[var(--muted)]">
          {([["▣", "Tools", true], ["✦", "Inzichten", false], ["⌃", "Opgeslagen", false], ["☰", "Meer", false]] as const).map(([g, l, a], i) => (
            <div key={i} className={`flex flex-col items-center gap-1 ${a ? "text-[var(--ink)]" : ""}`}>
              <span className="text-[15px]">{g}</span>
              <span className="text-[10.5px] tracking-[0.06em]">{l}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

function MobileCard({ cat, title, stat, sub, pos, badge }: {
  cat: Category; title: string; stat: string; sub: string; pos?: boolean; badge?: string;
}) {
  return (
    <div className="bg-white border hair rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryDot cat={cat} />
          <span className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--muted)]">{CATEGORY_LABEL[cat]}</span>
        </div>
        {badge && <Pill tone="accent">{badge}</Pill>}
      </div>
      <div className="mt-2.5 font-serif text-[18px] leading-[1.15] tracking-[-0.01em]">{title}</div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--soft)]">{sub}</div>
          <div className={`font-mono text-[16px] tabular mt-0.5 ${pos ? "text-[oklch(40%_0.10_152)]" : ""}`}>{stat}</div>
        </div>
        <span className="text-[var(--ink)] text-[16px]">→</span>
      </div>
    </div>
  );
}
