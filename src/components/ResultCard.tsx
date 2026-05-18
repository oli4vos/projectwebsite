type ResultCardProps = {
  label: string;
  value: string;
  note?: string;
};

export function ResultCard({ label, value, note }: ResultCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-line/80 bg-white/90 p-5 shadow-[var(--shadow)] shadow-black/5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {value}
      </p>
      {note ? <p className="mt-2 text-sm leading-6 text-muted">{note}</p> : null}
    </article>
  );
}
