import type { ReactNode } from "react";
import { GlossaryText } from "@/components/GlossaryText";

interface ResultRowProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  strong?: boolean;
  breakdown?: ReactNode;
  breakdownLabel?: string;
  defaultBreakdownOpen?: boolean;
}

export function ResultRow({
  label,
  value,
  sub,
  accent,
  strong,
  breakdown,
  breakdownLabel = "Toon berekening",
  defaultBreakdownOpen = false,
}: ResultRowProps) {
  return (
    <div
      className={`hair-b py-3 last:border-b-0 ${
        strong ? "border-t border-t-[var(--hair-2)]" : ""
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <div
          className={`min-w-0 flex-1 text-[13.5px] ${
            strong ? "font-medium text-[var(--ink)]" : "text-[var(--muted)]"
          }`}
        >
          <GlossaryText text={label} />
        </div>
        <div className="min-w-0 max-w-full sm:max-w-[30ch] sm:text-right">
          <div
            className={`break-words font-mono text-[15px] tabular ${
              strong ? "font-semibold text-[var(--ink)]" : ""
            } ${accent ? "text-[oklch(38%_0.09_155)]" : ""}`}
          >
            {value}
          </div>
          {sub ? (
            <div className="break-words text-[12px] leading-[1.6] text-[var(--soft)]">
              <GlossaryText text={sub} />
            </div>
          ) : null}
        </div>
      </div>
      {breakdown ? (
        <details className="surface-subtle mt-2 px-3 py-2" open={defaultBreakdownOpen}>
          <summary className="min-h-9 cursor-pointer list-none text-[12px] font-medium text-[var(--soft)] marker:content-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
            {breakdownLabel}
          </summary>
          <div className="mt-2 space-y-1.5 text-[12px] leading-[1.6] text-[var(--muted)]">
            {breakdown}
          </div>
        </details>
      ) : null}
    </div>
  );
}
