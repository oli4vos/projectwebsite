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
                Koopstarters met familiehulp
              </div>
              <h1
                className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]"
                style={{ textWrap: "balance" }}
              >
                Je eerste huis financieren met studieschuld en hulp van familie
              </h1>
              <p className="text-fluid-lead mt-5 max-w-[64ch] leading-[1.7] text-[var(--ink-2)]">
                Vergelijk eigen geld, DUO, een familielening en schenkingen in één overzicht.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <BtnLink href="/apps/familiehulp-eerste-woning" kind="primary" size="md">
                  Bereken mijn financieringsroute
                </BtnLink>
                <BtnLink href="#apps" kind="outline" size="md">
                  Bekijk alle tools
                </BtnLink>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                <span className="rounded-full border border-[var(--hair)] bg-white px-3 py-1.5">
                  Onafhankelijk scenario-inzicht
                </span>
                <span className="rounded-full border border-[var(--hair)] bg-white px-3 py-1.5">
                  Toekomstige schenkingen zijn onzeker
                </span>
                <span className="rounded-full border border-[var(--hair)] bg-white px-3 py-1.5">
                  Gegevens blijven lokaal
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
                Gericht op één route
              </div>
              <h2 className="mt-2 font-serif text-[clamp(1.35rem,1.1rem+0.9vw,1.8rem)] tracking-[-0.02em] text-[var(--ink)]">
                Eerst inzicht, daarna keuze
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
                Deze ingang combineert studieschuld, eigen geld, familiehulp en de bancaire
                hypotheek. De reguliere DUO-tools blijven daarnaast gewoon beschikbaar.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">Scenario-inzicht</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Vergelijk routes zonder dat bedragen automatisch door elkaar lopen.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">Schenkingen blijven onzeker</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Een toekomstige schenking is geen gegarandeerd inkomen of vaste lastverlaging.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  <div className="text-[12px] font-medium text-[var(--ink)]">Lokaal bewaard</div>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                    Invoer blijft volgens de bestaande opslagwerking in je eigen browser.
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
