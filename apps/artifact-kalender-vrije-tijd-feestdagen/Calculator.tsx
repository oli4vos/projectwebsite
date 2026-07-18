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
import { calculateFeestdagen, type FeestdagenInput } from "./logic";

type FormState = {
  year: string;
  includeLiberationDay: boolean;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  year: String(new Date().getUTCFullYear()),
  includeLiberationDay: true,
};

const exampleValues: FormState = {
  year: "2027",
  includeLiberationDay: false,
};

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const parsedYear = parseOptionalDecimalInput(values.year);

  if (
    parsedYear === undefined ||
    !Number.isInteger(parsedYear) ||
    parsedYear < 1900 ||
    parsedYear > 2100
  ) {
    errors.year = "Vul een geldig jaar in (1900 t/m 2100).";
  }

  const parsedValues: FeestdagenInput | null =
    Object.keys(errors).length === 0 && parsedYear !== undefined
      ? {
          year: parsedYear,
          includeLiberationDay: values.includeLiberationDay,
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
    ? calculateFeestdagen(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow(["year", "includeLiberationDay"]);

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
            Feestdagen
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Bekijk Nederlandse feestdagen voor een gekozen jaar.
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
          <label className={mobileFlow.getFieldClassName("year")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Jaar
            </span>
            <input
              inputMode="numeric"
              value={formValues.year}
              onChange={(event) => updateField("year", event.target.value)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.year} />
          </label>

          <label className={mobileFlow.getFieldClassName("includeLiberationDay")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bevrijdingsdag meenemen
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeLiberationDay}
                onChange={(event) => updateField("includeLiberationDay", event.target.checked)}
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
              Kies een jaar en klik op Bereken.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.totalHolidays} feestdagen
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                {result.totalOnWorkdays} op werkdagen, {result.totalInWeekend} in het weekend.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <>
            <DisclosureSection title="Feestdagenlijst" subtitle={`Jaar ${result.year}`}>
              <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                {result.holidays.map((holiday) => (
                  <p key={`${holiday.name}-${holiday.date}`}>
                    <strong className="text-[var(--ink)]">{holiday.date}</strong> · {holiday.name} (
                    {holiday.weekday}, {holiday.type})
                  </p>
                ))}
              </div>
            </DisclosureSection>

            <DisclosureSection title="Aannames" subtitle="Bron en status.">
              <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
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
          <ToolDisclosure title="Let op" subtitle="Interpretatie van de uitkomst.">
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
