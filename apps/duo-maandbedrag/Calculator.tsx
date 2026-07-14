"use client";

import { useMemo, useState } from "react";
import { DuoDebtPartsEditor } from "@/components/duo/DuoDebtPartsEditor";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { getRepaymentRuleLabel } from "@/lib/copy-glossary";
import {
  formatDuoRateYearLabel,
  getAvailableDuoRateYears,
} from "@/lib/financial-constants";
import {
  createDuoDebtPartFormValue,
  type DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import {
  calculateDuoMonthlyPaymentView,
  createDuoMonthlyPaymentDefaultValues,
  createEmptyDuoMonthlyPaymentValues,
  repaymentRuleOptions,
  type DuoHouseholdSituation,
  type DuoMonthlyPaymentFormValues,
} from "./logic";
import { downloadDuoMonthlyPaymentPdfReport } from "./report";

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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const view = useMemo(() => calculateDuoMonthlyPaymentView(formValues), [formValues]);

  function updateField<K extends keyof DuoMonthlyPaymentFormValues>(
    field: K,
    value: DuoMonthlyPaymentFormValues[K],
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

  async function handleDownloadPdf() {
    if (!view.isValid || isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await downloadDuoMonthlyPaymentPdfReport(formValues, view);
    } finally {
      setIsDownloadingPdf(false);
    }
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
        prefix="€"
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
            updateField(
              "repaymentRule",
              event.target.value as DuoMonthlyPaymentFormValues["repaymentRule"],
            )
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
                {formatDuoRateYearLabel(year, formValues.repaymentRule)}
              </option>
            ))}
          </select>
          <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
            Selecteer het jaar of herken het aan het percentage, bijvoorbeeld 2026 — 2,33%.
          </p>
          <FieldError message={view.errors.duoRateYear} />
        </label>
      ) : null}

      <DuoDebtPartsEditor
        enabled={formValues.useDebtParts}
        parts={formValues.debtParts}
        totalDebt={view.debtPartsTotal}
        errorsById={view.debtPartErrors}
        repaymentRule={formValues.repaymentRule}
        onToggle={toggleDebtParts}
        onPartChange={updateDebtPart}
        onAddPart={addDebtPart}
        onRemovePart={removeDebtPart}
      />
      <FieldError message={view.errors.debtParts} />

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
      <div className="flex flex-wrap items-center gap-2">
        <ToolActionButton
          type="button"
          variant="accent"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download uitgebreid PDF-overzicht"}
        </ToolActionButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard
          label="Wettelijke maandtermijn"
          value={formatCurrency(view.statutoryMonthlyPayment)}
          note={`${view.termYears} jaar, ${formatPercent(view.annualInterestRate)}% gewogen DUO-rente. Dit is je verplichte basis; alles daarboven is extra aflossen.`}
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
              ? "DUO vergelijkt draagkracht met de wettelijke termijn en gebruikt het laagste bedrag. Het verschil tussen dat bedrag en de wettelijke termijn is geen verplichting maar extra aflossen."
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
          <ResultRow label="DUO-rentejaar" value={String(view.duoRateYear)} />
          <ResultRow label="Gewogen DUO-rente" value={`${formatPercent(view.annualInterestRate)}%`} />
          <ResultRow label="Looptijd" value={`${view.termYears} jaar`} />
          <ResultRow
            label="Wettelijke termijn"
            value={formatCurrency(view.statutoryMonthlyPayment)}
            strong
          />
          {view.debtPortfolio.usesDebtParts ? (
            <ResultRow
              label="Leningdelen"
              value={`${view.debtPortfolio.parts.length} delen`}
              sub="Per deel wordt het gekozen rentejaar apart doorgerekend."
            />
          ) : null}
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
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Wat wordt mijn DUO-maandbedrag?
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bereken feitelijk welk maandbedrag bij je studieschuld hoort. Met
            inkomen erbij zie je ook een indicatieve draagkrachtgrens. Het
            wettelijke maandbedrag is de verplichte basis; alles daarboven is
            extra aflossen en dus een keuze.
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
                <li>
                  Voor terugbetalers blijft een gekozen DUO-rente doorgaans 5 jaar vaststaan.
                </li>
                <li>Bijzondere situaties kunnen in Mijn DUO anders uitpakken.</li>
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
          Puur informatieve DUO-indicatie. Geen advies. Jij bepaalt wat je met
          deze informatie doet.
        </p>
      }
    />
  );
}
