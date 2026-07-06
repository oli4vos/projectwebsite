"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import {
  calculateDuoLoanProjectionView,
  createDuoLoanProjectionDefaultValues,
  createEmptyDuoLoanProjectionValues,
  createFutureLoanMonthOptions,
  createStoppedBorrowingMonthOptions,
  getCurrentYearMonth,
  updateDuoLoanProjectionLoanStatus,
  type DuoLoanProjectionComparisonRow,
  type DuoLoanProjectionFormValues,
  type DuoLoanProjectionLoanStatus,
  type DuoLoanProjectionMonthOption,
} from "./logic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyPrecise(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatYearMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) {
    return value;
  }

  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function parseSliderValue(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

type InputFieldProps = {
  id: keyof DuoLoanProjectionFormValues;
  label: string;
  value: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  type?: "number" | "month";
  min?: number | string;
  max?: number | string;
  step?: number | string;
  hint?: string;
  onChange: (value: string) => void;
  onEnter?: (event: KeyboardEvent) => void;
};

function InputField({
  id,
  label,
  value,
  error,
  prefix,
  suffix,
  type = "number",
  min,
  max,
  step,
  hint,
  onChange,
  onEnter,
}: InputFieldProps) {
  return (
    <label className="block" htmlFor={String(id)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? (
          <span className="text-right text-[11px] leading-snug text-[var(--soft)]">
            {hint}
          </span>
        ) : null}
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

function ComparisonTable({
  rows,
  showMortgageImpact,
}: {
  rows: DuoLoanProjectionComparisonRow[];
  showMortgageImpact: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border hair bg-white">
      <table className="min-w-full border-collapse text-left text-[13px]">
        <thead className="bg-[var(--paper-soft)] text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Scenario</th>
            <th className="px-4 py-3 font-medium">Schuld start aflossen</th>
            <th className="px-4 py-3 font-medium">DUO-maandtermijn</th>
            <th className="px-4 py-3 font-medium">Totaal terugbetalen</th>
            {showMortgageImpact ? (
              <th className="px-4 py-3 font-medium">Minder hypotheekruimte</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--hair)]">
          {rows.map((row) => (
            <tr key={row.key}>
              <th className="px-4 py-3 align-top font-medium text-[var(--ink)]">
                {row.label}
                <span className="block pt-1 text-[12px] font-normal leading-[1.5] text-[var(--soft)]">
                  {row.note}
                </span>
              </th>
              <td className="px-4 py-3 align-top font-mono tabular">
                {formatCurrency(row.debtAtRepaymentStart)}
              </td>
              <td className="px-4 py-3 align-top font-mono tabular">
                {formatCurrencyPrecise(row.theoreticalMonthlyPayment)}
              </td>
              <td className="px-4 py-3 align-top font-mono tabular">
                {formatCurrency(row.totalRepayment)}
              </td>
              {showMortgageImpact ? (
                <td className="px-4 py-3 align-top font-mono tabular">
                  {row.mortgageCapacityReduction === undefined
                    ? "n.v.t."
                    : formatCurrency(row.mortgageCapacityReduction)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthChoiceButtons({
  options,
  value,
  onChange,
}: {
  options: DuoLoanProjectionMonthOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <ToolActionButton
            key={option.value}
            type="button"
            size="sm"
            aria-pressed={selected}
            className={
              selected
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                : undefined
            }
            onClick={() => onChange(option.value)}
          >
            <span className="grid text-left leading-tight">
              <span>{option.label}</span>
              <span className="text-[11px] font-normal text-[var(--soft)]">
                {formatYearMonth(option.value)}
              </span>
            </span>
          </ToolActionButton>
        );
      })}
    </div>
  );
}

export default function DuoDoorlenenOfStoppenCalculator() {
  const calculationMonth = useMemo(() => getCurrentYearMonth(), []);
  const [formValues, setFormValues] = useState<DuoLoanProjectionFormValues>(() =>
    createDuoLoanProjectionDefaultValues(calculationMonth),
  );
  const futureLoanMonthOptions = useMemo(
    () => createFutureLoanMonthOptions(calculationMonth),
    [calculationMonth],
  );
  const stoppedBorrowingMonthOptions = useMemo(
    () => createStoppedBorrowingMonthOptions(calculationMonth),
    [calculationMonth],
  );
  const fieldIds = useMemo<Array<keyof DuoLoanProjectionFormValues>>(
    () =>
      formValues.loanStatus === "already-stopped"
        ? ["currentDebt", "loanStatus", "stoppedBorrowingMonth"]
        : ["currentDebt", "loanStatus", "monthlyLoanAmount", "expectedLastLoanMonth"],
    [formValues.loanStatus],
  );
  const view = useMemo(
    () => calculateDuoLoanProjectionView(formValues, calculationMonth),
    [formValues, calculationMonth],
  );
  const fieldFlow = useMobileFieldFlow(fieldIds);
  const sliderValue = Math.min(
    view.slider.max,
    Math.max(view.slider.min, parseSliderValue(formValues.monthlyLoanAmount)),
  );

  function updateField<K extends keyof DuoLoanProjectionFormValues>(
    field: K,
    value: DuoLoanProjectionFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyScenario(monthlyLoanAmount: string) {
    setFormValues((current) => ({
      ...current,
      loanStatus: "still-borrowing",
      monthlyLoanAmount,
    }));
  }

  function setLoanStatus(loanStatus: DuoLoanProjectionLoanStatus) {
    setFormValues((current) =>
      updateDuoLoanProjectionLoanStatus(current, loanStatus, calculationMonth),
    );
  }

  const inputs = (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-3 text-[13px] leading-[1.6] text-[var(--muted)]">
        Rekenmaand: <strong className="text-[var(--ink)]">{formatYearMonth(calculationMonth)}</strong>.
        De laatste leenmaand telt inclusief mee.
      </div>

      <div className={fieldFlow.getFieldClassName("currentDebt")}>
        <InputField
          id="currentDebt"
          label="Huidige studieschuld"
          value={formValues.currentDebt}
          error={view.errors.currentDebt}
          prefix="€"
          min={0}
          step={100}
          hint="Openstaand bedrag bij DUO"
          onChange={(value) => updateField("currentDebt", value)}
          onEnter={fieldFlow.handleEnterAdvance("currentDebt", Boolean(view.errors.currentDebt))}
        />
      </div>

      <div className={fieldFlow.getFieldClassName("loanStatus")}>
        <div className="grid gap-2">
          <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
            Leen je nu nog bij DUO?
          </span>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Leenstatus">
            {[
              {
                value: "still-borrowing" as const,
                label: "Ik leen nog",
                helper: "Vergelijk doorlenen met stoppen vanaf nu.",
              },
              {
                value: "already-stopped" as const,
                label: "Ik leen niet meer",
                helper: "Bereken vanaf je huidige schuld zonder nieuwe opname.",
              },
            ].map((option) => {
              const selected = formValues.loanStatus === option.value;

              return (
                <ToolActionButton
                  key={option.value}
                  type="button"
                  size="md"
                  aria-pressed={selected}
                  className={
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                      : undefined
                  }
                  onClick={() => setLoanStatus(option.value)}
                >
                  <span className="grid text-left leading-tight">
                    <span>{option.label}</span>
                    <span className="text-[11px] font-normal text-[var(--soft)]">
                      {option.helper}
                    </span>
                  </span>
                </ToolActionButton>
              );
            })}
          </div>
          <FieldError message={view.errors.loanStatus} />
        </div>
      </div>

      {formValues.loanStatus === "still-borrowing" ? (
        <div className={fieldFlow.getFieldClassName("monthlyLoanAmount")}>
        <div className="grid gap-3">
          <InputField
            id="monthlyLoanAmount"
            label="Maandelijkse opname"
            value={formValues.monthlyLoanAmount}
            error={view.errors.monthlyLoanAmount}
            prefix="€"
            min={view.slider.min}
            max={view.slider.max}
            step={view.slider.step}
            hint={`Max ${formatCurrencyPrecise(view.slider.max)} per maand`}
            onChange={(value) => updateField("monthlyLoanAmount", value)}
            onEnter={fieldFlow.handleEnterAdvance(
              "monthlyLoanAmount",
              Boolean(view.errors.monthlyLoanAmount),
            )}
          />
          <input
            type="range"
            min={view.slider.min}
            max={view.slider.max}
            step={view.slider.step}
            value={sliderValue}
            onChange={(event) => updateField("monthlyLoanAmount", event.target.value)}
            className="w-full accent-[var(--accent)]"
            aria-label="Maandelijkse opname als slider"
          />
          <div className="flex flex-wrap gap-2">
            {[
              ["Stoppen", "0"],
              ["€300", "300"],
              ["€600", "600"],
              ["Max", String(view.slider.max)],
            ].map(([label, amount]) => (
              <ToolActionButton
                key={label}
                type="button"
                size="sm"
                onClick={() => applyScenario(amount)}
              >
                {label}
              </ToolActionButton>
            ))}
          </div>
        </div>
      </div>
      ) : null}

      {formValues.loanStatus === "still-borrowing" ? (
        <div className={fieldFlow.getFieldClassName("expectedLastLoanMonth")}>
          <div className="grid gap-3">
            <div>
              <span className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
                  Hoe lang verwacht je nog te lenen?
                </span>
                <span className="text-right text-[11px] leading-snug text-[var(--soft)]">
                  Geen typen nodig
                </span>
              </span>
              <MonthChoiceButtons
                options={futureLoanMonthOptions}
                value={formValues.expectedLastLoanMonth}
                onChange={(value) => updateField("expectedLastLoanMonth", value)}
              />
            </div>
            <InputField
              id="expectedLastLoanMonth"
              label="Of kies zelf de laatste leenmaand"
              value={formValues.expectedLastLoanMonth}
              error={view.errors.expectedLastLoanMonth}
              type="month"
              hint="Niet vóór de rekenmaand"
              onChange={(value) => updateField("expectedLastLoanMonth", value)}
              onEnter={fieldFlow.handleEnterAdvance(
                "expectedLastLoanMonth",
                Boolean(view.errors.expectedLastLoanMonth),
              )}
            />
          </div>
        </div>
      ) : (
        <div className={fieldFlow.getFieldClassName("stoppedBorrowingMonth")}>
          <div className="grid gap-3">
            <div>
              <span className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
                  Vanaf wanneer leen je niet meer?
                </span>
                <span className="text-right text-[11px] leading-snug text-[var(--soft)]">
                  Kies snel of zelf
                </span>
              </span>
              <MonthChoiceButtons
                options={stoppedBorrowingMonthOptions}
                value={formValues.stoppedBorrowingMonth}
                onChange={(value) => updateField("stoppedBorrowingMonth", value)}
              />
            </div>
            <InputField
              id="stoppedBorrowingMonth"
              label="Of kies zelf de stopmaand"
              value={formValues.stoppedBorrowingMonth}
              error={view.errors.stoppedBorrowingMonth}
              type="month"
              max={calculationMonth}
              hint="Niet in de toekomst"
              onChange={(value) => updateField("stoppedBorrowingMonth", value)}
              onEnter={fieldFlow.handleEnterAdvance(
                "stoppedBorrowingMonth",
                Boolean(view.errors.stoppedBorrowingMonth),
              )}
            />
          </div>
        </div>
      )}

      <MobileFieldFlowControls
        current={fieldFlow.activeIndex + 1}
        total={fieldFlow.total}
        canGoPrev={fieldFlow.canGoPrev}
        canGoNext={fieldFlow.canGoNext}
        onPrev={fieldFlow.goPrev}
        onNext={fieldFlow.goNext}
        onComplete={() => {
          document.getElementById("tool-result-summary")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        completeLabel="Bekijk projectie"
      />

      <label className="flex items-start gap-3 rounded-xl border border-[var(--hair)] bg-white p-3 text-[13px] leading-[1.55] text-[var(--muted)]">
        <input
          type="checkbox"
          checked={formValues.includeMortgageImpact}
          onChange={(event) => updateField("includeMortgageImpact", event.target.checked)}
          className="mt-1 size-4 accent-[var(--accent)]"
        />
        <span>
          <strong className="block text-[var(--ink)]">Toon indicatieve hypotheekimpact</strong>
          Vergelijk hoeveel extra DUO-maandtermijn indicatief kan drukken op je
          maximale hypotheekruimte. Dit is geen hypotheekadvies.
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={() => setFormValues(createDuoLoanProjectionDefaultValues(calculationMonth))}
        >
          Voorbeeldwaarden
        </ToolActionButton>
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={() => setFormValues(createEmptyDuoLoanProjectionValues())}
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
          label="Totale schuld bij start aflossen"
          value={formatCurrency(view.keepBorrowing.debtAtRepaymentStart)}
          note={
            view.loanStatus === "already-stopped"
              ? `Gebaseerd op je huidige schuld en rente tot ${formatYearMonth(
                  view.keepBorrowing.repaymentStartMonth,
                )}.`
              : `Na ${view.keepBorrowing.borrowingMonths} leenmaand(en), aanloopfase en rente.`
          }
          tone="warn"
        />
        <ResultCard
          label="Theoretische DUO-maandtermijn"
          value={formatCurrencyPrecise(view.keepBorrowing.theoreticalMonthlyPayment)}
          note="Annuïtaire betaling over 35 jaar, vóór eventuele draagkrachtverlaging."
        />
        <ResultCard
          label="Totaal terugbetalen"
          value={formatCurrency(view.keepBorrowing.totalRepayment)}
          note="Maandtermijn x volledige SF35-looptijd; indicatief en vóór draagkrachttoets."
        />
      </div>

      <section className="rounded-xl border hair bg-white p-5 shadow-paper">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
          Uitkomst in stappen
        </h2>
        <div className="mt-3">
          <ResultRow
            label="Leenmaanden"
            value={`${formatNumber(view.keepBorrowing.borrowingMonths)} maanden`}
            sub={
              view.loanStatus === "already-stopped"
                ? `Je hebt aangegeven dat je gestopt bent sinds ${formatYearMonth(
                    view.stoppedBorrowingMonth ?? view.calculationMonth,
                  )}.`
                : `Tot en met ${formatYearMonth(view.keepBorrowing.lastLoanMonth)}.`
            }
          />
          <ResultRow
            label="Nieuwe hoofdsom door lenen"
            value={formatCurrency(view.keepBorrowing.futurePrincipalBorrowed)}
            breakdown={
              <p>
                Maandelijkse opname {formatCurrencyPrecise(view.input.monthlyLoanAmount)} x{" "}
                {view.keepBorrowing.borrowingMonths} maanden.
              </p>
            }
          />
          <ResultRow
            label="Rente tijdens leenfase"
            value={formatCurrencyPrecise(view.keepBorrowing.interestDuringBorrowingPhase)}
            sub={`Aanname: ${view.keepBorrowing.projectedAnnualInterestRate}% DUO-rente.`}
          />
          <ResultRow
            label="Schuld na laatste leenmaand"
            value={formatCurrency(view.keepBorrowing.debtAtLastLoanMonth)}
          />
          <ResultRow
            label="Start aflosfase"
            value={formatYearMonth(view.keepBorrowing.repaymentStartMonth)}
            sub={`Aanloopfase: ${view.keepBorrowing.gracePeriodMonths} maanden.`}
          />
          <ResultRow
            label="Rente tijdens aanloopfase"
            value={formatCurrencyPrecise(view.keepBorrowing.interestDuringGracePeriod)}
          />
          <ResultRow
            label="Totale schuld bij start aflossen"
            value={formatCurrency(view.keepBorrowing.debtAtRepaymentStart)}
            sub="Dit is de schuld waarmee de theoretische terugbetaling start."
            strong
          />
          <ResultRow
            label="Totaal terugbetalen bij vaste termijn"
            value={formatCurrency(view.keepBorrowing.totalRepayment)}
            sub={`Theoretisch: ${view.keepBorrowing.repaymentTermMonths} maanden x ${formatCurrencyPrecise(
              view.keepBorrowing.theoreticalMonthlyPayment,
            )}.`}
          />
          <ResultRow
            label="Waarvan rente vanaf start aflossen"
            value={formatCurrency(view.keepBorrowing.totalInterest)}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border hair bg-white p-5 shadow-paper">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            Nu stoppen versus doorlenen
          </h2>
          <p className="mt-1 text-[13px] leading-[1.6] text-[var(--muted)]">
            Het verschil laat zien wat deze extra leenperiode toevoegt aan schuld,
            maandtermijn en eventueel hypotheekruimte.
          </p>
        </div>
        <ComparisonTable
          rows={view.comparison.tableRows}
          showMortgageImpact={view.showMortgageImpact}
        />
        {view.showMortgageImpact && view.comparison.mortgageCapacityReductionDifference !== undefined ? (
          <p className="rounded-lg bg-[var(--warn-soft)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--muted)]">
            Extra doorlenen verlaagt in deze indicatie je hypotheekruimte met circa{" "}
            <strong className="text-[var(--ink)]">
              {formatCurrency(view.comparison.mortgageCapacityReductionDifference)}
            </strong>{" "}
            ten opzichte van nu stoppen.
          </p>
        ) : (
          <p className="rounded-lg bg-[var(--paper-soft)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--muted)]">
            Hypotheekimpact staat uit. Zet de optie aan als je ook de indicatieve
            verlaging van leencapaciteit wilt zien.
          </p>
        )}
      </section>
    </div>
  ) : (
    <section id="tool-result-summary" className="rounded-xl border hair bg-white p-5 shadow-paper">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
        Vul de drie kernvelden in
      </h2>
      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--muted)]">
        Gebruik een huidige schuld en kies of je nog leent of al gestopt bent.
        Daarna verschijnt de projectie direct.
      </p>
    </section>
  );

  const details = view.isValid ? (
    <div className="space-y-4">
      <DisclosureSection title="Aannames en beperkingen" defaultOpen>
        <ul className="list-disc space-y-2 pl-5 text-[13px] leading-[1.7] text-[var(--muted)]">
          {view.keepBorrowing.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
          <li>Gebruikte normversie: {view.keepBorrowing.normVersion}.</li>
          <li>
            De sliderlimiet komt uit centrale DUO-constants: {view.slider.notes}
          </li>
        </ul>
      </DisclosureSection>
      <DisclosureSection title="Wat betekent de hypotheekoptie?">
        <p className="text-[13px] leading-[1.7] text-[var(--muted)]">
          De hypotheekimpact gebruikt de centrale hypotheeklaag om een DUO-maandtermijn
          indicatief om te rekenen naar minder leenruimte. De schenking, inkomenstoets
          en daadwerkelijke acceptatie door een geldverstrekker zitten hier niet in.
        </p>
      </DisclosureSection>
    </div>
  ) : null;

  return (
    <CalculatorShell
      intro={
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            DUO doorlenen of stoppen
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Zie wat extra lenen in de leenfase doet met je studieschuld, je
            latere DUO-maandtermijn en optioneel je hypotheekruimte.
          </p>
        </>
      }
      inputs={inputs}
      result={result}
      details={details}
      disclaimer={
        <p className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4 text-[12.5px] leading-[1.7] text-[var(--muted)]">
          Indicatieve educatieve berekening. DUO-rente, draagkracht, toekomstige
          regels en hypotheekacceptatie kunnen veranderen. Gebruik dit als
          scenario-inzicht, niet als persoonlijk financieel advies.
        </p>
      }
    />
  );
}
