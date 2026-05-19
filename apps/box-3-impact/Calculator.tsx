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
import type { Box3Method } from "@/lib/tax";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getBox3ImpactDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateBox3ImpactScenario, type Box3ImpactInput } from "./logic";

type FormState = {
  year: string;
  hasFiscalPartner: boolean;
  method: Box3Method;
  bankDeposits: string;
  investmentsAndOtherAssets: string;
  debts: string;
  expectedSavingsReturn: string;
  expectedInvestmentReturn: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  year: String(getDefaultFinancialYear()),
  hasFiscalPartner: false,
  method: "actual",
  bankDeposits: "25000",
  investmentsAndOtherAssets: "50000",
  debts: "0",
  expectedSavingsReturn: "2",
  expectedInvestmentReturn: "6",
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
  const year = parseOptionalNumber(values.year);
  const bankDeposits = parseOptionalNumber(values.bankDeposits);
  const investmentsAndOtherAssets = parseOptionalNumber(values.investmentsAndOtherAssets);
  const debts = parseOptionalNumber(values.debts);
  const expectedSavingsReturn = parseOptionalNumber(values.expectedSavingsReturn);
  const expectedInvestmentReturn = parseOptionalNumber(values.expectedInvestmentReturn);

  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }
  if (bankDeposits === undefined || !Number.isFinite(bankDeposits) || bankDeposits < 0) {
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
    expectedSavingsReturn !== undefined &&
    (!Number.isFinite(expectedSavingsReturn) ||
      expectedSavingsReturn < 0 ||
      expectedSavingsReturn > 100)
  ) {
    errors.expectedSavingsReturn = "Gebruik een percentage tussen 0 en 100.";
  }
  if (
    expectedInvestmentReturn !== undefined &&
    (!Number.isFinite(expectedInvestmentReturn) ||
      expectedInvestmentReturn < 0 ||
      expectedInvestmentReturn > 100)
  ) {
    errors.expectedInvestmentReturn = "Gebruik een percentage tussen 0 en 100.";
  }

  const parsedValues: Box3ImpactInput | null =
    Object.keys(errors).length === 0
      ? {
          year,
          hasFiscalPartner: values.hasFiscalPartner,
          method: values.method,
          bankDeposits: bankDeposits ?? 0,
          investmentsAndOtherAssets: investmentsAndOtherAssets ?? 0,
          debts: debts ?? 0,
          expectedSavingsReturn,
          expectedInvestmentReturn,
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
  const profilePatch = getBox3ImpactDefaultsFromProfile(profile);
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
  const [formValues, setFormValues] = useState(initialValues);
  const { errors, parsedValues } = validateForm(formValues);
  const result = parsedValues ? calculateBox3ImpactScenario(parsedValues) : null;

  const mobileFlow = useMobileFieldFlow([
    "year",
    "hasFiscalPartner",
    "method",
    "bankDeposits",
    "investmentsAndOtherAssets",
    "debts",
    "expectedSavingsReturn",
    "expectedInvestmentReturn",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      year: errors.year,
      bankDeposits: errors.bankDeposits,
      investmentsAndOtherAssets: errors.investmentsAndOtherAssets,
      debts: errors.debts,
      expectedSavingsReturn: errors.expectedSavingsReturn,
      expectedInvestmentReturn: errors.expectedInvestmentReturn,
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
          Invoer
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Box 3-impact calculator
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Zie indicatief wat spaargeld, beleggingen en schulden in box 3 voor je
          betekenen. Geschikt voor spaarders, beleggers en FIRE-scenario&apos;s.
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
              Forfaitair rendement (default = werkelijk rendement)
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("bankDeposits")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Banktegoeden/spaargeld
            </span>
            <input
              inputMode="decimal"
              value={formValues.bankDeposits}
              onChange={(event) => updateField("bankDeposits", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("bankDeposits", Boolean(errors.bankDeposits))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.bankDeposits} />
          </label>

          <label className={mobileFlow.getFieldClassName("investmentsAndOtherAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beleggingen/overige bezittingen
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
              Schulden box 3
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

          <label className={mobileFlow.getFieldClassName("expectedSavingsReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement spaargeld (%) optioneel
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedSavingsReturn}
              onChange={(event) => updateField("expectedSavingsReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "expectedSavingsReturn",
                Boolean(errors.expectedSavingsReturn),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedSavingsReturn} />
          </label>

          <label className={mobileFlow.getFieldClassName("expectedInvestmentReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Verwacht rendement beleggingen (%) optioneel
            </span>
            <input
              inputMode="decimal"
              value={formValues.expectedInvestmentReturn}
              onChange={(event) => updateField("expectedInvestmentReturn", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "expectedInvestmentReturn",
                Boolean(errors.expectedInvestmentReturn),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.expectedInvestmentReturn} />
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
              Beknopte samenvatting
            </div>
            {result ? (
              <Pill tone={result.box3Tax > 0 ? "neg" : "pos"}>
                {result.box3Tax > 0 ? "Boven vrijstelling" : "Binnen vrijstelling"}
              </Pill>
            ) : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.box3Tax)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Op basis van je invoer betaal je indicatief ongeveer {formatCurrency(result.box3Tax)} box 3.
              </p>
              <p className="mt-3 text-[13px] leading-[1.65] text-white/70">
                Je vermogen valt ongeveer{" "}
                {result.taxableBase > 0
                  ? `${formatCurrency(result.taxableBase)} boven`
                  : `${formatCurrency(result.taxFreeAllowance - result.netWorth)} onder`}{" "}
                de vrijstelling.
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/70">
                Effectieve druk op je netto vermogen: {formatPercent(result.effectiveTaxRateOnNetWorth)}%.
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
              <ResultRow label="Totaal vermogen" value={formatCurrency(result.assetsTotal)} />
              <ResultRow label="Schulden box 3" value={formatCurrency(result.debtsTotal)} />
              <ResultRow
                label="Netto rendementsgrondslag"
                value={formatCurrency(result.netWorth)}
              />
              <ResultRow
                label="Heffingsvrij vermogen"
                value={formatCurrency(result.taxFreeAllowance)}
              />
              <ResultRow
                label="Belastbare grondslag"
                value={formatCurrency(result.taxableBase)}
              />
              <ResultRow
                label="Forfaitair rendement spaargeld"
                value={formatCurrency(result.deemedReturnBankDeposits)}
              />
              <ResultRow
                label="Forfaitair rendement beleggingen"
                value={formatCurrency(result.deemedReturnInvestments)}
              />
              <ResultRow
                label="Forfaitair rendement schulden"
                value={formatCurrency(result.deemedReturnDebts)}
              />
              <ResultRow
                label="Totaal forfaitair rendement"
                value={formatCurrency(result.totalDeemedReturn)}
              />
              <ResultRow
                label="Box 3-heffing"
                value={formatCurrency(result.box3Tax)}
                accent
              />
              <ResultRow
                label="Effectieve druk op netto vermogen"
                value={`${formatPercent(result.effectiveTaxRateOnNetWorth)}%`}
              />
              {result.expectedGrossReturn !== undefined ? (
                <>
                  <ResultRow
                    label="Verwacht bruto rendement"
                    value={formatCurrency(result.expectedGrossReturn)}
                  />
                  <ResultRow
                    label="Netto rendement na box 3"
                    value={formatCurrency(result.netExpectedReturnAfterBox3 ?? 0)}
                    accent
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <ToolDisclosure
          title="Hoe rekenen we dit?"
          subtitle="Deze tool gebruikt de centrale tax-laag en centrale jaaraannames."
        >
          <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            <p>
              1) We bepalen eerst netto vermogen = bezittingen - schulden.
            </p>
            <p>
              2) Daarna passen we het heffingsvrij vermogen toe.
            </p>
            <p>
              3) Op de resterende grondslag rekenen we indicatief box 3 via de centrale tax-functie.
            </p>
          </div>
        </ToolDisclosure>

        <ToolDisclosure
          title="Welke aannames gebruiken we?"
          subtitle="Aannames komen centraal uit het gekozen jaar."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.assumptions.sourceLabel}</p>
              <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
              <p>Status: {result.assumptions.status}</p>
              <p>Box 3-tarief: {formatPercent(result.assumptions.taxRate)}%</p>
              <p>
                Forfait banktegoeden: {formatPercent(result.assumptions.deemedReturnBankDepositsRate)}%
              </p>
              <p>
                Forfait beleggingen: {formatPercent(result.assumptions.deemedReturnInvestmentsRate)}%
              </p>
              <p>Forfait schulden: {formatPercent(result.assumptions.deemedReturnDebtsRate)}%</p>
            </div>
          ) : null}
        </ToolDisclosure>

        <ToolDisclosure
          title="Wat betekent dit voor sparen en beleggen?"
          subtitle="Gebruik dit als scenariohulp, niet als bindende fiscale uitkomst."
        >
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Boven de vrijstelling kan box 3 je netto vermogensgroei dempen. Voor
            scenario&apos;s is het nuttig om naast bruto rendement ook netto na box 3 te
            bekijken, zeker bij langere horizons.
          </p>
        </ToolDisclosure>

        <ToolDisclosure
          title="Let op: box 3 is indicatief"
          subtitle="Geen officiële aangifteberekening."
        >
          <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            {(result?.warnings ?? [
              "Dit is een indicatie en geen officiële aanslag.",
            ]).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </ToolDisclosure>
      </section>
    </CalculatorShell>
  );
}
