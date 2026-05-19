"use client";

import { useState } from "react";
import { AreaChart } from "@/components/charts";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { Pill } from "@/components/ui";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getStudentDebtVsInvestingDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import {
  calculateStudyDebtVsInvesting,
  type CalculatorInput,
} from "./logic";

const DEFAULT_FINANCIAL_YEAR = getDefaultFinancialYear();

type FormState = {
  monthlyAmount: string;
  annualDebtRate: string;
  annualInvestmentReturn: string;
  years: string;
  box3EffectEnabled: boolean;
  taxYear: string;
  hasFiscalPartner: boolean;
  box3BankDeposits: string;
  box3InvestmentsAndOtherAssets: string;
  box3Debts: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  monthlyAmount: "150",
  annualDebtRate: "2.56",
  annualInvestmentReturn: "6",
  years: "10",
  box3EffectEnabled: false,
  taxYear: String(DEFAULT_FINANCIAL_YEAR),
  hasFiscalPartner: false,
  box3BankDeposits: "0",
  box3InvestmentsAndOtherAssets: "0",
  box3Debts: "0",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

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

  const monthlyAmount = Number(values.monthlyAmount);
  if (!Number.isFinite(monthlyAmount) || monthlyAmount < 0) {
    errors.monthlyAmount = "Voer een geldig maandbedrag van 0 of hoger in.";
  }

  const annualDebtRate = Number(values.annualDebtRate);
  if (!Number.isFinite(annualDebtRate) || annualDebtRate < 0 || annualDebtRate > 100) {
    errors.annualDebtRate = "Gebruik een rentepercentage tussen 0 en 100.";
  }

  const annualInvestmentReturn = Number(values.annualInvestmentReturn);
  if (
    !Number.isFinite(annualInvestmentReturn) ||
    annualInvestmentReturn < 0 ||
    annualInvestmentReturn > 100
  ) {
    errors.annualInvestmentReturn =
      "Gebruik een verwacht rendement tussen 0 en 100.";
  }

  const years = Number(values.years);
  if (!Number.isFinite(years) || years <= 0 || years > 60) {
    errors.years = "Kies een looptijd groter dan 0 en maximaal 60 jaar.";
  }

  const taxYear = Number(values.taxYear);
  if (
    values.box3EffectEnabled &&
    (!Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2200)
  ) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }

  const box3BankDeposits = Number(values.box3BankDeposits);
  if (
    values.box3EffectEnabled &&
    (!Number.isFinite(box3BankDeposits) || box3BankDeposits < 0)
  ) {
    errors.box3BankDeposits = "Gebruik 0 of een hoger bedrag.";
  }

  const box3InvestmentsAndOtherAssets = Number(values.box3InvestmentsAndOtherAssets);
  if (
    values.box3EffectEnabled &&
    (!Number.isFinite(box3InvestmentsAndOtherAssets) ||
      box3InvestmentsAndOtherAssets < 0)
  ) {
    errors.box3InvestmentsAndOtherAssets = "Gebruik 0 of een hoger bedrag.";
  }

  const box3Debts = Number(values.box3Debts);
  if (values.box3EffectEnabled && (!Number.isFinite(box3Debts) || box3Debts < 0)) {
    errors.box3Debts = "Gebruik 0 of een hoger bedrag.";
  }

  const parsedValues: CalculatorInput | null =
    Object.keys(errors).length === 0
      ? {
          monthlyAmount,
          annualDebtRate,
          annualInvestmentReturn,
          years,
          box3EffectEnabled: values.box3EffectEnabled,
          taxYear: values.box3EffectEnabled ? taxYear : undefined,
          hasFiscalPartner: values.hasFiscalPartner,
          box3BankDeposits: values.box3EffectEnabled ? box3BankDeposits : undefined,
          box3InvestmentsAndOtherAssets: values.box3EffectEnabled
            ? box3InvestmentsAndOtherAssets
            : undefined,
          box3Debts: values.box3EffectEnabled ? box3Debts : undefined,
        }
      : null;

  return {
    errors,
    parsedValues,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getStudentDebtVsInvestingDefaultsFromProfile(profile);
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
  const result = parsedValues ? calculateStudyDebtVsInvesting(parsedValues) : null;
  const hasErrors = Object.keys(errors).length > 0;
  const chartSeries = result
    ? [
        {
          color: "oklch(46% 0.07 232)",
          points: result.projections.map((item) => item.expectedInvestmentValue),
        },
        {
          color: "oklch(54% 0.10 152)",
          points: result.projections.map((item) => item.debtStrategyValue),
        },
      ]
    : null;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyProfileValues() {
    setFormValues((current) => mergeProfilePatchIntoValues(current, profilePatch));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Scenario
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Vul je scenario in
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze vergelijking helpt je om met een paar heldere aannames meer inzicht
            te krijgen in twee routes: extra aflossen of vooruitkijken via beleggen.
            Gebruik de uitkomst als praktische indicatie, niet als persoonlijk
            advies.
          </p>
        </div>

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
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Maandbedrag
            </span>
            <input
              inputMode="decimal"
              value={formValues.monthlyAmount}
              onChange={(event) => updateField("monthlyAmount", event.target.value)}
              aria-invalid={Boolean(errors.monthlyAmount)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.monthlyAmount} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Rente studieschuld per jaar (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualDebtRate}
              onChange={(event) => updateField("annualDebtRate", event.target.value)}
              aria-invalid={Boolean(errors.annualDebtRate)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualDebtRate} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht beleggingsrendement per jaar (%)
            </span>
            <input
              inputMode="decimal"
              value={formValues.annualInvestmentReturn}
              onChange={(event) =>
                updateField("annualInvestmentReturn", event.target.value)
              }
              aria-invalid={Boolean(errors.annualInvestmentReturn)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.annualInvestmentReturn} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Looptijd in jaren
            </span>
            <input
              inputMode="decimal"
              value={formValues.years}
              onChange={(event) => updateField("years", event.target.value)}
              aria-invalid={Boolean(errors.years)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.years} />
          </label>

          <label className="grid gap-2 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Geavanceerde aanname
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.box3EffectEnabled}
                onChange={(event) =>
                  updateField("box3EffectEnabled", event.target.checked)
                }
                className="size-4 accent-[var(--accent)]"
              />
              Box 3-effect indicatief meenemen
            </span>
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              Zet dit alleen aan als je ook wilt zien wat een indicatieve box 3-heffing
              met je beleggingsscenario kan doen.
            </p>
          </label>

          {formValues.box3EffectEnabled ? (
            <>
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Belastingjaar
                </span>
                <input
                  inputMode="numeric"
                  value={formValues.taxYear}
                  onChange={(event) => updateField("taxYear", event.target.value)}
                  aria-invalid={Boolean(errors.taxYear)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.taxYear} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Fiscale partner
                </span>
                <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={formValues.hasFiscalPartner}
                    onChange={(event) =>
                      updateField("hasFiscalPartner", event.target.checked)
                    }
                    className="size-4 accent-[var(--accent)]"
                  />
                  Ja, reken met partnervrijstelling
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 banktegoeden / spaargeld
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.box3BankDeposits}
                  onChange={(event) =>
                    updateField("box3BankDeposits", event.target.value)
                  }
                  aria-invalid={Boolean(errors.box3BankDeposits)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.box3BankDeposits} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 beleggingen / overige bezittingen
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.box3InvestmentsAndOtherAssets}
                  onChange={(event) =>
                    updateField("box3InvestmentsAndOtherAssets", event.target.value)
                  }
                  aria-invalid={Boolean(errors.box3InvestmentsAndOtherAssets)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.box3InvestmentsAndOtherAssets} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3 schulden
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.box3Debts}
                  onChange={(event) => updateField("box3Debts", event.target.value)}
                  aria-invalid={Boolean(errors.box3Debts)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.box3Debts} />
              </label>
            </>
          ) : null}
        </div>

        {hasErrors ? (
          <div className="mt-6 rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
            Controleer de invoervelden hierboven. Zodra alle waarden geldig zijn,
            krijg je weer een helder scenario met vergelijkbare uitkomsten.
          </div>
        ) : null}

        <div className="mt-6 border-t border-[var(--hair)] pt-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Uitgangspunt
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool vergelijkt twee simpele routes met hetzelfde maandbedrag. Dat
            maakt de keuze niet automatisch makkelijk, maar wel beter uitlegbaar.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Indicatieve uitkomst
            </div>
            {result ? (
              <Pill tone={result.difference >= 0 ? "pos" : "neg"}>
                {result.difference >= 0 ? "Beleggen hoger" : "Aflossen sterker"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.difference)}
              </div>
              <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.7] text-white/75">
                Verschil tussen beleggen en aflossen in dit scenario. Positief
                betekent meer verwachte waarde bij beleggen. Negatief betekent dat
                extra aflossen hier financieel steviger uitkomt.
              </p>
              {result.box3Scenario ? (
                <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.65] text-white/70">
                  Met indicatief box 3-effect wordt het beleggingsscenario ongeveer{" "}
                  {formatCurrency(result.box3Scenario.additionalBox3TaxIndicative)} lager.
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige invoerwaarden in om de scenariovergelijking zichtbaar te
              maken.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat dit scenario laat zien
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            De rekensom blijft bewust simpel en transparant. Aflossen wordt benaderd
            via de schuld­rente, beleggen via hetzelfde maandbedrag met het opgegeven
            rendement, zodat je de afweging eerlijk naast elkaar kunt zetten.
          </p>
          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Totale extra aflossing"
                value={formatCurrency(result.totalExtraRepayment)}
                sub="Zelf gekozen inleg binnen de volledige looptijd"
              />
              <ResultRow
                label="Indicatieve rentebesparing"
                value={formatCurrency(result.indicativeInterestSavings)}
                sub="Benadering van het voordeel van sneller aflossen"
              />
              <ResultRow
                label="Verwachte waarde bij beleggen"
                value={formatCurrency(result.expectedInvestmentValue)}
                sub="Zelfde maandbedrag met het gekozen rendement"
              />
              <ResultRow
                label="Verschil beleggen minus aflossen"
                value={formatCurrency(result.difference)}
                sub="De kernuitkomst van deze vergelijking"
                accent={result.difference >= 0}
              />
              {result.box3Scenario ? (
                <>
                  <ResultRow
                    label="Indicatieve extra box 3-heffing"
                    value={formatCurrency(result.box3Scenario.additionalBox3TaxIndicative)}
                    sub="Verschil tussen box 3 zonder en met beleggingsscenario"
                  />
                  <ResultRow
                    label="Verschil na box 3-indicatie"
                    value={formatCurrency(
                      result.box3Scenario.differenceRepaymentVsInvestingAfterBox3,
                    )}
                    sub="Beleggingsuitkomst minus aflossingsuitkomst, na indicatieve box 3-correctie"
                    accent={result.box3Scenario.differenceRepaymentVsInvestingAfterBox3 >= 0}
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {result && chartSeries ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Ontwikkeling in de tijd
                </div>
                <div className="mt-1 font-serif text-[20px] tracking-[-0.015em] text-[var(--ink)]">
                  Twee scenario&apos;s naast elkaar
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(46%_0.07_232)]" />
                  Beleggen
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-[oklch(54%_0.10_152)]" />
                  Aflossen
                </span>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <AreaChart width={620} height={220} series={chartSeries} />
              <div className="axis mt-1 flex items-center justify-between">
                {result.projections.map((point) => (
                  <span key={point.year}>jaar {point.year}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <ToolDisclosure
          title="Box 3-effect op beleggen"
          subtitle="Optionele verdieping: indicatieve extra box 3-heffing op het beleggingsscenario."
        >
          {result?.box3Scenario ? (
            <div className="space-y-4 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>
                Dit is een indicatie. Box 3-regels en forfaits kunnen wijzigen en je
                volledige fiscale situatie kan anders uitpakken.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultRow
                  label="Belastingjaar"
                  value={String(result.box3Scenario.year)}
                  sub="Gebruikt voor de forfaitaire box 3-aannames"
                />
                <ResultRow
                  label="Fiscale partner"
                  value={result.box3Scenario.hasFiscalPartner ? "Ja" : "Nee"}
                  sub="Bepaalt hoogte van heffingsvrij vermogen"
                />
                <ResultRow
                  label="Banktegoeden"
                  value={formatCurrency(result.box3Scenario.usedBankDeposits)}
                  sub="Invoer voor box 3 banktegoeden/spaargeld"
                />
                <ResultRow
                  label="Beleggingen/overige bezittingen"
                  value={formatCurrency(
                    result.box3Scenario.usedInvestmentsAndOtherAssets,
                  )}
                  sub="Bestaande box 3-beleggingscomponent voor dit scenario"
                />
                <ResultRow
                  label="Box 3-schulden"
                  value={formatCurrency(result.box3Scenario.usedDebts)}
                  sub="Verlagen indicatief de rendementsgrondslag"
                />
                <ResultRow
                  label="Heffingsvrij vermogen"
                  value={formatCurrency(result.box3Scenario.taxFreeAllowance)}
                  sub="Afhankelijk van single/partnerstatus"
                />
                <ResultRow
                  label="Forfait banktegoeden"
                  value={`${formatPercent(result.box3Scenario.deemedReturnBankDepositsRate)}%`}
                  sub="Indicatief percentage voor banktegoeden"
                />
                <ResultRow
                  label="Forfait beleggingen"
                  value={`${formatPercent(result.box3Scenario.deemedReturnInvestmentsRate)}%`}
                  sub="Indicatief percentage voor beleggingen/overige bezittingen"
                />
                <ResultRow
                  label="Forfait schulden"
                  value={`${formatPercent(result.box3Scenario.deemedReturnDebtsRate)}%`}
                  sub="Indicatieve schuldcorrectie in box 3"
                />
                <ResultRow
                  label="Box 3-tarief"
                  value={`${formatPercent(result.box3Scenario.box3TaxRate)}%`}
                  sub="Tarief op belastbaar forfaitair rendement"
                />
                <ResultRow
                  label="Box 3 zonder beleggingsscenario"
                  value={formatCurrency(result.box3Scenario.box3TaxWithoutScenario)}
                  sub="Indicatieve heffing op bestaande invoer"
                />
                <ResultRow
                  label="Box 3 met beleggingsscenario"
                  value={formatCurrency(result.box3Scenario.box3TaxWithInvestingScenario)}
                  sub="Indicatieve heffing inclusief beleggingsscenario"
                />
                <ResultRow
                  label="Extra box 3-heffing indicatief"
                  value={formatCurrency(result.box3Scenario.additionalBox3TaxIndicative)}
                  sub="Verschil tussen beide indicatieve box 3-uitkomsten"
                />
                <ResultRow
                  label="Netto beleggingsuitkomst na box 3-indicatie"
                  value={formatCurrency(result.box3Scenario.netInvestingOutcomeAfterBox3)}
                  sub="Verwachte beleggingswaarde minus indicatieve extra box 3-heffing"
                />
              </div>
              {result.box3Scenario.warnings.length > 0 ? (
                <ul className="space-y-2 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                  {result.box3Scenario.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
              Zet “Box 3-effect indicatief meenemen” aan bij de geavanceerde aannames
              om deze verdieping te tonen.
            </p>
          )}
        </ToolDisclosure>

        <div className="rounded-[1.5rem] border hair bg-white p-5 shadow-paper">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
            Belangrijk om te onthouden
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool blijft een vereenvoudigde vergelijking. Met de optionele box
            3-indicatie krijg je extra context, maar geen volledige belastingaangifte,
            geen koerszekerheid en geen persoonlijk advies. Het doel is vooral: betere
            vervolgvragen en scherpere keuzes.
          </p>
        </div>
      </section>
    </div>
  );
}
