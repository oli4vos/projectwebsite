"use client";

import { useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getGlossaryExplanation } from "@/lib/copy-glossary";
import { getFinancialConstants } from "@/lib/financial-constants";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getMortgageImpactDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  LAST_CHECKED,
  calculateHypotheekImpact,
  getDefaultDuoRate,
  getDefaultTerm,
  type DuoSituation,
  type HypotheekImpactInput,
  type PaymentSource,
  type RepaymentRule,
} from "./logic";

const FINANCIAL_CONSTANTS = getFinancialConstants(2026);

type FormState = {
  situation: DuoSituation;
  repaymentRule: RepaymentRule;
  actualMonthlyPayment: string;
  statutoryMonthlyPayment: string;
  remainingStudentDebt: string;
  duoInterestRate: string;
  remainingTermYears: string;
  extraRepayment: string;
  grossIncomeUser: string;
  grossIncomePartner: string;
  desiredHomePrice: string;
  ownMoney: string;
  maxMortgageWithoutStudentDebt: string;
  mortgageRate: string;
  mortgageTermYears: string;
  showAdvancedAssumptions: boolean;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  situation: "repaying",
  repaymentRule: "SF35",
  actualMonthlyPayment: "150",
  statutoryMonthlyPayment: "",
  remainingStudentDebt: "22000",
  duoInterestRate: String(FINANCIAL_CONSTANTS.duo.rates.SF35),
  remainingTermYears: String(FINANCIAL_CONSTANTS.duo.defaultTerms.SF35),
  extraRepayment: "",
  grossIncomeUser: "48000",
  grossIncomePartner: "",
  desiredHomePrice: "375000",
  ownMoney: "25000",
  maxMortgageWithoutStudentDebt: "",
  mortgageRate: String(FINANCIAL_CONSTANTS.mortgage.defaultMortgageRate),
  mortgageTermYears: String(FINANCIAL_CONSTANTS.mortgage.defaultMortgageTermYears),
  showAdvancedAssumptions: false,
};

