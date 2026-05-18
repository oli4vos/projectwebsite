type ReceiptRow = {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
};

type ResultReceiptProps = {
  eyebrow?: string;
  title: string;
  summary?: string;
  rows: ReceiptRow[];
};

export function ResultReceipt({
  eyebrow,
  title,
  summary,
  rows,
}: ResultReceiptProps) {
  return (
    <section className="sheet p-6">
      {eyebrow ? <div className="kicker">{eyebrow}</div> : null}
      <h2 className="mt-2 font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
        {title}
      </h2>
      {summary ? <p className="mt-3 microcopy max-w-[60ch]">{summary}</p> : null}
      <div className="mt-5 border-t border-[var(--hair)]">
        {rows.map((row) => (
          <div
            key={`${row.label}-${row.value}`}
            className="grid gap-2 border-b border-[var(--hair)] py-3.5 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div>
              <div className="text-[13px] text-[var(--muted)]">{row.label}</div>
              {row.note ? (
                <div className="mt-1 text-[11.5px] leading-[1.55] text-[var(--soft)]">
                  {row.note}
                </div>
              ) : null}
            </div>
            <div
              className={`font-mono text-[15px] tabular ${
                row.accent ? "text-[oklch(40%_0.10_152)]" : "text-[var(--ink)]"
              }`}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
