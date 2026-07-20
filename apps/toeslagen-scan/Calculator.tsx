"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import {
  createAllowanceQuestionFlowView,
  createAllowanceScanView,
  defaultValues,
  exampleValues,
  validateAllowanceScanForm,
} from "./logic";
import type {
  AllowanceQuestionFlowView,
  AllowanceResultCardView,
  AllowanceScanField,
  AllowanceScanFormState,
  YesNoUnknown,
} from "./types";

const yesNoUnknownOptions = [
  { value: "unknown", label: "Weet ik niet" },
  { value: "yes", label: "Ja" },
  { value: "no", label: "Nee" },
] as const;

function FieldShell({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  label,
  error,
  hint,
  inputMode = "decimal",
  onChange,
}: {
  id: AllowanceScanField;
  value: string;
  label: string;
  error?: string;
  hint?: string;
  inputMode?: "decimal" | "numeric" | "text";
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldShell>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="ring-focus hair h-12 min-w-0 rounded-md border bg-white px-4 font-mono text-[15px] tabular text-[var(--ink)] outline-none"
      />
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--soft)]">
          {hint}
        </p>
      ) : null}
      <div id={errorId}>
        <FieldError message={error} />
      </div>
    </FieldShell>
  );
}

function SelectField<T extends string>({
  id,
  value,
  label,
  options,
  hint,
  onChange,
}: {
  id: AllowanceScanField;
  value: T;
  label: string;
  options: readonly { value: T; label: string }[];
  hint?: string;
  onChange: (value: T) => void;
}) {
  const hintId = `${id}-hint`;

  return (
    <FieldShell>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-describedby={hint ? hintId : undefined}
        className="ring-focus hair h-12 min-w-0 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--soft)]">
          {hint}
        </p>
      ) : null}
    </FieldShell>
  );
}

