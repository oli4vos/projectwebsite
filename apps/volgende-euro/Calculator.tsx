"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { createProfilePrefillState, mergeProfilePatchIntoValues } from "@/lib/profile-prefill";
import { getVolgendeEuroDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateVolgendeEuroPriorities, type VolgendeEuroInput } from "./logic";

type FormState = {
  year: string;
  extraAmount: string;
  monthlyFreeRoom: string;
  currentBuffer: string;
  targetBuffer: string;
  hasExpensiveDebt: boolean;
  expensiveDebtRate: string;
  expensiveDebtAmount: string;
  studentDebtAmount: string;
  duoRate: string;
  mortgageRate: string;
  hasJaarruimte: boolean;
  availableJaarruimte: string;
  horizonYears: string;
  expectedAnnualReturn: string;
  hasHousingGoal: boolean;
  riskProfile: "conservative" | "neutral" | "offensive";
  targetHomePrice: string;
  ownFunds: string;
};

const exampleValues: FormState = {
  year: String(getDefaultFinancialYear()),
  extraAmount: "1000",
  monthlyFreeRoom: "300",
  currentBuffer: "5000",
  targetBuffer: "12000",
  hasExpensiveDebt: false,
  expensiveDebtRate: "",
  expensiveDebtAmount: "",
  studentDebtAmount: "15000",
  duoRate: "2.33",
  mortgageRate: "4",
  hasJaarruimte: false,
  availableJaarruimte: "",
  horizonYears: "15",
  expectedAnnualReturn: "5",
  hasHousingGoal: false,
  riskProfile: "neutral",
  targetHomePrice: "",
  ownFunds: "",
};

