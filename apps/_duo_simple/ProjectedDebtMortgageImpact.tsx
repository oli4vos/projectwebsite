"use client";

import { useMemo, useState } from "react";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { calculateProjectedDebtMortgageImpact } from "./projected-debt-mortgage-impact";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthlyCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProjectedDebtMortgageImpact({
  debtAtStudyEnd,
}: {
  debtAtStudyEnd: number;
}) {
  const [showImpact, setShowImpact] = useState(false);
  const impact = useMemo(
    () => calculateProjectedDebtMortgageImpact(debtAtStudyEnd),
    [debtAtStudyEnd],
  );

  return (
    <section className="border-y border-[var(--hair)] py-4" aria-label="Hypotheekimpact eindschuld">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[14px] font-semibold text-[var(--ink)]">
            Direct na je studie een huis kopen?
          </h4>
          <p className="mt-1 text-[12.5px] leading-5 text-[var(--muted)]">
            Zie indicatief hoeveel hypotheekruimte deze berekende schuld kan kosten.
          </p>
        </div>
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={() => setShowImpact((current) => !current)}
        >
          {showImpact ? "Verberg hypotheekimpact" : "Bereken impact op hypotheekruimte"}
        </ToolActionButton>
      </div>

      {showImpact ? (
        <div className="mt-5" aria-live="polite">
          <div className="grid border-y border-[var(--hair)] sm:grid-cols-3">
            <div className="py-3 sm:pr-4">
              <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
                Eindschuld
              </div>
              <div className="mt-1 font-mono text-[18px] font-semibold tabular text-[var(--ink)]">
                {formatCurrency(impact.debtAtStudyEnd)}
              </div>
            </div>
            <div className="border-t border-[var(--hair)] py-3 sm:border-l sm:border-t-0 sm:px-4">
              <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
                Wettelijk DUO-bedrag
              </div>
              <div className="mt-1 font-mono text-[18px] font-semibold tabular text-[var(--ink)]">
                {formatMonthlyCurrency(impact.statutoryMonthlyPayment)} p/m
              </div>
            </div>
            <div className="border-t border-[var(--hair)] py-3 sm:border-l sm:border-t-0 sm:pl-4">
              <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
                Minder hypotheekruimte
              </div>
              <div className="mt-1 font-mono text-[18px] font-semibold tabular text-[var(--neg)]">
                ongeveer {formatCurrency(impact.indicativeMortgageSpaceReduction)}
              </div>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-6 text-[var(--ink-2)]">
            We rekenen de eindschuld annuïtair terug in {impact.duoRepaymentTermYears} jaar met de
            meest recente beschikbare DUO-rente: {formatPercent(impact.duoAnnualInterestRate)}% voor
            {` ${impact.duoRateYear}`}. Voor de omrekening naar hypotheekruimte gebruiken we indicatief
            {` ${formatPercent(impact.mortgageAnnualInterestRate)}%`} hypotheekrente en
            {` ${impact.mortgageTermYears}`} jaar looptijd.
          </p>
          <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
            Dit is alleen het effect van de berekende maandverplichting. Inkomen, draagkracht, andere
            schulden, woningwaarde en het acceptatiebeleid van een bank kunnen de werkelijke uitkomst
            veranderen.
          </p>
        </div>
      ) : null}
    </section>
  );
}
