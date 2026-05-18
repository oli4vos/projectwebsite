import { Logo, Pill, Btn, CategoryDot } from "../components/ui";
import { Toggle } from "../components/inputs";
import { Sparkline } from "../components/charts";
import { ToolCard } from "../components/ToolCard";
import type { Category } from "../lib/categories";

/**
 * Artboard 1 — Homepage / dashboard.
 * Top-nav · hero met live marktdata-kaart · 8 toolkaarten · recente berekeningen
 * + methodologie-callout.
 */
export function Dashboard() {
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const market: Array<[label: string, value: string, delta: string, neg: boolean | null, points: number[]]> = [
    ["Hypotheekrente 10 jr", "3,89%",  "+0,02",       false, [4,3,3,4,5,4,5,6,5,5]],
    ["AEX",                  "942,17", "+1,24%",      false, [3,4,3,5,4,5,6,5,7,8]],
    ["DUO rente '26",        "2,57%",  "ongewijzigd", null,  [5,5,5,5,5,5,5,5,5,5]],
    ["Spaarrente top‑3",     "1,80%",  "−0,05",       true,  [7,7,6,6,5,5,4,4,3,3]],
  ];

  const recent: Array<[Category, string, string, string, string]> = [
    ["hyp",    "Annuïteit of lineair: wat past?", "€ 385.000 · 30 jaar · 3,89%", "vandaag · 13:42", "€ 1.642 / mnd"],
    ["beleg",  "Maandinleg‑effect",                "€ 250 / mnd · 25 jaar · 5,5%", "gisteren · 21:08", "€ 154.812"],
    ["studie", "DUO‑maandlast na herziening",       "€ 21.400 · 35 jaar",          "vr. 16 mei",       "€ 87,40 / mnd"],
  ];

  return (
    <div className="w-full h-full bg-[var(--paper)] text-[var(--ink)] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-10 pt-6 pb-5 hair-b">
        <div className="flex items-center gap-10">
          <Logo size={22} />
          <nav className="flex items-center gap-7 text-[13.5px] text-[var(--ink-2)]">
            <a className="text-[var(--ink)] font-medium">Rekentools</a>
            <a className="text-[var(--muted)] hover:text-[var(--ink)]">Inzichten</a>
            <a className="text-[var(--muted)] hover:text-[var(--ink)]">Hulp & uitleg</a>
            <a className="text-[var(--muted)] hover:text-[var(--ink)]">Adviseurs</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 h-9 px-3 bg-white border hair rounded-full w-[240px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--muted)]">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input placeholder="Zoek een rekentool…" className="bg-transparent text-[13px] outline-none flex-1 placeholder:text-[var(--soft)]" />
            <span className="font-mono text-[10.5px] text-[var(--soft)] px-1.5 py-0.5 rounded bg-[var(--paper-soft)]">⌘K</span>
          </div>
          <Btn kind="ghost" size="sm">Inloggen</Btn>
          <Btn kind="primary" size="sm">Account</Btn>
        </div>
      </header>

      {/* Hero + ticker */}
      <section className="px-10 pt-10 pb-8 grid grid-cols-12 gap-8 hair-b">
        <div className="col-span-7">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Rekentools · {today}
          </div>
          <h1 className="font-serif text-[54px] leading-[1.08] tracking-[-0.02em] mt-5">
            Bereken, vergelijk,<br />
            <em className="italic text-[var(--muted)]">beslis</em>.
          </h1>
          <p className="text-[15.5px] leading-[1.55] text-[var(--ink-2)] mt-7 max-w-[480px]">
            Onafhankelijke rekenmodellen voor studieschuld, beleggen, hypotheekvormen en maandlasten —
            gebaseerd op de actuele cijfers van DNB, CBS en de Belastingdienst.
          </p>
          <div className="flex items-center gap-3 mt-7">
            <Btn kind="primary" size="md">Start een berekening</Btn>
            <Btn kind="ghost"   size="md">Hoe werkt het?</Btn>
          </div>
        </div>

        {/* Marktdata-kaart */}
        <div className="col-span-5 bg-white border hair rounded-xl p-6 shadow-paper">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="tick size-[7px] rounded-full bg-[var(--pos)]" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Marktdata · live</span>
            </div>
            <span className="font-mono text-[11px] text-[var(--soft)] tabular">14:08 CET</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {market.map(([l, v, d, neg, pts], i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11.5px] text-[var(--muted)] leading-tight">{l}</div>
                  <div className="font-mono text-[18px] tabular mt-0.5">{v}</div>
                  <div className={`font-mono text-[11px] tabular ${
                    neg ? "text-[oklch(40%_0.13_28)]" :
                    neg === false ? "text-[oklch(40%_0.10_152)]" :
                    "text-[var(--muted)]"
                  }`}>
                    {d}
                  </div>
                </div>
                <Sparkline points={pts} width={64} height={28} negative={!!neg} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorieën strook */}
      <section className="px-10 pt-8 pb-3 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[26px] tracking-[-0.01em]">Onze rekentools</h2>
          <p className="text-[13.5px] text-[var(--muted)] mt-1">
            Vier categorieën, achttien modellen. Alles uitlegbaar en zonder cookies van derden.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Toggle options={["Alle", "Populair", "Nieuw"]} active={0} />
          <button className="h-9 px-3 text-[13px] text-[var(--muted)] hair border rounded-full bg-white">
            Sorteer: relevantie ⌄
          </button>
        </div>
      </section>

      {/* Grid */}
      <section className="px-10 pt-5 pb-10 grid grid-cols-4 gap-5">
        <ToolCard cat="studie" title="DUO‑maandlast na herziening"
          blurb="Bereken je nieuwe termijnbedrag onder het sociaal leenstelsel of de oude regeling."
          stat="€ 87,40 / mnd" statLabel="Voorbeeld" />
        <ToolCard cat="beleg" title="Rendement vs. spaargeld over 20 jaar"
          blurb="Vergelijk indexfondsen met spaarrente, inclusief box‑3 heffing en inflatie."
          badge="Populair" stat="+ € 38.214" statLabel="Eindverschil" />
        <ToolCard cat="hyp" title="Annuïteit of lineair: wat past?"
          blurb="Zie de bruto- en netto-maandlast naast elkaar, jaar voor jaar."
          stat="€ 1.642 / mnd" statLabel="Annuïteit, 30 jr" />
        <ToolCard cat="maand" title="Netto besteedbaar inkomen"
          blurb="Inkomen, vaste lasten, vrije ruimte — wat blijft er aan het einde van de maand?"
          badge="Nieuw" stat="€ 1.180" statLabel="Vrij besteedbaar" />

        <ToolCard cat="studie" title="Vervroegd aflossen vs. beleggen"
          blurb="Bij welke rente loont het om je studieschuld eerder af te lossen?" dense />
        <ToolCard cat="beleg" title="Maandinleg‑effect (compound)"
          blurb="Het verschil tussen 50, 150 en 300 euro per maand inleggen — 30 jaar lang." dense />
        <ToolCard cat="hyp" title="Maximale hypotheek 2026"
          blurb="Inclusief NHG‑grens en de actuele financieringslastpercentages." dense />
        <ToolCard cat="maand" title="Vaste lasten‑check"
          blurb="Vergelijk je vaste lasten met het CBS‑gemiddelde voor je huishoudtype." dense />
      </section>

      {/* Recent + uitleg */}
      <section className="px-10 pb-10 grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white border hair rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[18px]">Recent door jou bekeken</h3>
            <a className="text-[12.5px] text-[var(--muted)] underline underline-offset-2">Alle berekeningen</a>
          </div>
          <div className="mt-3">
            {recent.map(([cat, title, params, when, result], i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center py-3.5 hair-b last:border-b-0">
                <div className="col-span-5 flex items-center gap-3">
                  <CategoryDot cat={cat} />
                  <div>
                    <div className="text-[14px] tracking-[-0.005em]">{title}</div>
                    <div className="text-[11.5px] text-[var(--muted)] font-mono tabular mt-0.5">{params}</div>
                  </div>
                </div>
                <div className="col-span-3 text-[12px] text-[var(--soft)]">{when}</div>
                <div className="col-span-3 font-mono text-[14px] tabular text-right">{result}</div>
                <div className="col-span-1 text-right text-[var(--muted)]">→</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 bg-[var(--deep)] text-[var(--paper)] rounded-xl p-6 flex flex-col">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[oklch(80%_0.04_232)] opacity-80">Achtergrond</div>
          <h3 className="font-serif text-[22px] leading-[1.15] mt-3">Hoe rekenen wij?</h3>
          <p className="text-[13.5px] leading-[1.6] text-[oklch(82%_0.01_232)] mt-3 flex-1">
            Elk model is gedocumenteerd: welke bron, welke aannames, welke beperkingen. Geen black box.
            We tonen altijd het scenario, niet alleen het cijfer.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10">
            {[["18","modellen"],["43","bronvermeldingen"],["2026","laatst herzien"]].map(([n, l], i) => (
              <div key={i}>
                <div className="font-serif text-[24px] leading-none">{n}</div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[oklch(78%_0.01_232)] opacity-80 mt-1.5">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Btn kind="outline" size="sm">Lees onze methodologie</Btn>
          </div>
        </div>
      </section>

      <footer className="mt-auto px-10 py-6 hair-t flex items-center justify-between text-[12px] text-[var(--muted)]">
        <div className="flex items-center gap-6">
          <Logo size={16} />
          <span>© 2026 Olivier · Onafhankelijk en advertentievrij</span>
        </div>
        <div className="flex items-center gap-6">
          <a>Methodologie</a><a>Bronnen</a><a>Privacy</a><a>Contact</a>
        </div>
      </footer>
    </div>
  );
}
