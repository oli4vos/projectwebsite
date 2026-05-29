"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { parseIsoDateInput, type DateBoundaryMode } from "@/lib/calendar";
import { calculateBeginOfEinddatum, type BeginOfEinddatumInput } from "./logic";

type FormState = {
  mode: DateBoundaryMode;
  knownDate: string;
  years: string;
  months: string;
  weeks: string;
  days: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  mode: "endFromStart",
  knownDate: "",
  years: "",
  months: "",
  weeks: "",
  days: "",
};

function parseNonNegativeWhole(value: string, field: keyof FormState, errors: ValidationErrors) {
  if (value.trim().length === 0) {
    return 0;
  }
  const parsed = parseOptionalDecimalInput(value);
  if (parsed === undefined || parsed < 0 || !Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    errors[field] = "Gebruik een geheel getal van 0 of hoger.";
    return 0;
  }
  return parsed;
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const knownDate = parseIsoDateInput(values.knownDate);
  const years = parseNonNegativeWhole(values.years, "years", errors);
  const months = parseNonNegativeWhole(values.months, "months", errors);
  const weeks = parseNonNegativeWhole(values.weeks, "weeks", errors);
  const days = parseNonNegativeWhole(values.days, "days", errors);

  if (!knownDate) {
    errors.knownDate = "Vul een geldige datum in.";
  }

  const parsedValues: BeginOfEinddatumInput | null =
    Object.keys(errors).length === 0 && knownDate
      ? {
          knownDate,
          mode: values.mode,
          components: { years, months, weeks, days },
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
    ? calculateBeginOfEinddatum(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "mode",
    "knownDate",
    "years",
    "months",
    "weeks",
    "days",
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
            Begin- of einddatum
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Reken een start- of einddatum uit op basis van jaren, maanden, weken en dagen.
          </p>
        </>
      }
      inputs={
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <label className={mobileFlow.getFieldClassName("mode")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Wat wil je berekenen?
            </span>
            <select
              value={formValues.mode}
              onChange={(event) =>
                updateField("mode", event.target.value as DateBoundaryMode)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="endFromStart">Einddatum vanuit begindatum</option>
              <option value="startFromEnd">Begindatum vanuit einddatum</option>
            </select>
          </label>

          <label className={mobileFlow.getFieldClassName("knownDate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bekende datum
            </span>
            <input
              type="date"
              value={formValues.knownDate}
              onChange={(event) => updateField("knownDate", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.knownDate} />
          </label>

          {(["years", "months", "weeks", "days"] as const).map((field) => (
            <label key={field} className={mobileFlow.getFieldClassName(field)}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                {field === "years"
                  ? "Jaren"
                  : field === "months"
                    ? "Maanden"
                    : field === "weeks"
                      ? "Weken"
                      : "Dagen"}
              </span>
              <input
                inputMode="numeric"
                value={formValues[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors[field]} />
            </label>
          ))}

          <div className="space-y-3 border-t border-[var(--hair)] pt-4">
            <ToolActionButton type="submit" variant="submit" size="md" full disabled={!parsedValues}>
              {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
            </ToolActionButton>
          </div>
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
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Uitkomst</div>
          {!result ? (
            <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
              Vul de invoer in en klik op Bereken.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.calculatedDate}
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                Verschuiving: {result.totalCalendarDaysShift} kalenderdagen.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <DisclosureSection title="Aannames" subtitle="Kalenderregels achter deze uitkomst.">
            <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.assumptions.sourceLabel}</p>
              <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
              <p>Status: {result.assumptions.status}</p>
            </div>
          </DisclosureSection>
        ) : null
      }
      disclaimer={
        result?.warnings.length ? (
          <ToolDisclosure title="Let op" subtitle="Context bij deze uitkomst.">
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
