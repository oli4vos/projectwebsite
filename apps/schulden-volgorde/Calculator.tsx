"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { GlossaryText } from "@/components/GlossaryText";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { ToolNextSteps } from "@/components/tool/ToolNextSteps";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { getToolNextSteps } from "@/lib/tool-journeys";
import {
  calculateDebtPriority,
  type DebtKind,
  type DebtPriorityInput,
} from "./logic";

type DebtFormRow = {
  kind: DebtKind;
  amount: string;
  interestRate: string;
};

type FormState = {
  extraAmount: string;
  debts: DebtFormRow[];
};

type DebtRowErrors = {
  amount?: string;
  interestRate?: string;
};

type ValidationErrors = {
  extraAmount?: string;
  debts: DebtRowErrors[];
  form?: string;
};

const defaultValues: FormState = {
  extraAmount: "",
  debts: [
    { kind: "bnpl", amount: "", interestRate: "" },
    { kind: "creditCard", amount: "", interestRate: "" },
    { kind: "duo", amount: "", interestRate: "" },
    { kind: "mortgage", amount: "", interestRate: "" },
  ],
};

const exampleValues: FormState = {
  extraAmount: "2500",
  debts: [
    { kind: "bnpl", amount: "750", interestRate: "0" },
    { kind: "creditCard", amount: "1800", interestRate: "18" },
    { kind: "personalLoan", amount: "5500", interestRate: "8,9" },
    { kind: "duo", amount: "15000", interestRate: "2,33" },
    { kind: "mortgage", amount: "250000", interestRate: "4,0" },
    { kind: "other", amount: "", interestRate: "" },
  ],
};

