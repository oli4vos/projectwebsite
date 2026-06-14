import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Over deze site | Financiële rekentools",
  description:
    "Onafhankelijke, transparante rekentools voor studieschuld en hypotheekruimte. Geen advies, geen advertenties, alles lokaal in je browser.",
};

export default function OverPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14"
      >
        <section className="rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
          <h1 className="text-fluid-h2 max-w-4xl font-serif tracking-[-0.03em] text-[var(--ink)]">
            Over deze site
          </h1>

          <div className="mt-6 max-w-[70ch] space-y-6 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <p>
              Deze site is een onafhankelijk project met heldere rekentools voor
              mensen met een DUO-studieschuld, en voor starters die hun maximale
              hypotheek willen inschatten. Het doel is simpel: grip. Je ziet wat
              een keuze met je eigen cijfers doet, zodat je zelf een
              geïnformeerd besluit neemt.
            </p>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Onafhankelijk
              </h2>
              <p>
                Geen advies, geen advertenties, geen doorverwijzing naar
                aanbieders. De berekeningen zijn scenario's, geen persoonlijk
                advies.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Privacy
              </h2>
              <p>
                In deze versie rekent alles lokaal in je browser. Wat je
                invult, wordt niet opgeslagen of verstuurd.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Waarop we ons baseren
              </h2>
              <p>
                Elke aanname is terug te voeren op de bron: wet- en
                regelgeving, het normadvies van het Nibud, toezichthouders
                zoals de AFM, en officiële uitleg van de overheid, DUO en de
                Belastingdienst. Bij elke aanname zie je het bronniveau en een
                link naar die bron. Waar een getal een eigen indicatieve keuze
                is in plaats van een norm, staat dat er eerlijk bij. Bekijk de{" "}
                <Link
                  href="/variabelen"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  aannames
                </Link>{" "}
                en de{" "}
                <Link
                  href="/kennisbank"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  uitleg in de kennisbank
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Bijwerken
              </h2>
              <p>
                De aannames worden minstens één keer per jaar en bij relevante
                wetswijzigingen gecontroleerd. Bij elke aanname zie je de
                laatste controledatum en de status: definitief, voorlopig of
                indicatief.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Fouten melden
              </h2>
              <p>
                Iets onjuist of onduidelijk? Meld het via{" "}
                <a
                  href="https://github.com/oli4vos/projectwebsite/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  GitHub issues
                </a>
                .
              </p>
            </div>

            <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
              <h2 className="font-serif text-[16px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Belangrijk
              </h2>
              <p className="text-[13px] text-[var(--muted)]">
                Dit zijn indicatieve scenario's, geen persoonlijk financieel
                advies. Voor een besluit dat veel geld of lange tijd raakt,
                raadpleeg een onafhankelijk adviseur.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