const defaultValues: FormState = {
  year: "",
  extraAmount: "",
  monthlyFreeRoom: "",
  currentBuffer: "",
  targetBuffer: "",
  hasExpensiveDebt: false,
  expensiveDebtRate: "",
  expensiveDebtAmount: "",
  studentDebtAmount: "",
  duoRate: "",
  mortgageRate: "",
  hasJaarruimte: false,
  availableJaarruimte: "",
  horizonYears: "",
  expectedAnnualReturn: "",
  hasHousingGoal: false,
  riskProfile: "neutral",
  targetHomePrice: "",
  ownFunds: "",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

function parseOptionalNumber(value: string | undefined) {
  return parseOptionalDecimalInput(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function toInput(values: FormState): VolgendeEuroInput {
  return {
    year: parseOptionalNumber(values.year),
    extraAmount: parseOptionalNumber(values.extraAmount),
    monthlyFreeRoom: parseOptionalNumber(values.monthlyFreeRoom),
    currentBuffer: parseOptionalNumber(values.currentBuffer),
    targetBuffer: parseOptionalNumber(values.targetBuffer),
    hasExpensiveDebt: values.hasExpensiveDebt,
    expensiveDebtRate: values.hasExpensiveDebt ? parseOptionalNumber(values.expensiveDebtRate) : undefined,
    expensiveDebtAmount: values.hasExpensiveDebt ? parseOptionalNumber(values.expensiveDebtAmount) : undefined,
    studentDebtAmount: parseOptionalNumber(values.studentDebtAmount),
    duoRate: parseOptionalNumber(values.duoRate),
    mortgageRate: parseOptionalNumber(values.mortgageRate),
    availableJaarruimte: values.hasJaarruimte ? parseOptionalNumber(values.availableJaarruimte) : undefined,
    horizonYears: parseOptionalNumber(values.horizonYears),
    expectedAnnualReturn: parseOptionalNumber(values.expectedAnnualReturn),
    hasHousingGoal: values.hasHousingGoal,
    riskProfile: values.riskProfile,
    targetHomePrice: values.hasHousingGoal ? parseOptionalNumber(values.targetHomePrice) : undefined,
    ownFunds: values.hasHousingGoal ? parseOptionalNumber(values.ownFunds) : undefined,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-700">{message}</p>;
}

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  const year = parseOptionalNumber(values.year);
  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }
  const extraAmount = parseOptionalNumber(values.extraAmount);
  if (extraAmount !== undefined && (!Number.isFinite(extraAmount) || extraAmount < 0)) {
    errors.extraAmount = "Gebruik 0 of een hoger bedrag.";
  }
  return errors;
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getVolgendeEuroDefaultsFromProfile(profile);
  const { hasRelevantProfileValues, profileKey, initialValues } = createProfilePrefillState<FormState>({
    defaultValues,
    profilePatch,
    hasProfile,
    profileUpdatedAt: profile.updatedAt,
  });

  return (
    <CalculatorContent
      key={profileKey}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      profilePatch={profilePatch}
    />
  );
}

function CalculatorContent({ initialValues, hasRelevantProfileValues, profilePatch }: CalculatorContentProps) {
  const [formValues, setFormValues] = useState<FormState>(initialValues);
  const [submittedValues, setSubmittedValues] = useState<FormState | null>(null);
  const [submitContextMessage, setSubmitContextMessage] = useState<string | null>(null);
  const validationErrors = validate(formValues);
  const errors = Object.fromEntries(
    Object.entries(validationErrors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as Partial<Record<keyof FormState, string>>;

  const submittedResult = useMemo(() => {
    if (!submittedValues) return null;
    return calculateVolgendeEuroPriorities(toInput(submittedValues));
  }, [submittedValues]);

  const hasDirtyChanges = Boolean(submittedValues) && JSON.stringify(formValues) !== JSON.stringify(submittedValues);

  const mobileFlow = useMobileFieldFlow([
    "year",
    "extraAmount",
    "monthlyFreeRoom",
    "currentBuffer",
    "targetBuffer",
    "hasExpensiveDebt",
    ...(formValues.hasExpensiveDebt ? ["expensiveDebtRate", "expensiveDebtAmount"] : []),
    "studentDebtAmount",
    "duoRate",
    "mortgageRate",
    "hasJaarruimte",
    ...(formValues.hasJaarruimte ? ["availableJaarruimte"] : []),
    "horizonYears",
    "expectedAnnualReturn",
    "hasHousingGoal",
    ...(formValues.hasHousingGoal ? ["targetHomePrice", "ownFunds"] : []),
    "riskProfile",
  ]);

  const inputQuality = useMemo(() => {
    const checks = [
      { label: "belastingjaar", ok: parseOptionalNumber(formValues.year) !== undefined },
      { label: "extra bedrag", ok: parseOptionalNumber(formValues.extraAmount) !== undefined },
      {
        label: "buffer (huidig + gewenst)",
        ok:
          parseOptionalNumber(formValues.currentBuffer) !== undefined &&
          parseOptionalNumber(formValues.targetBuffer) !== undefined,
      },
      {
        label: "dure schuld details",
        ok:
          !formValues.hasExpensiveDebt ||
          parseOptionalNumber(formValues.expensiveDebtRate) !== undefined ||
          parseOptionalNumber(formValues.expensiveDebtAmount) !== undefined,
      },
      {
        label: "beleggen (horizon + rendement)",
        ok:
          parseOptionalNumber(formValues.horizonYears) !== undefined &&
          parseOptionalNumber(formValues.expectedAnnualReturn) !== undefined,
      },
    ];
    const filled = checks.filter((check) => check.ok).length;
    const missing = checks.filter((check) => !check.ok).map((check) => check.label);
    return { total: checks.length, filled, missing };
  }, [formValues]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyExampleValues() {
    setFormValues(exampleValues);
    setSubmitContextMessage("Voorbeeldwaarden geladen. Klik op Bereken om de uitkomst te zien.");
  }
  function applyProfileValues() {
    setFormValues((current) => mergeProfilePatchIntoValues(current, profilePatch));
    setSubmitContextMessage("Profielwaarden geladen. Klik op Bereken om de uitkomst te zien.");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (Object.keys(validationErrors).length > 0) return;
    setSubmittedValues(formValues);
    setSubmitContextMessage(null);
    document.getElementById("tool-result-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const result = submittedResult;
  const relevantTopThree = result?.topThree ?? [];
  const insufficient = (result?.priorities ?? []).filter((p) => p.applicability !== "relevant");

  const intro = (
    <>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Beslis-tool</div>
      <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">Wat doe ik met mijn volgende euro?</h2>
      <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">Vul in wat je weet en klik op Bereken. De tool gebruikt alleen de gegevens die je invult.</p>
    </>
  );

  const startActions = (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
        {hasRelevantProfileValues ? <span>Profielwaarden gevonden in deze browser.</span> : <span>Start leeg of laad voorbeeldwaarden.</span>}
        <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">Start met voorbeeldwaarden</ToolActionButton>
        {hasRelevantProfileValues ? (
          <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">Start met profielwaarden</ToolActionButton>
        ) : null}
      </div>
      {submitContextMessage ? <p className="mt-3 text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p> : null}
      {hasDirtyChanges ? <p className="mt-3 text-[12.5px] text-[var(--muted)]">Klik opnieuw op Bereken om de uitkomst te vernieuwen.</p> : null}
      <div className="mt-3 rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-2 text-[12.5px] text-[var(--muted)]">
        <p>
          Invoerkwaliteit: {inputQuality.filled}/{inputQuality.total} kernvelden ingevuld.
        </p>
        {inputQuality.missing.length > 0 ? (
          <p className="mt-1">
            Ontbrekend: {inputQuality.missing.join(", ")}.
          </p>
        ) : null}
      </div>
    </>
  );

  const submitAction = (
    <MobileFieldFlowControls
      current={mobileFlow.activeIndex + 1}
      total={mobileFlow.total}
      canGoPrev={mobileFlow.canGoPrev}
      canGoNext={mobileFlow.canGoNext}
      canComplete={Boolean(submittedValues)}
      onPrev={mobileFlow.goPrev}
      onNext={mobileFlow.goNext}
      onComplete={() => document.getElementById("tool-result-summary")?.scrollIntoView({ behavior: "smooth", block: "start" })}
    />
  );

  const resultNode = (
    <>
      <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Samenvatting</div>
        {!result ? (
          <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
            Vul in wat je weet en klik op Bereken. De tool gebruikt alleen de gegevens die je invult.
          </p>
        ) : result.topRecommendation ? (
          <>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="font-serif text-[28px] leading-none tracking-[-0.03em]">{result.topRecommendation.label}</div>
              <Pill tone="accent">{result.priorityPlan[0]?.status ?? "daarna"}</Pill>
            </div>
            <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
              Op basis van je ingevulde gegevens lijkt dit nu je logische eerste stap.
            </p>
          </>
        ) : (
          <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
            We hebben nog te weinig gegevens om een zinvolle volgorde te maken.
          </p>
        )}
      </div>

      {result?.topRecommendation ? (
        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">Top 3 relevante stappen</h3>
          <div className="mt-4 space-y-3">
            {relevantTopThree.map((option, index) => (
              <div key={option.key} className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                <div className="font-medium text-[var(--ink)]">{index + 1}. {option.label}</div>
                <p className="mt-1 text-[13px] leading-[1.6] text-[var(--muted)]">{option.reason}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result && insufficient.length > 0 ? (
        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[22px] tracking-[-0.02em] text-[var(--ink)]">Niet meegenomen door ontbrekende gegevens</h3>
          <ul className="mt-3 space-y-2 text-[13px] leading-[1.6] text-[var(--muted)]">
            {insufficient.map((item) => (
              <li key={item.key}>
                {item.label}: {item.missingFields?.length ? `vul ${item.missingFields.join(" en ")} in.` : "onvoldoende gegevens."}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && result.priorityPlan.length > 0 ? (
        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">Prioriteitenladder</h3>
          <div className="mt-4 space-y-3">
            {result.priorityPlan.map((step) => (
              <div key={`${step.key}-${step.rank}`} className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--ink)]">Stap {step.rank}. {step.title}</div>
                  <Pill tone={step.status === "nu doen" ? "pos" : step.status === "daarna" ? "accent" : "neg"}>{step.status}</Pill>
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">{step.actionLabel}</p>
                <div className="mt-3 grid gap-2 rounded-lg border border-[var(--hair)] bg-white px-3 py-2">
                  <ResultRow label="Bedrag naar deze stap" value={formatCurrency(step.allocatedAmount ?? 0)} />
                  <ResultRow label="Resterend na deze stap" value={formatCurrency(step.remainingAfterStep ?? 0)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

  const detailsNode = (
    <>
      <DisclosureSection title="Hoe rekenen we dit?" subtitle="Educatief prioriteitenmodel, geen hard financieel advies.">
        <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
          <p>1) We nemen alleen stappen mee waarvoor je genoeg gegevens invult.</p>
          <p>2) We tonen geen harde aanbeveling als relevante input ontbreekt.</p>
          <p>3) Je verplichte DUO-bedrag blijft altijd context; extra aflossen is de keuze erbovenop.</p>
          {result ? <p>4) Indicatief wettelijk DUO-bedrag: {formatCurrency(result.duoContext.estimatedStatutoryMonthlyPayment)} per maand.</p> : null}
        </div>
      </DisclosureSection>

      <DisclosureSection title="Welke aannames gebruiken we?" subtitle="Centrale constants als basis voor het model.">
        {result ? (
          <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            <p>Bron: {result.assumptions.sourceLabel}</p>
            <p>Gecontroleerd op: {result.assumptions.lastChecked}</p>
            <p>Status: {result.assumptions.status}</p>
          </div>
        ) : null}
      </DisclosureSection>
    </>
  );

  const disclaimerNode = (
    <ToolDisclosure title="Waar moet je op letten?" subtitle="Gebruik dit als routehulp en reken daarna door in verdiepende tools.">
      <ul className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
        {(result?.warnings ?? []).map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
        {(result?.missingDataHints ?? []).map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </ToolDisclosure>
  );

  const inputForm = (
    <form className="grid gap-5" onSubmit={onSubmit}>
      {(
        [
          ["year", "Belastingjaar"],
          ["extraAmount", "Extra bedrag beschikbaar"],
          ["monthlyFreeRoom", "Maandelijkse vrije ruimte"],
          ["currentBuffer", "Huidige buffer"],
          ["targetBuffer", "Gewenste buffer"],
          ["studentDebtAmount", "Studieschuld"],
          ["duoRate", "DUO-rente (%)"],
          ["mortgageRate", "Hypotheekrente (%)"],
          ["horizonYears", "Beleggingshorizon (jaren)"],
          ["expectedAnnualReturn", "Verwacht rendement (%)"],
        ] as const
      ).map(([field, label]) => (
        <label key={field} className={mobileFlow.getFieldClassName(field)}>
          <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">{label}</span>
          <input
            inputMode="decimal"
            value={formValues[field]}
            onChange={(event) => updateField(field, event.target.value)}
            onKeyDown={mobileFlow.handleEnterAdvance(field, Boolean(errors[field]))}
            className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
          />
          <FieldError message={errors[field]} />
        </label>
      ))}

      <label className={mobileFlow.getFieldClassName("hasExpensiveDebt")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Dure schuld aanwezig</span>
        <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
          <input type="checkbox" checked={formValues.hasExpensiveDebt} onChange={(event) => updateField("hasExpensiveDebt", event.target.checked)} className="size-4 accent-[var(--accent)]" />
          Ja
        </span>
      </label>

      {formValues.hasExpensiveDebt ? (
        <>
          <label className={mobileFlow.getFieldClassName("expensiveDebtRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Rente dure schuld (%)</span>
            <input inputMode="decimal" value={formValues.expensiveDebtRate} onChange={(event) => updateField("expensiveDebtRate", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
          <label className={mobileFlow.getFieldClassName("expensiveDebtAmount")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Bedrag dure schuld</span>
            <input inputMode="decimal" value={formValues.expensiveDebtAmount} onChange={(event) => updateField("expensiveDebtAmount", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
        </>
      ) : null}

      <label className={mobileFlow.getFieldClassName("hasJaarruimte")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Jaarruimte beschikbaar</span>
        <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
          <input type="checkbox" checked={formValues.hasJaarruimte} onChange={(event) => updateField("hasJaarruimte", event.target.checked)} className="size-4 accent-[var(--accent)]" />
          Ja
        </span>
      </label>
      {formValues.hasJaarruimte ? (
        <label className={mobileFlow.getFieldClassName("availableJaarruimte")}>
          <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Beschikbare jaarruimte</span>
          <input inputMode="decimal" value={formValues.availableJaarruimte} onChange={(event) => updateField("availableJaarruimte", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
        </label>
      ) : null}

      <label className={mobileFlow.getFieldClassName("hasHousingGoal")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Woningdoel actief</span>
        <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
          <input type="checkbox" checked={formValues.hasHousingGoal} onChange={(event) => updateField("hasHousingGoal", event.target.checked)} className="size-4 accent-[var(--accent)]" />
          Ja
        </span>
      </label>
      {formValues.hasHousingGoal ? (
        <>
          <label className={mobileFlow.getFieldClassName("targetHomePrice")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Doel koopprijs</span>
            <input inputMode="decimal" value={formValues.targetHomePrice} onChange={(event) => updateField("targetHomePrice", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
          <label className={mobileFlow.getFieldClassName("ownFunds")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Eigen geld nu</span>
            <input inputMode="decimal" value={formValues.ownFunds} onChange={(event) => updateField("ownFunds", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
        </>
      ) : null}

      <label className={mobileFlow.getFieldClassName("riskProfile")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Risicoprofiel</span>
        <select value={formValues.riskProfile} onChange={(event) => updateField("riskProfile", event.target.value as FormState["riskProfile"])} className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none">
          <option value="conservative">Voorzichtig</option>
          <option value="neutral">Neutraal</option>
          <option value="offensive">Offensief</option>
        </select>
      </label>

      <div className="space-y-3 border-t border-[var(--hair)] pt-4">
        <ToolActionButton type="submit" variant="submit" size="md" full>
          {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
        </ToolActionButton>
        <p className="text-[12px] text-[var(--muted)]">De tool rekent alleen met ingevulde gegevens.</p>
      </div>
    </form>
  );

  return (
    <CalculatorShell
      intro={intro}
      startActions={startActions}
      inputs={inputForm}
      submitAction={submitAction}
      result={resultNode}
      details={detailsNode}
      disclaimer={disclaimerNode}
    />
  );
}
