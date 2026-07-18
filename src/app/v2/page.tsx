import Link from "next/link";
import type { AppManifest } from "@/lib/app-types";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";
import { V2AppCard } from "@/components/v2/V2AppCard";
import { appRegistryBySlug } from "@/lib/app-registry";
import {
  getAvailableDuoRateYears,
  getDuoRateForRule,
  getFinancialConstants,
  getMortgageFinancingLoadTable,
} from "@/lib/financial-constants";

const featuredSlugs = [
  "duo-maandbedrag",
  "hypotheek-impact-studieschuld",
  "familiehulp-eerste-woning",
  "duo-extra-aflossen",
  "duo-schuld-bij-starten-lenen",
  "schulden-volgorde",
] as const;

const currencyFormat = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormat.format(value);
}

function formatPercent(value: number) {
  return `${numberFormat.format(value)}%`;
}

export default function V2HomePage() {
  const financialConstants = getFinancialConstants();
  const mortgageTable = getMortgageFinancingLoadTable();
  const duoYears = getAvailableDuoRateYears();
  const featuredApps = featuredSlugs
    .map((slug) => appRegistryBySlug[slug])
    .filter((app): app is AppManifest => Boolean(app));
  const duoRate = getDuoRateForRule("SF35");

  const tickerItems = [
    `DUO-rente ${duoYears[0] ?? financialConstants.year}: ${formatPercent(duoRate)}`,
    `Terugbetaaltermijn: ${financialConstants.duo.defaultTerms.SF35} jaar`,
    `Maximale leenfase: ${formatCurrency(financialConstants.duo.borrowingLimits.monthlyLoanAmountMax)} per maand`,
    `Financieringslasttabel: ${mortgageTable.versionLabel}`,
    `Laatst gecontroleerd: ${mortgageTable.lastChecked}`,
  ];

  return (
    <>
      <V2Header />
      <main id="main-content">
        <section className="v2-section">
          <div className="v2-container grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
            <div className="space-y-6">
              <div className="v2-kicker">Studieschuld, hypotheek en familiehulp</div>
              <h1 className="max-w-3xl">
                Je keuzes helder maken zonder eerst door een warboel aan tools te gaan.
              </h1>
              <p className="text-[var(--v2-ink-soft)]">
                GRIP v2 geeft je een rustige route van studieschuld naar huis,
                met dezelfde rekenlaag eronder en een visuele laag die sneller
                leest op mobiel en desktop.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/v2/apps" className="v2-btn v2-btn--primary">
                  Bekijk alle tools
                </Link>
                <Link href="/v2/apps/familiehulp-eerste-woning" className="v2-btn v2-btn--dark">
                  Start met eerste woning
                </Link>
              </div>
            </div>

            <aside className="v2-card">
              <div className="v2-kicker v2-kicker--blue">Snel overzicht</div>
              <h2 className="text-[1.6rem]">Begin waar je vraag echt zit.</h2>
              <p>
                Eerst begrijpen, dan rekenen. Daarna pas uitbreiden naar een
                diepere scenariovergelijking.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/v2/apps/duo-maandbedrag" className="v2-btn v2-btn--dark v2-btn--sm">
                  Je wettelijke maandbedrag
                </Link>
                <Link href="/v2/apps/hypotheek-impact-studieschuld" className="v2-btn v2-btn--sm">
                  Hypotheekimpact van studieschuld
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="v2-ticker">
          <div className="v2-container overflow-hidden">
            <div className="v2-ticker-track">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-section">
          <div className="v2-container space-y-5">
            <div className="space-y-2">
              <div className="v2-kicker">Aanbevolen tools</div>
              <h2>Snelle ingangen voor de eerste vragen</h2>
              <p>
                De kaarten hieronder komen rechtstreeks uit de registry en zijn
                bewust geordend voor de route naar een eerste woning.
              </p>
            </div>
            <div className="v2-grid v2-grid--3">
              {featuredApps.map((app) => (
                <V2AppCard key={app.slug} app={app} />
              ))}
            </div>
            <div>
              <Link href="/v2/apps" className="v2-btn v2-btn--dark">
                Alle tools openen
              </Link>
            </div>
          </div>
        </section>
      </main>
      <V2Footer />
    </>
  );
}
