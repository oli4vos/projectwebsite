"use client";

import { useState } from "react";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getVolgendeEuroDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateVolgendeEuroPriorities, type VolgendeEuroInput } from "./logic";

type FormState = {
  year: string;
  extraAmount: string;
  monthlyFreeRoom: string;
  currentBuffer: string;
  targetBuffer: string;
  hasExpensiveDebt: boolean;
  expensiveDebtRate: string;
  expensiveDebtAmount: string;
  studentDebtAmount: string;
  duoRate: string;
  mortgageRate: string;
  hasJaarruimte: boolean;
  availableJaarruimte: string;
  horizonYears: string;
  expectedAnnualReturn: string;
  hasHousingGoal: boolean;
  riskProfile: "conservative" | "neutral" | "offensive";
  targetHomePrice: string;
  ownFunds: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  year: String(getDefaultFinancialYear()),
  extraAmount: "1000",
  monthlyFreeRoom: "300",
  currentBuffer: "5000",
  targetBuffer: "12000",
  hasExpensiveDebt: false,
  expensiveDebtRate: "9",
  expensiveDebtAmount: "0",
  studentDebtAmount: "15000",
  duoRate: "2.33",
  mortgageRate: "4",
  hasJaarruimte: false,
  availableJaarruimte: "0",
  horizonYears: "15",
  expectedAnnualReturn: "5",
  hasHousingGoal: false,
  riskProfile: "neutral",
  targetHomePrice: "0",
  ownFunds: "0",
};