const defaultValues: FormState = {
  situation: "repaying",
  repaymentRule: "SF35",
  actualMonthlyPayment: "",
  statutoryMonthlyPayment: "",
  remainingStudentDebt: "",
  duoInterestRate: "",
  remainingTermYears: "",
  extraRepayment: "",
  grossIncomeUser: "",
  grossIncomePartner: "",
  desiredHomePrice: "",
  ownMoney: "",
  maxMortgageWithoutStudentDebt: "",
  mortgageRate: "",
  mortgageTermYears: "",
  showAdvancedAssumptions: false,
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

const situationLabels: Record<DuoSituation, string> = {
  repaying: "Ik betaal al maandelijks aan DUO",
  gracePeriod: "Ik zit in de aanloopfase",
  incomeBasedReduction: "Mijn maandbedrag is verlaagd door draagkracht",
  paymentPause: "Ik gebruik een aflossingsvrije periode",
  unknown: "Ik weet het niet",
};

const ruleLabels: Record<RepaymentRule, string> = {
  SF35: "SF35",
  SF15: "SF15",
  SF15_OLD: "SF15-oud",
  SF15_LLLK: "SF15-lllk",
  UNKNOWN: "Onbekend",
};

const paymentSourceLabels: Record<PaymentSource, string> = {
  actual: "Feitelijke betaling",
  statutory: "Wettelijk maandbedrag",
  estimated: "Geschat maandbedrag",
  incomeBased: "Draagkracht-scenario",
  mixed: "Combinatie van feitelijk en wettelijk/geschat",
};

function formatIsoDateLabel(value: string) {
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDecimal(value: number, digits = 2) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatMonthsAndYears(months: number) {
  if (!Number.isFinite(months) || months <= 0) {
    return "0 maanden";
  }

  const roundedMonths = Math.round(months);
  const years = roundedMonths / 12;
  return `${roundedMonths} maanden (${formatDecimal(years, 1)} jaar)`;
}

function normalizeNumericInput(value: string) {
  return value.replace(/\s+/g, "").replace(",", ".");
}

function parseOptionalNumber(value: string) {
  const normalizedValue = normalizeNumericInput(value);

  if (normalizedValue.length === 0) {
    return undefined;
  }

  return Number(normalizedValue);
}

function parseRequiredNumber(value: string) {
  const normalizedValue = normalizeNumericInput(value);

  if (normalizedValue.length === 0) {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};

  const actualMonthlyPayment = parseOptionalNumber(values.actualMonthlyPayment);
  const statutoryMonthlyPayment = parseOptionalNumber(values.statutoryMonthlyPayment);
  const remainingStudentDebt = parseOptionalNumber(values.remainingStudentDebt);
  const duoInterestRate = parseOptionalNumber(values.duoInterestRate);
  const remainingTermYears = parseOptionalNumber(values.remainingTermYears);
  const extraRepayment = parseOptionalNumber(values.extraRepayment);
  const grossIncomeUser = parseRequiredNumber(values.grossIncomeUser);
  const grossIncomePartner = parseOptionalNumber(values.grossIncomePartner);
  const desiredHomePrice = parseOptionalNumber(values.desiredHomePrice);
  const ownMoney = parseOptionalNumber(values.ownMoney);
  const maxMortgageWithoutStudentDebt = parseOptionalNumber(
    values.maxMortgageWithoutStudentDebt,
  );
  const mortgageRate = parseRequiredNumber(values.mortgageRate);
  const mortgageTermYears = parseRequiredNumber(values.mortgageTermYears);

  const showActualField =
    values.situation === "repaying" ||
    values.situation === "incomeBasedReduction" ||
    values.situation === "paymentPause";
  const showStatutoryField =
    values.situation === "gracePeriod" ||
    values.situation === "incomeBasedReduction" ||
    values.situation === "paymentPause" ||
    values.situation === "unknown";
  const canEstimateFromDebt =
    remainingStudentDebt !== undefined && Number.isFinite(remainingStudentDebt);

  if (showActualField) {
    if (
      actualMonthlyPayment !== undefined &&
      (!Number.isFinite(actualMonthlyPayment) || actualMonthlyPayment < 0)
    ) {
      errors.actualMonthlyPayment =
        "Gebruik 0 of een hoger DUO-maandbedrag.";
    }
  }

  if (showStatutoryField) {
    if (
      statutoryMonthlyPayment !== undefined &&
      (!Number.isFinite(statutoryMonthlyPayment) || statutoryMonthlyPayment < 0)
    ) {
      errors.statutoryMonthlyPayment =
        "Gebruik 0 of een hoger wettelijk maandbedrag.";
    }
  }

  if (
    remainingStudentDebt !== undefined &&
    (!Number.isFinite(remainingStudentDebt) || remainingStudentDebt < 0)
  ) {
    errors.remainingStudentDebt =
      "Gebruik 0 of een hogere resterende studieschuld.";
  }

  if (
    duoInterestRate !== undefined &&
    (!Number.isFinite(duoInterestRate) || duoInterestRate < 0)
  ) {
    errors.duoInterestRate = "Gebruik 0% of een hoger DUO-rentepercentage.";
  }

  if (
    remainingTermYears !== undefined &&
    (!Number.isFinite(remainingTermYears) || remainingTermYears <= 0)
  ) {
    errors.remainingTermYears = "Gebruik een resterende looptijd groter dan 0.";
  }

  if (
    extraRepayment !== undefined &&
    (!Number.isFinite(extraRepayment) || extraRepayment < 0)
  ) {
    errors.extraRepayment = "Gebruik 0 of een hoger bedrag voor extra aflossen.";
  }

  if (!Number.isFinite(grossIncomeUser) || grossIncomeUser < 0) {
    errors.grossIncomeUser = "Gebruik 0 of een hoger bruto jaarinkomen.";
  }

  if (
    grossIncomePartner !== undefined &&
    (!Number.isFinite(grossIncomePartner) || grossIncomePartner < 0)
  ) {
    errors.grossIncomePartner = "Gebruik 0 of een hoger partnerinkomen.";
  }

  if (
    desiredHomePrice !== undefined &&
    (!Number.isFinite(desiredHomePrice) || desiredHomePrice < 0)
  ) {
    errors.desiredHomePrice = "Gebruik 0 of een hogere woningprijs.";
  }

  if (ownMoney !== undefined && (!Number.isFinite(ownMoney) || ownMoney < 0)) {
    errors.ownMoney = "Gebruik 0 of een hoger bedrag aan eigen geld.";
  }

  if (
    maxMortgageWithoutStudentDebt !== undefined &&
    (!Number.isFinite(maxMortgageWithoutStudentDebt) ||
      maxMortgageWithoutStudentDebt < 0)
  ) {
    errors.maxMortgageWithoutStudentDebt =
      "Gebruik 0 of een hogere maximale hypotheek.";
  }

  if (!Number.isFinite(mortgageRate) || mortgageRate < 0) {
    errors.mortgageRate = "Gebruik 0% of een hogere hypotheekrente.";
  }

  if (!Number.isFinite(mortgageTermYears) || mortgageTermYears <= 0) {
    errors.mortgageTermYears = "Gebruik een hypotheeklooptijd groter dan 0.";
  }

  if (
    values.situation === "repaying" &&
    actualMonthlyPayment === undefined &&
    statutoryMonthlyPayment === undefined &&
    !canEstimateFromDebt
  ) {
    errors.actualMonthlyPayment =
      "Vul je actuele DUO-bedrag in, of geef minimaal je resterende schuld op zodat we kunnen schatten.";
  }

  if (values.situation === "incomeBasedReduction") {
    if (actualMonthlyPayment === undefined) {
      errors.actualMonthlyPayment =
        "Vul het lagere draagkrachtbedrag in dat je nu feitelijk betaalt.";
    }

    if (statutoryMonthlyPayment === undefined && !canEstimateFromDebt) {
      errors.statutoryMonthlyPayment =
        "Vul ook je wettelijke maandbedrag in, of geef je resterende schuld op zodat we dit kunnen schatten.";
    }
  }

  if (
    (values.situation === "gracePeriod" ||
      values.situation === "paymentPause" ||
      values.situation === "unknown") &&
    statutoryMonthlyPayment === undefined &&
    !canEstimateFromDebt
  ) {
    errors.remainingStudentDebt =
      "Vul je resterende studieschuld in, of geef een wettelijk maandbedrag op zodat we een veilige schatting kunnen maken.";
  }

  if (
    extraRepayment !== undefined &&
    extraRepayment > 0 &&
    remainingStudentDebt === undefined
  ) {
    errors.extraRepayment =
      "Vul ook je resterende studieschuld in om extra aflossen te kunnen schatten.";
  }

  if (
    extraRepayment !== undefined &&
    remainingStudentDebt !== undefined &&
    extraRepayment > remainingStudentDebt
  ) {
    errors.extraRepayment =
      "Extra aflossen kan in deze tool niet hoger zijn dan je resterende studieschuld.";
  }

  const parsedValues: HypotheekImpactInput | null =
    Object.keys(errors).length === 0
      ? {
          situation: values.situation,
          repaymentRule: values.repaymentRule,
          actualMonthlyPayment,
          statutoryMonthlyPayment,
          remainingStudentDebt,
          duoInterestRate,
          remainingTermYears,
          extraRepayment,
          grossIncomeUser,
          grossIncomePartner: grossIncomePartner ?? 0,
          desiredHomePrice,
          ownMoney,
          maxMortgageWithoutStudentDebt,
          mortgageRate,
          mortgageTermYears,
        }
      : null;

  return {
    errors,
    parsedValues,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}

function InfoList({
  items,
  tone = "default",
}: {
  items: string[];
  tone?: "default" | "warning";
}) {
  const uniqueItems = [...new Set(items)];

  if (uniqueItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-[13px] leading-[1.65] ${
        tone === "warning"
          ? "border-[var(--neg-soft)] bg-[var(--neg-soft)]/45 text-[oklch(35%_0.13_28)]"
          : "border-[var(--hair)] bg-[var(--paper-soft)] text-[var(--muted)]"
      }`}
    >
      <ul className="space-y-2">
        {uniqueItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getMortgageImpactDefaultsFromProfile(profile);
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
  const result = parsedValues ? calculateHypotheekImpact(parsedValues) : null;
  const hasErrors = Object.keys(errors).length > 0;
  const showActualField =
    formValues.situation === "repaying" ||
    formValues.situation === "incomeBasedReduction" ||
    formValues.situation === "paymentPause";
  const showStatutoryField =
    formValues.situation === "gracePeriod" ||
    formValues.situation === "incomeBasedReduction" ||
    formValues.situation === "paymentPause" ||
    formValues.situation === "unknown";
  const usedDefaultDuoRate = formValues.duoInterestRate.trim().length === 0;
  const usedDefaultTerm = formValues.remainingTermYears.trim().length === 0;
  const mobileFieldOrder = [
    "situation",
    "repaymentRule",
    ...(showActualField ? ["actualMonthlyPayment"] : []),
    ...(showStatutoryField ? ["statutoryMonthlyPayment"] : []),
    "remainingStudentDebt",
    "duoInterestRate",
    "remainingTermYears",
    "extraRepayment",
    "grossIncomeUser",
    "grossIncomePartner",
    "desiredHomePrice",
    "ownMoney",
    "maxMortgageWithoutStudentDebt",
    "mortgageRate",
    "mortgageTermYears",
    "showAdvancedAssumptions",
  ];
  const mobileFlow = useMobileFieldFlow(mobileFieldOrder);
  const step1Fields = ["situation", "repaymentRule"];
  const step2Fields = [
    ...(showActualField ? ["actualMonthlyPayment"] : []),
    ...(showStatutoryField ? ["statutoryMonthlyPayment"] : []),
    "remainingStudentDebt",
    "duoInterestRate",
    "remainingTermYears",
    "extraRepayment",
  ];
  const step3Fields = [
    "grossIncomeUser",
    "grossIncomePartner",
    "desiredHomePrice",
    "ownMoney",
    "maxMortgageWithoutStudentDebt",
  ];
  const step4Fields = ["mortgageRate", "mortgageTermYears", "showAdvancedAssumptions"];
  const isStepVisible = (fieldIds: string[]) =>
    fieldIds.some((fieldId) => mobileFlow.isActiveField(fieldId));
  const isCurrentFieldBlocked = Boolean(
    {
      actualMonthlyPayment: errors.actualMonthlyPayment,
      statutoryMonthlyPayment: errors.statutoryMonthlyPayment,
      remainingStudentDebt: errors.remainingStudentDebt,
      duoInterestRate: errors.duoInterestRate,
      remainingTermYears: errors.remainingTermYears,
      extraRepayment: errors.extraRepayment,
      grossIncomeUser: errors.grossIncomeUser,
      grossIncomePartner: errors.grossIncomePartner,
      desiredHomePrice: errors.desiredHomePrice,
      ownMoney: errors.ownMoney,
      maxMortgageWithoutStudentDebt: errors.maxMortgageWithoutStudentDebt,
      mortgageRate: errors.mortgageRate,
      mortgageTermYears: errors.mortgageTermYears,
    }[mobileFlow.activeFieldId],
  );
  const hasMixedPaymentOutcome = Boolean(
    result &&
      result.mortgageImpact.optimisticPrincipalImpact !==
        result.mortgageImpact.conservativePrincipalImpact,
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
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
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Rekentool v2
          </div>
          <h2 className="mt-2 font-serif text-[30px] tracking-[-0.02em] text-[var(--ink)]">
            Hypotheek-impact van je studieschuld
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Je studieschuld hoeft een koophuis niet onmogelijk te maken, maar je
            DUO-maandlast kan wel meetellen. Deze tool laat zien welk bedrag waarschijnlijk
            relevant is, hoe brutering werkt en wat dat indicatief met je
            hypotheekruimte kan doen.
          </p>
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            Sinds 2024 kijken geldverstrekkers meestal vooral naar je DUO-maandlast,
            maar tijdelijke verlagingen of betaalpauzes tellen niet altijd als
            structureel lagere last.
          </p>
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            Pech gehad met het leenstelsel? Deze tool helpt je niet klagen, maar rekenen.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          Deze tool geeft een indicatie. Een hypotheekverstrekker of adviseur rekent
          met actuele normen, acceptatiebeleid en jouw volledige situatie.
        </div>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-white px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
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
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-white px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
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

        <div className={`mt-7 ${isStepVisible(step1Fields) ? "block" : "hidden"} md:block`}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Stap 1
          </div>
          <h3 className="mt-1 font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Jouw DUO-situatie
          </h3>
          <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            Je vindt dit in Mijn DUO bij Mijn schulden.
          </p>
          <div className="mt-4 grid gap-5">
            <label className={mobileFlow.getFieldClassName("situation")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Situatie
              </span>
              <select
                value={formValues.situation}
                onChange={(event) =>
                  updateField("situation", event.target.value as DuoSituation)
                }
                onKeyDown={mobileFlow.handleEnterAdvance("situation")}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
              >
                {Object.entries(situationLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

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
                {Object.entries(ruleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                SF35 is vaak gunstiger voor je maandlast; SF15 en varianten drukken
                vaak harder op je hypotheekruimte.
              </p>
            </label>
          </div>
        </div>

        <div className={`mt-7 ${isStepVisible(step2Fields) ? "block" : "hidden"} md:block`}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Stap 2
          </div>
          <h3 className="mt-1 font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            DUO-bedragen
          </h3>
          <div className="mt-4 grid gap-5">
            {showActualField ? (
              <label className={mobileFlow.getFieldClassName("actualMonthlyPayment")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Huidig DUO-maandbedrag
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.actualMonthlyPayment}
                  onChange={(event) =>
                    updateField("actualMonthlyPayment", event.target.value)
                  }
                  onKeyDown={mobileFlow.handleEnterAdvance(
                    "actualMonthlyPayment",
                    Boolean(errors.actualMonthlyPayment),
                  )}
                  aria-invalid={Boolean(errors.actualMonthlyPayment)}
                  placeholder={
                    formValues.situation === "paymentPause" ? "Bijvoorbeeld 0" : "Bijvoorbeeld 150"
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                  Vul in wat je nu feitelijk betaalt. Bij een betaalpauze kan dat tijdelijk €0 zijn.
                </p>
                <FieldError message={errors.actualMonthlyPayment} />
              </label>
            ) : null}

            {showStatutoryField ? (
              <label className={mobileFlow.getFieldClassName("statutoryMonthlyPayment")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Wettelijk DUO-maandbedrag
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.statutoryMonthlyPayment}
                  onChange={(event) =>
                    updateField("statutoryMonthlyPayment", event.target.value)
                  }
                  onKeyDown={mobileFlow.handleEnterAdvance(
                    "statutoryMonthlyPayment",
                    Boolean(errors.statutoryMonthlyPayment),
                  )}
                  aria-invalid={Boolean(errors.statutoryMonthlyPayment)}
                  placeholder="Als je dit weet uit Mijn DUO"
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                  Handig als je feitelijke betaling lager is dan wat DUO wettelijk van je verwacht.
                </p>
                <FieldError message={errors.statutoryMonthlyPayment} />
              </label>
            ) : null}

            <label className={mobileFlow.getFieldClassName("remainingStudentDebt")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Resterende studieschuld
              </span>
              <input
                inputMode="decimal"
                value={formValues.remainingStudentDebt}
                onChange={(event) =>
                  updateField("remainingStudentDebt", event.target.value)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "remainingStudentDebt",
                  Boolean(errors.remainingStudentDebt),
                )}
                aria-invalid={Boolean(errors.remainingStudentDebt)}
                placeholder="Bijvoorbeeld 22000"
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                Nodig voor schattingen, brutering én het scenario extra aflossen.
              </p>
              <FieldError message={errors.remainingStudentDebt} />
            </label>

            <label className={mobileFlow.getFieldClassName("duoInterestRate")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                DUO-rentepercentage
              </span>
              <input
                inputMode="decimal"
                value={formValues.duoInterestRate}
                onChange={(event) => updateField("duoInterestRate", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "duoInterestRate",
                  Boolean(errors.duoInterestRate),
                )}
                aria-invalid={Boolean(errors.duoInterestRate)}
                placeholder={String(getDefaultDuoRate(formValues.repaymentRule))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                Laat leeg om de standaard 2026-rente voor {ruleLabels[formValues.repaymentRule]} te gebruiken.
              </p>
              <FieldError message={errors.duoInterestRate} />
            </label>

            <label className={mobileFlow.getFieldClassName("remainingTermYears")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Resterende looptijd
              </span>
              <input
                inputMode="decimal"
                value={formValues.remainingTermYears}
                onChange={(event) =>
                  updateField("remainingTermYears", event.target.value)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "remainingTermYears",
                  Boolean(errors.remainingTermYears),
                )}
                aria-invalid={Boolean(errors.remainingTermYears)}
                placeholder={String(getDefaultTerm(formValues.repaymentRule))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                Leeg laten mag ook: dan gebruiken we {getDefaultTerm(formValues.repaymentRule)} jaar als standaard voor {ruleLabels[formValues.repaymentRule]}.
              </p>
              <FieldError message={errors.remainingTermYears} />
            </label>

            <label className={mobileFlow.getFieldClassName("extraRepayment")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Extra aflossen (optioneel)
              </span>
              <input
                inputMode="decimal"
                value={formValues.extraRepayment}
                onChange={(event) => updateField("extraRepayment", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "extraRepayment",
                  Boolean(errors.extraRepayment),
                )}
                aria-invalid={Boolean(errors.extraRepayment)}
                placeholder="Bijvoorbeeld 5000"
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                Handig als scenario. Niet blind aflossen: buffer en flexibiliteit tellen ook mee.
              </p>
              <FieldError message={errors.extraRepayment} />
            </label>
          </div>
        </div>

        <div className={`mt-7 ${isStepVisible(step3Fields) ? "block" : "hidden"} md:block`}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Stap 3
          </div>
          <h3 className="mt-1 font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Woningdoel
          </h3>
          <div className="mt-4 grid gap-5">
            <label className={mobileFlow.getFieldClassName("grossIncomeUser")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Bruto jaarinkomen gebruiker
              </span>
              <input
                inputMode="decimal"
                value={formValues.grossIncomeUser}
                onChange={(event) => updateField("grossIncomeUser", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "grossIncomeUser",
                  Boolean(errors.grossIncomeUser),
                )}
                aria-invalid={Boolean(errors.grossIncomeUser)}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.grossIncomeUser} />
            </label>

            <label className={mobileFlow.getFieldClassName("grossIncomePartner")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Bruto jaarinkomen partner
              </span>
              <input
                inputMode="decimal"
                value={formValues.grossIncomePartner}
                onChange={(event) =>
                  updateField("grossIncomePartner", event.target.value)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "grossIncomePartner",
                  Boolean(errors.grossIncomePartner),
                )}
                aria-invalid={Boolean(errors.grossIncomePartner)}
                placeholder="Laat leeg als je alleen koopt"
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                Koop je samen? Dan telt de studieschuld van je partner in de praktijk ook mee.
              </p>
              <FieldError message={errors.grossIncomePartner} />
            </label>

            <label className={mobileFlow.getFieldClassName("desiredHomePrice")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Gewenste woningprijs
              </span>
              <input
                inputMode="decimal"
                value={formValues.desiredHomePrice}
                onChange={(event) =>
                  updateField("desiredHomePrice", event.target.value)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "desiredHomePrice",
                  Boolean(errors.desiredHomePrice),
                )}
                aria-invalid={Boolean(errors.desiredHomePrice)}
                placeholder="Bijvoorbeeld 375000"
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.desiredHomePrice} />
            </label>

            <label className={mobileFlow.getFieldClassName("ownMoney")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Eigen geld
              </span>
              <input
                inputMode="decimal"
                value={formValues.ownMoney}
                onChange={(event) => updateField("ownMoney", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "ownMoney",
                  Boolean(errors.ownMoney),
                )}
                aria-invalid={Boolean(errors.ownMoney)}
                placeholder="Bijvoorbeeld 25000"
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.ownMoney} />
            </label>

            <label
              className={mobileFlow.getFieldClassName("maxMortgageWithoutStudentDebt")}
            >
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Maximale hypotheek zonder studieschuld (optioneel)
              </span>
              <input
                inputMode="decimal"
                value={formValues.maxMortgageWithoutStudentDebt}
                onChange={(event) =>
                  updateField("maxMortgageWithoutStudentDebt", event.target.value)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "maxMortgageWithoutStudentDebt",
                  Boolean(errors.maxMortgageWithoutStudentDebt),
                )}
                aria-invalid={Boolean(errors.maxMortgageWithoutStudentDebt)}
                placeholder="Volgens adviseur of rekenhulp"
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                Praktisch als je al een eerste hypotheekindicatie zonder studieschuld hebt.
              </p>
              <FieldError message={errors.maxMortgageWithoutStudentDebt} />
            </label>
          </div>
        </div>

        <div className={`mt-7 ${isStepVisible(step4Fields) ? "block" : "hidden"} md:block`}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Stap 4
          </div>
          <h3 className="mt-1 font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Hypotheek-aannames
          </h3>
          <div className="mt-4 grid gap-5">
            <label className={mobileFlow.getFieldClassName("mortgageRate")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Hypotheekrentepercentage
              </span>
              <input
                inputMode="decimal"
                value={formValues.mortgageRate}
                onChange={(event) => updateField("mortgageRate", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "mortgageRate",
                  Boolean(errors.mortgageRate),
                )}
                aria-invalid={Boolean(errors.mortgageRate)}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.mortgageRate} />
            </label>

            <label className={mobileFlow.getFieldClassName("mortgageTermYears")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Hypotheeklooptijd
              </span>
              <input
                inputMode="decimal"
                value={formValues.mortgageTermYears}
                onChange={(event) =>
                  updateField("mortgageTermYears", event.target.value)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "mortgageTermYears",
                  Boolean(errors.mortgageTermYears),
                )}
                aria-invalid={Boolean(errors.mortgageTermYears)}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.mortgageTermYears} />
            </label>

            <label
              className={`${mobileFlow.getFieldClassName("showAdvancedAssumptions")} rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3`}
            >
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Toon geavanceerde aannames
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formValues.showAdvancedAssumptions}
                  onChange={(event) =>
                    updateField("showAdvancedAssumptions", event.target.checked)
                  }
                  onKeyDown={mobileFlow.handleEnterAdvance("showAdvancedAssumptions")}
                  className="h-4 w-4 rounded border-[var(--hair)] text-[var(--deep)]"
                />
                <span className="text-[14px] leading-[1.6] text-[var(--ink)]">
                  Toon gebruikte defaults en bruteringscontext
                </span>
              </div>
              {result ? (
                <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                  Indicatieve bruteringsstaffel: factor {formatDecimal(result.mortgageImpact.bruteringFactor)} bij {result.mortgageImpact.bruteringLabel}.
                </p>
              ) : null}
            </label>
          </div>
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

        {hasErrors ? (
          <div className="mt-6 rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
            Controleer de invoervelden hierboven. Zodra alle waarden geldig zijn,
            zie je weer een bruikbare indicatie.
          </div>
        ) : null}
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Bovenaan samengevat
            </div>
            {result ? <Pill tone="accent">Indicatief</Pill> : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[30px] leading-[1.03] tracking-[-0.03em] sm:text-[36px]">
                Voor jouw situatie rekent deze tool met ongeveer{" "}
                {formatCurrency(result.mortgageImpact.netDuoMonthlyPayment)} netto
                DUO-last per maand.
              </div>
              <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-white/78">
                Na brutering telt dat indicatief als ongeveer{" "}
                {formatCurrency(result.mortgageImpact.grossDuoMonthlyImpact)} bruto
                maandlast. Dat kan je hypotheekruimte indicatief met ongeveer{" "}
                {formatCurrency(result.mortgageImpact.principalImpact)} drukken.
              </p>
              <p className="mt-3 max-w-[58ch] text-[13px] leading-[1.65] text-white/72">
                Indicatief verplicht DUO-bedrag op basis van inkomen en wettelijk
                maandbedrag: {formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)} p/m.
                Wat je daarboven betaalt ({formatCurrency(result.duoMandatoryPayment.remainingChoiceBudgetMonthly)} p/m in dit scenario) is je keuzezone.
              </p>
              {formValues.situation === "incomeBasedReduction" ? (
                <p className="mt-3 text-[13px] leading-[1.65] text-white/72">
                  Let op: omdat je minder betaalt op basis van draagkracht, kan een
                  hypotheekverstrekker mogelijk met een hoger bedrag rekenen.
                </p>
              ) : null}
              {formValues.situation === "gracePeriod" ? (
                <p className="mt-3 text-[13px] leading-[1.65] text-white/72">
                  Je betaalt nu misschien nog niets, maar de hypotheekverstrekker kan
                  kijken naar het bedrag dat je straks moet betalen.
                </p>
              ) : null}
              {formValues.situation === "paymentPause" ? (
                <p className="mt-3 text-[13px] leading-[1.65] text-white/72">
                  Een tijdelijke betaalpauze maakt de hypotheekimpact niet automatisch nul.
                </p>
              ) : null}
              {hasMixedPaymentOutcome ? (
                <p className="mt-3 text-[13px] leading-[1.65] text-white/72">
                  In een optimistischer lezing kom je uit op ongeveer{" "}
                  {formatCurrency(result.mortgageImpact.optimisticPrincipalImpact)} impact,
                  in een voorzichtigere lezing op ongeveer{" "}
                  {formatCurrency(result.mortgageImpact.conservativePrincipalImpact)}.
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige waarden in om te zien welk DUO-bedrag waarschijnlijk
              meetelt en wat dat indicatief doet met je hypotheekruimte.
            </p>
          )}
        </div>

        <DisclosureSection
          title="Hoe rekenen we dit?"
          subtitle="Hieronder zie je ook de gebruikte aannames en waar je op moet letten in de praktijk."
        >
          <div className="space-y-5">
        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Hoe komen we aan het DUO-bedrag?
            </h3>
            {result ? <Pill tone="dark">{paymentSourceLabels[result.duoPayment.source]}</Pill> : null}
          </div>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            {result?.duoPayment.explanation ??
              "Deze tool zoekt eerst uit welk DUO-bedrag waarschijnlijk relevant is voor je hypotheekgesprek."}
          </p>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Primaire netto DUO-last"
                value={formatCurrency(result.duoPayment.primaryNetMonthlyPayment)}
                sub="Bedrag waar deze tool primair mee rekent"
                accent
              />
              <ResultRow
                label="Optimistisch scenario"
                value={formatCurrency(result.duoPayment.optimisticNetMonthlyPayment)}
                sub="Als een geldverstrekker coulanter naar je actuele betaling kijkt"
              />
              <ResultRow
                label="Voorzichtig scenario"
                value={formatCurrency(result.duoPayment.conservativeNetMonthlyPayment)}
                sub="Als een geldverstrekker met het wettelijke of geschatte bedrag rekent"
              />
              <ResultRow
                label="Geschat wettelijk maandbedrag"
                value={formatCurrency(result.duoPayment.estimatedStatutoryPayment)}
                sub={`Gebaseerd op schuld, rente en looptijd onder ${ruleLabels[formValues.repaymentRule]}`}
              />
            </div>
          ) : null}
          <InfoList items={result?.duoPayment.warnings ?? []} tone="warning" />
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Verplicht DUO-bedrag vs keuzebedrag
          </h3>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            DUO werkt met twee lagen: eerst een wettelijk maandbedrag op basis van
            schuld, rente en looptijd. Daarna een draagkrachttoets op inkomen. Je
            betaalt in de praktijk het laagste van die twee. Alles wat je daarboven
            vrijwillig extra betaalt is een keuze en kun je ook als alternatief
            scenario (buffer, woning of beleggen) vergelijken.
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.6] text-[var(--soft)]">
            {getGlossaryExplanation("wettelijkDuoBedrag")}{" "}
            {getGlossaryExplanation("draagkracht")}
          </p>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Inkomen gebruikt voor draagkracht"
                value={formatCurrency(result.duoMandatoryPayment.annualIncomeUsed)}
                sub="Bruto jaarinkomen gebruiker + partner (indien ingevuld)"
              />
              <ResultRow
                label="Vrijstelling (draagkrachtvrije voet)"
                value={formatCurrency(result.duoMandatoryPayment.allowanceUsed)}
                sub="Indicatieve vrijstelling volgens gekozen regeling"
              />
              <ResultRow
                label="Inkomen boven vrijstelling"
                value={formatCurrency(result.duoMandatoryPayment.amountAboveAllowance)}
                sub="Hierover wordt het DUO-percentage toegepast"
              />
              <ResultRow
                label="DUO-percentage"
                value={
                  result.duoMandatoryPayment.percentageUsed === null
                    ? "n.v.t."
                    : `${formatDecimal(result.duoMandatoryPayment.percentageUsed)}%`
                }
                sub="SF35 rekent indicatief met 4%, SF15/SF15-lllk met 12%"
              />
              <ResultRow
                label="Draagkrachtbedrag per maand"
                value={formatCurrency(result.duoMandatoryPayment.incomeBasedMonthlyPayment)}
                sub="Indicatief bedrag vanuit inkomen"
              />
              <ResultRow
                label="Wettelijk maandbedrag"
                value={formatCurrency(result.duoMandatoryPayment.statutoryMonthlyPayment)}
                sub="Indicatie uit annuïtaire DUO-berekening"
              />
              <ResultRow
                label="Verplicht bedrag per maand"
                value={formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)}
                sub="Laagste van draagkracht en wettelijk maandbedrag"
                accent
              />
              <ResultRow
                label="Keuzeruimte boven verplicht bedrag"
                value={formatCurrency(result.duoMandatoryPayment.remainingChoiceBudgetMonthly)}
                sub="Bedrag dat in dit scenario boven verplicht aflossen uitkomt"
              />
            </div>
          ) : null}
          <InfoList items={result?.duoMandatoryPayment.warnings ?? []} tone="warning" />
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Wat is brutering?
            </h3>
            {result ? <Pill tone="accent">Factor {formatDecimal(result.mortgageImpact.bruteringFactor)}</Pill> : null}
          </div>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            De DUO-maandlast is meestal een netto maandlast. Voor hypotheekberekeningen
            wordt die vaak omgerekend naar een bruto vergelijkbare maandlast. Dat heet
            brutering. Hoe hoger de hypotheekrente, hoe zwaarder die brutering meestal telt.
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.6] text-[var(--soft)]">
            {getGlossaryExplanation("brutering")}
          </p>
          <p className="mt-3 text-[12.5px] leading-[1.6] text-[var(--soft)]">
            Belangrijk: een hogere brutering verhoogt altijd je maandlast-impact. Dat
            de hoofdsom-impact soms niet even hard meegroeit komt door de
            hypotheekrente in de annuïtaire vertaling naar leenruimte.
          </p>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Netto DUO-last"
                value={formatCurrency(result.mortgageImpact.netDuoMonthlyPayment)}
                sub="Bedrag dat uit je DUO-situatie naar voren komt"
              />
              <ResultRow
                label="Gebruikte bruteringsfactor"
                value={formatDecimal(result.mortgageImpact.bruteringFactor)}
                sub={`Indicatieve staffel: ${result.mortgageImpact.bruteringLabel}`}
              />
              <ResultRow
                label="Bruto maandlast-impact"
                value={formatCurrency(result.mortgageImpact.grossDuoMonthlyImpact)}
                sub="De netto DUO-last omgerekend naar bruto vergelijkbare hypotheeklast"
                accent
              />
            </div>
          ) : null}
          <InfoList items={result?.mortgageImpact.assumptions ?? []} />
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat betekent dit voor je hypotheek?
          </h3>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Indicatieve hoofdsom-impact"
                value={formatCurrency(result.mortgageImpact.principalImpact)}
                sub={`Gebaseerd op ${formatDecimal(parsedValues?.mortgageRate ?? 0)}% hypotheekrente en ${parsedValues?.mortgageTermYears ?? 0} jaar`}
                accent
              />
              <ResultRow
                label="Totaal bruto jaarinkomen"
                value={formatCurrency(result.grossIncomeTotal)}
                sub="Alleen context, geen officiële maximale hypotheekberekening"
              />
              <ResultRow
                label="Indicatieve maximale hypotheek op basis van inkomen"
                value={formatCurrency(
                  result.incomeCapacity.incomeBasedMaxMortgageIndicative,
                )}
                sub={`Benadering met ${formatDecimal(
                  result.incomeCapacity.incomeToHousingCostRatioUsed,
                )}% van bruto inkomen als maandlastruimte (${formatCurrency(
                  result.incomeCapacity.monthlyBudgetFromIncome,
                )} p/m)`}
              />
              <ResultRow
                label="Indicatief met studieschuldimpact"
                value={formatCurrency(
                  result.incomeCapacity
                    .incomeBasedMaxMortgageWithStudentDebtIndicative,
                )}
                sub="Zelfde inkomensruimte minus de gebruteerde DUO-maandlast"
                accent
              />
              {result.debtToIncomeRatio !== undefined ? (
                <ResultRow
                  label="Studieschuld als % van jaarinkomen"
                  value={formatPercent(result.debtToIncomeRatio)}
                  sub="Geeft gevoel bij de grootte van je schuld ten opzichte van je inkomen"
                />
              ) : result.remainingStudentDebt > 0 ? (
                <ResultRow
                  label="Studieschuld als % van jaarinkomen"
                  value="Niet te bepalen"
                  sub="Vul een bruto inkomen boven 0 in om deze verhouding te zien"
                />
              ) : null}
              {result.housingTarget ? (
                <>
                  <ResultRow
                    label="Benodigde hypotheek zonder studieschuld"
                    value={formatCurrency(result.housingTarget.neededMortgage)}
                    sub={`Woningprijs ${formatCurrency(result.housingTarget.desiredHomePrice)} minus eigen geld ${formatCurrency(result.housingTarget.ownMoney)}`}
                  />
                  <ResultRow
                    label="Indicatieve behoefte mét studieschuldimpact"
                    value={formatCurrency(
                      result.housingTarget.indicativeMortgageNeedWithStudentDebt,
                    )}
                    sub="Benodigde hypotheek plus de berekende hypotheekimpact van je studieschuld"
                    accent
                  />
                  {result.housingTarget.maxMortgageWithStudentDebtIndicative !==
                  undefined ? (
                    <>
                      <ResultRow
                        label="Max hypotheek zonder studieschuld"
                        value={formatCurrency(
                          result.housingTarget.maxMortgageWithoutStudentDebt ?? 0,
                        )}
                        sub="Zoals jij of je adviseur die al indicatief had"
                      />
                      <ResultRow
                        label="Max hypotheek met studieschuld indicatief"
                        value={formatCurrency(
                          result.housingTarget.maxMortgageWithStudentDebtIndicative,
                        )}
                        sub="Je eerdere indicatie minus de berekende studieschuldimpact"
                      />
                      <ResultRow
                        label="Ruimtegat voor woningdoel"
                        value={formatCurrency(
                          result.housingTarget.gapToTargetIfMaxProvided ?? 0,
                        )}
                        sub="Voorzichtige indicatie van wat je mogelijk tekortkomt voor dit doel"
                        accent
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Wat als je extra aflost?
            </h3>
            {result?.extraRepaymentScenario.extraRepaymentUsed ? (
              <Pill tone="pos">Scenario actief</Pill>
            ) : null}
          </div>
          {result ? (
            result.extraRepaymentScenario.extraRepaymentUsed > 0 ? (
              <div className="mt-5">
                <ResultRow
                  label="Je lost extra af"
                  value={formatCurrency(result.extraRepaymentScenario.extraRepaymentUsed)}
                  sub="Bedrag dat in dit scenario echt is meegenomen"
                />
                <ResultRow
                  label="Geschatte daling DUO-maandlast"
                  value={formatCurrency(
                    result.extraRepaymentScenario.monthlyPaymentReduction,
                  )}
                  sub={`Van ${formatCurrency(result.extraRepaymentScenario.oldEstimatedMonthlyPayment)} naar ${formatCurrency(result.extraRepaymentScenario.newEstimatedMonthlyPayment)} per maand`}
                />
                <ResultRow
                  label="Gebruteerde maandlastdaling"
                  value={formatCurrency(
                    result.extraRepaymentScenario.grossMonthlyImpactReduction,
                  )}
                  sub="De maandlastdaling na toepassing van dezelfde bruteringsfactor"
                />
                <ResultRow
                  label="Indicatieve extra hypotheekruimte"
                  value={formatCurrency(
                    result.extraRepaymentScenario.extraMortgageRoomIndicative,
                  )}
                  sub="Wat die lagere DUO-last in dit scenario extra kan opleveren"
                  accent
                />
                <ResultRow
                  label="Effect per €1 extra aflossen"
                  value={
                    result.extraRepaymentScenario.ratio !== null
                      ? `${formatDecimal(result.extraRepaymentScenario.ratio)}x`
                      : "n.v.t."
                  }
                  sub="Hoeveel extra hypotheekruimte elke extra afgeloste euro hier grofweg oplevert"
                />
                <ResultRow
                  label="Oorspronkelijke indicatieve aflosdatum"
                  value={
                    result.extraRepaymentScenario.payoffWithShorterTerm.originalPayoffDate
                      ? formatIsoDateLabel(
                          `${result.extraRepaymentScenario.payoffWithShorterTerm.originalPayoffDate}-01`,
                        )
                      : "n.v.t."
                  }
                  sub="Zonder extra aflossing en met hetzelfde maandbedrag als startpunt"
                />
                <ResultRow
                  label="Aflosdatum als maandbedrag daalt"
                  value={
                    result.extraRepaymentScenario.payoffWithLowerMonthlyPayment.newPayoffDate
                      ? formatIsoDateLabel(
                          `${result.extraRepaymentScenario.payoffWithLowerMonthlyPayment.newPayoffDate}-01`,
                        )
                      : "n.v.t."
                  }
                  sub="Scenario lowerMonthlyPayment: vooral lagere maandlast, einddatum blijft meestal vergelijkbaar"
                />
                <ResultRow
                  label="Aflosdatum bij gelijk maandbedrag"
                  value={
                    result.extraRepaymentScenario.payoffWithShorterTerm.newPayoffDate
                      ? formatIsoDateLabel(
                          `${result.extraRepaymentScenario.payoffWithShorterTerm.newPayoffDate}-01`,
                        )
                      : "n.v.t."
                  }
                  sub="Scenario shortenTerm: je houdt hetzelfde maandbedrag aan om sneller klaar te zijn"
                />
                <ResultRow
                  label="Indicatief eerder klaar bij gelijk maandbedrag"
                  value={formatMonthsAndYears(
                    result.extraRepaymentScenario.payoffWithShorterTerm.monthsSaved,
                  )}
                  sub="Alleen van toepassing in het shortenTerm-scenario: DUO-maandbedrag blijft dan gelijk."
                  accent
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
                Vul een bedrag voor extra aflossen in als je wilt zien wat een lagere
                DUO-maandlast indicatief met je hypotheekruimte kan doen.
              </div>
            )
          ) : null}
          <InfoList items={result?.extraRepaymentScenario.warnings ?? []} tone="warning" />
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat kun je hiermee?
          </h3>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>Check eerst Mijn DUO en neem je actuele overzicht serieus.</p>
            <p>Vraag na extra aflossen om een nieuw DUO-overzicht, niet alleen om een nieuw gevoel.</p>
            <p>Vergelijk extra aflossen altijd met buffer, aankoopkosten, verduurzaming en lagere hypotheek.</p>
            <p>Wees eerlijk over je studieschuld; de tool helpt je juist om vooraf overzicht te krijgen.</p>
            <p>Laat daarna een hypotheekadviseur de officiële leencapaciteit berekenen.</p>
            <p>Hulp van ouders, werkgever of IKB kan soms helpen, maar een lager toetsinkomen kan óók impact hebben. Laat dat altijd narekenen.</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Checklist Mijn DUO
          </h3>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Dit moet je uit Mijn DUO halen voor een hypotheekgesprek.
          </p>
          <ul className="mt-4 space-y-2 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <li>Actuele resterende studieschuld.</li>
            <li>Huidig maandbedrag.</li>
            <li>Wettelijk maandbedrag.</li>
            <li>Maandbedrag op basis van draagkracht, als dat voor jou geldt.</li>
            <li>Terugbetalingsregel: SF35, SF15, SF15-oud of SF15-lllk.</li>
            <li>Rentepercentage.</li>
            <li>Resterende looptijd.</li>
            <li>Of je in aanloopfase zit.</li>
            <li>Of je een aflossingsvrije periode gebruikt.</li>
            <li>Een nieuw DUO-overzicht na extra aflossing.</li>
          </ul>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            SF35, SF15 en SF15-oud kort uitgelegd
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--paper-soft)] px-4 py-3">
              <div className="text-[13px] font-medium text-[var(--ink)]">SF35</div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">
                35 jaar aflossen, vaak leenstelselgeneratie. Meestal lagere maandlast, maar de schuld loopt langer mee.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--paper-soft)] px-4 py-3">
              <div className="text-[13px] font-medium text-[var(--ink)]">SF15</div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">
                15 jaar aflossen. Meestal hogere maandlast en daardoor vaak grotere hypotheekimpact.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--paper-soft)] px-4 py-3">
              <div className="text-[13px] font-medium text-[var(--ink)]">SF15-oud</div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">
                Oudere regeling. Ook 15 jaar, maar draagkracht en partnerinkomen kunnen anders uitwerken. Check Mijn DUO goed.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--paper-soft)] px-4 py-3">
              <div className="text-[13px] font-medium text-[var(--ink)]">SF15-lllk</div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">
                Levenlanglerenkrediet. 15 jaar aflossen en geen aflossingsvrije periode. Controleer rente en voorwaarden in Mijn DUO.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Waarom eerlijk opgeven?
          </h3>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>Een studieschuld staat meestal niet bij BKR.</p>
            <p>Toch moet je die wel opgeven bij een hypotheekaanvraag.</p>
            <p>Verzwijgen kan problemen geven bij aanvraag, financiering en NHG.</p>
            <p>Wees hier dus gewoon eerlijk over; dat geeft uiteindelijk meer grip dan verrassing achteraf.</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Belangrijke aannames
            </h3>
            <Pill tone="dark">Gecontroleerd op 18 mei 2026</Pill>
          </div>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>
              Bedragen en aannames gecontroleerd op 18 mei 2026. Controleer altijd
              Mijn DUO en laat een hypotheekadviseur de officiële leencapaciteit berekenen.
            </p>
            <p>Laatste controle van deze aannames: {formatIsoDateLabel(LAST_CHECKED)}.</p>
            <p>
              Voor brutering gebruiken we een indicatieve staffel. Geldverstrekkers
              en actuele normen kunnen daarvan afwijken.
            </p>
            <p>
              Centrale bron DUO-rente: {FINANCIAL_CONSTANTS.duo.meta.sourceLabel} (
              {FINANCIAL_CONSTANTS.duo.meta.status}).
            </p>
            <p>
              Centrale bron brutering/hypotheekdefaults:{" "}
              {FINANCIAL_CONSTANTS.mortgage.meta.sourceLabel} (
              {FINANCIAL_CONSTANTS.mortgage.meta.status}).
            </p>
            <p>
              Standaard hypotheek-aannames 2026:{" "}
              {formatDecimal(FINANCIAL_CONSTANTS.mortgage.defaultMortgageRate)}%
              rente en {FINANCIAL_CONSTANTS.mortgage.defaultMortgageTermYears} jaar.
            </p>
            {usedDefaultDuoRate ? (
              <p>
                DUO-rente niet ingevuld: de tool gebruikt daarom het standaardtarief
                voor {ruleLabels[formValues.repaymentRule]}.
              </p>
            ) : null}
            {usedDefaultTerm ? (
              <p>
                Resterende looptijd niet ingevuld: de tool gebruikt daarom de
                standaardlooptijd van {getDefaultTerm(formValues.repaymentRule)} jaar.
              </p>
            ) : null}
          </div>
          {formValues.showAdvancedAssumptions ? (
            <InfoList items={result?.assumptions ?? []} />
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Waarom geen snelle vuistregel meer?
          </h3>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool gebruikt bewust geen losse jaarfactor meer als hoofdroute.
            De uitkomst komt uit netto DUO-last, indicatieve brutering en daarna
            annuïtaire vertaling naar hoofdsom-impact. Dat geeft een betrouwbaardere
            ordegrootte dan een vaste vuistregel.
          </p>
        </div>

        <InfoList items={result?.warnings ?? []} tone="warning" />
          </div>
        </DisclosureSection>
      </section>
    </CalculatorShell>
  );
}
