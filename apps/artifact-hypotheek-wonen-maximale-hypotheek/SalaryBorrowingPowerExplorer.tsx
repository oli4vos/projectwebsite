"use client";

import { useId, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import type { MortgageMaxMortgageInput } from "@/lib/mortgage";
import {
  buildSalaryExplorerViewModel,
  defaultSalaryExplorerForm,
  validateSalaryExplorerForm,
  type SalaryExplorerFormState,
} from "./salary-explorer";

type SalaryBorrowingPowerExplorerProps = {
  baseInput: MortgageMaxMortgageInput;
  hasDirtyMainInput: boolean;
  defaultNewGrossAnnualIncome: string;
  submittedScenarioKey: string;
};

const scenarioLabels = {
  current: "Huidig inkomen",
  "plus-100-month": "+ EUR 100 bruto per maand",
  "plus-250-month": "+ EUR 250 bruto per maand",
  "plus-500-month": "+ EUR 500 bruto per maand",
  custom: "Gekozen nieuw inkomen",
} as const;

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function SalaryBorrowingPowerExplorer({
  baseInput,
  hasDirtyMainInput,
  defaultNewGrossAnnualIncome,
  submittedScenarioKey,
}: SalaryBorrowingPowerExplorerProps) {
  const numericInputId = useId();
  const sliderInputId = useId();
  const fieldErrorId = useId();
  const [draft, setDraft] = useState<{
    submittedScenarioKey: string;
    form: SalaryExplorerFormState;
  }>(() => ({
    submittedScenarioKey,
    form: defaultSalaryExplorerForm(baseInput),
  }));
  const form =
    draft.submittedScenarioKey === submittedScenarioKey
      ? draft.form
      : { newGrossAnnualIncome: defaultNewGrossAnnualIncome };

  function updateNewGrossAnnualIncome(value: string) {
    setDraft({
      submittedScenarioKey,
      form: { newGrossAnnualIncome: value },
    });
  }

  const validation = validateSalaryExplorerForm(form, baseInput);
  const viewModel = buildSalaryExplorerViewModel(form, baseInput);
  const customScenario = viewModel?.result.scenarios.find(
    (scenario) => scenario.key === "custom",
  );
  const currentScenario = viewModel?.result.scenarios.find(
    (scenario) => scenario.key === "current",
  );

  return (
    <DisclosureSection
      title="Wat doet een salarisverhoging met mijn leenruimte?"
      subtitle="Vervolganalyse op basis van je laatst ingediende hypotheekscenario."
    >
      <div className="grid gap-4 rounded-xl border border-[var(--hair)] bg-white p-4">
        {hasDirtyMainInput ? (
          <p className="rounded-lg border border-[var(--warn)]/25 bg-[var(--warn-soft)] px-3 py-2 text-[13px] leading-6 text-[var(--muted)]">
            Deze analyse gebruikt nog je laatst berekende hypotheekscenario. Klik opnieuw op
            Bereken maximale hypotheek als je de gewijzigde hoofdinput wilt meenemen.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[12px] font-medium text-[var(--muted)]">
              Huidig bruto jaarinkomen
            </div>
            <div className="mt-1 font-mono text-[17px] tabular text-[var(--ink)]">
              {formatCurrency(viewModel?.currentGrossAnnualIncome ?? 0)}
            </div>
            <div className="text-[12px] text-[var(--soft)]">
              {formatCurrency(viewModel?.currentGrossMonthlyIncome ?? 0)} bruto per maand
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[var(--muted)]">
              Nieuw bruto jaarinkomen
            </span>
            <div className="hair flex h-11 items-center rounded-xl border bg-white px-3">
              <input
                id={numericInputId}
                inputMode="decimal"
                value={form.newGrossAnnualIncome}
                onChange={(event) => updateNewGrossAnnualIncome(event.target.value)}
                aria-invalid={Boolean(validation.error)}
                aria-describedby={validation.error ? fieldErrorId : undefined}
                className="ring-focus flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
              />
              <span className="ml-2 text-[13px] text-[var(--muted)]">per jaar</span>
            </div>
            <div id={fieldErrorId}>
              <FieldError message={validation.error} />
            </div>
          </label>
        </div>

        {viewModel ? (
          <>
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-[var(--muted)]">
                Praktische slider salarisverhoging
              </span>
              <input
                id={sliderInputId}
                type="range"
                min={viewModel.slider.min}
                max={viewModel.slider.max}
                step={viewModel.slider.step}
                value={viewModel.slider.value}
                onChange={(event) => updateNewGrossAnnualIncome(event.target.value)}
                aria-label="Nieuw bruto jaarinkomen slider"
                className="ring-focus w-full accent-[var(--accent)]"
              />
              <span className="block text-[12px] leading-5 text-[var(--soft)]">
                Sliderbereik: {formatCurrency(viewModel.slider.min)} tot{" "}
                {formatCurrency(viewModel.slider.max)}. Het exacte veld hierboven accepteert
                ook geldige bedragen buiten dit praktische bereik.
              </span>
            </label>

            {viewModel.outsidePracticalSliderRange ? (
              <p className="rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-2 text-[13px] leading-6 text-[var(--muted)]">
                Het ingevulde jaarinkomen ligt buiten het praktische sliderbereik. De berekening
                gebruikt het exacte bedrag uit het numerieke veld.
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-3">
                <div className="text-[12px] text-[var(--muted)]">Nieuw bruto per maand</div>
                <div className="mt-1 font-mono text-[16px] tabular text-[var(--ink)]">
                  {formatCurrency(viewModel.newGrossMonthlyIncome)}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-3">
                <div className="text-[12px] text-[var(--muted)]">Verschil bruto per maand</div>
                <div className="mt-1 font-mono text-[16px] tabular text-[var(--ink)]">
                  {formatCurrency(viewModel.monthlyIncrease)}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-3">
                <div className="text-[12px] text-[var(--muted)]">Salarisstijging</div>
                <div className="mt-1 font-mono text-[16px] tabular text-[var(--ink)]">
                  {formatPercent(viewModel.percentageIncrease)}%
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--hair)] px-3 py-3">
                <div className="text-[12px] text-[var(--muted)]">
                  Maximale hypotheek huidig inkomen
                </div>
                <div className="mt-1 font-mono text-[17px] tabular text-[var(--ink)]">
                  {formatCurrency(currentScenario?.maxMortgage ?? 0)}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--hair)] px-3 py-3">
                <div className="text-[12px] text-[var(--muted)]">
                  Extra leenruimte gekozen inkomen
                </div>
                <div className="mt-1 font-mono text-[17px] tabular text-[var(--ink)]">
                  {formatCurrency(customScenario?.additionalBorrowingPower ?? 0)}
                </div>
                <div className="mt-1 text-[12px] text-[var(--soft)]">
                  Per EUR 100 bruto per maand:{" "}
                  {customScenario?.additionalBorrowingPowerPer100GrossMonthly === null
                    ? "n.v.t."
                    : formatCurrency(
                        customScenario?.additionalBorrowingPowerPer100GrossMonthly ?? 0,
                      )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                  <tr>
                    <th scope="col" className="border-b border-[var(--hair)] px-3 py-2">
                      Scenario
                    </th>
                    <th scope="col" className="border-b border-[var(--hair)] px-3 py-2">
                      Jaarinkomen
                    </th>
                    <th scope="col" className="border-b border-[var(--hair)] px-3 py-2">
                      Maandverschil
                    </th>
                    <th scope="col" className="border-b border-[var(--hair)] px-3 py-2">
                      Maximale hypotheek
                    </th>
                    <th scope="col" className="border-b border-[var(--hair)] px-3 py-2">
                      Extra ruimte
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {viewModel.result.scenarios.map((scenario) => (
                    <tr key={scenario.key}>
                      <th scope="row" className="border-b border-[var(--hair)] px-3 py-2 font-medium">
                        {scenarioLabels[scenario.key]}
                      </th>
                      <td className="border-b border-[var(--hair)] px-3 py-2 font-mono tabular">
                        {formatCurrency(scenario.grossAnnualIncome)}
                      </td>
                      <td className="border-b border-[var(--hair)] px-3 py-2 font-mono tabular">
                        {formatCurrency(scenario.monthlyIncrease)}
                      </td>
                      <td className="border-b border-[var(--hair)] px-3 py-2 font-mono tabular">
                        {formatCurrency(scenario.maxMortgage)}
                      </td>
                      <td className="border-b border-[var(--hair)] px-3 py-2 font-mono tabular">
                        {formatCurrency(scenario.additionalBorrowingPower)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-[13px] leading-6 text-[var(--muted)]">
              <p>
                Alleen bestendig en aantoonbaar inkomen telt mee. Een hypotheekaanbieder
                beoordeelt je volledige dossier en kan inkomen anders behandelen.
              </p>
              <p>
                Deze berekening laat zien wat een hoger inkomen binnen dezelfde indicatieve
                rekenmethode doet. Het is geen toezegging dat een aanbieder dit inkomen accepteert.
              </p>
              {viewModel.result.warnings.includes("custom-income-below-current-income") ? (
                <p>
                  Het gekozen inkomen ligt lager dan je huidige ingediende inkomen; de extra
                  leenruimte kan daardoor negatief zijn.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </DisclosureSection>
  );
}
