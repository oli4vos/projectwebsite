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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, digits = 2) {
  return `${new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`;
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

        <section
          aria-label="Korte samenvatting maximale hypotheek"
          className="grid overflow-hidden rounded-xl border border-[var(--hair)] bg-white sm:grid-cols-2"
        >
          <div className="min-w-0 border-b border-[var(--hair)] p-4 sm:border-r">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Inkomen en rente
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold tabular text-[var(--ink)]">
              {formatCurrency(result.debug.toetsinkomen)}
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[var(--soft)]">
              Toetsrente {formatPercent(result.breakdown.testRateUsed)} bij een looptijd van{" "}
              {Math.round(result.breakdown.mortgageTermMonths / 12)} jaar.
            </p>
          </div>
          <div className="min-w-0 border-b border-[var(--hair)] p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Ruimte na verplichtingen
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold tabular text-[var(--ink)]">
              {formatCurrency(result.breakdown.monthlyHousingBudgetAfterLiabilities)} per maand
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[var(--soft)]">
              Studieschuld verlaagt de inkomensruimte met{" "}
              {formatCurrency(result.breakdown.studentLoanBorrowingCapacityImpact)}.
            </p>
          </div>
          <div className="min-w-0 border-b border-[var(--hair)] p-4 sm:border-b-0 sm:border-r">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Grens op inkomen
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold tabular text-[var(--ink)]">
              {formatCurrency(result.maxMortgageByIncome)}
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[var(--soft)]">
              Daarna worden woningwaarde en, wanneer gekozen, NHG als bovengrens toegepast.
            </p>
          </div>
          <div className="min-w-0 p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Uiteindelijke maximum
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold tabular text-[var(--ink)]">
              {formatCurrency(result.finalMaxMortgage)}
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[var(--soft)]">
              De laagste van alle grenzen bepaalt dit bedrag.
            </p>
          </div>
        </section>

        {result.breakdown.higherMortgageOpportunity ? (
          <div className="rounded-xl bg-[var(--deep)] px-4 py-4 text-[var(--button-text-on-dark)]">
            <div className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--button-text-on-dark)]/65">
              Mogelijke extra leenruimte binnen de tabel
            </div>
            <p className="mt-1 text-[14px] font-medium leading-6">
              Bij een toetsrente van{" "}
              {formatPercent(
                result.breakdown.higherMortgageOpportunity.alternativeTestRate,
                3,
              )} is indicatief{" "}
              {formatCurrency(
                result.breakdown.higherMortgageOpportunity.increaseInMaxMortgage,
              )} meer hypotheek mogelijk.
            </p>
            <p className="mt-1 text-[12px] leading-5 text-[color:var(--button-text-on-dark)]/75">
              De alternatieve einduitkomst is{" "}
              {formatCurrency(
                result.breakdown.higherMortgageOpportunity.alternativeFinalMaxMortgage,
              )}. Dit komt door een andere officiële financieringslastband en is geen renteadvies.
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[12.5px] leading-5 text-[var(--muted)]">
            Binnen de officiële financieringslasttabel is geen andere toetsrente gevonden die in dit scenario een hoger eindbedrag oplevert.
          </p>
        )}

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
