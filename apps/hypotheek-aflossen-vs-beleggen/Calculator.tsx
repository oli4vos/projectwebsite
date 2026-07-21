"use client";

import { useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatChartEuro, formatChartYear } from "@/lib/chart-utils";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getHypotheekAflossenVsBeleggenDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  calculateHypotheekAflossenVsBeleggen,
  type HypotheekAflossenVsBeleggenInput,
  type HypotheekAflossenVsBeleggenTimelinePoint,
} from "./logic";

type FormState = {
  remainingMortgageDebt: string;
  mortgageRate: string;
  remainingTermYears: string;
  oneTimeExtraRepayment: string;
  annualExtraRepayment: string;
  taxableIncome: string;
  includeMortgageInterestDeduction: boolean;
  expectedAnnualReturn: string;
  investmentHorizonYears: string;
  includeBox3Effect: boolean;
  currentInvestableAssets: string;
  hasFiscalPartner: boolean;
  taxYear: string;
  keepBuffer: boolean;
  minimumBuffer: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  remainingMortgageDebt: "300000",
  mortgageRate: "4",
  remainingTermYears: "25",
  oneTimeExtraRepayment: "10000",
  annualExtraRepayment: "2400",
  taxableIncome: "60000",
  includeMortgageInterestDeduction: true,
  expectedAnnualReturn: "5",
  investmentHorizonYears: "20",
  includeBox3Effect: true,
  currentInvestableAssets: "30000",
  hasFiscalPartner: false,
  taxYear: String(getDefaultFinancialYear()),
  keepBuffer: true,
  minimumBuffer: "15000",
};

