"use client";

import { useMemo } from "react";
import { useSavedCalculations } from "@/hooks/useSavedCalculations";
import { ENABLE_SAVED_CALCULATIONS } from "@/lib/feature-flags";
import { appRegistryBySlug } from "@/lib/app-registry";
import { ToolActionButton } from "@/components/tool/ToolActionButton";

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Onbekende datum";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function SavedCalculationsList() {
  const { calculations, deleteCalculation, lastError } = useSavedCalculations();

  const latestCalculations = useMemo(
    () => calculations.slice(0, 10),
    [calculations],
  );

  if (!ENABLE_SAVED_CALCULATIONS) {
    return null;
  }

  return (
    <section className="mt-6 grid gap-3 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        Mijn opgeslagen scenario&apos;s
      </div>
      <p className="text-[13.5px] leading-[1.65] text-[var(--muted)]">
        Scenario&apos;s worden lokaal in deze browser bewaard.
      </p>

      {latestCalculations.length === 0 ? (
        <p className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] text-[var(--muted)]">
          Je hebt nog geen scenario&apos;s opgeslagen.
        </p>
      ) : (
        <ul className="grid gap-3">
          {latestCalculations.map((item) => {
            const appTitle =
              appRegistryBySlug[item.toolSlug]?.title ?? item.toolSlug;
            return (
              <li
                key={item.id}
                className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--ink)]">{item.title}</p>
                    <p className="text-[12.5px] text-[var(--muted)]">
                      Tool: {appTitle}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">
                      Opgeslagen: {formatDateTime(item.createdAt)}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">
                      Bijgewerkt: {formatDateTime(item.updatedAt)}
                    </p>
                  </div>
                  <ToolActionButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      deleteCalculation(item.id);
                    }}
                  >
                    Verwijder
                  </ToolActionButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lastError ? (
        <p className="text-[12.5px] text-[var(--muted)]">
          Laatste opslagmelding: {lastError}
        </p>
      ) : null}
    </section>
  );
}

