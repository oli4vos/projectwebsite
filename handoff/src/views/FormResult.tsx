import { Pill, Btn, CategoryDot } from "../components/ui";
import { Field, Slider, Toggle } from "../components/inputs";
import { AreaChart } from "../components/charts";

/**
 * Artboard 4 — Invoerformulier + resultaatblok.
 * Twee-koloms: invoer (links) · resultaten (rechts) — met grote getallen,
 * area-chart en vergelijkingstabel.
 */
export function FormResult() {
  // 30-jr maandlast curves: annuïteit constant, lineair afnemend.
  const annu = Array.from({ length: 31 }, () => 1642);
  const lin  = Array.from({ length: 31 }, (_, i) => Math.round(2319 - i * 22));

  const compare: Array<[string, string, string, string, string]> = [
    ["Maand 1", "1.642", "1.418", "2.319", "1.539"],
    ["Jaar 5",  "1.642", "1.453", "2.040", "1.486"],
    ["Jaar 15", "1.642", "1.526", "1.483", "1.296"],
    ["Jaar 30", "1.642", "1.633", "   642", "   640"],
  ];

  return (
    <div className="w-full h-full bg-[var(--paper)]">
      <header className="flex items-center justify-between px-10 pt-6 pb-5 hair-b">
        <div className="flex items-center gap-3 text-[12.5px] text-[var(--muted)]">
          <a className="text-[var(--ink)]">← Rekentools</a>
          <span className="text-[var(--soft)]">/</span>
          <CategoryDot cat="hyp" />
          <span>Annuïteit of lineair</span>
        </div>
        <div className="flex items-center gap-3">
          <Btn kind="ghost"   size="sm">Opslaan</Btn>
          <Btn kind="outline" size="sm">Exporteer pdf</Btn>
        </div>
      </header>

      <div className="px-10 pt-8 pb-3 flex items-end justify-between hair-b">
        <div>
          <h1 className="font-serif text-[34px] tracking-[-0.01em] leading-[1.1]">Annuïteit of lineair</h1>
          <p className="text-[13.5px] text-[var(--muted)] mt-1.5">€ 385.000 · 30 jaar · 3,89% · belastbaar inkomen € 58.500</p>
        </div>
        <Toggle options={["Annuïteit", "Lineair", "Aflossingsvrij"]} active={0} />
      </div>

      <div className="grid grid-cols-12 gap-8 px-10 py-8">
        {/* Invoer */}
        <aside className="col-span-4 space-y-6">
          <div className="bg-white border hair rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Invoer</div>
              <span className="text-[11px] text-[var(--soft)] tabular">5 velden</span>
            </div>
            <div className="space-y-5">
              <Field big label="Hypotheekbedrag" value="385.000" prefix="€" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rente"    value="3,89" suffix="%" />
                <Field label="Looptijd" value="30"   suffix="jr" />
              </div>
              <Field label="Belastbaar inkomen" value="58.500" prefix="€" suffix="/ jaar" />
              <Slider label="Eigen inleg" min={0} max={100} value={15} suffix=" %" />
              <div>
                <div className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)] mb-2">Rentevaste periode</div>
                <Toggle options={["5 jr", "10 jr", "20 jr", "30 jr"]} active={1} />
              </div>
            </div>
            <div className="mt-6 pt-5 hair-t flex items-center justify-between">
              <a className="text-[12.5px] text-[var(--muted)] underline underline-offset-2">Geavanceerd ↓</a>
              <Btn kind="primary" size="sm">Bereken opnieuw</Btn>
            </div>
          </div>

          <div className="bg-white border hair rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)] mb-2">Aannames</div>
            <ul className="text-[12.5px] text-[var(--ink-2)] space-y-1.5 leading-[1.55]">
              <li className="flex justify-between"><span>Inflatie</span><span className="font-mono tabular text-[var(--muted)]">2,0% / jr</span></li>
              <li className="flex justify-between"><span>Hypotheekrenteaftrek</span><span className="font-mono tabular text-[var(--muted)]">36,93%</span></li>
              <li className="flex justify-between"><span>Eigenwoningforfait</span><span className="font-mono tabular text-[var(--muted)]">0,35%</span></li>
              <li className="flex justify-between"><span>WOZ‑waarde</span><span className="font-mono tabular text-[var(--muted)]">€ 410.000</span></li>
            </ul>
            <a className="text-[12px] underline underline-offset-2 mt-3 inline-block">Aannames aanpassen →</a>
          </div>
        </aside>

        {/* Resultaat */}
        <main className="col-span-8 space-y-6">
          <div className="bg-white border hair rounded-xl p-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Resultaat</div>
                <div className="font-serif text-[44px] tracking-[-0.015em] leading-none mt-3 tabular">
                  € 1.642 <span className="text-[var(--muted)] text-[24px] font-sans"> / maand</span>
                </div>
                <div className="text-[13px] text-[var(--ink-2)] mt-2">
                  Annuïteit, bruto. Netto na renteaftrek: <span className="font-mono tabular">€ 1.418 / maand</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Pill tone="pos">€ 21.408 lager rentebedrag dan lineair</Pill>
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Totaal te betalen</div>
                <div className="font-mono text-[22px] tabular mt-1">€ 591.120</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-x-8 mt-6 pt-5 hair-t">
              <ResultBlock label="Maand 1 — bruto"   value="€ 1.642"   sub="rente € 1.247 · aflossing € 395" />
              <ResultBlock label="Maand 1 — netto"   value="€ 1.418"   sub="na renteaftrek" pos />
              <ResultBlock label="Maand 360 — bruto" value="€ 1.642"   sub="rente € 5 · aflossing € 1.637" />
              <ResultBlock label="Totaal rente"      value="€ 206.120" sub="over 30 jaar" />
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border hair rounded-xl p-7">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Maandlast in de tijd</div>
                <div className="font-serif text-[18px] mt-1">Annuïteit vs. lineair · 360 maanden</div>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-[oklch(46%_0.07_232)]" />Annuïteit</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-[oklch(54%_0.10_152)]" />Lineair</span>
              </div>
            </div>

            <div className="mt-4 relative">
              <AreaChart
                width={620}
                height={220}
                series={[
                  { color: "oklch(54% 0.10 152)", points: lin },
                  { color: "oklch(46% 0.07 232)", points: annu },
                ]}
              />
              <div className="flex items-center justify-between mt-1 axis">
                <span>jaar 0</span><span>jaar 5</span><span>jaar 10</span><span>jaar 15</span>
                <span>jaar 20</span><span>jaar 25</span><span>jaar 30</span>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white border hair rounded-xl overflow-hidden">
            <div className="px-7 py-5 flex items-center justify-between hair-b">
              <div className="font-serif text-[18px]">Vergelijking op vier momenten</div>
              <div className="text-[12px] text-[var(--muted)]">bedragen in euro · bruto / netto na aftrek</div>
            </div>
            <table className="w-full text-[13.5px]">
              <thead className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                <tr className="hair-b">
                  <th className="text-left font-medium px-7 py-3">Moment</th>
                  <th className="text-right font-medium px-3 py-3">Annuïteit bruto</th>
                  <th className="text-right font-medium px-3 py-3">Annuïteit netto</th>
                  <th className="text-right font-medium px-3 py-3">Lineair bruto</th>
                  <th className="text-right font-medium px-7 py-3">Lineair netto</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular text-[13.5px]">
                {compare.map((row, i) => (
                  <tr key={i} className="hair-b last:border-b-0">
                    <td className="text-left px-7 py-3 font-sans text-[13.5px]">{row[0]}</td>
                    {row.slice(1).map((c, j) => (
                      <td key={j} className={`text-right ${j === 3 ? "px-7" : "px-3"} py-3 ${j === 0 ? "" : "text-[var(--ink-2)]"}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-1 pt-2 flex items-start justify-between text-[12px] text-[var(--muted)]">
            <div className="max-w-[460px] leading-[1.55]">
              Berekening gebruikt de NIBUD‑woonquote en het AFM‑rentekader (april 2026).
              Inkomensafhankelijke aftrek volgens tabel Box 1, IB 2026.
              Toon je uitgangspunten? <a className="underline underline-offset-2 text-[var(--ink)]">Bronnen ↗</a>
            </div>
            <div className="text-right tabular">Versie 1.4 · laatst bijgewerkt 11 april 2026</div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ResultBlock({ label, value, sub, pos }: { label: string; value: string; sub: string; pos?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">{label}</div>
      <div className={`font-mono text-[20px] tabular mt-1 ${pos ? "text-[oklch(40%_0.10_152)]" : ""}`}>{value}</div>
      <div className="text-[11px] text-[var(--soft)] tabular mt-0.5">{sub}</div>
    </div>
  );
}
