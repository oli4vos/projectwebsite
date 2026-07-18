import type { Metadata } from "next";
import Link from "next/link";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";

export const metadata: Metadata = {
  title: "Over deze site | GRIP v2",
  description:
    "Onafhankelijke, transparante rekentools voor studieschuld en hypotheekruimte. Geen advies, geen advertenties, alles lokaal in je browser.",
};

export default function V2OverPage() {
  return (
    <>
      <V2Header />
      <main id="main-content" className="v2-section">
        <div className="v2-container">
          <section className="v2-card">
            <div className="v2-kicker">Over</div>
            <h1>Over deze site</h1>
            <div className="mt-6 max-w-[70ch] space-y-6 text-[14px] leading-[1.7]">
              <p>
                Deze site is een onafhankelijk project met heldere rekentools voor
                mensen met een DUO-studieschuld, en voor starters die hun maximale
                hypotheek willen inschatten. Het doel is simpel: grip. Je ziet wat
                een keuze met je eigen cijfers doet, zodat je zelf een
                geïnformeerd besluit neemt.
              </p>
              <div>
                <h2 className="text-[18px] tracking-[-0.02em] text-[var(--v2-ink)] mb-2">
                  Onafhankelijk
                </h2>
                <p>
                  Geen advies, geen advertenties, geen doorverwijzing naar
                  aanbieders. De berekeningen zijn scenario&apos;s, geen persoonlijk
                  advies.
                </p>
              </div>
              <div>
                <h2 className="text-[18px] tracking-[-0.02em] text-[var(--v2-ink)] mb-2">
                  Privacy
                </h2>
                <p>
                  In deze versie rekent alles lokaal in je browser. Wat je
                  invult, wordt niet opgeslagen of verstuurd.
                </p>
              </div>
              <div>
                <h2 className="text-[18px] tracking-[-0.02em] text-[var(--v2-ink)] mb-2">
                  Waarop we ons baseren
                </h2>
                <p>
                  Elke aanname is terug te voeren op de bron: wet- en
                  regelgeving, het normadvies van het Nibud, toezichthouders
                  zoals de AFM, en officiële uitleg van de overheid, DUO en de
                  Belastingdienst. Bij elke aanname zie je het bronniveau en een
                  link naar die bron. Waar een getal een eigen indicatieve keuze
                  is in plaats van een norm, staat dat er eerlijk bij. Bekijk de{" "}
                  <Link href="/v2/variabelen" className="underline">
                    aannames
                  </Link>{" "}
                  en de{" "}
                  <Link href="/v2/kennisbank" className="underline">
                    uitleg in de kennisbank
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h2 className="text-[18px] tracking-[-0.02em] text-[var(--v2-ink)] mb-2">
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
                <h2 className="text-[18px] tracking-[-0.02em] text-[var(--v2-ink)] mb-2">
                  Fouten melden
                </h2>
                <p>
                  Iets onjuist of onduidelijk? Meld het via{" "}
                  <a
                    href="https://github.com/oli4vos/projectwebsite/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    GitHub issues
                  </a>
                  .
                </p>
              </div>
              <div className="rounded-xl border border-[var(--v2-line)] bg-[var(--v2-paper)] px-4 py-3">
                <h2 className="text-[16px] tracking-[-0.02em] text-[var(--v2-ink)] mb-2">
                  Belangrijk
                </h2>
                <p className="text-[13px] text-[var(--v2-ink-soft)]">
                  Dit zijn indicatieve scenario&apos;s, geen persoonlijk financieel
                  advies. Voor een besluit dat veel geld of lange tijd raakt,
                  raadpleeg een onafhankelijk adviseur.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <V2Footer />
    </>
  );
}