const defaultValues: FormState = {
  remainingMortgageDebt: "",
  mortgageRate: "",
  remainingTermYears: "",
  oneTimeExtraRepayment: "",
  annualExtraRepayment: "",
  taxableIncome: "",
  includeMortgageInterestDeduction: true,
  expectedAnnualReturn: "",
  investmentHorizonYears: "",
  includeBox3Effect: true,
  currentInvestableAssets: "",
  hasFiscalPartner: false,
  taxYear: "",
  keepBuffer: true,
  minimumBuffer: "",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

function parseOptionalNumber(value: string | undefined) {
  return parseOptionalDecimalInput(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildLinePath(values: number[], width: number, height: number, maxValue: number) {
  if (values.length === 0 || maxValue <= 0) {
    return "";
  }
  const xStep = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((value, index) => {
      const x = index * xStep;
      const y = height - (Math.max(value, 0) / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function TimelineMiniChart({
  points,
}: {
  points: HypotheekAflossenVsBeleggenTimelinePoint[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const width = 320;
  const height = 120;
  const investingValues = points.map((point) => point.investingPortfolioNetAfterBox3);
  const aflossenValues = points.map((point) => point.cumulativeNetBenefitAflossen);
  const maxValue = Math.max(1, ...investingValues, ...aflossenValues);
  const investingPath = buildLinePath(investingValues, width, height, maxValue);
  const aflossenPath = buildLinePath(aflossenValues, width, height, maxValue);
  const xStep = points.length > 1 ? width / (points.length - 1) : width;

  return (
    <div className="relative rounded-xl border hair bg-[var(--paper-soft)] p-3">
      <ChartContainer
        className="overflow-x-auto"
        yearTicks={points.map((point) => point.year)}
        xValues={points.map((point) => point.year)}
        chart={
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-32 w-full"
            role="img"
            aria-label="Jaarlijkse ontwikkeling netto beleggen na box 3 versus netto voordeel aflossen"
            onMouseLeave={() => setActiveIndex(null)}
          >
            <path d={aflossenPath} fill="none" stroke="#2f7f5f" strokeWidth="2.5" />
            <path d={investingPath} fill="none" stroke="#1f3f8f" strokeWidth="2.5" />
            {points.map((point, index) => {
              const x = index * xStep;
              return (
                <rect
                  key={point.year}
                  x={x - xStep / 2}
                  y={0}
                  width={Math.max(xStep, 10)}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setActiveIndex(index)}
                  onTouchStart={() => setActiveIndex(index)}
                />
              );
            })}
          </svg>
        }
      />
      {activeIndex !== null ? (
        <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-[var(--hair)] bg-white/95 px-3 py-2 text-[12px] shadow-paper">
          <div className="font-medium text-[var(--ink)]">
            {formatChartYear(points[activeIndex]?.year ?? activeIndex + 1)}
          </div>
          <div className="mt-1 space-y-1 text-[var(--muted)]">
            <div>Beleggen (na box 3): {formatChartEuro(points[activeIndex]?.investingPortfolioNetAfterBox3 ?? 0)}</div>
            <div>Netto voordeel aflossen: {formatChartEuro(points[activeIndex]?.cumulativeNetBenefitAflossen ?? 0)}</div>
          </div>
        </div>
      ) : null}
      <ChartLegend
        className="mt-2 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]"
        items={[
          { label: "Beleggen (na box 3)", color: "#1f3f8f" },
          { label: "Netto voordeel aflossen", color: "#2f7f5f" },
        ]}
      />
    </div>
  );
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const remainingMortgageDebt = parseOptionalNumber(values.remainingMortgageDebt);
  const mortgageRate = parseOptionalNumber(values.mortgageRate);
  const remainingTermYears = parseOptionalNumber(values.remainingTermYears);
  const oneTimeExtraRepayment = parseOptionalNumber(values.oneTimeExtraRepayment);
  const annualExtraRepayment = parseOptionalNumber(values.annualExtraRepayment);
  const taxableIncome = parseOptionalNumber(values.taxableIncome);
  const expectedAnnualReturn = parseOptionalNumber(values.expectedAnnualReturn);
  const investmentHorizonYears = parseOptionalNumber(values.investmentHorizonYears);
  const currentInvestableAssets = parseOptionalNumber(values.currentInvestableAssets);
  const taxYear = parseOptionalNumber(values.taxYear);
  const minimumBuffer = parseOptionalNumber(values.minimumBuffer);

  for (const [field, value] of [
    ["remainingMortgageDebt", remainingMortgageDebt],
    ["oneTimeExtraRepayment", oneTimeExtraRepayment],
    ["annualExtraRepayment", annualExtraRepayment],
    ["taxableIncome", taxableIncome],
    ["currentInvestableAssets", currentInvestableAssets],
    ["minimumBuffer", minimumBuffer],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      errors[field] = "Gebruik 0 of een hoger bedrag.";
    }
  }

  if (
    mortgageRate === undefined ||
    !Number.isFinite(mortgageRate) ||
    mortgageRate < 0 ||
    mortgageRate > 100
  ) {
    errors.mortgageRate = "Gebruik een rente tussen 0 en 100.";
  }
  if (
    remainingTermYears === undefined ||
    !Number.isFinite(remainingTermYears) ||
    remainingTermYears <= 0 ||
    remainingTermYears > 60
  ) {
    errors.remainingTermYears = "Gebruik een looptijd tussen 1 en 60 jaar.";
  }
  if (
    expectedAnnualReturn === undefined ||
    !Number.isFinite(expectedAnnualReturn) ||
    expectedAnnualReturn < 0 ||
    expectedAnnualReturn > 100
  ) {
    errors.expectedAnnualReturn = "Gebruik een rendement tussen 0 en 100.";
  }
  if (
    investmentHorizonYears === undefined ||
    !Number.isFinite(investmentHorizonYears) ||
    investmentHorizonYears <= 0 ||
    investmentHorizonYears > 60
  ) {
    errors.investmentHorizonYears = "Gebruik een horizon tussen 1 en 60 jaar.";
  }
  if (
    taxYear === undefined ||
    !Number.isFinite(taxYear) ||
    taxYear < 2000 ||
    taxYear > 2200
  ) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }

  const parsedValues: HypotheekAflossenVsBeleggenInput | null =
    Object.keys(errors).length === 0
      ? {
          remainingMortgageDebt: remainingMortgageDebt ?? 0,
          mortgageRate: mortgageRate ?? 0,
          remainingTermYears: remainingTermYears ?? 0,
          oneTimeExtraRepayment: oneTimeExtraRepayment ?? 0,
          annualExtraRepayment: annualExtraRepayment ?? 0,
          taxableIncome: taxableIncome ?? 0,
          includeMortgageInterestDeduction: values.includeMortgageInterestDeduction,
          expectedAnnualReturn: expectedAnnualReturn ?? 0,
          investmentHorizonYears: investmentHorizonYears ?? 0,
          includeBox3Effect: values.includeBox3Effect,
          currentInvestableAssets: currentInvestableAssets ?? 0,
          hasFiscalPartner: values.hasFiscalPartner,
          taxYear: taxYear ?? getDefaultFinancialYear(),
          keepBuffer: values.keepBuffer,
          minimumBuffer: minimumBuffer ?? 0,
        }
      : null;

  return { errors, parsedValues };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-red-700">{message}</p>;
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getHypotheekAflossenVsBeleggenDefaultsFromProfile(profile);
  const { hasRelevantProfileValues, profileKey, initialValues } =
    createProfilePrefillState<FormState>({
      defaultValues,
      profilePatch,
      hasProfile,
      profileUpdatedAt: profile.updatedAt,
    });

  return (
    <CalculatorContent
      key={profileKey}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      profilePatch={profilePatch}
    />
  );
}

function CalculatorContent({
  initialValues,
  hasRelevantProfileValues,
  profilePatch,
}: CalculatorContentProps) {
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    submitContextMessage,
    setValues,
  } = useSubmittedCalculation<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const submittedValidation = submittedValues ? validateForm(submittedValues) : null;
  const result = submittedValidation?.parsedValues
    ? calculateHypotheekAflossenVsBeleggen(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "remainingMortgageDebt",
    "mortgageRate",
    "remainingTermYears",
    "oneTimeExtraRepayment",
    "annualExtraRepayment",
    "taxableIncome",
    "includeMortgageInterestDeduction",
    "expectedAnnualReturn",
    "investmentHorizonYears",
    "includeBox3Effect",
    "currentInvestableAssets",
    "hasFiscalPartner",
    "taxYear",
    "keepBuffer",
    "minimumBuffer",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      remainingMortgageDebt: errors.remainingMortgageDebt,
      mortgageRate: errors.mortgageRate,
      remainingTermYears: errors.remainingTermYears,
      oneTimeExtraRepayment: errors.oneTimeExtraRepayment,
      annualExtraRepayment: errors.annualExtraRepayment,
      taxableIncome: errors.taxableIncome,
      expectedAnnualReturn: errors.expectedAnnualReturn,
      investmentHorizonYears: errors.investmentHorizonYears,
      currentInvestableAssets: errors.currentInvestableAssets,
      taxYear: errors.taxYear,
      minimumBuffer: errors.minimumBuffer,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setValues(
      mergeProfilePatchIntoValues(formValues, profilePatch),
      "Profiel ingevuld. Klik op Bereken om de uitkomst te zien.",
    );
  }

  function applyExampleValues() {
    setValues(exampleValues, "Voorbeeld ingevuld. Klik op Bereken om de uitkomst te zien.");
  }

  function goToResult() {
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCalculate() {
    submit();
    if (parsedValues) {
      goToResult();
    }
  }

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Hypotheekkeuze
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Hypotheek aflossen of beleggen?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Extra aflossen geeft vaak meer rust, beleggen kan meer flexibiliteit en
            groei geven. Deze tool vergelijkt beide routes met renteaftrek en
            optioneel box 3-effect.
          </p>
        </>
      }
      startActions={
        <>
          {hasRelevantProfileValues ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              <span>Profielwaarden gevonden in deze browser.</span>
              <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
                Voorbeeld invullen
              </ToolActionButton>
              <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">
                Gebruik profiel
              </ToolActionButton>
            </div>
          ) : null}
          {!hasRelevantProfileValues ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              <span>Start leeg en vul snel een voorbeeldscenario in.</span>
              <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
                Voorbeeld invullen
              </ToolActionButton>
            </div>
          ) : null}
          {submitContextMessage ? (
            <p className="text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
          ) : null}
          {hasDirtyChanges ? (
            <p className="text-[12.5px] text-[var(--muted)]">
              Klik opnieuw op Bereken om de uitkomst te vernieuwen.
            </p>
          ) : null}
        </>
      }
      inputs={
        <div className="grid gap-5">
          <label className={mobileFlow.getFieldClassName("remainingMortgageDebt")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende hypotheekschuld
            </span>
            <input
              inputMode="decimal"
              value={formValues.remainingMortgageDebt}
              onChange={(event) => updateField("remainingMortgageDebt", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("remainingMortgageDebt", Boolean(errors.remainingMortgageDebt))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingMortgageDebt} />
          </label>

          <label className={mobileFlow.getFieldClassName("mortgageRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekrente (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.mortgageRate}
              onChange={(event) => updateField("mortgageRate", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("mortgageRate", Boolean(errors.mortgageRate))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.mortgageRate} />
          </label>

          <label className={mobileFlow.getFieldClassName("remainingTermYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende looptijd (jaren)
            </span>
            <input
              inputMode="numeric"
              value={formValues.remainingTermYears}
              onChange={(event) => updateField("remainingTermYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("remainingTermYears", Boolean(errors.remainingTermYears))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingTermYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("oneTimeExtraRepayment")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Eenmalig extra aflossen
            </span>
            <input
              inputMode="decimal"
              value={formValues.oneTimeExtraRepayment}
              onChange={(event) => updateField("oneTimeExtraRepayment", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("oneTimeExtraRepayment", Boolean(errors.oneTimeExtraRepayment))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.oneTimeExtraRepayment} />
          </label>

          <label className={mobileFlow.getFieldClassName("annualExtraRepayment")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Jaarlijks extra aflossen
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualExtraRepayment}
              onChange={(event) => updateField("annualExtraRepayment", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("annualExtraRepayment", Boolean(errors.annualExtraRepayment))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualExtraRepayment} />
          </label>

          <label className={mobileFlow.getFieldClassName("taxableIncome")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastbaar inkomen
            </span>
            <input
              inputMode="decimal"
              value={formValues.taxableIncome}
              onChange={(event) => updateField("taxableIncome", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("taxableIncome", Boolean(errors.taxableIncome))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.taxableIncome} />
          </label>

          <label className={mobileFlow.getFieldClassName("includeMortgageInterestDeduction")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekrenteaftrek meenemen
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeMortgageInterestDeduction}
                onChange={(event) =>
                  updateField("includeMortgageInterestDeduction", event.target.checked)
                }
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("expectedAnnualReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement beleggen (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedAnnualReturn}
              onChange={(event) => updateField("expectedAnnualReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("expectedAnnualReturn", Boolean(errors.expectedAnnualReturn))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedAnnualReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("investmentHorizonYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beleggingshorizon (jaren)
            </span>
            <input
              inputMode="numeric"
              value={formValues.investmentHorizonYears}
              onChange={(event) => updateField("investmentHorizonYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("investmentHorizonYears", Boolean(errors.investmentHorizonYears))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.investmentHorizonYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("includeBox3Effect")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Box 3-effect meenemen
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeBox3Effect}
                onChange={(event) => updateField("includeBox3Effect", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("currentInvestableAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Huidige beleggingen/spaargeld
            </span>
            <input
              inputMode="decimal"
              value={formValues.currentInvestableAssets}
              onChange={(event) => updateField("currentInvestableAssets", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("currentInvestableAssets", Boolean(errors.currentInvestableAssets))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.currentInvestableAssets} />
          </label>

          <label className={mobileFlow.getFieldClassName("hasFiscalPartner")}>
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

          <label className={mobileFlow.getFieldClassName("taxYear")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingjaar
            </span>
            <input
              inputMode="numeric"
              value={formValues.taxYear}
              onChange={(event) => updateField("taxYear", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("taxYear", Boolean(errors.taxYear))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.taxYear} />
          </label>

          <label className={mobileFlow.getFieldClassName("keepBuffer")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Buffer behouden prioriteren
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.keepBuffer}
                onChange={(event) => updateField("keepBuffer", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("minimumBuffer")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Minimale buffer
            </span>
            <input
              inputMode="decimal"
              value={formValues.minimumBuffer}
              onChange={(event) => updateField("minimumBuffer", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("minimumBuffer", Boolean(errors.minimumBuffer))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.minimumBuffer} />
          </label>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            canComplete={Boolean(parsedValues)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={handleCalculate}
          />

        </div>
      }
      submitAction={
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hair)] pt-2">
          <ToolActionButton type="button" onClick={handleCalculate} variant="accent" size="md">
            {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
          </ToolActionButton>
          <p className="text-[12px] text-[var(--muted)]">
            De tool rekent alleen met ingevulde gegevens.
          </p>
        </div>
      }
      result={
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Samenvatting
            </div>
            {result ? (
              <Pill tone={result.recommendation === "beleggen" ? "pos" : result.recommendation === "aflossen" ? "accent" : "neg"}>
                {result.recommendation === "beleggen"
                  ? "Beleggen financieel hoger"
                  : result.recommendation === "aflossen"
                    ? "Aflossen financieel hoger"
                    : "Buffer eerst"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[28px] leading-none tracking-[-0.03em]">
                {result.summary}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Bij jouw aannames lijkt{" "}
                {result.differenceInvestingMinusAflossen >= 0 ? "beleggen" : "extra aflossen"}{" "}
                financieel gunstiger, maar{" "}
                {result.differenceInvestingMinusAflossen >= 0
                  ? "aflossen geeft vaak meer rust"
                  : "beleggen biedt meestal meer flexibiliteit"}
                .
              </p>
            </>
          ) : null}
        </div>
      }
      details={
        <>
        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Vergelijking
            </h3>
            <div className="mt-4">
              <ResultRow
                label="Netto voordeel extra aflossen"
                value={formatCurrency(result.netBenefitAflossen)}
                accent
              />
              <ResultRow
                label="Bruto rentebesparing aflossen"
                value={formatCurrency(result.grossInterestSaved)}
              />
              <ResultRow
                label="Gemiste hypotheekrenteaftrek"
                value={formatCurrency(result.lostMortgageInterestDeduction)}
              />
              <ResultRow
                label="Waarde beleggen (bruto)"
                value={formatCurrency(result.investingFutureValueGross)}
              />
              <ResultRow
                label="Waarde beleggen (na box 3)"
                value={formatCurrency(result.investingFutureValueNetAfterBox3)}
              />
              <ResultRow
                label="Verschil beleggen minus aflossen"
                value={formatCurrency(result.differenceInvestingMinusAflossen)}
                accent
              />
              <ResultRow
                label="Break-even rendement beleggen"
                value={
                  result.breakEvenAnnualReturn === null
                    ? "Niet binnen range"
                    : `${formatPercent(result.breakEvenAnnualReturn)}%`
                }
              />
            </div>
          </div>
        ) : null}

        <DisclosureSection
          title="Hoe rekenen we dit?"
          subtitle="Jaarlijkse vergelijking van aflossen en beleggen, inclusief box 3-correctie."
        >
          {result ? (
            <div className="space-y-3">
              <TimelineMiniChart points={result.timeline.points} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-separate border-spacing-y-1 text-left text-[12px]">
                  <thead>
                    <tr className="text-[var(--muted)]">
                      <th className="px-2 py-1 font-medium">Jaar</th>
                      <th className="px-2 py-1 font-medium">Aflossen netto cumulatief</th>
                      <th className="px-2 py-1 font-medium">Beleggen netto cumulatief</th>
                      <th className="px-2 py-1 font-medium">Box 3 dit jaar</th>
                      <th className="px-2 py-1 font-medium">Verschil (beleggen - aflossen)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.timeline.points.map((point) => (
                      <tr key={point.year} className="bg-[var(--paper-soft)] text-[var(--ink)]">
                        <td className="rounded-l-md px-2 py-1.5">{point.year}</td>
                        <td className="px-2 py-1.5">
                          {formatCurrency(point.cumulativeNetBenefitAflossen)}
                        </td>
                        <td className="px-2 py-1.5">
                          {formatCurrency(point.investingPortfolioNetAfterBox3)}
                        </td>
                        <td className="px-2 py-1.5">
                          {formatCurrency(point.additionalBox3TaxThisYear)}
                        </td>
                        <td className="rounded-r-md px-2 py-1.5">
                          {formatCurrency(point.differenceInvestingMinusAflossen)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </DisclosureSection>

        <DisclosureSection
          title="Welke aannames gebruiken we?"
          subtitle="We rekenen netto met rentebesparing, gemiste aftrek en optioneel box 3."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            In dit model vergelijken we bruto rentebesparing met mogelijk gemiste
            hypotheekrenteaftrek. Zo zie je het netto effect van extra aflossen.
          </p>
        </DisclosureSection>

        <DisclosureSection
          title="Waar moet je op letten?"
          subtitle="Beleggen is flexibeler, maar ook onzekerder en box 3 kan het resultaat drukken."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Box 3 meegenomen: {result.assumptions.includeBox3Effect ? "ja" : "nee"}.</p>
              <p>Totale extra box 3 in dit scenario: {formatCurrency(result.totalAdditionalBox3Tax)}.</p>
            </div>
          ) : null}
        </DisclosureSection>

        <ToolDisclosure
          title="Waarom aflossen rust kan geven"
          subtitle="Lagere schuld en minder renterisico."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Extra aflossen verlaagt je schuld direct. Dat kan mentaal rust geven en
            maakt je gevoeligheid voor renteschommelingen kleiner.
          </p>
        </ToolDisclosure>

        <ToolDisclosure
          title="Waarom beleggen meer risico heeft"
          subtitle="Hoger verwacht rendement, maar onzeker pad."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Beleggen kan op lange termijn hoger uitkomen, maar uitkomsten schommelen.
            Gebruik dit dus als scenariovergelijking en niet als zekerheid.
          </p>
        </ToolDisclosure>

        <ToolDisclosure
          title="Wanneer buffer belangrijker is"
          subtitle="Eerst flexibiliteit, dan optimalisatie."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Als je vrije buffer onder je minimum zit, is vasthouden van liquiditeit vaak
            logischer dan direct aflossen of beleggen.
          </p>
        </ToolDisclosure>

        <ToolDisclosure title="Let op" subtitle="Indicatief model, geen financieel advies.">
          {result ? (
            <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </ToolDisclosure>
        </>
      }
    />
  );
}