const kindLabels: Record<DebtKind, string> = {
  bnpl: "Achteraf betalen",
  creditCard: "Creditcard",
  personalLoan: "Persoonlijke lening",
  duo: "DUO-schuld",
  mortgage: "Hypotheek",
  other: "Overige schuld",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function validateForm(values: FormState) {
  const debts: DebtRowErrors[] = values.debts.map(() => ({}));
  const extraAmount = parseOptionalDecimalInput(values.extraAmount);
  const errors: ValidationErrors = { debts };
  const parsedDebts: DebtPriorityInput["debts"] = [];
  let hasDebtWithAmount = false;

  if (extraAmount === undefined || !Number.isFinite(extraAmount) || extraAmount < 0) {
    errors.extraAmount = "Gebruik 0 of een hoger bedrag.";
  }

  for (const [index, debt] of values.debts.entries()) {
    let amount: number | undefined;
    let interestRate: number | undefined;
    const hasAmountInput = debt.amount.trim().length > 0;
    const hasRateInput = debt.interestRate.trim().length > 0;

    if (hasAmountInput) {
      const parsedAmount = parseOptionalDecimalInput(debt.amount);
      if (parsedAmount === undefined || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
        debts[index].amount = "Gebruik 0 of een hoger bedrag.";
      } else {
        amount = parsedAmount;
      }
    }

    if (hasRateInput) {
      const parsedRate = parseOptionalDecimalInput(debt.interestRate);
      if (
        parsedRate === undefined ||
        !Number.isFinite(parsedRate) ||
        parsedRate < 0 ||
        parsedRate > 100
      ) {
        debts[index].interestRate = "Gebruik een rente tussen 0 en 100.";
      } else {
        interestRate = parsedRate;
      }
    }

    if (hasAmountInput && amount !== undefined && amount > 0 && interestRate === undefined) {
      debts[index].interestRate = "Vul rente in (0 t/m 100) voor deze schuld.";
    }

    if (hasRateInput && interestRate !== undefined && (amount === undefined || amount <= 0)) {
      debts[index].amount = "Vul een schuldbedrag hoger dan 0 in.";
    }

    if (amount !== undefined && amount > 0 && interestRate !== undefined) {
      hasDebtWithAmount = true;
    }

    parsedDebts.push({
      kind: debt.kind,
      amount,
      interestRate,
    });
  }

  const hasDebtErrors = debts.some((debt) => Boolean(debt.amount || debt.interestRate));
  if (!hasDebtWithAmount && !hasDebtErrors) {
    errors.form = "Vul minimaal één schuld met bedrag en rente in.";
  }

  const hasErrors =
    Boolean(errors.extraAmount) ||
    Boolean(errors.form) ||
    errors.debts.some((debt) => Boolean(debt.amount || debt.interestRate));

  const parsedValues: DebtPriorityInput | null = hasErrors
    ? null
    : {
        extraAmount,
        debts: parsedDebts,
      };

  return { errors, parsedValues };
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
    return calculateDebtPriority(submittedValidation.parsedValues);
  }, [submitted]);
  const nextSteps = getToolNextSteps("schulden-volgorde");

  function updateDebt(index: number, patch: Partial<DebtFormRow>) {
    setValues((current) => ({
      ...current,
      debts: current.debts.map((debt, debtIndex) =>
        debtIndex === index ? { ...debt, ...patch } : debt,
      ),
    }));
  }

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Beta-rekentool
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Welke schuld eerst?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <GlossaryText text="Zet achteraf betalen, creditcard, DUO en hypotheek in een logische volgorde voor extra aflossen." />
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
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Extra bedrag dat je wilt inzetten
            </span>
            <input
              inputMode="decimal"
              value={values.extraAmount}
              onChange={(event) =>
                setValues((current) => ({ ...current, extraAmount: event.target.value }))
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] text-[var(--ink)] outline-none"
            />
            <FieldError
              message={
                didSubmitAttempt || values.extraAmount.trim().length > 0
                  ? errors.extraAmount
                  : undefined
              }
            />
          </label>

          <div className="grid gap-3">
            {values.debts.map((debt, index) => (
              <div key={debt.kind} className="rounded-xl border hair bg-[var(--paper)] p-3">
                <div className="text-[12px] font-medium text-[var(--ink)]">
                  {kindLabels[debt.kind]}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-[11px] font-medium text-[var(--muted)]">
                      Bedrag voor {kindLabels[debt.kind].toLowerCase()}
                    </span>
                    <input
                      inputMode="decimal"
                      placeholder="€ 0"
                      value={debt.amount}
                      onChange={(event) =>
                        updateDebt(index, { amount: event.target.value })
                      }
                      aria-invalid={Boolean(errors.debts[index]?.amount)}
                      className="ring-focus hair h-11 rounded-md border bg-white px-3 font-mono text-[15px] outline-none"
                    />
                    <FieldError
                      message={
                        didSubmitAttempt || debt.amount.trim().length > 0
                          ? errors.debts[index]?.amount
                          : undefined
                      }
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] font-medium text-[var(--muted)]">
                      Rente voor {kindLabels[debt.kind].toLowerCase()}
                    </span>
                    <input
                      inputMode="decimal"
                      placeholder="0%"
                      value={debt.interestRate}
                      onChange={(event) =>
                        updateDebt(index, { interestRate: event.target.value })
                      }
                      aria-invalid={Boolean(errors.debts[index]?.interestRate)}
                      className="ring-focus hair h-11 rounded-md border bg-white px-3 font-mono text-[15px] outline-none"
                    />
                    <FieldError
                      message={
                        didSubmitAttempt || debt.interestRate.trim().length > 0
                          ? errors.debts[index]?.interestRate
                          : undefined
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <FieldError message={didSubmitAttempt ? errors.form : undefined} />

          <ToolActionButton type="submit" variant="submit" size="md" full>
            Bereken volgorde
          </ToolActionButton>
        </form>
      }
      result={
        <div className="space-y-5">
          <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
            {!result ? (
              <p className="text-[14px] leading-[1.7] text-white/75">
                Vul schulden in die voor jou relevant zijn en klik op Bereken.
              </p>
            ) : result.steps.length === 0 ? (
              <p className="text-[14px] leading-[1.7] text-white/75">
                Er zijn nog geen relevante schulden ingevuld.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                  Volgorde
                </div>
                {result.steps.slice(0, 3).map((step) => (
                  <div key={step.rank} className="rounded-xl bg-white/10 p-3">
                    <div className="text-[13px] font-medium text-white">
                      {step.rank}. {step.label}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-[1.5] text-white/70">
                      Extra inzet: {formatCurrency(step.allocatedAmount)} · rente{" "}
                      {step.interestRate.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {result ? <ToolNextSteps {...nextSteps} /> : null}
        </div>
      }
      details={
        result ? (
          <DisclosureSection
            title="Waarom deze volgorde?"
            subtitle="Routehulp voor extra aflossen, geen betalingsadvies."
          >
            <div className="grid gap-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.steps.map((step) => (
                <p key={step.rank}>
                  <strong className="text-[var(--ink)]">{step.label}:</strong>{" "}
                  {step.explanation}
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
