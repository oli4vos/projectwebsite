"use client";

import { useState } from "react";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { FieldError } from "@/components/forms/FieldError";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type { Box3Method } from "@/lib/tax";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getBox3IndicatieDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateBox3Indicatie, type Box3ToolInput } from "./logic";

const DEFAULT_YEAR = getDefaultFinancialYear();

type FormState = {
  method: Box3Method;
  year: string;
  bankDeposits: string;
  investmentsAndOtherAssets: string;
  debts: string;
  hasFiscalPartner: boolean;
  actualAnnualReturnRate: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  method: "actual",
  year: String(DEFAULT_YEAR),
  bankDeposits: "50000",
  investmentsAndOtherAssets: "25000",
  debts: "0",
  hasFiscalPartner: false,
  actualAnnualReturnRate: "5",
};

const defaultValues: FormState = {
  method: "actual",
  year: "",
  bankDeposits: "",
  investmentsAndOtherAssets: "",
  debts: "",
  hasFiscalPartner: false,
  actualAnnualReturnRate: "",
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseOptionalNumber(value: string) {
  return parseOptionalDecimalInput(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const year = parseOptionalNumber(values.year);
  const bankDeposits = parseOptionalNumber(values.bankDeposits);
  const investmentsAndOtherAssets = parseOptionalNumber(values.investmentsAndOtherAssets);
  const debts = parseOptionalNumber(values.debts);
  const actualAnnualReturnRate = parseOptionalNumber(values.actualAnnualReturnRate);

  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }

  if (
    bankDeposits === undefined ||
    !Number.isFinite(bankDeposits) ||
    bankDeposits < 0
  ) {
    errors.bankDeposits = "Gebruik 0 of een hoger bedrag.";
  }

  if (
    investmentsAndOtherAssets === undefined ||
    !Number.isFinite(investmentsAndOtherAssets) ||
    investmentsAndOtherAssets < 0
  ) {
    errors.investmentsAndOtherAssets = "Gebruik 0 of een hoger bedrag.";
  }

  if (debts === undefined || !Number.isFinite(debts) || debts < 0) {
    errors.debts = "Gebruik 0 of een hoger bedrag.";
  }

  if (
    values.method === "actual" &&
    (actualAnnualReturnRate === undefined ||
      !Number.isFinite(actualAnnualReturnRate) ||
      actualAnnualReturnRate < 0 ||
      actualAnnualReturnRate > 100)
  ) {
    errors.actualAnnualReturnRate = "Gebruik een rendement tussen 0 en 100.";
  }

  const parsedValues: Box3ToolInput | null =
    Object.keys(errors).length === 0
      ? {
          method: values.method,
          year,
          bankDeposits: bankDeposits ?? 0,
          investmentsAndOtherAssets: investmentsAndOtherAssets ?? 0,
          debts: debts ?? 0,
          hasFiscalPartner: values.hasFiscalPartner,
          actualAnnualReturnRate:
            values.method === "actual" ? actualAnnualReturnRate : undefined,
        }
      : null;

  return { errors, parsedValues };
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getBox3IndicatieDefaultsFromProfile(profile);
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
  const result = parsedValues ? calculateBox3Indicatie(parsedValues) : null;
  const mobileFlow = useMobileFieldFlow([
    "method",
    "year",
    "bankDeposits",
    "investmentsAndOtherAssets",
    "debts",
    "hasFiscalPartner",
    ...(formValues.method === "actual" ? ["actualAnnualReturnRate"] : []),
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      year: errors.year,
      bankDeposits: errors.bankDeposits,
      investmentsAndOtherAssets: errors.investmentsAndOtherAssets,
      debts: errors.debts,
      actualAnnualReturnRate: errors.actualAnnualReturnRate,
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
          Box 3
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Box 3 indicatie
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Bereken indicatief hoeveel box 3-heffing past bij jouw spaargeld,
          beleggingen en schulden. Kies tussen werkelijk rendement (default) en
          forfaitair rendement als scenario.
        </p>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Profielwaarden gevonden in deze browser.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Start met voorbeeldwaarden
            </ToolActionButton>
            <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">
              Start met profielwaarden
            </ToolActionButton>
          </div>
        ) : null}
        {!hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Start leeg en vul snel een voorbeeldscenario in.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Start met voorbeeldwaarden
            </ToolActionButton>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          <label className={mobileFlow.getFieldClassName("method")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Rekensysteem
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.method === "forfaitary"}
                onChange={(event) =>
                  updateField("method", event.target.checked ? "forfaitary" : "actual")
                }
                className="size-4 accent-[var(--accent)]"
              />
              Gebruik forfaitair rendement (default = werkelijk rendement)
            </span>
          </label>

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

          <label className={mobileFlow.getFieldClassName("bankDeposits")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Banktegoeden / spaargeld
            </span>
            <input
              inputMode="decimal"
              value={formValues.bankDeposits}
              onChange={(event) => updateField("bankDeposits", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "bankDeposits",
                Boolean(errors.bankDeposits),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.bankDeposits} />
          </label>

          <label className={mobileFlow.getFieldClassName("investmentsAndOtherAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beleggingen / overige bezittingen
            </span>
            <input
              inputMode="decimal"
              value={formValues.investmentsAndOtherAssets}
              onChange={(event) =>
                updateField("investmentsAndOtherAssets", event.target.value)
              }
              onKeyDown={mobileFlow.handleEnterAdvance(
                "investmentsAndOtherAssets",
                Boolean(errors.investmentsAndOtherAssets),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.investmentsAndOtherAssets} />
          </label>

          <label className={mobileFlow.getFieldClassName("debts")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Box 3-schulden
            </span>
            <input
              inputMode="decimal"
              value={formValues.debts}
              onChange={(event) => updateField("debts", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("debts", Boolean(errors.debts))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.debts} />
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
              Ja, gebruik partner-vrijstelling
            </span>
          </label>

          {formValues.method === "actual" ? (
            <label className={mobileFlow.getFieldClassName("actualAnnualReturnRate")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Werkelijk rendement (%)
              </span>
              <input
                inputMode="decimal"
                value={formValues.actualAnnualReturnRate}
                onChange={(event) => updateField("actualAnnualReturnRate", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "actualAnnualReturnRate",
                  Boolean(errors.actualAnnualReturnRate),
                )}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.actualAnnualReturnRate} />
            </label>
          ) : null}

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
            {result ? <Pill tone="accent">{result.method === "actual" ? "Werkelijk" : "Forfaitair"}</Pill> : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.box3Tax)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Indicatieve box 3-heffing in {result.year} op basis van je invoer.
              </p>
            </>
          ) : null}
        </div>

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Resultaatdetails
            </h3>
            <div className="mt-5">
              <ResultRow label="Totaal bezittingen" value={formatCurrency(result.assetsTotal)} />
              <ResultRow label="Totaal schulden" value={formatCurrency(result.debtsTotal)} />
              <ResultRow label="Netto vermogen" value={formatCurrency(result.netWorth)} />
              <ResultRow
                label="Heffingsvrij vermogen"
                value={formatCurrency(result.taxFreeAllowance)}
                sub="Afhankelijk van single of fiscale partner"
              />
              <ResultRow
                label="Belastbare grondslag"
                value={formatCurrency(result.taxableBase)}
              />
              <ResultRow
                label="Belastbaar (forfaitair/werkelijk) rendement"
                value={formatCurrency(result.taxableDeemedReturn)}
              />
              <ResultRow
                label="Indicatieve box 3-heffing"
                value={formatCurrency(result.box3Tax)}
                accent
              />
              <ResultRow
                label="Effectieve druk op netto vermogen"
                value={`${formatPercent(result.effectiveTaxRateOnNetWorth)}%`}
              />
            </div>
          </div>
        ) : null}

        <ToolDisclosure
          title="Welke aannames gebruiken we?"
          subtitle="Bron, percentages en status van gebruikte box 3-aannames."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.meta.sourceLabel}</p>
              <p>Gecontroleerd op: {result.meta.lastChecked}</p>
              <p>Status: {result.meta.status}</p>
              <p>Box 3-tarief: {formatPercent(result.rates.taxRate)}%</p>
              <p>Forfait banktegoeden: {formatPercent(result.rates.deemedReturnBankDeposits)}%</p>
              <p>
                Forfait beleggingen/overige bezittingen:{" "}
                {formatPercent(result.rates.deemedReturnInvestments)}%
              </p>
              <p>Forfait schulden: {formatPercent(result.rates.deemedReturnDebts)}%</p>
            </div>
          ) : null}
        </ToolDisclosure>

        {result?.warnings?.length ? (
          <div className="rounded-[1.5rem] border border-[var(--hair)] bg-[var(--paper-soft)] p-5 text-[12.5px] leading-[1.6] text-[var(--muted)]">
            <ul className="space-y-2">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </CalculatorShell>
  );
}
