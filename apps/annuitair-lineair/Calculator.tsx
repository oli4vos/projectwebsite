"use client";

import { useMemo, useState } from "react";
import { AreaChart } from "@/components/charts";
import { ResultRow } from "@/components/ResultRow";
import { Pill } from "@/components/ui";
import { calculateMortgageComparison } from "./logic";

type FormState = {
  loanAmount: string;
  interestRatePercent: string;
  loanTermYears: string;
  annualReturnPercent: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  loanAmount: "385000",
  interestRatePercent: "3.89",
  loanTermYears: "30",
  annualReturnPercent: "5.5",
};

const defaults: FormState = {
  loanAmount: "",
  interestRatePercent: "",
  loanTermYears: "",
  annualReturnPercent: "",
};

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function validate(values: FormState) {
  const errors: ValidationErrors = {};

  const loanAmount = Number(values.loanAmount);
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
    errors.loanAmount = "Voer een geldig hypotheekbedrag groter dan 0 in.";
  }

  const interestRatePercent = Number(values.interestRatePercent);
  if (
    !Number.isFinite(interestRatePercent) ||
    interestRatePercent <= 0 ||
    interestRatePercent > 25
  ) {
    errors.interestRatePercent = "Gebruik een rente tussen 0 en 25 procent.";
  }

  const loanTermYears = Number(values.loanTermYears);
  if (!Number.isFinite(loanTermYears) || loanTermYears < 1 || loanTermYears > 40) {
    errors.loanTermYears = "Kies een looptijd tussen 1 en 40 jaar.";
  }

  const annualReturnPercent = Number(values.annualReturnPercent);
  if (
    !Number.isFinite(annualReturnPercent) ||
    annualReturnPercent < 0 ||
    annualReturnPercent > 20
  ) {
    errors.annualReturnPercent = "Gebruik een verwacht rendement tussen 0 en 20 procent.";
  }

  return {
    errors,
    parsed:
      Object.keys(errors).length === 0
        ? {
            loanAmount,
            interestRatePercent,
            loanTermYears,
            annualReturnPercent,
          }
        : null,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-700">{message}</p>;
}

