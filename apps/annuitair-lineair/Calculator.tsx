"use client";

import { useMemo, useState } from "react";
import { AreaChart } from "@/components/charts";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { InputField } from "@/components/inputs";
import { ResultReceipt } from "@/components/ResultReceipt";
import { Pill } from "@/components/ui";
import { calculateMortgageComparison } from "./logic";

type FormState = {
  loanAmount: string;
  interestRatePercent: string;
  loanTermYears: string;
  annualReturnPercent: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaults: FormState = {
  loanAmount: "385000",
  interestRatePercent: "3.89",
  loanTermYears: "30",
  annualReturnPercent: "5.5",
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="sheet p-6">
        <div className="kicker">Scenario</div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Vergelijk twee hypotheekroutes
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Deze tool zet annuïtair en lineair naast elkaar. Je ziet niet alleen de
          eerste maandlast, maar ook wat het verschil in de tijd doet en hoeveel
          ruimte een beleggingspot kan opvangen.
        </p>

        <div className="mt-6 grid gap-5">
          <InputField
            label="Hypotheekbedrag"
            value={formValues.loanAmount}
            onChange={(event) => updateField("loanAmount", event.target.value)}
            error={errors.loanAmount}
          />
          <InputField
            label="Hypotheekrente per jaar (%)"
            value={formValues.interestRatePercent}
            onChange={(event) =>
              updateField("interestRatePercent", event.target.value)
            }
            error={errors.interestRatePercent}
          />
          <InputField
            label="Looptijd in jaren"
            value={formValues.loanTermYears}
            onChange={(event) => updateField("loanTermYears", event.target.value)}
            error={errors.loanTermYears}
          />
          <InputField
            label="Verwacht rendement beleggingspot (%)"
            value={formValues.annualReturnPercent}
            onChange={(event) =>
              updateField("annualReturnPercent", event.target.value)
            }
            error={errors.annualReturnPercent}
          />
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
        <div className="ink-panel p-6">
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

        {result ? (
          <ResultReceipt
            eyebrow="Resultaatblad"
            title="Kernuitkomsten"
            summary="Hiermee zie je wat de hypotheekvorm doet met rente, maandlast en de eventuele buffer die je opbouwt als annuïtair netto goedkoper uitvalt."
            rows={[
              {
                label: "Annuïtair bruto maand 1",
                value: formatCurrency(result.firstMonth.annuityBruto),
                note: `Netto ${formatCurrency(result.firstMonth.annuityNetto)}`,
              },
              {
                label: "Lineair bruto maand 1",
                value: formatCurrency(result.firstMonth.linearBruto),
                note: `Netto ${formatCurrency(result.firstMonth.linearNetto)}`,
              },
              {
                label: "Rentvoordeel lineair",
                value: formatCurrency(result.totals.interestBenefitLinear),
                note: "Lagere totale rente over de hele looptijd",
                accent: true,
              },
              {
                label: "Eindwaarde beleggingspot",
                value: formatCurrency(result.totals.endPot),
                note: `Maximale stand ${formatCurrency(result.totals.maxPot)}`,
                accent: result.totals.endPot > 0,
              },
              {
                label: "Omslagmaand",
                value: result.totals.omslagMaand
                  ? `maand ${result.totals.omslagMaand}`
                  : "geen omslag",
                note: "Eerste maand waarop lineair netto goedkoper wordt",
              },
            ]}
          />
        ) : null}

        {result && chartSeries ? (
          <div className="sheet p-6">
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

        <ExplanationPanel
          eyebrow="Verdieping"
          title="Waar moet je hier scherp op blijven?"
          intro="Deze vergelijking is vooral bedoeld om verschillen zichtbaar te maken, niet om je definitieve hypotheekkeuze voor je te maken."
          items={[
            {
              title: "Hoe is dit berekend?",
              text: "De tool rekent annuïtair en lineair naast elkaar met dezelfde hoofdsom, rente en looptijd, plus een eenvoudige beleggingspot op basis van netto verschil.",
            },
            {
              title: "Welke aannames gebruiken we?",
              text: "We werken met een vaste belastingfactor en een vast rendement voor de pot. Daarmee blijft de vergelijking begrijpelijk, maar niet volledig persoonlijk.",
            },
            {
              title: "Wat zijn risico's?",
              text: "Werkelijke productvoorwaarden, rentevaste periodes en je fiscale situatie kunnen de uitkomst verschuiven. Een beleggingspot kan ook lager uitpakken.",
            },
            {
              title: "Wanneer kan een andere keuze beter zijn?",
              text: "Als je maximale maandrust zoekt, kan annuïtair prettiger voelen. Als je sneller wilt aflossen en lagere totale rente belangrijk vindt, kan lineair juist beter passen.",
            },
          ]}
        />
      </section>
    </div>
  );
}
