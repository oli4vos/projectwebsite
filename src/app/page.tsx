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
        <section className="hair-b grid gap-8 pb-10 lg:grid-cols-[minmax(0,1.12fr)_420px] lg:pt-4">
          <div className="pt-4">
            <div className="kicker">
              Financiële rekentools · {today}
            </div>
            <h1
              className="mt-5 max-w-4xl font-serif text-[46px] leading-[0.98] tracking-[-0.035em] text-[var(--ink)] sm:text-[64px]"
              style={{ textWrap: "balance" }}
            >
              Pech gehad.
              <br />
              Grip terugpakken.
            </h1>
            <p className="mt-6 max-w-[62ch] text-[15.5px] leading-[1.7] text-[var(--ink-2)]">
              Rekentools voor financiële keuzes rond studieschuld, beleggen,
              hypotheek en maandlasten. Begrijpelijk voor wie snel inzicht wil,
              transparant voor wie de berekening echt wil snappen.
            </p>
            <p className="mt-4 max-w-[54ch] text-[13.5px] leading-[1.7] text-[var(--muted)]">
              Je hoeft geen financieel expert te zijn. Een beetje rekenen helpt al.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BtnLink href="/#apps" kind="primary" size="md">
                Bekijk rekentools
              </BtnLink>
              <BtnLink href="/apps/hypotheek-impact-studieschuld" kind="outline" size="md">
                Open voorbeeldtool
              </BtnLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Pill tone="accent">Geen glazen bol. Wel betere aannames.</Pill>
              <Pill>Scenario&apos;s boven losse meningen</Pill>
              <Pill>Geen financieel advies. Wel meer grip.</Pill>
            </div>
          </div>

          <aside className="sheet p-6">
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
              Deze referenties geven alleen context. De rekentools zelf draaien op
              jouw invoer en laten zien hoe een scenario kan verschuiven.
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
