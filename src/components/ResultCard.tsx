import { GlossaryText } from "@/components/GlossaryText";

type ResultCardTone = "default" | "pos" | "neg" | "warn";

type ResultCardProps = {
  label: string;
  value: string;
  note?: string;
  /** Kleurt de kaart voor conclusies of onzekerheid. */
  tone?: ResultCardTone;
  className?: string;
};

const toneStyles: Record<ResultCardTone, { card: string; value: string }> = {
  default: { card: "border-[var(--hair)] bg-white/86", value: "text-[var(--ink)]" },
  pos: {
    card: "border-[oklch(85%_0.05_155)] bg-[var(--pos-soft)]",
    value: "text-[oklch(34%_0.09_155)]",
  },
  neg: {
    card: "border-[oklch(85%_0.05_30)] bg-[var(--neg-soft)]",
    value: "text-[oklch(34%_0.12_30)]",
  },
  warn: {
    card: "border-[oklch(86%_0.06_90)] bg-[var(--warn-soft)]",
    value: "text-[oklch(34%_0.09_80)]",
  },
};

export function ResultCard({ label, value, note, tone = "default", className }: ResultCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className={`result-panel border p-5 ${styles.card} ${className ?? ""}`.trim()}>
      <p className="text-[13.5px] font-medium text-[var(--muted)]">
        <GlossaryText text={label} />
      </p>
      <p className={`mt-2 font-mono text-2xl font-semibold tracking-normal tabular sm:text-[1.7rem] ${styles.value}`}>
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
          <GlossaryText text={note} />
        </p>
      ) : null}
    </article>
  );
}
