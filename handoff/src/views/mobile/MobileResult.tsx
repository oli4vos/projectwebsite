import { Btn, Pill, CategoryDot } from "../../components/ui";
import { AreaChart } from "../../components/charts";

/**
 * Mobiel — Resultaatscherm. Resultaat boven de vouw, dan key-stats, dan chart,
 * dan link naar tabel. Sticky save-action onderaan.
 */
export function MobileResult() {
  const annu = Array.from({ length: 31 }, () => 1642);
  const lin  = Array.from({ length: 31 }, (_, i) => Math.round(2319 - i * 22));

  const stats: Array<[string, string]> = [
    ["Rente totaal",      "€ 206.120"],
    ["Totaal te betalen", "€ 591.120"],
    ["Maand 1 — rente",   "€ 1.247"],
    ["Maand 360 — rente", "€ 5"],
  ];

  return (
    <div className="h-full bg-[var(--paper)] flex flex-col relative">
      <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[13px]">
        <span className="text-[var(--ink)] font-medium">← Aanpassen</span>
        <span className="text-[var(--muted)]">Resultaat</span>
      </div>

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <CategoryDot cat="hyp" />
          <span className="uppercase tracking-[0.1em]">Annuïteit · 30 jaar</span>
        </div>
        <div className="font-serif text-[36px] tracking-[-0.015em] leading-none mt-3 tabular">€ 1.642</div>
        <div className="text-[12.5px] text-[var(--ink-2)] mt-1.5">
          bruto / mnd · netto na aftrek <span className="font-mono tabular">€ 1.418</span>
        </div>
        <div className="mt-2"><Pill tone="pos">€ 21.408 minder rente dan lineair</Pill></div>
      </div>

      <div className="px-5 mt-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(([l, v], i) => (
            <div key={i} className="bg-white border hair rounded-lg p-3">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--muted)]">{l}</div>
              <div className="font-mono text-[14px] tabular mt-1">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-white border hair rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="font-serif text-[14px]">Maandlast over de tijd</div>
            <div className="flex items-center gap-3 text-[10.5px]">
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-[2px] bg-[oklch(46%_0.07_232)]" />Annu.</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-[2px] bg-[oklch(54%_0.10_152)]" />Lin.</span>
            </div>
          </div>
          <div className="mt-2">
            <AreaChart width={296} height={120} series={[
              { color: "oklch(54% 0.10 152)", points: lin },
              { color: "oklch(46% 0.07 232)", points: annu },
            ]} />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--soft)] tabular mt-1">
            <span>jaar 0</span><span>10</span><span>20</span><span>30</span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 pb-28">
        <a className="text-[12.5px] text-[var(--ink)] underline underline-offset-2">Toon volledige tabel ↓</a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-3 bg-[var(--paper)]/95 backdrop-blur hair-t flex gap-2">
        <Btn kind="outline" size="lg">⌂</Btn>
        <Btn full kind="primary" size="lg">Bewaar deze berekening</Btn>
      </div>
    </div>
  );
}
