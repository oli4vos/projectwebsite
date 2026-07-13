"use client";

import { useMemo, useState } from "react";
import { AreaChart, getAdaptiveEuroTicks } from "@/components/charts";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import { DuoDebtPartsEditor } from "@/components/duo/DuoDebtPartsEditor";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { getRepaymentRuleLabel } from "@/lib/copy-glossary";
import { getAvailableDuoRateYears } from "@/lib/financial-constants";
import {
  createDuoDebtPartFormValue,
  type DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import {
  calculateDuoExtraRepaymentView,
  createDuoExtraRepaymentDefaultValues,
  createEmptyDuoExtraRepaymentValues,
  repaymentRuleOptions,
  type DuoExtraRepaymentFormValues,
} from "./logic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type MoneyFieldProps = {
  id: keyof DuoExtraRepaymentFormValues;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  onChange: (value: string) => void;
};

function MoneyField({ id, label, value, error, hint, onChange }: MoneyFieldProps) {
  return (
    <label className="grid gap-2" htmlFor={String(id)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-right text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </span>
      <span className="hair flex min-h-12 items-center rounded-md border bg-white px-3">
        <span className="mr-2 text-[var(--muted)]">€</span>
        <input
          id={String(id)}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? "true" : "false"}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
      </span>
      <FieldError message={error} />
    </label>
  );
}