function YesNoUnknownField({
  id,
  value,
  label,
  hint,
  onChange,
}: {
  id: AllowanceScanField;
  value: YesNoUnknown;
  label: string;
  hint?: string;
  onChange: (value: YesNoUnknown) => void;
}) {
  return (
    <SelectField
      id={id}
      value={value}
      label={label}
      hint={hint}
      options={yesNoUnknownOptions}
      onChange={onChange}
    />
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <h4 className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
        {title}
      </h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-[1.55] text-[var(--ink-2)]">
        {[...new Set(items)].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ResultCard({ card }: { card: AllowanceResultCardView }) {
  return (
    <article className="surface-panel p-5" aria-labelledby={`${card.kind}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id={`${card.kind}-title`} className="text-lg font-semibold text-[var(--ink)]">
            {card.title}
          </h3>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            Bronjaar {card.ruleYear} · {card.datasetId} v{card.datasetVersion}
          </p>
        </div>
        <span className="rounded-full border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-1 text-[12px] font-medium text-[var(--ink)]">
          {card.statusLabel}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.65] text-[var(--ink-2)]">{card.summary}</p>
      <ResultList title="Redenen" items={card.reasonMessages} />
      <ResultList title="Ontbrekende informatie" items={card.missingFieldMessages} />
      <ResultList title="Onzekerheden" items={card.uncertaintyMessages} />
      <div className="mt-4 flex flex-wrap gap-2">
        {card.sourceLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-link ring-focus inline-flex min-h-11 items-center rounded-lg border border-[var(--hair)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--ink)] underline-offset-4 hover:underline"
          >
            {link.label} <span className="sr-only">(opent extern)</span>
          </a>
        ))}
      </div>
    </article>
  );
}

function QuestionFlowSummary({ flow }: { flow: AllowanceQuestionFlowView }) {
  if (!flow.isValid) {
    return null;
  }

  const inferred = [...new Set(flow.items.flatMap((item) => item.inferredFieldLabels))];
  const skipped = [...new Set(flow.items.flatMap((item) => item.skippedFieldLabels))];
  const notApplicable = [...new Set(flow.items.flatMap((item) => item.notApplicableFieldLabels))];
  const blocking = [...new Set(flow.items.flatMap((item) => item.blockingFieldLabels))];

  return (
    <section className="surface-panel p-4" aria-labelledby="toeslagen-question-flow-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="toeslagen-question-flow-title" className="text-base font-semibold text-[var(--ink)]">
            Voortgang
          </h3>
          <p className="mt-1 text-[13px] leading-[1.55] text-[var(--muted)]">
            {flow.completed} van {flow.totalRelevant} relevante vragen verwerkt.
          </p>
        </div>
        <span className="rounded-full border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-1 text-[12px] font-medium text-[var(--ink)]">
          {flow.percentage}%
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--paper-soft)]"
        aria-hidden="true"
      >
        <div className="h-full bg-[var(--accent)]" style={{ width: `${flow.percentage}%` }} />
      </div>
      <p className="mt-3 text-[13px] leading-[1.6] text-[var(--ink-2)]">
        {flow.decisionReason === "blocked"
          ? "De centrale vraagflow wacht op een verplicht onbekend gegeven."
          : flow.nextFieldLabel
            ? `Volgende vraag volgens de centrale vraagflow: ${flow.nextFieldLabel}.`
            : "De centrale vraagflow heeft geen vervolgvraag nodig voor de huidige invoer."}
      </p>
      <ResultList title="Verplicht onbekend" items={blocking} />
      <ResultList title="Afgeleid uit eerdere antwoorden" items={inferred} />
      <ResultList title="Overgeslagen of niet van toepassing" items={[...skipped, ...notApplicable]} />
    </section>
  );
}

export default function ToeslagenScanCalculator() {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    setValues,
    reset,
  } = useSubmittedCalculation<AllowanceScanFormState>(defaultValues);
  const errors = validateAllowanceScanForm(formValues);
  const submittedView = useMemo(
    () => (submittedValues ? createAllowanceScanView(submittedValues) : null),
    [submittedValues],
  );
  const questionFlowView = useMemo(
    () => createAllowanceQuestionFlowView(formValues),
    [formValues],
  );
  const hasErrors = Object.keys(errors).length > 0;
  const hasPartner = formValues.partnerStatus === "yes";
  const renting = formValues.tenure === "rent";
  const hasCoResidents = renting && formValues.hasCoResidents === "yes";
  const hasChildren = formValues.hasChildren === "yes";
  const usesChildcare = hasChildren && formValues.usesChildcare === "yes";

  useEffect(() => {
    if (!submittedView?.result) {
      return;
    }

    resultRef.current?.focus();
  }, [submittedView]);

  function updateField<K extends keyof AllowanceScanFormState>(
    field: K,
    value: AllowanceScanFormState[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    if (hasErrors) {
      document.getElementById("toeslagen-foutsummary")?.focus();
      return;
    }
    submit();
  }

  const inputs = (
    <div className="space-y-7">
      {hasErrors ? (
        <div
          id="toeslagen-foutsummary"
          tabIndex={-1}
          className="rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]"
        >
          Controleer de technisch ongeldige invoer. Onbekende inhoudelijke gegevens mag je als
          “Weet ik niet” laten staan.
        </div>
      ) : null}

      <QuestionFlowSummary flow={questionFlowView} />

      <section className="space-y-4" aria-labelledby="toeslagen-step-household">
        <h3 id="toeslagen-step-household" className="font-serif text-[23px] text-[var(--ink)]">
          Stap 1 · Over jou en je huishouden
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="age"
            label="Leeftijd"
            value={formValues.age}
            error={errors.age}
            inputMode="numeric"
            onChange={(value) => updateField("age", value)}
          />
          <SelectField
            id="partnerStatus"
            label="Heb je een toeslagpartner?"
            value={formValues.partnerStatus}
            options={yesNoUnknownOptions}
            onChange={(value) => updateField("partnerStatus", value)}
          />
          <TextInput
            id="assessmentIncome"
            label="Geschat toetsingsinkomen"
            value={formValues.assessmentIncome}
            error={errors.assessmentIncome}
            hint="Schatting voor kalenderjaar 2026."
            onChange={(value) => updateField("assessmentIncome", value)}
          />
          <TextInput
            id="assets"
            label="Vermogen op 1 januari"
            value={formValues.assets}
            error={errors.assets}
            onChange={(value) => updateField("assets", value)}
          />
          {hasPartner ? (
            <>
              <TextInput
                id="jointAssessmentIncome"
                label="Gezamenlijk toetsingsinkomen"
                value={formValues.jointAssessmentIncome}
                error={errors.jointAssessmentIncome}
                onChange={(value) => updateField("jointAssessmentIncome", value)}
              />
              <TextInput
                id="jointAssets"
                label="Gezamenlijk vermogen op 1 januari"
                value={formValues.jointAssets}
                error={errors.jointAssets}
                onChange={(value) => updateField("jointAssets", value)}
              />
            </>
          ) : null}
        </div>
        <DisclosureSection title="Wanneer heb je een toeslagpartner?">
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Dienst Toeslagen bepaalt dit aan de hand van je persoonlijke situatie. Kies
            “Weet ik niet” als je twijfelt en controleer de officiële uitleg.
          </p>
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/toeslagpartner"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-link ring-focus inline-flex min-h-11 items-center rounded-lg text-[13px] font-medium text-[var(--ink)] underline outline-none"
          >
            Officiële uitleg over toeslagpartner <span className="sr-only">(opent extern)</span>
          </a>
        </DisclosureSection>
        <div className="grid gap-4 sm:grid-cols-2">
          <YesNoUnknownField
            id="complexSituation"
            label="Complexe of uitzonderlijke situatie?"
            value={formValues.complexSituation}
            onChange={(value) => updateField("complexSituation", value)}
          />
          <YesNoUnknownField
            id="foreignOrResidenceSituation"
            label="Buitenland of verblijfsstatus relevant?"
            value={formValues.foreignOrResidenceSituation}
            onChange={(value) => updateField("foreignOrResidenceSituation", value)}
          />
          <YesNoUnknownField
            id="specialAssets"
            label="Bijzonder vermogen?"
            value={formValues.specialAssets}
            onChange={(value) => updateField("specialAssets", value)}
          />
          <YesNoUnknownField
            id="partYearPartner"
            label="Partner voor deel van het jaar?"
            value={formValues.partYearPartner}
            onChange={(value) => updateField("partYearPartner", value)}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="toeslagen-step-healthcare">
        <h3 id="toeslagen-step-healthcare" className="font-serif text-[23px] text-[var(--ink)]">
          Stap 2 · Zorgverzekering
        </h3>
        <YesNoUnknownField
          id="hasDutchHealthInsurance"
          label="Heb je een Nederlandse zorgverzekering?"
          value={formValues.hasDutchHealthInsurance}
          onChange={(value) => updateField("hasDutchHealthInsurance", value)}
        />
      </section>

      <section className="space-y-4" aria-labelledby="toeslagen-step-rent">
        <h3 id="toeslagen-step-rent" className="font-serif text-[23px] text-[var(--ink)]">
          Stap 3 · Wonen
        </h3>
        <SelectField
          id="tenure"
          label="Woonsituatie"
          value={formValues.tenure}
          options={[
            { value: "unknown", label: "Weet ik niet" },
            { value: "rent", label: "Huurwoning" },
            { value: "owner", label: "Koopwoning" },
            { value: "other", label: "Anders" },
          ]}
          onChange={(value) => updateField("tenure", value)}
        />
        {renting ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <YesNoUnknownField
              id="independentHome"
              label="Zelfstandige woonruimte?"
              value={formValues.independentHome}
              onChange={(value) => updateField("independentHome", value)}
            />
            <TextInput
              id="basicRent"
              label="Kale huur per maand"
              value={formValues.basicRent}
              error={errors.basicRent}
              onChange={(value) => updateField("basicRent", value)}
            />
            <YesNoUnknownField
              id="hasCoResidents"
              label="Zijn er medebewoners?"
              value={formValues.hasCoResidents}
              onChange={(value) => updateField("hasCoResidents", value)}
            />
            <YesNoUnknownField
              id="complexHousing"
              label="Bijzondere of complexe woonsituatie?"
              value={formValues.complexHousing}
              onChange={(value) => updateField("complexHousing", value)}
            />
            {hasCoResidents ? (
              <>
                <TextInput
                  id="householdIncome"
                  label="Huishoudinkomen voor huurtoeslag"
                  value={formValues.householdIncome}
                  error={errors.householdIncome}
                  onChange={(value) => updateField("householdIncome", value)}
                />
                <TextInput
                  id="householdAssets"
                  label="Huishoudvermogen"
                  value={formValues.householdAssets}
                  error={errors.householdAssets}
                  onChange={(value) => updateField("householdAssets", value)}
                />
              </>
            ) : null}
            <YesNoUnknownField
              id="adaptedHomeOrDisability"
              label="Aangepaste woning of beperking relevant?"
              value={formValues.adaptedHomeOrDisability}
              onChange={(value) => updateField("adaptedHomeOrDisability", value)}
            />
            <YesNoUnknownField
              id="uncertainSubsidiableRent"
              label="Twijfel over kale huur of servicekosten?"
              value={formValues.uncertainSubsidiableRent}
              onChange={(value) => updateField("uncertainSubsidiableRent", value)}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4" aria-labelledby="toeslagen-step-children">
        <h3 id="toeslagen-step-children" className="font-serif text-[23px] text-[var(--ink)]">
          Stap 4 · Kinderen
        </h3>
        <YesNoUnknownField
          id="hasChildren"
          label="Heb je kinderen?"
          value={formValues.hasChildren}
          onChange={(value) => updateField("hasChildren", value)}
        />
        {hasChildren ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              id="childCount"
              label="Aantal kinderen"
              value={formValues.childCount}
              error={errors.childCount}
              inputMode="numeric"
              onChange={(value) => updateField("childCount", value)}
            />
            <TextInput
              id="childAges"
              label="Leeftijden kinderen"
              value={formValues.childAges}
              error={errors.childAges}
              inputMode="text"
              hint="Bijvoorbeeld: 3, 7"
              onChange={(value) => updateField("childAges", value)}
            />
            <YesNoUnknownField
              id="receivesChildBenefit"
              label="Is er kinderbijslag voor je kind?"
              value={formValues.receivesChildBenefit}
              onChange={(value) => updateField("receivesChildBenefit", value)}
            />
            <SelectField
              id="childLivesWithApplicant"
              label="Woont het kind bij jou?"
              value={formValues.childLivesWithApplicant}
              options={[
                { value: "unknown", label: "Weet ik niet" },
                { value: "yes", label: "Ja" },
                { value: "no", label: "Nee" },
                { value: "partial", label: "Gedeeltelijk / co-ouderschap" },
              ]}
              onChange={(value) => updateField("childLivesWithApplicant", value)}
            />
            <YesNoUnknownField
              id="complexFamily"
              label="Complexe gezinssituatie?"
              value={formValues.complexFamily}
              onChange={(value) => updateField("complexFamily", value)}
            />
          </div>
        ) : null}
      </section>

      {hasChildren ? (
        <section className="space-y-4" aria-labelledby="toeslagen-step-childcare">
          <h3 id="toeslagen-step-childcare" className="font-serif text-[23px] text-[var(--ink)]">
            Stap 5 · Kinderopvang
          </h3>
          <YesNoUnknownField
            id="usesChildcare"
            label="Gebruik je betaalde kinderopvang?"
            value={formValues.usesChildcare}
            onChange={(value) => updateField("usesChildcare", value)}
          />
          {usesChildcare ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <YesNoUnknownField
                id="registeredChildcare"
                label="Staat de opvang geregistreerd in het LRK?"
                value={formValues.registeredChildcare}
                onChange={(value) => updateField("registeredChildcare", value)}
              />
              <YesNoUnknownField
                id="paysOwnContribution"
                label="Betaal je zelf een deel van de opvang?"
                value={formValues.paysOwnContribution}
                onChange={(value) => updateField("paysOwnContribution", value)}
              />
              <TextInput
                id="childcareHoursPerMonth"
                label="Opvanguren per maand"
                value={formValues.childcareHoursPerMonth}
                error={errors.childcareHoursPerMonth}
                onChange={(value) => updateField("childcareHoursPerMonth", value)}
              />
              <SelectField
                id="applicantActivity"
                label="Jouw activiteit"
                value={formValues.applicantActivity}
                options={[
                  { value: "unknown", label: "Weet ik niet" },
                  { value: "work", label: "Werk" },
                  { value: "study", label: "Studie" },
                  { value: "trajectory", label: "Traject / inburgering" },
                  { value: "none", label: "Geen" },
                ]}
                onChange={(value) => updateField("applicantActivity", value)}
              />
              {hasPartner ? (
                <SelectField
                  id="partnerActivity"
                  label="Activiteit toeslagpartner"
                  value={formValues.partnerActivity}
                  options={[
                    { value: "unknown", label: "Weet ik niet" },
                    { value: "work", label: "Werk" },
                    { value: "study", label: "Studie" },
                    { value: "trajectory", label: "Traject / inburgering" },
                    { value: "none", label: "Geen" },
                  ]}
                  onChange={(value) => updateField("partnerActivity", value)}
                />
              ) : null}
              <YesNoUnknownField
                id="complexChildcare"
                label="Meerdere opvangvormen of wisselende situatie?"
                value={formValues.complexChildcare}
                onChange={(value) => updateField("complexChildcare", value)}
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );

  const result = submittedView?.result ? (
    <div
      id="tool-result-summary"
      ref={resultRef}
      tabIndex={-1}
      className="space-y-5 outline-none"
      aria-live="polite"
    >
      <section className="surface-panel-strong p-6 text-white">
        <h2 className="text-xl font-semibold">Samenvatting</h2>
        <p className="mt-3 text-[14px] leading-[1.65] text-white/80">
          {submittedView.result.summary}
        </p>
        {hasDirtyChanges ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-[13px] text-white/80"
          >
            Je hebt de invoer gewijzigd na de laatste scan. Klik opnieuw op
            Bekijk mijn toeslagensignalen voor een actuele uitkomst.
          </p>
        ) : null}
      </section>
      <div className="grid gap-4">
        {submittedView.result.cards.map((card) => (
          <ResultCard key={card.kind} card={card} />
        ))}
      </div>
    </div>
  ) : (
    <section id="tool-result-summary" className="surface-panel p-5">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
        Nog geen scan uitgevoerd
      </h2>
      <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
        Vul in wat je weet. “Weet ik niet” mag; de centrale signalering toont dan
        ontbrekende informatie in plaats van een harde conclusie.
      </p>
    </section>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Beta · signalering 2026
          </div>
          <h2 className="mt-2 font-serif text-[30px] tracking-[-0.02em] text-[var(--ink)]">
            Welke toeslagen passen mogelijk bij mij?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze scan geeft alleen een signaal voor vier toeslagen. Er worden geen
            toeslagbedragen berekend en je antwoorden worden door deze app niet opgeslagen.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton type="button" onClick={() => setValues(exampleValues)}>
            Voorbeeldwaarden
          </ToolActionButton>
          <ToolActionButton type="button" onClick={() => reset("Invoer gewist.")}>
            Wis invoer
          </ToolActionButton>
        </div>
      }
      inputs={inputs}
      submitAction={
        <ToolActionButton
          type="button"
          variant="accent"
          size="md"
          onClick={handleSubmit}
          full
        >
          Bekijk mijn toeslagensignalen
        </ToolActionButton>
      }
      result={result}
      details={
        <DisclosureSection title="Afbakening">
          <ul className="list-disc space-y-2 pl-5 text-[13px] leading-[1.65] text-[var(--muted)]">
            <li>Deze beta gebruikt de centrale 2026-signaleringsregels.</li>
            <li>Complexe situaties verwijzen naar de officiële proefberekening.</li>
            <li>Deze scan is geen officiële beschikking en berekent geen bedragen.</li>
          </ul>
        </DisclosureSection>
      }
      disclaimer={
        <p className="surface-subtle p-4 text-[12.5px] leading-[1.7] text-[var(--muted)]">
          Geen advies en geen officiële beschikking. Controleer altijd de officiële voorwaarden
          en proefberekening van Dienst Toeslagen; die blijven leidend.
        </p>
      }
    />
  );
}
