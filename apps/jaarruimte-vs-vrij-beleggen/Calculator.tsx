"use client";

import { useState } from "react";
import { AreaChart, getAdaptiveEuroTicks, getAdaptiveYearTicks } from "@/components/charts";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { Btn, Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getJaarruimteVsVrijBeleggenDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  calculateJaarruimteVsVrijBeleggen,
  type FlexibilityPreference,
  type JaarruimteVsVrijBeleggenInput,
} from "./logic";

type FormState = {
  year: string;
  grossAnnualIncome: string;
  taxableIncome: string;
  availableJaarruimte: string;
  plannedContribution: string;
  currentInvestableAssets: string;
  hasFiscalPartner: boolean;
  expectedAnnualReturn: string;
  horizonYears: string;
  overrideCurrentTaxRate: string;
  expectedTaxRateAtPayout: string;
  includeBox3Effect: boolean;
  flexibilityPreference: FlexibilityPreference;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  year: String(getDefaultFinancialYear()),
  grossAnnualIncome: "55000",
  taxableIncome: "",
  availableJaarruimte: "8000",
  plannedContribution: "5000",
  currentInvestableAssets: "20000",
  hasFiscalPartner: false,
  expectedAnnualReturn: "5",
  horizonYears: "20",
  overrideCurrentTaxRate: "",
  expectedTaxRateAtPayout: "",
  includeBox3Effect: true,
  flexibilityPreference: "medium",
};