export default function DuoExtraAflossenCalculator() {
  const [formValues, setFormValues] = useState<DuoExtraRepaymentFormValues>(
    createDuoExtraRepaymentDefaultValues,
  );
  const view = useMemo(() => calculateDuoExtraRepaymentView(formValues), [formValues]);

  function updateField<K extends keyof DuoExtraRepaymentFormValues>(
    field: K,
    value: DuoExtraRepaymentFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function updateDebtPart(
    id: string,
    field: keyof Pick<DuoDebtPartFormValue, "amount" | "rateYear">,
    value: string,
  ) {
    setFormValues((current) => ({
      ...current,
      debtParts: current.debtParts.map((part) =>
        part.id === id ? { ...part, [field]: value } : part,
      ),
    }));
  }

  function addDebtPart() {
    setFormValues((current) => ({
      ...current,
      debtParts: [...current.debtParts, createDuoDebtPartFormValue()],
    }));
  }

  function removeDebtPart(id: string) {
    setFormValues((current) => ({
      ...current,
      debtParts:
        current.debtParts.length > 1
          ? current.debtParts.filter((part) => part.id !== id)
          : current.debtParts,
    }));
  }

  function toggleDebtParts(enabled: boolean) {
    setFormValues((current) => {
      if (!enabled) {
        return { ...current, useDebtParts: false };
      }

      const nextParts =
        current.debtParts.length > 0
          ? current.debtParts
          : [createDuoDebtPartFormValue()];
      const firstPart = nextParts[0];

      return {
        ...current,
        useDebtParts: true,
        debtParts: nextParts.map((part, index) =>
          index === 0 && part.amount.trim().length === 0 && current.remainingDebt.trim().length > 0
            ? { ...part, amount: current.remainingDebt }
            : part,
        ),
        duoRateYear:
          current.duoRateYear.trim().length > 0
            ? current.duoRateYear
            : firstPart.rateYear,
      };
    });
  }

  const inputs = (
    <div className="space-y-5">
      <MoneyField
        id="remainingDebt"
        label="Openstaande studieschuld"
        value={formValues.remainingDebt}
        error={view.errors.remainingDebt}
        hint={
          formValues.useDebtParts
            ? "Wordt overschreven door leningdelen"
            : "Bedrag bij DUO"
        }
        onChange={(value) => updateField("remainingDebt", value)}
      />

      <label className="grid gap-2" htmlFor="repaymentRule">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Terugbetalingsregel
        </span>
        <select
          id="repaymentRule"
          value={formValues.repaymentRule}
          onChange={(event) =>
            updateField("repaymentRule", event.target.value as DuoExtraRepaymentFormValues["repaymentRule"])
          }
          className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
        >
          {repaymentRuleOptions.map((option) => (
            <option key={option} value={option}>
              {getRepaymentRuleLabel(option)}
            </option>
          ))}
        </select>
        <FieldError message={view.errors.repaymentRule} />
      </label>

      {!formValues.useDebtParts ? (
        <label className="grid gap-2" htmlFor="duoRateYear">
          <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
            DUO-rentejaar
          </span>
          <select
            id="duoRateYear"
            value={formValues.duoRateYear}
            onChange={(event) => updateField("duoRateYear", event.target.value)}
            className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
          >
            {getAvailableDuoRateYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
            DUO zet voor terugbetalers ieder jaar een rente vast die daarna 5 jaar blijft gelden.
          </p>
          <FieldError message={view.errors.duoRateYear} />
        </label>
      ) : null}

      <DuoDebtPartsEditor
        enabled={formValues.useDebtParts}
        parts={formValues.debtParts}
        totalDebt={view.debtPartsTotal}
        errorsById={view.debtPartErrors}
        onToggle={toggleDebtParts}
        onPartChange={updateDebtPart}
        onAddPart={addDebtPart}
        onRemovePart={removeDebtPart}
      />
      <FieldError message={view.errors.debtParts} />

      <MoneyField
        id="currentMonthlyPayment"
        label="Huidige maandtermijn optioneel"
        value={formValues.currentMonthlyPayment}
        error={view.errors.currentMonthlyPayment}
        hint="Leeg = wettelijk berekend"
        onChange={(value) => updateField("currentMonthlyPayment", value)}
      />
      <MoneyField
        id="oneTimeExtraRepayment"
        label="Eenmalig extra aflossen"
        value={formValues.oneTimeExtraRepayment}
        error={view.errors.oneTimeExtraRepayment}
        onChange={(value) => updateField("oneTimeExtraRepayment", value)}
      />
      <MoneyField
        id="monthlyExtraRepayment"
        label="Extra per maand"
        value={formValues.monthlyExtraRepayment}
        error={view.errors.monthlyExtraRepayment}
        onChange={(value) => updateField("monthlyExtraRepayment", value)}
      />

      <label className="grid gap-2" htmlFor="strategy">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Strategie
        </span>
        <select
          id="strategy"
          value={formValues.strategy}
          onChange={(event) =>
            updateField("strategy", event.target.value as DuoExtraRepaymentFormValues["strategy"])
          }
          className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
        >
          <option value="shortenTerm">Maandbedrag gelijk, kortere looptijd</option>
          <option value="lowerMonthlyPayment">Lagere maandlast</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-2">
        <ToolActionButton
          type="button"
          onClick={() => setFormValues(createDuoExtraRepaymentDefaultValues())}
        >
          Voorbeeldwaarden
        </ToolActionButton>
        <ToolActionButton
          type="button"
          onClick={() => setFormValues(createEmptyDuoExtraRepaymentValues())}
        >
          Wis invoer
        </ToolActionButton>
      </div>
    </div>
  );

  const result = view.isValid ? (
    <div id="tool-result-summary" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard
          label="Nieuwe verplichte maandtermijn"
          value={formatCurrency(view.result.newRequiredMonthlyPayment)}
          note={
            view.result.payoffImpact.strategy === "lowerMonthlyPayment"
              ? "Bij strategie lagere maandlast."
              : "Bij kortere looptijd blijft de termijn gelijk."
          }
        />
        <ResultCard
          label="Indicatieve rentebesparing"
          value={formatCurrency(view.result.interestSaved)}
          note="Verschil in rente over de resterende looptijd in deze projectie."
          tone="pos"
        />
      </div>

      <section className="rounded-xl border hair bg-white p-5 shadow-paper">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
          Effect van extra aflossen
        </h2>
        <div className="mt-3">
          <ResultRow label="DUO-rentejaar" value={String(view.duoRateYear)} />
          <ResultRow
            label="Gewogen DUO-rente"
            value={`${formatPercent(view.annualInterestRate)}%`}
          />
          <ResultRow
            label="Wettelijke maandtermijn nu"
            value={formatCurrency(view.statutoryMonthlyPayment)}
            sub={`${view.termYears} jaar resterende looptijd in deze indicatie.`}
          />
          {view.debtPortfolio.usesDebtParts ? (
            <ResultRow
              label="Leningdelen"
              value={`${view.debtPortfolio.parts.length} delen`}
              sub="Extra aflossen gaat eerst naar het deel met de hoogste rente."
            />
          ) : null}
          <ResultRow
            label="Eenmalig extra bedrag gebruikt"
            value={formatCurrency(view.result.extraRepaymentUsed)}
          />
          <ResultRow
            label="Extra maandbedrag"
            value={formatCurrency(view.result.extraMonthlyAmountUsed)}
          />
          <ResultRow
            label="Nieuwe resterende schuld na eenmalige aflossing"
            value={formatCurrency(view.result.newRemainingDebt)}
          />
          <ResultRow
            label="Oude einddatum"
            value={view.result.timelineBefore.payoffDate ?? "Onzeker"}
          />
          <ResultRow
            label="Nieuwe einddatum"
            value={view.result.timelineAfter.payoffDate ?? "Onzeker"}
            sub={
              view.result.payoffImpact.monthsSaved > 0
                ? `${view.result.payoffImpact.monthsSaved} maanden eerder in deze indicatie.`
                : "Geen eerdere einddatum in deze indicatie."
            }
            strong
          />
        </div>
      </section>

      {view.chart.labels.length > 1 ? (
        <section className="rounded-xl border hair bg-white p-5 shadow-paper">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            Afloscurve vóór en na
          </h2>
          <ChartContainer
            xValues={view.chart.labels.map(Number)}
            chart={
              <div className="space-y-3">
                <AreaChart
                  series={[
                    { color: "oklch(50% 0.08 250)", points: view.chart.before },
                    { color: "oklch(52% 0.10 150)", points: view.chart.after },
                  ]}
                  seriesLabels={["Voor extra aflossen", "Na extra aflossen"]}
                  xValues={view.chart.labels.map(Number)}
                  yTicks={getAdaptiveEuroTicks(
                    Math.max(...view.chart.before, ...view.chart.after),
                  )}
                />
                <ChartLegend
                  items={[
                    { label: "Voor extra aflossen", color: "oklch(50% 0.08 250)" },
                    { label: "Na extra aflossen", color: "oklch(52% 0.10 150)" },
                  ]}
                />
              </div>
            }
          />
        </section>
      ) : null}
    </div>
  ) : (
    <section id="tool-result-summary" className="rounded-xl border hair bg-white p-5 shadow-paper">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
        Vul je studieschuld in
      </h2>
      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--muted)]">
        Vul minimaal een openstaande schuld in. Een huidig maandbedrag is
        optioneel; anders berekent de tool de wettelijke termijn.
      </p>
    </section>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Wat doet extra aflossen?
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bekijk feitelijk wat een eenmalige of maandelijkse extra DUO-aflossing
            doet met je maandtermijn, einddatum en rentelast.
          </p>
        </>
      }
      inputs={inputs}
      result={result}
      details={
        view.isValid ? (
          <div className="space-y-4">
            <DisclosureSection title="Aannames" defaultOpen>
              <ul className="list-disc space-y-2 pl-5 text-[13px] leading-[1.7] text-[var(--muted)]">
                <li>Gebruikte normversie: {view.normVersion}.</li>
                <li>
                  DUO-rentejaar {view.duoRateYear} met gewogen rente van {formatPercent(view.annualInterestRate)}%;
                  resterende looptijd: {view.termYears} jaar.
                </li>
                <li>Vervroegd aflossen bij DUO is boetevrij.</li>
                {view.result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </DisclosureSection>
            {view.debtPortfolio.usesDebtParts ? (
              <DisclosureSection title="Gebruikte leningdelen">
                <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                  {view.debtPortfolio.parts.map((part) => (
                    <ResultRow
                      key={part.key}
                      label={part.label}
                      value={formatCurrency(part.remainingDebt)}
                      sub={`${part.rateYear} • ${formatPercent(part.annualInterestRate)}% • ${formatCurrency(part.statutoryMonthlyPayment)} p/m`}
                    />
                  ))}
                </div>
              </DisclosureSection>
            ) : null}
          </div>
        ) : null
      }
      disclaimer={
        <p className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4 text-[12.5px] leading-[1.7] text-[var(--muted)]">
          Puur informatieve DUO-indicatie. Geen advies en geen persoonlijke
          keuzehulp. Controleer wijzigingen altijd in Mijn DUO.
        </p>
      }
    />
  );
}
