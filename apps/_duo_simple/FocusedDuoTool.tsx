"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { formatDuoRateYearLabel, getAvailableDuoRateYears } from "@/lib/financial-constants";
import { downloadStudyStopPdfReport } from "../duo-doorlenen-of-stoppen/report";
import {
  createSimpleDuoView,
  defaultSimpleDuoValues,
  emptySimpleDuoValues,
  type SimpleDuoToolMode,
  type SimpleDuoValues,
} from "./focused-logic";

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
    primaryLabel: "Bereken mijn schuld",
    fields: [
      "calculationMonth",
      "monthsUntilDiploma",
      "monthlyLoan",
      "monthlyCollegegeldkrediet",
      "monthlyBasisbeurs",
      "monthlyAanvullendeBeurs",
      "monthlyReisproduct",
      "duoRateYear",
    ],
    helper:
      "Gebruik deze tool als je nog geen studieschuld hebt of een nieuwe leenperiode wilt inschatten.",
  },
  "stop-cost": {
    eyebrow: "Stoppen",
    title: "Wat kost stoppen door mijn prestatiebeurs?",
    intro:
      "Vul je openstaande prestatiebeursdelen uit Mijn DUO in. De tool laat zien welk bedrag schuld blijft als je stopt en geen diploma op tijd haalt.",
    primaryLabel: "Bereken stopkosten",
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
    primaryLabel: "Bereken impact",
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

function Field({
  id,
  label,
  value,
  error,
  hint,
  prefix,
  suffix,
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
  type?: "number" | "month";
  onChange: (value: string) => void;
  onEnter?: (event: KeyboardEvent) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`.trim()} htmlFor={String(id)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-right text-[11px] leading-snug text-[var(--soft)]">{hint}</span> : null}
      </span>
      <span className="field-shell flex min-h-12 items-center px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
        <input
          id={String(id)}
          type={type}
          value={value}
          min="0"
          step={type === "month" ? undefined : "0.01"}
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
  onChange,
  onEnter,
  className,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onEnter?: (event: KeyboardEvent) => void;
  className?: string;
}) {
  const numericValue = Number.parseFloat(value);
  const safeValue = Number.isFinite(numericValue) ? Math.min(Math.max(numericValue, 0), 1000) : 0;

  return (
    <div className={`grid gap-3 ${className ?? ""}`.trim()}>
      <Field
        id="monthlyLoan"
        label="Lening per maand"
        value={value}
        error={error}
        hint="Sleep of typ je bedrag"
        prefix="€"
        type="number"
        onChange={onChange}
        onEnter={onEnter}
      />
      <label className="grid gap-2" htmlFor="monthlyLoanSlider">
        <span className="flex items-center justify-between gap-3 text-[12px] text-[var(--soft)]">
          <span>€0</span>
          <span className="font-mono text-[13px] text-[var(--muted)]">{formatCurrency(safeValue, 0)} per maand</span>
          <span>€1.000</span>
        </span>
        <input
          id="monthlyLoanSlider"
          type="range"
          min="0"
          max="1000"
          step="25"
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus h-10 w-full accent-[var(--accent)]"
          aria-label="Lening per maand slider"
        />
      </label>
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
    monthsUntilDiploma: "Maanden tot diploma",
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

function fieldHint(field: keyof SimpleDuoValues) {
  const hints: Partial<Record<keyof SimpleDuoValues, string>> = {
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

export function FocusedDuoTool({ mode }: { mode: SimpleDuoToolMode }) {
  const copy = modeCopy[mode];
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { formValues, setFormValues, submittedValues, submit, reset } =
    useSubmittedCalculation<SimpleDuoValues>(defaultSimpleDuoValues(mode));
  const currentView = useMemo(() => createSimpleDuoView(mode, formValues), [formValues, mode]);
  const submittedView = submittedValues ? createSimpleDuoView(mode, submittedValues) : null;
  const mobileFlow = useMobileFieldFlow(copy.fields);

  function updateField<K extends keyof SimpleDuoValues>(field: K, value: SimpleDuoValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    if (currentView.isValid) {
      submit();
    }
  }

  async function handleDownloadPdf() {
    if (!submittedView?.isValid) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await downloadStudyStopPdfReport(submittedView.input, submittedView.result);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function renderField(field: keyof SimpleDuoValues, useMobileClass = true) {
    const fieldClassName = useMobileClass ? mobileFlow.getFieldClassName(field) : undefined;

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
          onChange={(value) => updateField(field, value)}
          onEnter={mobileFlow.handleEnterAdvance(field, false)}
          className={fieldClassName}
        />
      );
    }

    return (
      <Field
        key={field}
        id={field}
        label={fieldLabel(field)}
        value={formValues[field]}
        error={currentView.isValid ? undefined : currentView.errors[field]}
        hint={fieldHint(field)}
        prefix={field.includes("Debt") || field.startsWith("monthly") ? "€" : undefined}
        suffix={field === "monthsUntilDiploma" ? "maanden" : undefined}
        type={field === "calculationMonth" ? "month" : "number"}
        onChange={(value) => updateField(field, value)}
        onEnter={mobileFlow.handleEnterAdvance(field, false)}
        className={fieldClassName}
      />
    );
  }

  const selectedScenario = submittedView?.isValid
    ? mode === "stop-cost"
      ? submittedView.result.scenarios[0]
      : submittedView.result.scenarios[2]
    : undefined;

  const result = submittedView?.isValid ? (
    <div className="space-y-5">
      <section id="tool-result-summary" className="surface-panel space-y-4 p-5">
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
          />
          <ResultCard
            label="Totaal betalen incl. rente"
            value={formatCurrency(submittedView.focusScenario.totalPaid)}
            note={`Berekend vanaf start terugbetalen met SF35 over maximaal ${submittedView.focusScenario.repaymentTermYears} jaar.`}
          />
        </div>
        <div className="surface-subtle px-4">
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
            value={submittedView.focusScenario.payoffDate ?? "n.v.t."}
          />
          <ResultRow
            label="Altijd terug te betalen"
            value={formatCurrency(
              mode === "stop-cost"
                ? submittedView.result.scenarios[0].debtAtStop.alwaysRepayable
                : submittedView.result.scenarios[2].debtAtStop.alwaysRepayable,
            )}
          />
          {mode === "stop-cost" && selectedScenario ? (
            <>
              <ResultRow label="Basisbeurs blijft schuld" value={formatCurrency(selectedScenario.debtAtStop.basisbeurs)} />
              <ResultRow
                label="Aanvullende beurs blijft schuld"
                value={formatCurrency(selectedScenario.debtAtStop.aanvullendeBeurs)}
              />
              <ResultRow
                label="Studentenreisproduct blijft schuld"
                value={formatCurrency(selectedScenario.debtAtStop.reisproduct)}
              />
            </>
          ) : null}
        </div>
        <p className="text-[13px] leading-[1.7] text-[var(--soft)]">
          {submittedView.focusScenario.note}
        </p>
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={() => void handleDownloadPdf()}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download uitgebreid PDF-overzicht"}
        </ToolActionButton>
      </section>
    </div>
  ) : (
    <section id="tool-result-summary" className="surface-panel space-y-4 p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        Nog niet berekend
      </div>
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
        Vul alleen deze vraag in
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
          <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            {copy.intro}
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton type="button" variant="secondary" onClick={() => setFormValues(defaultSimpleDuoValues(mode))}>
            Voorbeeld invullen
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={() => setFormValues(emptySimpleDuoValues(mode))}>
            Leegmaken
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={() => reset("Invoer gewist.")}>
            Herstel
          </ToolActionButton>
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={() => void handleDownloadPdf()}
            disabled={!submittedView?.isValid || isDownloadingPdf}
          >
            {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download uitgebreid PDF-overzicht"}
          </ToolActionButton>
        </div>
      }
      inputs={
        <div className="space-y-4">
          {copy.fields.map((field) => renderField(field))}
          {copy.advancedFields ? (
            <details className="surface-subtle p-4">
              <summary className="cursor-pointer text-[13px] font-medium text-[var(--ink)]">
                Verder specificeren
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
