"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { getRepaymentRuleLabel } from "@/lib/copy-glossary";
import {
  calculateDuoMonthlyPaymentView,
  createDuoMonthlyPaymentDefaultValues,
  createEmptyDuoMonthlyPaymentValues,
  repaymentRuleOptions,
  type DuoHouseholdSituation,
  type DuoMonthlyPaymentFormValues,
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

type FieldProps = {
  id: keyof DuoMonthlyPaymentFormValues;
  label: string;
  value: string;
  error?: string;
  prefix?: string;
  hint?: string;
  onChange: (value: string) => void;
};

function MoneyField({ id, label, value, error, prefix, hint, onChange }: FieldProps) {
  return (
    <label className="grid gap-2" htmlFor={String(id)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-right text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </span>
      <span className="hair flex min-h-12 items-center rounded-md border bg-white px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
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

export default function DuoMaandbedragCalculator() {
  const [formValues, setFormValues] = useState<DuoMonthlyPaymentFormValues>(
    createDuoMonthlyPaymentDefaultValues,
  );
  const view = useMemo(() => calculateDuoMonthlyPaymentView(formValues), [formValues]);

  function updateField<K extends keyof DuoMonthlyPaymentFormValues>(
    field: K,
    value: DuoMonthlyPaymentFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  const inputs = (
    <div className="space-y-5">
      <MoneyField
        id="remainingDebt"
        label="Openstaande studieschuld"
        value={formValues.remainingDebt}
        error={view.errors.remainingDebt}
        prefix="€"
        hint="Bedrag bij DUO"
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
            updateField("repaymentRule", event.target.value as DuoMonthlyPaymentFormValues["repaymentRule"])
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

      <MoneyField
        id="assessmentIncome"
        label="Toetsingsinkomen optioneel"
        value={formValues.assessmentIncome}
        error={view.errors.assessmentIncome}
        prefix="€"
        hint="Alleen voor draagkrachtindicatie"
        onChange={(value) => updateField("assessmentIncome", value)}
      />

      <label className="grid gap-2" htmlFor="householdSituation">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Huishoudsituatie
        </span>
        <select
          id="householdSituation"
          value={formValues.householdSituation}
          onChange={(event) =>
            updateField("householdSituation", event.target.value as DuoHouseholdSituation)
          }
          className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
        >
          <option value="single">Alleenstaand</option>
          <option value="partner">Met partner of alleenstaande ouder</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-2">
        <ToolActionButton
          type="button"
          onClick={() => setFormValues(createDuoMonthlyPaymentDefaultValues())}
        >
          Voorbeeldwaarden
        </ToolActionButton>
        <ToolActionButton
          type="button"
          onClick={() => setFormValues(createEmptyDuoMonthlyPaymentValues())}
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
          label="Wettelijke maandtermijn"
          value={formatCurrency(view.statutoryMonthlyPayment)}
          note={`${view.termYears} jaar, ${formatPercent(view.annualInterestRate)}% DUO-rente.`}
        />
        <ResultCard
          label={view.incomeBased ? "DUO hanteert indicatief" : "Draagkracht"}
          value={
            view.incomeBased
              ? formatCurrency(view.duoMonthlyPaymentUsed ?? view.statutoryMonthlyPayment)
              : "Niet ingevuld"
          }
          note={
            view.incomeBased
              ? "DUO vergelijkt draagkracht met de wettelijke termijn en gebruikt het laagste bedrag."
              : "Vul toetsingsinkomen in om een draagkrachtindicatie te zien."
          }
          tone={view.incomeBased ? "warn" : "default"}
        />
      </div>

      <section className="rounded-xl border hair bg-white p-5 shadow-paper">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
          Berekening
        </h2>
        <div className="mt-3">
          <ResultRow label="Openstaande schuld" value={formatCurrency(view.remainingDebt)} />
          <ResultRow label="Regeling" value={getRepaymentRuleLabel(view.repaymentRule)} />
          <ResultRow label="DUO-rente" value={`${formatPercent(view.annualInterestRate)}%`} />
          <ResultRow label="Looptijd" value={`${view.termYears} jaar`} />
          <ResultRow
            label="Wettelijke termijn"
            value={formatCurrency(view.statutoryMonthlyPayment)}
            strong
          />
          {view.incomeBased ? (
            <>
              <ResultRow
                label="Draagkracht-maandtermijn"
                value={formatCurrency(view.incomeBased.incomeBasedMonthlyPayment)}
                sub={`Boven vrijstelling: ${formatCurrency(view.incomeBased.amountAboveAllowance)}.`}
              />
              <ResultRow
                label="Indicatief te betalen"
                value={formatCurrency(view.incomeBased.requiredMonthlyPayment)}
                sub="Laagste van wettelijke termijn en draagkrachtindicatie."
                strong
              />
            </>
          ) : null}
        </div>
      </section>
    </div>
  ) : (
    <section id="tool-result-summary" className="rounded-xl border hair bg-white p-5 shadow-paper">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
        Vul je studieschuld in
      </h2>
      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--muted)]">
        Na een geldig bedrag toont de tool direct de wettelijke DUO-termijn.
        Draagkracht verschijnt alleen als je inkomen invult.
      </p>
    </section>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Wat wordt mijn DUO-maandbedrag?
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bereken feitelijk welk maandbedrag bij je studieschuld hoort. Met
            inkomen erbij zie je ook een indicatieve draagkrachtgrens.
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
                  DUO stelt je draagkracht jaarlijks vast op basis van je inkomen
                  van twee jaar terug. Deze indicatie vervangt die vaststelling niet.
                </li>
                <li>Bijzondere situaties kunnen in Mijn DUO anders uitpakken.</li>
              </ul>
            </DisclosureSection>
          </div>
        ) : null
      }
      disclaimer={
        <p className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4 text-[12.5px] leading-[1.7] text-[var(--muted)]">
          Puur informatieve DUO-indicatie. Geen advies. Jij bepaalt wat je met
          deze informatie doet.
        </p>
      }
    />
  );
}
