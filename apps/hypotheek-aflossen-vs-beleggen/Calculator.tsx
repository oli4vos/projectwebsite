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
import { getHypotheekAflossenVsBeleggenDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  calculateHypotheekAflossenVsBeleggen,
  type HypotheekAflossenVsBeleggenInput,
} from "./logic";

type FormState = {
  remainingMortgageDebt: string;
  mortgageRate: string;
  remainingTermYears: string;
  oneTimeExtraRepayment: string;
  annualExtraRepayment: string;
  taxableIncome: string;
  includeMortgageInterestDeduction: boolean;
  expectedAnnualReturn: string;
  investmentHorizonYears: string;
  includeBox3Effect: boolean;
  currentInvestableAssets: string;
  hasFiscalPartner: boolean;
  taxYear: string;
  keepBuffer: boolean;
  minimumBuffer: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  remainingMortgageDebt: "300000",
  mortgageRate: "4",
  remainingTermYears: "25",
  oneTimeExtraRepayment: "10000",
  annualExtraRepayment: "2400",
  taxableIncome: "60000",
  includeMortgageInterestDeduction: true,
  expectedAnnualReturn: "5",
  investmentHorizonYears: "20",
  includeBox3Effect: true,
  currentInvestableAssets: "30000",
  hasFiscalPartner: false,
  taxYear: String(getDefaultFinancialYear()),
  keepBuffer: true,
  minimumBuffer: "15000",
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
  const remainingMortgageDebt = parseOptionalNumber(values.remainingMortgageDebt);
  const mortgageRate = parseOptionalNumber(values.mortgageRate);
  const remainingTermYears = parseOptionalNumber(values.remainingTermYears);
  const oneTimeExtraRepayment = parseOptionalNumber(values.oneTimeExtraRepayment);
  const annualExtraRepayment = parseOptionalNumber(values.annualExtraRepayment);
  const taxableIncome = parseOptionalNumber(values.taxableIncome);
  const expectedAnnualReturn = parseOptionalNumber(values.expectedAnnualReturn);
  const investmentHorizonYears = parseOptionalNumber(values.investmentHorizonYears);
  const currentInvestableAssets = parseOptionalNumber(values.currentInvestableAssets);
  const taxYear = parseOptionalNumber(values.taxYear);
  const minimumBuffer = parseOptionalNumber(values.minimumBuffer);

  for (const [field, value] of [
    ["remainingMortgageDebt", remainingMortgageDebt],
    ["oneTimeExtraRepayment", oneTimeExtraRepayment],
    ["annualExtraRepayment", annualExtraRepayment],
    ["taxableIncome", taxableIncome],
    ["currentInvestableAssets", currentInvestableAssets],
    ["minimumBuffer", minimumBuffer],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      errors[field] = "Gebruik 0 of een hoger bedrag.";
    }
  }

  if (
    mortgageRate === undefined ||
    !Number.isFinite(mortgageRate) ||
    mortgageRate < 0 ||
    mortgageRate > 100
  ) {
    errors.mortgageRate = "Gebruik een rente tussen 0 en 100.";
  }
  if (
    remainingTermYears === undefined ||
    !Number.isFinite(remainingTermYears) ||
    remainingTermYears <= 0 ||
    remainingTermYears > 60
  ) {
    errors.remainingTermYears = "Gebruik een looptijd tussen 1 en 60 jaar.";
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
    investmentHorizonYears === undefined ||
    !Number.isFinite(investmentHorizonYears) ||
    investmentHorizonYears <= 0 ||
    investmentHorizonYears > 60
  ) {
    errors.investmentHorizonYears = "Gebruik een horizon tussen 1 en 60 jaar.";
  }
  if (
    taxYear === undefined ||
    !Number.isFinite(taxYear) ||
    taxYear < 2000 ||
    taxYear > 2200
  ) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }

  const parsedValues: HypotheekAflossenVsBeleggenInput | null =
    Object.keys(errors).length === 0
      ? {
          remainingMortgageDebt: remainingMortgageDebt ?? 0,
          mortgageRate: mortgageRate ?? 0,
          remainingTermYears: remainingTermYears ?? 0,
          oneTimeExtraRepayment: oneTimeExtraRepayment ?? 0,
          annualExtraRepayment: annualExtraRepayment ?? 0,
          taxableIncome: taxableIncome ?? 0,
          includeMortgageInterestDeduction: values.includeMortgageInterestDeduction,
          expectedAnnualReturn: expectedAnnualReturn ?? 0,
          investmentHorizonYears: investmentHorizonYears ?? 0,
          includeBox3Effect: values.includeBox3Effect,
          currentInvestableAssets: currentInvestableAssets ?? 0,
          hasFiscalPartner: values.hasFiscalPartner,
          taxYear: taxYear ?? getDefaultFinancialYear(),
          keepBuffer: values.keepBuffer,
          minimumBuffer: minimumBuffer ?? 0,
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
  const profilePatch = getHypotheekAflossenVsBeleggenDefaultsFromProfile(profile);
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
  const { errors, parsedValues } = validateForm(formValues);
  const result = parsedValues ? calculateHypotheekAflossenVsBeleggen(parsedValues) : null;

  const mobileFlow = useMobileFieldFlow([
    "remainingMortgageDebt",
    "mortgageRate",
    "remainingTermYears",
    "oneTimeExtraRepayment",
    "annualExtraRepayment",
    "taxableIncome",
    "includeMortgageInterestDeduction",
    "expectedAnnualReturn",
    "investmentHorizonYears",
    "includeBox3Effect",
    "currentInvestableAssets",
    "hasFiscalPartner",
    "taxYear",
    "keepBuffer",
    "minimumBuffer",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      remainingMortgageDebt: errors.remainingMortgageDebt,
      mortgageRate: errors.mortgageRate,
      remainingTermYears: errors.remainingTermYears,
      oneTimeExtraRepayment: errors.oneTimeExtraRepayment,
      annualExtraRepayment: errors.annualExtraRepayment,
      taxableIncome: errors.taxableIncome,
      expectedAnnualReturn: errors.expectedAnnualReturn,
      investmentHorizonYears: errors.investmentHorizonYears,
      currentInvestableAssets: errors.currentInvestableAssets,
      taxYear: errors.taxYear,
      minimumBuffer: errors.minimumBuffer,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setFormValues((current) => mergeProfilePatchIntoValues(current, profilePatch));
  }

  return (
    <CalculatorShell>
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Hypotheekkeuze
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Hypotheek aflossen of beleggen?
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Vergelijk extra aflossen met vrij beleggen, inclusief renteaftrek en optioneel
          box 3-effect.
        </p>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Profielwaarden gevonden in deze browser.</span>
            <button
              type="button"
              onClick={applyProfileValues}
              className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              Gebruik profielwaarden
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          <label className={mobileFlow.getFieldClassName("remainingMortgageDebt")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende hypotheekschuld
            </span>
            <input
              inputMode="decimal"
              value={formValues.remainingMortgageDebt}
              onChange={(event) => updateField("remainingMortgageDebt", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("remainingMortgageDebt", Boolean(errors.remainingMortgageDebt))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingMortgageDebt} />
          </label>

          <label className={mobileFlow.getFieldClassName("mortgageRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekrente (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.mortgageRate}
              onChange={(event) => updateField("mortgageRate", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("mortgageRate", Boolean(errors.mortgageRate))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.mortgageRate} />
          </label>

          <label className={mobileFlow.getFieldClassName("remainingTermYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende looptijd (jaren)
            </span>
            <input
              inputMode="numeric"
              value={formValues.remainingTermYears}
              onChange={(event) => updateField("remainingTermYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("remainingTermYears", Boolean(errors.remainingTermYears))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.remainingTermYears} />
          </label>

          <label className={mobileFlow.getFieldClassName("oneTimeExtraRepayment")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Eenmalig extra aflossen
            </span>
            <input
              inputMode="decimal"
              value={formValues.oneTimeExtraRepayment}
              onChange={(event) => updateField("oneTimeExtraRepayment", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("oneTimeExtraRepayment", Boolean(errors.oneTimeExtraRepayment))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.oneTimeExtraRepayment} />
          </label>

          <label className={mobileFlow.getFieldClassName("annualExtraRepayment")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Jaarlijks extra aflossen
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualExtraRepayment}
              onChange={(event) => updateField("annualExtraRepayment", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("annualExtraRepayment", Boolean(errors.annualExtraRepayment))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualExtraRepayment} />
          </label>

          <label className={mobileFlow.getFieldClassName("taxableIncome")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastbaar inkomen
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

          <label className={mobileFlow.getFieldClassName("includeMortgageInterestDeduction")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Hypotheekrenteaftrek meenemen
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeMortgageInterestDeduction}
                onChange={(event) =>
                  updateField("includeMortgageInterestDeduction", event.target.checked)
                }
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("expectedAnnualReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement beleggen (%)
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

          <label className={mobileFlow.getFieldClassName("investmentHorizonYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beleggingshorizon (jaren)
            </span>
            <input
              inputMode="numeric"
              value={formValues.investmentHorizonYears}
              onChange={(event) => updateField("investmentHorizonYears", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("investmentHorizonYears", Boolean(errors.investmentHorizonYears))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.investmentHorizonYears} />
          </label>

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

          <label className={mobileFlow.getFieldClassName("currentInvestableAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Huidige beleggingen/spaargeld
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

          <label className={mobileFlow.getFieldClassName("taxYear")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingjaar
            </span>
            <input
              inputMode="numeric"
              value={formValues.taxYear}
              onChange={(event) => updateField("taxYear", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("taxYear", Boolean(errors.taxYear))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.taxYear} />
          </label>

          <label className={mobileFlow.getFieldClassName("keepBuffer")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Buffer behouden prioriteren
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.keepBuffer}
                onChange={(event) => updateField("keepBuffer", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("minimumBuffer")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Minimale buffer
            </span>
            <input
              inputMode="decimal"
              value={formValues.minimumBuffer}
              onChange={(event) => updateField("minimumBuffer", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("minimumBuffer", Boolean(errors.minimumBuffer))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.minimumBuffer} />
          </label>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
          />
        </div>
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Samenvatting
            </div>
            {result ? (
              <Pill tone={result.recommendation === "beleggen" ? "pos" : result.recommendation === "aflossen" ? "accent" : "neg"}>
                {result.recommendation === "beleggen"
                  ? "Beleggen financieel hoger"
                  : result.recommendation === "aflossen"
                    ? "Aflossen financieel hoger"
                    : "Buffer eerst"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[28px] leading-none tracking-[-0.03em]">
                {result.summary}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Bij jouw aannames lijkt{" "}
                {result.differenceInvestingMinusAflossen >= 0 ? "beleggen" : "extra aflossen"}{" "}
                financieel gunstiger, maar{" "}
                {result.differenceInvestingMinusAflossen >= 0
                  ? "aflossen geeft vaak meer rust"
                  : "beleggen biedt meestal meer flexibiliteit"}
                .
              </p>
            </>
          ) : null}
        </div>

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Vergelijking
            </h3>
            <div className="mt-4">
              <ResultRow
                label="Netto voordeel extra aflossen"
                value={formatCurrency(result.netBenefitAflossen)}
                accent
              />
              <ResultRow
                label="Bruto rentebesparing aflossen"
                value={formatCurrency(result.grossInterestSaved)}
              />
              <ResultRow
                label="Gemiste hypotheekrenteaftrek"
                value={formatCurrency(result.lostMortgageInterestDeduction)}
              />
              <ResultRow
                label="Waarde beleggen (bruto)"
                value={formatCurrency(result.investingFutureValueGross)}
              />
              <ResultRow
                label="Waarde beleggen (na box 3)"
                value={formatCurrency(result.investingFutureValueNetAfterBox3)}
              />
              <ResultRow
                label="Verschil beleggen minus aflossen"
                value={formatCurrency(result.differenceInvestingMinusAflossen)}
                accent
              />
              <ResultRow
                label="Break-even rendement beleggen"
                value={
                  result.breakEvenAnnualReturn === null
                    ? "Niet binnen range"
                    : `${formatPercent(result.breakEvenAnnualReturn)}%`
                }
              />
            </div>
          </div>
        ) : null}

        <ToolDisclosure
          title="Hoe werkt hypotheekrenteaftrek?"
          subtitle="Aflossen verlaagt meestal rente en daarmee vaak ook de aftrek."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            In dit model vergelijken we bruto rentebesparing met mogelijk gemiste
            hypotheekrenteaftrek. Daardoor zie je het netto effect van extra aflossen.
          </p>
        </ToolDisclosure>

        <ToolDisclosure
          title="Wat doet box 3?"
          subtitle="Bij beleggen kan box 3 het netto eindresultaat drukken."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Box 3 meegenomen: {result.assumptions.includeBox3Effect ? "ja" : "nee"}.</p>
              <p>Totale extra box 3 in dit scenario: {formatCurrency(result.totalAdditionalBox3Tax)}.</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Waarom aflossen rust kan geven"
          subtitle="Lagere schuld en minder renterisico."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Extra aflossen verlaagt je schuld direct. Dat kan mentaal rust geven en
            maakt je gevoeligheid voor renteschommelingen kleiner.
          </p>
        </ToolDisclosure>

        <ToolDisclosure
          title="Waarom beleggen meer risico heeft"
          subtitle="Hoger verwacht rendement, maar onzeker pad."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Beleggen kan op lange termijn hoger uitkomen, maar uitkomsten schommelen.
            Gebruik dit dus als scenariovergelijking en niet als zekerheid.
          </p>
        </ToolDisclosure>

        <ToolDisclosure
          title="Wanneer buffer belangrijker is"
          subtitle="Eerst flexibiliteit, dan optimalisatie."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Als je vrije buffer onder je minimum zit, is vasthouden van liquiditeit vaak
            logischer dan direct aflossen of beleggen.
          </p>
        </ToolDisclosure>

        <ToolDisclosure title="Let op" subtitle="Indicatief model, geen financieel advies.">
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
