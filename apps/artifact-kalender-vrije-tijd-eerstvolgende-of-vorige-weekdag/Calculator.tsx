"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { parseIsoDateInput, type IsoWeekday, type NearestWeekdayDirection } from "@/lib/calendar";
import {
  calculateEerstvolgendeOfVorigeWeekdag,
  type EerstvolgendeOfVorigeWeekdagInput,
} from "./logic";

type FormState = {
  startDate: string;
  targetWeekday: string;
  direction: NearestWeekdayDirection;
  includeToday: boolean;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  startDate: "",
  targetWeekday: "1",
  direction: "next",
  includeToday: false,
};

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const startDate = parseIsoDateInput(values.startDate);
  const targetWeekday = Number(values.targetWeekday);

  if (!startDate) {
    errors.startDate = "Vul een geldige startdatum in.";
  }
  if (!Number.isInteger(targetWeekday) || targetWeekday < 1 || targetWeekday > 7) {
    errors.targetWeekday = "Kies een geldige weekdag.";
  }

  const parsedValues: EerstvolgendeOfVorigeWeekdagInput | null =
    Object.keys(errors).length === 0 && startDate
      ? {
          startDate,
          targetWeekday: targetWeekday as IsoWeekday,
          direction: values.direction,
          includeToday: values.includeToday,
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
    ? calculateEerstvolgendeOfVorigeWeekdag(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "startDate",
    "targetWeekday",
    "direction",
    "includeToday",
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
            Eerstvolgende of vorige weekdag
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Vind snel de eerstvolgende of vorige datum voor een gekozen weekdag.
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
          <label className={mobileFlow.getFieldClassName("startDate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Startdatum
            </span>
            <input
              type="date"
              value={formValues.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.startDate} />
          </label>

          <label className={mobileFlow.getFieldClassName("targetWeekday")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Gewenste weekdag
            </span>
            <select
              value={formValues.targetWeekday}
              onChange={(event) => updateField("targetWeekday", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="1">maandag</option>
              <option value="2">dinsdag</option>
              <option value="3">woensdag</option>
              <option value="4">donderdag</option>
              <option value="5">vrijdag</option>
              <option value="6">zaterdag</option>
              <option value="7">zondag</option>
            </select>
            <FieldError message={errors.targetWeekday} />
          </label>

          <label className={mobileFlow.getFieldClassName("direction")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Richting
            </span>
            <select
              value={formValues.direction}
              onChange={(event) =>
                updateField("direction", event.target.value as NearestWeekdayDirection)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="next">eerstvolgende</option>
              <option value="previous">vorige</option>
            </select>
          </label>

          <label className={mobileFlow.getFieldClassName("includeToday")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Vandaag meetellen bij gelijke weekdag
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeToday}
                onChange={(event) => updateField("includeToday", event.target.checked)}
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
                {result.dayDifference} dagen {result.direction === "next" ? "vooruit" : "terug"} naar{" "}
                {result.targetWeekdayName}.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <DisclosureSection title="Aannames" subtitle="Rekenregel achter deze datum.">
            <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.assumptions.sourceLabel}</p>
              <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
              <p>Status: {result.assumptions.status}</p>
              <p>Startdatum meegeteld: {result.includesStartDate ? "ja" : "nee"}</p>
            </div>
          </DisclosureSection>
        ) : null
      }
    />
  );
}
