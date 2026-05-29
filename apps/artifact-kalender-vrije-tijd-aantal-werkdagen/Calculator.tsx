"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import {
  isDateRangeWithinYears,
  parseIsoDateInput,
  type IsoWeekday,
} from "@/lib/calendar";
import { calculateAantalWerkdagen, type AantalWerkdagenInput } from "./logic";

type FormState = {
  startDate: string;
  endDate: string;
  includeEndDate: boolean;
  excludeDutchHolidays: boolean;
  includeLiberationDay: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

type WeekdayFieldKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type ValidationErrors = Partial<Record<keyof FormState | "workdayPattern", string>>;

const defaultValues: FormState = {
  startDate: "",
  endDate: "",
  includeEndDate: true,
  excludeDutchHolidays: true,
  includeLiberationDay: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

const weekdayFields: Array<{ key: WeekdayFieldKey; label: string; value: IsoWeekday }> = [
  { key: "monday", label: "maandag", value: 1 },
  { key: "tuesday", label: "dinsdag", value: 2 },
  { key: "wednesday", label: "woensdag", value: 3 },
  { key: "thursday", label: "donderdag", value: 4 },
  { key: "friday", label: "vrijdag", value: 5 },
  { key: "saturday", label: "zaterdag", value: 6 },
  { key: "sunday", label: "zondag", value: 7 },
];

function buildWorkdayPattern(values: FormState): IsoWeekday[] {
  return weekdayFields
    .filter((entry) => values[entry.key])
    .map((entry) => entry.value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const startDate = parseIsoDateInput(values.startDate);
  const endDate = parseIsoDateInput(values.endDate);
  const workdayPattern = buildWorkdayPattern(values);

  if (!startDate) {
    errors.startDate = "Vul een geldige begindatum in.";
  }
  if (!endDate) {
    errors.endDate = "Vul een geldige einddatum in.";
  }
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    errors.endDate = "De einddatum mag niet vóór de begindatum liggen.";
  }
  if (startDate && endDate && !isDateRangeWithinYears(startDate, endDate, 100)) {
    errors.endDate = "Kies een periode van maximaal 100 jaar.";
  }
  if (workdayPattern.length === 0) {
    errors.workdayPattern = "Selecteer minimaal één werkdag.";
  }

  const parsedValues: AantalWerkdagenInput | null =
    Object.keys(errors).length === 0 && startDate && endDate
      ? {
          startDate,
          endDate,
          includeEndDate: values.includeEndDate,
          workdayPattern,
          excludeDutchHolidays: values.excludeDutchHolidays,
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
    ? calculateAantalWerkdagen(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "startDate",
    "endDate",
    "includeEndDate",
    "excludeDutchHolidays",
    "includeLiberationDay",
    "workdayPattern",
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
            Aantal werkdagen
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Bereken hoeveel werkdagen in een periode vallen, met keuze om Nederlandse
            feestdagen mee te nemen of uit te sluiten.
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

          <label className={mobileFlow.getFieldClassName("excludeDutchHolidays")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Nederlandse feestdagen uitsluiten
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.excludeDutchHolidays}
                onChange={(event) =>
                  updateField("excludeDutchHolidays", event.target.checked)
                }
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("includeLiberationDay")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Bevrijdingsdag als feestdag meenemen
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.includeLiberationDay}
                onChange={(event) =>
                  updateField("includeLiberationDay", event.target.checked)
                }
                className="size-4 accent-[var(--accent)]"
                disabled={!formValues.excludeDutchHolidays}
              />
              Ja
            </span>
          </label>

          <div className={mobileFlow.getFieldClassName("workdayPattern")}>
            <div className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Welke weekdagen tellen als werkdag?
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {weekdayFields.map((entry) => (
                <label
                  key={entry.key}
                  className="flex items-center gap-2 rounded-lg border border-[var(--hair)] bg-white px-3 py-2 text-[14px] text-[var(--ink)]"
                >
                  <input
                    type="checkbox"
                    checked={formValues[entry.key]}
                    onChange={(event) => updateField(entry.key, event.target.checked)}
                    className="size-4 accent-[var(--accent)]"
                  />
                  {entry.label}
                </label>
              ))}
            </div>
            <FieldError message={errors.workdayPattern} />
          </div>

          <div className="space-y-3 border-t border-[var(--hair)] pt-4">
            <ToolActionButton type="submit" variant="submit" size="md" full disabled={!parsedValues}>
              {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
            </ToolActionButton>
            <p className="text-[12px] text-[var(--muted)]">
              De tool rekent alleen met geldige invoer.
            </p>
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
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Samenvatting</div>
          {!result ? (
            <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
              Vul de periode en werkdaginstellingen in en klik op Bereken.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.totalWorkdays} werkdagen
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                Binnen {result.totalCalendarDays} kalenderdagen
                ({result.period.startDate} t/m {result.period.endDate}).
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <>
            <DisclosureSection
              title="Uitsplitsing"
              subtitle="Zo is het totaal opgebouwd."
            >
              <div className="grid gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                <p>Werkdagen: {result.totalWorkdays}</p>
                <p>Weekenddagen: {result.totalWeekendDays}</p>
                <p>Feestdagen op werkdag: {result.totalHolidayOnWorkday}</p>
                <p>Overige uitgesloten weekdagen: {result.totalExcludedWeekdays}</p>
              </div>
            </DisclosureSection>

            <DisclosureSection
              title="Aannames"
              subtitle="Deze achtergrondregels zijn gebruikt."
            >
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
          <ToolDisclosure
            title="Let op"
            subtitle="Gebruik dit als planningstool, niet als juridisch roosteradvies."
          >
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
