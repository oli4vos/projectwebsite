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
  getSchoolHolidayRegionLabel,
  isValidSchoolYear,
  type SchoolHolidayRegion,
} from "@/lib/calendar";
import { calculateSchoolvakanties, type SchoolvakantiesInput } from "./logic";

type FormState = {
  schoolYear: string;
  region: SchoolHolidayRegion;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  schoolYear: "2026-2027",
  region: "midden",
};

const exampleValues: FormState = {
  schoolYear: "2025-2026",
  region: "noord",
};

const regions: SchoolHolidayRegion[] = ["noord", "midden", "zuid"];

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const schoolYear = values.schoolYear.trim();

  if (!isValidSchoolYear(schoolYear)) {
    errors.schoolYear = "Vul een schooljaar in als JJJJ-JJJJ (bijvoorbeeld 2026-2027).";
  } else {
    const [startPart] = schoolYear.split("-");
    const startYear = Number(startPart);
    if (startYear < 2000 || startYear > 2100) {
      errors.schoolYear = "Kies een schooljaar tussen 2000-2001 en 2100-2101.";
    }
  }

  if (!regions.includes(values.region)) {
    errors.region = "Kies een geldige regio.";
  }

  const parsedValues: SchoolvakantiesInput | null =
    Object.keys(errors).length === 0
      ? {
          schoolYear,
          region: values.region,
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
    ? calculateSchoolvakanties(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow(["schoolYear", "region"]);

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
            Schoolvakanties
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Bekijk per schooljaar en regio welke schoolvakantieperiodes beschikbaar zijn in de
            interne dataset.
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
          <label className={mobileFlow.getFieldClassName("schoolYear")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Schooljaar
            </span>
            <input
              type="text"
              value={formValues.schoolYear}
              onChange={(event) => updateField("schoolYear", event.target.value)}
              placeholder="2026-2027"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.schoolYear} />
          </label>

          <label className={mobileFlow.getFieldClassName("region")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Regio
            </span>
            <select
              value={formValues.region}
              onChange={(event) =>
                updateField("region", event.target.value as SchoolHolidayRegion)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {getSchoolHolidayRegionLabel(region)}
                </option>
              ))}
            </select>
            <FieldError message={errors.region} />
          </label>

          <ToolActionButton type="submit" variant="submit" size="md" full disabled={!parsedValues}>
            {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bekijk vakanties"}
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
              Vul schooljaar en regio in en klik op Bekijk vakanties.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                {result.totalHolidays} vakanties
              </p>
              <p className="text-[14px] leading-[1.65] text-white/75">
                {result.schoolYear} • Regio {result.regionLabel}
              </p>
            </div>
          )}
        </div>
      }
      details={
        result ? (
          <>
            <DisclosureSection title="Periodes" subtitle="Vakantie-overzicht voor de gekozen regio.">
              {result.holidays.length === 0 ? (
                <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
                  Geen data gevonden voor deze selectie.
                </p>
              ) : (
                <div className="grid gap-3">
                  {result.holidays.map((holiday) => (
                    <div
                      key={`${holiday.name}-${holiday.startDate}-${holiday.endDate}`}
                      className="rounded-lg border border-[var(--hair)] bg-white/70 p-3"
                    >
                      <p className="text-[14px] font-medium text-[var(--ink)]">{holiday.name}</p>
                      <p className="mt-1 text-[12px] leading-[1.65] text-[var(--muted)]">
                        {holiday.kind === "verplicht" ? "Verplicht" : "Advies"} •{" "}
                        {holiday.startDate} t/m {holiday.endDate} • {holiday.durationCalendarDays}{" "}
                        kalenderdagen
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </DisclosureSection>

            <DisclosureSection
              title="Aannames"
              subtitle="Context bij de gebruikte vakantiegegevens."
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
        result?.warnings.length ? (
          <ToolDisclosure
            title="Let op"
            subtitle="De dekking kan per jaar verschillen."
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
