"use client";

import { useState } from "react";
import { AreaChart } from "@/components/charts";
import { ResultRow } from "@/components/ResultRow";
import { Pill } from "@/components/ui";
import {
  IMPACT_SCENARIOS,
  calculateHypotheekImpact,
  type HypotheekImpactInput,
} from "./logic";

type FormState = {
  grossIncomeUser: string;
  grossIncomePartner: string;
  duoMonthlyPayment: string;
  remainingStudentDebt: string;
  desiredHomePrice: string;
  ownMoney: string;
  extraRepaymentScenario: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  grossIncomeUser: "48000",
  grossIncomePartner: "",
  duoMonthlyPayment: "150",
  remainingStudentDebt: "22000",
  desiredHomePrice: "375000",
  ownMoney: "25000",
  extraRepaymentScenario: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function parseOptionalNumber(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  return Number(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};

  const grossIncomeUser = Number(values.grossIncomeUser);
  if (!Number.isFinite(grossIncomeUser) || grossIncomeUser <= 0) {
    errors.grossIncomeUser = "Voer een bruto jaarinkomen groter dan 0 in.";
  }

  const grossIncomePartnerValue = parseOptionalNumber(values.grossIncomePartner);
  if (
    grossIncomePartnerValue !== undefined &&
    (!Number.isFinite(grossIncomePartnerValue) || grossIncomePartnerValue < 0)
  ) {
    errors.grossIncomePartner = "Gebruik 0 of een hoger partnerinkomen.";
  }

  const duoMonthlyPayment = Number(values.duoMonthlyPayment);
  if (!Number.isFinite(duoMonthlyPayment) || duoMonthlyPayment < 0) {
    errors.duoMonthlyPayment = "Voer een geldig DUO-maandbedrag van 0 of hoger in.";
  }

  const remainingStudentDebt = parseOptionalNumber(values.remainingStudentDebt);
  if (
    remainingStudentDebt !== undefined &&
    (!Number.isFinite(remainingStudentDebt) || remainingStudentDebt < 0)
  ) {
    errors.remainingStudentDebt = "Gebruik 0 of een hogere resterende studieschuld.";
  }

  const desiredHomePrice = parseOptionalNumber(values.desiredHomePrice);
  if (
    desiredHomePrice !== undefined &&
    (!Number.isFinite(desiredHomePrice) || desiredHomePrice < 0)
  ) {
    errors.desiredHomePrice = "Gebruik 0 of een hogere woningprijs.";
  }

  const ownMoney = parseOptionalNumber(values.ownMoney);
  if (ownMoney !== undefined && (!Number.isFinite(ownMoney) || ownMoney < 0)) {
    errors.ownMoney = "Gebruik 0 of een hoger bedrag aan eigen geld.";
  }

  const extraRepaymentScenario = parseOptionalNumber(values.extraRepaymentScenario);
  if (
    extraRepaymentScenario !== undefined &&
    (!Number.isFinite(extraRepaymentScenario) || extraRepaymentScenario < 0)
  ) {
    errors.extraRepaymentScenario = "Gebruik 0 of een hoger bedrag voor extra aflossen.";
  }

  if (
    extraRepaymentScenario !== undefined &&
    extraRepaymentScenario > 0 &&
    remainingStudentDebt === undefined
  ) {
    errors.extraRepaymentScenario =
      "Vul ook je resterende studieschuld in om een aflosscenario te schatten.";
  }

  if (
    extraRepaymentScenario !== undefined &&
    remainingStudentDebt !== undefined &&
    extraRepaymentScenario > remainingStudentDebt
  ) {
    errors.extraRepaymentScenario =
      "Extra aflossen kan in deze tool niet hoger zijn dan je resterende studieschuld.";
  }

  const parsedValues: HypotheekImpactInput | null =
    Object.keys(errors).length === 0
      ? {
          grossIncomeUser,
          grossIncomePartner: grossIncomePartnerValue ?? 0,
          duoMonthlyPayment,
          remainingStudentDebt,
          desiredHomePrice,
          ownMoney,
          extraRepaymentScenario,
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
  const result = parsedValues ? calculateHypotheekImpact(parsedValues) : null;
  const hasErrors = Object.keys(errors).length > 0;

  const currentSeries = result
    ? result.impactScenarios.map((scenario) => scenario.impact)
    : [];
  const scenarioSeries = result?.extraRepaymentScenario
    ? result.extraRepaymentScenario.impactScenarios.map((scenario) => scenario.impact)
    : [];

  const chartSeries =
    result && currentSeries.length > 0
      ? [
          {
            color: "oklch(46% 0.07 232)",
            points: currentSeries,
          },
          ...(scenarioSeries.length > 0
            ? [
                {
                  color: "oklch(54% 0.10 152)",
                  points: scenarioSeries,
                },
              ]
            : []),
        ]
      : null;

  const minImpact = result?.impactScenarios[0]?.impact ?? 0;
  const maxImpact =
    result?.impactScenarios[result.impactScenarios.length - 1]?.impact ?? 0;
  const middleImpact =
    result?.impactScenarios.find((scenario) => scenario.key === "middle")?.impact ?? 0;
  const scenarioImpactScenarios = result?.extraRepaymentScenario?.impactScenarios ?? [];
  const scenarioMinImpact = scenarioImpactScenarios[0]?.impact ?? 0;
  const scenarioMaxImpact =
    scenarioImpactScenarios[scenarioImpactScenarios.length - 1]?.impact ?? 0;

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
            Vul je inkomen en DUO-maandlast in
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze tool helpt je om in gewone taal te zien hoeveel ruimte je
            studieschuld indicatief kan wegnemen uit je hypotheekmogelijkheden.
            Niet om je iets aan te praten, wel om meer grip te krijgen op je
            volgende vraag.
          </p>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bruto jaarinkomen gebruiker
            </span>
            <input
              inputMode="decimal"
              value={formValues.grossIncomeUser}
              onChange={(event) => updateField("grossIncomeUser", event.target.value)}
              aria-invalid={Boolean(errors.grossIncomeUser)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.grossIncomeUser} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bruto jaarinkomen partner (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.grossIncomePartner}
              onChange={(event) => updateField("grossIncomePartner", event.target.value)}
              aria-invalid={Boolean(errors.grossIncomePartner)}
              placeholder="Bijvoorbeeld 32000"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.grossIncomePartner} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Huidige DUO-maandlast
            </span>
            <input
              inputMode="decimal"
              value={formValues.duoMonthlyPayment}
              onChange={(event) => updateField("duoMonthlyPayment", event.target.value)}
              aria-invalid={Boolean(errors.duoMonthlyPayment)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.duoMonthlyPayment} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende studieschuld (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.remainingStudentDebt}
              onChange={(event) =>
                updateField("remainingStudentDebt", event.target.value)
              }
              aria-invalid={Boolean(errors.remainingStudentDebt)}
              placeholder="Voor context en aflosscenario"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingStudentDebt} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Gewenste woningprijs (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.desiredHomePrice}
              onChange={(event) => updateField("desiredHomePrice", event.target.value)}
              aria-invalid={Boolean(errors.desiredHomePrice)}
              placeholder="Bijvoorbeeld 375000"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.desiredHomePrice} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Eigen geld (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.ownMoney}
              onChange={(event) => updateField("ownMoney", event.target.value)}
              aria-invalid={Boolean(errors.ownMoney)}
              placeholder="Bijvoorbeeld 25000"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.ownMoney} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Scenario: extra aflossen op studieschuld (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.extraRepaymentScenario}
              onChange={(event) =>
                updateField("extraRepaymentScenario", event.target.value)
              }
              aria-invalid={Boolean(errors.extraRepaymentScenario)}
              placeholder="Bijvoorbeeld 5000"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.extraRepaymentScenario} />
          </label>
        </div>

        {hasErrors ? (
          <div className="mt-6 rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
            Controleer de invoervelden hierboven. Zodra alle waarden geldig zijn,
            zie je weer een bruikbare indicatie.
          </div>
        ) : null}

        <div className="mt-6 border-t border-[var(--hair)] pt-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Belangrijke nuance
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Dit is een indicatieve berekening. Hypotheekverstrekkers gebruiken
            eigen acceptatieregels. Gebruik dit als oriëntatie, niet als financieel
            advies.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Korte conclusie
            </div>
            {result ? <Pill tone="accent">Indicatief</Pill> : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[34px] leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
                Je DUO-maandlast kan je hypotheekruimte indicatief met ongeveer{" "}
                {formatCurrency(minImpact)} tot {formatCurrency(maxImpact)} drukken.
              </div>
              <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-white/75">
                In het middenscenario komt dat neer op ongeveer{" "}
                {formatCurrency(middleImpact)} minder ruimte. Zie dit als
                ordegrootte: genoeg om beter voorbereid het gesprek in te gaan.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige waarden in om de indicatieve impact van je DUO-maandlast te
              zien.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat deze inschatting laat zien
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            We vertalen je maandlast naar een simpele jaarimpact en vermenigvuldigen
            die met drie bandbreedtes. Dat maakt snel zichtbaar hoeveel druk je
            studieschuld ongeveer kan geven op je leencapaciteit.
          </p>

          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Totaal bruto jaarinkomen"
                value={formatCurrency(result.grossIncomeTotal)}
                sub="Gebruiker plus eventueel partnerinkomen"
              />
              <ResultRow
                label="DUO-maandlast"
                value={formatCurrency(result.duoMonthlyPayment)}
                sub={`Per jaar ${formatCurrency(result.duoYearlyPayment)}`}
              />
              <ResultRow
                label="Impact voorzichtig"
                value={formatCurrency(result.impactScenarios[0].impact)}
                sub="Jaarlast x factor 4,5"
              />
              <ResultRow
                label="Impact midden"
                value={formatCurrency(result.impactScenarios[1].impact)}
                sub="Jaarlast x factor 5,0"
              />
              <ResultRow
                label="Impact ruim"
                value={formatCurrency(result.impactScenarios[2].impact)}
                sub="Jaarlast x factor 5,5"
              />
              {result.debtToIncomeRatio !== undefined ? (
                <ResultRow
                  label="Studieschuld als % van jaarinkomen"
                  value={formatPercent(result.debtToIncomeRatio)}
                  sub="Resterende schuld gedeeld door bruto jaarinkomen"
                />
              ) : null}
              {result.housingTarget ? (
                <>
                  <ResultRow
                    label="Benodigde hypotheek voor woningdoel"
                    value={formatCurrency(result.housingTarget.neededMortgage)}
                    sub={`Woningprijs ${formatCurrency(result.housingTarget.desiredHomePrice)} minus eigen geld ${formatCurrency(result.housingTarget.ownMoney)}`}
                  />
                  <ResultRow
                    label="Zelfde doel inclusief DUO-druk"
                    value={formatCurrency(
                      result.housingTarget.neededMortgageWithImpactMiddle,
                    )}
                    sub="Benodigde hypotheek plus middenscenario van de impact"
                    accent
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {result && chartSeries ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Bandbreedte
                </div>
                <div className="mt-1 font-serif text-[20px] tracking-[-0.015em] text-[var(--ink)]">
                  Voorzichtig, midden en ruim naast elkaar
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(46%_0.07_232)]" />
                  Huidige maandlast
                </span>
                {scenarioSeries.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-[2px] w-3 bg-[oklch(54%_0.10_152)]" />
                    Aflosscenario
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <AreaChart width={620} height={220} series={chartSeries} />
              <div className="axis mt-1 flex items-center justify-between">
                {IMPACT_SCENARIOS.map((scenario) => (
                  <span key={scenario.key}>{scenario.label}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {result?.extraRepaymentScenario ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
                Scenario: extra aflossen
              </h2>
              <Pill tone="pos">Eenvoudige schatting</Pill>
            </div>
            <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
              Hier nemen we één simpele aanname: als je resterende studieschuld
              daalt, schatten we je DUO-maandlast ongeveer in dezelfde verhouding
              lager. Dat is niet hoe elke verstrekker of regeling exact werkt, maar
              wel een begrijpelijke manier om scenario&apos;s te vergelijken.
            </p>
            <div className="mt-5">
              <ResultRow
                label="Aflosscenario"
                value={formatCurrency(
                  result.extraRepaymentScenario.extraRepaymentAmount,
                )}
                sub="Eenmalig extra aflossen"
              />
              <ResultRow
                label="Geschatte resterende studieschuld"
                value={formatCurrency(
                  result.extraRepaymentScenario.estimatedRemainingStudentDebt,
                )}
                sub={`Met ongeveer ${formatPercent(result.extraRepaymentScenario.assumedMonthlyPaymentReductionRatio)} van je huidige maandlast`}
              />
              <ResultRow
                label="Geschatte nieuwe DUO-maandlast"
                value={formatCurrency(
                  result.extraRepaymentScenario.estimatedMonthlyPayment,
                )}
                sub={`Per jaar ${formatCurrency(result.extraRepaymentScenario.duoYearlyPayment)}`}
              />
              <ResultRow
                label="Nieuwe impactbandbreedte"
                value={`${formatCurrency(scenarioMinImpact)} tot ${formatCurrency(scenarioMaxImpact)}`}
                sub="Op basis van dezelfde drie factoren"
                accent
              />
              <ResultRow
                label="Middenscenario minder druk"
                value={formatCurrency(
                  result.extraRepaymentScenario.middleImpactReduction,
                )}
                sub="Verschil tussen huidige en geschatte nieuwe impact"
                accent
              />
            </div>
          </div>
        ) : null}

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Hoe rekenen we dit?
          </h2>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>
              1. We tellen het bruto jaarinkomen van jou en eventueel je partner bij
              elkaar op.
            </p>
            <p>
              2. We zetten je DUO-maandlast om naar een jaarbedrag: maandlast × 12.
            </p>
            <p>
              3. Dat jaarbedrag vermenigvuldigen we met drie eenvoudige factoren:
              4,5, 5,0 en 5,5.
            </p>
            <div className="rounded-xl bg-[var(--paper-soft)] px-4 py-3 font-mono text-[13px] tabular text-[var(--ink)]">
              Indicatieve impact = DUO-maandlast × 12 × factor
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat kun je hiermee?
          </h2>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>
              Check eerst je officiële DUO-maandbedrag, want juist dat bedrag is in
              de praktijk vaak bepalend.
            </p>
            <p>
              Vraag daarna een hypotheekadviseur of geldverstrekker om je echte
              leencapaciteit. Hun acceptatieregels kunnen afwijken.
            </p>
            <p>
              Los niet blind af alleen om meer te kunnen lenen. Buffer,
              flexibiliteit en je maandelijkse rust tellen ook mee.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
