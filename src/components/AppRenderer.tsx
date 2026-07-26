"use client";

import { appComponents } from "@/lib/app-components";

type AppRendererProps = {
  slug: string;
};

export function AppRenderer({ slug }: AppRendererProps) {
  const Calculator = appComponents[slug];

  if (!Calculator) {
    return (
      <div className="rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/60 p-6 text-sm text-[oklch(35%_0.13_28)]">
        Dit hulpmiddel kon niet laden. Probeer het opnieuw.
      </div>
    );
  }

  return <Calculator />;
}
