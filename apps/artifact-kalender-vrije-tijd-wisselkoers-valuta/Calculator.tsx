"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { getSupportedCurrencies, type FeeCurrencyMode, type SupportedCurrency } from "@/lib/calendar";
import { calculateWisselkoersValuta, type WisselkoersValutaInput } from "./logic";

type FormState = {
  amount: string;
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  useManualRate: boolean;
  rateOverride: string;
  feePercent: string;
  fixedFee: string;
  feeCurrencyMode: FeeCurrencyMode;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const supportedCurrencies = getSupportedCurrencies();

const defaultValues: FormState = {
  amount: "1000",
  fromCurrency: "EUR",
  toCurrency: "USD",
  useManualRate: false,
  rateOverride: "",
  feePercent: "0",
  fixedFee: "0",
  feeCurrencyMode: "target",
};

const exampleValues: FormState = {
  amount: "1250",
  fromCurrency: "EUR",
  toCurrency: "USD",
  useManualRate: false,
  rateOverride: "",
  feePercent: "0,5",
  fixedFee: "2,5",
  feeCurrencyMode: "target",
};

function parseNumberField(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function formatAmount(value: number) {
  return value.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};

  const amount = parseNumberField(values.amount);
  if (amount === null || amount <= 0) {
    errors.amount = "Vul een bedrag groter dan 0 in.";
  }

  if (!supportedCurrencies.includes(values.fromCurrency)) {
    errors.fromCurrency = "Kies een geldige bronvaluta.";
  }
  if (!supportedCurrencies.includes(values.toCurrency)) {
    errors.toCurrency = "Kies een geldige doelvaluta.";
  }

  const feePercent = parseNumberField(values.feePercent);
  if (feePercent === null || feePercent < 0 || feePercent > 100) {
    errors.feePercent = "Vul een kostenpercentage tussen 0 en 100 in.";
  }

  const fixedFee = parseNumberField(values.fixedFee);
  if (fixedFee === null || fixedFee < 0) {
    errors.fixedFee = "Vul vaste kosten van minimaal 0 in.";
  }

  let rateOverride: number | undefined;
  if (values.useManualRate) {
    const parsedRate = parseNumberField(values.rateOverride);
    if (parsedRate === null || parsedRate <= 0 || parsedRate > 1000) {
      errors.rateOverride = "Vul een handmatige koers groter dan 0 en maximaal 1000 in.";
    } else {
      rateOverride = parsedRate;
    }
  }

  if (values.feeCurrencyMode !== "source" && values.feeCurrencyMode !== "target") {
    errors.feeCurrencyMode = "Kies of kosten in bron- of doelvaluta worden toegepast.";
  }

  const parsedValues: WisselkoersValutaInput | null =
    Object.keys(errors).length === 0 &&
    amount !== null &&
    feePercent !== null &&
    fixedFee !== null
      ? {
          amount,
          fromCurrency: values.fromCurrency,
          toCurrency: values.toCurrency,
          rateOverride,
          feePercent,
          fixedFee,
          feeCurrencyMode: values.feeCurrencyMode,
        }
      : null;

  return { errors, parsedValues };
}

export default function Calculator() {
  const { formValues, setFormValues, submittedValues, submit, hasDirtyChanges } =
    useSubmittedCalculation<FormState>(defaultValues);
  const validation = validateForm(formValues);
  const { errors, parsedValues } = validation;
  const submittedValidation = submittedValues ? validateForm(submittedValues) : null;
  const result = submittedValidation?.parsedValues
    ? calculateWisselkoersValuta(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "amount",
    "fromCurrency",
    "toCurrency",
    "useManualRate",
    "rateOverride",
    "feePercent",
    "fixedFee",
    "feeCurrencyMode",
  ]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    if (!parsedValues) return;
    submit();
  }

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Artifact-tool
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Wisselkoers valuta
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Reken valuta om met optionele handmatige koers, percentagekosten en vaste kosten.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={() => setFormValues(exampleValues)}
          >
            Voorbeeld invullen
          </ToolActionButton>
        </div>
      }
      inputs={
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <label className={mobileFlow.getFieldClassName("amount")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bedrag
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={formValues.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="1000"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.amount} />
          </label>

          <label className={mobileFlow.getFieldClassName("fromCurrency")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Van valuta
            </span>
            <select
              value={formValues.fromCurrency}
              onChange={(event) =>
                updateField("fromCurrency", event.target.value as SupportedCurrency)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <FieldError message={errors.fromCurrency} />
          </label>

          <label className={mobileFlow.getFieldClassName("toCurrency")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Naar valuta
            </span>
            <select
              value={formValues.toCurrency}
              onChange={(event) => updateField("toCurrency", event.target.value as SupportedCurrency)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <FieldError message={errors.toCurrency} />
          </label>

          <label className={mobileFlow.getFieldClassName("useManualRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Handmatige koers gebruiken
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.useManualRate}
                onChange={(event) => updateField("useManualRate", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("rateOverride")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Handmatige koers
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={formValues.rateOverride}
              onChange={(event) => updateField("rateOverride", event.target.value)}
              placeholder="Bijv. 1,12"
              disabled={!formValues.useManualRate}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <FieldError message={errors.rateOverride} />
          </label>

          <label className={mobileFlow.getFieldClassName("feePercent")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Kostenpercentage (%)
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={formValues.feePercent}
              onChange={(event) => updateField("feePercent", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.feePercent} />
          </label>

          <label className={mobileFlow.getFieldClassName("fixedFee")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Vaste kosten
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={formValues.fixedFee}
              onChange={(event) => updateField("fixedFee", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.fixedFee} />
          </label>

          <label className={mobileFlow.getFieldClassName("feeCurrencyMode")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Kosten toepassen in
            </span>
            <select
              value={formValues.feeCurrencyMode}
              onChange={(event) =>
                updateField("feeCurrencyMode", event.target.value as FeeCurrencyMode)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="target">Doelvaluta</option>
              <option value="source">Bronvaluta</option>
            </select>
            <FieldError message={errors.feeCurrencyMode} />
          </label>

          <ToolActionButton type="submit" variant="submit" size="md" full disabled={!parsedValues}>
            {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
          </ToolActionButton>
        </form>
      }
      submitAction={
        <MobileFieldFlowControls
          current={mobileFlow.activeIndex + 1}
          total={mobileFlow.total}
          canGoPrev={mobileFlow.canGoPrev}
          canGoNext={mobileFlow.canGoNext}
          canComplete={Boolean(parsedValues)}
          onPrev={mobileFlow.goPrev}
          onNext={mobileFlow.goNext}
          onComplete={handleSubmit}
        />
      }
      result={
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Samenvatting</div>
          {!result ? (
            <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
              Vul de wisselgegevens in en klik op Bereken.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {formatAmount(result.netConvertedAmount)} {result.toCurrency}
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                Uit {formatAmount(result.amount)} {result.fromCurrency} bij koers{" "}
                {result.exchangeRate.toLocaleString("nl-NL", { maximumFractionDigits: 6 })}
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <>
            <DisclosureSection title="Kostenopbouw" subtitle="Bruto, kosten en netto in doelvaluta.">
              <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                <p>
                  Bruto omrekening: {formatAmount(result.grossConvertedAmount)} {result.toCurrency}
                </p>
                <p>
                  Procentuele kosten: {formatAmount(result.percentFeeAmountTarget)} {result.toCurrency}
                </p>
                <p>
                  Vaste kosten: {formatAmount(result.fixedFeeAmountTarget)} {result.toCurrency}
                </p>
                <p>
                  Totale kosten: {formatAmount(result.totalFeeAmountTarget)} {result.toCurrency}
                </p>
                <p>
                  Netto: {formatAmount(result.netConvertedAmount)} {result.toCurrency}
                </p>
              </div>
            </DisclosureSection>

            <DisclosureSection
              title="Aannames"
              subtitle="Koersbron en effectieve opbrengst."
            >
              <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                <p>Effectieve koers: {result.effectiveRate.toLocaleString("nl-NL", { maximumFractionDigits: 6 })}</p>
                <p>Bron: {result.assumptions.sourceLabel}</p>
                <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
                <p>Status: {result.assumptions.status}</p>
              </div>
            </DisclosureSection>
          </>
        ) : null
      }
      disclaimer={
        result ? (
          <ToolDisclosure title="Let op" subtitle="Gebruik dit als indicatie, niet als live handelskoers.">
            <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </ToolDisclosure>
        ) : null
      }
    />
  );
}
