"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { parseIsoDateInput } from "@/lib/calendar";
import { calculateDagVanDeWeek, type DagVanDeWeekInput } from "./logic";

type FormState = {
  date: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  date: "",
};

const exampleValues: FormState = {
  date: "2026-07-18",
};

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const date = parseIsoDateInput(values.date);

  if (!date) {
    errors.date = "Vul een geldige datum in.";
  }

  const parsedValues: DagVanDeWeekInput | null =
    Object.keys(errors).length === 0 && date ? { date } : null;

  return { errors, parsedValues };
}

export default function Calculator() {
  const { formValues, setFormValues, submittedValues, submit, hasDirtyChanges } =
    useSubmittedCalculation<FormState>(defaultValues);
  const validation = validateForm(formValues);
  const { errors, parsedValues } = validation;
  const submittedValidation = submittedValues ? validateForm(submittedValues) : null;
  const result = submittedValidation?.parsedValues
    ? calculateDagVanDeWeek(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow(["date"]);

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
            Dag van de week
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Zie direct op welke weekdag een datum valt.
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
          <label className={mobileFlow.getFieldClassName("date")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Datum
            </span>
            <input
              type="date"
              value={formValues.date}
              onChange={(event) => setFormValues({ date: event.target.value })}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.date} />
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
              Vul een datum in en klik op Bereken.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.weekdagNaam}
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                ISO-week {result.isoWeeknummer}, dag {result.dagVanHetJaar} van het jaar.
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <DisclosureSection title="Controle" subtitle="Achtergrond bij de berekening.">
            <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Datum: {result.formattedDate}</p>
              <p>Weekdagnummer ISO: {result.weekdagNummerISO}</p>
              <p>Bron: {result.assumptions.sourceLabel}</p>
            </div>
          </DisclosureSection>
        ) : null
      }
    />
  );
}
