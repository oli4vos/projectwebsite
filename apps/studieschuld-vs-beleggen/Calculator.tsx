"use client";

import { useState } from "react";
import { AreaChart } from "@/components/charts";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { InputField } from "@/components/inputs";
import { ResultReceipt } from "@/components/ResultReceipt";
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
      <section className="sheet p-6">
        <div>
          <div className="kicker">Scenario</div>
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
          <InputField
            label="Maandbedrag"
            value={formValues.monthlyAmount}
            onChange={(event) => updateField("monthlyAmount", event.target.value)}
            error={errors.monthlyAmount}
          />
          <InputField
            label="Rente studieschuld per jaar (%)"
            value={formValues.annualDebtRate}
            onChange={(event) => updateField("annualDebtRate", event.target.value)}
            error={errors.annualDebtRate}
          />
          <InputField
            label="Verwacht beleggingsrendement per jaar (%)"
            value={formValues.annualInvestmentReturn}
            onChange={(event) =>
              updateField("annualInvestmentReturn", event.target.value)
            }
            error={errors.annualInvestmentReturn}
          />
          <InputField
            label="Looptijd in jaren"
            value={formValues.years}
            onChange={(event) => updateField("years", event.target.value)}
            error={errors.years}
          />
        </div>

        {hasErrors ? (
          <div className="mt-6 rounded-[var(--radius-soft)] border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
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
        <div className="ink-panel p-6">
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

        {result ? (
          <ResultReceipt
            eyebrow="Resultaatblad"
            title="Wat dit scenario laat zien"
            summary="De rekensom blijft bewust simpel en transparant. Aflossen wordt benaderd via de schuld­rente, beleggen via hetzelfde maandbedrag met het opgegeven rendement."
            rows={[
              {
                label: "Totale extra aflossing",
                value: formatCurrency(result.totalExtraRepayment),
                note: "Zelf gekozen inleg binnen de volledige looptijd",
              },
              {
                label: "Indicatieve rentebesparing",
                value: formatCurrency(result.indicativeInterestSavings),
                note: "Benadering van het voordeel van sneller aflossen",
              },
              {
                label: "Verwachte waarde bij beleggen",
                value: formatCurrency(result.expectedInvestmentValue),
                note: "Zelfde maandbedrag met het gekozen rendement",
              },
              {
                label: "Verschil beleggen minus aflossen",
                value: formatCurrency(result.difference),
                note: "De kernuitkomst van deze vergelijking",
                accent: result.difference >= 0,
              },
            ]}
          />
        ) : null}

        {result && chartSeries ? (
          <div className="sheet p-6">
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

        <ExplanationPanel
          eyebrow="Verdieping"
          title="Hoe lees je deze uitkomst?"
          intro="Deze tool is vooral nuttig als eerste vergelijking. Daarna begint het echte afwegen pas."
          items={[
            {
              title: "Hoe is dit berekend?",
              text: "We rekenen twee routes door met exact hetzelfde maandbedrag: extra aflossen tegen DUO-rente of beleggen tegen het ingevulde rendement.",
            },
            {
              title: "Welke aannames gebruiken we?",
              text: "We nemen geen belastingeffecten, kosten, koersschommelingen of gedragsverschillen mee. Het model laat vooral de grove richting zien.",
            },
            {
              title: "Wat zijn risico's?",
              text: "Beleggen kan lager uitpakken dan verwacht. Extra aflossen geeft meer zekerheid, maar maakt je geld minder flexibel zodra het weg is.",
            },
            {
              title: "Wanneer kan een andere keuze beter zijn?",
              text: "Als je buffer nog dun is, je risico laag wilt houden of je op korte termijn een huis wilt kopen, kan flexibiliteit belangrijker zijn dan de hoogste verwachte uitkomst.",
            },
          ]}
        />
      </section>
    </div>
  );
}
