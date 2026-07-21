"use client";

import { useMemo, useState } from "react";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import {
  AreaChart,
  getAdaptiveEuroTicks,
  getAdaptiveYearTicks,
} from "@/components/charts";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { Pill } from "@/components/ui";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateMortgageComparison } from "./logic";

type FormState = {
  loanAmount: string;
  interestRatePercent: string;
  loanTermYears: string;
  annualReturnPercent: string;
  showInvestmentDeepDive: boolean;
  includeBox3Effect: boolean;
  taxYear: string;
  hasFiscalPartner: boolean;
  box3Method: "actual" | "forfaitary";
  box3BankDeposits: string;
  box3InvestmentsAndOtherAssets: string;
  box3Debts: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  loanAmount: "385000",
  interestRatePercent: "3.89",
  loanTermYears: "30",
  annualReturnPercent: "5.5",
  showInvestmentDeepDive: true,
  includeBox3Effect: false,
  taxYear: String(new Date().getFullYear()),
  hasFiscalPartner: false,
  box3Method: "actual",
  box3BankDeposits: "0",
  box3InvestmentsAndOtherAssets: "0",
  box3Debts: "0",
};

const defaults: FormState = {
  loanAmount: "",
  interestRatePercent: "",
  loanTermYears: "",
  annualReturnPercent: "",
  showInvestmentDeepDive: false,
  includeBox3Effect: false,
  taxYear: "",
  hasFiscalPartner: false,
  box3Method: "actual",
  box3BankDeposits: "",
  box3InvestmentsAndOtherAssets: "",
  box3Debts: "",
};

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function formatCompactEuro(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function validate(values: FormState) {
  const errors: ValidationErrors = {};

  const loanAmount = parseOptionalDecimalInput(values.loanAmount) ?? Number.NaN;
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
    errors.loanAmount = "Voer een geldig hypotheekbedrag groter dan 0 in.";
  }

  const interestRatePercent =
    parseOptionalDecimalInput(values.interestRatePercent) ?? Number.NaN;
  if (
    !Number.isFinite(interestRatePercent) ||
    interestRatePercent <= 0 ||
    interestRatePercent > 25
  ) {
    errors.interestRatePercent = "Gebruik een rente tussen 0 en 25 procent.";
  }

  const loanTermYears = parseOptionalDecimalInput(values.loanTermYears) ?? Number.NaN;
  if (!Number.isFinite(loanTermYears) || loanTermYears < 1 || loanTermYears > 40) {
    errors.loanTermYears = "Kies een looptijd tussen 1 en 40 jaar.";
  }

  const annualReturnPercent =
    parseOptionalDecimalInput(values.annualReturnPercent) ?? Number.NaN;
  const taxYear = parseOptionalDecimalInput(values.taxYear);
  const box3BankDeposits = parseOptionalDecimalInput(values.box3BankDeposits);
  const box3InvestmentsAndOtherAssets = parseOptionalDecimalInput(
    values.box3InvestmentsAndOtherAssets,
  );
  const box3Debts = parseOptionalDecimalInput(values.box3Debts);

  if (values.showInvestmentDeepDive) {
    if (
      !Number.isFinite(annualReturnPercent) ||
      annualReturnPercent < 0 ||
      annualReturnPercent > 20
    ) {
      errors.annualReturnPercent = "Gebruik een verwacht rendement tussen 0 en 20 procent.";
    }
  }

  if (values.showInvestmentDeepDive && values.includeBox3Effect) {
    if (
      taxYear === undefined ||
      !Number.isFinite(taxYear) ||
      Math.round(taxYear) < 2000 ||
      Math.round(taxYear) > 2200
    ) {
      errors.taxYear = "Gebruik een geldig belastingjaar.";
    }
    if (
      box3BankDeposits === undefined ||
      !Number.isFinite(box3BankDeposits) ||
      box3BankDeposits < 0
    ) {
      errors.box3BankDeposits = "Gebruik 0 of een hoger bedrag.";
    }
    if (
      box3InvestmentsAndOtherAssets === undefined ||
      !Number.isFinite(box3InvestmentsAndOtherAssets) ||
      box3InvestmentsAndOtherAssets < 0
    ) {
      errors.box3InvestmentsAndOtherAssets = "Gebruik 0 of een hoger bedrag.";
    }
    if (box3Debts === undefined || !Number.isFinite(box3Debts) || box3Debts < 0) {
      errors.box3Debts = "Gebruik 0 of een hoger bedrag.";
    }
  }

  return {
    errors,
    parsed:
      Object.keys(errors).length === 0
        ? {
            loanAmount,
            interestRatePercent,
            loanTermYears,
            annualReturnPercent: values.showInvestmentDeepDive ? annualReturnPercent : undefined,
            includeInvestmentScenario: values.showInvestmentDeepDive,
            box3EffectEnabled: values.showInvestmentDeepDive && values.includeBox3Effect,
            taxYear:
              values.showInvestmentDeepDive && values.includeBox3Effect
                ? Math.round(taxYear ?? 0)
                : undefined,
            hasFiscalPartner:
              values.showInvestmentDeepDive && values.includeBox3Effect
                ? values.hasFiscalPartner
                : undefined,
            box3Method:
              values.showInvestmentDeepDive && values.includeBox3Effect
                ? values.box3Method
                : undefined,
            box3BankDeposits:
              values.showInvestmentDeepDive && values.includeBox3Effect
                ? (box3BankDeposits ?? 0)
                : undefined,
            box3InvestmentsAndOtherAssets:
              values.showInvestmentDeepDive && values.includeBox3Effect
                ? (box3InvestmentsAndOtherAssets ?? 0)
                : undefined,
            box3Debts:
              values.showInvestmentDeepDive && values.includeBox3Effect
                ? (box3Debts ?? 0)
                : undefined,
          }
        : null,
  };
}

