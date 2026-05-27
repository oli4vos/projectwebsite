"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { GlossaryText } from "@/components/GlossaryText";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { calculateBuyVsRent } from "./logic";

type FormState = {
  monthlyRent: string;
  purchasePrice: string;
  ownFunds: string;
  mortgageRate: string;
  mortgageTermYears: string;
  monthlyOwnerCosts: string;
  stressRateIncrease: string;
};

const defaultValues: FormState = {
  monthlyRent: "",
  purchasePrice: "",
  ownFunds: "",
  mortgageRate: "4",
  mortgageTermYears: "30",
  monthlyOwnerCosts: "",
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

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
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
    </label>
  );
}

export default function Calculator() {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const result = useMemo(() => {
    if (!submitted) return null;
    return calculateBuyVsRent({
      monthlyRent: parseOptionalDecimalInput(submitted.monthlyRent),
      purchasePrice: parseOptionalDecimalInput(submitted.purchasePrice),
      ownFunds: parseOptionalDecimalInput(submitted.ownFunds),
      mortgageRate: parseOptionalDecimalInput(submitted.mortgageRate),
      mortgageTermYears: parseOptionalDecimalInput(submitted.mortgageTermYears),
      monthlyOwnerCosts: parseOptionalDecimalInput(submitted.monthlyOwnerCosts),
      stressRateIncrease: parseOptionalDecimalInput(submitted.stressRateIncrease),
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
            Kopen of huren?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <GlossaryText text="Vergelijk huur met kopen op maandlasten, eigen geld en een eenvoudige rente-stresstest." />
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
            label="Huidige huur per maand"
            value={values.monthlyRent}
            onChange={(value) => setValues((current) => ({ ...current, monthlyRent: value }))}
          />
          <Field
            label="Gewenste woningprijs"
            value={values.purchasePrice}
            onChange={(value) => setValues((current) => ({ ...current, purchasePrice: value }))}
          />
          <Field
            label="Eigen geld"
            value={values.ownFunds}
            onChange={(value) => setValues((current) => ({ ...current, ownFunds: value }))}
          />
          <Field
            label="Hypotheekrente"
            suffix="%"
            value={values.mortgageRate}
            onChange={(value) => setValues((current) => ({ ...current, mortgageRate: value }))}
          />
          <Field
            label="Looptijd hypotheek"
            suffix="jaar"
            value={values.mortgageTermYears}
            onChange={(value) =>
              setValues((current) => ({ ...current, mortgageTermYears: value }))
            }
          />
          <Field
            label="Extra eigenaarslasten per maand"
            value={values.monthlyOwnerCosts}
            onChange={(value) =>
              setValues((current) => ({ ...current, monthlyOwnerCosts: value }))
            }
          />
          <Field
            label="Rente-stresstest"
            suffix="% hoger"
            value={values.stressRateIncrease}
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
