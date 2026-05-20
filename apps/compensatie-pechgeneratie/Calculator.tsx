"use client";

import { useState } from "react";
import { ResultRow } from "@/components/ResultRow";
import { Pill } from "@/components/ui";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import {
  COMPENSATION_CONFIG,
  calculateCompensation,
  type CompensationInput,
  type DiplomaStatus,
  type DiplomaYearBucket,
} from "./logic";

type StudyVoucherMode = "exclude" | "include";

type FormState = {
  monthsUnderLoanSystem: string;
  diplomaStatus: DiplomaStatus;
  diplomaYearBucket: DiplomaYearBucket;
  remainingStudentDebt: string;
  studyVoucherMode: StudyVoucherMode;
  includeAdditionalCompensation: boolean;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  monthsUnderLoanSystem: "48",
  diplomaStatus: "yes",
  diplomaYearBucket: "2026",
  remainingStudentDebt: "22000",
  studyVoucherMode: "exclude",
  includeAdditionalCompensation: true,
};

const defaultValues: FormState = {
  monthsUnderLoanSystem: "",
  diplomaStatus: "yes",
  diplomaYearBucket: "2026",
  remainingStudentDebt: "",
  studyVoucherMode: "exclude",
  includeAdditionalCompensation: true,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseOptionalNumber(value: string) {
  return parseOptionalDecimalInput(value);
}

function parseRequiredNumber(value: string) {
  const parsed = parseOptionalDecimalInput(value);
  if (parsed === undefined) {
    return Number.NaN;
  }
  return parsed;
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};

  const monthsUnderLoanSystem = parseRequiredNumber(values.monthsUnderLoanSystem);
  if (
    !Number.isFinite(monthsUnderLoanSystem) ||
    monthsUnderLoanSystem < 0 ||
    monthsUnderLoanSystem > 84 ||
    !Number.isInteger(monthsUnderLoanSystem)
  ) {
    errors.monthsUnderLoanSystem =
      "Gebruik een heel aantal maanden tussen 0 en 84.";
  }

  const remainingStudentDebt = parseOptionalNumber(values.remainingStudentDebt);
  if (
    remainingStudentDebt !== undefined &&
    (!Number.isFinite(remainingStudentDebt) || remainingStudentDebt < 0)
  ) {
    errors.remainingStudentDebt =
      "Gebruik 0 of een hogere resterende studieschuld.";
  }

  const parsedValues: CompensationInput | null =
    Object.keys(errors).length === 0
      ? {
          monthsUnderLoanSystem,
          diplomaStatus: values.diplomaStatus,
          diplomaYearBucket: values.diplomaYearBucket,
          remainingStudentDebt,
          includeStudyVoucherScenario: values.studyVoucherMode === "include",
          includeAdditionalCompensation: values.includeAdditionalCompensation,
        }
      : null;

  return {
    errors,
    parsedValues,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}

export default function Calculator() {
  const [formValues, setFormValues] = useState<FormState>(defaultValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const result = parsedValues ? calculateCompensation(parsedValues) : null;
  const hasErrors = Object.keys(errors).length > 0;
  const hasZeroMonths = Boolean(result && result.monthsUnderLoanSystem === 0);
  const shouldShowDiplomaYear = formValues.diplomaStatus === "yes";
  const shouldShowEligibilityNote = formValues.diplomaStatus !== "yes";
  const shouldShowProvisionalRateWarning = Boolean(
    result?.usesProvisionalBaseRate,
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Scenario
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Schat je compensatie rustig in
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Pech gehad, maar dit helpt je om vooruit te rekenen. Niet om je recht
            vast te stellen, wel om snel te zien over welke ordegrootte het ongeveer
            kan gaan.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          <span>Start leeg en vul snel een voorbeeldscenario in.</span>
          <button
            type="button"
            onClick={applyExampleValues}
            className="rounded-full border hair bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
          >
            Start met voorbeeldwaarden
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Aantal maanden onder het leenstelsel
            </span>
            <input
              inputMode="numeric"
              value={formValues.monthsUnderLoanSystem}
              onChange={(event) =>
                updateField("monthsUnderLoanSystem", event.target.value)
              }
              aria-invalid={Boolean(errors.monthsUnderLoanSystem)}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              Weet je dit niet precies? Vul voorlopig 48 in bij een vierjarige studie.
            </p>
            <FieldError message={errors.monthsUnderLoanSystem} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Diploma behaald
            </span>
            <select
              value={formValues.diplomaStatus}
              onChange={(event) =>
                updateField("diplomaStatus", event.target.value as DiplomaStatus)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="yes">Ja</option>
              <option value="no">Nee</option>
              <option value="uncertain">Onzeker / bijzondere situatie</option>
            </select>
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              Dit bepaalt niet definitief je recht, maar helpt om het scenario beter te lezen.
            </p>
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Diplomajaar
            </span>
            <select
              value={formValues.diplomaYearBucket}
              onChange={(event) =>
                updateField(
                  "diplomaYearBucket",
                  event.target.value as DiplomaYearBucket,
                )
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="2025-or-earlier">2025 of eerder</option>
              <option value="2026">2026</option>
              <option value="2027-or-later-or-unknown">2027 of later / onbekend</option>
            </select>
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              {shouldShowDiplomaYear
                ? "Voor diploma in 2027 of later rekenen we voorlopig met het huidige 2026-bedrag."
                : "Ook zonder diploma of bij twijfel laten we een voorlopig scenario zien."}
            </p>
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Resterende studieschuld (optioneel)
            </span>
            <input
              inputMode="decimal"
              value={formValues.remainingStudentDebt}
              onChange={(event) =>
                updateField("remainingStudentDebt", event.target.value)
              }
              aria-invalid={Boolean(errors.remainingStudentDebt)}
              placeholder="Bijvoorbeeld 18000"
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              Vul dit in als je wilt zien hoeveel waarschijnlijk eerst met je schuld wordt verrekend.
            </p>
            <FieldError message={errors.remainingStudentDebt} />
          </label>

          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Studievoucher relevant
            </span>
            <select
              value={formValues.studyVoucherMode}
              onChange={(event) =>
                updateField("studyVoucherMode", event.target.value as StudyVoucherMode)
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="exclude">Niet meenemen</option>
              <option value="include">Wel meenemen als scenario</option>
            </select>
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              Of dit voor jou geldt hangt af van je persoonlijke DUO-situatie.
            </p>
          </label>

          <label className="grid gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Aanvullende tegemoetkoming als scenario tonen
            </span>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formValues.includeAdditionalCompensation}
                onChange={(event) =>
                  updateField("includeAdditionalCompensation", event.target.checked)
                }
                className="h-4 w-4 rounded border-[var(--hair)] text-[var(--deep)]"
              />
              <span className="text-[14px] leading-[1.6] text-[var(--ink)]">
                Meenemen in de indicatie
              </span>
            </div>
            <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
              Volgens huidige informatie wordt deze vanaf april 2027 toegekend of verrekend.
            </p>
          </label>
        </div>

        <button
          type="button"
          onClick={goToResult}
          disabled={!result}
          className="ring-focus hair mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border bg-[var(--paper)] px-4 text-[14px] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45 md:hidden"
        >
          Bekijk uitkomst
        </button>

        {hasErrors ? (
          <div className="mt-6 rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]">
            Controleer de invoervelden hierboven. Zodra alles geldig is, zie je weer
            een bruikbare indicatie.
          </div>
        ) : null}

        <div className="mt-6 border-t border-[var(--hair)] pt-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Belangrijke nuance
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
            Deze tool geeft een indicatie op basis van openbare bedragen en eenvoudige
            aannames. DUO bepaalt uiteindelijk je recht en de exacte hoogte.
          </p>
        </div>
      </section>

      <section className="min-w-0 space-y-5">
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Korte conclusie
            </div>
            {result ? <Pill tone="accent">Indicatief</Pill> : null}
          </div>
          {result ? (
            hasZeroMonths ? (
              <>
                <div className="mt-4 font-serif text-[34px] leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
                  Met 0 maanden komt er nu nog geen tegemoetkoming uit deze tool.
                </div>
                <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-white/75">
                  Vul je maanden onder het leenstelsel in om een zinvollere indicatie te krijgen.
                </p>
              </>
            ) : (
              <>
                <div className="mt-4 font-serif text-[34px] leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
                  Op basis van je invoer kom je indicatief uit op ongeveer{" "}
                  {formatCurrency(result.totalIndicative)}.
                </div>
                <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.7] text-white/75">
                  Heb je nog studieschuld, dan wordt dit waarschijnlijk eerst daarmee
                  verrekend. Niet zielig, wel overzicht: genoeg om alvast vooruit te rekenen.
                </p>
              </>
            )
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul geldige waarden in om een eerste indicatie van je compensatie te zien.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Jouw indicatie
            </h2>
            {result?.usesProvisionalBaseRate ? <Pill tone="accent">Voorlopig scenario</Pill> : null}
          </div>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            We bouwen je indicatie rustig op uit gemiste basisbeurs, een aanvullende
            tegemoetkoming als scenario en eventueel een studievoucher-scenario.
          </p>

          {result ? (
            <div className="mt-5">
              <ResultRow
                label="Gemiste basisbeurs"
                value={formatCurrency(result.baseCompensation)}
                sub={`${result.monthsUnderLoanSystem} maanden × ${formatCurrency(result.baseMonthlyRate)} per maand (${result.baseRateLabel})`}
              />
              <ResultRow
                label="Aanvullende tegemoetkoming"
                value={formatCurrency(result.additionalCompensation)}
                sub={
                  result.includeAdditionalCompensation
                    ? `${result.monthsUnderLoanSystem} maanden × ${formatCurrency(COMPENSATION_CONFIG.additionalMonthlyRate)} per maand`
                    : "Niet meegenomen in dit scenario"
                }
              />
              <ResultRow
                label="Studievoucher-scenario"
                value={formatCurrency(result.studyVoucherScenario)}
                sub={
                  result.includeStudyVoucherScenario
                    ? "Eenmalig scenariobedrag"
                    : "Niet meegenomen in dit scenario"
                }
              />
              <ResultRow
                label="Totaal indicatief"
                value={formatCurrency(result.totalIndicative)}
                sub="Voorlopige optelsom van de gekozen scenario's"
                accent
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Hoe is dit opgebouwd?
          </h2>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>
              1. We nemen je aantal maanden onder het leenstelsel als basis.
            </p>
            <p>
              2. Voor de gemiste basisbeurs gebruiken we het maandbedrag dat past bij
              je diplomascenario.
            </p>
            <p>
              3. Daarna tellen we optioneel een aanvullende tegemoetkoming en een
              studievoucher-scenario mee.
            </p>
            <div className="rounded-xl bg-[var(--paper-soft)] px-4 py-3 font-mono text-[13px] tabular text-[var(--ink)]">
              Totaal indicatief = basis + aanvullende scenario&apos;s + studievoucher
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat betekent dit voor je studieschuld?
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Heb je nog een openstaande studieschuld, dan wordt een tegemoetkoming
            waarschijnlijk eerst daarmee verrekend.
          </p>

          {result?.debtSettlement ? (
            <div className="mt-5">
              <ResultRow
                label="Huidige studieschuld"
                value={formatCurrency(result.debtSettlement.currentStudentDebt)}
                sub="Bedrag dat je zelf hebt ingevuld"
              />
              <ResultRow
                label="Waarschijnlijke verrekening met schuld"
                value={formatCurrency(result.debtSettlement.debtReduction)}
                sub="Deel dat vermoedelijk eerst je schuld verlaagt"
              />
              <ResultRow
                label="Mogelijke uitbetaling"
                value={formatCurrency(result.debtSettlement.possiblePayout)}
                sub="Alleen als je indicatieve totaal hoger is dan je resterende schuld"
              />
              <ResultRow
                label="Resterende schuld na verrekening"
                value={formatCurrency(
                  result.debtSettlement.remainingDebtAfterSettlement,
                )}
                sub="Wat in dit scenario overblijft"
                accent
              />
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              Waarschijnlijk wordt een tegemoetkoming eerst verrekend met eventuele
              studieschuld. Vul je schuld in voor een concretere indicatie.
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
            Wat kun je hiermee?
          </h2>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>
              Gebruik dit als eerste rekenhulp als je wilt weten of het om honderden,
              een paar duizend of meer gaat.
            </p>
            <p>
              Check daarna je persoonlijke DUO-omgeving, want daar zie je uiteindelijk
              wat er voor jouw situatie echt geldt.
            </p>
            <p>
              Reken ook vooruit wat een verrekening met je studieschuld praktisch voor
              je betekent: minder schuld, misschien minder uitbetaling, maar wel meer overzicht.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Belangrijke aannames
            </h2>
            <Pill tone="dark">Controleer bij DUO</Pill>
          </div>
          <div className="mt-4 space-y-3 text-[13.5px] leading-[1.7] text-[var(--muted)]">
            <p>
              Bedragen gecontroleerd op 18 mei 2026. Controleer altijd je persoonlijke
              DUO-omgeving voor de officiële uitkomst.
            </p>
            <p>
              {COMPENSATION_CONFIG.additionalCompensationLabel}: daarom tonen we deze
              alleen als scenario en niet als zekerheid.
            </p>
            {shouldShowProvisionalRateWarning ? (
              <p>
                Voor dit invoerscenario gebruiken we voorlopig het 2026-maandbedrag
                voor de gemiste basisbeurs. Dat bedrag kan later nog wijzigen.
              </p>
            ) : null}
            {shouldShowEligibilityNote ? (
              <p>
                Als je diploma nog niet rond is of je situatie bijzonder is, kunnen
                recht, timing en verrekening afhangen van DUO-regels en actuele wetgeving.
              </p>
            ) : null}
            <p>
              De studievoucher nemen we alleen mee als los scenario. Of die voor jou
              relevant is, hangt af van je persoonlijke geschiedenis bij DUO.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
