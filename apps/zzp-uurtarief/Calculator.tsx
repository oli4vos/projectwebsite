"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getZzpUurtariefDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateZzpUurtarief, type ZzpUurtariefInput } from "./logic";

type FormState = {
  taxYear: string;
  targetNetMonthlyIncome: string;
  monthlyBufferReserve: string;
  monthlyPensionReserve: string;
  pensionReservePercent: string;
  monthlyAovPremium: string;
  monthlyBusinessCosts: string;
  billableHoursPerWeek: string;
  workingWeeksPerYear: string;
  vacationWeeksPerYear: string;
  taxReservePercent: string;
  grossAnnualSalaryComparison: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultYear = getDefaultFinancialYear();
const defaultTaxReservePercent = getFinancialConstants(defaultYear).box1.brackets[1]?.rate ?? 37;

const exampleValues: FormState = {
  taxYear: String(defaultYear),
  targetNetMonthlyIncome: "3500",
  monthlyBufferReserve: "400",
  monthlyPensionReserve: "350",
  pensionReservePercent: "0",
  monthlyAovPremium: "250",
  monthlyBusinessCosts: "450",
  billableHoursPerWeek: "24",
  workingWeeksPerYear: "48",
  vacationWeeksPerYear: "6",
  taxReservePercent: String(defaultTaxReservePercent),
  grossAnnualSalaryComparison: "",
};

const defaultValues: FormState = {
  taxYear: "",
  targetNetMonthlyIncome: "",
  monthlyBufferReserve: "",
  monthlyPensionReserve: "",
  pensionReservePercent: "",
  monthlyAovPremium: "",
  monthlyBusinessCosts: "",
  billableHoursPerWeek: "",
  workingWeeksPerYear: "",
  vacationWeeksPerYear: "",
  taxReservePercent: "",
  grossAnnualSalaryComparison: "",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

function parseOptionalNumber(value: string | undefined) {
  return parseOptionalDecimalInput(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const taxYear = parseOptionalNumber(values.taxYear);
  const targetNetMonthlyIncome = parseOptionalNumber(values.targetNetMonthlyIncome);
  const monthlyBufferReserve = parseOptionalNumber(values.monthlyBufferReserve);
  const monthlyPensionReserve = parseOptionalNumber(values.monthlyPensionReserve);
  const pensionReservePercent = parseOptionalNumber(values.pensionReservePercent);
  const monthlyAovPremium = parseOptionalNumber(values.monthlyAovPremium);
  const monthlyBusinessCosts = parseOptionalNumber(values.monthlyBusinessCosts);
  const billableHoursPerWeek = parseOptionalNumber(values.billableHoursPerWeek);
  const workingWeeksPerYear = parseOptionalNumber(values.workingWeeksPerYear);
  const vacationWeeksPerYear = parseOptionalNumber(values.vacationWeeksPerYear);
  const taxReservePercent = parseOptionalNumber(values.taxReservePercent);
  const grossAnnualSalaryComparison = parseOptionalNumber(
    values.grossAnnualSalaryComparison,
  );

  if (taxYear === undefined || !Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2200) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }

  for (const [field, value] of [
    ["targetNetMonthlyIncome", targetNetMonthlyIncome],
    ["monthlyBufferReserve", monthlyBufferReserve],
    ["monthlyPensionReserve", monthlyPensionReserve],
    ["monthlyAovPremium", monthlyAovPremium],
    ["monthlyBusinessCosts", monthlyBusinessCosts],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      errors[field] = "Gebruik 0 of een hoger bedrag.";
    }
  }

  if (
    pensionReservePercent === undefined ||
    !Number.isFinite(pensionReservePercent) ||
    pensionReservePercent < 0 ||
    pensionReservePercent > 100
  ) {
    errors.pensionReservePercent = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    billableHoursPerWeek === undefined ||
    !Number.isFinite(billableHoursPerWeek) ||
    billableHoursPerWeek < 0 ||
    billableHoursPerWeek > 80
  ) {
    errors.billableHoursPerWeek = "Gebruik 0 tot 80 declarabele uren per week.";
  }
  if (
    workingWeeksPerYear === undefined ||
    !Number.isFinite(workingWeeksPerYear) ||
    workingWeeksPerYear < 0 ||
    workingWeeksPerYear > 52
  ) {
    errors.workingWeeksPerYear = "Gebruik 0 tot 52 werkweken.";
  }
  if (
    vacationWeeksPerYear === undefined ||
    !Number.isFinite(vacationWeeksPerYear) ||
    vacationWeeksPerYear < 0 ||
    vacationWeeksPerYear > 52
  ) {
    errors.vacationWeeksPerYear = "Gebruik 0 tot 52 vakantieweken.";
  }
  if (
    taxReservePercent === undefined ||
    !Number.isFinite(taxReservePercent) ||
    taxReservePercent < 0 ||
    taxReservePercent > 100
  ) {
    errors.taxReservePercent = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    grossAnnualSalaryComparison !== undefined &&
    (!Number.isFinite(grossAnnualSalaryComparison) || grossAnnualSalaryComparison < 0)
  ) {
    errors.grossAnnualSalaryComparison = "Gebruik 0 of een hoger bedrag.";
  }

  const parsedValues: ZzpUurtariefInput | null =
    Object.keys(errors).length === 0
      ? {
          taxYear: taxYear ?? defaultYear,
          targetNetMonthlyIncome: targetNetMonthlyIncome ?? 0,
          monthlyBufferReserve: monthlyBufferReserve ?? 0,
          monthlyPensionReserve: monthlyPensionReserve ?? 0,
          pensionReservePercent: pensionReservePercent ?? 0,
          monthlyAovPremium: monthlyAovPremium ?? 0,
          monthlyBusinessCosts: monthlyBusinessCosts ?? 0,
          billableHoursPerWeek: billableHoursPerWeek ?? 0,
          workingWeeksPerYear: workingWeeksPerYear ?? 0,
          vacationWeeksPerYear: vacationWeeksPerYear ?? 0,
          taxReservePercent: taxReservePercent ?? defaultTaxReservePercent,
          grossAnnualSalaryComparison,
        }
      : null;

  return { errors, parsedValues };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-red-700">{message}</p>;
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getZzpUurtariefDefaultsFromProfile(profile);
  const { hasRelevantProfileValues, profileKey, initialValues } =
    createProfilePrefillState<FormState>({
      defaultValues,
      profilePatch,
      hasProfile,
      profileUpdatedAt: profile.updatedAt,
    });

  return (
    <CalculatorContent
      key={profileKey}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      profilePatch={profilePatch}
    />
  );
}

function CalculatorContent({
  initialValues,
  hasRelevantProfileValues,
  profilePatch,
}: CalculatorContentProps) {
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    submitContextMessage,
    setValues,
  } = useSubmittedCalculation<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const submittedValidation = submittedValues ? validateForm(submittedValues) : null;
  const result = submittedValidation?.parsedValues
    ? calculateZzpUurtarief(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "taxYear",
    "targetNetMonthlyIncome",
    "monthlyBufferReserve",
    "monthlyPensionReserve",
    "pensionReservePercent",
    "monthlyAovPremium",
    "monthlyBusinessCosts",
    "billableHoursPerWeek",
    "workingWeeksPerYear",
    "vacationWeeksPerYear",
    "taxReservePercent",
    "grossAnnualSalaryComparison",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      taxYear: errors.taxYear,
      targetNetMonthlyIncome: errors.targetNetMonthlyIncome,
      monthlyBufferReserve: errors.monthlyBufferReserve,
      monthlyPensionReserve: errors.monthlyPensionReserve,
      pensionReservePercent: errors.pensionReservePercent,
      monthlyAovPremium: errors.monthlyAovPremium,
      monthlyBusinessCosts: errors.monthlyBusinessCosts,
      billableHoursPerWeek: errors.billableHoursPerWeek,
      workingWeeksPerYear: errors.workingWeeksPerYear,
      vacationWeeksPerYear: errors.vacationWeeksPerYear,
      taxReservePercent: errors.taxReservePercent,
      grossAnnualSalaryComparison: errors.grossAnnualSalaryComparison,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setValues(
      mergeProfilePatchIntoValues(formValues, profilePatch),
      "Profielwaarden geladen. Klik op Bereken om de uitkomst te zien.",
    );
  }

  function applyExampleValues() {
    setValues(exampleValues, "Voorbeeldwaarden geladen. Klik op Bereken om de uitkomst te zien.");
  }

  function goToResult() {
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCalculate() {
    submit();
    if (parsedValues) {
      goToResult();
    }
  }

  return (
    <CalculatorShell>
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          ZZP-planning
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          ZZP-uurtarief inclusief buffer, pensioen en AOV
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          ZZP-omzet is geen salaris. Deze tool rekent terug welk uurtarief past
          bij je gewenste inkomen, reserveringen en niet-declarabele tijd.
        </p>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Profielwaarden gevonden in deze browser.</span>
            <button
              type="button"
              onClick={applyExampleValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met voorbeeldwaarden
            </button>
            <button
              type="button"
              onClick={applyProfileValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met profielwaarden
            </button>
          </div>
        ) : null}
        {!hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Start leeg en vul snel een voorbeeldscenario in.</span>
            <button
              type="button"
              onClick={applyExampleValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met voorbeeldwaarden
            </button>
            <a
              href="/profiel"
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Start met profielwaarden
            </a>
          </div>
        ) : null}
        {submitContextMessage ? (
          <p className="mt-3 text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
        ) : null}
        {hasDirtyChanges ? (
          <p className="mt-3 text-[12.5px] text-[var(--muted)]">
            Klik opnieuw op Bereken om de uitkomst te vernieuwen.
          </p>
        ) : null}

        <div className="mt-6 grid gap-5">
          {(
            [
              ["taxYear", "Belastingjaar"],
              ["targetNetMonthlyIncome", "Gewenst netto maandinkomen"],
              ["monthlyBufferReserve", "Bufferreservering per maand"],
              ["monthlyPensionReserve", "Pensioenreservering per maand"],
              ["pensionReservePercent", "Pensioenreservering (%)"],
              ["monthlyAovPremium", "AOV-premie per maand"],
              ["monthlyBusinessCosts", "Zakelijke kosten per maand"],
              ["billableHoursPerWeek", "Declarabele uren per week"],
              ["workingWeeksPerYear", "Werkweken per jaar"],
              ["vacationWeeksPerYear", "Vakantieweken per jaar"],
              ["taxReservePercent", "Belastingreservering (%)"],
              ["grossAnnualSalaryComparison", "Bruto loondienstsalaris (optioneel)"],
            ] as Array<[keyof FormState, string]>
          ).map(([field, label]) => (
            <label key={field} className={mobileFlow.getFieldClassName(field)}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                {label}
              </span>
              <input
                inputMode="decimal"
                value={formValues[field]}
                onChange={(event) => updateField(field, event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(field, Boolean(errors[field]))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors[field]} />
            </label>
          ))}

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            canComplete={Boolean(parsedValues)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={handleCalculate}
          />

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hair)] pt-2">
            <button
              type="button"
              onClick={handleCalculate}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
            </button>
            <p className="text-[12px] text-[var(--muted)]">
              De tool rekent alleen met ingevulde gegevens.
            </p>
          </div>
        </div>
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Samenvatting
            </div>
            {result ? <Pill tone="accent">Indicatief tarief</Pill> : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[28px] leading-none tracking-[-0.03em]">
                Om dit netto doel te halen heb je indicatief ongeveer{" "}
                {formatCurrency(result.requiredHourlyRate)} per uur nodig.
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Dit rekent met declarabele uren, reservering voor belasting, pensioen,
                AOV, buffer en zakelijke kosten.
              </p>
            </>
          ) : null}
        </div>

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Kernuitkomsten
            </h3>
            <div className="mt-4">
              <ResultRow
                label="Declarabele uren per jaar"
                value={new Intl.NumberFormat("nl-NL").format(result.billableHoursPerYear)}
              />
              <ResultRow
                label="Benodigde omzet per jaar"
                value={formatCurrency(result.requiredAnnualRevenue)}
                accent
              />
              <ResultRow
                label="Belastingreservering per jaar"
                value={formatCurrency(result.annualTaxReserve)}
              />
              <ResultRow
                label="Pensioenreservering per jaar"
                value={formatCurrency(result.annualPensionReserve)}
              />
              <ResultRow
                label="AOV per jaar"
                value={formatCurrency(result.annualAovPremium)}
              />
              <ResultRow
                label="Bufferreservering per jaar"
                value={formatCurrency(result.annualBufferReserve)}
              />
              <ResultRow
                label="Indicatief uurtarief"
                value={formatCurrency(result.requiredHourlyRate)}
                accent
              />
            </div>
          </div>
        ) : null}

        <DisclosureSection
          title="Hoe rekenen we dit?"
          subtitle="Declarabele uren bepalen direct welk uurtarief je nodig hebt."
        >
          {result ? (
            <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
              Je rekent met {result.activeWeeksPerYear} actieve werkweken en{" "}
              {new Intl.NumberFormat("nl-NL").format(result.billableHoursPerYear)}{" "}
              declarabele uren per jaar. Niet-declarabele tijd (sales, administratie,
              acquisitie) moet je via je tarief terugverdienen.
            </p>
          ) : null}
        </DisclosureSection>

        <ToolDisclosure
          title="Waarom ZZP-omzet niet hetzelfde is als salaris"
          subtitle="Omzet gaat eerst naar kosten en reserveringen."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Netto doel per jaar: {formatCurrency(result.annualNetTarget)}.</p>
              <p>Subtotaal vóór belastingreservering: {formatCurrency(result.subtotalBeforeTaxReserve)}.</p>
              <p>Belastingreservering: {formatCurrency(result.annualTaxReserve)}.</p>
              <p>Benodigde omzet: {formatCurrency(result.requiredAnnualRevenue)}.</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Pensioen en AOV niet vergeten"
          subtitle="Deze posten zijn vaak de grootste onderschatting in ZZP-tarieven."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Pensioenbron: {result.pensionReserveSource === "monthlyAmount"
                ? "maandbedrag"
                : result.pensionReserveSource === "percentageOfNetTarget"
                  ? "percentage van netto doel"
                  : "geen aparte reservering"}.</p>
              <p>Pensioenreservering: {formatCurrency(result.annualPensionReserve)} per jaar.</p>
              <p>AOV-reservering: {formatCurrency(result.annualAovPremium)} per jaar.</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Vergelijking met loondienst"
          subtitle="Alleen als je een bruto jaarsalaris invult."
        >
          {result?.grossSalaryComparison ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bruto loondienstsalaris: {formatCurrency(result.grossSalaryComparison.grossAnnualSalary)}.</p>
              <p>Benodigde omzet als percentage daarvan: {formatPercent(result.grossSalaryComparison.requiredRevenueAsPercentOfSalary)}%.</p>
              <p>Jaarlijk verschil omzet minus salaris: {formatCurrency(result.grossSalaryComparison.annualRevenueGap)}.</p>
            </div>
          ) : (
            <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
              Vul optioneel een bruto loondienstsalaris in om de uitkomst direct te vergelijken.
            </p>
          )}
        </ToolDisclosure>

        <DisclosureSection
          title="Welke aannames gebruiken we?"
          subtitle="Indicatieve fiscale referentie, geen volledige ZZP-aangifte."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Belastingjaar: {result.taxYear}.</p>
              <p>Indicatieve box 1-belasting op benodigde omzet: {formatCurrency(result.box1Reference.indicativeTaxOnRequiredRevenue)}.</p>
              <p>Indicatieve effectieve druk (box 1 referentie): {formatPercent(result.box1Reference.effectiveRate)}%.</p>
              <p>Indicatief marginaal tarief (box 1 referentie): {formatPercent(result.box1Reference.marginalRate)}%.</p>
            </div>
          ) : null}
        </DisclosureSection>

        <DisclosureSection title="Waar moet je op letten?" subtitle="Educatief hulpmiddel, geen financieel advies.">
          {result ? (
            <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </DisclosureSection>
      </section>
    </CalculatorShell>
  );
}
