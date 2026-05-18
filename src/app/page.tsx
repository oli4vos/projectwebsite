import { Sparkline } from "@/components/charts";
import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink, Pill } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";
import { fetchMarketData } from "@/lib/market";

export default async function HomePage() {
  const today = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const market = await fetchMarketData();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto min-h-[100dvh] max-w-7xl px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-14">
        <section className="hair-b grid gap-8 pb-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:pt-4">
          <div className="pt-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Financiële rekentools · {today}
            </div>
            <h1
              className="mt-5 max-w-4xl font-serif text-[44px] leading-[1.04] tracking-[-0.03em] text-[var(--ink)] sm:text-[58px]"
              style={{ textWrap: "balance" }}
            >
              Grip op keuzes die lang blijven doorwerken.
            </h1>
            <p className="mt-6 max-w-[62ch] text-[15.5px] leading-[1.7] text-[var(--ink-2)]">
              Soms begon je met studieschuld, hoge woonlasten of weinig financiële
              marge. Dan helpt het om scenario&apos;s rustig naast elkaar te zetten. Met
              simpele tools, eerlijke aannames en heldere uitleg krijg je meer regie
              over wat nu slim voelt en later houdbaar blijft.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BtnLink href="/#apps" kind="primary" size="md">
                Bekijk rekentools
              </BtnLink>
              <BtnLink href="/apps/studieschuld-vs-beleggen" kind="outline" size="md">
                Open voorbeeldscenario
              </BtnLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Pill tone="accent">Grip boven giswerk</Pill>
              <Pill>Heldere scenario&apos;s</Pill>
              <Pill>Eerlijke aannames</Pill>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="tick size-[7px] rounded-full bg-[var(--pos)]" />
                <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  Marktcontext
                </span>
              </div>
              <span className="font-mono text-[11px] tabular text-[var(--soft)]">
                Indicatief
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
              {market.map(({ label, value, delta, negative, points }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11.5px] leading-tight text-[var(--muted)]">
                      {label}
                    </div>
                    <div className="mt-0.5 font-mono text-[18px] tabular text-[var(--ink)]">
                      {value}
                    </div>
                    <div
                      className={`font-mono text-[11px] tabular ${
                        negative
                          ? "text-[oklch(40%_0.13_28)]"
                          : "text-[oklch(40%_0.10_152)]"
                      }`}
                    >
                      {delta}
                    </div>
                  </div>
                  <Sparkline points={[...points]} width={64} height={28} negative={negative} />
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-[var(--hair)] pt-4 text-[12.5px] leading-[1.6] text-[var(--muted)]">
              Deze referenties geven context aan je scenario&apos;s. De tools zelf
              rekenen lokaal met de waarden die jij invult.
            </p>
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
