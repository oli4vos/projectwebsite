"use client";

import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { DisclosureSection } from "@/components/DisclosureSection";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import {
  AreaChart,
  getAdaptiveEuroTicks,
  getAdaptiveYearTicks,
} from "@/components/charts";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton, ToolActionLinkButton } from "@/components/tool/ToolActionButton";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getGlossaryExplanation } from "@/lib/copy-glossary";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type { Box3Method } from "@/lib/tax";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getBox3ImpactDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  calculateBox3ImpactScenario,
  type Box3ImpactInput,
  type ContributionFrequency,
} from "./logic";

type FormState = {
  year: string;
  hasFiscalPartner: boolean;
  method: Box3Method;
  bankDeposits: string;
  investmentsAndOtherAssets: string;
  debts: string;
  expectedSavingsReturn: string;
  expectedInvestmentReturn: string;
  horizonYears: string;
  contributionFrequency: ContributionFrequency;
  savingsContribution: string;
  investmentsContribution: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  year: String(getDefaultFinancialYear()),
  hasFiscalPartner: false,
  method: "actual",
  bankDeposits: "25000",
  investmentsAndOtherAssets: "50000",
  debts: "0",
  expectedSavingsReturn: "2",
  expectedInvestmentReturn: "6",
  horizonYears: "10",
  contributionFrequency: "monthly",
  savingsContribution: "150",
  investmentsContribution: "350",
};

