"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { SaveScenarioButton } from "@/components/SaveScenarioButton";
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
  extraAmount: string;
  currentBuffer: string;
  targetBuffer: string;
  openToInvesting: boolean;
  horizonYears: string;
  expectedAnnualReturn: string;
  hasDebt: boolean;
  primaryDebtIsDuo: boolean;
  primaryDebtAmount: string;
  primaryDebtRate: string;
  hasOtherDebt: boolean;
  otherDebtAmount: string;
  otherDebtRate: string;
  hasMortgage: boolean;
  mortgageRate: string;
  riskProfile: "conservative" | "neutral" | "offensive";
};

const exampleValues: FormState = {
  extraAmount: "1000",
  currentBuffer: "5000",
  targetBuffer: "12000",
  openToInvesting: true,
  horizonYears: "15",
  expectedAnnualReturn: "5",
  hasDebt: true,
  primaryDebtIsDuo: true,
  primaryDebtAmount: "15000",
  primaryDebtRate: "2.33",
  hasOtherDebt: false,
  otherDebtAmount: "",
  otherDebtRate: "",
  hasMortgage: true,
  mortgageRate: "4",
  riskProfile: "neutral",
};

const defaultValues: FormState = {
  extraAmount: "",
  currentBuffer: "",
  targetBuffer: "",
  openToInvesting: false,
  horizonYears: "",
  expectedAnnualReturn: "",
  hasDebt: false,
  primaryDebtIsDuo: true,
  primaryDebtAmount: "",
  primaryDebtRate: "",
  hasOtherDebt: false,
  otherDebtAmount: "",
  otherDebtRate: "",
  hasMortgage: false,
  mortgageRate: "",
  riskProfile: "neutral",
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function toInput(values: FormState): VolgendeEuroInput {
  const primaryDebtAmount = parseOptionalNumber(values.primaryDebtAmount);
  const primaryDebtRate = parseOptionalNumber(values.primaryDebtRate);
  const otherDebtAmount = parseOptionalNumber(values.otherDebtAmount);
  const otherDebtRate = parseOptionalNumber(values.otherDebtRate);
  const hasPrimaryNonDuoDebt = values.hasDebt && !values.primaryDebtIsDuo;
  const hasAnyNonDuoDebt = hasPrimaryNonDuoDebt || values.hasOtherDebt;
  const combinedNonDuoDebtAmount = (hasPrimaryNonDuoDebt ? primaryDebtAmount ?? 0 : 0) + (values.hasOtherDebt ? otherDebtAmount ?? 0 : 0);
  const combinedNonDuoDebtRate = hasPrimaryNonDuoDebt
    ? values.hasOtherDebt
      ? Math.max(primaryDebtRate ?? 0, otherDebtRate ?? 0)
      : primaryDebtRate
    : values.hasOtherDebt
      ? otherDebtRate
      : undefined;

  return {
    year: getDefaultFinancialYear(),
    extraAmount: parseOptionalNumber(values.extraAmount),
    currentBuffer: parseOptionalNumber(values.currentBuffer),
    targetBuffer: parseOptionalNumber(values.targetBuffer),
    hasExpensiveDebt: hasAnyNonDuoDebt,
    expensiveDebtRate: hasAnyNonDuoDebt ? combinedNonDuoDebtRate : undefined,
    expensiveDebtAmount: hasAnyNonDuoDebt ? combinedNonDuoDebtAmount : undefined,
    studentDebtAmount:
      values.hasDebt && values.primaryDebtIsDuo
        ? primaryDebtAmount
        : undefined,
    duoRate:
      values.hasDebt && values.primaryDebtIsDuo
        ? primaryDebtRate
        : undefined,
    mortgageRate: values.hasMortgage ? parseOptionalNumber(values.mortgageRate) : undefined,
    horizonYears: values.openToInvesting ? parseOptionalNumber(values.horizonYears) : undefined,
    expectedAnnualReturn: values.openToInvesting
      ? parseOptionalNumber(values.expectedAnnualReturn)
      : undefined,
    riskProfile: values.riskProfile,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-700">{message}</p>;
}

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
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
    "extraAmount",
    "currentBuffer",
    "targetBuffer",
    "openToInvesting",
    ...(formValues.openToInvesting ? ["horizonYears", "expectedAnnualReturn"] : []),
    "hasDebt",
    ...(formValues.hasDebt
      ? [
          "primaryDebtIsDuo",
          "primaryDebtAmount",
          "primaryDebtRate",
          "hasOtherDebt",
          ...(formValues.hasOtherDebt ? ["otherDebtAmount", "otherDebtRate"] : []),
        ]
      : []),
    "hasMortgage",
    ...(formValues.hasMortgage ? ["mortgageRate"] : []),
    "riskProfile",
  ]);

  const inputQuality = useMemo(() => {
    const checks = [
      { label: "extra bedrag", ok: parseOptionalNumber(formValues.extraAmount) !== undefined },
      {
        label: "buffer (huidig + gewenst)",
        ok:
          parseOptionalNumber(formValues.currentBuffer) !== undefined &&
          parseOptionalNumber(formValues.targetBuffer) !== undefined,
      },
      {
        label: "schuldgegevens",
        ok:
          !formValues.hasDebt ||
          parseOptionalNumber(formValues.primaryDebtAmount) !== undefined,
      },
      {
        label: "beleggen (horizon + rendement)",
        ok:
          !formValues.openToInvesting ||
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

  function submitAndScroll() {
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setSubmittedValues(formValues);
    setSubmitContextMessage(null);
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const result = submittedResult;
  const relevantTopSteps = result?.topThree ?? [];
  const insufficient = (result?.priorities ?? []).filter((p) => p.applicability !== "relevant");
  const scenarioTitle = result?.topRecommendation
    ? `Volgende euro — ${result.topRecommendation.label}`
    : "Volgende euro scenario";
  const scenarioInputSnapshot = submittedValues ? toInput(submittedValues) : null;
  const scenarioResultSnapshot = result
    ? {
        topRecommendation: result.topRecommendation
          ? {
              key: result.topRecommendation.key,
              label: result.topRecommendation.label,
              reason: result.topRecommendation.reason,
            }
          : null,
        topSteps: result.topThree.map((item) => ({
          key: item.key,
          label: item.label,
          reason: item.reason,
          applicability: item.applicability,
        })),
        missingDataSummary: insufficient.map((item) => ({
          key: item.key,
          label: item.label,
          missingFields: item.missingFields ?? [],
        })),
      }
    : undefined;

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
      canComplete={Object.keys(validationErrors).length === 0}
      onPrev={mobileFlow.goPrev}
      onNext={mobileFlow.goNext}
      onComplete={submitAndScroll}
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
          <div className="mb-4">
            <SaveScenarioButton
              toolSlug="volgende-euro"
              defaultTitle={scenarioTitle}
              input={scenarioInputSnapshot}
              result={scenarioResultSnapshot}
              disabled={!result || !scenarioInputSnapshot}
              disabledReason="Bereken eerst een scenario."
            />
          </div>
          <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">Volgorde van relevante stappen</h3>
          <div className="mt-4 space-y-3">
            {relevantTopSteps.map((option, index) => (
              <div key={option.key} className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
                <div className="font-medium text-[var(--ink)]">#{index + 1} {option.label}</div>
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
          <p>4) Voor de vergelijking corrigeren we verwacht rendement op risicoprofiel: offensief 100%, neutraal 80%, defensief 50%.</p>
          {result ? <p>5) Indicatief wettelijk DUO-bedrag: {formatCurrency(result.duoContext.estimatedStatutoryMonthlyPayment)} per maand.</p> : null}
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
          ["extraAmount", "Wat is je geld (extra bedrag nu)"],
          ["currentBuffer", "Wat is je buffer nu"],
          ["targetBuffer", "Wat is je gewenste buffer"],
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

      <label className={mobileFlow.getFieldClassName("openToInvesting")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Sta je open voor beleggen?</span>
        <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
          <input type="checkbox" checked={formValues.openToInvesting} onChange={(event) => updateField("openToInvesting", event.target.checked)} className="size-4 accent-[var(--accent)]" />
          Ja
        </span>
      </label>
      {formValues.openToInvesting ? (
        <>
          <label className={mobileFlow.getFieldClassName("horizonYears")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Beleggingshorizon (jaren)</span>
            <input inputMode="decimal" value={formValues.horizonYears} onChange={(event) => updateField("horizonYears", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
          <label className={mobileFlow.getFieldClassName("expectedAnnualReturn")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Verwacht rendement (%)</span>
            <input inputMode="decimal" value={formValues.expectedAnnualReturn} onChange={(event) => updateField("expectedAnnualReturn", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
        </>
      ) : null}

      <label className={mobileFlow.getFieldClassName("hasDebt")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Heb je schulden?</span>
        <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
          <input type="checkbox" checked={formValues.hasDebt} onChange={(event) => updateField("hasDebt", event.target.checked)} className="size-4 accent-[var(--accent)]" />
          Ja
        </span>
      </label>

      {formValues.hasDebt ? (
        <>
          <label className={mobileFlow.getFieldClassName("primaryDebtIsDuo")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Is dit een DUO-schuld?</span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input type="checkbox" checked={formValues.primaryDebtIsDuo} onChange={(event) => updateField("primaryDebtIsDuo", event.target.checked)} className="size-4 accent-[var(--accent)]" />
              Ja
            </span>
          </label>
          <label className={mobileFlow.getFieldClassName("primaryDebtAmount")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              {formValues.primaryDebtIsDuo ? "Bedrag DUO-schuld" : "Bedrag schuld"}
            </span>
            <input inputMode="decimal" value={formValues.primaryDebtAmount} onChange={(event) => updateField("primaryDebtAmount", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>
          <label className={mobileFlow.getFieldClassName("primaryDebtRate")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              {formValues.primaryDebtIsDuo ? "DUO-rente (%)" : "Rente schuld (%)"}
            </span>
            <input inputMode="decimal" value={formValues.primaryDebtRate} onChange={(event) => updateField("primaryDebtRate", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
          </label>

          <label className={mobileFlow.getFieldClassName("hasOtherDebt")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Heb je nog een andere schuld?</span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input type="checkbox" checked={formValues.hasOtherDebt} onChange={(event) => updateField("hasOtherDebt", event.target.checked)} className="size-4 accent-[var(--accent)]" />
              Ja
            </span>
          </label>

          {formValues.hasOtherDebt ? (
            <>
              <label className={mobileFlow.getFieldClassName("otherDebtAmount")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Bedrag andere schuld</span>
                <input inputMode="decimal" value={formValues.otherDebtAmount} onChange={(event) => updateField("otherDebtAmount", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              </label>
              <label className={mobileFlow.getFieldClassName("otherDebtRate")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Rente andere schuld (%)</span>
                <input inputMode="decimal" value={formValues.otherDebtRate} onChange={(event) => updateField("otherDebtRate", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              </label>
            </>
          ) : null}
        </>
      ) : null}

      <label className={mobileFlow.getFieldClassName("hasMortgage")}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Heb je een hypotheek?</span>
        <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
          <input type="checkbox" checked={formValues.hasMortgage} onChange={(event) => updateField("hasMortgage", event.target.checked)} className="size-4 accent-[var(--accent)]" />
          Ja
        </span>
      </label>
      {formValues.hasMortgage ? (
        <label className={mobileFlow.getFieldClassName("mortgageRate")}>
          <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Hypotheekrente (%)</span>
          <input inputMode="decimal" value={formValues.mortgageRate} onChange={(event) => updateField("mortgageRate", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
        </label>
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
