"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { getRepaymentRuleLabel } from "@/lib/copy-glossary";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import type { StudyStopCalculationResult } from "@/lib/duo/studeren-stoppen";
import type { StudyStopScenarioKey } from "@/lib/duo/studeren-stoppen";
import {
  buildStudyStopComparisonRows,
  createEmptyStudyStopValues,
  createStudyStopDefaultValues,
  createStudyStopView,
  mapStudyStopFormToInput,
  repaymentRuleOptions,
  studyLevelOptions,
  type StudyStopFormValues,
} from "./logic";
import { downloadStudyStopPdfReport } from "./report";

type InputFieldProps = {
  id: keyof StudyStopFormValues;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  type?: "text" | "number" | "month";
  min?: number | string;
  max?: number | string;
  step?: number | string;
  onChange: (value: string) => void;
  onEnter?: (event: KeyboardEvent) => void;
  className?: string;
};

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function formatStudyLevel(value: StudyStopFormValues["studyLevel"]) {
  return value === "mbo34" ? "Mbo 3/4" : value === "university" ? "Universiteit" : "Hbo";
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) {
    return value;
  }

  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function formatScenarioLabel(key: StudyStopScenarioKey) {
  if (key === "stop-now-no-diploma") {
    return "Stop nu, geen diploma";
  }
  if (key === "stop-now-later-diploma") {
    return "Stop nu, later diploma";
  }
  return "Doorstuderen tot diploma";
}

