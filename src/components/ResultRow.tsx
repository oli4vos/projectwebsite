interface ResultRowProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function ResultRow({ label, value, sub, accent }: ResultRowProps) {
  return (
    <div className="hair-b flex items-baseline justify-between py-3 last:border-b-0">
      <div className="text-[13px] text-[var(--muted)]">{label}</div>
      <div className="text-right">
        <div
          className={`font-mono text-[15px] tabular ${
            accent ? "text-[oklch(40%_0.10_152)]" : ""
          }`}
        >
          {value}
        </div>
        {sub ? <div className="text-[11px] text-[var(--soft)] tabular">{sub}</div> : null}
      </div>
    </div>
  );
}