const defaultValues: FormState = {
  year: "",
  hasFiscalPartner: false,
  method: "actual",
  bankDeposits: "",
  investmentsAndOtherAssets: "",
  debts: "",
  expectedSavingsReturn: "",
  expectedInvestmentReturn: "",
  horizonYears: "",
  contributionFrequency: "monthly",
  savingsContribution: "",
  investmentsContribution: "",
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
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const year = parseOptionalNumber(values.year);
  const bankDeposits = parseOptionalNumber(values.bankDeposits);
  const investmentsAndOtherAssets = parseOptionalNumber(values.investmentsAndOtherAssets);
  const debts = parseOptionalNumber(values.debts);
  const expectedSavingsReturn = parseOptionalNumber(values.expectedSavingsReturn);
  const expectedInvestmentReturn = parseOptionalNumber(values.expectedInvestmentReturn);
  const horizonYears = parseOptionalNumber(values.horizonYears);
  const savingsContribution = parseOptionalNumber(values.savingsContribution);
  const investmentsContribution = parseOptionalNumber(values.investmentsContribution);

  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }
  if (bankDeposits === undefined || !Number.isFinite(bankDeposits) || bankDeposits < 0) {
    errors.bankDeposits = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    investmentsAndOtherAssets === undefined ||
    !Number.isFinite(investmentsAndOtherAssets) ||
    investmentsAndOtherAssets < 0
  ) {
    errors.investmentsAndOtherAssets = "Gebruik 0 of een hoger bedrag.";
  }
  if (debts === undefined || !Number.isFinite(debts) || debts < 0) {
    errors.debts = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    expectedSavingsReturn !== undefined &&
    (!Number.isFinite(expectedSavingsReturn) ||
      expectedSavingsReturn < 0 ||
      expectedSavingsReturn > 100)
  ) {
    errors.expectedSavingsReturn = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    expectedInvestmentReturn !== undefined &&
    (!Number.isFinite(expectedInvestmentReturn) ||
      expectedInvestmentReturn < 0 ||
      expectedInvestmentReturn > 100)
  ) {
    errors.expectedInvestmentReturn = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    horizonYears === undefined ||
    !Number.isFinite(horizonYears) ||
    horizonYears <= 0 ||
    horizonYears > 60
  ) {
    errors.horizonYears = "Gebruik een horizon tussen 1 en 60 jaar.";
  }
  if (
    savingsContribution === undefined ||
    !Number.isFinite(savingsContribution) ||
    savingsContribution < 0
  ) {
    errors.savingsContribution = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    investmentsContribution === undefined ||
    !Number.isFinite(investmentsContribution) ||
    investmentsContribution < 0
  ) {
    errors.investmentsContribution = "Gebruik 0 of een hoger bedrag.";
  }

  const parsedValues: Box3ImpactInput | null =
    Object.keys(errors).length === 0
      ? {
          year,
          hasFiscalPartner: values.hasFiscalPartner,
          method: values.method,
          bankDeposits: bankDeposits ?? 0,
          investmentsAndOtherAssets: investmentsAndOtherAssets ?? 0,
          debts: debts ?? 0,
          expectedSavingsReturn,
          expectedInvestmentReturn,
          horizonYears,
          contributionFrequency: values.contributionFrequency,
          savingsContribution: savingsContribution ?? 0,
          investmentsContribution: investmentsContribution ?? 0,
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
  const profilePatch = getBox3ImpactDefaultsFromProfile(profile);
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
    ? calculateBox3ImpactScenario(submittedValidation.parsedValues)
    : null;

  const chartSeries = result
    ? [
        {
          color: "oklch(45% 0.08 236)",
          points: [
            result.netWorth,
            ...result.horizon.points.map((point) => point.endNetWorthWithoutBox3),
          ],
        },
        {
          color: "oklch(62% 0.11 35)",
          points: [result.netWorth, ...result.horizon.points.map((point) => point.endNetWorthAfterTax)],
        },
      ]
    : null;
  const xTicks = result ? getAdaptiveYearTicks(result.horizon.years) : [];
  const yTicks = result
    ? getAdaptiveEuroTicks(
        Math.max(
          result.netWorth,
          ...result.horizon.points.map((point) => point.endNetWorthWithoutBox3),
          ...result.horizon.points.map((point) => point.endNetWorthAfterTax),
        ),
      )
    : [];
  const saleExampleSeries = result
    ? [
        {
          color: "oklch(45% 0.08 236)",
          points: result.horizon.endSaleExample.pointsWithoutBox3.map((point) => point.value),
        },
        {
          color: "oklch(70% 0.12 20)",
          points: result.horizon.endSaleExample.pointsEndSaleTax.map((point) => point.value),
        },
      ]
    : null;
  const saleExampleYTicks = result
    ? getAdaptiveEuroTicks(
        Math.max(
          ...result.horizon.endSaleExample.pointsWithoutBox3.map((point) => point.value),
          ...result.horizon.endSaleExample.pointsEndSaleTax.map((point) => point.value),
        ),
      )
    : [];

  const mobileFlow = useMobileFieldFlow([
    "year",
    "hasFiscalPartner",
    "method",
    "bankDeposits",
    "investmentsAndOtherAssets",
    "debts",
    "expectedSavingsReturn",
    "expectedInvestmentReturn",
    "horizonYears",
    "contributionFrequency",
    "savingsContribution",
    "investmentsContribution",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      year: errors.year,
      bankDeposits: errors.bankDeposits,
      investmentsAndOtherAssets: errors.investmentsAndOtherAssets,
      debts: errors.debts,
      expectedSavingsReturn: errors.expectedSavingsReturn,
      expectedInvestmentReturn: errors.expectedInvestmentReturn,
      horizonYears: errors.horizonYears,
      savingsContribution: errors.savingsContribution,
      investmentsContribution: errors.investmentsContribution,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setValues(
      mergeProfilePatchIntoValues(formValues, profilePatch),
      "Profielwaarden geladen. Klik op Bereken om de uitkomst te zien.",
    );
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
            Invoer
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Wat kost mijn vermogen in box 3?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Box 3 is de belasting op sparen en beleggen. Deze tool laat zien wat je
            vermogen indicatief aan belasting kost, nu en over je gekozen horizon.
          </p>
        </>
      }
      startActions={
        <>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Profielwaarden gevonden in deze browser.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Start met voorbeeldwaarden
            </ToolActionButton>
            <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">
              Start met profielwaarden
            </ToolActionButton>
          </div>
        ) : null}
        {!hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Start leeg en vul snel een voorbeeldscenario in.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Start met voorbeeldwaarden
            </ToolActionButton>
            <ToolActionLinkButton href="/profiel" variant="secondary" size="sm">
              Start met profielwaarden
            </ToolActionLinkButton>
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
          <label className={mobileFlow.getFieldClassName("year")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingjaar
            </span>
            <input
              inputMode="numeric"
              value={formValues.year}
              onChange={(event) => updateField("year", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("year", Boolean(errors.year))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.year} />
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

          <label className={mobileFlow.getFieldClassName("method")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Rekensysteem
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.method === "forfaitary"}
                onChange={(event) =>
                  updateField("method", event.target.checked ? "forfaitary" : "actual")
                }
                className="size-4 accent-[var(--accent)]"
              />
              Forfaitair rendement (default = werkelijk rendement)
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("bankDeposits")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Startvermogen spaargeld
            </span>
            <input
              inputMode="decimal"
              value={formValues.bankDeposits}
              onChange={(event) => updateField("bankDeposits", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("bankDeposits", Boolean(errors.bankDeposits))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.bankDeposits} />
          </label>

          <label className={mobileFlow.getFieldClassName("investmentsAndOtherAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Startvermogen beleggingen
            </span>
            <input
              inputMode="decimal"
              value={formValues.investmentsAndOtherAssets}
              onChange={(event) =>
                updateField("investmentsAndOtherAssets", event.target.value)
              }
              onKeyDown={mobileFlow.handleEnterAdvance(
                "investmentsAndOtherAssets",
                Boolean(errors.investmentsAndOtherAssets),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.investmentsAndOtherAssets} />
          </label>

          <label className={mobileFlow.getFieldClassName("debts")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Schulden box 3
            </span>
            <input
              inputMode="decimal"
              value={formValues.debts}
              onChange={(event) => updateField("debts", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("debts", Boolean(errors.debts))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.debts} />
          </label>

          <label className={mobileFlow.getFieldClassName("expectedSavingsReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement spaargeld (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedSavingsReturn}
              onChange={(event) => updateField("expectedSavingsReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "expectedSavingsReturn",
                Boolean(errors.expectedSavingsReturn),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedSavingsReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("expectedInvestmentReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement beleggingen (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedInvestmentReturn}
              onChange={(event) => updateField("expectedInvestmentReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "expectedInvestmentReturn",
                Boolean(errors.expectedInvestmentReturn),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedInvestmentReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("horizonYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beleggingshorizon (jaren)
            </span>
            <input
              inputMode="numeric"
              value={formValues.horizonYears}
              onChange={(event) => updateField("horizonYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "horizonYears",
                Boolean(errors.horizonYears),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.horizonYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("contributionFrequency")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Inlegfrequentie
            </span>
            <select
              value={formValues.contributionFrequency}
              onChange={(event) =>
                updateField("contributionFrequency", event.target.value as ContributionFrequency)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="monthly">Per maand</option>
              <option value="yearly">Per jaar</option>
            </select>
          </label>

          <label className={mobileFlow.getFieldClassName("savingsContribution")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Inleg naar sparen ({formValues.contributionFrequency === "monthly" ? "per maand" : "per jaar"})
            </span>
            <input
              inputMode="decimal"
              value={formValues.savingsContribution}
              onChange={(event) => updateField("savingsContribution", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "savingsContribution",
                Boolean(errors.savingsContribution),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.savingsContribution} />
          </label>

          <label className={mobileFlow.getFieldClassName("investmentsContribution")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Inleg naar beleggen ({formValues.contributionFrequency === "monthly" ? "per maand" : "per jaar"})
            </span>
            <input
              inputMode="decimal"
              value={formValues.investmentsContribution}
              onChange={(event) => updateField("investmentsContribution", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "investmentsContribution",
                Boolean(errors.investmentsContribution),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.investmentsContribution} />
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
              Beknopte samenvatting
            </div>
            {result ? (
              <Pill tone={result.box3Tax > 0 ? "neg" : "pos"}>
                {result.box3Tax > 0 ? "Boven vrijstelling" : "Binnen vrijstelling"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.box3Tax)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Op basis van je invoer betaal je indicatief ongeveer {formatCurrency(result.box3Tax)} box 3 in {result.year}.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Cumulatieve box 3-heffing over {result.horizon.years} jaar:{" "}
                {formatCurrency(result.horizon.totalBox3TaxOverHorizon)}.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Eindvermogen na box 3 in dit scenario:{" "}
                {formatCurrency(result.horizon.endNetWorthAfterTax)}.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Eindvermogen zonder jaarlijkse box 3-heffing:{" "}
                {formatCurrency(result.horizon.endNetWorthWithoutBox3)}.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Verschil op eindhorizon door box 3:{" "}
                {formatCurrency(result.horizon.wealthGapVsNoBox3)}.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul in wat je weet en klik op Bereken. De tool toont daarna pas de uitkomst.
            </p>
          )}
        </div>
      }
      details={
        <>

        {result ? (
          <>
            <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
              <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
                Resultaatdetails
              </h3>
              <div className="mt-5">
                <ResultRow label="Totaal vermogen" value={formatCurrency(result.assetsTotal)} />
                <ResultRow label="Schulden box 3" value={formatCurrency(result.debtsTotal)} />
                <ResultRow label="Netto rendementsgrondslag" value={formatCurrency(result.netWorth)} />
                <ResultRow label="Heffingsvrij vermogen" value={formatCurrency(result.taxFreeAllowance)} />
                <ResultRow label="Belastbare grondslag" value={formatCurrency(result.taxableBase)} />
                <ResultRow label="Forfaitair rendement spaargeld" value={formatCurrency(result.deemedReturnBankDeposits)} />
                <ResultRow label="Forfaitair rendement beleggingen" value={formatCurrency(result.deemedReturnInvestments)} />
                <ResultRow label="Forfaitair rendement schulden" value={formatCurrency(result.deemedReturnDebts)} />
                <ResultRow label="Totaal forfaitair rendement" value={formatCurrency(result.totalDeemedReturn)} />
                <ResultRow label="Box 3-heffing" value={formatCurrency(result.box3Tax)} accent />
                <ResultRow
                  label="Effectieve druk op netto vermogen"
                  value={`${formatPercent(result.effectiveTaxRateOnNetWorth)}%`}
                />
                <ResultRow
                  label="Cumulatieve box 3-heffing horizon"
                  value={formatCurrency(result.horizon.totalBox3TaxOverHorizon)}
                  sub={`Over ${result.horizon.years} jaar met ${result.horizon.contributionFrequency === "monthly" ? "maandelijkse" : "jaarlijkse"} inleg`}
                />
                <ResultRow
                  label="Eindvermogen zonder box 3"
                  value={formatCurrency(result.horizon.endNetWorthWithoutBox3)}
                />
                <ResultRow
                  label="Eindvermogen met box 3"
                  value={formatCurrency(result.horizon.endNetWorthAfterTax)}
                  accent
                />
                <ResultRow
                  label="Vermogensverschil door box 3"
                  value={formatCurrency(result.horizon.wealthGapVsNoBox3)}
                />
                {result.expectedGrossReturn !== undefined ? (
                  <>
                    <ResultRow label="Verwacht bruto rendement (jaar 1)" value={formatCurrency(result.expectedGrossReturn)} />
                    <ResultRow label="Netto rendement na box 3 (jaar 1)" value={formatCurrency(result.netExpectedReturnAfterBox3 ?? 0)} accent />
                  </>
                ) : null}
              </div>
            </div>

            {chartSeries ? (
              <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                      Beleggingshorizon
                    </div>
                    <div className="mt-1 font-serif text-[20px] tracking-[-0.015em] text-[var(--ink)]">
                      Vermogenslijn met box 3 versus zonder box 3
                    </div>
                  </div>
                  <ChartLegend
                    items={[
                      { label: "Zonder box 3-heffing", color: "oklch(45% 0.08 236)" },
                      { label: "Met box 3", color: "oklch(62% 0.11 35)" },
                    ]}
                  />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[68px_minmax(0,1fr)]">
                  <div className="hidden flex-col justify-between text-right text-[11px] text-[var(--soft)] sm:flex">
                    {yTicks
                      .slice()
                      .reverse()
                      .map((tick) => (
                        <span key={tick}>{formatCompactEuro(tick)}</span>
                      ))}
                  </div>
                  <div className="min-w-0">
                    <ChartContainer
                      yearTicks={xTicks}
                      chart={
                        <AreaChart
                          width={620}
                          height={220}
                          series={chartSeries}
                          yTicks={yTicks}
                          xValues={[0, ...result.horizon.points.map((point) => point.yearIndex)]}
                          seriesLabels={["Zonder box 3", "Met box 3"]}
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <DisclosureSection
          title="Hoe rekenen we dit?"
          subtitle="Deze tool gebruikt centrale tax- en constantslagen."
        >
          <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            <p>{getGlossaryExplanation("box3")}</p>
            <p>1) Start met je huidige spaargeld, beleggingen en schulden in box 3.</p>
            <p>2) Simuleer per jaar je inleg en bruto rendement.</p>
            <p>3) Bereken per jaar de box 3-heffing met de centrale box 3-logica.</p>
            <p>4) Trek de jaarheffing af en gebruik de resterende waarde als start voor het volgende jaar.</p>
          </div>
        </DisclosureSection>

        <ToolDisclosure
          title="Wanneer welke box 3-heffing komt"
          subtitle="Jaar-op-jaar specificatie van heffing en eindvermogen."
        >
          {result ? (
            <div className="space-y-2">
              {result.horizon.points.map((point) => (
                <div
                  key={point.yearIndex}
                  className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3"
                >
                  <div className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
                    Jaar {point.yearIndex} ({point.calendarYear})
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <ResultRow label="Start netto vermogen" value={formatCurrency(point.startNetWorth)} />
                    <ResultRow label="Inleg sparen" value={formatCurrency(point.contributionSavings)} />
                    <ResultRow label="Inleg beleggen" value={formatCurrency(point.contributionInvestments)} />
                    <ResultRow label="Bruto rendement sparen" value={formatCurrency(point.grossReturnSavings)} />
                    <ResultRow label="Bruto rendement beleggen" value={formatCurrency(point.grossReturnInvestments)} />
                    <ResultRow label="Vermogen voor box 3" value={formatCurrency(point.endNetWorthBeforeTax)} />
                    <ResultRow label="Vermogen zonder box 3" value={formatCurrency(point.endNetWorthWithoutBox3)} />
                    <ResultRow label="Box 3-heffing in dit jaar" value={formatCurrency(point.box3Tax)} />
                    <ResultRow label="Vermogen na box 3" value={formatCurrency(point.endNetWorthAfterTax)} accent />
                    <ResultRow label="Verschil t.o.v. zonder box 3" value={formatCurrency(point.wealthGapVsNoBox3)} />
                    <ResultRow label="Cumulatieve box 3" value={formatCurrency(point.cumulativeBox3Tax)} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Hypothetisch: alleen kopen, verkoop op eindhorizon"
          subtitle="Verdieping: voorbeeld waarin belasting pas bij eindverkoop wordt afgerekend."
        >
          {result ? (
            <div className="space-y-4">
              <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
                Dit is een extra voorbeeldscenario: je verkoopt niets tussentijds, en rekent
                alleen op de einddatum af over de gerealiseerde winst. Dit is niet hoe box 3 nu
                jaarlijks werkt, maar helpt om het verschil in timing van belasting te zien.
              </p>
              <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <ResultRow
                    label="Totale inleg + startvermogen"
                    value={formatCurrency(result.horizon.endSaleExample.totalPrincipalInflow)}
                  />
                  <ResultRow
                    label="Winst bij verkoop op eindhorizon"
                    value={formatCurrency(result.horizon.endSaleExample.taxableGainAtEndSale)}
                  />
                  <ResultRow
                    label="Voorbeeldheffing bij eindverkoop"
                    value={formatCurrency(result.horizon.endSaleExample.taxDueAtEndSale)}
                    sub={`${formatPercent(result.horizon.endSaleExample.taxRateUsed)}% over winst`}
                  />
                  <ResultRow
                    label="Eindvermogen na eindverkoop-heffing"
                    value={formatCurrency(result.horizon.endSaleExample.endNetWorthAfterEndSaleTax)}
                    accent
                  />
                </div>
              </div>
              {saleExampleSeries ? (
                <div className="rounded-xl border border-[var(--hair)] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
                      Timingvergelijking belasting
                    </div>
                    <ChartLegend
                      items={[
                        { label: "Zonder belasting", color: "oklch(45% 0.08 236)" },
                        { label: "Alleen eindverkoop-heffing", color: "oklch(70% 0.12 20)" },
                      ]}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[68px_minmax(0,1fr)]">
                    <div className="hidden flex-col justify-between text-right text-[11px] text-[var(--soft)] sm:flex">
                      {saleExampleYTicks
                        .slice()
                        .reverse()
                        .map((tick) => (
                          <span key={tick}>{formatCompactEuro(tick)}</span>
                        ))}
                    </div>
                    <div className="min-w-0">
                      <ChartContainer
                        yearTicks={[0, ...xTicks]}
                        chart={
                          <AreaChart
                            width={620}
                            height={220}
                            series={saleExampleSeries}
                            yTicks={saleExampleYTicks}
                            xValues={[0, ...result.horizon.points.map((point) => point.yearIndex)]}
                            seriesLabels={["Zonder belasting", "Alleen eindverkoop-heffing"]}
                          />
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </ToolDisclosure>

        <DisclosureSection
          title="Welke aannames gebruiken we?"
          subtitle="Aannames komen centraal uit het gekozen belastingjaar."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.assumptions.sourceLabel}</p>
              <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
              <p>Status: {result.assumptions.status}</p>
              <p>Box 3-tarief: {formatPercent(result.assumptions.taxRate)}%</p>
              <p>Forfait banktegoeden: {formatPercent(result.assumptions.deemedReturnBankDepositsRate)}%</p>
              <p>Forfait beleggingen: {formatPercent(result.assumptions.deemedReturnInvestmentsRate)}%</p>
              <p>Forfait schulden: {formatPercent(result.assumptions.deemedReturnDebtsRate)}%</p>
            </div>
          ) : null}
        </DisclosureSection>

        <DisclosureSection
          title="Waar moet je op letten?"
          subtitle="Geen officiële aangifteberekening."
        >
          <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            {(result?.warnings ?? ["Dit is een indicatie en geen officiële aanslag."]).map(
              (warning) => (
                <li key={warning}>{warning}</li>
              ),
            )}
          </ul>
        </DisclosureSection>
        </>
      }
    />
  );
}
