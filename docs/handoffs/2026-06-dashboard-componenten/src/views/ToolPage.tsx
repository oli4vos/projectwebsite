import { Logo, Pill, Btn, CategoryDot } from "../components/ui";
import { Field, Slider } from "../components/inputs";

/**
 * Artboard 3 — Individuele rekentoolpagina.
 * Layout: breadcrumb → hero → 2-koloms (invoer / tussenstand + context) → footer.
 */
export function ToolPage() {
  return (
    <div className="w-full h-full bg-[var(--paper)]">
      <header className="flex items-center justify-between px-10 pt-6 pb-5 hair-b bg-[var(--paper)]">
        <div className="flex items-center gap-10">
          <Logo size={22} />
          <nav className="flex items-center gap-7 text-[13.5px]">
            <a className="text-[var(--muted)]">Rekentools</a>
            <a className="text-[var(--muted)]">Inzichten</a>
            <a className="text-[var(--muted)]">Hulp & uitleg</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Btn kind="ghost"   size="sm">Opslaan</Btn>
          <Btn kind="outline" size="sm">Deel</Btn>
          <Btn kind="primary" size="sm">Account</Btn>
        </div>
      </header>

      <div className="px-10 pt-8 pb-7 grid grid-cols-12 gap-8 hair-b">
        <div className="col-span-8">
          <div className="text-[12px] text-[var(--muted)] tabular">
            <span>Rekentools</span>
            <span className="mx-2 text-[var(--soft)]">/</span>
            <span className="inline-flex items-center gap-1.5"><CategoryDot cat="hyp" />Hypotheek</span>
            <span className="mx-2 text-[var(--soft)]">/</span>
            <span className="text-[var(--ink)]">Annuïteit of lineair</span>
          </div>
          <h1 className="font-serif text-[42px] tracking-[-0.02em] leading-[1.12] mt-4">
            Annuïteit of lineair: <em className="italic text-[var(--muted)]">wat past bij jou?</em>
          </h1>
          <p className="text-[15px] leading-[1.6] text-[var(--ink-2)] mt-4 max-w-[640px]">
            Beide hypotheekvormen kosten over 30 jaar ongeveer evenveel. Maar het verschil <em>in maandlast</em>,
            <em> aflostempo</em> en <em>renteaftrek</em> bepaalt welke vorm bij jou past.
            Vul je gegevens in — wij rekenen beide vormen tegelijk.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <Pill>3 min.</Pill>
            <Pill>Bron: AFM, NIBUD 2026</Pill>
            <Pill>Laatst herzien · 04‑2026</Pill>
          </div>
        </div>

        <aside className="col-span-4 bg-white border hair rounded-xl p-5">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Op deze pagina</div>
          <ol className="mt-3 space-y-2 text-[13.5px]">
            <li className="flex items-center justify-between"><span className="text-[var(--ink)]">1 · Je gegevens</span><span className="text-[var(--soft)] font-mono tabular">↓</span></li>
            <li className="flex items-center justify-between text-[var(--muted)]"><span>2 · Resultaat naast elkaar</span><span className="text-[var(--soft)] font-mono tabular">↓</span></li>
            <li className="flex items-center justify-between text-[var(--muted)]"><span>3 · Maandlast in de tijd</span><span className="text-[var(--soft)] font-mono tabular">↓</span></li>
            <li className="flex items-center justify-between text-[var(--muted)]"><span>4 · Aannames en bronnen</span><span className="text-[var(--soft)] font-mono tabular">↓</span></li>
          </ol>
          <div className="mt-5 pt-5 hair-t flex items-center justify-between">
            <div className="text-[12px] text-[var(--muted)]">Geschatte tijd</div>
            <div className="font-mono text-[13px] tabular">±  3 min.</div>
          </div>
        </aside>
      </div>

      <div className="px-10 pt-8 pb-3 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Stap 1 van 2</div>
          <h2 className="font-serif text-[26px] tracking-[-0.01em] mt-1">Je gegevens</h2>
        </div>
        <div className="text-[12.5px] text-[var(--muted)]">Velden zonder * zijn optioneel · alleen lokaal opgeslagen</div>
      </div>

      <section className="px-10 pb-10 grid grid-cols-12 gap-8">
        <div className="col-span-7 bg-white border hair rounded-xl p-7">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Hypotheekbedrag *" value="385.000" prefix="€" />
            <Field label="Looptijd" value="30" suffix="jaar" />
            <Field label="Rente *" value="3,89" suffix="% nominaal" hint="10 jaar vast" />
            <Field label="Belastbaar inkomen" value="58.500" prefix="€" hint="bruto, jaar" />
          </div>
          <div className="mt-7">
            <Slider label="Looptijd" min={10} max={30} value={30} suffix=" jaar" />
          </div>
          <div className="mt-7">
            <Slider label="Eigen inleg (aflossingsvrij gedeelte)" min={0} max={50} value={0} suffix=" %" />
          </div>

          <div className="mt-7 pt-6 hair-t flex items-center justify-between">
            <div className="text-[12.5px] text-[var(--muted)]">Wijzigingen worden direct doorgerekend.</div>
            <div className="flex items-center gap-2">
              <Btn kind="ghost"   size="sm">Velden wissen</Btn>
              <Btn kind="primary" size="md">Bekijk resultaat</Btn>
            </div>
          </div>
        </div>

        <aside className="col-span-5 space-y-5">
          <div className="bg-[var(--deep)] text-[var(--paper)] rounded-xl p-6">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[oklch(78%_0.02_232)]">Tussenstand</div>
            <div className="flex items-baseline gap-4 mt-3">
              <div>
                <div className="text-[11px] tracking-[0.06em] uppercase text-[oklch(78%_0.02_232)]">Annuïteit</div>
                <div className="font-mono text-[28px] tabular mt-1">€ 1.642</div>
                <div className="text-[11px] text-[oklch(72%_0.02_232)]">/ mnd bruto</div>
              </div>
              <div className="w-px h-12 bg-white/15 mx-2" />
              <div>
                <div className="text-[11px] tracking-[0.06em] uppercase text-[oklch(78%_0.02_232)]">Lineair</div>
                <div className="font-mono text-[28px] tabular mt-1">€ 2.319</div>
                <div className="text-[11px] text-[oklch(72%_0.02_232)]">/ mnd in maand 1</div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 text-[12px] text-[oklch(80%_0.01_232)] leading-relaxed">
              Verschil maand 1: <span className="font-mono tabular text-[var(--paper)]">€ 677</span> · over 30 jr. betaalt lineair
              <span className="font-mono tabular text-[var(--paper)]"> € 21.408</span> minder rente.
            </div>
          </div>

          <div className="bg-white border hair rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="size-[34px] rounded-full bg-[var(--accent-soft)] grid place-items-center text-[oklch(40%_0.07_232)] font-serif italic">i</div>
              <div>
                <div className="text-[13px] font-medium">Twijfel je tussen twee vormen?</div>
                <p className="text-[12.5px] text-[var(--muted)] mt-1 leading-[1.55]">
                  Voor inkomens onder modaal is annuïteit meestal gunstiger door de hogere renteaftrek in de eerste jaren.
                </p>
                <a className="text-[12.5px] underline underline-offset-2 mt-2 inline-block">Lees de toelichting →</a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border hair rounded-xl p-4">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">NHG‑grens 2026</div>
              <div className="font-mono text-[16px] tabular mt-1">€ 435.000</div>
            </div>
            <div className="bg-white border hair rounded-xl p-4">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">Box 1 tarief (1e schijf)</div>
              <div className="font-mono text-[16px] tabular mt-1">36,93%</div>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-10 py-6 hair-t flex items-center justify-between text-[12px] text-[var(--muted)] bg-[var(--paper)]">
        <span>Olivier · rekentool 04 / 18</span>
        <a className="underline underline-offset-2">Twijfel je? Praat met een onafhankelijke adviseur →</a>
      </footer>
    </div>
  );
}
