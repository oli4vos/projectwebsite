"use client";

import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { DisclosureSection } from "@/components/DisclosureSection";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { FieldError } from "@/components/forms/FieldError";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import {
  AreaChart,
  getAdaptiveEuroTicks,
  getAdaptiveYearTicks,
} from "@/components/charts";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton, ToolActionLinkButton } from "@/components/tool/ToolActionButton";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type { Box3Method } from "@/lib/tax";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getPriveBeleggenEindvermogenDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculatePriveBeleggenEindvermogen, type PriveBeleggenInput } from "./logic";

type FormState = {
  taxYear: string;
  hasFiscalPartner: boolean;
  box3Method: Box3Method;
  startVermogen: string;
  maandelijkseInleg: string;
  verwachtRendementPct: string;
  horizonJaren: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const defaultValues: FormState = {
  taxYear: "",
  hasFiscalPartner: false,
  box3Method: "forfaitary",
  startVermogen: "",
  maandelijkseInleg: "",
  verwachtRendementPct: "",
  horizonJaren: "",
};

const exampleValues: FormState = {
  taxYear: String(getDefaultFinancialYear()),
  hasFiscalPartner: false,
  box3Method: "forfaitary",
  startVermogen: "50000",
  maandelijkseInleg: "500",
  verwachtRendementPct: "6",
  horizonJaren: "20",
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

function formatCompactEuro(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const taxYear = parseOptionalNumber(values.taxYear);
  const startVermogen = parseOptionalNumber(values.startVermogen);
  const maandelijkseInleg = parseOptionalNumber(values.maandelijkseInleg);
  const verwachtRendementPct = parseOptionalNumber(values.verwachtRendementPct);
  const horizonJaren = parseOptionalNumber(values.horizonJaren);

  if (taxYear === undefined || !Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2200) {
    errors.taxYear = "Gebruik een geldig belastingjaar.";
  }
  if (startVermogen === undefined || !Number.isFinite(startVermogen) || startVermogen < 0) {
    errors.startVermogen = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    maandelijkseInleg === undefined ||
    !Number.isFinite(maandelijkseInleg) ||
    maandelijkseInleg < 0
  ) {
    errors.maandelijkseInleg = "Gebruik 0 of een hoger bedrag.";
  }
  if (
    verwachtRendementPct === undefined ||
    !Number.isFinite(verwachtRendementPct) ||
    verwachtRendementPct < 0 ||
    verwachtRendementPct > 100
  ) {
    errors.verwachtRendementPct = "Gebruik een verwacht rendement tussen 0 en 100.";
  }
  if (
    horizonJaren === undefined ||
    !Number.isFinite(horizonJaren) ||
    horizonJaren < 1 ||
    horizonJaren > 60
  ) {
    errors.horizonJaren = "Gebruik een horizon tussen 1 en 60 jaar.";
  }

  const parsedValues: PriveBeleggenInput | null =
    Object.keys(errors).length === 0
      ? {
          taxYear: Math.round(taxYear ?? getDefaultFinancialYear()),
          hasFiscalPartner: values.hasFiscalPartner,
          box3Method: values.box3Method,
          startVermogen: startVermogen ?? 0,
          maandelijkseInleg: maandelijkseInleg ?? 0,
          verwachtRendementPct: verwachtRendementPct ?? 0,
          horizonJaren: Math.round(horizonJaren ?? 10),
        }
      : null;

  return { errors, parsedValues };
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getPriveBeleggenEindvermogenDefaultsFromProfile(profile);
  const { hasRelevantProfileValues, profileKey, initialValues } =
    createProfilePrefillState<FormState>({
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

function CalculatorContent({
  initialValues,
  hasRelevantProfileValues,
  profilePatch,
}: CalculatorContentProps) {
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    submitContextMessage,
    setValues,
  } = useSubmittedCalculation<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const submittedValidation = submittedValues ? validateForm(submittedValues) : null;
  const result = submittedValidation?.parsedValues
    ? calculatePriveBeleggenEindvermogen(submittedValidation.parsedValues)
    : null;

  const mobileFlow = useMobileFieldFlow([
    "taxYear",
    "startVermogen",
    "maandelijkseInleg",
    "verwachtRendementPct",
    "horizonJaren",
    "hasFiscalPartner",
    "box3Method",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      taxYear: errors.taxYear,
      startVermogen: errors.startVermogen,
      maandelijkseInleg: errors.maandelijkseInleg,
      verwachtRendementPct: errors.verwachtRendementPct,
      horizonJaren: errors.horizonJaren,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setValues(
      mergeProfilePatchIntoValues(formValues, profilePatch),
      "Profielwaarden geladen. Klik op Bereken om de uitkomst te zien.",
    );
  }

  function applyExampleValues() {
    setValues(exampleValues, "Voorbeeldwaarden geladen. Klik op Bereken om de uitkomst te zien.");
  }

  function handleCalculate() {
    submit();
  }

  const chartSeries = result
    ? [
        {
          color: "oklch(46% 0.07 232)",
          points: result.timeline.map((point) => point.eindVermogenNaBox3),
        },
        {
          color: "oklch(54% 0.1 152)",
          points: result.timeline.map((point) => point.eindVermogenZonderBox3),
        },
      ]
    : null;

  const yMax =
    result && result.timeline.length > 0
      ? Math.max(
          ...result.timeline.map((point) =>
            Math.max(point.eindVermogenNaBox3, point.eindVermogenZonderBox3),
          ),
        )
      : 0;

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Privé beleggen
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            Wat wordt mijn eindvermogen met beleggen?
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze tool rekent je verwachte eindvermogen door bij maandelijks beleggen.
            Box 3 wordt automatisch per jaar meegerekend zodra je boven de vrijstelling uitkomt.
          </p>
        </>
      }
      startActions={
        <>
          {hasRelevantProfileValues ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              <span>Profielwaarden gevonden in deze browser.</span>
              <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
                Start met voorbeeldwaarden
              </ToolActionButton>
              <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">
                Start met profielwaarden
              </ToolActionButton>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              <span>Start leeg en vul snel een voorbeeldscenario in.</span>
              <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
                Start met voorbeeldwaarden
              </ToolActionButton>
              <ToolActionLinkButton href="/profiel" variant="secondary" size="sm">
                Start met profielwaarden
              </ToolActionLinkButton>
            </div>
          )}
          {submitContextMessage ? (
            <p className="text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
          ) : null}
          {hasDirtyChanges ? (
            <p className="text-[12.5px] text-[var(--muted)]">
              Klik opnieuw op Bereken om de uitkomst te vernieuwen.
            </p>
          ) : null}
        </>
      }
      inputs={
        <div className="grid gap-5">
          <label className={mobileFlow.getFieldClassName("taxYear")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Belastingjaar</span>
            <input
              inputMode="numeric"
              value={formValues.taxYear}
              onChange={(event) => updateField("taxYear", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("taxYear", Boolean(errors.taxYear))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <p className="text-[12px] text-[var(--muted)]">Voor box 3-vrijstelling en tarieven.</p>
            <FieldError message={errors.taxYear} />
          </label>

          {[
            ["startVermogen", "Startvermogen nu"],
            ["maandelijkseInleg", "Maandelijkse inleg"],
            ["verwachtRendementPct", "Verwacht rendement per jaar (%)"],
            ["horizonJaren", "Horizon (jaren)"],
          ].map(([field, label]) => (
            <label key={field} className={mobileFlow.getFieldClassName(field)}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">{label}</span>
              <input
                inputMode="decimal"
                value={formValues[field as keyof FormState] as string}
                onChange={(event) =>
                  updateField(field as keyof FormState, event.target.value as never)
                }
                onKeyDown={mobileFlow.handleEnterAdvance(field, Boolean(errors[field as keyof FormState]))}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors[field as keyof FormState]} />
            </label>
          ))}

          <label className={mobileFlow.getFieldClassName("hasFiscalPartner")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Fiscale partner</span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.hasFiscalPartner}
                onChange={(event) => updateField("hasFiscalPartner", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("box3Method")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Box 3-methode
            </span>
            <select
              value={formValues.box3Method}
              onChange={(event) =>
                updateField("box3Method", event.target.value as FormState["box3Method"])
              }
              className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="forfaitary">Forfaitair</option>
              <option value="actual">Werkelijk rendement</option>
            </select>
          </label>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            canComplete={Boolean(parsedValues)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={handleCalculate}
          />
        </div>
      }
      submitAction={
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hair)] pt-2">
          <ToolActionButton type="button" onClick={handleCalculate} variant="accent" size="md">
            {submittedValues && hasDirtyChanges ? "Bereken opnieuw" : "Bereken"}
          </ToolActionButton>
          <p className="text-[12px] text-[var(--muted)]">De tool rekent alleen met ingevulde gegevens.</p>
        </div>
      }
      result={
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Samenvatting</div>
            {result ? <Pill tone="accent">Box 3 meegenomen</Pill> : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[34px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.eindVermogenMetBox3)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Verwacht eindvermogen na {result.horizonJaren} jaar inclusief jaarlijkse box 3-heffing.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Vul je gegevens in en klik op Bereken. Je ziet dan je eindvermogen met en zonder box 3.
            </p>
          )}
        </div>
      }
      details={
        <>
          <section className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[22px] tracking-[-0.01em] text-[var(--ink)]">Resultaten</h3>
            {result ? (
              <div className="mt-4 space-y-2">
                <ResultRow label="Eindvermogen met box 3" value={formatCurrency(result.eindVermogenMetBox3)} />
                <ResultRow label="Eindvermogen zonder box 3" value={formatCurrency(result.eindVermogenZonderBox3)} />
                <ResultRow label="Verschil door box 3" value={formatCurrency(result.verschilDoorBox3)} />
                <ResultRow label="Totale box 3 over horizon" value={formatCurrency(result.totaleBox3Belasting)} />
                <ResultRow label="Jaarlijkse inleg" value={formatCurrency(result.jaarlijkseInleg)} />
              </div>
            ) : (
              <p className="mt-3 text-[14px] text-[var(--muted)]">
                Na Bereken tonen we hier je eindvermogen en het box 3-effect.
              </p>
            )}
          </section>

          {result && chartSeries ? (
            <section className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Vermogenspad</div>
              <h3 className="mt-2 font-serif text-[26px] tracking-[-0.02em] text-[var(--ink)]">
                Met en zonder box 3
              </h3>
              <div className="mt-5">
                <div className="flex justify-end">
                  <ChartLegend
                    items={[
                      { color: "oklch(46% 0.07 232)", label: "Met box 3" },
                      { color: "oklch(54% 0.10 152)", label: "Zonder box 3" },
                    ]}
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[68px_minmax(0,1fr)]">
                  <div className="hidden flex-col justify-between text-right text-[11px] text-[var(--soft)] sm:flex">
                    {getAdaptiveEuroTicks(yMax)
                      .slice()
                      .reverse()
                      .map((tick) => (
                        <span key={tick}>{formatCompactEuro(tick)}</span>
                      ))}
                  </div>
                  <div className="min-w-0">
                    <ChartContainer
                      yearTicks={getAdaptiveYearTicks(result.horizonJaren)}
                      xValues={result.timeline.map((point) => point.jaar)}
                      chart={
                        <AreaChart
                          width={620}
                          height={320}
                          series={chartSeries}
                          xValues={result.timeline.map((point) => point.jaar)}
                          yTicks={getAdaptiveEuroTicks(yMax)}
                          seriesLabels={["Met box 3", "Zonder box 3"]}
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <DisclosureSection title="Hoe rekenen we dit?">
            <p className="text-[14px] leading-[1.75] text-[var(--ink-2)]">
              We rekenen maandelijkse inleg en rendement door over je horizon. Aan het einde van elk jaar
              berekenen we box 3 op je vermogen en trekken die heffing af. Zo zie je direct het verschil
              tussen vermogen met en zonder box 3.
            </p>
          </DisclosureSection>
          <DisclosureSection title="Welke aannames gebruiken we?">
            <ul className="list-disc space-y-2 pl-5 text-[14px] leading-[1.75] text-[var(--ink-2)]">
              <li>Je rendement is een vaste aanname per jaar.</li>
              <li>Je maandelijkse inleg blijft gelijk.</li>
              <li>Box 3 wordt jaarlijks toegepast op basis van het gekozen belastingjaar en partnerstatus.</li>
            </ul>
          </DisclosureSection>
          <DisclosureSection title="Waar moet je op letten?">
            <ul className="list-disc space-y-2 pl-5 text-[14px] leading-[1.75] text-[var(--ink-2)]">
              <li>Werkelijke rendementen schommelen en kunnen lager of hoger uitvallen.</li>
              <li>Belastingregels kunnen wijzigen.</li>
              <li>Gebruik dit als indicatief scenario, niet als gegarandeerde uitkomst.</li>
            </ul>
          </DisclosureSection>
        </>
      }
      disclaimer={
        <ToolDisclosure title="Aannames en bronnen">
          {result ? (
            <ul className="space-y-2 text-[13.5px] leading-[1.7] text-[var(--muted)]">
              {result.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] leading-[1.7] text-[var(--muted)]">
              Deze tool gebruikt de centrale box 3-logica van dit project en is indicatief.
            </p>
          )}
        </ToolDisclosure>
      }
    />
  );
}
