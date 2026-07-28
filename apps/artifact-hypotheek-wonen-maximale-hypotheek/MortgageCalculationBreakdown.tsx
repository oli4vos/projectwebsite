import { DisclosureSection } from "@/components/DisclosureSection";
import { GlossaryText } from "@/components/GlossaryText";
import {
  buildMortgageCalculationTimeline,
  type MortgageCalculationTimelineStep,
} from "@/lib/mortgage/report";
import type {
  MortgageMaxMortgageInput,
  MortgageMaxMortgageResult,
} from "@/lib/mortgage/types";

type MortgageCalculationBreakdownProps = {
  input: MortgageMaxMortgageInput;
  result: MortgageMaxMortgageResult;
};

function calculationSteps(
  input: MortgageMaxMortgageInput,
  result: MortgageMaxMortgageResult,
): MortgageCalculationTimelineStep[] {
  return buildMortgageCalculationTimeline(input, result).filter(
    ({ step }) => step >= 2 && step <= 10,
  );
}

export function MortgageCalculationBreakdown({
  input,
  result,
}: MortgageCalculationBreakdownProps) {
  const steps = calculationSteps(input, result);

  return (
    <div data-testid="mortgage-calculation-breakdown">
      <DisclosureSection
        title="Zo is dit bedrag opgebouwd"
        subtitle="Van inkomen en maandruimte via studieschuld naar de laagste geldende hypotheekgrens."
      >
        <p className="text-[13px] leading-6 text-[var(--muted)]">
          We bepalen eerst hoeveel bruto maandlast bij je inkomen past. Daarna
          gaan je studieschuld en andere vaste verplichtingen daarvan af. Het
          bedrag dat overblijft wordt omgerekend naar hypotheekruimte en
          vergeleken met de grenzen voor de woningwaarde en NHG.
        </p>

        <ol className="space-y-3" aria-label="Opbouw maximale hypotheek">
          {steps.map((step, index) => (
            <li
              key={step.step}
              className="rounded-xl border border-[var(--hair)] bg-white px-3 py-4 sm:px-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--deep)] font-mono text-[12px] font-semibold text-[var(--button-text-on-dark)]"
                >
                  {index + 1}
                </span>
                <h4 className="min-w-0 flex-1 text-[14px] font-semibold leading-6 text-[var(--ink)]">
                  <GlossaryText text={step.title} />
                </h4>
              </div>
              <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)] sm:pl-10">
                <GlossaryText text={step.explanation} />
              </p>

              <dl className="mt-3 divide-y divide-[var(--hair)] border-t border-[var(--hair)]">
                {step.lines.map((line) => (
                  <div
                    key={`${step.step}-${line.label}`}
                    className="grid min-w-0 gap-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] sm:items-baseline sm:gap-4"
                  >
                    <dt className="min-w-0 text-[12.5px] leading-5 text-[var(--muted)]">
                      <GlossaryText text={line.label} />
                    </dt>
                    <dd className="min-w-0 break-words font-mono text-[13px] tabular text-[var(--ink)] sm:text-right">
                      {line.value}
                    </dd>
                    {line.note ? (
                      <dd className="text-[12px] leading-5 text-[var(--soft)] sm:col-span-2">
                        <GlossaryText text={line.note} />
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>

              <div className="mt-1 grid min-w-0 gap-1 rounded-lg bg-[var(--paper-soft)] px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] sm:items-baseline sm:gap-4">
                <div className="min-w-0 text-[12.5px] font-medium leading-5 text-[var(--ink)]">
                  <GlossaryText text={step.outcome.label} />
                </div>
                <div className="min-w-0 break-words font-mono text-[13px] font-semibold tabular text-[var(--ink)] sm:text-right">
                  {step.outcome.value}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-xl bg-[var(--deep)] px-4 py-4 text-[var(--button-text-on-dark)]">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--button-text-on-dark)]/65">
            Eindbedrag na alle grenzen
          </div>
          <div className="mt-1 break-words font-mono text-[clamp(1.35rem,1.15rem+1vw,1.75rem)] font-semibold tabular">
            {new Intl.NumberFormat("nl-NL", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(result.finalMaxMortgage)}
          </div>
          <p className="mt-2 text-[12.5px] leading-5 text-[color:var(--button-text-on-dark)]/75">
            Dit is de laagste uitkomst van de inkomensgrens, de
            woningwaardegrens en, wanneer van toepassing, de NHG-grens.
          </p>
        </div>
      </DisclosureSection>
    </div>
  );
}
