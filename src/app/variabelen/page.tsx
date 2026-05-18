import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function ValueRow({
  name,
  value,
}: {
  name: string;
  value: React.ReactNode;
}) {
  return (
    <div className="hair-b grid gap-2 py-3 text-[13.5px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center last:border-b-0">
      <div className="text-[var(--muted)]">{name}</div>
      <div className="font-mono tabular text-[var(--ink)]">{value}</div>
    </div>
  );
}

function MetaBlock({
  year,
  sourceLabel,
  status,
  lastChecked,
  notes,
}: {
  year: number;
  sourceLabel: string;
  status: string;
  lastChecked: string;
  notes?: string;
}) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[12.5px] leading-[1.6] text-[var(--muted)]">
      <p>Jaar: {year}</p>
      <p>Status: {status}</p>
      <p>Gecontroleerd op: {formatIsoDate(lastChecked)}</p>
      <p>Bron: {sourceLabel}</p>
      {notes ? <p>Toelichting: {notes}</p> : null}
    </div>
  );
}

export default function VariabelenPage() {
  const year = getDefaultFinancialYear();
  const constants = getFinancialConstants(year);

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto min-h-[100dvh] max-w-7xl px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-14"
      >
        <section className="rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Variabelen
          </div>
          <h1 className="text-fluid-h2 mt-2 max-w-4xl font-serif tracking-[-0.03em] text-[var(--ink)]">
            Aannames en vaste variabelen
          </h1>
          <p className="mt-4 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze site gebruikt centrale waarden per jaar, zoals DUO-rente,
            belastingtarieven en standaardrentes. Tools kunnen hiervan afwijken als
            je zelf andere waarden invult.
          </p>
        </section>

        <section className="mt-6 space-y-5">
          <article className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              DUO
            </h2>
            <div className="mt-4">
              <ValueRow name="Rente SF35" value={`${formatPercent(constants.duo.rates.SF35)}%`} />
              <ValueRow name="Rente SF15" value={`${formatPercent(constants.duo.rates.SF15)}%`} />
              <ValueRow
                name="Rente SF15_OLD"
                value={`${formatPercent(constants.duo.rates.SF15_OLD)}%`}
              />
              <ValueRow
                name="Rente SF15_LLLK"
                value={`${formatPercent(constants.duo.rates.SF15_LLLK)}%`}
              />
              <ValueRow name="Rente UNKNOWN" value={`${formatPercent(constants.duo.rates.UNKNOWN)}%`} />
              <ValueRow name="Default looptijd SF35" value={`${constants.duo.defaultTerms.SF35} jaar`} />
              <ValueRow name="Default looptijd SF15" value={`${constants.duo.defaultTerms.SF15} jaar`} />
              <ValueRow
                name="Default looptijd SF15_OLD"
                value={`${constants.duo.defaultTerms.SF15_OLD} jaar`}
              />
              <ValueRow
                name="Default looptijd SF15_LLLK"
                value={`${constants.duo.defaultTerms.SF15_LLLK} jaar`}
              />
              <ValueRow
                name="Default looptijd UNKNOWN"
                value={`${constants.duo.defaultTerms.UNKNOWN} jaar`}
              />
            </div>
            <MetaBlock year={year} {...constants.duo.meta} />
          </article>

          <article className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Hypotheek
            </h2>
            <div className="mt-4">
              <ValueRow
                name="Default hypotheekrente"
                value={`${formatPercent(constants.mortgage.defaultMortgageRate)}%`}
              />
              <ValueRow
                name="Default hypotheeklooptijd"
                value={`${constants.mortgage.defaultMortgageTermYears} jaar`}
              />
              {constants.mortgage.studentDebtGrossUpFactors.map((band) => (
                <ValueRow
                  key={`${band.minRate}-${band.maxRate ?? "plus"}`}
                  name={`Brutering ${band.label}`}
                  value={`${formatPercent(band.factor)}x`}
                />
              ))}
            </div>
            <MetaBlock year={year} {...constants.mortgage.meta} />
          </article>

          <article className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Box 1
            </h2>
            <div className="mt-4">
              {constants.box1.brackets.map((bracket) => (
                <ValueRow
                  key={bracket.label}
                  name={bracket.label}
                  value={`${formatPercent(bracket.rate)}%`}
                />
              ))}
            </div>
            <MetaBlock year={year} {...constants.box1.meta} />
          </article>

          <article className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Box 3
            </h2>
            <div className="mt-4">
              <ValueRow
                name="Tarief box 3"
                value={`${formatPercent(constants.box3.taxRate)}%`}
              />
              <ValueRow
                name="Heffingsvrij vermogen (persoon)"
                value={formatCurrency(constants.box3.taxFreeAllowanceSingle)}
              />
              <ValueRow
                name="Heffingsvrij vermogen (partners)"
                value={formatCurrency(constants.box3.taxFreeAllowancePartners)}
              />
              <ValueRow
                name="Forfait banktegoeden"
                value={`${formatPercent(constants.box3.deemedReturns.bankDeposits)}%`}
              />
              <ValueRow
                name="Forfait beleggingen/overige bezittingen"
                value={`${formatPercent(constants.box3.deemedReturns.investmentsAndOtherAssets)}%`}
              />
              <ValueRow
                name="Forfait schulden"
                value={`${formatPercent(constants.box3.deemedReturns.debts)}%`}
              />
            </div>
            <MetaBlock year={year} {...constants.box3.meta} />
          </article>

          <article className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Grafieken en presentatie
            </h2>
            <div className="mt-4">
              <ValueRow name="Standaard valuta" value={constants.charts.defaultCurrency} />
              <ValueRow name="Standaard tijdseenheid" value={constants.charts.defaultTimeUnit} />
            </div>
            <MetaBlock year={year} {...constants.charts.meta} />
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
