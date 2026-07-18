"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { GlossaryText } from "@/components/GlossaryText";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateBuyVsRent, type BuyVsRentInput } from "./logic";

type FormState = {
  monthlyRent: string;
  purchasePrice: string;
  ownFunds: string;
  mortgageRate: string;
  mortgageTermYears: string;
  monthlyOwnerCosts: string;
  stressRateIncrease: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  monthlyRent: "",
  purchasePrice: "",
  ownFunds: "",
  mortgageRate: "4",
  mortgageTermYears: "30",
  monthlyOwnerCosts: "",
  stressRateIncrease: "2",
};

const exampleValues: FormState = {
  monthlyRent: "1250",
  purchasePrice: "350000",
  ownFunds: "25000",
  mortgageRate: "4",
  mortgageTermYears: "30",
  monthlyOwnerCosts: "180",
  stressRateIncrease: "2",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseRequiredMoney(rawValue: string, field: keyof FormState, errors: ValidationErrors) {
  const parsed = parseOptionalDecimalInput(rawValue);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < 0) {
    errors[field] = "Gebruik 0 of een hoger bedrag.";
    return undefined;
  }

  return parsed;
}

function parseRequiredPercent(
  rawValue: string,
  field: keyof FormState,
  errors: ValidationErrors,
  min: number,
  max: number,
) {
  const parsed = parseOptionalDecimalInput(rawValue);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < min || parsed > max) {
    errors[field] = `Gebruik een percentage tussen ${min} en ${max}.`;
    return undefined;
  }

  return parsed;
}

function parseRequiredYears(
  rawValue: string,
  field: keyof FormState,
  errors: ValidationErrors,
  min: number,
  max: number,
) {
  const parsed = parseOptionalDecimalInput(rawValue);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < min || parsed > max) {
    errors[field] = `Gebruik een looptijd tussen ${min} en ${max} jaar.`;
    return undefined;
  }

  return parsed;
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const monthlyRent = parseRequiredMoney(values.monthlyRent, "monthlyRent", errors);
  const purchasePrice = parseRequiredMoney(values.purchasePrice, "purchasePrice", errors);
  const ownFunds = parseRequiredMoney(values.ownFunds, "ownFunds", errors);
  const mortgageRate = parseRequiredPercent(values.mortgageRate, "mortgageRate", errors, 0, 20);
  const mortgageTermYears = parseRequiredYears(
    values.mortgageTermYears,
    "mortgageTermYears",
    errors,
    1,
    40,
  );
  const monthlyOwnerCosts = parseRequiredMoney(
    values.monthlyOwnerCosts,
    "monthlyOwnerCosts",
    errors,
  );
  const stressRateIncrease = parseRequiredPercent(
    values.stressRateIncrease,
    "stressRateIncrease",
    errors,
    0,
    10,
  );

  if (purchasePrice !== undefined && purchasePrice <= 0) {
    errors.purchasePrice = "Gebruik een woningprijs hoger dan 0.";
  }

  const parsedValues: BuyVsRentInput | null =
    Object.keys(errors).length === 0
      ? {
          monthlyRent,
          purchasePrice,
          ownFunds,
          mortgageRate,
          mortgageTermYears,
          monthlyOwnerCosts,
          stressRateIncrease,
        }
      : null;

  return { errors, parsedValues };
}

function Field({
  label,
  value,
  onChange,
  suffix,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  error?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
        {label}
      </span>
      <div className="hair flex h-12 items-center rounded-md border bg-white px-4">
        <input
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[16px] text-[var(--ink)] outline-none"
        />
        {suffix ? <span className="ml-2 text-[13px] text-[var(--muted)]">{suffix}</span> : null}
      </div>
      <FieldError message={error} />
    </label>
  );
}

