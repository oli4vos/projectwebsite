"use client";

import { useMemo } from "react";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import { AreaChart, getAdaptiveEuroTicks, getAdaptiveYearTicks } from "@/components/charts";
import { DisclosureSection } from "@/components/DisclosureSection";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { FieldError } from "@/components/forms/FieldError";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateMortgageDeductionAbolitionImpact } from "./logic";

type FormState = {
  taxYear: string;
  firstMortgageYear: string;
  taxableIncome: string;
  remainingMortgageDebt: string;
  mortgageRatePercent: string;
  mortgageType: "annuity" | "linear" | "interestOnly";
  remainingMortgageTermYears: string;
  annualMortgageInterestOverride: string;
  horizonYears: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  taxYear: String(getDefaultFinancialYear()),
  firstMortgageYear: String(getDefaultFinancialYear()),
  taxableIncome: "",
  remainingMortgageDebt: "",
  mortgageRatePercent: "",
  mortgageType: "annuity",
  remainingMortgageTermYears: "30",
  annualMortgageInterestOverride: "",
  horizonYears: "10",
};

const exampleValues: FormState = {
  taxYear: String(getDefaultFinancialYear()),
  firstMortgageYear: "2020",
  taxableIncome: "70000",
  remainingMortgageDebt: "350000",
  mortgageRatePercent: "4.0",
  mortgageType: "annuity",
  remainingMortgageTermYears: "30",
  annualMortgageInterestOverride: "",
  horizonYears: "10",
};

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function parseNumber(value: string) {
  return parseOptionalDecimalInput(value);
}

function validate(values: FormState) {
  const errors: ValidationErrors = {};
  const taxYear = parseNumber(values.taxYear);
  const firstMortgageYear = parseNumber(values.firstMortgageYear);
  const taxableIncome = parseNumber(values.taxableIncome);
  const remainingMortgageDebt = parseNumber(values.remainingMortgageDebt);
  const mortgageRatePercent = parseNumber(values.mortgageRatePercent);
  const remainingMortgageTermYears = parseNumber(values.remainingMortgageTermYears);
  const annualMortgageInterestOverride = parseNumber(values.annualMortgageInterestOverride);
  const horizonYears = parseNumber(values.horizonYears);

  if (taxYear === undefined || !Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2200) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }
  if (
    firstMortgageYear === undefined ||
    !Number.isFinite(firstMortgageYear) ||
    firstMortgageYear < 1980 ||
    firstMortgageYear > 2200
  ) {
    errors.firstMortgageYear = "Gebruik een geldig eerste hypotheekjaar.";
  }
  if (taxableIncome === undefined || !Number.isFinite(taxableIncome) || taxableIncome < 0) {
    errors.taxableIncome = "Gebruik 0 of een hoger belastbaar inkomen.";
  }
  if (
    remainingMortgageDebt === undefined ||
    !Number.isFinite(remainingMortgageDebt) ||
    remainingMortgageDebt <= 0
  ) {
    errors.remainingMortgageDebt = "Gebruik een hypotheekschuld groter dan 0.";
  }
  if (
    mortgageRatePercent === undefined ||
    !Number.isFinite(mortgageRatePercent) ||
    mortgageRatePercent <= 0 ||
    mortgageRatePercent > 25
  ) {
    errors.mortgageRatePercent = "Gebruik een rente tussen 0 en 25 procent.";
  }
  if (
    remainingMortgageTermYears === undefined ||
    !Number.isFinite(remainingMortgageTermYears) ||
    remainingMortgageTermYears < 1 ||
    remainingMortgageTermYears > 40
  ) {
    errors.remainingMortgageTermYears = "Gebruik een resterende looptijd tussen 1 en 40 jaar.";
  }
  if (
    annualMortgageInterestOverride !== undefined &&
    (!Number.isFinite(annualMortgageInterestOverride) || annualMortgageInterestOverride < 0)
  ) {
    errors.annualMortgageInterestOverride = "Gebruik 0 of een hoger jaarbedrag.";
  }
  if (
    horizonYears === undefined ||
    !Number.isFinite(horizonYears) ||
    horizonYears < 1 ||
    horizonYears > 40
  ) {
    errors.horizonYears = "Gebruik een horizon tussen 1 en 40 jaar.";
  }

  return {
    errors,
    parsed:
      Object.keys(errors).length === 0
        ? {
            taxYear: Math.round(taxYear ?? getDefaultFinancialYear()),
            firstMortgageYear: Math.round(firstMortgageYear ?? getDefaultFinancialYear()),
            taxableIncome: taxableIncome ?? 0,
            remainingMortgageDebt: remainingMortgageDebt ?? 0,
            mortgageRatePercent: mortgageRatePercent ?? 0,
            mortgageType: values.mortgageType,
            remainingMortgageTermYears: Math.round(remainingMortgageTermYears ?? 30),
            annualMortgageInterestOverride,
            horizonYears: Math.round(horizonYears ?? 10),
          }
        : null,
  };
}

