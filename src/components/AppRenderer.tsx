"use client";

import { appComponents } from "@/lib/app-components";

type AppRendererProps = {
  slug: string;
};

export function AppRenderer({ slug }: AppRendererProps) {
  const Calculator = appComponents[slug];

  if (!Calculator) {
    return (
      <div className="sheet border-[var(--neg-soft)] bg-[var(--neg-soft)]/40 p-6 text-sm text-[oklch(35%_0.13_28)]">
        Deze rekentool kon niet geladen worden. Controleer het manifest en de entry.
      </div>
    );
  }

  return <Calculator />;
}
