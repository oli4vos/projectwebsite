"use client";

import { useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { MortgageRateReferenceLink } from "@/components/mortgage/MortgageRateReferenceLink";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import {
  calculateMortgageScenario,
  defaultValues,
  exampleValues,
  validateMortgageForm,
  type MortgageFormState,
} from "./logic";
import { downloadMortgagePdfReport } from "./report";

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function formatPercent(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

const limitingFactorLabels: Record<string, string> = {
  income: "inkomen",
  ltv: "woningwaarde",
  nhg: "NHG",
  "own-funds": "eigen middelen",
  none: "geen limiet",
  both: "inkomen en woningwaarde",
  unknown: "onbekend",
};

function Field({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  suffix,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: "text" | "number" | "date";
  suffix?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`.trim()}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-[var(--muted)]">{label}</span>
        {hint ? <span className="text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </div>
      <div className="hair flex h-11 items-center rounded-xl border bg-white px-3">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
        {suffix ? <span className="ml-2 text-[13px] text-[var(--muted)]">{suffix}</span> : null}
      </div>
      <FieldError message={error} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`.trim()}>
      <span className="text-[12px] font-medium text-[var(--muted)]">{label}</span>
      <div className="hair flex h-11 items-center rounded-xl border bg-white px-3">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus w-full bg-transparent text-[15px] outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <FieldError message={error} />
    </label>
  );
}

export default function Calculator() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { formValues, setFormValues, submittedValues, submit, hasDirtyChanges, reset } =
    useSubmittedCalculation<MortgageFormState>(defaultValues);
  const formValidation = validateMortgageForm(formValues);
  const submittedValidation = submittedValues ? validateMortgageForm(submittedValues) : null;
  const result = submittedValidation?.parsed
    ? calculateMortgageScenario(submittedValues as MortgageFormState)
    : null;
  const mobileFlow = useMobileFieldFlow([
    "grossAnnualHouseholdIncome",
    "grossAnnualPartnerIncome",
    "annualMortgageRate",
    "afmStressAnnualRate",
    "mortgageTermYears",
    "fixedRatePeriodMonths",
    "purchasePrice",
    "marketValue",
    "ownFunds",
    "monthlyDebtPayments",
    "nhgRequested",
    "energyLabel",
    "energySavingMeasuresAmount",
    "renovationAmount",
  ]);

  const errors = formValidation.errors;

  function updateField<K extends keyof MortgageFormState>(field: K, value: MortgageFormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    if (!formValidation.parsed) {
      return;
    }
    submit();
  }

  async function handleDownloadPdf() {
    if (!submittedValidation?.parsed || !result) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await downloadMortgagePdfReport(submittedValidation.parsed, result);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Hypotheek
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Maximale hypotheek
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Een indicatieve tool voor starters zonder bestaande hypotheek. Schat je maximale
            leencapaciteit op basis van inkomen, woningwaarde, studieschuld, NHG en een eenvoudige
            stressrente.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={() => {
              setFormValues(exampleValues);
            }}
          >
            Voorbeeld invullen
          </ToolActionButton>
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={() => reset("Invoer gewist.")}
          >
            Wis invoer
          </ToolActionButton>
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={() => void handleDownloadPdf()}
            disabled={!result || isDownloadingPdf}
          >
            {isDownloadingPdf ? "PDF wordt gemaakt..." : "PDF-rapport downloaden"}
          </ToolActionButton>
        </div>
      }
      inputs={
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <section className="grid gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Inkomsten
            </h3>
            <Field
              label="Bruto jaarinkomen"
              value={formValues.grossAnnualHouseholdIncome}
              onChange={(value) => updateField("grossAnnualHouseholdIncome", value)}
              error={errors.grossAnnualHouseholdIncome}
              suffix="per jaar"
              className={mobileFlow.getFieldClassName("grossAnnualHouseholdIncome")}
            />
            <Field
              label="Partnerinkomen"
              value={formValues.grossAnnualPartnerIncome}
              onChange={(value) => updateField("grossAnnualPartnerIncome", value)}
              error={errors.grossAnnualPartnerIncome}
              suffix="per jaar"
              className={mobileFlow.getFieldClassName("grossAnnualPartnerIncome")}
            />
            <Field
              label="Hypotheekrente"
              value={formValues.annualMortgageRate}
              onChange={(value) => updateField("annualMortgageRate", value)}
              error={errors.annualMortgageRate}
              suffix="%"
              hint="Bijv. 4,01%"
              className={mobileFlow.getFieldClassName("annualMortgageRate")}
            />
            <div className={mobileFlow.getFieldClassName("annualMortgageRate")}>
              <MortgageRateReferenceLink compact />
            </div>
            <Field
              label="Toetsrente bij rentevast korter dan 10 jaar"
              value={formValues.afmStressAnnualRate}
              onChange={(value) => updateField("afmStressAnnualRate", value)}
              error={errors.afmStressAnnualRate}
              suffix="%"
              hint="Bijv. 5,00%"
              className={mobileFlow.getFieldClassName("afmStressAnnualRate")}
            />
            <Field
              label="Rentevaste periode"
              value={formValues.fixedRatePeriodMonths}
              onChange={(value) => updateField("fixedRatePeriodMonths", value)}
              error={errors.fixedRatePeriodMonths}
              suffix="maanden"
              className={mobileFlow.getFieldClassName("fixedRatePeriodMonths")}
            />
            <Field
              label="Looptijd hypotheek"
              value={formValues.mortgageTermYears}
              onChange={(value) => updateField("mortgageTermYears", value)}
              error={errors.mortgageTermYears}
              suffix="jaar"
              className={mobileFlow.getFieldClassName("mortgageTermYears")}
            />
          </section>

          <section className="grid gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Woning en eigen geld
            </h3>
            <Field
              label="Koopprijs"
              value={formValues.purchasePrice}
              onChange={(value) => updateField("purchasePrice", value)}
              error={errors.purchasePrice}
              suffix="euro"
              className={mobileFlow.getFieldClassName("purchasePrice")}
            />
            <Field
              label="Woningwaarde"
              value={formValues.marketValue}
              onChange={(value) => updateField("marketValue", value)}
              error={errors.marketValue}
              suffix="euro"
              hint="Laat leeg als de woningwaarde gelijk is aan de koopprijs."
              className={mobileFlow.getFieldClassName("marketValue")}
            />
            <Field
              label="Eigen geld"
              value={formValues.ownFunds}
              onChange={(value) => updateField("ownFunds", value)}
              error={errors.ownFunds}
              suffix="euro"
              className={mobileFlow.getFieldClassName("ownFunds")}
            />
            <SelectField
              label="NHG gewenst?"
              value={formValues.nhgRequested ? "yes" : "no"}
              onChange={(value) => updateField("nhgRequested", value === "yes")}
              error={errors.nhgRequested}
              className={mobileFlow.getFieldClassName("nhgRequested")}
              options={[
                { label: "Ja", value: "yes" },
                { label: "Nee", value: "no" },
              ]}
            />
            <SelectField
              label="Energielabel"
              value={formValues.energyLabel}
              onChange={(value) => updateField("energyLabel", value)}
              error={errors.energyLabel}
              className={mobileFlow.getFieldClassName("energyLabel")}
              options={[
                { label: "Onbekend", value: "unknown" },
                { label: "A++++", value: "A++++" },
                { label: "A+++", value: "A+++" },
                { label: "A++", value: "A++" },
                { label: "A+", value: "A+" },
                { label: "A", value: "A" },
                { label: "B", value: "B" },
                { label: "C", value: "C" },
                { label: "D", value: "D" },
                { label: "E", value: "E" },
                { label: "F", value: "F" },
                { label: "G", value: "G" },
              ]}
            />
            <Field
              label="Verduurzamingskosten"
              value={formValues.energySavingMeasuresAmount}
              onChange={(value) => updateField("energySavingMeasuresAmount", value)}
              error={errors.energySavingMeasuresAmount}
              suffix="euro"
              className={mobileFlow.getFieldClassName("energySavingMeasuresAmount")}
            />
            <Field
              label="Verbouwing overige kosten"
              value={formValues.renovationAmount}
              onChange={(value) => updateField("renovationAmount", value)}
              error={errors.renovationAmount}
              suffix="euro"
              className={mobileFlow.getFieldClassName("renovationAmount")}
            />
          </section>

          <section className="grid gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Schulden
            </h3>
            <Field
              label="Maandlast overige schulden"
              value={formValues.monthlyDebtPayments}
              onChange={(value) => updateField("monthlyDebtPayments", value)}
              error={errors.monthlyDebtPayments}
              suffix="per maand"
              className={mobileFlow.getFieldClassName("monthlyDebtPayments")}
            />
            <label className="flex items-start gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
              <input
                type="checkbox"
                checked={formValues.hasStudentLoan}
                onChange={(event) => updateField("hasStudentLoan", event.target.checked)}
                className="mt-1 size-4 rounded border-[var(--hair)] text-[var(--deep)]"
              />
              <span className="space-y-1">
                <span className="block text-[14px] font-medium text-[var(--ink)]">Studieschuld aanwezig</span>
                <span className="block text-[12px] leading-6 text-[var(--muted)]">
                  DUO wordt gebruteerd volgens de centrale hypotheeklaag.
                </span>
              </span>
            </label>
            {formValues.hasStudentLoan ? (
              <div className="grid gap-4 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)]/50 p-4">
                <SelectField
                  label="DUO-status"
                  value={formValues.studentLoanStatus}
                  onChange={(value) => updateField("studentLoanStatus", value as MortgageFormState["studentLoanStatus"])}
                  error={errors.studentLoanStatus}
                  options={[
                    { label: "Betalen", value: "repaying" },
                    { label: "Aanloopfase", value: "start_phase" },
                    { label: "Draagkrachtverlaging", value: "reduced_capacity" },
                    { label: "Aflosvrije periode", value: "payment_pause" },
                    { label: "Onbekend", value: "unknown" },
                  ]}
                />
                {formValues.studentLoanStatus === "repaying" ? (
                  <Field
                    label="Actueel DUO-maandbedrag"
                    value={formValues.actualMonthlyPayment}
                    onChange={(value) => updateField("actualMonthlyPayment", value)}
                    error={errors.actualMonthlyPayment}
                    suffix="per maand"
                  />
                ) : (
                  <Field
                    label="Wettelijk DUO-maandbedrag"
                    value={formValues.statutoryMonthlyPayment}
                    onChange={(value) => updateField("statutoryMonthlyPayment", value)}
                    error={errors.statutoryMonthlyPayment}
                    suffix="per maand"
                  />
                )}
              </div>
            ) : null}
          </section>

          <div className="hidden md:block">
            <ToolActionButton
              type="submit"
              variant="submit"
              size="md"
              full
              disabled={!formValidation.parsed}
            >
              {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken maximale hypotheek"}
            </ToolActionButton>
          </div>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext}
            canComplete={Boolean(formValidation.parsed)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={handleSubmit}
          />
        </form>
      }
      result={
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Uitkomst</div>
          {!result ? (
            <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
              Vul de belangrijkste gegevens in en klik op Bereken.
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Maximale hypotheek op inkomen"
                  value={formatCurrency(result.maxMortgageByIncome)}
                  tone="pos"
                />
                <ResultCard
                  label="Impact DUO-schuld"
                  value={
                    result.breakdown.studentLoanBorrowingCapacityImpact > 0
                      ? `− ${formatCurrency(result.breakdown.studentLoanBorrowingCapacityImpact)}`
                      : formatCurrency(0)
                  }
                  note="Indicatief minder leencapaciteit door de gebruteerde DUO-maandlast."
                  tone={
                    result.breakdown.studentLoanBorrowingCapacityImpact > 0
                      ? "neg"
                      : "default"
                  }
                />
                <ResultCard
                  label="Einduitkomst"
                  value={formatCurrency(result.finalMaxMortgage)}
                  tone="pos"
                />
                <ResultCard
                  label="Maximaal koopbudget"
                  value={result.maxHomeBudget === null ? "n.v.t." : formatCurrency(result.maxHomeBudget)}
                />
                <ResultCard
                  label="Hogere hypotheek bij andere toetsrente"
                  value={
                    result.breakdown.higherMortgageOpportunity
                      ? `+ ${formatCurrency(result.breakdown.higherMortgageOpportunity.increaseInMaxMortgage)}`
                      : "Geen hogere uitkomst"
                  }
                  note={
                    result.breakdown.higherMortgageOpportunity
                      ? `Bij ${formatPercent(result.breakdown.higherMortgageOpportunity.alternativeTestRate, 3)} toetsrente kom je indicatief uit op ${formatCurrency(result.breakdown.higherMortgageOpportunity.alternativeFinalMaxMortgage)}.`
                      : "Geen hogere uitkomst binnen de officiële financieringslasttabelbanden."
                  }
                  tone={result.breakdown.higherMortgageOpportunity ? "pos" : "default"}
                />
                <ResultCard
                  label="Benodigde eigen middelen"
                  value={formatCurrency(result.breakdown.requiredOwnFunds)}
                  tone={result.breakdown.requiredOwnFunds > 0 ? "warn" : "pos"}
                />
                <ResultCard
                  label="Financieringstekort"
                  value={formatCurrency(result.fundingGap)}
                  tone={result.fundingGap > 0 ? "neg" : "pos"}
                />
                <ResultCard
                  label="Bruto maandlast"
                  value={formatCurrency(result.monthlyPaymentGross)}
                />
              </div>
              <p className="mt-4 text-[13px] leading-6 text-white/75">
                Limiterend:{" "}
                <span className="font-medium text-white">
                  {limitingFactorLabels[result.limitingFactor] ?? result.limitingFactor}
                </span>
                {" / "}
                <span className="font-medium text-white">
                  {limitingFactorLabels[result.limitingFactorDetailed] ?? result.limitingFactorDetailed}
                </span>
                .{" "}
                Betrouwbaarheid: <span className="font-medium text-white">{result.confidence}</span>.
              </p>
            </>
          )}
        </div>
      }
      details={
        result ? (
          <div className="space-y-4">
            <DisclosureSection title="Berekening per bedrag" subtitle="Hier zie je welke limiet het eindbedrag bepaalt.">
              <ResultRow
                label="Maximale hypotheek op inkomen"
                value={formatCurrency(result.breakdown.maxMortgageByIncome)}
                breakdown={
                  <>
                    <div>Toetsinkomen: {formatCurrency(result.breakdown.householdIncome)}</div>
                    <div>Woonlastfactor: {formatPercent(result.breakdown.annualHousingCostRatio)}%</div>
                    <div>Maandbudget na schulden: {formatCurrency(result.breakdown.monthlyHousingBudgetAfterLiabilities)}</div>
                    <div>Basis hypotheekruimte uit inkomen: {formatCurrency(result.breakdown.baseMaxMortgageByIncome)}</div>
                    <div>Toegepaste extra leenruimte op inkomen door energielabel: {formatCurrency(result.breakdown.energyLabelAllowance)}</div>
                    <div>Toegepaste extra leenruimte op inkomen voor energiebesparende maatregelen: {formatCurrency(result.breakdown.energySavingAllowance)}</div>
                  </>
                }
                breakdownLabel="Toon inkomensberekening"
                defaultBreakdownOpen
              />
              <ResultRow
                label="Maximale hypotheek op woningwaarde"
                value={result.maxMortgageByCollateral === null ? "n.v.t." : formatCurrency(result.maxMortgageByCollateral)}
                breakdown={
                  result.maxMortgageByCollateral === null ? (
                    <div>Geen woningwaarde opgegeven, dus geen aparte collateral-cap.</div>
                  ) : (
                    <>
                      <div>Woningwaarde: {formatCurrency(result.breakdown.propertyValue || result.breakdown.marketValue)}</div>
                      <div>LTV: {formatPercent(result.breakdown.ltvPercentage)}%</div>
                      <div>Basislimiet op woningwaarde: {formatCurrency(result.breakdown.baseMaxMortgageByLtv)}</div>
                      <div>Toegepaste extra LTV-ruimte voor energiebesparende maatregelen: {formatCurrency(result.breakdown.energySavingAllowance)}</div>
                      <div>Totaal maximale hypotheek op woningwaarde: {formatCurrency(result.breakdown.maxMortgageByLtv)}</div>
                      <div>Extra leenruimte door energielabel: {formatCurrency(result.breakdown.energyLabelAllowance)}. Dit bedrag verhoogt alleen de inkomensgrens en is niet opgenomen in deze woningwaardelimiet.</div>
                    </>
                  )
                }
                breakdownLabel="Toon LTV-berekening"
              />
              {result.breakdown.maxMortgageByNhg !== undefined ? (
                <ResultRow
                  label="NHG-limiet"
                  value={formatCurrency(result.breakdown.maxMortgageByNhg)}
                  breakdown={<div>NHG is indicatief meegenomen op basis van de opgegeven grens.</div>}
                  breakdownLabel="Toon NHG-uitleg"
                />
              ) : null}
              <ResultRow
                label="Woonlast vóór schulden"
                value={formatCurrency(result.breakdown.monthlyHousingBudgetBeforeLiabilities)}
                sub={`Na DUO en andere lasten: ${formatCurrency(result.breakdown.monthlyHousingBudgetAfterLiabilities)}`}
              />
              <ResultRow
                label="Studentenlening brutering"
                value={formatCurrency(result.breakdown.studentLoanMonthlyImpact)}
                breakdown={<div>De centrale hypotheeklaag brutert de DUO-maandlast voor toetsing.</div>}
              />
              <ResultRow
                label="Hogere hypotheek bij andere toetsrente"
                value={
                  result.breakdown.higherMortgageOpportunity
                    ? `+ ${formatCurrency(result.breakdown.higherMortgageOpportunity.increaseInMaxMortgage)}`
                    : "geen hogere uitkomst"
                }
                breakdown={
                  result.breakdown.higherMortgageOpportunity ? (
                    <>
                      <div>
                        Huidige toetsrente:{" "}
                        {formatPercent(result.breakdown.higherMortgageOpportunity.referenceTestRate, 3)}
                      </div>
                      <div>
                        Alternatieve toetsrente:{" "}
                        {formatPercent(result.breakdown.higherMortgageOpportunity.alternativeTestRate, 3)}
                      </div>
                      <div>
                        Financieringslastpercentage alternatief:{" "}
                        {formatPercent(
                          result.breakdown.higherMortgageOpportunity.alternativeAnnualHousingCostRatio,
                        )}
                      </div>
                      <div>
                        Alternatieve maximale hypotheek op inkomen:{" "}
                        {formatCurrency(
                          result.breakdown.higherMortgageOpportunity.alternativeMaxMortgageByIncome,
                        )}
                      </div>
                      <div>
                        Alternatieve einduitkomst:{" "}
                        {formatCurrency(
                          result.breakdown.higherMortgageOpportunity.alternativeFinalMaxMortgage,
                        )}
                      </div>
                      <div>{result.breakdown.higherMortgageOpportunity.note}</div>
                    </>
                  ) : (
                    <div>Geen hogere uitkomst binnen de officiële financieringslasttabelbanden.</div>
                  )
                }
                breakdownLabel="Toon rentevergelijking"
                strong={Boolean(result.breakdown.higherMortgageOpportunity)}
                accent={Boolean(result.breakdown.higherMortgageOpportunity)}
              />
            </DisclosureSection>

            <DisclosureSection title="Waarschuwingen" subtitle="Wat deze tool niet automatisch voor je beslist.">
              {result.warnings.map((warning) => (
                <div key={warning.code} className="rounded-lg border border-[var(--hair)] bg-white px-3 py-2 text-[13px] leading-6 text-[var(--muted)]">
                  <strong className="text-[var(--ink)]">{warning.code}</strong>: {warning.message}
                </div>
              ))}
            </DisclosureSection>

            <DisclosureSection title="Aannames" subtitle="Centrale uitgangspunten van de berekening.">
              {result.assumptions.map((assumption) => (
                <p key={assumption} className="text-[13px] leading-6 text-[var(--muted)]">
                  {assumption}
                </p>
              ))}
            </DisclosureSection>
          </div>
        ) : null
      }
      disclaimer={
        <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4 text-[12.5px] leading-6 text-[var(--muted)]">
          Deze tool is indicatief. Gebruik voor een definitieve aanvraag altijd officieel hypotheekadvies.
          Toekomstige schenkingen, partnerinkomen en schulden kunnen de uitkomst veranderen.
        </div>
      }
    />
  );
}
