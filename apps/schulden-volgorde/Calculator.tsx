"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { GlossaryText } from "@/components/GlossaryText";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateDebtPriority, type DebtKind } from "./logic";

type DebtFormRow = {
  kind: DebtKind;
  amount: string;
  interestRate: string;
};

type FormState = {
  extraAmount: string;
  debts: DebtFormRow[];
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

export default function Calculator() {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const result = useMemo(() => {
    if (!submitted) return null;
    return calculateDebtPriority({
      extraAmount: parseOptionalDecimalInput(submitted.extraAmount),
      debts: submitted.debts.map((debt) => ({
        kind: debt.kind,
        amount: parseOptionalDecimalInput(debt.amount),
        interestRate: parseOptionalDecimalInput(debt.interestRate),
      })),
    });
  }, [submitted]);

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
            Concepttool (hidden)
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Welke schuld eerst?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <GlossaryText text="Zet achteraf betalen, creditcard, DUO en hypotheek in een logische volgorde voor extra aflossen." />
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
          </label>

          <div className="grid gap-3">
            {values.debts.map((debt, index) => (
              <div key={debt.kind} className="rounded-xl border hair bg-[var(--paper)] p-3">
                <div className="text-[12px] font-medium text-[var(--ink)]">
                  {kindLabels[debt.kind]}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    inputMode="decimal"
                    placeholder="Bedrag"
                    value={debt.amount}
                    onChange={(event) => updateDebt(index, { amount: event.target.value })}
                    className="ring-focus hair h-11 rounded-md border bg-white px-3 font-mono text-[15px] outline-none"
                  />
                  <input
                    inputMode="decimal"
                    placeholder="Rente %"
                    value={debt.interestRate}
                    onChange={(event) =>
                      updateDebt(index, { interestRate: event.target.value })
                    }
                    className="ring-focus hair h-11 rounded-md border bg-white px-3 font-mono text-[15px] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <ToolActionButton type="submit" variant="submit" size="md" full>
            Bereken volgorde
          </ToolActionButton>
        </form>
      }
      result={
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