export default function Calculator() {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [submitted, setSubmitted] = useState<FormState | null>(null);
  const [didSubmitAttempt, setDidSubmitAttempt] = useState(false);
  const validation = validateForm(values);
  const { errors, parsedValues } = validation;
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => {
      if (didSubmitAttempt) return true;
      const value = values[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : false;
    }),
  ) as ValidationErrors;

  const result = useMemo(() => {
    if (!submitted) return null;
    const submittedValidation = validateForm(submitted);
    if (!submittedValidation.parsedValues) return null;
    return calculateBuyVsRent(submittedValidation.parsedValues);
  }, [submitted]);

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Concepttool (hidden)
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Kopen of huren?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <GlossaryText text="Vergelijk huur met kopen op maandlasten, eigen geld en een eenvoudige rente-stresstest." />
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={() => setValues(exampleValues)}
          >
            Voorbeeld invullen
          </ToolActionButton>
        </div>
      }
      inputs={
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setDidSubmitAttempt(true);
            if (!parsedValues) return;
            setSubmitted(values);
          }}
        >
          <Field
            label="Huidige huur per maand"
            value={values.monthlyRent}
            error={visibleErrors.monthlyRent}
            onChange={(value) => setValues((current) => ({ ...current, monthlyRent: value }))}
          />
          <Field
            label="Gewenste woningprijs"
            value={values.purchasePrice}
            error={visibleErrors.purchasePrice}
            onChange={(value) => setValues((current) => ({ ...current, purchasePrice: value }))}
          />
          <Field
            label="Eigen geld"
            value={values.ownFunds}
            error={visibleErrors.ownFunds}
            onChange={(value) => setValues((current) => ({ ...current, ownFunds: value }))}
          />
          <Field
            label="Hypotheekrente"
            suffix="%"
            value={values.mortgageRate}
            error={visibleErrors.mortgageRate}
            onChange={(value) => setValues((current) => ({ ...current, mortgageRate: value }))}
          />
          <Field
            label="Looptijd hypotheek"
            suffix="jaar"
            value={values.mortgageTermYears}
            error={visibleErrors.mortgageTermYears}
            onChange={(value) =>
              setValues((current) => ({ ...current, mortgageTermYears: value }))
            }
          />
          <Field
            label="Extra eigenaarslasten per maand"
            value={values.monthlyOwnerCosts}
            error={visibleErrors.monthlyOwnerCosts}
            onChange={(value) =>
              setValues((current) => ({ ...current, monthlyOwnerCosts: value }))
            }
          />
          <Field
            label="Rente-stresstest"
            suffix="% hoger"
            value={values.stressRateIncrease}
            error={visibleErrors.stressRateIncrease}
            onChange={(value) =>
              setValues((current) => ({ ...current, stressRateIncrease: value }))
            }
          />
          <ToolActionButton type="submit" variant="submit" size="md" full>
            Bereken
          </ToolActionButton>
        </form>
      }
      result={
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          {!result ? (
            <p className="text-[14px] leading-[1.7] text-white/75">
              Vul in wat je weet en klik op Bereken.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                Maandruimte
              </div>
              <p className="font-mono text-[30px] tabular">
                {formatCurrency(result.buyMonthlyCost)}
              </p>
              <p className="text-[14px] leading-[1.6] text-white/75">
                Kopen is indicatief{" "}
                {formatCurrency(Math.abs(result.monthlyDifferenceVsRent))} per maand{" "}
                {result.monthlyDifferenceVsRent >= 0 ? "duurder" : "goedkoper"} dan huren.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <DisclosureSection
            title="Verdieping: eigen geld en renterisico"
            subtitle="Conceptuele stresstest voor woningzoekers."
          >
            <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Geschatte koopkosten: {formatCurrency(result.estimatedBuyerCosts)}.</p>
              <p>Tekort aan eigen geld: {formatCurrency(result.ownFundsGap)}.</p>
              <p>
                Bij {result.stressRate.toFixed(2)}% rente worden de maandlasten
                ongeveer {formatCurrency(result.stressMonthlyIncrease)} hoger.
              </p>
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          </DisclosureSection>
        ) : null
      }
    />
  );
}
