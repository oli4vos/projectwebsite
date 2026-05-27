"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { GlossaryText } from "@/components/GlossaryText";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateChild18Impact } from "./logic";

type FormState = {
  childBenefitMonthly: string;
  childBudgetMonthly: string;
  healthInsuranceMonthly: string;
  healthAllowanceMonthly: string;
  studyCostsMonthly: string;
  childContributionMonthly: string;
};

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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
    </label>
  );
}

export default function Calculator() {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const result = useMemo(() => {
    if (!submitted) return null;
    return calculateChild18Impact({
      childBenefitMonthly: parseOptionalDecimalInput(submitted.childBenefitMonthly),
      childBudgetMonthly: parseOptionalDecimalInput(submitted.childBudgetMonthly),
      healthInsuranceMonthly: parseOptionalDecimalInput(
        submitted.healthInsuranceMonthly,
      ),
      healthAllowanceMonthly: parseOptionalDecimalInput(
        submitted.healthAllowanceMonthly,
      ),
      studyCostsMonthly: parseOptionalDecimalInput(submitted.studyCostsMonthly),
      childContributionMonthly: parseOptionalDecimalInput(
        submitted.childContributionMonthly,
      ),
    });
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
            setSubmitted(values);
          }}
        >
          <Field
            label="Kinderbijslag per maand"
            value={values.childBenefitMonthly}
            onChange={(value) =>
              setValues((current) => ({ ...current, childBenefitMonthly: value }))
            }
          />
          <Field
            label="Kindgebonden budget per maand"
            value={values.childBudgetMonthly}
            onChange={(value) =>
              setValues((current) => ({ ...current, childBudgetMonthly: value }))
            }
          />
          <Field
            label="Zorgverzekering kind per maand"
            value={values.healthInsuranceMonthly}
            onChange={(value) =>
              setValues((current) => ({ ...current, healthInsuranceMonthly: value }))
            }
          />
          <Field
            label="Zorgtoeslag kind per maand"
            value={values.healthAllowanceMonthly}
            onChange={(value) =>
              setValues((current) => ({ ...current, healthAllowanceMonthly: value }))
            }
          />
          <Field
            label="Studiekosten per maand"
            value={values.studyCostsMonthly}
            onChange={(value) =>
              setValues((current) => ({ ...current, studyCostsMonthly: value }))
            }
          />
          <Field
            label="Bijdrage van je kind per maand"
            value={values.childContributionMonthly}
            onChange={(value) =>
              setValues((current) => ({ ...current, childContributionMonthly: value }))
            }
          />
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