export default function Calculator() {
  const [formValues, setFormValues] = useState<FormState>(defaults);
  const validation = validate(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsed } = validation;
  const result = useMemo(
    () => (parsed ? calculateMortgageComparison(parsed) : null),
    [parsed],
  );

  const chartSeries = result?.investmentScenario
    ? [
        {
          color: "oklch(46% 0.07 232)",
          points: result.investmentScenario.yearly.map((entry) => entry.annuityNettoSum),
        },
        {
          color: "oklch(54% 0.10 152)",
          points: result.investmentScenario.yearly.map((entry) => entry.linearNettoSum),
        },
      ]
    : null;
  const chartYTicks = result?.investmentScenario
    ? getAdaptiveEuroTicks(
        Math.max(
          ...result.investmentScenario.yearly.map((entry) => entry.annuityNettoSum),
          ...result.investmentScenario.yearly.map((entry) => entry.linearNettoSum),
        ),
      )
    : [];
  const lastYear = result?.investmentScenario?.yearly.at(-1)?.year ?? 0;
  const adaptiveYears = getAdaptiveYearTicks(lastYear);
  const chartYearTicks = adaptiveYears
    .filter((year) => year > 0)
    .filter((year) => result?.investmentScenario?.yearly.some((entry) => entry.year === year));

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyExampleValues() {
    setFormValues(exampleValues);
  }

  function goToResult() {
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Scenario
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Vergelijk twee hypotheekroutes
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze tool zet annuïtair en lineair naast elkaar. Je ziet niet alleen de
            eerste maandlast, maar ook wat het verschil in de tijd doet en hoeveel
            ruimte een beleggingspot kan opvangen.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          <span>Start leeg en vul snel een voorbeeldscenario in.</span>
          <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
            Voorbeeld invullen
          </ToolActionButton>
        </div>
      }
      inputs={
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekbedrag
            </span>
            <input
              inputMode="decimal"
              value={formValues.loanAmount}
              onChange={(event) => updateField("loanAmount", event.target.value)}
              aria-invalid={Boolean(errors.loanAmount)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.loanAmount} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekrente per jaar (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.interestRatePercent}
              onChange={(event) =>
                updateField("interestRatePercent", event.target.value)
              }
              aria-invalid={Boolean(errors.interestRatePercent)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.interestRatePercent} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Looptijd in jaren
            </span>
            <input
              inputMode="decimal"
              value={formValues.loanTermYears}
              onChange={(event) => updateField("loanTermYears", event.target.value)}
              aria-invalid={Boolean(errors.loanTermYears)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.loanTermYears} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verdieping
            </span>
            <span className="flex items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.showInvestmentDeepDive}
                onChange={(event) => updateField("showInvestmentDeepDive", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Toon verdieping: netto lastverschil maandelijks beleggen/onttrekken
            </span>
          </label>

          {formValues.showInvestmentDeepDive ? (
            <>
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Verwacht rendement beleggingspot (%)
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.annualReturnPercent}
                  onChange={(event) =>
                    updateField("annualReturnPercent", event.target.value)
                  }
                  aria-invalid={Boolean(errors.annualReturnPercent)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.annualReturnPercent} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 meenemen (optioneel)
                </span>
                <span className="flex items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[14px] text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={formValues.includeBox3Effect}
                    onChange={(event) => updateField("includeBox3Effect", event.target.checked)}
                    className="size-4 accent-[var(--accent)]"
                  />
                  Neem jaarlijks indicatief box 3-effect mee op de beleggingspot
                </span>
              </label>

              {formValues.includeBox3Effect ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                      Belastingjaar
                    </span>
                    <input
                      inputMode="numeric"
                      value={formValues.taxYear}
                      onChange={(event) => updateField("taxYear", event.target.value)}
                      aria-invalid={Boolean(errors.taxYear)}
                      className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                    />
                    <FieldError message={errors.taxYear} />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                      Fiscale partner
                    </span>
                    <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                      <input
                        type="checkbox"
                        checked={formValues.hasFiscalPartner}
                        onChange={(event) => updateField("hasFiscalPartner", event.target.checked)}
                        className="size-4 accent-[var(--accent)]"
                      />
                      Ja
                    </span>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                      Box 3-methode
                    </span>
                    <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                      <input
                        type="checkbox"
                        checked={formValues.box3Method === "forfaitary"}
                        onChange={(event) =>
                          updateField("box3Method", event.target.checked ? "forfaitary" : "actual")
                        }
                        className="size-4 accent-[var(--accent)]"
                      />
                      Gebruik vaste percentages (forfaitair)
                    </span>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Box 3 banktegoeden</span>
                    <input inputMode="decimal" value={formValues.box3BankDeposits} onChange={(event) => updateField("box3BankDeposits", event.target.value)} aria-invalid={Boolean(errors.box3BankDeposits)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
                    <FieldError message={errors.box3BankDeposits} />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Box 3 beleggingen/overige bezittingen</span>
                    <input inputMode="decimal" value={formValues.box3InvestmentsAndOtherAssets} onChange={(event) => updateField("box3InvestmentsAndOtherAssets", event.target.value)} aria-invalid={Boolean(errors.box3InvestmentsAndOtherAssets)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
                    <FieldError message={errors.box3InvestmentsAndOtherAssets} />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Box 3 schulden</span>
                    <input inputMode="decimal" value={formValues.box3Debts} onChange={(event) => updateField("box3Debts", event.target.value)} aria-invalid={Boolean(errors.box3Debts)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
                    <FieldError message={errors.box3Debts} />
                  </label>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      }
      submitAction={
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hair)] pt-5">
          <ToolActionButton type="button" onClick={goToResult} disabled={!result} variant="secondary" full className="md:hidden">
            Bekijk uitkomst
          </ToolActionButton>
          <p className="text-[12.5px] leading-[1.65] text-[var(--muted)]">
            De bestaande hypotheeklogica rekent met een vaste belastingfactor en een
            maandelijkse beleggingspot op basis van het netto verschil tussen beide
            routes. Dat maakt de keuze vergelijkbaar en transparant.
          </p>
        </div>
      }
      result={
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Eerste maand
            </div>
            {result ? (
              <Pill
                tone={
                  result.firstMonth.monthlyDifferenceNetto >= 0 ? "pos" : "neg"
                }
              >
                {result.firstMonth.monthlyDifferenceNetto >= 0
                  ? "Annuïtair netto lager"
                  : "Lineair netto lager"}
              </Pill>
            ) : null}
          </div>

          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.firstMonth.annuityNetto)}
              </div>
              <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.7] text-white/75">
                Netto annuïteit in maand 1. Lineair komt in deze opzet uit op{" "}
                {formatCurrency(result.firstMonth.linearNetto)} en het netto verschil
                is {formatCurrency(result.firstMonth.monthlyDifferenceNetto)} per maand.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige invoerwaarden in om de vergelijking te tonen.
            </p>
          )}
        </div>
      }
      details={
        <>
        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Kernuitkomsten
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Hiermee zie je wat de hypotheekvorm doet met rente, maandlast en de
            eventuele buffer die je opbouwt als annuïtair netto goedkoper uitvalt.
          </p>

          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Annuïtair bruto maand 1"
                value={formatCurrency(result.firstMonth.annuityBruto)}
                sub={`Netto ${formatCurrency(result.firstMonth.annuityNetto)}`}
              />
              <ResultRow
                label="Lineair bruto maand 1"
                value={formatCurrency(result.firstMonth.linearBruto)}
                sub={`Netto ${formatCurrency(result.firstMonth.linearNetto)}`}
              />
              <ResultRow
                label="Rentvoordeel lineair"
                value={formatCurrency(result.totals.interestBenefitLinear)}
                sub="Lagere totale rente over de hele looptijd"
                accent
              />
              {result.investmentScenario ? (
                <>
                  <ResultRow
                    label="Eindwaarde beleggingspot"
                    value={formatCurrency(result.totals.endPot)}
                    sub={`Maximale stand ${formatCurrency(result.totals.maxPot)}`}
                    accent={result.totals.endPot > 0}
                  />
                  <ResultRow
                    label="Omslagmaand"
                    value={
                      result.totals.omslagMaand
                        ? `maand ${result.totals.omslagMaand}`
                        : "geen omslag"
                    }
                    sub="Eerste maand waarop lineair netto goedkoper wordt"
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {result?.investmentScenario && chartSeries ? (
          <DisclosureSection
            title="Verdieping: netto jaarlasten annuïtair vs lineair"
            subtitle="Uitklapbare grafiek per jaar, alleen zichtbaar als verdieping is ingevuld."
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Jaarlast in de tijd
                </div>
                <div className="mt-1 font-serif text-[20px] tracking-[-0.015em] text-[var(--ink)]">
                  Netto per jaar: annuïtair vs lineair
                </div>
              </div>
              <ChartLegend
                items={[
                  { label: "Annuïtair", color: "oklch(46% 0.07 232)" },
                  { label: "Lineair", color: "oklch(54% 0.10 152)" },
                ]}
              />
            </div>

            <ChartContainer
              yearTicks={chartYearTicks}
              xValues={result.investmentScenario.yearly.map((entry) => entry.year)}
              chart={
                <div className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
                  <div className="hidden flex-col justify-between text-right text-[11px] text-[var(--soft)] sm:flex">
                    {chartYTicks
                      .slice()
                      .reverse()
                      .map((tick) => (
                        <span key={tick}>{formatCompactEuro(tick)}</span>
                      ))}
                  </div>
                  <div className="min-w-0">
                    <AreaChart
                      width={620}
                      height={220}
                      series={chartSeries}
                      yTicks={chartYTicks}
                      xValues={result.investmentScenario.yearly.map((entry) => entry.year)}
                      seriesLabels={["Annuïtair netto", "Lineair netto"]}
                    />
                  </div>
                </div>
              }
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted)] sm:hidden">
              <span>X-as: jaren</span>
              <span>
                Y-as: {formatCompactEuro(chartYTicks[0] ?? 0)} tot{" "}
                {formatCompactEuro(chartYTicks.at(-1) ?? 0)}
              </span>
            </div>
          </DisclosureSection>
        ) : null}

        {result?.investmentScenario ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[22px] tracking-[-0.02em] text-[var(--ink)]">
              Verdieping: verschil beleggen en later opnemen
            </h3>
            <div className="mt-4">
              <ResultRow label="Eindwaarde beleggingspot" value={formatCurrency(result.investmentScenario.endPotAfterBox3)} accent />
              <ResultRow label="Totale inleg vanuit netto lastverschil" value={formatCurrency(result.investmentScenario.totalInleg)} />
              <ResultRow label="Totale onttrekking in duurdere fase" value={formatCurrency(result.investmentScenario.totalOnttrekking)} />
              <ResultRow label="Totaal rendement" value={formatCurrency(result.investmentScenario.totalRendement)} />
              {result.investmentScenario.box3EffectEnabled ? (
                <ResultRow label="Cumulatief extra box 3-effect" value={formatCurrency(result.investmentScenario.totalBox3TaxExtra)} />
              ) : null}
            </div>
          </div>
        ) : null}

        <DisclosureSection
          title="Hoe rekenen we dit?"
          subtitle="We vergelijken beide hypotheekroutes over dezelfde looptijd en rente."
        >
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            We vergelijken annuïtair en lineair over dezelfde looptijd en rente. Daarna
            tonen we per jaar het netto verschil in maandlast en de groei van de eventuele
            beleggingspot uit dat verschil.
          </p>
        </DisclosureSection>

        <DisclosureSection
          title="Welke aannames gebruiken we?"
          subtitle="Vaste belastingfactor en vast verwacht rendement voor een zuivere vergelijking."
        >
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze vergelijking gebruikt een vaste belastingfactor en een vast verwacht
            rendement op de beleggingspot. Het is bedoeld als scenariovergelijking, niet
            als offerte of persoonlijk advies.
          </p>
        </DisclosureSection>

        <DisclosureSection
          title="Waar moet je op letten?"
          subtitle="Werkelijke voorwaarden kunnen de uitkomst verschuiven."
        >
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool is een vereenvoudigde vergelijking. Werkelijke belastingeffecten,
            rentevaste periodes en productvoorwaarden kunnen de uitkomst verschuiven.
            Gebruik dit vooral om je scenario scherper te krijgen.
          </p>
        </DisclosureSection>
        </>
      }
    />
  );
}