const defaultValues: FormState = {
  year: "",
  extraAmount: "",
  monthlyFreeRoom: "",
  currentBuffer: "",
  targetBuffer: "",
  hasExpensiveDebt: false,
  expensiveDebtRate: "",
  expensiveDebtAmount: "",
  studentDebtAmount: "",
  duoRate: "",
  mortgageRate: "",
  hasJaarruimte: false,
  availableJaarruimte: "",
  horizonYears: "",
  expectedAnnualReturn: "",
  hasHousingGoal: false,
  riskProfile: "neutral",
  targetHomePrice: "",
  ownFunds: "",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

function parseOptionalNumber(value: string | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.replace(/\s+/g, "").replace(",", ".");
  if (normalized.length === 0) {
    return undefined;
  }
  return Number(normalized);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const year = parseOptionalNumber(values.year);
  const extraAmount = parseOptionalNumber(values.extraAmount);
  const monthlyFreeRoom = parseOptionalNumber(values.monthlyFreeRoom);
  const currentBuffer = parseOptionalNumber(values.currentBuffer);
  const targetBuffer = parseOptionalNumber(values.targetBuffer);
  const expensiveDebtRate = parseOptionalNumber(values.expensiveDebtRate);
  const expensiveDebtAmount = parseOptionalNumber(values.expensiveDebtAmount);
  const studentDebtAmount = parseOptionalNumber(values.studentDebtAmount);
  const duoRate = parseOptionalNumber(values.duoRate);
  const mortgageRate = parseOptionalNumber(values.mortgageRate);
  const availableJaarruimte = parseOptionalNumber(values.availableJaarruimte);
  const horizonYears = parseOptionalNumber(values.horizonYears);
  const expectedAnnualReturn = parseOptionalNumber(values.expectedAnnualReturn);
  const targetHomePrice = parseOptionalNumber(values.targetHomePrice);
  const ownFunds = parseOptionalNumber(values.ownFunds);

  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }
  for (const [field, value] of [
    ["extraAmount", extraAmount],
    ["monthlyFreeRoom", monthlyFreeRoom],
    ["currentBuffer", currentBuffer],
    ["targetBuffer", targetBuffer],
    ["studentDebtAmount", studentDebtAmount],
    ["targetHomePrice", targetHomePrice],
    ["ownFunds", ownFunds],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      errors[field] = "Gebruik 0 of een hoger bedrag.";
    }
  }
  if (duoRate !== undefined && (!Number.isFinite(duoRate) || duoRate < 0 || duoRate > 100)) {
    errors.duoRate = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    mortgageRate !== undefined &&
    (!Number.isFinite(mortgageRate) || mortgageRate < 0 || mortgageRate > 100)
  ) {
    errors.mortgageRate = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    values.hasExpensiveDebt &&
    (expensiveDebtRate === undefined ||
      !Number.isFinite(expensiveDebtRate) ||
      expensiveDebtRate < 0 ||
      expensiveDebtRate > 100)
  ) {
    errors.expensiveDebtRate = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    values.hasExpensiveDebt &&
    (expensiveDebtAmount === undefined ||
      !Number.isFinite(expensiveDebtAmount) ||
      expensiveDebtAmount < 0)
  ) {
    errors.expensiveDebtAmount = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    values.hasJaarruimte &&
    (availableJaarruimte === undefined ||
      !Number.isFinite(availableJaarruimte) ||
      availableJaarruimte < 0)
  ) {
    errors.availableJaarruimte = "Gebruik 0 of een hoger bedrag.";
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
    expectedAnnualReturn === undefined ||
    !Number.isFinite(expectedAnnualReturn) ||
    expectedAnnualReturn < 0 ||
    expectedAnnualReturn > 100
  ) {
    errors.expectedAnnualReturn = "Gebruik een percentage tussen 0 en 100.";
  }

  const parsedValues: VolgendeEuroInput | null =
    Object.keys(errors).length === 0
      ? {
          year,
          extraAmount: extraAmount ?? 0,
          monthlyFreeRoom: monthlyFreeRoom ?? 0,
          currentBuffer: currentBuffer ?? 0,
          targetBuffer: targetBuffer ?? 0,
          hasExpensiveDebt: values.hasExpensiveDebt,
          expensiveDebtRate: values.hasExpensiveDebt ? expensiveDebtRate : undefined,
          expensiveDebtAmount: values.hasExpensiveDebt ? expensiveDebtAmount : undefined,
          studentDebtAmount: studentDebtAmount ?? 0,
          duoRate,
          mortgageRate,
          availableJaarruimte: values.hasJaarruimte ? availableJaarruimte : 0,
          horizonYears: horizonYears ?? 0,
          expectedAnnualReturn: expectedAnnualReturn ?? 0,
          hasHousingGoal: values.hasHousingGoal,
          riskProfile: values.riskProfile,
          targetHomePrice,
          ownFunds,
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
  const profilePatch = getVolgendeEuroDefaultsFromProfile(profile);
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
  const result = parsedValues ? calculateVolgendeEuroPriorities(parsedValues) : null;

  const mobileFlow = useMobileFieldFlow([
    "year",
    "extraAmount",
    "monthlyFreeRoom",
    "currentBuffer",
    "targetBuffer",
    "hasExpensiveDebt",
    ...(formValues.hasExpensiveDebt ? ["expensiveDebtRate", "expensiveDebtAmount"] : []),
    "studentDebtAmount",
    "duoRate",
    "mortgageRate",
    "hasJaarruimte",
    ...(formValues.hasJaarruimte ? ["availableJaarruimte"] : []),
    "horizonYears",
    "expectedAnnualReturn",
    "hasHousingGoal",
    ...(formValues.hasHousingGoal ? ["targetHomePrice", "ownFunds"] : []),
    "riskProfile",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      year: errors.year,
      extraAmount: errors.extraAmount,
      monthlyFreeRoom: errors.monthlyFreeRoom,
      currentBuffer: errors.currentBuffer,
      targetBuffer: errors.targetBuffer,
      expensiveDebtRate: errors.expensiveDebtRate,
      expensiveDebtAmount: errors.expensiveDebtAmount,
      studentDebtAmount: errors.studentDebtAmount,
      duoRate: errors.duoRate,
      mortgageRate: errors.mortgageRate,
      availableJaarruimte: errors.availableJaarruimte,
      horizonYears: errors.horizonYears,
      expectedAnnualReturn: errors.expectedAnnualReturn,
      targetHomePrice: errors.targetHomePrice,
      ownFunds: errors.ownFunds,
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

  return (
    <CalculatorShell>
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Beslis-tool
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Wat doe ik met mijn volgende euro?
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Gebruik deze prioriteitenhulp om te bepalen waar extra geld nu het meest logisch
          naartoe kan: buffer, aflossen, pensioen, beleggen of woningdoel.
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
          <label className={mobileFlow.getFieldClassName("year")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Belastingjaar</span>
            <input
              inputMode="numeric"
              value={formValues.year}
              onChange={(event) => updateField("year", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("year", Boolean(errors.year))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.year} />
          </label>

          <label className={mobileFlow.getFieldClassName("extraAmount")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Extra bedrag beschikbaar</span>
            <input
              inputMode="decimal"
              value={formValues.extraAmount}
              onChange={(event) => updateField("extraAmount", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("extraAmount", Boolean(errors.extraAmount))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.extraAmount} />
          </label>

          <label className={mobileFlow.getFieldClassName("monthlyFreeRoom")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Maandelijkse vrije ruimte</span>
            <input
              inputMode="decimal"
              value={formValues.monthlyFreeRoom}
              onChange={(event) => updateField("monthlyFreeRoom", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("monthlyFreeRoom", Boolean(errors.monthlyFreeRoom))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.monthlyFreeRoom} />
          </label>

          <label className={mobileFlow.getFieldClassName("currentBuffer")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Huidige buffer</span>
            <input
              inputMode="decimal"
              value={formValues.currentBuffer}
              onChange={(event) => updateField("currentBuffer", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("currentBuffer", Boolean(errors.currentBuffer))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.currentBuffer} />
          </label>

          <label className={mobileFlow.getFieldClassName("targetBuffer")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Gewenste buffer</span>
            <input
              inputMode="decimal"
              value={formValues.targetBuffer}
              onChange={(event) => updateField("targetBuffer", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("targetBuffer", Boolean(errors.targetBuffer))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.targetBuffer} />
          </label>

          <label className={mobileFlow.getFieldClassName("hasExpensiveDebt")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Dure schuld aanwezig</span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.hasExpensiveDebt}
                onChange={(event) => updateField("hasExpensiveDebt", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          {formValues.hasExpensiveDebt ? (
            <>
              <label className={mobileFlow.getFieldClassName("expensiveDebtRate")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Rente dure schuld (%)</span>
                <input
                  inputMode="decimal"
                  value={formValues.expensiveDebtRate}
                  onChange={(event) => updateField("expensiveDebtRate", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance("expensiveDebtRate", Boolean(errors.expensiveDebtRate))}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.expensiveDebtRate} />
              </label>
              <label className={mobileFlow.getFieldClassName("expensiveDebtAmount")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Bedrag dure schuld</span>
                <input
                  inputMode="decimal"
                  value={formValues.expensiveDebtAmount}
                  onChange={(event) => updateField("expensiveDebtAmount", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance("expensiveDebtAmount", Boolean(errors.expensiveDebtAmount))}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.expensiveDebtAmount} />
              </label>
            </>
          ) : null}

          <label className={mobileFlow.getFieldClassName("studentDebtAmount")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Studieschuld</span>
            <input
              inputMode="decimal"
              value={formValues.studentDebtAmount}
              onChange={(event) => updateField("studentDebtAmount", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("studentDebtAmount", Boolean(errors.studentDebtAmount))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.studentDebtAmount} />
          </label>

          <label className={mobileFlow.getFieldClassName("duoRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">DUO-rente (%)</span>
            <input
              inputMode="decimal"
              value={formValues.duoRate}
              onChange={(event) => updateField("duoRate", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("duoRate", Boolean(errors.duoRate))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.duoRate} />
          </label>

          <label className={mobileFlow.getFieldClassName("mortgageRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Hypotheekrente (%)</span>
            <input
              inputMode="decimal"
              value={formValues.mortgageRate}
              onChange={(event) => updateField("mortgageRate", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("mortgageRate", Boolean(errors.mortgageRate))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.mortgageRate} />
          </label>

          <label className={mobileFlow.getFieldClassName("hasJaarruimte")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Jaarruimte beschikbaar</span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.hasJaarruimte}
                onChange={(event) => updateField("hasJaarruimte", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          {formValues.hasJaarruimte ? (
            <label className={mobileFlow.getFieldClassName("availableJaarruimte")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Beschikbare jaarruimte</span>
              <input
                inputMode="decimal"
                value={formValues.availableJaarruimte}
                onChange={(event) => updateField("availableJaarruimte", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance("availableJaarruimte", Boolean(errors.availableJaarruimte))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.availableJaarruimte} />
            </label>
          ) : null}

          <label className={mobileFlow.getFieldClassName("horizonYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Beleggingshorizon (jaren)</span>
            <input
              inputMode="numeric"
              value={formValues.horizonYears}
              onChange={(event) => updateField("horizonYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("horizonYears", Boolean(errors.horizonYears))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.horizonYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("expectedAnnualReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Verwacht rendement (%)</span>
            <input
              inputMode="decimal"
              value={formValues.expectedAnnualReturn}
              onChange={(event) => updateField("expectedAnnualReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("expectedAnnualReturn", Boolean(errors.expectedAnnualReturn))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedAnnualReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("hasHousingGoal")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Woningdoel actief</span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.hasHousingGoal}
                onChange={(event) => updateField("hasHousingGoal", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          {formValues.hasHousingGoal ? (
            <>
              <label className={mobileFlow.getFieldClassName("targetHomePrice")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Doel koopprijs (optioneel)</span>
                <input
                  inputMode="decimal"
                  value={formValues.targetHomePrice}
                  onChange={(event) => updateField("targetHomePrice", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance("targetHomePrice", Boolean(errors.targetHomePrice))}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.targetHomePrice} />
              </label>
              <label className={mobileFlow.getFieldClassName("ownFunds")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Eigen geld nu</span>
                <input
                  inputMode="decimal"
                  value={formValues.ownFunds}
                  onChange={(event) => updateField("ownFunds", event.target.value)}
                  onKeyDown={mobileFlow.handleEnterAdvance("ownFunds", Boolean(errors.ownFunds))}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.ownFunds} />
              </label>
            </>
          ) : null}

          <label className={mobileFlow.getFieldClassName("riskProfile")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Risicoprofiel</span>
            <select
              value={formValues.riskProfile}
              onChange={(event) =>
                updateField("riskProfile", event.target.value as FormState["riskProfile"])
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="conservative">Voorzichtig</option>
              <option value="neutral">Neutraal</option>
              <option value="offensive">Offensief</option>
            </select>
          </label>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
          />
        </div>
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Samenvatting
            </div>
            {result ? (
              <Pill tone="accent">{result.topRecommendation.bucket}</Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.topRecommendation.label}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Op basis van je invoer lijkt je volgende euro het meest logisch voor:{" "}
                {result.topRecommendation.label.toLowerCase()}.
              </p>
            </>
          ) : null}
        </div>

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Top 3 keuzes
            </h3>
            <div className="mt-4 space-y-3">
              {result.topThree.map((option, index) => (
                <div
                  key={option.key}
                  className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-[var(--ink)]">
                      {index + 1}. {option.label}
                    </div>
                    <Pill tone={option.score >= 70 ? "pos" : option.score >= 45 ? "accent" : "neg"}>
                      score {option.score}
                    </Pill>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">{option.reason}</p>
                  <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">{option.riskFlexNote}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Volledige prioriteitenlijst
            </h3>
            <div className="mt-4">
              {result.priorities.map((option) => (
                <ResultRow
                  key={option.key}
                  label={`${option.label} · ${option.bucket}`}
                  value={`${option.score}/100`}
                  sub={option.reason}
                />
              ))}
            </div>
          </div>
        ) : null}

        <ToolDisclosure
          title="Hoe bepalen we de volgorde?"
          subtitle="Educatief prioriteitenmodel, geen hard financieel advies."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>1) Buffertekort en dure schuld krijgen eerst een hoge basisprioriteit.</p>
              <p>2) Daarna wegen we flexibiliteit, rente, horizon en risicoprofiel.</p>
              <p>3) Jaarruimte, beleggen, woningdoel en extra aflossen worden als alternatieven naast elkaar gezet.</p>
              <p>4) DUO-context: geschat wettelijk maandbedrag circa {formatCurrency(result.duoContext.estimatedStatutoryMonthlyPayment)} bij {result.duoContext.assumedRate.toFixed(2)}%.</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Welke aannames gebruiken we?"
          subtitle="Centrale constants als basis voor het model."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.assumptions.sourceLabel}</p>
              <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
              <p>Status: {result.assumptions.status}</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure title="Waarom niet blind aflossen?" subtitle="Aflossen is niet altijd automatisch de beste eerste stap.">
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Bij lage rente, beperkte buffer of een actief woningdoel kan het logisch zijn om eerst
            liquiditeit op te bouwen. Deze tool helpt die trade-offs zichtbaar te maken.
          </p>
        </ToolDisclosure>

        <ToolDisclosure title="Wat als FIRE je doel is?" subtitle="Flexibiliteit en tijdshorizon tellen zwaar mee.">
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            FIRE-scenario&apos;s hebben vaak baat bij een robuuste buffer en flexibel vermogen.
            Fiscaal voordeel nu kan aantrekkelijk zijn, maar beschikbaarheid van kapitaal blijft
            een kernfactor.
          </p>
        </ToolDisclosure>

        <ToolDisclosure title="Waarschuwingen" subtitle="Gebruik dit als prioriteitenhulp.">
          <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            {(result?.warnings ?? []).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </ToolDisclosure>
      </section>
    </CalculatorShell>
  );
}
