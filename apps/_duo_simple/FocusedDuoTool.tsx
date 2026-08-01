"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import {
  ExampleValuesNotice,
  ResultContextNotice,
} from "@/components/tool/CalculationContextNotice";
import {
  ToolActionButton,
  ToolActionLinkButton,
} from "@/components/tool/ToolActionButton";
import { ToolNextSteps } from "@/components/tool/ToolNextSteps";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { formatDuoRateYearLabel, getAvailableDuoRateYears } from "@/lib/financial-constants";
import { getToolNextSteps } from "@/lib/tool-journeys";
import { downloadStudyStopPdfReport } from "../duo-doorlenen-of-stoppen/report";
import {
  calculateAvailableSimpleDuoMonthlyLoan,
  createSimpleDuoView,
  defaultSimpleDuoValues,
  emptySimpleDuoValues,
  getSimpleDuoMonthlyLimitAdjustments,
  getSimpleDuoMonthlyLimits,
  getSimpleDuoSupportedCalculationMonths,
  maxBorrowingWithoutDiplomaValues,
  type SimpleDuoMonthlyLimitAdjustment,
  type SimpleDuoMonthlyLimits,
  type SimpleDuoOutcomeKey,
  type SimpleDuoToolMode,
  type SimpleDuoValues,
} from "./focused-logic";
import { ProjectedDebtMortgageImpact } from "./ProjectedDebtMortgageImpact";

type ToolCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryLabel: string;
  fields: Array<keyof SimpleDuoValues>;
  advancedFields?: Array<keyof SimpleDuoValues>;
  helper: string;
};

const modeCopy: Record<SimpleDuoToolMode, ToolCopy> = {
  "start-borrowing": {
    eyebrow: "Nieuwe studie",
    title: "Wat wordt mijn studieschuld als ik ga lenen?",
    intro:
      "Vul in hoeveel je per maand verwacht te lenen en hoe lang je nog studeert. De tool laat je verwachte schuld bij diploma en start terugbetaling zien.",
    primaryLabel: "Bereken",
    fields: [
      "calculationMonth",
      "monthsUntilDiploma",
      "monthlyLoan",
      "duoRateYear",
    ],
    advancedFields: [
      "monthlyCollegegeldkrediet",
      "monthlyBasisbeurs",
      "monthlyAanvullendeBeurs",
      "monthlyReisproduct",
    ],
    helper:
      "Gebruik deze tool als je nog geen studieschuld hebt of een nieuwe leenperiode wilt inschatten.",
  },
  "stop-cost": {
    eyebrow: "Stoppen",
    title: "Wat kost stoppen door mijn prestatiebeurs?",
    intro:
      "Vul je openstaande prestatiebeursdelen uit Mijn DUO in. De tool laat zien welk bedrag schuld blijft als je stopt en geen diploma op tijd haalt.",
    primaryLabel: "Bereken",
    fields: [
      "calculationMonth",
      "currentLoanDebt",
      "currentCollegegeldkredietDebt",
      "currentBasisbeursDebt",
      "currentAanvullendeBeursDebt",
      "currentReisproductDebt",
      "duoRateYear",
    ],
    helper:
      "Basisbeurs, aanvullende beurs en studentenreisproduct zijn hier de belangrijkste onderdelen.",
  },
  "monthly-impact": {
    eyebrow: "Tijdens je studie",
    title: "Wat doet een nieuw leenbedrag per maand?",
    intro:
      "Begin met alleen het bedrag dat je per maand wilt lenen. Daarna kun je de resterende studieduur, huidige schuld en collegegeldkrediet verder specificeren.",
    primaryLabel: "Bereken",
    fields: ["monthlyLoan"],
    advancedFields: [
      "monthsUntilDiploma",
      "currentLoanDebt",
      "currentCollegegeldkredietDebt",
      "monthlyCollegegeldkrediet",
      "duoRateYear",
    ],
    helper:
      "De snelle berekening gebruikt standaard 36 maanden en SF35. Open verder specificeren als je preciezer wilt rekenen.",
  },
};

const nextStepSlugByMode: Record<
  SimpleDuoToolMode,
  "duo-maandbedrag" | "duo-schuld-bij-starten-lenen"
> = {
  "start-borrowing": "duo-maandbedrag",
  "stop-cost": "duo-maandbedrag",
  "monthly-impact": "duo-schuld-bij-starten-lenen",
};

const pdfSubjectByMode: Record<SimpleDuoToolMode, string> = {
  "start-borrowing": "verwachte-studieschuld",
  "stop-cost": "kosten-stoppen-met-studeren",
  "monthly-impact": "impact-leenbedrag",
};

