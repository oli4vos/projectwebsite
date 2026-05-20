import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink, Pill } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="hair-b grid gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:pt-4">
          <div className="min-w-0 pt-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Financiële keuzehulp
            </div>
            <h1
              className="text-fluid-h1 mt-5 max-w-4xl font-serif tracking-[-0.03em] text-[var(--ink)]"
              style={{ textWrap: "balance" }}
            >
              Slimmer kiezen met je geld.
            </h1>
            <p className="text-fluid-lead mt-6 max-w-[62ch] leading-[1.7] text-[var(--ink-2)]">
              Vergelijk sparen, beleggen, aflossen, pensioen, wonen en belasting in
              begrijpelijke scenario&apos;s. Geen financieel jargon, wel direct houvast.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BtnLink href="/apps/volgende-euro" kind="primary" size="md">
                Start met de keuzehulp
              </BtnLink>
              <BtnLink href="/profiel" kind="outline" size="md">
                Maak berekeningen persoonlijker
              </BtnLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Pill tone="accent">Start met je vraag</Pill>
              <Pill>Korte samenvatting eerst</Pill>
              <Pill>Verdieping als je wilt</Pill>
            </div>
          </div>

          <aside className="min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
              Zo werkt het
            </div>
            <div className="mt-4 space-y-4 text-[14px] leading-[1.65] text-[var(--ink-2)]">
              <div>
                <div className="font-medium text-[var(--ink)]">1. Start met één keuzevraag</div>
                <p className="mt-1">
                  Gebruik de keuzehulp als je nog niet weet welke richting nu het
                  belangrijkst is.
                </p>
              </div>
              <div>
                <div className="font-medium text-[var(--ink)]">2. Maak het persoonlijk</div>
                <p className="mt-1">
                  Vul je profiel optioneel in zodat tools je gegevens kunnen
                  voorinvullen.
                </p>
              </div>
              <div>
                <div className="font-medium text-[var(--ink)]">3. Check de aannames</div>
                <p className="mt-1">
                  In <span className="font-medium">Variabelen</span> zie je met welke
                  percentages we rekenen.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="pt-8">
          <AppDashboard apps={appRegistry} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
