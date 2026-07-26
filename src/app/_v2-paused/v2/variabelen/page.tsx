import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import type { AssumptionStatus, SourceTier } from "@/lib/financial-constants";
import { SOURCE_TIER_LABELS, isApproximation } from "@/lib/source-tier";

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

function formatStatusLabel(status: AssumptionStatus) {
  if (status === "voorlopig") {
    return "Voorlopig";
  }

  if (status === "indicatief") {
    return "Indicatief";
  }

  return "Definitief";
}

import type { ReactNode } from "react";

function ValueRow({
  name,
  value,
}: {
  name: string;
  value: ReactNode;
}) {
  return (
    <div className="hair-b grid gap-2 py-3 text-[13.5px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center last:border-b-0">
      <div className="text-[var(--v2-ink-soft)]">{name}</div>
      <div className="font-mono tabular text-[var(--v2-ink)]">{value}</div>
    </div>
  );
}

function MetaBlock({
  year,
  sourceLabel,
  status,
  lastChecked,
  notes,
  sourceUrl,
  sourceTier,
}: {
  year: number;
  sourceLabel: string;
  status: AssumptionStatus;
  lastChecked: string;
  notes?: string;
  sourceUrl: string | null;
  sourceTier: SourceTier;
}) {
  const isApprox = isApproximation(sourceTier);

  return (
    <div className="mt-4 rounded-xl border border-[var(--v2-line)] bg-[var(--v2-paper)] px-4 py-3 text-[12.5px] leading-[1.6] text-[var(--v2-ink-soft)]">
      <p>Jaar: {year}</p>
      <p>Status: {formatStatusLabel(status)}</p>
      <p>Gecontroleerd op: {formatIsoDate(lastChecked)}</p>
      <p>
        Bron/aannameset:{" "}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--v2-ink)] hover:text-[var(--v2-ink)]"
          >
            {sourceLabel}
          </a>
        ) : (
          sourceLabel
        )}
      </p>
      <p className="mt-2">
        Niveau:{" "}
        <span
          className={`inline-block rounded-md px-2 py-1 text-[11px] font-medium ${
            isApprox
              ? "bg-amber-100/50 text-amber-900"
              : "bg-slate-200/50 text-slate-900"
          }`}
        >
          {SOURCE_TIER_LABELS[sourceTier]}
        </span>
      </p>
      {notes ? <p className="mt-2">Toelichting: {notes}</p> : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4">
      <div className="text-[12px] text-[var(--v2-ink-soft)]">{label}</div>
      <div className="mt-1 font-mono text-[16px] tabular text-[var(--v2-ink)]">
        {value}
      </div>
    </div>
  );
}

