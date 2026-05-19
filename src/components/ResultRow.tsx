interface ResultRowProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function ResultRow({ label, value, sub, accent }: ResultRowProps) {
  return (
    <div className="hair-b py-3 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1 text-[13px] text-[var(--muted)]">{label}</div>
        <div className="min-w-0 max-w-full sm:max-w-[30ch] sm:text-right">
          <div
            className={`break-words font-mono text-[15px] tabular ${
              accent ? "text-[oklch(40%_0.10_152)]" : ""
            }`}
          >
            {value}
          </div>
          {sub ? (
            <div className="break-words text-[11px] text-[var(--soft)] tabular">
              {sub}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