export default function Calculator() {
  const [formValues, setFormValues] = useState<FormState>(defaults);
  const { errors, parsed } = validate(formValues);
  const result = useMemo(
    () => (parsed ? calculateMortgageComparison(parsed) : null),
    [parsed],
  );

  const chartSeries = result
    ? [
        {
          color: "oklch(46% 0.07 232)",
          points: result.yearlySummary.map((entry) => entry.annuityNettoSum),
        },
        {
          color: "oklch(54% 0.10 152)",
          points: result.yearlySummary.map((entry) => entry.linearNettoSum),
        },
      ]
    : null;

  function updateField(field: keyof FormState, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyExampleValues() {
    setFormValues(exampleValues);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Scenario
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Vergelijk twee hypotheekroutes
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Deze tool zet annuïtair en lineair naast elkaar. Je ziet niet alleen de
          eerste maandlast, maar ook wat het verschil in de tijd doet en hoeveel
          ruimte een beleggingspot kan opvangen.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          <span>Start leeg en vul snel een voorbeeldscenario in.</span>
          <button
            type="button"
            onClick={applyExampleValues}
            className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
          >
            Gebruik voorbeeldwaarden
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekbedrag
            </span>
            <input
              inputMode="decimal"
              value={formValues.loanAmount}
              onChange={(event) => updateField("loanAmount", event.target.value)}
              aria-invalid={Boolean(errors.loanAmount)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.loanAmount} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekrente per jaar (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.interestRatePercent}
              onChange={(event) =>
                updateField("interestRatePercent", event.target.value)
              }
              aria-invalid={Boolean(errors.interestRatePercent)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.interestRatePercent} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Looptijd in jaren
            </span>
            <input
              inputMode="decimal"
              value={formValues.loanTermYears}
              onChange={(event) => updateField("loanTermYears", event.target.value)}
              aria-invalid={Boolean(errors.loanTermYears)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.loanTermYears} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement beleggingspot (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualReturnPercent}
              onChange={(event) =>
                updateField("annualReturnPercent", event.target.value)
              }
              aria-invalid={Boolean(errors.annualReturnPercent)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualReturnPercent} />
          </label>
        </div>

        <div className="mt-6 border-t border-[var(--hair)] pt-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Uitgangspunt
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            De bestaande hypotheeklogica rekent met een vaste belastingfactor en een
            maandelijkse beleggingspot op basis van het netto verschil tussen beide
            routes. Dat maakt de keuze vergelijkbaar en transparant.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Eerste maand
            </div>
            {result ? (
              <Pill
                tone={
                  result.firstMonth.monthlyDifferenceNetto >= 0 ? "pos" : "neg"
                }
              >
                {result.firstMonth.monthlyDifferenceNetto >= 0
                  ? "Annuïtair netto lager"
                  : "Lineair netto lager"}
              </Pill>
            ) : null}
          </div>

          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.firstMonth.annuityNetto)}
              </div>
              <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.7] text-white/75">
                Netto annuïteit in maand 1. Lineair komt in deze opzet uit op{" "}
                {formatCurrency(result.firstMonth.linearNetto)} en het netto verschil
                is {formatCurrency(result.firstMonth.monthlyDifferenceNetto)} per maand.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige invoerwaarden in om de vergelijking te tonen.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Kernuitkomsten
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Hiermee zie je wat de hypotheekvorm doet met rente, maandlast en de
            eventuele buffer die je opbouwt als annuïtair netto goedkoper uitvalt.
          </p>

          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Annuïtair bruto maand 1"
                value={formatCurrency(result.firstMonth.annuityBruto)}
                sub={`Netto ${formatCurrency(result.firstMonth.annuityNetto)}`}
              />
              <ResultRow
                label="Lineair bruto maand 1"
                value={formatCurrency(result.firstMonth.linearBruto)}
                sub={`Netto ${formatCurrency(result.firstMonth.linearNetto)}`}
              />
              <ResultRow
                label="Rentvoordeel lineair"
                value={formatCurrency(result.totals.interestBenefitLinear)}
                sub="Lagere totale rente over de hele looptijd"
                accent
              />
              <ResultRow
                label="Eindwaarde beleggingspot"
                value={formatCurrency(result.totals.endPot)}
                sub={`Maximale stand ${formatCurrency(result.totals.maxPot)}`}
                accent={result.totals.endPot > 0}
              />
              <ResultRow
                label="Omslagmaand"
                value={
                  result.totals.omslagMaand
                    ? `maand ${result.totals.omslagMaand}`
                    : "geen omslag"
                }
                sub="Eerste maand waarop lineair netto goedkoper wordt"
              />
            </div>
          ) : null}
        </div>

        {result && chartSeries ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Jaarlast in de tijd
                </div>
                <div className="mt-1 font-serif text-[20px] tracking-[-0.015em] text-[var(--ink)]">
                  Netto per jaar: annuïtair vs lineair
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(46%_0.07_232)]" />
                  Annuïtair
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(54%_0.10_152)]" />
                  Lineair
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <AreaChart width={620} height={220} series={chartSeries} />
              <div className="axis mt-1 flex items-center justify-between">
                {result.yearlySummary.map((entry) => (
                  <span key={entry.year}>jaar {entry.year}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-[1.5rem] border hair bg-white p-5 shadow-paper">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
            Let op
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool is een vereenvoudigde vergelijking. Werkelijke belastingeffecten,
            rentevaste periodes en productvoorwaarden kunnen de uitkomst verschuiven.
            Gebruik dit vooral om je scenario scherper te krijgen.
          </p>
        </div>
      </section>
    </div>
  );
}
