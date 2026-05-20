"use client";

import { useState } from "react";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear, getDuoRateForRule } from "@/lib/financial-constants";
import type { RepaymentRule } from "@/lib/duo";
import type { Box3Method } from "@/lib/tax";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getStudentDebtVsInvestingDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  calculateStudyDebtVsInvesting,
  type CalculatorInput,
} from "./logic";

const DEFAULT_YEAR = getDefaultFinancialYear();

type FormState = {
  repaymentRule: RepaymentRule;
  remainingDebt: string;
  annualDebtRate: string;
  remainingTermYears: string;
  grossAnnualIncome: string;
  partnerGrossAnnualIncome: string;
  voluntaryExtraMonthly: string;
  annualInvestmentReturn: string;
  years: string;
  box3EffectEnabled: boolean;
  taxYear: string;
  hasFiscalPartner: boolean;
  box3Method: Box3Method;
  box3BankDeposits: string;
  box3InvestmentsAndOtherAssets: string;
  box3Debts: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  repaymentRule: "SF35",
  remainingDebt: "25000",
  annualDebtRate: String(getDuoRateForRule("SF35", DEFAULT_YEAR)),
  remainingTermYears: "35",
  grossAnnualIncome: "45000",
  partnerGrossAnnualIncome: "",
  voluntaryExtraMonthly: "150",
  annualInvestmentReturn: "6",
  years: "10",
  box3EffectEnabled: false,
  taxYear: String(DEFAULT_YEAR),
  hasFiscalPartner: false,
  box3Method: "actual",
  box3BankDeposits: "0",
  box3InvestmentsAndOtherAssets: "0",
  box3Debts: "0",
};

