"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { calculatePrivateLeaseImpact } from "./logic";

type FormState = {
  maxMortgageWithoutLease: string;
  monthlyLeaseCost: string;
  debtToMortgageFactor: string;
};

const defaultValues: FormState = {
  maxMortgageWithoutLease: "",
  monthlyLeaseCost: "",
  debtToMortgageFactor: "4,5",
};

function parseOptionalDecimal(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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
    return calculatePrivateLeaseImpact({
      maxMortgageWithoutLease: parseOptionalDecimal(
        submitted.maxMortgageWithoutLease,
      ),
      monthlyLeaseCost: parseOptionalDecimal(submitted.monthlyLeaseCost),
      debtToMortgageFactor: parseOptionalDecimal(submitted.debtToMortgageFactor),
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
            Impact private lease op hypotheek
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Verken indicatief wat een vaste private lease-last kan doen met je
            hypotheekruimte.
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
              Hypotheekruimte zonder lease
            </span>
            <input
              inputMode="decimal"
              value={values.maxMortgageWithoutLease}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  maxMortgageWithoutLease: event.target.value,
                }))
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Maandelijkse private lease
            </span>
            <input
              inputMode="decimal"
              value={values.monthlyLeaseCost}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  monthlyLeaseCost: event.target.value,
                }))
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Indicatieve omrekenfactor
            </span>
            <input
              inputMode="decimal"
              value={values.debtToMortgageFactor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  debtToMortgageFactor: event.target.value,
                }))
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
          </label>
          <ToolActionButton type="submit" variant="accent" size="md">
            Bereken
          </ToolActionButton>
        </form>
      }
      result={
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          {!result ? (
            <p className="text-[14px] leading-[1.7] text-white/75">
              Vul je gegevens in en klik op Bereken.
            </p>
          ) : (
            <div className="space-y-2 text-[14px] text-white/90">
              <p>
                Indicatieve verlaging:{" "}
                {formatCurrency(result.indicativeMortgageReduction)}
              </p>
              <p>
                Overblijvende hypotheekruimte:{" "}
                {formatCurrency(result.indicativeMortgageAfterLease)}
              </p>
            </div>
          )}
        </div>
      }
      details={
        <DisclosureSection
          title="Hoe rekenen we dit?"
          subtitle="Indicatieve conceptberekening"
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>
                Jaarlast lease = {formatCurrency(result.yearlyLeaseCost)}.
              </p>
              <p>
                Indicatieve vermindering = jaarlast × factor (
                {result.debtToMortgageFactor.toFixed(2)}).
              </p>
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : null}
        </DisclosureSection>
      }
    />
  );
}

