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
                Begin bij je studieschuld. Ga daarna pas dieper.
              </h1>
              <p className="text-fluid-lead mt-5 max-w-[64ch] leading-[1.7] text-[var(--ink-2)]">
                Eerst zie je wat DUO per maand doet. Daarna vergelijk je extra
                aflossen, sparen, wonen en hulp van familie.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <BtnLink href="#apps" kind="primary" size="md">
                  Begin bij stap 1
                </BtnLink>
                <BtnLink href="/apps/familiehulp-eerste-woning" kind="outline" size="md">
                  Lenen of schenken voor huis
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
                Eerst simpel, daarna meer detail
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
                Je hoeft niet alles tegelijk te begrijpen. De site begint bij één
                vraag en opent daarna pas de volgende laag.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">1. Wat kost DUO?</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Begrijp je maandlast en wat de schuld voor je ruimte betekent.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">2. Wat doe ik met extra geld?</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Vergelijk aflossen met buffer houden, sparen of beleggen.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">3. Wat betekent dit voor wonen?</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Bekijk hypotheek, eigen geld, familielening en schenking pas daarna.
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
