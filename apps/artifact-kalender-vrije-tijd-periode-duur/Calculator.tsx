"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { isDateRangeWithinYears, parseIsoDateInput } from "@/lib/calendar";
import { calculatePeriodeDuur, type PeriodeDuurInput } from "./logic";

type FormState = {
  startDate: string;
  endDate: string;
  includeEndDate: boolean;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  startDate: "",
  endDate: "",
  includeEndDate: false,
};

const exampleValues: FormState = {
  startDate: "2026-01-15",
  endDate: "2026-03-01",
  includeEndDate: true,
};

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const startDate = parseIsoDateInput(values.startDate);
  const endDate = parseIsoDateInput(values.endDate);

  if (!startDate) {
    errors.startDate = "Vul een geldige begindatum in.";
  }
  if (!endDate) {
    errors.endDate = "Vul een geldige einddatum in.";
  }
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    errors.endDate = "De einddatum mag niet vóór de begindatum liggen.";
  }
  if (startDate && endDate && !isDateRangeWithinYears(startDate, endDate, 1000)) {
    errors.endDate = "Kies een periode van maximaal 1000 jaar.";
  }

  const parsedValues: PeriodeDuurInput | null =
    Object.keys(errors).length === 0 && startDate && endDate
      ? {
          startDate,
          endDate,
          includeEndDate: values.includeEndDate,
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
    ? calculatePeriodeDuur(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow(["startDate", "endDate", "includeEndDate"]);

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
            Periode duur
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Bereken de periode tussen twee datums in kalenderdagen, weken en jaren/maanden/dagen.
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
          <label className={mobileFlow.getFieldClassName("startDate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Begindatum
            </span>
            <input
              type="date"
              value={formValues.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.startDate} />
          </label>

          <label className={mobileFlow.getFieldClassName("endDate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Einddatum
            </span>
            <input
              type="date"
              value={formValues.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.endDate} />
          </label>

          <label className={mobileFlow.getFieldClassName("includeEndDate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Einddatum meetellen
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeEndDate}
                onChange={(event) => updateField("includeEndDate", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
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
              Vul twee datums in en klik op Bereken.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.totalCalendarDays} dagen
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                {result.totalWeeks} weken en {result.remainingDays} dagen.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <DisclosureSection title="Kalenderuitsplitsing" subtitle="Volledige periode in kalendercomponenten.">
            <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>
                Periode: {result.period.startDate} t/m {result.period.endDate} (
                {result.period.includeEndDate ? "inclusief" : "exclusief"} einddatum)
              </p>
              <p>
                {result.calendarBreakdown.years} jaar, {result.calendarBreakdown.months} maanden en{" "}
                {result.calendarBreakdown.days} dagen
              </p>
              <p>Bron: {result.assumptions.sourceLabel}</p>
            </div>
          </DisclosureSection>
        ) : null
      }
    />
  );
}
