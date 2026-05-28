"use client";

import { useMemo } from "react";
import { useSavedCalculations } from "@/hooks/useSavedCalculations";
import { ENABLE_SAVED_CALCULATIONS } from "@/lib/feature-flags";
import { appRegistryBySlug } from "@/lib/app-registry";
import { buildSavedCalculationHref } from "@/lib/storage/saved-calculations/saved-calculation-links";
import { summarizeSavedCalculation } from "@/lib/storage/saved-calculations/saved-calculation-summary";
import { ToolActionLinkButton } from "@/components/tool/ToolActionButton";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Onbekende datum";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
  }).format(parsed);
}

export function SavedScenarioComparison() {
  const { calculations } = useSavedCalculations();
  const latestPair = useMemo(() => calculations.slice(0, 2), [calculations]);

  if (!ENABLE_SAVED_CALCULATIONS || latestPair.length < 2) {
    return null;
  }

  return (
    <section className="mt-6 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        Scenario&apos;s vergelijken
      </div>
      <p className="mt-2 max-w-[62ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
        Snelle vergelijking van je twee meest recente lokale scenario&apos;s. Je
        kunt elk scenario direct opnieuw openen in de oorspronkelijke tool.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {latestPair.map((calculation) => {
          const summary = summarizeSavedCalculation(calculation);
          const toolTitle =
            appRegistryBySlug[calculation.toolSlug]?.title ?? calculation.toolSlug;

          return (
            <article
              key={calculation.id}
              className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
            >
              <div className="text-[12px] text-[var(--soft)]">{toolTitle}</div>
              <h3 className="mt-1 text-[15px] font-medium text-[var(--ink)]">
                {calculation.title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.55] text-[var(--muted)]">
                {summary.primary}
              </p>
              <ul className="mt-3 grid gap-1 text-[12.5px] text-[var(--muted)]">
                {summary.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <p className="mt-3 text-[12px] text-[var(--soft)]">
                Opgeslagen: {formatDate(calculation.createdAt)}
              </p>
              <div className="mt-3">
                <ToolActionLinkButton
                  href={buildSavedCalculationHref(
                    calculation.toolSlug,
                    calculation.id,
                  )}
                  variant="secondary"
                  size="sm"
                >
                  Heropen scenario
                </ToolActionLinkButton>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
