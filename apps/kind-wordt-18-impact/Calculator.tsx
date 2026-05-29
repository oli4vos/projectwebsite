"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { GlossaryText } from "@/components/GlossaryText";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateChild18Impact, type Child18ImpactInput } from "./logic";

type FormState = {
  childBenefitMonthly: string;
  childBudgetMonthly: string;
  healthInsuranceMonthly: string;
  healthAllowanceMonthly: string;
  studyCostsMonthly: string;
  childContributionMonthly: string;
};

type ValidationErrors = Partial<Record<keyof FormState | "form", string>>;

const defaultValues: FormState = {
  childBenefitMonthly: "",
  childBudgetMonthly: "",
  healthInsuranceMonthly: "",
  healthAllowanceMonthly: "",
  studyCostsMonthly: "",
  childContributionMonthly: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseMoneyField(rawValue: string, field: keyof FormState, errors: ValidationErrors) {
  if (rawValue.trim().length === 0) {
    return undefined;
  }

  const parsed = parseOptionalDecimalInput(rawValue);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < 0) {
    errors[field] = "Gebruik 0 of een hoger bedrag.";
    return undefined;
  }

  return parsed;
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const childBenefitMonthly = parseMoneyField(
    values.childBenefitMonthly,
    "childBenefitMonthly",
    errors,
  );
  const childBudgetMonthly = parseMoneyField(
    values.childBudgetMonthly,
    "childBudgetMonthly",
    errors,
  );
  const healthInsuranceMonthly = parseMoneyField(
    values.healthInsuranceMonthly,
    "healthInsuranceMonthly",
    errors,
  );
  const healthAllowanceMonthly = parseMoneyField(
    values.healthAllowanceMonthly,
    "healthAllowanceMonthly",
    errors,
  );
  const studyCostsMonthly = parseMoneyField(
    values.studyCostsMonthly,
    "studyCostsMonthly",
    errors,
  );
  const childContributionMonthly = parseMoneyField(
    values.childContributionMonthly,
    "childContributionMonthly",
    errors,
  );

  const hasAnyInput = Object.values(values).some((value) => value.trim().length > 0);
  if (!hasAnyInput) {
    errors.form = "Vul minimaal één bedrag in.";
  }

  const parsedValues: Child18ImpactInput | null =
    Object.keys(errors).length === 0
      ? {
          childBenefitMonthly,
          childBudgetMonthly,
          healthInsuranceMonthly,
          healthAllowanceMonthly,
          studyCostsMonthly,
          childContributionMonthly,
        }
      : null;

  return { errors, parsedValues };
}

function Field({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
        {label}
      </span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] text-[var(--ink)] outline-none"
      />
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

  const result = useMemo(() => {
    if (!submitted) return null;
    const submittedValidation = validateForm(submitted);
    if (!submittedValidation.parsedValues) return null;
    return calculateChild18Impact(submittedValidation.parsedValues);
  }, [submitted]);

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Concepttool (hidden)
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Kind wordt 18
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <GlossaryText text="Bekijk wat kinderbijslag, kindgebonden budget, zorgverzekering, zorgtoeslag en studiekosten samen doen met je maandruimte." />
          </p>
        </>
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
            label="Kinderbijslag per maand"
            value={values.childBenefitMonthly}
            error={
              didSubmitAttempt || values.childBenefitMonthly.trim().length > 0
                ? errors.childBenefitMonthly
                : undefined
            }
            onChange={(value) =>
              setValues((current) => ({ ...current, childBenefitMonthly: value }))
            }
          />
          <Field
            label="Kindgebonden budget per maand"
            value={values.childBudgetMonthly}
            error={
              didSubmitAttempt || values.childBudgetMonthly.trim().length > 0
                ? errors.childBudgetMonthly
                : undefined
            }
            onChange={(value) =>
              setValues((current) => ({ ...current, childBudgetMonthly: value }))
            }
          />
          <Field
            label="Zorgverzekering kind per maand"
            value={values.healthInsuranceMonthly}
            error={
              didSubmitAttempt || values.healthInsuranceMonthly.trim().length > 0
                ? errors.healthInsuranceMonthly
                : undefined
            }
            onChange={(value) =>
              setValues((current) => ({ ...current, healthInsuranceMonthly: value }))
            }
          />
          <Field
            label="Zorgtoeslag kind per maand"
            value={values.healthAllowanceMonthly}
            error={
              didSubmitAttempt || values.healthAllowanceMonthly.trim().length > 0
                ? errors.healthAllowanceMonthly
                : undefined
            }
            onChange={(value) =>
              setValues((current) => ({ ...current, healthAllowanceMonthly: value }))
            }
          />
          <Field
            label="Studiekosten per maand"
            value={values.studyCostsMonthly}
            error={
              didSubmitAttempt || values.studyCostsMonthly.trim().length > 0
                ? errors.studyCostsMonthly
                : undefined
            }
            onChange={(value) =>
              setValues((current) => ({ ...current, studyCostsMonthly: value }))
            }
          />
          <Field
            label="Bijdrage van je kind per maand"
            value={values.childContributionMonthly}
            error={
              didSubmitAttempt || values.childContributionMonthly.trim().length > 0
                ? errors.childContributionMonthly
                : undefined
            }
            onChange={(value) =>
              setValues((current) => ({ ...current, childContributionMonthly: value }))
            }
          />
          <FieldError message={didSubmitAttempt ? errors.form : undefined} />
          <ToolActionButton type="submit" variant="submit" size="md" full>
            Bereken maandimpact
          </ToolActionButton>
        </form>
      }
      result={
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          {!result ? (
            <p className="text-[14px] leading-[1.7] text-white/75">
              Vul de onderdelen in die voor jou relevant zijn.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                Indicatieve impact
              </div>
              <p className="font-mono text-[30px] tabular">
                {formatCurrency(result.netMonthlyImpact)} / maand
              </p>
              <p className="text-[14px] leading-[1.6] text-white/75">
                Dat is ongeveer {formatCurrency(result.netAnnualImpact)} per jaar.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <DisclosureSection
            title="Wat verandert er?"
            subtitle="Geen officiële toeslagenberekening, wel maandruimte-inzicht."
          >
            <div className="grid gap-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.lines.map((line) => (
                <p key={line.label}>
                  <strong className="text-[var(--ink)]">{line.label}:</strong>{" "}
                  {formatCurrency(line.monthlyImpact)} per maand. {line.explanation}
                </p>
              ))}
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
