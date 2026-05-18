"use client";

import { useState } from "react";
import { AreaChart } from "@/components/charts";
import { ResultRow } from "@/components/ResultRow";
import { Pill } from "@/components/ui";
import {
  calculateStudyDebtVsInvesting,
  type CalculatorInput,
} from "./logic";

type FormState = {
  monthlyAmount: string;
  annualDebtRate: string;
  annualInvestmentReturn: string;
  years: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  monthlyAmount: "150",
  annualDebtRate: "2.56",
  annualInvestmentReturn: "6",
  years: "10",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};

  const monthlyAmount = Number(values.monthlyAmount);
  if (!Number.isFinite(monthlyAmount) || monthlyAmount < 0) {
    errors.monthlyAmount = "Voer een geldig maandbedrag van 0 of hoger in.";
  }

  const annualDebtRate = Number(values.annualDebtRate);
  if (!Number.isFinite(annualDebtRate) || annualDebtRate < 0 || annualDebtRate > 100) {
    errors.annualDebtRate = "Gebruik een rentepercentage tussen 0 en 100.";
  }

  const annualInvestmentReturn = Number(values.annualInvestmentReturn);
  if (
    !Number.isFinite(annualInvestmentReturn) ||
    annualInvestmentReturn < 0 ||
    annualInvestmentReturn > 100
  ) {
    errors.annualInvestmentReturn =
      "Gebruik een verwacht rendement tussen 0 en 100.";
  }

  const years = Number(values.years);
  if (!Number.isFinite(years) || years <= 0 || years > 60) {
    errors.years = "Kies een looptijd groter dan 0 en maximaal 60 jaar.";
  }

  const parsedValues: CalculatorInput | null =
    Object.keys(errors).length === 0
      ? {
          monthlyAmount,
          annualDebtRate,
          annualInvestmentReturn,
          years,
        }
      : null;

  return {
    errors,
    parsedValues,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}

export default function Calculator() {
  const [formValues, setFormValues] = useState<FormState>(defaultValues);
  const { errors, parsedValues } = validateForm(formValues);
  const result = parsedValues ? calculateStudyDebtVsInvesting(parsedValues) : null;
  const hasErrors = Object.keys(errors).length > 0;
  const chartSeries = result
    ? [
        {
          color: "oklch(46% 0.07 232)",
          points: result.projections.map((item) => item.expectedInvestmentValue),
        },
        {
          color: "oklch(54% 0.10 152)",
          points: result.projections.map((item) => item.debtStrategyValue),
        },
      ]
    : null;

  function updateField(field: keyof FormState, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Scenario
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Vul je scenario in
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze vergelijking helpt je om met een paar heldere aannames meer inzicht
            te krijgen in twee routes: extra aflossen of vooruitkijken via beleggen.
            Gebruik de uitkomst als praktische indicatie, niet als persoonlijk
            advies.
          </p>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Maandbedrag
            </span>
            <input
              inputMode="decimal"
              value={formValues.monthlyAmount}
              onChange={(event) => updateField("monthlyAmount", event.target.value)}
              aria-invalid={Boolean(errors.monthlyAmount)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.monthlyAmount} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Rente studieschuld per jaar (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualDebtRate}
              onChange={(event) => updateField("annualDebtRate", event.target.value)}
              aria-invalid={Boolean(errors.annualDebtRate)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualDebtRate} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht beleggingsrendement per jaar (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualInvestmentReturn}
              onChange={(event) =>
                updateField("annualInvestmentReturn", event.target.value)
              }
              aria-invalid={Boolean(errors.annualInvestmentReturn)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualInvestmentReturn} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Looptijd in jaren
            </span>
            <input
              inputMode="decimal"
              value={formValues.years}
              onChange={(event) => updateField("years", event.target.value)}
              aria-invalid={Boolean(errors.years)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.years} />
          </label>
        </div>

        {hasErrors ? (
          <div className="mt-6 rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
            Controleer de invoervelden hierboven. Zodra alle waarden geldig zijn,
            krijg je weer een helder scenario met vergelijkbare uitkomsten.
          </div>
        ) : null}

        <div className="mt-6 border-t border-[var(--hair)] pt-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Uitgangspunt
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool vergelijkt twee simpele routes met hetzelfde maandbedrag. Dat
            maakt de keuze niet automatisch makkelijk, maar wel beter uitlegbaar.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Indicatieve uitkomst
            </div>
            {result ? (
              <Pill tone={result.difference >= 0 ? "pos" : "neg"}>
                {result.difference >= 0 ? "Beleggen hoger" : "Aflossen sterker"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.difference)}
              </div>
              <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.7] text-white/75">
                Verschil tussen beleggen en aflossen in dit scenario. Positief
                betekent meer verwachte waarde bij beleggen. Negatief betekent dat
                extra aflossen hier financieel steviger uitkomt.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige invoerwaarden in om de scenariovergelijking zichtbaar te
              maken.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat dit scenario laat zien
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            De rekensom blijft bewust simpel en transparant. Aflossen wordt benaderd
            via de schuld­rente, beleggen via hetzelfde maandbedrag met het opgegeven
            rendement, zodat je de afweging eerlijk naast elkaar kunt zetten.
          </p>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Totale extra aflossing"
                value={formatCurrency(result.totalExtraRepayment)}
                sub="Zelf gekozen inleg binnen de volledige looptijd"
              />
              <ResultRow
                label="Indicatieve rentebesparing"
                value={formatCurrency(result.indicativeInterestSavings)}
                sub="Benadering van het voordeel van sneller aflossen"
              />
              <ResultRow
                label="Verwachte waarde bij beleggen"
                value={formatCurrency(result.expectedInvestmentValue)}
                sub="Zelfde maandbedrag met het gekozen rendement"
              />
              <ResultRow
                label="Verschil beleggen minus aflossen"
                value={formatCurrency(result.difference)}
                sub="De kernuitkomst van deze vergelijking"
                accent={result.difference >= 0}
              />
            </div>
          ) : null}
        </div>

        {result && chartSeries ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Ontwikkeling in de tijd
                </div>
                <div className="mt-1 font-serif text-[20px] tracking-[-0.015em] text-[var(--ink)]">
                  Twee scenario&apos;s naast elkaar
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(46%_0.07_232)]" />
                  Beleggen
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(54%_0.10_152)]" />
                  Aflossen
                </span>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <AreaChart width={620} height={220} series={chartSeries} />
              <div className="axis mt-1 flex items-center justify-between">
                {result.projections.map((point) => (
                  <span key={point.year}>jaar {point.year}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-[1.5rem] border hair bg-white p-5 shadow-paper">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
            Belangrijk om te onthouden
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool gebruikt geen belastingeffecten, koersschommelingen of
            persoonlijke risicovoorkeur. Het doel is niet om een definitief oordeel
            te geven, maar om je sneller naar een betere vervolgvraag of keuze te
            brengen.
          </p>
        </div>
      </section>
    </div>
  );
}
