import { CategoryDot, Pill, Btn } from "../components/ui";
import { Sparkline } from "../components/charts";
import { ToolCard } from "../components/ToolCard";

/**
 * Artboard 2 — App-card varianten + anatomie.
 * Gebruik dit als referentie voor je componentbibliotheek-pagina (Storybook,
 * Ladle, eigen styleguide, etc.).
 */
export function CardSpecs() {
  return (
    <div className="w-full h-full bg-[var(--paper)] p-10">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Component · v1.0</div>
        <h2 className="font-serif text-[32px] tracking-[-0.01em] mt-2">App‑card</h2>
        <p className="text-[13.5px] text-[var(--muted)] mt-1 max-w-[560px]">
          Vijf staten van dezelfde kaart. Telkens consistent in opbouw: categorie · titel · korte uitleg · resultaatstrook.
        </p>
      </header>

      {/* Anatomie + default */}
      <section className="grid grid-cols-12 gap-8 mb-10">
        <div className="col-span-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">01 · Standaard</div>
          <ToolCard
            cat="hyp"
            title="Annuïteit of lineair: wat past?"
            blurb="Zie de bruto- en netto-maandlast naast elkaar, jaar voor jaar."
            stat="€ 1.642 / mnd"
            statLabel="Annuïteit, 30 jr"
          />
        </div>

        <div className="col-span-7 relative">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">Anatomie</div>
          <div className="relative bg-white border hair rounded-xl p-6 shadow-paper">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryDot cat="hyp" />
                <span className="text-[11px] tracking-[0.06em] uppercase text-[var(--muted)]">Hypotheek</span>
              </div>
              <Pill>Populair</Pill>
            </div>
            <h3 className="font-serif mt-4 text-[22px] leading-[1.15] tracking-[-0.01em]">Annuïteit of lineair: wat past?</h3>
            <p className="text-[13.5px] leading-[1.55] text-[var(--muted)] mt-2">Zie de bruto- en netto-maandlast naast elkaar, jaar voor jaar.</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">Voorbeeld</div>
                <div className="font-mono text-[18px] tabular mt-1">€ 1.642 / mnd</div>
              </div>
              <span className="text-[13px] font-medium">Openen →</span>
            </div>

            <Annotation top="6%"  left="92%" label="① Categorie‑dot + label" />
            <Annotation top="34%" left="92%" label="② Titel (Source Serif, 22/26)" />
            <Annotation top="55%" left="92%" label="③ Toelichting (Geist, 13.5, max 2 regels)" />
            <Annotation top="84%" left="92%" label="④ Voorbeeldresultaat + CTA" />
            <Annotation top="6%"  left="-2%" label="⓪ Badge (optioneel)" align="right" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6 mb-10">
        {/* 02 — Hover */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">02 · Hover</div>
          <div className="relative bg-white rounded-xl shadow-paper-lg border hair p-6 -translate-y-0.5 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryDot cat="beleg" />
                <span className="text-[11px] tracking-[0.06em] uppercase text-[var(--muted)]">Beleggen</span>
              </div>
              <Pill tone="accent">Live data</Pill>
            </div>
            <h3 className="font-serif mt-4 text-[22px] leading-[1.15]">Rendement vs. spaargeld</h3>
            <p className="text-[13.5px] leading-[1.55] text-[var(--muted)] mt-2 line-clamp-2">
              Vergelijk indexfondsen met spaarrente over 20 jaar.
            </p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">Eindverschil</div>
                <div className="font-mono text-[18px] tabular mt-1 text-[oklch(40%_0.10_152)]">+ € 38.214</div>
              </div>
              <span className="text-[13px] font-semibold underline underline-offset-4">Openen →</span>
            </div>
          </div>
        </div>

        {/* 03 — Compact lijst */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">03 · Compact (in lijst)</div>
          <div className="bg-white rounded-xl border hair">
            {([
              ["studie","DUO‑maandlast na herziening","€ 87,40/mnd"],
              ["hyp","Maximale hypotheek 2026","€ 412.000"],
              ["beleg","Maandinleg‑effect","€ 154.812"],
              ["maand","Netto besteedbaar","€ 1.180"],
            ] as const).map(([c, t, v], i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hair-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <CategoryDot cat={c} />
                  <span className="text-[13.5px]">{t}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12.5px] tabular text-[var(--muted)]">{v}</span>
                  <span className="text-[var(--soft)] text-[13px]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 04 — Donker / aanbevolen */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">04 · Aanbevolen (donker)</div>
          <div className="bg-[var(--deep)] text-[var(--paper)] rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="dot" style={{ background: "oklch(72% 0.10 78)" }} />
                <span className="text-[11px] tracking-[0.06em] uppercase text-[oklch(80%_0.02_78)]">Aanbevolen</span>
              </div>
              <Pill tone="dark">Combinatie</Pill>
            </div>
            <h3 className="font-serif mt-4 text-[22px] leading-[1.15] text-[var(--paper)]">Studieschuld + beleggen samen</h3>
            <p className="text-[13.5px] leading-[1.55] text-[oklch(80%_0.01_232)] mt-2">
              Aflossen of inleggen? Een gecombineerd scenario voor je 30‑jarige horizon.
            </p>
            <div className="mt-auto pt-6 flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[oklch(72%_0.02_232)]">Scenario</div>
                <div className="font-serif text-[20px] mt-1">Vermogen op 55 jr.</div>
              </div>
              <span className="text-[13px] text-[var(--paper)]">Start →</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6">
        {/* 05 — Empty */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">05 · Empty / nieuw</div>
          <div className="bg-white border border-dashed hair rounded-xl p-6 h-full">
            <div className="flex items-center gap-2">
              <CategoryDot cat="maand" />
              <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Maandlasten</span>
            </div>
            <h3 className="font-serif mt-4 text-[20px] leading-[1.15]">Vaste lasten‑check</h3>
            <p className="text-[13.5px] leading-[1.55] text-[var(--muted)] mt-2">
              Nog niet gebruikt — vul één keer je vaste lasten in en wij benchmarken tegen CBS‑gemiddelden.
            </p>
            <div className="mt-6"><Btn kind="outline" size="sm">Eerste keer instellen</Btn></div>
          </div>
        </div>

        {/* 06 — In bewerking */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">06 · In bewerking</div>
          <div className="bg-white border hair rounded-xl p-6 h-full relative overflow-hidden">
            <div className="absolute top-3 right-3"><Pill tone="accent">Wordt bewerkt</Pill></div>
            <div className="flex items-center gap-2">
              <CategoryDot cat="beleg" />
              <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Beleggen</span>
            </div>
            <h3 className="font-serif mt-4 text-[20px] leading-[1.15]">Box 3 voorlopige aanslag</h3>
            <p className="text-[13.5px] leading-[1.55] text-[var(--muted)] mt-2">
              Concept opgeslagen 12 min geleden — drie velden nog te vullen.
            </p>
            <div className="mt-5">
              <div className="h-1.5 rounded-full bg-[var(--paper-soft)] overflow-hidden">
                <div className="h-full bg-[oklch(46%_0.07_232)] w-[62%]" />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--muted)] tabular mt-1.5">
                <span>5 / 8 velden</span><span>62%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 07 — Met grafiek */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">07 · Met grafiek</div>
          <div className="bg-white border hair rounded-xl p-6 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryDot cat="hyp" />
                <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Hypotheek</span>
              </div>
              <span className="font-mono text-[11px] tabular text-[var(--muted)]">10 jr.</span>
            </div>
            <h3 className="font-serif mt-4 text-[20px] leading-[1.15]">Hypotheekrente — historisch</h3>
            <div className="mt-3"><Sparkline points={[2.1,1.8,1.5,1.4,1.3,1.6,2.2,3.3,4.1,3.9,3.89]} width={260} height={56} /></div>
            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">Vandaag</div>
                <div className="font-mono text-[18px] tabular mt-0.5">3,89%</div>
              </div>
              <span className="text-[13px] text-[var(--ink)]">Openen →</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Annotation({ top, left, label, align = "left" }: { top: string; left: string; label: string; align?: "left" | "right" }) {
  return (
    <div className="absolute pointer-events-none" style={{ top, left }}>
      <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <span className="size-[6px] rounded-full bg-[oklch(46%_0.07_232)] -translate-y-px" />
        <span className="text-[10.5px] tracking-[0.04em] text-[var(--muted)] whitespace-nowrap">{label}</span>
      </div>
    </div>
  );
}
