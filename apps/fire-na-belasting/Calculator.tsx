"use client";

import { useState } from "react";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getFireNaBelastingDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateFireNaBelasting, type FireNaBelastingInput } from "./logic";

type FormState = {
  currentNetWorth: string;
  currentSavings: string;
  currentInvestments: string;
  monthlyContribution: string;
  yearlyContribution: string;
  expectedAnnualReturn: string;
  annualInflation: string;
  includeBox3Effect: boolean;
  taxYear: string;
  hasFiscalPartner: boolean;
  annualExpensesNow: string;
  withdrawalRate: string;
  horizonYears: string;
  riskProfile: "conservative" | "neutral" | "offensive";
  currentAge: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  currentNetWorth: "50000",
  currentSavings: "15000",
  currentInvestments: "35000",
  monthlyContribution: "750",
  yearlyContribution: "0",
  expectedAnnualReturn: "5",
  annualInflation: "2",
  includeBox3Effect: true,
  taxYear: String(getDefaultFinancialYear()),
  hasFiscalPartner: false,
  annualExpensesNow: "30000",
  withdrawalRate: "4",
  horizonYears: "40",
  riskProfile: "neutral",
  currentAge: "",
};

const defaultValues: FormState = {
  currentNetWorth: "",
  currentSavings: "",
  currentInvestments: "",
  monthlyContribution: "",
  yearlyContribution: "",
  expectedAnnualReturn: "",
  annualInflation: "",
  includeBox3Effect: true,
  taxYear: "",
  hasFiscalPartner: false,
  annualExpensesNow: "",
  withdrawalRate: "",
  horizonYears: "",
  riskProfile: "neutral",
  currentAge: "",
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

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const currentNetWorth = parseOptionalNumber(values.currentNetWorth);
  const currentSavings = parseOptionalNumber(values.currentSavings);
  const currentInvestments = parseOptionalNumber(values.currentInvestments);
  const monthlyContribution = parseOptionalNumber(values.monthlyContribution);
  const yearlyContribution = parseOptionalNumber(values.yearlyContribution);
  const expectedAnnualReturn = parseOptionalNumber(values.expectedAnnualReturn);
  const annualInflation = parseOptionalNumber(values.annualInflation);
  const taxYear = parseOptionalNumber(values.taxYear);
  const annualExpensesNow = parseOptionalNumber(values.annualExpensesNow);
  const withdrawalRate = parseOptionalNumber(values.withdrawalRate);
  const horizonYears = parseOptionalNumber(values.horizonYears);
  const currentAge = parseOptionalNumber(values.currentAge);

  for (const [field, value] of [
    ["currentNetWorth", currentNetWorth],
    ["currentSavings", currentSavings],
    ["currentInvestments", currentInvestments],
    ["monthlyContribution", monthlyContribution],
    ["yearlyContribution", yearlyContribution],
    ["annualExpensesNow", annualExpensesNow],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      errors[field] = "Gebruik 0 of een hoger bedrag.";
    }
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
    annualInflation === undefined ||
    !Number.isFinite(annualInflation) ||
    annualInflation < 0 ||
    annualInflation > 100
  ) {
    errors.annualInflation = "Gebruik een inflatie tussen 0 en 100.";
  }

  if (
    withdrawalRate === undefined ||
    !Number.isFinite(withdrawalRate) ||
    withdrawalRate <= 0 ||
    withdrawalRate > 20
  ) {
    errors.withdrawalRate = "Gebruik een withdrawal rate tussen 0,1 en 20.";
  }

  if (taxYear === undefined || !Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2200) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
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
    currentAge !== undefined &&
    (!Number.isFinite(currentAge) || currentAge < 0 || currentAge > 120)
  ) {
    errors.currentAge = "Gebruik een leeftijd tussen 0 en 120.";
  }

  const parsedValues: FireNaBelastingInput | null =
    Object.keys(errors).length === 0
      ? {
          currentNetWorth: currentNetWorth ?? 0,
          currentSavings: currentSavings ?? 0,
          currentInvestments: currentInvestments ?? 0,
          monthlyContribution: monthlyContribution ?? 0,
          yearlyContribution: yearlyContribution ?? 0,
          expectedAnnualReturn: expectedAnnualReturn ?? 0,
          annualInflation: annualInflation ?? 0,
          includeBox3Effect: values.includeBox3Effect,
          taxYear: taxYear ?? getDefaultFinancialYear(),
          hasFiscalPartner: values.hasFiscalPartner,
          annualExpensesNow: annualExpensesNow ?? 0,
          withdrawalRate: withdrawalRate ?? 0,
          horizonYears: horizonYears ?? 0,
          riskProfile: values.riskProfile,
          currentAge,
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
  const profilePatch = getFireNaBelastingDefaultsFromProfile(profile);
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
  const result = parsedValues ? calculateFireNaBelasting(parsedValues) : null;

  const mobileFlow = useMobileFieldFlow([
    "currentNetWorth",
    "currentSavings",
    "currentInvestments",
    "monthlyContribution",
    "yearlyContribution",
    "expectedAnnualReturn",
    "annualInflation",
    "includeBox3Effect",
    "taxYear",
    "hasFiscalPartner",
    "annualExpensesNow",
    "withdrawalRate",
    "horizonYears",
    "riskProfile",
    "currentAge",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      currentNetWorth: errors.currentNetWorth,
      currentSavings: errors.currentSavings,
      currentInvestments: errors.currentInvestments,
      monthlyContribution: errors.monthlyContribution,
      yearlyContribution: errors.yearlyContribution,
      expectedAnnualReturn: errors.expectedAnnualReturn,
      annualInflation: errors.annualInflation,
      taxYear: errors.taxYear,
      annualExpensesNow: errors.annualExpensesNow,
      withdrawalRate: errors.withdrawalRate,
      horizonYears: errors.horizonYears,
      currentAge: errors.currentAge,
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
          FIRE-planning
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          FIRE na belasting
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Bereken indicatief wanneer je financieel onafhankelijk kunt zijn met
          rendement, inflatie en optioneel box 3-effect.
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
          {[
            ["currentNetWorth", "Huidig vrij vermogen"],
            ["currentSavings", "Spaargeld"],
            ["currentInvestments", "Beleggingen"],
            ["monthlyContribution", "Maandelijkse inleg"],
            ["yearlyContribution", "Jaarlijkse extra inleg"],
          ].map(([field, label]) => (
            <label key={field} className={mobileFlow.getFieldClassName(field)}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                {label}
              </span>
              <input
                inputMode="decimal"
                value={formValues[field as keyof FormState] as string}
                onChange={(event) =>
                  updateField(field as keyof FormState, event.target.value as never)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(field, Boolean(errors[field as keyof FormState]))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors[field as keyof FormState]} />
            </label>
          ))}

          {[
            ["expectedAnnualReturn", "Verwacht jaarlijks rendement (%)"],
            ["annualInflation", "Inflatie (%)"],
            ["taxYear", "Belastingjaar"],
            ["annualExpensesNow", "Jaarlijkse uitgaven nu"],
            ["withdrawalRate", "Withdrawal rate (%)"],
            ["horizonYears", "Horizon (jaren)"],
            ["currentAge", "Huidige leeftijd (optioneel)"],
          ].map(([field, label]) => (
            <label key={field} className={mobileFlow.getFieldClassName(field)}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                {label}
              </span>
              <input
                inputMode="decimal"
                value={formValues[field as keyof FormState] as string}
                onChange={(event) =>
                  updateField(field as keyof FormState, event.target.value as never)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(field, Boolean(errors[field as keyof FormState]))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors[field as keyof FormState]} />
            </label>
          ))}

          <label className={mobileFlow.getFieldClassName("includeBox3Effect")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Box 3-effect meenemen
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

          <label className={mobileFlow.getFieldClassName("riskProfile")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Risicoprofiel
            </span>
            <select
              value={formValues.riskProfile}
              onChange={(event) =>
                updateField("riskProfile", event.target.value as FormState["riskProfile"])
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="conservative">Voorzichtig</option>
              <option value="neutral">Neutraal</option>
              <option value="offensive">Offensief</option>
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
              Samenvatting
            </div>
            {result ? (
              <Pill tone={result.fireReachedWithinHorizon ? "pos" : "neg"}>
                {result.fireReachedWithinHorizon ? "FIRE binnen horizon" : "FIRE niet gehaald"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[34px] leading-none tracking-[-0.03em]">
                {result.yearsToFire !== null
                  ? `${result.yearsToFire} jaar`
                  : "Niet binnen horizon"}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                {result.yearsToFire !== null
                  ? `Je bereikt FIRE indicatief over ${result.yearsToFire} jaar.`
                  : "Binnen deze horizon haal je FIRE nog niet."}
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
              <ResultRow label="FIRE-nummer nu" value={formatCurrency(result.fireNumberToday)} accent />
              <ResultRow
                label="Jaren tot FIRE"
                value={result.yearsToFire !== null ? String(result.yearsToFire) : "Niet gehaald"}
              />
              <ResultRow
                label="Vermogen op eindhorizon"
                value={formatCurrency(result.endAssetsAtHorizon)}
              />
              <ResultRow
                label="Jaarlijkse inleg (gebruikt)"
                value={formatCurrency(result.annualContributionUsed)}
              />
              <ResultRow
                label="Totale box 3-heffing in model"
                value={formatCurrency(result.totalBox3TaxPaid)}
              />
              <ResultRow
                label="Benodigde maandinleg voor FIRE binnen horizon"
                value={
                  result.requiredMonthlyContributionToReachWithinHorizon !== null
                    ? formatCurrency(result.requiredMonthlyContributionToReachWithinHorizon)
                    : "Niet haalbaar binnen horizon"
                }
              />
            </div>
          </div>
        ) : null}

        <ToolDisclosure
          title="Hoe rekenen we FIRE?"
          subtitle="Indicatief model op basis van jaarlijkse projectie."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>1) FIRE-doel = jaarlijkse uitgaven / withdrawal rate.</p>
              <p>2) Vermogen groeit jaarlijks met rendement en inleg.</p>
              <p>3) Uitgaven en FIRE-doel groeien mee met inflatie.</p>
              <p>4) Bij box 3 aan wordt jaarlijkse heffing via centrale tax-laag afgetrokken.</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Tijdlijn"
          subtitle="Per jaar: vermogen, bijdrage, groei, box 3 en FIRE-doel."
        >
          {result ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--hair)] text-left">
                    <th className="py-2 pr-4">Jaar</th>
                    <th className="py-2 pr-4 text-right">Vermogen</th>
                    <th className="py-2 pr-4 text-right">Inleg</th>
                    <th className="py-2 pr-4 text-right">Groei</th>
                    <th className="py-2 pr-4 text-right">Box 3</th>
                    <th className="py-2 text-right">FIRE-doel</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projection.map((point) => (
                    <tr key={point.year} className="border-b border-[var(--hair)]/65">
                      <td className="py-2 pr-4">
                        {point.year}
                        {point.age !== undefined ? ` (leeftijd ${point.age})` : ""}
                      </td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(point.assets)}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(point.contributions)}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(point.growth)}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(point.box3Tax)}</td>
                      <td className="py-2 text-right">{formatCurrency(point.fireTarget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Gevoelige aannames"
          subtitle="Waarom de uitkomst kan afwijken van de praktijk."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Verwacht rendement: {formatPercent(result.assumptions.expectedAnnualReturn)}%</p>
              <p>Inflatie: {formatPercent(result.assumptions.annualInflation)}%</p>
              <p>Withdrawal rate: {formatPercent(result.assumptions.withdrawalRate)}%</p>
              <p>Horizon: {result.assumptions.horizonYears} jaar</p>
              <p>Box 3 in model: {result.assumptions.includeBox3Effect ? "ja" : "nee"}</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Let op"
          subtitle="Rendement is onzeker en dit is geen persoonlijk advies."
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