const defaultValues: FormState = {
  year: "",
  grossAnnualIncome: "",
  taxableIncome: "",
  availableJaarruimte: "",
  plannedContribution: "",
  currentInvestableAssets: "",
  hasFiscalPartner: false,
  expectedAnnualReturn: "",
  horizonYears: "",
  overrideCurrentTaxRate: "",
  expectedTaxRateAtPayout: "",
  includeBox3Effect: true,
  flexibilityPreference: "medium",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

function parseOptionalNumber(value: string | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.replace(/\s+/g, "").replace(",", ".");
  if (normalized.length === 0) {
    return undefined;
  }
  return Number(normalized);
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

function formatCsvNumber(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function buildPlanningCsv(result: NonNullable<ReturnType<typeof calculateJaarruimteVsVrijBeleggen>>) {
  const lines: string[] = [
    "Jaarruimte of vrij beleggen - vermogensplanning",
    `Jaar;${result.year}`,
    `Horizon (jaren);${result.horizonYears}`,
    `Verwacht rendement (%);${formatCsvNumber(result.expectedAnnualReturn)}`,
    "",
    "Samenvatting;Waarde",
    `Fiscaal voordeel nu;${formatCsvNumber(result.scenarioPension.taxBenefitNow)}`,
    `Pensioen netto eindwaarde (indicatief);${formatCsvNumber(result.scenarioPension.futureValueNetIndicative)}`,
    `Vrij beleggen netto eindwaarde (indicatief);${formatCsvNumber(result.scenarioFreeInvesting.futureValueNetIndicative)}`,
    `Totaal box 3 over horizon;${formatCsvNumber(result.wealthPlanning.totalBox3TaxPaid)}`,
    "",
    "Jaar;Pensioen bruto;Pensioen netto indicatief;Beleggen zonder box 3;Beleggen na box 3;Box 3 dit jaar;Cumulatieve box 3",
  ];

  for (const point of result.wealthPlanning.points) {
    lines.push(
      [
        point.year,
        formatCsvNumber(point.pensionGross),
        formatCsvNumber(point.pensionNetIndicative),
        formatCsvNumber(point.investingGrossWithoutBox3),
        formatCsvNumber(point.investingNetAfterBox3),
        formatCsvNumber(point.box3TaxThisYear),
        formatCsvNumber(point.cumulativeBox3Tax),
      ].join(";"),
    );
  }

  return lines.join("\n");
}

function downloadPlanningCsv(result: NonNullable<ReturnType<typeof calculateJaarruimteVsVrijBeleggen>>) {
  const csvContent = buildPlanningCsv(result);
  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vermogensplanning-jaarruimte-vs-vrij-beleggen-${result.year}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openPlanningPdfExport(result: NonNullable<ReturnType<typeof calculateJaarruimteVsVrijBeleggen>>) {
  const tableRows = result.wealthPlanning.points
    .map(
      (point) =>
        `<tr>
          <td>${point.year}</td>
          <td>${formatCurrency(point.pensionGross)}</td>
          <td>${formatCurrency(point.pensionNetIndicative)}</td>
          <td>${formatCurrency(point.investingGrossWithoutBox3)}</td>
          <td>${formatCurrency(point.investingNetAfterBox3)}</td>
          <td>${formatCurrency(point.box3TaxThisYear)}</td>
          <td>${formatCurrency(point.cumulativeBox3Tax)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>Vermogensplanning export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 24px; color: #1f2937; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 4px; font-size: 13px; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>Vermogensplanning - Jaarruimte of vrij beleggen</h1>
  <p>Belastingjaar: ${result.year}</p>
  <p>Horizon: ${result.horizonYears} jaar</p>
  <p>Verwacht rendement: ${formatPercent(result.expectedAnnualReturn)}%</p>
  <p>Totaal box 3 over horizon (indicatief): ${formatCurrency(result.wealthPlanning.totalBox3TaxPaid)}</p>
  <table>
    <thead>
      <tr>
        <th>Jaar</th>
        <th>Pensioen bruto</th>
        <th>Pensioen netto indicatief</th>
        <th>Beleggen zonder box 3</th>
        <th>Beleggen na box 3</th>
        <th>Box 3 dit jaar</th>
        <th>Cumulatieve box 3</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=980,height=780");
  if (!printWindow) {
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const year = parseOptionalNumber(values.year);
  const grossAnnualIncome = parseOptionalNumber(values.grossAnnualIncome);
  const taxableIncome = parseOptionalNumber(values.taxableIncome);
  const availableJaarruimte = parseOptionalNumber(values.availableJaarruimte);
  const plannedContribution = parseOptionalNumber(values.plannedContribution);
  const currentInvestableAssets = parseOptionalNumber(values.currentInvestableAssets);
  const expectedAnnualReturn = parseOptionalNumber(values.expectedAnnualReturn);
  const horizonYears = parseOptionalNumber(values.horizonYears);
  const overrideCurrentTaxRate = parseOptionalNumber(values.overrideCurrentTaxRate);
  const expectedTaxRateAtPayout = parseOptionalNumber(values.expectedTaxRateAtPayout);

  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }
  if (
    grossAnnualIncome === undefined ||
    !Number.isFinite(grossAnnualIncome) ||
    grossAnnualIncome < 0
  ) {
    errors.grossAnnualIncome = "Gebruik 0 of een hoger bedrag.";
  }
  if (taxableIncome !== undefined && (!Number.isFinite(taxableIncome) || taxableIncome < 0)) {
    errors.taxableIncome = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    availableJaarruimte === undefined ||
    !Number.isFinite(availableJaarruimte) ||
    availableJaarruimte < 0
  ) {
    errors.availableJaarruimte = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    plannedContribution === undefined ||
    !Number.isFinite(plannedContribution) ||
    plannedContribution < 0
  ) {
    errors.plannedContribution = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    currentInvestableAssets === undefined ||
    !Number.isFinite(currentInvestableAssets) ||
    currentInvestableAssets < 0
  ) {
    errors.currentInvestableAssets = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    expectedAnnualReturn === undefined ||
    !Number.isFinite(expectedAnnualReturn) ||
    expectedAnnualReturn < 0 ||
    expectedAnnualReturn > 100
  ) {
    errors.expectedAnnualReturn = "Gebruik een rendement tussen 0 en 100.";
  }
  if (
    horizonYears === undefined ||
    !Number.isFinite(horizonYears) ||
    horizonYears <= 0 ||
    horizonYears > 60
  ) {
    errors.horizonYears = "Gebruik een horizon tussen 1 en 60 jaar.";
  }
  if (
    overrideCurrentTaxRate !== undefined &&
    (!Number.isFinite(overrideCurrentTaxRate) ||
      overrideCurrentTaxRate < 0 ||
      overrideCurrentTaxRate > 100)
  ) {
    errors.overrideCurrentTaxRate = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    expectedTaxRateAtPayout !== undefined &&
    (!Number.isFinite(expectedTaxRateAtPayout) ||
      expectedTaxRateAtPayout < 0 ||
      expectedTaxRateAtPayout > 100)
  ) {
    errors.expectedTaxRateAtPayout = "Gebruik een percentage tussen 0 en 100.";
  }

  const parsedValues: JaarruimteVsVrijBeleggenInput | null =
    Object.keys(errors).length === 0
      ? {
          year,
          grossAnnualIncome: grossAnnualIncome ?? 0,
          taxableIncome,
          availableJaarruimte: availableJaarruimte ?? 0,
          plannedContribution: plannedContribution ?? 0,
          currentInvestableAssets: currentInvestableAssets ?? 0,
          hasFiscalPartner: values.hasFiscalPartner,
          expectedAnnualReturn: expectedAnnualReturn ?? 0,
          horizonYears: horizonYears ?? 0,
          overrideCurrentTaxRate,
          expectedTaxRateAtPayout,
          includeBox3Effect: values.includeBox3Effect,
          flexibilityPreference: values.flexibilityPreference,
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
  const profilePatch = getJaarruimteVsVrijBeleggenDefaultsFromProfile(profile);
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
  const [formValues, setFormValues] = useState<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const result = parsedValues
    ? calculateJaarruimteVsVrijBeleggen(parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "year",
    "grossAnnualIncome",
    "taxableIncome",
    "availableJaarruimte",
    "plannedContribution",
    "currentInvestableAssets",
    "hasFiscalPartner",
    "expectedAnnualReturn",
    "horizonYears",
    "overrideCurrentTaxRate",
    "expectedTaxRateAtPayout",
    "includeBox3Effect",
    "flexibilityPreference",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      year: errors.year,
      grossAnnualIncome: errors.grossAnnualIncome,
      taxableIncome: errors.taxableIncome,
      availableJaarruimte: errors.availableJaarruimte,
      plannedContribution: errors.plannedContribution,
      currentInvestableAssets: errors.currentInvestableAssets,
      expectedAnnualReturn: errors.expectedAnnualReturn,
      horizonYears: errors.horizonYears,
      overrideCurrentTaxRate: errors.overrideCurrentTaxRate,
      expectedTaxRateAtPayout: errors.expectedTaxRateAtPayout,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setFormValues((current) => mergeProfilePatchIntoValues(current, profilePatch));
  }

  function applyExampleValues() {
    setFormValues(exampleValues);
  }

  function goToResult() {
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <CalculatorShell>
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Pensioen vs Box 3
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Jaarruimte of vrij beleggen?
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Pensioeninleg kan belastingvoordeel geven, maar je geld staat meestal
          vast. Vrij beleggen is flexibeler, maar kan in box 3 vallen. Deze tool
          zet beide routes naast elkaar.
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

        <div className="mt-6 grid gap-5">
          <label className={mobileFlow.getFieldClassName("year")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingjaar
            </span>
            <input
              inputMode="numeric"
              value={formValues.year}
              onChange={(event) => updateField("year", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("year", Boolean(errors.year))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.year} />
          </label>

          <label className={mobileFlow.getFieldClassName("grossAnnualIncome")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bruto jaarinkomen
            </span>
            <input
              inputMode="decimal"
              value={formValues.grossAnnualIncome}
              onChange={(event) => updateField("grossAnnualIncome", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("grossAnnualIncome", Boolean(errors.grossAnnualIncome))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.grossAnnualIncome} />
          </label>

          <label className={mobileFlow.getFieldClassName("taxableIncome")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastbaar inkomen (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.taxableIncome}
              onChange={(event) => updateField("taxableIncome", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("taxableIncome", Boolean(errors.taxableIncome))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.taxableIncome} />
          </label>

          <label className={mobileFlow.getFieldClassName("availableJaarruimte")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beschikbare jaarruimte
            </span>
            <input
              inputMode="decimal"
              value={formValues.availableJaarruimte}
              onChange={(event) => updateField("availableJaarruimte", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("availableJaarruimte", Boolean(errors.availableJaarruimte))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.availableJaarruimte} />
            <p className="text-[12px] leading-[1.55] text-[var(--muted)]">
              Weet je dit niet?{" "}
              <a
                href="https://www.belastingdienst.nl/wps/wcm/connect/nl/aftrek-en-kortingen/content/jaarruimte-en-reserveringsruimte"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--ink)] underline underline-offset-2"
              >
                Help mij berekenen
              </a>
              .
            </p>
          </label>

          <label className={mobileFlow.getFieldClassName("plannedContribution")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bedrag dat je wilt inleggen
            </span>
            <input
              inputMode="decimal"
              value={formValues.plannedContribution}
              onChange={(event) => updateField("plannedContribution", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("plannedContribution", Boolean(errors.plannedContribution))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.plannedContribution} />
          </label>

          <label className={mobileFlow.getFieldClassName("currentInvestableAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Huidig vrij belegbaar vermogen
            </span>
            <input
              inputMode="decimal"
              value={formValues.currentInvestableAssets}
              onChange={(event) => updateField("currentInvestableAssets", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("currentInvestableAssets", Boolean(errors.currentInvestableAssets))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.currentInvestableAssets} />
          </label>

          <label className={mobileFlow.getFieldClassName("hasFiscalPartner")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Fiscale partner
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.hasFiscalPartner}
                onChange={(event) => updateField("hasFiscalPartner", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("expectedAnnualReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht jaarlijks rendement (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedAnnualReturn}
              onChange={(event) => updateField("expectedAnnualReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("expectedAnnualReturn", Boolean(errors.expectedAnnualReturn))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedAnnualReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("horizonYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Horizon (jaren)
            </span>
            <input
              inputMode="numeric"
              value={formValues.horizonYears}
              onChange={(event) => updateField("horizonYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("horizonYears", Boolean(errors.horizonYears))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.horizonYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("overrideCurrentTaxRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingpercentage nu (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.overrideCurrentTaxRate}
              onChange={(event) => updateField("overrideCurrentTaxRate", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("overrideCurrentTaxRate", Boolean(errors.overrideCurrentTaxRate))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.overrideCurrentTaxRate} />
          </label>

          <label className={mobileFlow.getFieldClassName("expectedTaxRateAtPayout")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingpercentage bij uitkering (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedTaxRateAtPayout}
              onChange={(event) => updateField("expectedTaxRateAtPayout", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("expectedTaxRateAtPayout", Boolean(errors.expectedTaxRateAtPayout))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedTaxRateAtPayout} />
          </label>

          <label className={mobileFlow.getFieldClassName("includeBox3Effect")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Box 3-effect meenemen als indicatie
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeBox3Effect}
                onChange={(event) => updateField("includeBox3Effect", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("flexibilityPreference")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Flexibiliteitsvoorkeur
            </span>
            <select
              value={formValues.flexibilityPreference}
              onChange={(event) =>
                updateField("flexibilityPreference", event.target.value as FlexibilityPreference)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="low">Laag</option>
              <option value="medium">Midden</option>
              <option value="high">Hoog</option>
            </select>
          </label>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            canComplete={Boolean(result)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={goToResult}
          />
        </div>
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Beknopte samenvatting
            </div>
            {result ? (
              <Pill tone={result.comparison.netDifferencePensionMinusInvesting >= 0 ? "pos" : "neg"}>
                {result.comparison.netDifferencePensionMinusInvesting >= 0
                  ? "Pensioenpot lijkt sterker"
                  : "Vrij beleggen lijkt sterker"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[34px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.scenarioPension.taxBenefitNow)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Indicatief belastingvoordeel nu via jaarruimte:{" "}
                {formatCurrency(result.scenarioPension.taxBenefitNow)}.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Eindwaarde pensioenpot (indicatief netto):{" "}
                {formatCurrency(result.scenarioPension.futureValueNetIndicative)}.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Eindwaarde vrij beleggen (indicatief netto):{" "}
                {formatCurrency(result.scenarioFreeInvesting.futureValueNetIndicative)}.
              </p>
            </>
          ) : null}
        </div>

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
                Vergelijking
              </h3>
              <div className="flex flex-wrap gap-2">
                <Btn
                  type="button"
                  kind="outline"
                  size="sm"
                  onClick={() => downloadPlanningCsv(result)}
                >
                  Excel-export (.csv)
                </Btn>
                <Btn
                  type="button"
                  kind="ghost"
                  size="sm"
                  onClick={() => openPlanningPdfExport(result)}
                >
                  PDF-export
                </Btn>
              </div>
            </div>
            <div className="mt-5">
              <ResultRow label="Gevraagde inleg" value={formatCurrency(result.contributionRequested)} />
              <ResultRow
                label="Inleg binnen jaarruimte"
                value={formatCurrency(result.contributionEligibleForJaarruimte)}
              />
              <ResultRow
                label="Inleg buiten jaarruimte"
                value={formatCurrency(result.contributionOutsideJaarruimte)}
              />
              <ResultRow
                label="Fiscaal voordeel nu (box 1)"
                value={formatCurrency(result.scenarioPension.taxBenefitNow)}
                accent
              />
              <ResultRow
                label="Netto kosten nu (pensioeninleg)"
                value={formatCurrency(result.scenarioPension.netCostNow)}
              />
              <ResultRow
                label="Pensioenpot eindwaarde (bruto)"
                value={formatCurrency(result.scenarioPension.futureValueGross)}
              />
              <ResultRow
                label="Pensioenpot eindwaarde (netto indicatief)"
                value={formatCurrency(result.scenarioPension.futureValueNetIndicative)}
              />
              <ResultRow
                label="Vrij beleggen eindwaarde (bruto)"
                value={formatCurrency(result.scenarioFreeInvesting.futureValueGross)}
              />
              <ResultRow
                label="Vrij beleggen eindwaarde (netto indicatief)"
                value={formatCurrency(result.scenarioFreeInvesting.futureValueNetIndicative)}
              />
              {result.scenarioFreeInvesting.additionalBox3TaxIndicative !== undefined ? (
                <ResultRow
                  label="Indicatief extra box 3-effect"
                  value={formatCurrency(result.scenarioFreeInvesting.additionalBox3TaxIndicative)}
                />
              ) : null}
              <ResultRow
                label="Verschil pensioen minus vrij beleggen"
                value={formatCurrency(result.comparison.netDifferencePensionMinusInvesting)}
                accent
              />
              <ResultRow
                label="Flexibiliteitsscore pensioen"
                value={`${result.comparison.pensionFitScore}/100`}
              />
              <ResultRow
                label="Flexibiliteitsscore vrij beleggen"
                value={`${result.comparison.investingFitScore}/100`}
              />
            </div>
            <p className="mt-4 text-[13px] leading-[1.65] text-[var(--ink-2)]">
              {result.comparison.headline}
            </p>
          </div>
        ) : null}

        <ToolDisclosure
          title="Hoe rekenen we dit?"
          subtitle="Indicatief model, geen officiële jaarruimte- of aangifteberekening."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>1) Pensioeninleg wordt begrensd op de ingevulde beschikbare jaarruimte.</p>
              <p>
                2) Box 1-voordeel nu gebruikt het marginale box 1-tarief ({formatPercent(result.currentTaxRateUsed)}%),
                tenzij je zelf een percentage invult.
              </p>
              <p>3) Beide scenario&apos;s groeien met hetzelfde verwachte rendement over dezelfde horizon.</p>
              <p>4) Vrij beleggen kan optioneel een indicatief box 3-effect meenemen.</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Voorbeeldinterpretatie"
          subtitle="Per jaar inzicht in opbouw met en zonder box 3-heffing."
        >
          {result ? (
            <div className="space-y-4 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>
                Deze planning laat per jaar zien hoe de pot zich ontwikkelt. Bij vrij
                beleggen trekken we de indicatieve box 3-heffing jaarlijks van de
                waarde af, zodat die heffing niet verder meecompoundt.
              </p>

              <div className="overflow-hidden rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-3">
                <AreaChart
                  height={220}
                  yTicks={getAdaptiveEuroTicks(
                    Math.max(
                      ...result.wealthPlanning.points.map((point) =>
                        Math.max(
                          point.pensionNetIndicative,
                          point.investingGrossWithoutBox3,
                          point.investingNetAfterBox3,
                        ),
                      ),
                    ),
                  )}
                  series={[
                    {
                      color: "oklch(0.58 0.15 238)",
                      points: result.wealthPlanning.points.map(
                        (point) => point.pensionNetIndicative,
                      ),
                    },
                    {
                      color: "oklch(0.62 0.13 152)",
                      points: result.wealthPlanning.points.map(
                        (point) => point.investingGrossWithoutBox3,
                      ),
                    },
                    {
                      color: "oklch(0.56 0.18 28)",
                      points: result.wealthPlanning.points.map(
                        (point) => point.investingNetAfterBox3,
                      ),
                    },
                  ]}
                />
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[var(--soft)]">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[oklch(0.58_0.15_238)]" />
                    Pensioen netto indicatief
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[oklch(0.62_0.13_152)]" />
                    Beleggen zonder box 3
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[oklch(0.56_0.18_28)]" />
                    Beleggen na box 3
                  </span>
                </div>
                <div className="mt-2 text-[12px] text-[var(--soft)]">
                  Jaarmarkeringen:{" "}
                  {getAdaptiveYearTicks(result.horizonYears).join(" · ")}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--hair)] text-left">
                      <th className="py-2 pr-4">Jaar</th>
                      <th className="py-2 pr-4 text-right">Pensioen netto</th>
                      <th className="py-2 pr-4 text-right">Beleggen zonder box 3</th>
                      <th className="py-2 pr-4 text-right">Beleggen na box 3</th>
                      <th className="py-2 pr-4 text-right">Box 3 dit jaar</th>
                      <th className="py-2 text-right">Cumulatieve box 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.wealthPlanning.points.map((point) => (
                      <tr key={point.year} className="border-b border-[var(--hair)]/65">
                        <td className="py-2 pr-4">{point.year}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(point.pensionNetIndicative)}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(point.investingGrossWithoutBox3)}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(point.investingNetAfterBox3)}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(point.box3TaxThisYear)}</td>
                        <td className="py-2 text-right">{formatCurrency(point.cumulativeBox3Tax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-[var(--hair)] bg-white p-3">
                <ResultRow
                  label="Totaal betaalde box 3-heffing over de horizon"
                  value={formatCurrency(result.wealthPlanning.totalBox3TaxPaid)}
                />
                <ResultRow
                  label="Eindvermogen vrij beleggen zonder box 3"
                  value={formatCurrency(result.wealthPlanning.endInvestingWithoutBox3)}
                />
                <ResultRow
                  label="Eindvermogen vrij beleggen na box 3"
                  value={formatCurrency(result.wealthPlanning.endInvestingAfterBox3)}
                />
              </div>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Welke aannames gebruiken we?"
          subtitle="Kernafweging tussen fiscaal voordeel nu en flexibiliteit later."
        >
          {result ? (
            <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.guidance.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Waar moet je op letten?"
          subtitle="Controleer jaarruimte en fiscale details altijd apart."
        >
          {result ? (
            <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </ToolDisclosure>
      </section>
    </CalculatorShell>
  );
}
