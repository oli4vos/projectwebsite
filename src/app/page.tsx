import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";
import { ENABLE_PROFILE } from "@/lib/feature-flags";

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="hair-b pb-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="max-w-4xl pt-2">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Studieschuld als startpunt
              </div>
              <h1
                className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]"
                style={{ textWrap: "balance" }}
              >
                Wat je studieschuld doet met je volgende grote keuzes
              </h1>
              <p className="text-fluid-lead mt-5 max-w-[64ch] leading-[1.7] text-[var(--ink-2)]">
                Zie hoe DUO doorwerkt in maandruimte, extra aflossen, wonen,
                eigen geld en hulp van familie.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <BtnLink href="/apps/familiehulp-eerste-woning" kind="primary" size="md">
                  Start mijn studieschuldroute
                </BtnLink>
                <BtnLink href="#apps" kind="outline" size="md">
                  Bekijk de lagen
                </BtnLink>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                <span className="rounded-full border border-[var(--hair)] bg-white px-3 py-1.5">
                  DUO remt maandruimte
                </span>
                <span className="rounded-full border border-[var(--hair)] bg-white px-3 py-1.5">
                  Extra aflossen is een keuze
                </span>
                <span className="rounded-full border border-[var(--hair)] bg-white px-3 py-1.5">
                  Lenen en schenken apart zichtbaar
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {ENABLE_PROFILE ? (
                  <BtnLink href="/profiel" kind="outline" size="md">
                    Vul profiel in
                  </BtnLink>
                ) : null}
                <BtnLink href="/kennisbank" kind="outline" size="md">
                  Lees kennisbank
                </BtnLink>
                <BtnLink href="/variabelen" kind="ghost" size="md">
                  Bekijk aannames
                </BtnLink>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border hair bg-white p-6 shadow-paper">
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                Gelaagde route
              </div>
              <h2 className="mt-2 font-serif text-[clamp(1.35rem,1.1rem+0.9vw,1.8rem)] tracking-[-0.02em] text-[var(--ink)]">
                Niet alleen een huisvraag
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
                Een woning is één onderwerp binnen een bredere route: je studieschuld,
                buffer, extra aflossen, sparen, beleggen en eventueel hulp van familie.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">1. DUO-druk</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Breng maandlast, regeling en hypotheekimpact eerst helder in beeld.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">2. Extra aflossen</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Vergelijk aflossen met buffer, sparen, beleggen en woonruimte.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">3. Wonen en familiehulp</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Bekijk bankhypotheek, eigen geld, familielening en schenking los van elkaar.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="pt-8">
          <AppDashboard apps={appRegistry} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