function TextField({
  id,
  label,
  value,
  error,
  hint,
  prefix,
  suffix,
  type = "text",
  min,
  max,
  step,
  onChange,
  onEnter,
  className,
}: InputFieldProps) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`.trim()} htmlFor={String(id)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-right text-[11px] leading-snug text-[var(--soft)]">{hint}</span> : null}
      </span>
      <span className="hair flex min-h-12 items-center rounded-md border bg-white px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
        <input
          id={String(id)}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
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

function SelectField({
  id,
  label,
  value,
  error,
  hint,
  options,
  onChange,
  onEnter,
  className,
}: {
  id: keyof StudyStopFormValues;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  options: Array<{ label: string; value: string }>;
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
      <span className="hair flex min-h-12 items-center rounded-md border bg-white px-3">
        <select
          id={String(id)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
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

function ToggleField({
  id,
  label,
  value,
  hint,
  onChange,
}: {
  id: keyof StudyStopFormValues;
  label: string;
  value: boolean;
  hint?: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-md border hair bg-white px-3 py-3" htmlFor={String(id)}>
      <span className="grid gap-1">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-[11px] leading-snug text-[var(--soft)]">{hint}</span> : null}
      </span>
      <input
        id={String(id)}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[var(--accent)]"
      />
    </label>
  );
}

function FieldSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-[14px] font-semibold text-[var(--ink)]">{title}</h3>
        <p className="text-[12px] leading-[1.6] text-[var(--soft)]">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ScenarioSummaryCard({
  result,
  selectedScenario,
  onSelectScenario,
}: {
  result: StudyStopCalculationResult;
  selectedScenario: StudyStopScenarioKey;
  onSelectScenario: (key: StudyStopScenarioKey) => void;
}) {
  const scenario = result.scenarios.find((entry) => entry.key === selectedScenario) ?? result.scenarios[0];
  if (!scenario) {
    return null;
  }

  return (
    <section className="rounded-xl border hair bg-white p-5 shadow-paper space-y-4">
      <div className="space-y-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Scenarioresultaat
        </div>
        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
          {scenario.title}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ResultRow label="Schuld op stopdatum" value={formatCurrency(scenario.debtAtStop.total)} />
        <ResultRow
          label="Schuld bij start aflossen"
          value={formatCurrency(scenario.debtAtRepaymentStart.total)}
        />
        <ResultRow
          label="Indicatief maandbedrag"
          value={formatCurrency(scenario.repayment.usedMonthlyPayment, 2)}
        />
        <ResultRow label="Schuldenvrij rond" value={scenario.repayment.payoffDate ?? "n.v.t."} />
        <ResultRow label="Totale rente" value={formatCurrency(scenario.repayment.totalInterest)} />
        <ResultRow label="Restschuld" value={formatCurrency(scenario.repayment.restschuld)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {result.scenarios.map((entry) => (
          <ToolActionButton
            key={entry.key}
            type="button"
            size="sm"
            variant={entry.key === selectedScenario ? "accent" : "secondary"}
            onClick={() => onSelectScenario(entry.key)}
          >
            {formatScenarioLabel(entry.key)}
          </ToolActionButton>
        ))}
      </div>
    </section>
  );
}

export default function DuoDoorlenenOfStoppenCalculator() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { formValues, setFormValues, submittedValues, submit, reset } =
    useSubmittedCalculation<StudyStopFormValues>(createStudyStopDefaultValues());
  const [selectedScenario, setSelectedScenario] =
    useState<StudyStopScenarioKey>("stop-now-no-diploma");
  const currentView = useMemo(() => createStudyStopView(formValues), [formValues]);
  const submittedView = submittedValues ? createStudyStopView(submittedValues) : null;
  const parsedPreview = useMemo(() => mapStudyStopFormToInput(formValues), [formValues]);
  const mobileFlow = useMobileFieldFlow([
    "calculationMonth",
    "studyLevel",
    "currentLoanDebt",
    "currentCollegegeldkredietDebt",
    "currentBasisbeursDebt",
    "currentAanvullendeBeursDebt",
    "currentReisproductDebt",
    "monthlyLoan",
    "monthlyCollegegeldkrediet",
    "monthlyBasisbeurs",
    "monthlyAanvullendeBeurs",
    "monthlyReisproduct",
    "monthsUntilLaterDiploma",
    "monthsUntilContinueDiploma",
    "remainingDiplomaTermMonths",
    "repaymentRule",
    "duoRateYear",
    "annualStudyInterestRate",
    "annualRepaymentInterestRate",
    "grossAnnualIncome",
    "partnerGrossAnnualIncome",
    "hasPartner",
    "oneTimeExtraRepayment",
    "monthlyExtraRepayment",
    "aflosvrijeMonths",
  ]);

  function updateField<K extends keyof StudyStopFormValues>(field: K, value: StudyStopFormValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
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

  function handleSubmit() {
    if (!currentView.isValid) {
      return;
    }

    submit();
    setSelectedScenario("stop-now-no-diploma");
  }

  const totalCurrentDebt =
    (parsedPreview.input.currentLoanDebt ?? 0) +
    (parsedPreview.input.currentCollegegeldkredietDebt ?? 0) +
    (parsedPreview.input.currentBasisbeursDebt ?? 0) +
    (parsedPreview.input.currentAanvullendeBeursDebt ?? 0) +
    (parsedPreview.input.currentReisproductDebt ?? 0);

  const resultContent = submittedView?.isValid ? (
    <div className="space-y-5">
      <section id="tool-result-summary" className="rounded-xl border hair bg-white p-5 shadow-paper space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Schuldenoverzicht
          </div>
          <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Hoofdresultaat
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ResultCard
            label="Totaal huidige schuld"
            value={formatCurrency(submittedView.result.currentBalances.total)}
          />
          <ResultCard
            label="Altijd terug te betalen"
            value={formatCurrency(submittedView.result.currentBalances.alwaysRepayable)}
          />
          <ResultCard
            label="Prestatiebeursdelen"
            value={formatCurrency(submittedView.result.currentBalances.prestatiebeurs)}
          />
          <ResultCard
            label="Indicatief maandbedrag"
            value={formatCurrency(
              submittedView.result.scenarios.find((entry) => entry.key === selectedScenario)?.repayment.usedMonthlyPayment ??
                submittedView.result.scenarios[0].repayment.usedMonthlyPayment,
              2,
            )}
          />
          <ResultCard
            label="Schuldenvrij rond"
            value={
              submittedView.result.scenarios.find((entry) => entry.key === selectedScenario)?.repayment.payoffDate ??
              submittedView.result.scenarios[0].repayment.payoffDate ??
              "n.v.t."
            }
          />
          <ResultCard label="Rekenregelversie" value={submittedView.result.ruleVersion} />
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolActionButton
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void handleDownloadPdf()}
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download uitgebreid PDF-overzicht"}
          </ToolActionButton>
        </div>
      </section>

      <ScenarioSummaryCard
        result={submittedView.result}
        selectedScenario={selectedScenario}
        onSelectScenario={setSelectedScenario}
      />

      <section className="rounded-xl border hair bg-white p-5 shadow-paper space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Vergelijking
          </div>
          <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Scenariovergelijking
          </h3>
        </div>
        <div className="overflow-x-auto rounded-lg border hair">
          <table className="min-w-[920px] w-full border-collapse text-left text-[13px]">
            <thead className="bg-[var(--paper-soft)] text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Scenario</th>
                <th className="px-4 py-3 font-medium">Schuld stopdatum</th>
                <th className="px-4 py-3 font-medium">Schuld start aflossen</th>
                <th className="px-4 py-3 font-medium">Maandbedrag</th>
                <th className="px-4 py-3 font-medium">Totale rente</th>
                <th className="px-4 py-3 font-medium">Restschuld</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hair)]">
              {buildStudyStopComparisonRows(submittedView.result).map((row) => (
                <tr key={row.key}>
                  <th className="px-4 py-3 align-top font-medium text-[var(--ink)]">
                    {row.label}
                    <span className="block pt-1 text-[12px] font-normal leading-[1.5] text-[var(--soft)]">
                      {row.note}
                    </span>
                  </th>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(row.debtAtStop)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(row.debtAtRepaymentStart)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(row.usedMonthlyPayment, 2)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(row.totalInterest)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(row.restschuld)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border hair bg-white p-5 shadow-paper space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Maandelijkse simulatie
          </div>
          <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Tijdlijn
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {submittedView.result.scenarios.map((entry) => (
            <ToolActionButton
              key={entry.key}
              type="button"
              size="sm"
              variant={entry.key === selectedScenario ? "accent" : "secondary"}
              onClick={() => setSelectedScenario(entry.key)}
            >
              {formatScenarioLabel(entry.key)}
            </ToolActionButton>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border hair">
          <table className="min-w-[1100px] w-full border-collapse text-left text-[12px]">
            <thead className="bg-[var(--paper-soft)] text-[11px] uppercase tracking-[0.04em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Maand</th>
                <th className="px-4 py-3 font-medium">Fase</th>
                <th className="px-4 py-3 font-medium">Begin</th>
                <th className="px-4 py-3 font-medium">Rente</th>
                <th className="px-4 py-3 font-medium">Studie-opbouw</th>
                <th className="px-4 py-3 font-medium">Gift</th>
                <th className="px-4 py-3 font-medium">Betaling</th>
                <th className="px-4 py-3 font-medium">Einde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hair)]">
              {(submittedView.result.scenarios.find((entry) => entry.key === selectedScenario)?.timeline ??
                submittedView.result.scenarios[0].timeline).map((point) => (
                <tr key={`${point.month}-${point.date}`}>
                  <td className="px-4 py-3 font-mono tabular">{point.date}</td>
                  <td className="px-4 py-3">{point.phase}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(point.openingDebt, 2)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(point.interest, 2)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(point.studyAdditions, 2)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(point.giftConversion, 2)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(point.payment, 2)}</td>
                  <td className="px-4 py-3 font-mono tabular">{formatCurrency(point.closingDebt, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <DisclosureSection title="Toegepaste DUO-regels" subtitle="Wat deze berekening expliciet meeneemt.">
        <ul className="space-y-2 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          {submittedView.result.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
          {submittedView.result.assumptions.map((assumption) => (
            <li key={assumption}>• {assumption}</li>
          ))}
        </ul>
      </DisclosureSection>

      <DisclosureSection title="Bronnen" subtitle="Officiële DUO-bronnen en de consultatiegegevens.">
        <div className="space-y-4 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          {submittedView.result.sources.map((source) => (
            <div key={source.key} className="rounded-md border hair bg-white p-4">
              <div className="font-medium text-[var(--ink)]">{source.title}</div>
              <div className="text-[12px] text-[var(--soft)]">
                {source.organization} · {source.consultedAt} · {source.validityDate}
              </div>
              <div className="mt-2 text-[13px]">{source.appliesTo}</div>
              <div className="mt-2 text-[12px] text-[var(--soft)]">
                Regeling: {source.regulation} · Versie: {source.ruleVersion}
              </div>
              <div className="mt-2 text-[12px] text-[var(--soft)]">
                Onzekerheden: {source.uncertainties.join(" ")}
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-[13px] text-[var(--accent)] underline decoration-dotted underline-offset-4"
              >
                {source.url}
              </a>
            </div>
          ))}
        </div>
      </DisclosureSection>
    </div>
  ) : (
    <section id="tool-result-summary" className="rounded-xl border hair bg-white p-5 shadow-paper space-y-4">
      <div className="space-y-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Samenvatting vóór berekenen
        </div>
        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Controleer je invoer
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultRow label="Berekeningsmaand" value={formatMonth(formValues.calculationMonth)} />
        <ResultRow label="Opleidingsniveau" value={formatStudyLevel(formValues.studyLevel)} />
        <ResultRow label="Totaal huidige schuld" value={formatCurrency(totalCurrentDebt)} />
        <ResultRow
          label="Prestatiebeursdelen"
          value={formatCurrency(
            (parsedPreview.input.currentBasisbeursDebt ?? 0) +
              (parsedPreview.input.currentAanvullendeBeursDebt ?? 0) +
              (parsedPreview.input.currentReisproductDebt ?? 0),
          )}
        />
        <ResultRow
          label="Terugbetalingsregel"
          value={formValues.repaymentRule}
        />
        <ResultRow
          label="Studie- en terugbetalingsrente"
          value={
            formValues.annualStudyInterestRate.trim().length > 0 ||
            formValues.annualRepaymentInterestRate.trim().length > 0
              ? `${formValues.annualStudyInterestRate || "DUO"} / ${formValues.annualRepaymentInterestRate || "DUO"}`
              : "DUO-rentejaar"
          }
        />
      </div>
      <p className="text-[13px] leading-[1.7] text-[var(--soft)]">
        Controleer vooral de bedragen uit Mijn DUO, je diplomatermijn en het gekozen scenario.
        Daarna wordt de maandelijkse simulatie op dezelfde centrale rekenlaag doorgerekend.
      </p>
    </section>
  );

  const inputs = (
    <div className="space-y-6">
      <FieldSection
        title="Huidige schuld"
        subtitle="Neem de openstaande bedragen één op één over uit Mijn DUO."
      >
        <p className="text-[12px] leading-[1.6] text-[var(--soft)]">
          In Mijn DUO vind je deze bedragen onder je studieschuld en bij de specificatie per
          onderdeel. De prestatiebeursdelen volgen we afzonderlijk, zodat duidelijk blijft wat
          altijd terugbetaald moet worden en wat later gift kan worden.
        </p>
        <TextField
          id="calculationMonth"
          label="Berekeningsmaand"
          value={formValues.calculationMonth}
          error={currentView.isValid ? undefined : currentView.errors.calculationMonth}
          hint="Maand waarin je de situatie bekijkt"
          type="month"
          onChange={(value) => updateField("calculationMonth", value)}
          onEnter={mobileFlow.handleEnterAdvance("calculationMonth", false)}
          className={mobileFlow.getFieldClassName("calculationMonth")}
        />
        <SelectField
          id="studyLevel"
          label="Opleidingssoort"
          value={formValues.studyLevel}
          error={currentView.isValid ? undefined : currentView.errors.studyLevel}
          hint="Bepaalt de diplomatermijn"
          options={studyLevelOptions}
          onChange={(value) => updateField("studyLevel", value as StudyStopFormValues["studyLevel"])}
          className={mobileFlow.getFieldClassName("studyLevel")}
        />
        <TextField
          id="currentLoanDebt"
          label="Rentedragende lening"
          value={formValues.currentLoanDebt}
          error={currentView.isValid ? undefined : currentView.errors.currentLoanDebt}
          hint="Openstaand bedrag bij DUO"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("currentLoanDebt", value)}
          onEnter={mobileFlow.handleEnterAdvance("currentLoanDebt", false)}
          className={mobileFlow.getFieldClassName("currentLoanDebt")}
        />
        <TextField
          id="currentCollegegeldkredietDebt"
          label="Collegegeldkrediet"
          value={formValues.currentCollegegeldkredietDebt}
          error={currentView.isValid ? undefined : currentView.errors.currentCollegegeldkredietDebt}
          hint="Openstaand bedrag bij DUO"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("currentCollegegeldkredietDebt", value)}
          onEnter={mobileFlow.handleEnterAdvance("currentCollegegeldkredietDebt", false)}
          className={mobileFlow.getFieldClassName("currentCollegegeldkredietDebt")}
        />
        <TextField
          id="currentBasisbeursDebt"
          label="Basisbeurs"
          value={formValues.currentBasisbeursDebt}
          error={currentView.isValid ? undefined : currentView.errors.currentBasisbeursDebt}
          hint="Prestatiebeursdeel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("currentBasisbeursDebt", value)}
          onEnter={mobileFlow.handleEnterAdvance("currentBasisbeursDebt", false)}
          className={mobileFlow.getFieldClassName("currentBasisbeursDebt")}
        />
        <TextField
          id="currentAanvullendeBeursDebt"
          label="Aanvullende beurs"
          value={formValues.currentAanvullendeBeursDebt}
          error={currentView.isValid ? undefined : currentView.errors.currentAanvullendeBeursDebt}
          hint="Prestatiebeursdeel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("currentAanvullendeBeursDebt", value)}
          onEnter={mobileFlow.handleEnterAdvance("currentAanvullendeBeursDebt", false)}
          className={mobileFlow.getFieldClassName("currentAanvullendeBeursDebt")}
        />
        <TextField
          id="currentReisproductDebt"
          label="Studentenreisproduct"
          value={formValues.currentReisproductDebt}
          error={currentView.isValid ? undefined : currentView.errors.currentReisproductDebt}
          hint="Prestatiebeursdeel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("currentReisproductDebt", value)}
          onEnter={mobileFlow.handleEnterAdvance("currentReisproductDebt", false)}
          className={mobileFlow.getFieldClassName("currentReisproductDebt")}
        />
      </FieldSection>

      <DisclosureSection
        title="Waar vind ik dit in Mijn DUO?"
        subtitle="Kleine toelichting bij de onderdelen die je moet overnemen."
      >
        <p className="text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Open je studiefinanciering en noteer per onderdeel de openstaande bedragen. Lening en
          collegegeldkrediet horen bij de altijd terug te betalen schuld. Basisbeurs, aanvullende
          beurs en studentenreisproduct volgen we apart omdat die bij een diploma op tijd mogelijk
          een gift worden.
        </p>
      </DisclosureSection>

      <FieldSection
        title="Maandelijkse opbouw"
        subtitle="Gebruik dit als je wilt zien wat doorgaan met studeren per maand toevoegt."
      >
        <TextField
          id="monthlyLoan"
          label="Lening per maand"
          value={formValues.monthlyLoan}
          error={currentView.isValid ? undefined : currentView.errors.monthlyLoan}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("monthlyLoan", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthlyLoan", false)}
          className={mobileFlow.getFieldClassName("monthlyLoan")}
        />
        <TextField
          id="monthlyCollegegeldkrediet"
          label="Collegegeldkrediet per maand"
          value={formValues.monthlyCollegegeldkrediet}
          error={currentView.isValid ? undefined : currentView.errors.monthlyCollegegeldkrediet}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("monthlyCollegegeldkrediet", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthlyCollegegeldkrediet", false)}
          className={mobileFlow.getFieldClassName("monthlyCollegegeldkrediet")}
        />
        <TextField
          id="monthlyBasisbeurs"
          label="Basisbeurs per maand"
          value={formValues.monthlyBasisbeurs}
          error={currentView.isValid ? undefined : currentView.errors.monthlyBasisbeurs}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("monthlyBasisbeurs", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthlyBasisbeurs", false)}
          className={mobileFlow.getFieldClassName("monthlyBasisbeurs")}
        />
        <TextField
          id="monthlyAanvullendeBeurs"
          label="Aanvullende beurs per maand"
          value={formValues.monthlyAanvullendeBeurs}
          error={currentView.isValid ? undefined : currentView.errors.monthlyAanvullendeBeurs}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("monthlyAanvullendeBeurs", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthlyAanvullendeBeurs", false)}
          className={mobileFlow.getFieldClassName("monthlyAanvullendeBeurs")}
        />
        <TextField
          id="monthlyReisproduct"
          label="Studentenreisproduct per maand"
          value={formValues.monthlyReisproduct}
          error={currentView.isValid ? undefined : currentView.errors.monthlyReisproduct}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("monthlyReisproduct", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthlyReisproduct", false)}
          className={mobileFlow.getFieldClassName("monthlyReisproduct")}
        />
      </FieldSection>

      <FieldSection
        title="Scenario en timing"
        subtitle="Hiermee kies je welke vergelijking je wilt maken."
      >
        <TextField
          id="monthsUntilLaterDiploma"
          label="Maanden tot later diploma"
          value={formValues.monthsUntilLaterDiploma}
          error={currentView.isValid ? undefined : currentView.errors.monthsUntilLaterDiploma}
          hint="Scenario 2"
          type="number"
          step="1"
          min="0"
          onChange={(value) => updateField("monthsUntilLaterDiploma", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthsUntilLaterDiploma", false)}
          className={mobileFlow.getFieldClassName("monthsUntilLaterDiploma")}
        />
        <TextField
          id="monthsUntilContinueDiploma"
          label="Maanden extra studeren"
          value={formValues.monthsUntilContinueDiploma}
          error={currentView.isValid ? undefined : currentView.errors.monthsUntilContinueDiploma}
          hint="Scenario 3"
          type="number"
          step="1"
          min="0"
          onChange={(value) => updateField("monthsUntilContinueDiploma", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthsUntilContinueDiploma", false)}
          className={mobileFlow.getFieldClassName("monthsUntilContinueDiploma")}
        />
        <TextField
          id="remainingDiplomaTermMonths"
          label="Diplomatermijn in maanden"
          value={formValues.remainingDiplomaTermMonths}
          error={currentView.isValid ? undefined : currentView.errors.remainingDiplomaTermMonths}
          hint="Meestal 120 maanden"
          type="number"
          step="1"
          min="0"
          onChange={(value) => updateField("remainingDiplomaTermMonths", value)}
          onEnter={mobileFlow.handleEnterAdvance("remainingDiplomaTermMonths", false)}
          className={mobileFlow.getFieldClassName("remainingDiplomaTermMonths")}
        />
        <SelectField
          id="repaymentRule"
          label="Terugbetalingsregel"
          value={formValues.repaymentRule}
          error={currentView.isValid ? undefined : currentView.errors.repaymentRule}
          hint="Welke DUO-regel hoort bij je schuld?"
          options={repaymentRuleOptions.map((option) => ({
            label: getRepaymentRuleLabel(option),
            value: option,
          }))}
          onChange={(value) => updateField("repaymentRule", value as StudyStopFormValues["repaymentRule"])}
          className={mobileFlow.getFieldClassName("repaymentRule")}
        />
        <TextField
          id="duoRateYear"
          label="DUO-rentejaar"
          value={formValues.duoRateYear}
          error={currentView.isValid ? undefined : currentView.errors.duoRateYear}
          hint="Laatste 5 jaar"
          type="number"
          step="1"
          min="0"
          onChange={(value) => updateField("duoRateYear", value)}
          onEnter={mobileFlow.handleEnterAdvance("duoRateYear", false)}
          className={mobileFlow.getFieldClassName("duoRateYear")}
        />
      </FieldSection>

      <FieldSection
        title="Rente en aflossen"
        subtitle="Optioneel: een eigen renteaannname, inkomensindicatie en extra aflossing."
      >
        <TextField
          id="annualStudyInterestRate"
          label="Studierente"
          value={formValues.annualStudyInterestRate}
          error={currentView.isValid ? undefined : currentView.errors.annualStudyInterestRate}
          hint="Laat leeg voor DUO-rentejaar"
          suffix="%"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("annualStudyInterestRate", value)}
          onEnter={mobileFlow.handleEnterAdvance("annualStudyInterestRate", false)}
          className={mobileFlow.getFieldClassName("annualStudyInterestRate")}
        />
        <TextField
          id="annualRepaymentInterestRate"
          label="Terugbetalingsrente"
          value={formValues.annualRepaymentInterestRate}
          error={currentView.isValid ? undefined : currentView.errors.annualRepaymentInterestRate}
          hint="Laat leeg voor DUO-rentejaar"
          suffix="%"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("annualRepaymentInterestRate", value)}
          onEnter={mobileFlow.handleEnterAdvance("annualRepaymentInterestRate", false)}
          className={mobileFlow.getFieldClassName("annualRepaymentInterestRate")}
        />
        <TextField
          id="grossAnnualIncome"
          label="Toetsingsinkomen"
          value={formValues.grossAnnualIncome}
          error={currentView.isValid ? undefined : currentView.errors.grossAnnualIncome}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("grossAnnualIncome", value)}
          onEnter={mobileFlow.handleEnterAdvance("grossAnnualIncome", false)}
          className={mobileFlow.getFieldClassName("grossAnnualIncome")}
        />
        <TextField
          id="partnerGrossAnnualIncome"
          label="Partnerinkomen"
          value={formValues.partnerGrossAnnualIncome}
          error={currentView.isValid ? undefined : currentView.errors.partnerGrossAnnualIncome}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("partnerGrossAnnualIncome", value)}
          onEnter={mobileFlow.handleEnterAdvance("partnerGrossAnnualIncome", false)}
          className={mobileFlow.getFieldClassName("partnerGrossAnnualIncome")}
        />
        <ToggleField
          id="hasPartner"
          label="Met partner"
          value={formValues.hasPartner}
          hint="Gebruikt DUO voor draagkrachtindicatie"
          onChange={(value) => updateField("hasPartner", value)}
        />
        <TextField
          id="oneTimeExtraRepayment"
          label="Eenmalige extra aflossing"
          value={formValues.oneTimeExtraRepayment}
          error={currentView.isValid ? undefined : currentView.errors.oneTimeExtraRepayment}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("oneTimeExtraRepayment", value)}
          onEnter={mobileFlow.handleEnterAdvance("oneTimeExtraRepayment", false)}
          className={mobileFlow.getFieldClassName("oneTimeExtraRepayment")}
        />
        <TextField
          id="monthlyExtraRepayment"
          label="Extra aflossing per maand"
          value={formValues.monthlyExtraRepayment}
          error={currentView.isValid ? undefined : currentView.errors.monthlyExtraRepayment}
          hint="Optioneel"
          prefix="€"
          type="number"
          step="0.01"
          min="0"
          onChange={(value) => updateField("monthlyExtraRepayment", value)}
          onEnter={mobileFlow.handleEnterAdvance("monthlyExtraRepayment", false)}
          className={mobileFlow.getFieldClassName("monthlyExtraRepayment")}
        />
        <TextField
          id="aflosvrijeMonths"
          label="Aflosvrije periode"
          value={formValues.aflosvrijeMonths}
          error={currentView.isValid ? undefined : currentView.errors.aflosvrijeMonths}
          hint="Max. 60 maanden"
          type="number"
          step="1"
          min="0"
          onChange={(value) => updateField("aflosvrijeMonths", value)}
          onEnter={mobileFlow.handleEnterAdvance("aflosvrijeMonths", false)}
          className={mobileFlow.getFieldClassName("aflosvrijeMonths")}
        />
      </FieldSection>

      <div className="flex flex-wrap gap-2">
        <ToolActionButton type="button" variant="secondary" onClick={() => setFormValues(createStudyStopDefaultValues())}>
          Voorbeeld invullen
        </ToolActionButton>
        <ToolActionButton type="button" variant="secondary" onClick={() => setFormValues(createEmptyStudyStopValues())}>
          Leegmaken
        </ToolActionButton>
      </div>
      <MobileFieldFlowControls
        current={mobileFlow.activeIndex + 1}
        total={mobileFlow.total}
        onPrev={mobileFlow.goPrev}
        onNext={mobileFlow.goNext}
        canGoPrev={mobileFlow.canGoPrev}
        canGoNext={mobileFlow.canGoNext}
        canComplete={currentView.isValid}
        onComplete={handleSubmit}
        completeLabel="Bereken scenario's"
      />
    </div>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Studieschuld
          </div>
          <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Studeren stoppen en DUO
          </h2>
          <p className="mt-3 max-w-[60ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Bekijk wat nu stoppen, later alsnog een diploma halen of doorstuderen tot diploma
            financieel betekent. De berekening houdt lening, collegegeldkrediet, basisbeurs,
            aanvullende beurs en studentenreisproduct apart bij en toont per scenario wanneer je
            schuldvrij bent.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton type="button" variant="secondary" onClick={() => setFormValues(createStudyStopDefaultValues())}>
            Voorbeeld invullen
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={() => reset("Invoer gewist.")}>
            Wis invoer
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
      inputs={inputs}
      submitAction={
        <ToolActionButton type="button" onClick={handleSubmit} disabled={!currentView.isValid}>
          Bereken scenario&apos;s
        </ToolActionButton>
      }
      result={resultContent}
      disclaimer={
        <p className="text-[12px] leading-[1.7] text-[var(--soft)]">
          Deze tool gebruikt centrale DUO-regels en bronmetadata. Controleer altijd Mijn DUO voor
          je actuele bedragen, rente en diplomatermijn.
        </p>
      }
    />
  );
}