export default function Calculator() {
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    submitContextMessage,
    setValues,
  } = useSubmittedCalculation<FormState>(defaultValues);

  const currentValidation = validate(formValues);
  const activeErrors = Object.fromEntries(
    Object.entries(currentValidation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const submittedValidation = submittedValues ? validate(submittedValues) : null;
  const result = useMemo(
    () =>
      submittedValidation?.parsed
        ? calculateMortgageDeductionAbolitionImpact(submittedValidation.parsed)
        : null,
    [submittedValidation],
  );

  const chartSeries = result
    ? [
        {
          color: "oklch(0.56 0.18 28)",
          points: result.timeline.map((point) => point.netInterestWithoutDeduction),
        },
        {
          color: "oklch(0.46 0.07 232)",
          points: result.timeline.map((point) => point.netInterestWithDeduction),
        },
      ]
    : null;
  const chartYTicks = result
    ? getAdaptiveEuroTicks(
        Math.max(
          ...result.timeline.map((point) => point.netInterestWithoutDeduction),
          ...result.timeline.map((point) => point.netInterestWithDeduction),
        ),
      )
    : [];
  const yearTicks = result ? getAdaptiveYearTicks(result.horizonYears) : [];

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyExampleValues() {
    setValues(exampleValues, "Voorbeeldwaarden geladen. Klik op Bereken om de uitkomst te zien.");
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
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Scenario</div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Wat als hypotheekrenteaftrek stopt?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze tool laat indicatief zien wat je netto rentelast wordt met en zonder hypotheekrenteaftrek.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          <span>Start leeg of laad een voorbeeld.</span>
          <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
            Start met voorbeeldwaarden
          </ToolActionButton>
        </div>
      }
      inputs={
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Belastingjaar</span>
            <input inputMode="numeric" value={formValues.taxYear} onChange={(event) => updateField("taxYear", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.taxYear} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Eerste hypotheekjaar</span>
            <input inputMode="numeric" value={formValues.firstMortgageYear} onChange={(event) => updateField("firstMortgageYear", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.firstMortgageYear} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Belastbaar inkomen</span>
            <input inputMode="decimal" value={formValues.taxableIncome} onChange={(event) => updateField("taxableIncome", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.taxableIncome} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Resterende hypotheekschuld</span>
            <input inputMode="decimal" value={formValues.remainingMortgageDebt} onChange={(event) => updateField("remainingMortgageDebt", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.remainingMortgageDebt} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Hypotheekrente per jaar (%)</span>
            <input inputMode="decimal" value={formValues.mortgageRatePercent} onChange={(event) => updateField("mortgageRatePercent", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.mortgageRatePercent} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Hypotheekvorm</span>
            <select value={formValues.mortgageType} onChange={(event) => updateField("mortgageType", event.target.value as FormState["mortgageType"])} className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none">
              <option value="annuity">Annuïtair</option>
              <option value="linear">Lineair</option>
              <option value="interestOnly">Aflossingsvrij</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Resterende hypotheeklooptijd (jaren)</span>
            <input inputMode="decimal" value={formValues.remainingMortgageTermYears} onChange={(event) => updateField("remainingMortgageTermYears", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.remainingMortgageTermYears} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Jaarlijkse bruto rente (optionele override)</span>
            <input inputMode="decimal" value={formValues.annualMortgageInterestOverride} onChange={(event) => updateField("annualMortgageInterestOverride", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.annualMortgageInterestOverride} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Horizon (jaren)</span>
            <input inputMode="decimal" value={formValues.horizonYears} onChange={(event) => updateField("horizonYears", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
            <FieldError message={activeErrors.horizonYears} />
          </label>
        </div>
      }
      submitAction={
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hair)] pt-5">
          <ToolActionButton type="button" onClick={() => { submit(); if (currentValidation.parsed) goToResult(); }} variant="accent" size="md">
            {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
          </ToolActionButton>
          <p className="text-[12.5px] text-[var(--muted)]">De tool rekent alleen met ingevulde gegevens.</p>
        </div>
      }
      result={
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Beknopte samenvatting</div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.cumulativeDifference)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Indicatief extra netto rentelast over {result.horizonYears} jaar als hypotheekrenteaftrek wegvalt.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul in wat je weet en klik op Bereken.
            </p>
          )}
        </div>
      }
      details={
        <>
          {submitContextMessage ? (
            <p className="text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
          ) : null}
          {hasDirtyChanges ? (
            <p className="text-[12.5px] text-[var(--muted)]">Klik opnieuw op Bereken om de uitkomst te vernieuwen.</p>
          ) : null}

          {result ? (
            <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
              <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">Kernuitkomsten</h3>
              <div className="mt-4">
                <ResultRow label="Bruto rente per jaar (gebruikt)" value={formatCurrency(result.annualGrossInterestUsed)} />
                <ResultRow label="Aftrekvoordeel per jaar (nu)" value={formatCurrency(result.annualTaxBenefitNow)} />
                <ResultRow label="Netto rente mét aftrek" value={formatCurrency(result.annualNetCostWithDeduction)} />
                <ResultRow label="Netto rente zonder aftrek" value={formatCurrency(result.annualNetCostWithoutDeduction)} />
                <ResultRow label="Jaarverschil zonder aftrek" value={formatCurrency(result.annualDifference)} accent />
                <ResultRow label="Hypotheekvorm" value={result.mortgageType === "annuity" ? "Annuïtair" : result.mortgageType === "linear" ? "Lineair" : "Aflossingsvrij"} />
                <ResultRow label="Resterende hypotheeklooptijd" value={`${result.remainingMortgageTermYears} jaar`} />
                <ResultRow label="Eerste hypotheekjaar" value={String(result.firstMortgageYear)} />
                <ResultRow label="Resterende jaren renteaftrek" value={`${result.remainingDeductionYears} jaar`} />
              </div>
            </div>
          ) : null}

          {result && chartSeries ? (
            <DisclosureSection
              title="Verdieping: netto rentelast per jaar"
              subtitle="Grafiek met scenario mét en zonder renteaftrek."
            >
              <div className="flex items-center justify-between gap-4">
                <ChartLegend
                  items={[
                    { label: "Zonder aftrek", color: "oklch(0.56 0.18 28)" },
                    { label: "Met aftrek", color: "oklch(0.46 0.07 232)" },
                  ]}
                />
              </div>
              <ChartContainer
                yearTicks={yearTicks}
                xValues={result.timeline.map((point) => point.yearOffset)}
                chart={
                  <div className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
                    <div className="hidden flex-col justify-between text-right text-[11px] text-[var(--soft)] sm:flex">
                      {chartYTicks.slice().reverse().map((tick) => (
                        <span key={tick}>{formatCurrency(tick)}</span>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <AreaChart
                        width={620}
                        height={220}
                        series={chartSeries}
                        yTicks={chartYTicks}
                        xValues={result.timeline.map((point) => point.yearOffset)}
                        seriesLabels={["Zonder aftrek", "Met aftrek"]}
                      />
                    </div>
                  </div>
                }
              />
            </DisclosureSection>
          ) : null}

          <DisclosureSection
            title="Hoe rekenen we dit?"
            subtitle="Centrale tax-laag voor aftrekberekening, gelijkblijvende bruto rente als vereenvoudiging."
          >
            <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <li>We schatten eerst je jaarlijkse bruto hypotheekrente.</li>
              <li>Die schatting volgt je hypotheekvorm (annuïtair, lineair of aflossingsvrij) en resterende looptijd.</li>
              <li>Daarna berekenen we indicatief het aftrekvoordeel via de centrale tax-laag, alleen zolang je nog aftrekjaren hebt.</li>
              <li>Scenario zonder aftrek = bruto rente als netto kostenpost.</li>
            </ul>
          </DisclosureSection>

          {result ? (
            <DisclosureSection title="Waar moet je op letten?" subtitle="Indicatieve scenariovergelijking, geen officieel advies.">
              <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </DisclosureSection>
          ) : null}
        </>
      }
    />
  );
}