export default function V2VariabelenPage() {
  const year = getDefaultFinancialYear();
  const constants = getFinancialConstants(year);

  return (
    <>
      <V2Header />
      <main id="main-content" className="v2-section">
        <div className="v2-container space-y-6">
          <section className="v2-card">
            <div className="v2-kicker">Aannames en vaste variabelen</div>
            <h1 className="max-w-4xl">Aannames en vaste variabelen</h1>
            <p className="max-w-[70ch] text-[14px] leading-[1.7]">
              Hier zie je met welke standaardwaarden de site rekent. In de tools kun
              je vaak je eigen waarden invullen.
            </p>
            <div className="rounded-xl border border-[var(--v2-line)] bg-[var(--v2-paper)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--v2-ink-soft)]">
              <p>Voorlopig betekent dat het percentage later nog kan wijzigen.</p>
              <p className="mt-1">
                Indicatief betekent dat de site deze waarde gebruikt als rekengemak,
                maar je in tools vaak zelf een andere waarde kunt invullen.
              </p>
            </div>
          </section>

          <section className="v2-card">
            <h2>Belangrijkste waarden</h2>
            <p className="mt-2">
              Snelle samenvatting van de meest gebruikte standaardwaarden.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Jaar" value={`${year}`} />
              <SummaryCard
                label="DUO-rente SF35"
                value={`${formatPercent(constants.duo.rates.SF35)}%`}
              />
              <SummaryCard
                label="DUO-rente SF15"
                value={`${formatPercent(constants.duo.rates.SF15)}%`}
              />
              <SummaryCard
                label="Standaard hypotheekrente"
                value={`${formatPercent(constants.mortgage.defaultMortgageRate)}%`}
              />
              <SummaryCard
                label="Forfait overige bezittingen"
                value={`${formatPercent(constants.box3.deemedReturns.investmentsAndOtherAssets)}%`}
              />
              <SummaryCard label="Box 3-tarief" value={`${formatPercent(constants.box3.taxRate)}%`} />
              <SummaryCard
                label="Vrijstelling box 3 (alleenstaand)"
                value={formatCurrency(constants.box3.taxFreeAllowanceSingle)}
              />
              <SummaryCard
                label="Vrijstelling box 3 (partners)"
                value={formatCurrency(constants.box3.taxFreeAllowancePartners)}
              />
            </div>
          </section>

          <section className="space-y-4">
            <ToolDisclosure title="DUO" subtitle="Rentes, standaard looptijden en draagkrachtregels.">
              <ValueRow name="DUO-rente SF35" value={`${formatPercent(constants.duo.rates.SF35)}%`} />
              <ValueRow name="DUO-rente SF15" value={`${formatPercent(constants.duo.rates.SF15)}%`} />
              <ValueRow name="DUO-rente SF15-oud" value={`${formatPercent(constants.duo.rates.SF15_OLD)}%`} />
              <ValueRow name="DUO-rente SF15-lllk" value={`${formatPercent(constants.duo.rates.SF15_LLLK)}%`} />
              <ValueRow name="Standaard looptijd SF35" value={`${constants.duo.defaultTerms.SF35} jaar`} />
              <ValueRow name="Standaard looptijd SF15" value={`${constants.duo.defaultTerms.SF15} jaar`} />
              <ValueRow
                name="Draagkracht SF35 (alleenstaand)"
                value={`${formatCurrency(constants.duo.incomeBasedRules.SF35.singleAllowance)} vrijstelling, ${formatPercent(constants.duo.incomeBasedRules.SF35.percentage ?? 0)}% over restant`}
              />
              <ValueRow
                name="Draagkracht SF35 (partner of alleenstaande ouder)"
                value={`${formatCurrency(constants.duo.incomeBasedRules.SF35.partnerOrSingleParentAllowance)} vrijstelling, ${formatPercent(constants.duo.incomeBasedRules.SF35.percentage ?? 0)}% over restant`}
              />
              <ValueRow
                name="Draagkracht SF15"
                value={`${formatCurrency(constants.duo.incomeBasedRules.SF15.singleAllowance)} vrijstelling alleenstaand, ${formatPercent(constants.duo.incomeBasedRules.SF15.percentage ?? 0)}% over restant`}
              />
              <MetaBlock year={year} {...constants.duo.meta} />
            </ToolDisclosure>

            <ToolDisclosure title="Hypotheek" subtitle="Standaard rente, looptijd en bruteringsstaffel.">
              <ValueRow
                name="Standaard hypotheekrente"
                value={`${formatPercent(constants.mortgage.defaultMortgageRate)}%`}
              />
              <ValueRow
                name="Standaard hypotheeklooptijd"
                value={`${constants.mortgage.defaultMortgageTermYears} jaar`}
              />
              <ValueRow
                name="Indicatieve inkomensruimte voor hypotheeklast"
                value={`${formatPercent(constants.mortgage.indicativeIncomeHousingCostRatio)}% van bruto jaarinkomen`}
              />
              {constants.mortgage.studentDebtGrossUpFactors.map((band) => (
                <ValueRow
                  key={`${band.minRate}-${band.maxRate ?? "plus"}`}
                  name={`Brutering ${band.label}`}
                  value={`${formatPercent(band.factor)}x`}
                />
              ))}
              <MetaBlock year={year} {...constants.mortgage.meta} />
            </ToolDisclosure>

            <ToolDisclosure title="Box 1" subtitle="Indicatieve schijven en tarieven voor dit jaar.">
              {constants.box1.brackets.map((bracket) => (
                <ValueRow
                  key={bracket.label}
                  name={bracket.label}
                  value={`${formatPercent(bracket.rate)}%`}
                />
              ))}
              <MetaBlock year={year} {...constants.box1.meta} />
            </ToolDisclosure>

            <ToolDisclosure title="Box 3" subtitle="Forfaits, tarief en vrijstellingen die in de tools gebruikt worden.">
              <ValueRow name="Box 3-tarief" value={`${formatPercent(constants.box3.taxRate)}%`} />
              <ValueRow
                name="Vrijstelling box 3 (alleenstaand)"
                value={formatCurrency(constants.box3.taxFreeAllowanceSingle)}
              />
              <ValueRow
                name="Vrijstelling box 3 (partners)"
                value={formatCurrency(constants.box3.taxFreeAllowancePartners)}
              />
              <ValueRow
                name="Forfait banktegoeden"
                value={`${formatPercent(constants.box3.deemedReturns.bankDeposits)}%`}
              />
              <ValueRow
                name="Forfait overige bezittingen"
                value={`${formatPercent(constants.box3.deemedReturns.investmentsAndOtherAssets)}%`}
              />
              <ValueRow
                name="Forfait schulden"
                value={`${formatPercent(constants.box3.deemedReturns.debts)}%`}
              />
              <ValueRow
                name="Standaardmethode in tools"
                value="Werkelijke opbrengst (aanpasbaar naar forfaitair)"
              />
              <MetaBlock year={year} {...constants.box3.meta} />
            </ToolDisclosure>

            <ToolDisclosure title="Grafieken en presentatie" subtitle="Valuta en tijdseenheid voor grafieken en tabellen.">
              <ValueRow name="Standaard valuta" value={constants.charts.defaultCurrency} />
              <ValueRow name="Standaard tijdseenheid" value={constants.charts.defaultTimeUnit} />
              <MetaBlock year={year} {...constants.charts.meta} />
            </ToolDisclosure>
          </section>
        </div>
      </main>
      <V2Footer />
    </>
  );
}
