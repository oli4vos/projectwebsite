"use client";

import type { ReactNode } from "react";
import { DuoDebtPartsEditor } from "@/components/duo/DuoDebtPartsEditor";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { ToolNextSteps } from "@/components/tool/ToolNextSteps";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getGlossaryExplanation } from "@/lib/copy-glossary";
import {
  formatDuoRateYearLabel,
  getAvailableDuoRateYears,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  createDuoDebtPartFormValue,
  type DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getMortgageImpactDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  defaultValues,
  exampleValues,
  paymentSourceLabels,
  ruleLabels,
  situationLabels,
  validateForm,
  type FormState,
  type ValidationErrors,
} from "./form";
import {
  LAST_CHECKED,
  calculateHypotheekImpact,
  getDefaultTerm,
  type DuoSituation,
  type RepaymentRule,
} from "./logic";

const FINANCIAL_CONSTANTS = getFinancialConstants(2026);

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
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
    minimumFractionDigits: 2,
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

function AmountBreakdown({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
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
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    submitContextMessage,
    setValues,
    reset,
  } = useSubmittedCalculation<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      if (field === "debtParts") {
        return formValues.useDebtParts;
      }

      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues, debtPartErrors, debtPartsTotal } = validation;
  const submittedValidation = submittedValues ? validateForm(submittedValues) : null;
  const result = submittedValidation?.parsedValues
    ? calculateHypotheekImpact(submittedValidation.parsedValues)
    : null;
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
  const usedDefaultTerm = formValues.remainingTermYears.trim().length === 0;
  const mobileFieldOrder = [
    "situation",
    "repaymentRule",
    ...(showActualField ? ["actualMonthlyPayment"] : []),
    ...(showStatutoryField ? ["statutoryMonthlyPayment"] : []),
    "remainingStudentDebt",
    "duoRateYear",
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
    "duoRateYear",
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
      duoRateYear: errors.duoRateYear,
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
  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateDebtPart(
    id: string,
    field: keyof Pick<DuoDebtPartFormValue, "amount" | "rateYear">,
    value: string,
  ) {
    setFormValues((current) => ({
      ...current,
      debtParts: current.debtParts.map((part) =>
        part.id === id ? { ...part, [field]: value } : part,
      ),
    }));
  }

  function addDebtPart() {
    setFormValues((current) => ({
      ...current,
      debtParts: [...current.debtParts, createDuoDebtPartFormValue()],
    }));
  }

  function removeDebtPart(id: string) {
    setFormValues((current) => ({
      ...current,
      debtParts:
        current.debtParts.length > 1
          ? current.debtParts.filter((part) => part.id !== id)
          : current.debtParts,
    }));
  }

  function toggleDebtParts(enabled: boolean) {
    setFormValues((current) => {
      if (!enabled) {
        return { ...current, useDebtParts: false };
      }

      const nextParts =
        current.debtParts.length > 0
          ? current.debtParts
          : [createDuoDebtPartFormValue()];
      const firstPart = nextParts[0];

      return {
        ...current,
        useDebtParts: true,
        debtParts: nextParts.map((part, index) =>
          index === 0 && part.amount.trim().length === 0 && current.remainingStudentDebt.trim().length > 0
            ? { ...part, amount: current.remainingStudentDebt }
            : part,
        ),
        duoRateYear:
          current.duoRateYear.trim().length > 0
            ? current.duoRateYear
            : firstPart.rateYear,
      };
    });
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

  function clearAllInputs() {
    reset("Alle invoervelden zijn gewist. Vul opnieuw in of laad voorbeeldwaarden.");
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
    <CalculatorShell>
      <section className="order-1 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
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
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Start met voorbeeldwaarden
            </ToolActionButton>
            <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">
              Start met profielwaarden
            </ToolActionButton>
            <ToolActionButton type="button" onClick={clearAllInputs} variant="secondary" size="sm">
              Wis invoer
            </ToolActionButton>
          </div>
        ) : null}
        {!hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-white px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Start leeg en vul snel een voorbeeldscenario in.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Start met voorbeeldwaarden
            </ToolActionButton>
            <ToolActionButton type="button" onClick={clearAllInputs} variant="secondary" size="sm">
              Wis invoer
            </ToolActionButton>
          </div>
        ) : null}
        {submitContextMessage ? (
          <p className="mt-3 text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
        ) : null}
        {hasDirtyChanges ? (
          <p className="mt-3 text-[12.5px] text-[var(--muted)]">
            Klik opnieuw op Bereken om de uitkomst te vernieuwen.
          </p>
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
                className="ring-focus hair h-12 w-full min-w-0 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
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
                className="ring-focus hair h-12 w-full min-w-0 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
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
                {formValues.useDebtParts
                  ? "Wordt overschreven door de som van je leningdelen hieronder."
                  : "Nodig voor schattingen, brutering én het scenario extra aflossen."}
              </p>
              <FieldError message={errors.remainingStudentDebt} />
            </label>

            {!formValues.useDebtParts ? (
              <label className={mobileFlow.getFieldClassName("duoRateYear")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  DUO-rentejaar
                </span>
                <select
                  value={formValues.duoRateYear}
                  onChange={(event) => updateField("duoRateYear", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance(
                    "duoRateYear",
                    Boolean(errors.duoRateYear),
                  )}
                  aria-invalid={Boolean(errors.duoRateYear)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  {getAvailableDuoRateYears().map((year) => (
                    <option key={year} value={year}>
                      {formatDuoRateYearLabel(year, formValues.repaymentRule)}
                    </option>
                  ))}
                </select>
                <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
                  Kies op jaar of percentage, bijvoorbeeld 2026 — 2,33%.
                </p>
                <FieldError message={errors.duoRateYear} />
              </label>
            ) : null}

            <DuoDebtPartsEditor
              enabled={formValues.useDebtParts}
              parts={formValues.debtParts}
              totalDebt={debtPartsTotal}
              errorsById={debtPartErrors}
              onToggle={toggleDebtParts}
              onPartChange={updateDebtPart}
              onAddPart={addDebtPart}
              onRemovePart={removeDebtPart}
            />
            <FieldError message={errors.debtParts} />

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
        </div>

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
          <div className="mt-3 hidden flex-wrap items-center gap-3 border-t border-[var(--hair)] pt-2 md:flex">
            <ToolActionButton type="button" onClick={handleCalculate} variant="accent" size="md">
              {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
            </ToolActionButton>
            <p className="text-[12px] text-[var(--muted)]">
              De tool rekent alleen met ingevulde gegevens.
            </p>
          </div>

        {hasErrors ? (
          <div className="mt-6 rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
            Controleer de invoervelden hierboven. Zodra alle waarden geldig zijn,
            zie je weer een bruikbare indicatie.
          </div>
        ) : null}
      </section>

      <section className="order-2 min-w-0 space-y-5">
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
                Voor jouw situatie is het verplichte DUO-bedrag ongeveer{" "}
                {formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)} per maand.
              </div>
              <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-white/78">
                Voor brutering rekenen geldverstrekkers met de annuïtaire
                DUO-maandlast die nodig is om de schuld op nul te zetten:
                {` `}
                {formatCurrency(result.mortgageImpact.bruteringBaseMonthlyPayment)}.
                Na brutering telt dat indicatief als ongeveer{" "}
                {formatCurrency(result.mortgageImpact.grossDuoMonthlyImpact)} bruto
                maandlast.
              </p>
              <ul className="mt-4 space-y-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-[13px] leading-[1.65] text-white/76">
                <li>
                  Verplicht DUO-bedrag: {formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)} per maand.
                </li>
                <li>
                  Bruto DUO-maandlast voor hypotheek: {formatCurrency(result.mortgageImpact.grossDuoMonthlyImpact)} per maand.
                </li>
                <li>
                  Impact op leencapaciteit: {formatCurrency(result.mortgageImpact.principalImpact)} minder leencapaciteit.
                </li>
              </ul>
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
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige waarden in om te zien welk DUO-bedrag waarschijnlijk
              meetelt en wat dat indicatief doet met je hypotheekruimte.
            </p>
          )}
        </div>

        {result ? (
          <ToolNextSteps
            title="Van DUO-impact naar je volledige woonplaatje"
            description="Je weet nu hoeveel leencapaciteit je studieschuld indicatief kost. Bereken als volgende stap je totale hypotheekruimte, of bekijk hoe eigen geld en hulp van familie het financieringsplaatje veranderen."
            primary={{
              href: "/apps/artifact-hypotheek-wonen-maximale-hypotheek",
              label: "Bereken mijn maximale hypotheek",
            }}
            secondary={[
              {
                href: "/apps/familiehulp-eerste-woning",
                label: "Bekijk familiehulp",
              },
              {
                href: "/apps/duo-extra-aflossen",
                label: "Vergelijk extra aflossen",
              },
            ]}
          />
        ) : null}

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
                breakdownLabel="Hoe komt dit bedrag eruit?"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Bron: {paymentSourceLabels[result.duoPayment.source]}.
                      </span>,
                      <span key="2">
                        De DUO-situatie bepaalt of we je actuele maandbedrag, een
                        wettelijk bedrag of een veilige schatting gebruiken.
                      </span>,
                      <span key="3">{result.duoPayment.explanation}</span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Geschat wettelijk maandbedrag"
                value={formatCurrency(result.duoPayment.estimatedStatutoryPayment)}
                sub={`Gebaseerd op schuld, rentejaar en looptijd onder ${ruleLabels[formValues.repaymentRule]}`}
                breakdownLabel="Wettelijke annuïteit"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Resterende schuld: {formatCurrency(result.remainingStudentDebt)}.
                      </span>,
                      <span key="2">
                        Gewogen DUO-rente: {formatDecimal(result.duoRateUsed)}%.
                      </span>,
                      <span key="3">
                        Resterende looptijd: {formatMonthsAndYears(result.duoTermYearsUsed * 12)}.
                      </span>,
                      <span key="4">
                        Dit is de annuïteit die naar nul aflost over de resterende looptijd.
                      </span>,
                      ...(result.debtPortfolio.usesDebtParts
                        ? [
                            <span key="5">
                              Je schuld is hier opgesplitst in {result.debtPortfolio.parts.length} leningdelen met elk een eigen DUO-rentejaar.
                            </span>,
                          ]
                        : []),
                    ]}
                  />
                }
              />
              <ResultRow
                label="DUO-rentebasis"
                value={
                  result.debtPortfolio.usesDebtParts
                    ? `${result.debtPortfolio.parts.length} leningdelen`
                    : String(result.debtPortfolio.rateYearUsed)
                }
                sub={
                  result.debtPortfolio.usesDebtParts
                    ? `Gewogen rente ${formatDecimal(result.duoRateUsed)}% over meerdere rentejaren.`
                    : `Gekozen DUO-rentejaar ${result.debtPortfolio.rateYearUsed}.`
                }
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
            vrijwillig extra betaalt is een keuze die je apart kunt doorrekenen
            voor buffer, woningplannen of looptijd.
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
                breakdownLabel="Hoe is dit berekend?"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Gebruiker: {formatCurrency(parsedValues?.grossIncomeUser ?? 0)}.
                      </span>,
                      <span key="2">
                        Partner: {formatCurrency(parsedValues?.grossIncomePartner ?? 0)}.
                      </span>,
                      <span key="3">
                        Samen vormt dat de inkomensbasis voor de DUO-draagkracht.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Vrijstelling (draagkrachtvrije voet)"
                value={formatCurrency(result.duoMandatoryPayment.allowanceUsed)}
                sub="Indicatieve vrijstelling volgens gekozen regeling"
                breakdownLabel="Vrijstellingsstap"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        De regeling {ruleLabels[formValues.repaymentRule]} bepaalt welke
                        vrijstelling geldt.
                      </span>,
                      <span key="2">
                        Die vrijstelling trekken we af van het bruto jaarinkomen.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Inkomen boven vrijstelling"
                value={formatCurrency(result.duoMandatoryPayment.amountAboveAllowance)}
                sub="Hierover wordt het DUO-percentage toegepast"
                breakdownLabel="Belaste inkomensstap"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(result.duoMandatoryPayment.annualIncomeUsed)} minus{" "}
                        {formatCurrency(result.duoMandatoryPayment.allowanceUsed)}.
                      </span>,
                      <span key="2">
                        Uitkomst: {formatCurrency(result.duoMandatoryPayment.amountAboveAllowance)}.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="DUO-percentage"
                value={
                  result.duoMandatoryPayment.percentageUsed === null
                    ? "n.v.t."
                    : `${formatDecimal(result.duoMandatoryPayment.percentageUsed)}%`
                }
                sub="SF35 rekent indicatief met 4%, SF15/SF15-lllk met 12%"
                breakdownLabel="Percentagekeuze"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Regeling {ruleLabels[formValues.repaymentRule]} bepaalt het percentage.
                      </span>,
                      <span key="2">
                        We gebruiken dit percentage op het inkomen boven de vrijstelling.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Draagkrachtbedrag per maand"
                value={formatCurrency(result.duoMandatoryPayment.incomeBasedMonthlyPayment)}
                sub="Indicatief bedrag vanuit inkomen"
                breakdownLabel="Draagkrachtformule"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(result.duoMandatoryPayment.amountAboveAllowance)} ×{" "}
                        {formatDecimal(result.duoMandatoryPayment.percentageUsed ?? 0)}% / 12.
                      </span>,
                      <span key="2">
                        Uitkomst: {formatCurrency(result.duoMandatoryPayment.incomeBasedMonthlyPayment)} per maand.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Wettelijk maandbedrag"
                value={formatCurrency(result.duoMandatoryPayment.statutoryMonthlyPayment)}
                sub="Indicatie uit annuïtaire DUO-berekening"
                breakdownLabel="Annuïteit tot nul"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Dit bedrag wordt berekend uit de resterende studieschuld, de DUO-rente en de resterende looptijd.
                      </span>,
                      <span key="2">
                        Het is het bedrag dat de schuld aan het einde van de looptijd op nul brengt.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Verplicht bedrag per maand"
                value={formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)}
                sub="Laagste van draagkracht en wettelijk maandbedrag"
                accent
                breakdownLabel="Welke van de twee telt?"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        We nemen de laagste van {formatCurrency(result.duoMandatoryPayment.incomeBasedMonthlyPayment)} en{" "}
                        {formatCurrency(result.duoMandatoryPayment.statutoryMonthlyPayment)}.
                      </span>,
                      <span key="2">
                        Dat is het bedrag dat je in deze situatie daadwerkelijk moet betalen.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Keuzeruimte boven verplicht bedrag"
                value={formatCurrency(result.duoMandatoryPayment.remainingChoiceBudgetMonthly)}
                sub="Bedrag dat in dit scenario boven verplicht aflossen uitkomt"
                breakdownLabel="Vrije extra aflossing"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(result.duoPayment.primaryNetMonthlyPayment)} minus{" "}
                        {formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)}.
                      </span>,
                      <span key="2">
                        Dit deel kun je eventueel ook anders inzetten, bijvoorbeeld als buffer.
                      </span>,
                    ]}
                  />
                }
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
                label="Verplicht DUO-bedrag"
                value={formatCurrency(result.duoMandatoryPayment.requiredMonthlyPayment)}
                sub="Bedrag dat je in deze situatie daadwerkelijk moet betalen"
                breakdownLabel="Basisbedrag"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Dit bedrag komt uit de draagkrachttoets en het wettelijke maandbedrag.
                      </span>,
                      <span key="2">
                        Het blijft apart van het bedrag dat geldverstrekkers voor brutering gebruiken.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Bruteringsbasis"
                value={formatCurrency(result.mortgageImpact.bruteringBaseMonthlyPayment)}
                sub="Annuïtaire DUO-last die naar nul aflost"
                breakdownLabel="Waarom dit bedrag?"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Geldverstrekkers rekenen voor brutering met de DUO-annuïteit tot nul.
                      </span>,
                      <span key="2">
                        Dat bedrag is hier {formatCurrency(result.mortgageImpact.bruteringBaseMonthlyPayment)}.
                      </span>,
                    ]}
                  />
                }
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
                breakdownLabel="Brutering"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(result.mortgageImpact.bruteringBaseMonthlyPayment)} ×{" "}
                        {formatDecimal(result.mortgageImpact.bruteringFactor)}.
                      </span>,
                      <span key="2">
                        Uitkomst: {formatCurrency(result.mortgageImpact.grossDuoMonthlyImpact)} bruto per maand.
                      </span>
                    ]}
                  />
                }
              />
              <ResultRow
                label="Impact op leencapaciteit"
                value={formatCurrency(result.mortgageImpact.principalImpact)}
                sub="Hoeveel de DUO-schuld je maximale hypotheek indicatief verlaagt"
                breakdownLabel="Contante waarde"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        We zetten de bruto DUO-maandlast om naar leenruimte met dezelfde contantewaardeformule als in de hypotheeklaag.
                      </span>,
                      <span key="2">
                        Uitkomst: {formatCurrency(result.mortgageImpact.principalImpact)} minder leencapaciteit.
                      </span>,
                    ]}
                  />
                }
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
                breakdownLabel="Contante waarde"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        We zetten de bruto maandlast om naar leenruimte met de contantewaardeformule.
                      </span>,
                      <span key="2">
                        Daarbij gebruiken we {formatCurrency(result.mortgageImpact.grossDuoMonthlyImpact)} per maand,{" "}
                        {formatDecimal(parsedValues?.mortgageRate ?? 0)}% rente en {parsedValues?.mortgageTermYears ?? 0} jaar.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Totaal bruto jaarinkomen"
                value={formatCurrency(result.grossIncomeTotal)}
                sub="Alleen context, geen officiële maximale hypotheekberekening"
                breakdownLabel="Inkomenssom"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(parsedValues?.grossIncomeUser ?? 0)} +{" "}
                        {formatCurrency(parsedValues?.grossIncomePartner ?? 0)}.
                      </span>
                    ]}
                  />
                }
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
                breakdownLabel="Inkomensruimte"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Jaarinkomen × inkomensratio = maandbudget.
                      </span>,
                      <span key="2">
                        Dat maandbudget wordt met de hypotheekrente en looptijd omgerekend naar leenruimte.
                      </span>,
                    ]}
                  />
                }
              />
              <ResultRow
                label="Indicatief met studieschuldimpact"
                value={formatCurrency(
                  result.incomeCapacity
                    .incomeBasedMaxMortgageWithStudentDebtIndicative,
                )}
                sub="Zelfde inkomensruimte minus de gebruteerde DUO-maandlast"
                accent
                breakdownLabel="Inkomen minus studieschuld"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        We trekken de bruto DUO-maandlast af van de maandruimte uit inkomen.
                      </span>,
                      <span key="2">
                        Resterende maandruimte wordt weer omgezet naar indicatieve hypotheekruimte.
                      </span>,
                    ]}
                  />
                }
              />
              {result.debtToIncomeRatio !== undefined ? (
                <ResultRow
                  label="Studieschuld als % van jaarinkomen"
                  value={formatPercent(result.debtToIncomeRatio)}
                  sub="Geeft gevoel bij de grootte van je schuld ten opzichte van je inkomen"
                  breakdownLabel="Verhouding"
                  breakdown={
                    <AmountBreakdown
                      items={[
                        <span key="1">
                          {formatCurrency(result.remainingStudentDebt)} gedeeld door{" "}
                          {formatCurrency(result.grossIncomeTotal)}.
                        </span>
                      ]}
                    />
                  }
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
                    breakdownLabel="Benodigde lening"
                    breakdown={
                      <AmountBreakdown
                        items={[
                          <span key="1">
                            Woningprijs minus eigen geld en eventuele aankoopkosten.
                          </span>,
                          <span key="2">
                            Dit is de hypotheek die je zonder studieschuld nodig zou hebben.
                          </span>,
                        ]}
                      />
                    }
                  />
                  <ResultRow
                    label="Indicatieve behoefte mét studieschuldimpact"
                    value={formatCurrency(
                      result.housingTarget.indicativeMortgageNeedWithStudentDebt,
                    )}
                    sub="Benodigde hypotheek plus de berekende hypotheekimpact van je studieschuld"
                    accent
                    breakdownLabel="Woningdoel met studieschuld"
                    breakdown={
                      <AmountBreakdown
                        items={[
                          <span key="1">
                            Benodigde hypotheek zonder studieschuld plus de indicatieve invloed van de studieschuld.
                          </span>,
                        ]}
                      />
                    }
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
                        breakdownLabel="Referentiewaarde"
                        breakdown={
                          <AmountBreakdown
                            items={[
                              <span key="1">
                                Dit is de uitgangswaarde die je zonder studieschuld zou gebruiken.
                              </span>,
                            ]}
                          />
                        }
                      />
                      <ResultRow
                        label="Max hypotheek met studieschuld indicatief"
                        value={formatCurrency(
                          result.housingTarget.maxMortgageWithStudentDebtIndicative,
                        )}
                        sub="Je eerdere indicatie minus de berekende studieschuldimpact"
                        breakdownLabel="Minus studieschuldimpact"
                        breakdown={
                          <AmountBreakdown
                            items={[
                              <span key="1">
                                {formatCurrency(result.housingTarget.maxMortgageWithoutStudentDebt ?? 0)} minus{" "}
                                {formatCurrency(result.mortgageImpact.principalImpact)}.
                              </span>
                            ]}
                          />
                        }
                      />
                      <ResultRow
                        label="Ruimtegat voor woningdoel"
                        value={formatCurrency(
                          result.housingTarget.gapToTargetIfMaxProvided ?? 0,
                        )}
                        sub="Voorzichtige indicatie van wat je mogelijk tekortkomt voor dit doel"
                        accent
                        breakdownLabel="Tekort"
                        breakdown={
                          <AmountBreakdown
                            items={[
                              <span key="1">
                                Het verschil tussen je woningdoel en de indicatieve maximale hypotheek met studieschuld.
                              </span>,
                            ]}
                          />
                        }
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
                breakdownLabel="Extra aflossing"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Invoer extra aflossen, begrensd door de resterende studieschuld.
                      </span>
                    ]}
                  />
                }
              />
              <ResultRow
                label="Geschatte daling DUO-maandlast"
                value={formatCurrency(
                  result.extraRepaymentScenario.monthlyPaymentReduction,
                )}
                sub={`Van ${formatCurrency(result.extraRepaymentScenario.oldEstimatedMonthlyPayment)} naar ${formatCurrency(result.extraRepaymentScenario.newEstimatedMonthlyPayment)} per maand`}
                breakdownLabel="Maandlastverschil"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        Oud bedrag minus nieuw bedrag na extra aflossen.
                      </span>
                    ]}
                  />
                }
              />
              <ResultRow
                label="Gebruteerde maandlastdaling"
                value={formatCurrency(
                  result.extraRepaymentScenario.grossMonthlyImpactReduction,
                )}
                sub="De maandlastdaling na toepassing van dezelfde bruteringsfactor"
                breakdownLabel="Brutering van het verschil"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(result.extraRepaymentScenario.monthlyPaymentReduction)} ×{" "}
                        {formatDecimal(result.mortgageImpact.bruteringFactor)}.
                      </span>
                    ]}
                  />
                }
              />
              <ResultRow
                label="Indicatieve extra hypotheekruimte"
                value={formatCurrency(
                  result.extraRepaymentScenario.extraMortgageRoomIndicative,
                )}
                sub="Wat die lagere DUO-last in dit scenario extra kan opleveren"
                accent
                breakdownLabel="Contante waarde van het voordeel"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        De gebruteerde maandlastdaling wordt contant gemaakt over de hypotheeklooptijd.
                      </span>
                    ]}
                  />
                }
              />
              <ResultRow
                label="Effect per €1 extra aflossen"
                value={
                  result.extraRepaymentScenario.ratio !== null
                    ? `${formatDecimal(result.extraRepaymentScenario.ratio)}x`
                    : "n.v.t."
                }
                sub="Hoeveel extra hypotheekruimte elke extra afgeloste euro hier grofweg oplevert"
                breakdownLabel="Terugverdienratio"
                breakdown={
                  <AmountBreakdown
                    items={[
                      <span key="1">
                        {formatCurrency(result.extraRepaymentScenario.extraMortgageRoomIndicative)} gedeeld door{" "}
                        {formatCurrency(result.extraRepaymentScenario.extraRepaymentUsed)}.
                      </span>
                    ]}
                  />
                }
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
            {formValues.useDebtParts ? (
              <p>
                Verdiepingslaag actief: ieder leningdeel gebruikt zijn eigen
                gekozen DUO-rentejaar. De tool rekent daarna met een gewogen rente
                en een optelsom van wettelijke maandbedragen.
              </p>
            ) : (
              <p>
                Gekozen DUO-rentejaar: {formValues.duoRateYear}. De tool haalt
                daarbij centraal het bijbehorende terugbetaaltarief op voor {ruleLabels[formValues.repaymentRule]}.
              </p>
            )}
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