const defaultValues: FormState = {
  repaymentRule: "SF35",
  remainingDebt: "",
  annualDebtRate: "",
  remainingTermYears: "",
  grossAnnualIncome: "",
  partnerGrossAnnualIncome: "",
  voluntaryExtraMonthly: "",
  annualInvestmentReturn: "",
  years: "",
  box3EffectEnabled: false,
  taxYear: "",
  hasFiscalPartner: false,
  box3Method: "actual",
  box3BankDeposits: "",
  box3InvestmentsAndOtherAssets: "",
  box3Debts: "",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

const repaymentRuleLabels: Record<RepaymentRule, string> = {
  SF35: "SF35",
  SF15: "SF15",
  SF15_OLD: "SF15 oude regeling",
  SF15_LLLK: "SF15 levenlanglerenkrediet",
  UNKNOWN: "Weet ik niet (veilige schatting SF35)",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDecimal(value: number, digits = 2) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function normalizeNumericInput(value: string) {
  return value.replace(/\s+/g, "").replace(",", ".");
}

function parseOptionalNumber(value: string) {
  const normalized = normalizeNumericInput(value);
  if (normalized.length === 0) {
    return undefined;
  }
  return Number(normalized);
}

function parseRequiredNumber(value: string) {
  const normalized = normalizeNumericInput(value);
  if (normalized.length === 0) {
    return Number.NaN;
  }
  return Number(normalized);
}

function formatYearMonth(value: string | null) {
  if (!value) {
    return "n.v.t.";
  }
  const parsed = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const remainingDebt = parseRequiredNumber(values.remainingDebt);
  const annualDebtRate = parseOptionalNumber(values.annualDebtRate);
  const remainingTermYears = parseOptionalNumber(values.remainingTermYears);
  const grossAnnualIncome = parseRequiredNumber(values.grossAnnualIncome);
  const partnerGrossAnnualIncome = parseOptionalNumber(values.partnerGrossAnnualIncome);
  const voluntaryExtraMonthly = parseRequiredNumber(values.voluntaryExtraMonthly);
  const annualInvestmentReturn = parseRequiredNumber(values.annualInvestmentReturn);
  const years = parseRequiredNumber(values.years);
  const taxYear = parseOptionalNumber(values.taxYear);
  const box3BankDeposits = parseOptionalNumber(values.box3BankDeposits);
  const box3InvestmentsAndOtherAssets = parseOptionalNumber(
    values.box3InvestmentsAndOtherAssets,
  );
  const box3Debts = parseOptionalNumber(values.box3Debts);

  if (!Number.isFinite(remainingDebt) || remainingDebt < 0) {
    errors.remainingDebt = "Gebruik 0 of een hogere resterende studieschuld.";
  }

  if (
    annualDebtRate !== undefined &&
    (!Number.isFinite(annualDebtRate) || annualDebtRate < 0 || annualDebtRate > 100)
  ) {
    errors.annualDebtRate = "Gebruik een rente tussen 0 en 100.";
  }

  if (
    remainingTermYears !== undefined &&
    (!Number.isFinite(remainingTermYears) || remainingTermYears <= 0 || remainingTermYears > 40)
  ) {
    errors.remainingTermYears = "Gebruik een resterende looptijd tussen 1 en 40 jaar.";
  }

  if (!Number.isFinite(grossAnnualIncome) || grossAnnualIncome < 0) {
    errors.grossAnnualIncome = "Gebruik 0 of een hoger bruto jaarinkomen.";
  }

  if (
    partnerGrossAnnualIncome !== undefined &&
    (!Number.isFinite(partnerGrossAnnualIncome) || partnerGrossAnnualIncome < 0)
  ) {
    errors.partnerGrossAnnualIncome = "Gebruik 0 of een hoger partnerinkomen.";
  }

  if (
    !Number.isFinite(voluntaryExtraMonthly) ||
    voluntaryExtraMonthly < 0 ||
    voluntaryExtraMonthly > 5000
  ) {
    errors.voluntaryExtraMonthly =
      "Gebruik een vrijwillige extra aflossing tussen 0 en 5.000 per maand.";
  }

  if (
    !Number.isFinite(annualInvestmentReturn) ||
    annualInvestmentReturn < 0 ||
    annualInvestmentReturn > 100
  ) {
    errors.annualInvestmentReturn = "Gebruik een rendement tussen 0 en 100.";
  }

  if (!Number.isFinite(years) || years <= 0 || years > 40) {
    errors.years = "Gebruik een horizon tussen 1 en 40 jaar.";
  }

  if (
    values.box3EffectEnabled &&
    (taxYear === undefined || !Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2200)
  ) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }

  if (
    values.box3EffectEnabled &&
    (box3BankDeposits === undefined || !Number.isFinite(box3BankDeposits) || box3BankDeposits < 0)
  ) {
    errors.box3BankDeposits = "Gebruik 0 of een hoger bedrag.";
  }

  if (
    values.box3EffectEnabled &&
    (box3InvestmentsAndOtherAssets === undefined ||
      !Number.isFinite(box3InvestmentsAndOtherAssets) ||
      box3InvestmentsAndOtherAssets < 0)
  ) {
    errors.box3InvestmentsAndOtherAssets = "Gebruik 0 of een hoger bedrag.";
  }

  if (
    values.box3EffectEnabled &&
    (box3Debts === undefined || !Number.isFinite(box3Debts) || box3Debts < 0)
  ) {
    errors.box3Debts = "Gebruik 0 of een hoger bedrag.";
  }

  const parsedValues: CalculatorInput | null =
    Object.keys(errors).length === 0
      ? {
          repaymentRule: values.repaymentRule,
          remainingDebt,
          annualDebtRate,
          remainingTermYears,
          grossAnnualIncome,
          partnerGrossAnnualIncome,
          hasPartner: (partnerGrossAnnualIncome ?? 0) > 0,
          voluntaryExtraMonthly,
          annualInvestmentReturn,
          years,
          box3EffectEnabled: values.box3EffectEnabled,
          taxYear: values.box3EffectEnabled ? taxYear : undefined,
          hasFiscalPartner: values.hasFiscalPartner,
          box3Method: values.box3Method,
          box3BankDeposits: values.box3EffectEnabled ? box3BankDeposits : undefined,
          box3InvestmentsAndOtherAssets: values.box3EffectEnabled
            ? box3InvestmentsAndOtherAssets
            : undefined,
          box3Debts: values.box3EffectEnabled ? box3Debts : undefined,
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
  const profilePatch = getStudentDebtVsInvestingDefaultsFromProfile(profile);
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
  const [formValues, setFormValues] = useState<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const result = parsedValues ? calculateStudyDebtVsInvesting(parsedValues) : null;
  const mobileFieldOrder = [
    "repaymentRule",
    "remainingDebt",
    "annualDebtRate",
    "remainingTermYears",
    "grossAnnualIncome",
    "partnerGrossAnnualIncome",
    "voluntaryExtraMonthly",
    "annualInvestmentReturn",
    "years",
    "box3EffectEnabled",
    ...(formValues.box3EffectEnabled
      ? [
          "taxYear",
          "hasFiscalPartner",
          "box3Method",
          "box3BankDeposits",
          "box3InvestmentsAndOtherAssets",
          "box3Debts",
        ]
      : []),
  ];
  const mobileFlow = useMobileFieldFlow(mobileFieldOrder);

  const isCurrentFieldBlocked = Boolean(
    {
      remainingDebt: errors.remainingDebt,
      annualDebtRate: errors.annualDebtRate,
      remainingTermYears: errors.remainingTermYears,
      grossAnnualIncome: errors.grossAnnualIncome,
      partnerGrossAnnualIncome: errors.partnerGrossAnnualIncome,
      voluntaryExtraMonthly: errors.voluntaryExtraMonthly,
      annualInvestmentReturn: errors.annualInvestmentReturn,
      years: errors.years,
      taxYear: errors.taxYear,
      box3BankDeposits: errors.box3BankDeposits,
      box3InvestmentsAndOtherAssets: errors.box3InvestmentsAndOtherAssets,
      box3Debts: errors.box3Debts,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setFormValues((current) => mergeProfilePatchIntoValues(current, profilePatch));
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
    <CalculatorShell>
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Scenario
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Studieschuld extra aflossen of beleggen?
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Je verplichte DUO-bedrag moet je sowieso betalen. De keuze gaat vooral
          over extra aflossen: doe je dat, of gebruik je dat geld liever om te
          sparen of te beleggen?
        </p>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Profielwaarden gevonden in deze browser.</span>
            <button
              type="button"
              onClick={applyExampleValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met voorbeeldwaarden
            </button>
            <button
              type="button"
              onClick={applyProfileValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met profielwaarden
            </button>
          </div>
        ) : null}
        {!hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Start leeg en vul snel een voorbeeldscenario in.</span>
            <button
              type="button"
              onClick={applyExampleValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met voorbeeldwaarden
            </button>
            <a
              href="/profiel"
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met profielwaarden
            </a>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          <label className={mobileFlow.getFieldClassName("repaymentRule")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Terugbetalingsregel
            </span>
            <select
              value={formValues.repaymentRule}
              onChange={(event) =>
                updateField("repaymentRule", event.target.value as RepaymentRule)
              }
              onKeyDown={mobileFlow.handleEnterAdvance("repaymentRule")}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              {Object.entries(repaymentRuleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={mobileFlow.getFieldClassName("remainingDebt")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende studieschuld
            </span>
            <input
              inputMode="decimal"
              value={formValues.remainingDebt}
              onChange={(event) => updateField("remainingDebt", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("remainingDebt", Boolean(errors.remainingDebt))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingDebt} />
          </label>

          <label className={mobileFlow.getFieldClassName("annualDebtRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              DUO-rente (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualDebtRate}
              onChange={(event) => updateField("annualDebtRate", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("annualDebtRate", Boolean(errors.annualDebtRate))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualDebtRate} />
          </label>

          <label className={mobileFlow.getFieldClassName("remainingTermYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende looptijd (jaren)
            </span>
            <input
              inputMode="decimal"
              value={formValues.remainingTermYears}
              onChange={(event) => updateField("remainingTermYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "remainingTermYears",
                Boolean(errors.remainingTermYears),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingTermYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("grossAnnualIncome")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bruto jaarinkomen
            </span>
            <input
              inputMode="decimal"
              value={formValues.grossAnnualIncome}
              onChange={(event) => updateField("grossAnnualIncome", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "grossAnnualIncome",
                Boolean(errors.grossAnnualIncome),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.grossAnnualIncome} />
          </label>

          <label className={mobileFlow.getFieldClassName("partnerGrossAnnualIncome")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Partner bruto jaarinkomen (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.partnerGrossAnnualIncome}
              onChange={(event) => updateField("partnerGrossAnnualIncome", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "partnerGrossAnnualIncome",
                Boolean(errors.partnerGrossAnnualIncome),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.partnerGrossAnnualIncome} />
          </label>

          <label className={mobileFlow.getFieldClassName("voluntaryExtraMonthly")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Vrijwillig extra per maand
            </span>
            <input
              inputMode="decimal"
              value={formValues.voluntaryExtraMonthly}
              onChange={(event) => updateField("voluntaryExtraMonthly", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "voluntaryExtraMonthly",
                Boolean(errors.voluntaryExtraMonthly),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.voluntaryExtraMonthly} />
          </label>

          <label className={mobileFlow.getFieldClassName("annualInvestmentReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement beleggen (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualInvestmentReturn}
              onChange={(event) => updateField("annualInvestmentReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "annualInvestmentReturn",
                Boolean(errors.annualInvestmentReturn),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualInvestmentReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("years")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Vergelijkingshorizon (jaren)
            </span>
            <input
              inputMode="decimal"
              value={formValues.years}
              onChange={(event) => updateField("years", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("years", Boolean(errors.years))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.years} />
          </label>

          <label
            className={`${mobileFlow.getFieldClassName("box3EffectEnabled")} rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3`}
          >
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Geavanceerde aanname
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.box3EffectEnabled}
                onChange={(event) => updateField("box3EffectEnabled", event.target.checked)}
                onKeyDown={mobileFlow.handleEnterAdvance("box3EffectEnabled")}
                className="size-4 accent-[var(--accent)]"
              />
              Box 3-effect indicatief meenemen
            </span>
          </label>

          {formValues.box3EffectEnabled ? (
            <>
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

              <label className={mobileFlow.getFieldClassName("box3Method")}>
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
                  Gebruik forfaitair rendement (default = werkelijk rendement)
                </span>
              </label>

              <label className={mobileFlow.getFieldClassName("box3BankDeposits")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 banktegoeden
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.box3BankDeposits}
                  onChange={(event) => updateField("box3BankDeposits", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance(
                    "box3BankDeposits",
                    Boolean(errors.box3BankDeposits),
                  )}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.box3BankDeposits} />
              </label>

              <label className={mobileFlow.getFieldClassName("box3InvestmentsAndOtherAssets")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 beleggingen/overige bezittingen
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.box3InvestmentsAndOtherAssets}
                  onChange={(event) =>
                    updateField("box3InvestmentsAndOtherAssets", event.target.value)
                  }
                  onKeyDown={mobileFlow.handleEnterAdvance(
                    "box3InvestmentsAndOtherAssets",
                    Boolean(errors.box3InvestmentsAndOtherAssets),
                  )}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.box3InvestmentsAndOtherAssets} />
              </label>

              <label className={mobileFlow.getFieldClassName("box3Debts")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 schulden
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.box3Debts}
                  onChange={(event) => updateField("box3Debts", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance("box3Debts", Boolean(errors.box3Debts))}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.box3Debts} />
              </label>
            </>
          ) : null}

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            canComplete={Boolean(result)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={goToResult}
          />
        </div>
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Beknopte samenvatting
            </div>
            {result ? (
              <Pill tone={result.difference >= 0 ? "pos" : "neg"}>
                {result.difference >= 0 ? "Beleggen hoger" : "Extra aflossen sterker"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.difference)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Verschil tussen beleggen en vrijwillig extra aflossen in dit scenario.
              </p>
              <p className="mt-3 text-[13px] leading-[1.65] text-white/70">
                Je verplichte DUO-bedrag is ongeveer{" "}
                {formatCurrency(result.duoContext.requiredMonthlyPayment)} per maand.
                Alles daarboven (hier {formatCurrency(result.duoContext.voluntaryExtraMonthly)})
                behandelen we als vrijwillige keuze.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige invoerwaarden in om de vergelijking te tonen.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            DUO-kernbedragen
          </h3>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Wettelijk DUO-maandbedrag (annuïtair)"
                value={formatCurrency(result.duoContext.statutoryMonthlyPayment)}
                sub="Automatisch berekend uit schuld, rente en resterende looptijd"
                accent
              />
              <ResultRow
                label="Draagkrachtbedrag op inkomen"
                value={formatCurrency(result.duoContext.incomeBasedMonthlyPayment)}
                sub={`Inkomen gebruikt: ${formatCurrency(result.duoContext.annualIncomeUsed)}; boven vrijstelling: ${formatCurrency(result.duoContext.amountAboveAllowance)}`}
              />
              <ResultRow
                label="Verplicht te betalen aan DUO"
                value={formatCurrency(result.duoContext.requiredMonthlyPayment)}
                sub="Laagste van wettelijk maandbedrag en draagkrachtbedrag"
                accent
              />
              <ResultRow
                label="Vrijwillig extra per maand"
                value={formatCurrency(result.duoContext.voluntaryExtraMonthly)}
                sub="Dit bedrag is jouw keuze bovenop de verplichte DUO-betaling"
              />
              <ResultRow
                label="Totaal maandbedrag aan DUO"
                value={formatCurrency(result.duoContext.totalMonthlyToDuo)}
                sub="Verplicht + vrijwillig extra"
              />
              <ResultRow
                label="Hypotheek-relevant DUO-bedrag"
                value={formatCurrency(result.duoContext.mortgageRelevantMonthlyPayment)}
                sub="Indicatief wettelijk/annuïtair bedrag; niet handmatig ingevoerd"
                accent
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Extra aflossen vs beleggen
          </h3>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Totale vrijwillige ruimte in horizon"
                value={formatCurrency(result.totalVoluntaryAmount)}
                sub="Vrijwillige extra maandinleg over de gekozen periode"
              />
              <ResultRow
                label="Waarde bij extra aflossen"
                value={formatCurrency(result.debtStrategyValue)}
                sub="Vrijwillige aflossing + indicatieve rentebesparing"
              />
              <ResultRow
                label="Waarde bij beleggen"
                value={formatCurrency(result.expectedInvestmentValue)}
                sub="Zelfde vrijwillige bedrag, maar belegd tegen je rendementsaanname"
              />
              <ResultRow
                label="Verschil beleggen minus aflossen"
                value={formatCurrency(result.difference)}
                sub="Positief = beleggen hoger; negatief = extra aflossen sterker"
                accent={result.difference >= 0}
              />
              <ResultRow
                label="Eerder schuldenvrij door extra aflossen"
                value={`${result.duoContext.monthsEarlierDebtFree} maanden (${formatDecimal(result.duoContext.yearsEarlierDebtFree, 1)} jaar)`}
                sub={`Van ${formatYearMonth(result.duoContext.payoffWithoutExtraDate)} naar ${formatYearMonth(result.duoContext.payoffWithExtraDate)}`}
              />
            </div>
          ) : null}
        </div>

        <ToolDisclosure
          title="Hoe rekenen we dit?"
          subtitle="Verdieping op leenstelsel, verplicht minimum en vrijwillige ruimte."
        >
          <div className="space-y-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <p>
              1) We berekenen eerst het wettelijke DUO-maandbedrag annuïtair op basis
              van jouw regeling, resterende schuld, rente en resterende looptijd.
            </p>
            <p>
              2) Daarna schatten we het draagkrachtbedrag op inkomen. Verplicht bedrag
              = laagste van wettelijke maandbedrag en draagkracht.
            </p>
            <p>
              3) Alles boven dat verplichte bedrag is vrijwillig. Alleen dát deel
              vergelijken we als keuze: extra aflossen of beleggen.
            </p>
            <p>
              4) Het hypotheek-relevante DUO-bedrag tonen we als indicatief wettelijk
              annuïtair bedrag. Dat is in deze tool geen vrij invulveld.
            </p>
          </div>
        </ToolDisclosure>

        <ToolDisclosure
          title="Box 3-effect op beleggen"
          subtitle="Optioneel en indicatief; de hoofdflow blijft licht."
        >
          {result?.box3Scenario ? (
            <div className="space-y-4 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>
                Dit is een indicatie. Box 3-regels kunnen wijzigen en je persoonlijke
                fiscale situatie kan afwijken.
              </p>
              <ResultRow
                label="Extra box 3 in laatste jaar"
                value={formatCurrency(result.box3Scenario.additionalBox3TaxIndicative)}
              />
              <ResultRow
                label="Cumulatieve extra box 3-heffing"
                value={formatCurrency(
                  result.box3Scenario.cumulativeAdditionalBox3TaxIndicative,
                )}
                sub="Jaarlijks betaald uit de beleggingspot, dus niet meegecompounded"
              />
              <ResultRow
                label="Netto uitkomst na box 3"
                value={formatCurrency(result.box3Scenario.netInvestingOutcomeAfterBox3)}
              />
              <ToolDisclosure
                title="Jaarlijkse box 3-betalingen"
                subtitle="Per jaar zie je de extra heffing en waarde na betaling."
              >
                <div className="space-y-2">
                  {result.box3Scenario.yearlyBreakdown.map((row) => (
                    <div
                      key={row.year}
                      className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3"
                    >
                      <div className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
                        Jaar {row.year}
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <ResultRow
                          label="Startwaarde"
                          value={formatCurrency(row.startPortfolio)}
                        />
                        <ResultRow
                          label="Inleg"
                          value={formatCurrency(row.yearlyContribution)}
                        />
                        <ResultRow
                          label="Bruto rendement"
                          value={formatCurrency(row.grossReturn)}
                        />
                        <ResultRow
                          label="Extra box 3"
                          value={formatCurrency(row.additionalBox3Tax)}
                        />
                        <ResultRow
                          label="Waarde na box 3"
                          value={formatCurrency(row.portfolioAfterTax)}
                          accent
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ToolDisclosure>
            </div>
          ) : (
            <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
              Zet de box 3-optie aan om dit scenario te tonen.
            </p>
          )}
        </ToolDisclosure>

        {result?.warnings?.length ? (
          <div className="rounded-[1.5rem] border border-[var(--hair)] bg-[var(--paper-soft)] p-5 text-[12.5px] leading-[1.6] text-[var(--muted)]">
            <ul className="space-y-2">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </CalculatorShell>
  );
}