/*
 * Deliberately no repayment-rule selector in the simple tools: these three tools show SF35,
 * because the user question is explicitly about aflossen vanaf terugbetalen in 35 jaar.
 */

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function formatCalculationMonth(value: string, format: "long" | "short" = "long") {
  const [year, month] = value.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return value;

  return new Intl.DateTimeFormat("nl-NL", {
    month: format,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function Field({
  id,
  label,
  value,
  error,
  hint,
  prefix,
  suffix,
  max,
  step,
  type = "number",
  onChange,
  onEnter,
  className,
}: {
  id: keyof SimpleDuoValues;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  max?: number;
  step?: string;
  type?: "number" | "month";
  onChange: (value: string) => void;
  onEnter?: (event: KeyboardEvent) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`.trim()} htmlFor={String(id)}>
      <span className="grid items-start gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,auto)] sm:gap-3">
        <span className="min-w-0 text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? (
          <span className="min-w-0 text-left text-[11px] leading-snug text-[var(--soft)] sm:max-w-56 sm:text-right">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="field-shell flex min-h-12 items-center px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
        <input
          id={String(id)}
          type={type}
          value={value}
          min="0"
          max={max}
          step={type === "month" ? undefined : step ?? "0.01"}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${String(id)}-error` : undefined}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
        {suffix ? <span className="ml-2 text-[13px] text-[var(--muted)]">{suffix}</span> : null}
      </span>
      <div id={`${String(id)}-error`}>
        <FieldError message={error} />
      </div>
    </label>
  );
}

function MonthlyLoanSliderField({
  value,
  error,
  maximum,
  onChange,
  onEnter,
  className,
}: {
  value: string;
  error?: string;
  maximum?: number;
  onChange: (value: string) => void;
  onEnter?: (event: KeyboardEvent) => void;
  className?: string;
}) {
  const numericValue = Number.parseFloat(value);
  const safeMaximum = maximum ?? 0;
  const safeValue = Number.isFinite(numericValue)
    ? Math.min(Math.max(numericValue, 0), safeMaximum)
    : 0;

  return (
    <div className={`grid gap-3 ${className ?? ""}`.trim()}>
      <Field
        id="monthlyLoan"
        label="Lening per maand"
        value={value}
        error={error}
        hint={
          maximum !== undefined
            ? `Max. ${formatCurrency(maximum, 2)} per maand`
            : "Geen maximum voor deze maand"
        }
        prefix="€"
        max={maximum}
        type="number"
        onChange={onChange}
        onEnter={onEnter}
      />
      <label className="grid gap-2" htmlFor="monthlyLoanSlider">
        <span className="flex items-center justify-between gap-3 text-[12px] text-[var(--soft)]">
          <span>€0</span>
          <span className="font-mono text-[13px] text-[var(--muted)]">{formatCurrency(safeValue, 0)} per maand</span>
          <span>{formatCurrency(safeMaximum, 2)}</span>
        </span>
        <input
          id="monthlyLoanSlider"
          type="range"
          min="0"
          max={safeMaximum}
          step="25"
          value={safeValue}
          disabled={maximum === undefined}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus h-10 w-full accent-[var(--accent)]"
          aria-label="Lening per maand slider"
        />
      </label>
    </div>
  );
}

function CalculationMonthSliderField({
  value,
  error,
  months,
  limits,
  adjustments,
  onChange,
  onApplyAdjustment,
  className,
}: {
  value: string;
  error?: string;
  months: readonly string[];
  limits: SimpleDuoMonthlyLimits | null;
  adjustments: readonly SimpleDuoMonthlyLimitAdjustment[];
  onChange: (value: string) => void;
  onApplyAdjustment: (adjustment: SimpleDuoMonthlyLimitAdjustment) => void;
  className?: string;
}) {
  const selectedIndex = months.indexOf(value);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const previousMonth = selectedIndex > 0 ? months[selectedIndex - 1] : undefined;
  const nextMonth = selectedIndex >= 0 ? months[selectedIndex + 1] : undefined;
  const previousLimits = previousMonth
    ? getSimpleDuoMonthlyLimits(previousMonth)
    : null;
  const nextLimits = nextMonth ? getSimpleDuoMonthlyLimits(nextMonth) : null;
  const transitionMonths = months.filter((month, index) => {
    if (index === 0) return false;
    return getSimpleDuoMonthlyLimits(month)?.periodId !==
      getSimpleDuoMonthlyLimits(months[index - 1])?.periodId;
  });
  const comparableNorms = limits
    ? [
        {
          label: "het collegegeldkrediet",
          current: limits.monthlyCollegegeldkrediet,
          previous: previousLimits?.monthlyCollegegeldkrediet,
          next: nextLimits?.monthlyCollegegeldkrediet,
        },
        {
          label: "de thuiswonende basisbeurs",
          current: limits.monthlyBasisbeursLivingAtHome,
          previous: previousLimits?.monthlyBasisbeursLivingAtHome,
          next: nextLimits?.monthlyBasisbeursLivingAtHome,
        },
        {
          label: "de uitwonende basisbeurs",
          current: limits.monthlyBasisbeursLivingAway,
          previous: previousLimits?.monthlyBasisbeursLivingAway,
          next: nextLimits?.monthlyBasisbeursLivingAway,
        },
        {
          label: "de aanvullende beurs",
          current: limits.monthlyAanvullendeBeurs,
          previous: previousLimits?.monthlyAanvullendeBeurs,
          next: nextLimits?.monthlyAanvullendeBeurs,
        },
        {
          label: "de reisproductwaarde",
          current: limits.monthlyReisproduct,
          previous: previousLimits?.monthlyReisproduct,
          next: nextLimits?.monthlyReisproduct,
        },
      ]
    : [];
  const upcomingChanges = comparableNorms.filter(
    ({ current, next }) => next !== undefined && current !== next,
  );
  const currentChanges = comparableNorms.filter(
    ({ current, previous }) => previous !== undefined && current !== previous,
  );
  const highlightedChanges = upcomingChanges.length > 0 ? upcomingChanges : currentChanges;
  const changeMonth = upcomingChanges.length > 0 ? nextMonth : value;
  const adjustmentLabels: Record<SimpleDuoMonthlyLimitAdjustment["field"], string> = {
    monthlyLoan: "lening",
    monthlyCollegegeldkrediet: "collegegeldkrediet",
    monthlyBasisbeurs: "basisbeurs",
    monthlyAanvullendeBeurs: "aanvullende beurs",
    monthlyReisproduct: "reisproduct",
  };

  function selectIndex(index: number) {
    const month = months[index];
    if (month) onChange(month);
  }

  return (
    <div className={`grid gap-3 ${className ?? ""}`.trim()}>
      <div className="flex items-center justify-between gap-4">
        <label
          className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
          htmlFor="calculationMonthSlider"
        >
          Berekeningsmaand
        </label>
        <output
          htmlFor="calculationMonthSlider"
          className="font-mono text-[14px] font-medium tabular-nums text-[var(--ink)]"
        >
          {selectedIndex >= 0 ? formatCalculationMonth(value) : "Kies een maand"}
        </output>
      </div>

      <div className="surface-subtle grid gap-3 p-4">
        <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <button
            type="button"
            onClick={() => selectIndex(safeIndex - 1)}
            disabled={selectedIndex <= 0}
            aria-label="Vorige maand"
            className="ring-focus flex size-11 items-center justify-center justify-self-start rounded-xl border border-[var(--hair)] bg-white text-[16px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px sm:w-auto sm:px-3 sm:text-[12px]"
          >
            <span aria-hidden="true">←</span>
            <span className="sr-only sm:not-sr-only sm:ml-1">Vorige maand</span>
          </button>
          <strong className="text-center text-[14px] font-semibold text-[var(--ink)]">
            {selectedIndex >= 0 ? formatCalculationMonth(value) : "Kies een maand"}
          </strong>
          <button
            type="button"
            onClick={() => selectIndex(safeIndex + 1)}
            disabled={selectedIndex < 0 || selectedIndex >= months.length - 1}
            aria-label="Volgende maand"
            className="ring-focus flex size-11 items-center justify-center justify-self-end rounded-xl border border-[var(--hair)] bg-white text-[16px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px sm:w-auto sm:px-3 sm:text-[12px]"
          >
            <span className="sr-only sm:not-sr-only sm:mr-1">Volgende maand</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <input
          id="calculationMonthSlider"
          type="range"
          min="0"
          max={Math.max(months.length - 1, 0)}
          step="1"
          value={safeIndex}
          disabled={months.length === 0}
          onChange={(event) => onChange(months[Number(event.target.value)] ?? value)}
          aria-invalid={error ? "true" : "false"}
          aria-valuetext={selectedIndex >= 0 ? formatCalculationMonth(value) : "Geen maand gekozen"}
          aria-describedby={error ? "calculationMonth-error" : "calculationMonth-hint"}
          className="ring-focus h-11 w-full touch-pan-x accent-[var(--accent)]"
        />
        <div
          id="calculationMonth-hint"
          className="relative h-5 text-[11px] text-[var(--soft)]"
        >
          <span className="absolute left-0">
            {months[0] ? formatCalculationMonth(months[0], "short").split(" ")[0] : ""}
          </span>
          {transitionMonths.map((month) => {
            const index = months.indexOf(month);
            const position = months.length > 1 ? (index / (months.length - 1)) * 100 : 0;
            return (
              <span
                key={month}
                className="absolute -translate-x-1/2 font-medium text-[var(--accent)]"
                style={{ left: `${position}%` }}
              >
                {formatCalculationMonth(month, "short").split(" ")[0]}
              </span>
            );
          })}
          <span className="absolute right-0">
            {months.at(-1)
              ? formatCalculationMonth(months.at(-1)!, "short").split(" ")[0]
              : ""}
          </span>
        </div>
      </div>

      {limits ? (
        <div className="rounded-[1.125rem] border border-[var(--hair)] bg-white p-4">
          <p className="text-[12px] font-semibold text-[var(--ink)]">
            Normen in {formatCalculationMonth(value)}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-[12px] sm:grid-cols-5">
            {[
              ["Collegegeldkrediet", limits.monthlyCollegegeldkrediet],
              ["Basisbeurs thuis", limits.monthlyBasisbeursLivingAtHome],
              ["Basisbeurs uit", limits.monthlyBasisbeursLivingAway],
              ["Aanvullende beurs", limits.monthlyAanvullendeBeurs],
              ["Reisproduct", limits.monthlyReisproduct],
            ].map(([label, amount]) => (
              <div key={String(label)} className="border-t border-[var(--hair)] pt-2">
                <dt className="leading-5 text-[var(--soft)]">{label}</dt>
                <dd className="mt-0.5 font-mono font-medium tabular-nums text-[var(--ink)]">
                  {formatCurrency(Number(amount), 2)}
                </dd>
              </div>
            ))}
          </dl>
          {highlightedChanges.length > 0 && changeMonth ? (
            <p className="mt-3 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-[12px] leading-5 text-[var(--ink-2)]">
              Vanaf {formatCalculationMonth(changeMonth)} verandert {highlightedChanges[0].label} van {formatCurrency(
                upcomingChanges.length > 0
                  ? highlightedChanges[0].current
                  : highlightedChanges[0].previous ?? highlightedChanges[0].current,
                2,
              )} naar {formatCurrency(
                upcomingChanges.length > 0
                  ? highlightedChanges[0].next ?? highlightedChanges[0].current
                  : highlightedChanges[0].current,
                2,
              )}.
            </p>
          ) : null}
        </div>
      ) : null}

      {adjustments.length > 0 ? (
        <div
          className="rounded-[1.125rem] border border-[var(--warn)]/35 bg-[var(--warn-soft)] p-4"
          role="status"
        >
          <p className="text-[13px] font-semibold text-[var(--ink)]">
            Een ingevuld bedrag ligt boven de norm van deze maand
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">
            We veranderen niets automatisch. Kies zelf welke invoer je naar het maximum wilt aanpassen.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {adjustments.map((adjustment) => (
              <button
                key={adjustment.field}
                type="button"
                onClick={() => onApplyAdjustment(adjustment)}
                className="ring-focus min-h-11 rounded-xl border border-[var(--warn)]/40 bg-white px-3 py-2 text-[12px] font-semibold text-[var(--ink)] transition hover:border-[var(--warn)] active:translate-y-px"
              >
                Pas {adjustmentLabels[adjustment.field]} aan naar {formatCurrency(adjustment.maximum, 2)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div id="calculationMonth-error">
        <FieldError message={error} />
      </div>
    </div>
  );
}

function BasisGrantReference({
  limits,
  onSelect,
}: {
  limits: SimpleDuoMonthlyLimits | null;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="surface-subtle grid gap-3 p-4">
      <div>
        <div className="text-[12px] font-medium text-[var(--ink)]">Basisbeurs overnemen</div>
        <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">
          Kies het bedrag dat past bij je woonsituatie in de geselecteerde maand.
        </p>
      </div>
      {limits ? (
        <div className="grid grid-cols-2 gap-2">
          <ToolActionButton
            type="button"
            variant="secondary"
            className="min-w-0 flex-col gap-0.5 px-2"
            onClick={() => onSelect(limits.monthlyBasisbeursLivingAtHome)}
          >
            <span className="text-[11px] text-[var(--soft)]">Thuiswonend</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(limits.monthlyBasisbeursLivingAtHome, 2)}
            </span>
          </ToolActionButton>
          <ToolActionButton
            type="button"
            variant="secondary"
            className="min-w-0 flex-col gap-0.5 px-2"
            onClick={() => onSelect(limits.monthlyBasisbeursLivingAway)}
          >
            <span className="text-[11px] text-[var(--soft)]">Uitwonend</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(limits.monthlyBasisbeursLivingAway, 2)}
            </span>
          </ToolActionButton>
        </div>
      ) : (
        <p className="text-[12px] text-[var(--soft)]">Kies eerst een ondersteunde berekeningsmaand.</p>
      )}
    </div>
  );
}

function AdditionalGrantHelp() {
  return (
    <details className="surface-subtle group p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[12px] font-medium text-[var(--ink)]">
        <span
          aria-hidden="true"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--accent-line)] font-mono text-[12px] text-[var(--accent)]"
        >
          i
        </span>
        Benieuwd of je recht hebt op aanvullende beurs?
      </summary>
      <div className="mt-3 space-y-3 border-t border-[var(--line)] pt-3">
        <p className="text-[12px] leading-[1.6] text-[var(--soft)]">
          Beantwoord alleen de vragen die nodig zijn om je aanvullende beurs voor 2026 te schatten. Neem het maandbedrag daarna hier over.
        </p>
        <ToolActionLinkButton href="/apps/duo-aanvullende-beurs" variant="secondary">
          Bereken mijn aanvullende beurs
        </ToolActionLinkButton>
      </div>
    </details>
  );
}

function AvailableLoanReference({
  available,
  totalMaximum,
  onSelect,
}: {
  available: number;
  totalMaximum: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="surface-subtle flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-[12px] font-medium text-[var(--ink)]">
          Maximale lening met deze beursbedragen
        </div>
        <p className="mt-1 text-[12px] leading-[1.55] text-[var(--soft)]">
          {formatCurrency(available, 2)} per maand binnen het gezamenlijke maximum van {formatCurrency(totalMaximum, 2)}.
        </p>
      </div>
      <ToolActionButton
        type="button"
        variant="secondary"
        className="shrink-0"
        onClick={() => onSelect(available)}
      >
        Neem {formatCurrency(available, 2)} over
      </ToolActionButton>
    </div>
  );
}

function Select({
  id,
  label,
  value,
  error,
  options,
  onChange,
  className,
}: {
  id: keyof SimpleDuoValues;
  label: string;
  value: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`.trim()} htmlFor={String(id)}>
      <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
        {label}
      </span>
      <span className="field-shell flex min-h-12 items-center px-3">
        <select
          id={String(id)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${String(id)}-error` : undefined}
          className="ring-focus h-full w-full bg-transparent text-[15px] outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      <div id={`${String(id)}-error`}>
        <FieldError message={error} />
      </div>
    </label>
  );
}

function fieldLabel(field: keyof SimpleDuoValues) {
  const labels: Record<keyof SimpleDuoValues, string> = {
    calculationMonth: "Berekeningsmaand",
    monthsUntilDiploma: "Aantal maanden studeren",
    currentLoanDebt: "Huidige lening",
    currentCollegegeldkredietDebt: "Huidig collegegeldkrediet",
    currentBasisbeursDebt: "Basisbeurs als prestatiebeurs",
    currentAanvullendeBeursDebt: "Aanvullende beurs als prestatiebeurs",
    currentReisproductDebt: "Studentenreisproduct",
    monthlyLoan: "Lening per maand",
    monthlyCollegegeldkrediet: "Collegegeldkrediet per maand",
    monthlyBasisbeurs: "Basisbeurs per maand",
    monthlyAanvullendeBeurs: "Aanvullende beurs per maand",
    monthlyReisproduct: "Studentenreisproduct per maand",
    repaymentRule: "Terugbetalingsregel",
    duoRateYear: "DUO-rentejaar",
  };

  return labels[field];
}

function fieldHint(
  field: keyof SimpleDuoValues,
  limits: SimpleDuoMonthlyLimits | null,
) {
  if (!limits && field.startsWith("monthly") && field !== "monthlyReisproduct") {
    return "Geen maximum voor deze maand";
  }

  if (limits) {
    if (field === "monthlyLoan") {
      return `Max. ${formatCurrency(limits.monthlyLoan, 2)} per maand`;
    }
    if (field === "monthlyCollegegeldkrediet") {
      return `Max. ${formatCurrency(limits.monthlyCollegegeldkrediet, 2)} per maand, ${formatCurrency(limits.annualStatutoryTuitionFee, 0)} ÷ 12`;
    }
    if (field === "monthlyBasisbeurs") {
      return `Max. ${formatCurrency(limits.monthlyBasisbeurs, 2)} uitwonend`;
    }
    if (field === "monthlyAanvullendeBeurs") {
      return `Max. ${formatCurrency(limits.monthlyAanvullendeBeurs, 2)}`;
    }
    if (field === "monthlyReisproduct") {
      return `${formatCurrency(limits.monthlyReisproduct, 2)} zolang dit nog geen gift is`;
    }
  }

  const hints: Partial<Record<keyof SimpleDuoValues, string>> = {
    monthsUntilDiploma: "Gebruik hele maanden",
    currentLoanDebt: "Mijn DUO: lening",
    currentCollegegeldkredietDebt: "Mijn DUO: collegegeldkrediet",
    currentBasisbeursDebt: "Mijn DUO: prestatiebeurs",
    currentAanvullendeBeursDebt: "Mijn DUO: prestatiebeurs",
    currentReisproductDebt: "Mijn DUO: reisproduct",
    monthlyLoan: "Nieuw of verwacht bedrag",
    monthlyCollegegeldkrediet: "Optioneel",
    monthlyBasisbeurs: "Alleen als prestatiebeurs",
    monthlyAanvullendeBeurs: "Alleen als prestatiebeurs",
    monthlyReisproduct: "Alleen als waarde/schuld",
    duoRateYear: "Jaar met percentage",
  };

  return hints[field];
}

function fieldMaximum(
  field: keyof SimpleDuoValues,
  limits: SimpleDuoMonthlyLimits | null,
) {
  if (!limits) return undefined;
  if (field === "monthlyLoan") return limits.monthlyLoan;
  if (field === "monthlyCollegegeldkrediet") {
    return limits.monthlyCollegegeldkrediet;
  }
  if (field === "monthlyBasisbeurs") return limits.monthlyBasisbeurs;
  if (field === "monthlyAanvullendeBeurs") {
    return limits.monthlyAanvullendeBeurs;
  }
  if (field === "monthlyReisproduct") return limits.monthlyReisproduct;
  return undefined;
}

function fieldStep(field: keyof SimpleDuoValues) {
  if (field === "monthsUntilDiploma") return "1";
  if (field === "calculationMonth" || field === "duoRateYear") return undefined;
  return "0.01";
}

export function FocusedDuoTool({ mode }: { mode: SimpleDuoToolMode }) {
  const copy = modeCopy[mode];
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [submittedOutcome, setSubmittedOutcome] =
    useState<SimpleDuoOutcomeKey>("standard");
  const exampleValues = useMemo(() => defaultSimpleDuoValues(mode), [mode]);
  const initialValues = useMemo(() => emptySimpleDuoValues(mode), [mode]);
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    submitValues,
    replaceValues,
  } =
    useSubmittedCalculation<SimpleDuoValues>(initialValues);
  const currentView = useMemo(() => createSimpleDuoView(mode, formValues), [formValues, mode]);
  const submittedView = submittedValues
    ? createSimpleDuoView(mode, submittedValues, submittedOutcome)
    : null;
  const isExampleInput = JSON.stringify(formValues) === JSON.stringify(exampleValues);
  const isExampleResult =
    submittedValues !== null &&
    submittedOutcome === "standard" &&
    JSON.stringify(submittedValues) === JSON.stringify(exampleValues);
  const mobileFlow = useMobileFieldFlow(copy.fields);
  const monthlyLimits = useMemo(
    () => getSimpleDuoMonthlyLimits(formValues.calculationMonth),
    [formValues.calculationMonth],
  );
  const supportedCalculationMonths = useMemo(
    () => getSimpleDuoSupportedCalculationMonths(),
    [],
  );
  const availableMonthlyLoan = useMemo(
    () => monthlyLimits
      ? calculateAvailableSimpleDuoMonthlyLoan(formValues, monthlyLimits)
      : null,
    [formValues, monthlyLimits],
  );
  const monthlyLimitAdjustments = useMemo(
    () => monthlyLimits
      ? getSimpleDuoMonthlyLimitAdjustments(formValues, monthlyLimits)
      : [],
    [formValues, monthlyLimits],
  );

  function updateField<K extends keyof SimpleDuoValues>(field: K, value: SimpleDuoValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    if (currentView.isValid) {
      submit();
    }
  }

  function handleMaxBorrowingWithoutDiploma() {
    const nextValues = maxBorrowingWithoutDiplomaValues(formValues);
    const nextView = createSimpleDuoView(
      "start-borrowing",
      nextValues,
      "max-borrowing-no-diploma",
    );
    if (!nextView.isValid) return;

    setSubmittedOutcome("max-borrowing-no-diploma");
    submitValues(
      nextValues,
      "Maximale studiefinanciering zonder diploma is doorgerekend.",
    );
  }

  async function handleDownloadPdf() {
    if (!submittedView?.isValid) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await downloadStudyStopPdfReport(
        submittedView.input,
        submittedView.result,
        pdfSubjectByMode[mode],
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function renderField(field: keyof SimpleDuoValues, useMobileClass = true) {
    const fieldClassName = useMobileClass ? mobileFlow.getFieldClassName(field) : undefined;

    if (field === "calculationMonth" && mode === "start-borrowing") {
      return (
        <CalculationMonthSliderField
          key={field}
          value={formValues[field]}
          error={currentView.isValid ? undefined : currentView.errors[field]}
          months={supportedCalculationMonths}
          limits={monthlyLimits}
          adjustments={monthlyLimitAdjustments}
          onChange={(value) => updateField(field, value)}
          onApplyAdjustment={({ field: adjustmentField, maximum }) =>
            updateField(adjustmentField, String(maximum))
          }
          className={fieldClassName}
        />
      );
    }

    if (field === "duoRateYear") {
      return (
        <Select
          key={field}
          id={field}
          label={fieldLabel(field)}
          value={formValues[field]}
          error={currentView.isValid ? undefined : currentView.errors[field]}
          options={getAvailableDuoRateYears().map((year) => ({
            label: formatDuoRateYearLabel(year, "SF35"),
            value: String(year),
          }))}
          onChange={(value) => updateField(field, value)}
          className={fieldClassName}
        />
      );
    }

    if (field === "monthlyLoan" && mode === "monthly-impact") {
      return (
        <MonthlyLoanSliderField
          key={field}
          value={formValues[field]}
          error={currentView.isValid ? undefined : currentView.errors[field]}
          maximum={monthlyLimits?.monthlyLoan}
          onChange={(value) => updateField(field, value)}
          onEnter={mobileFlow.handleEnterAdvance(field, false)}
          className={fieldClassName}
        />
      );
    }

    if (field === "monthlyLoan" && mode === "start-borrowing") {
      return (
        <div key={field} className={`grid gap-3 ${fieldClassName ?? ""}`.trim()}>
          <Field
            id={field}
            label={fieldLabel(field)}
            value={formValues[field]}
            error={currentView.isValid ? undefined : currentView.errors[field]}
            hint={availableMonthlyLoan !== null
              ? `Beschikbaar: ${formatCurrency(availableMonthlyLoan, 2)} per maand`
              : fieldHint(field, monthlyLimits)}
            prefix="€"
            max={availableMonthlyLoan ?? fieldMaximum(field, monthlyLimits)}
            step={fieldStep(field)}
            onChange={(value) => updateField(field, value)}
            onEnter={mobileFlow.handleEnterAdvance(field, false)}
          />
          {monthlyLimits && availableMonthlyLoan !== null ? (
            <AvailableLoanReference
              available={availableMonthlyLoan}
              totalMaximum={monthlyLimits.totalExcludingTuitionCredit}
              onSelect={(value) => updateField(field, String(value))}
            />
          ) : null}
        </div>
      );
    }

    if (field === "monthlyBasisbeurs" && mode === "start-borrowing") {
      return (
        <div
          key={field}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.9fr)] md:items-start"
        >
          <Field
            id={field}
            label={fieldLabel(field)}
            value={formValues[field]}
            error={currentView.isValid ? undefined : currentView.errors[field]}
            hint={fieldHint(field, monthlyLimits)}
            prefix="€"
            max={fieldMaximum(field, monthlyLimits)}
            step={fieldStep(field)}
            onChange={(value) => updateField(field, value)}
            onEnter={mobileFlow.handleEnterAdvance(field, false)}
          />
          <BasisGrantReference
            limits={monthlyLimits}
            onSelect={(value) => updateField(field, String(value))}
          />
        </div>
      );
    }

    if (field === "monthlyAanvullendeBeurs" && mode === "start-borrowing") {
      return (
        <div
          key={field}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.9fr)] md:items-start"
        >
          <Field
            id={field}
            label={fieldLabel(field)}
            value={formValues[field]}
            error={currentView.isValid ? undefined : currentView.errors[field]}
            hint={fieldHint(field, monthlyLimits)}
            prefix="€"
            max={fieldMaximum(field, monthlyLimits)}
            step={fieldStep(field)}
            onChange={(value) => updateField(field, value)}
            onEnter={mobileFlow.handleEnterAdvance(field, false)}
          />
          <AdditionalGrantHelp />
        </div>
      );
    }

    return (
      <Field
        key={field}
        id={field}
        label={fieldLabel(field)}
        value={formValues[field]}
        error={currentView.isValid ? undefined : currentView.errors[field]}
        hint={fieldHint(field, monthlyLimits)}
        prefix={field.includes("Debt") || field.startsWith("monthly") ? "€" : undefined}
        suffix={field === "monthsUntilDiploma" ? "maanden" : undefined}
        max={fieldMaximum(field, monthlyLimits)}
        step={fieldStep(field)}
        type={field === "calculationMonth" ? "month" : "number"}
        onChange={(value) => updateField(field, value)}
        onEnter={mobileFlow.handleEnterAdvance(field, false)}
        className={fieldClassName}
      />
    );
  }

  const selectedScenario = submittedView?.isValid
    ? submittedView.result.scenarios.find((scenario) =>
        submittedOutcome === "max-borrowing-no-diploma"
          ? scenario.key === "continue-no-diploma"
          : mode === "stop-cost"
            ? scenario.key === "stop-now-no-diploma"
            : scenario.key === "continue-to-diploma",
      )
    : undefined;
  const baseNextSteps = getToolNextSteps(nextStepSlugByMode[mode]);
  const nextSteps = mode === "start-borrowing"
    ? {
        ...baseNextSteps,
        title: "Van verwachte studieschuld naar woningruimte",
        description:
          "Je weet nu wat je studieschuld ongeveer wordt. Bekijk vervolgens wat een DUO-maandbedrag voor je woningruimte kan betekenen.",
      }
    : mode === "stop-cost"
      ? {
          ...baseNextSteps,
          title: "Van stopkosten naar woningruimte",
          description:
            "Je ziet nu welk prestatiebeursdeel schuld blijft. Bekijk vervolgens wat een DUO-maandbedrag voor je woningruimte kan betekenen.",
        }
      : baseNextSteps;

  const result = submittedView?.isValid ? (
    <div className="space-y-5">
      <section id="tool-result-summary" className="surface-panel space-y-4 p-5">
        <ResultContextNotice kind="duo" isExample={isExampleResult} />
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Uitkomst
          </div>
          <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            {submittedView.focusScenario.title}
          </h3>
          <p className="text-[13px] leading-[1.7] text-[var(--soft)]">
            {submittedView.focusScenario.description}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultCard
            label={submittedView.focusScenario.primaryLabel}
            value={formatCurrency(submittedView.focusScenario.primaryAmount)}
            className={mode === "start-borrowing" ? undefined : "sm:col-span-2"}
          />
          {mode === "start-borrowing" ? (
            <ResultCard
              label="Totaal terug te betalen inclusief rente"
              value={formatCurrency(submittedView.focusScenario.totalPaid)}
              note={`Bij regulier aflossen binnen ${submittedView.focusScenario.repaymentTermYears} jaar, zonder extra aflossingen of aflosvrije maanden.`}
            />
          ) : null}
        </div>
        {mode === "stop-cost" && selectedScenario ? (
          <div className="surface-subtle px-4">
            <ResultRow label="Basisbeurs blijft schuld" value={formatCurrency(selectedScenario.debtAtStop.basisbeurs)} />
            <ResultRow
              label="Aanvullende beurs blijft schuld"
              value={formatCurrency(selectedScenario.debtAtStop.aanvullendeBeurs)}
            />
            <ResultRow
              label="Studentenreisproduct blijft schuld"
              value={formatCurrency(selectedScenario.debtAtStop.reisproduct)}
            />
          </div>
        ) : null}
        <p className="text-[13px] leading-[1.7] text-[var(--soft)]">
          {submittedView.focusScenario.note}
        </p>
        <ProjectedDebtMortgageImpact
          debtAtStudyEnd={
            selectedScenario?.debtAtStop.total ?? submittedView.focusScenario.primaryAmount
          }
        />
        <ToolNextSteps {...nextSteps} />
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={() => void handleDownloadPdf()}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download overzicht"}
        </ToolActionButton>
        <details className="surface-subtle p-4">
          <summary className="cursor-pointer text-[13px] font-medium text-[var(--ink)]">
            Bekijk de volledige berekening
          </summary>
          <div className="mt-4">
            {mode !== "start-borrowing" ? (
              <ResultRow
                label="Totaal terug te betalen inclusief rente"
                value={formatCurrency(submittedView.focusScenario.totalPaid)}
                sub={`Bij regulier aflossen binnen ${submittedView.focusScenario.repaymentTermYears} jaar, zonder extra aflossingen of aflosvrije maanden.`}
              />
            ) : null}
            <ResultRow
              label="Eindschuld bij start terugbetaling"
              value={formatCurrency(submittedView.focusScenario.debtAtRepaymentStart)}
            />
            <ResultRow
              label={submittedView.focusScenario.secondaryLabel}
              value={formatCurrency(submittedView.focusScenario.secondaryAmount)}
            />
            <ResultRow
              label="Rente in aflosfase"
              value={formatCurrency(submittedView.focusScenario.totalInterest)}
            />
            <ResultRow
              label="Schuldenvrij rond"
              value={submittedView.focusScenario.payoffDate ?? "Niet te bepalen"}
            />
            <ResultRow
              label="Altijd terug te betalen"
              value={formatCurrency(selectedScenario?.debtAtStop.alwaysRepayable ?? 0)}
            />
          </div>
        </details>
      </section>
    </div>
  ) : (
    <section id="tool-result-summary" className="surface-panel space-y-4 p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        Nog niet berekend
      </div>
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
        Vul je gegevens in
      </h3>
      <p className="text-[13px] leading-[1.7] text-[var(--soft)]">{copy.helper}</p>
    </section>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {copy.eyebrow}
          </div>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            {copy.intro}
          </p>
        </>
      }
      startActions={
        <div>
          <div className="flex flex-wrap gap-2">
            <ToolActionButton
              type="button"
              variant="secondary"
              onClick={() => {
                setSubmittedOutcome("standard");
                replaceValues(
                  exampleValues,
                  "Voorbeeld ingevuld. Klik op Bereken voor de voorbeeldberekening.",
                );
              }}
            >
              Voorbeeld invullen
            </ToolActionButton>
            {mode === "start-borrowing" ? (
              <ToolActionButton
                type="button"
                variant="secondary"
                onClick={handleMaxBorrowingWithoutDiploma}
              >
                Wat als ik maximaal leen en geen diploma haal?
              </ToolActionButton>
            ) : null}
            <ToolActionButton
              type="button"
              variant="secondary"
              onClick={() => {
                setSubmittedOutcome("standard");
                replaceValues(initialValues, "Invoer gewist.");
              }}
            >
              Wis invoer
            </ToolActionButton>
          </div>
          {isExampleInput ? <ExampleValuesNotice /> : null}
        </div>
      }
      inputs={
        <div className="space-y-4">
          {copy.fields.map((field) => renderField(field))}
          {copy.advancedFields ? (
            <details className="surface-subtle p-4">
              <summary className="cursor-pointer text-[13px] font-medium text-[var(--ink)]">
                {mode === "start-borrowing"
                  ? "Andere studiebedragen toevoegen"
                  : "Verder specificeren"}
              </summary>
              <div className="mt-4 grid gap-4">
                {copy.advancedFields.map((field) => renderField(field, false))}
              </div>
            </details>
          ) : null}
          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext}
            canComplete={currentView.isValid}
            onComplete={handleSubmit}
            completeLabel={copy.primaryLabel}
          />
        </div>
      }
      submitAction={
        <ToolActionButton type="button" onClick={handleSubmit} disabled={!currentView.isValid}>
          {copy.primaryLabel}
        </ToolActionButton>
      }
      result={result}
      disclaimer={
        <p className="text-[12px] leading-[1.7] text-[var(--soft)]">
          Indicatief op basis van DUO-regels en je invoer. Controleer je actuele bedragen altijd in Mijn DUO.
        </p>
      }
    />
  );
}
