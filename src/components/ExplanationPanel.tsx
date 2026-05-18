type ExplanationItem = {
  title: string;
  text: string;
};

type ExplanationPanelProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  items: ExplanationItem[];
};

export function ExplanationPanel({
  eyebrow,
  title,
  intro,
  items,
}: ExplanationPanelProps) {
  return (
    <section className="sheet p-6">
      {eyebrow ? <div className="kicker">{eyebrow}</div> : null}
      <h2 className="mt-2 font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
        {title}
      </h2>
      {intro ? <p className="mt-3 microcopy max-w-[62ch]">{intro}</p> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="sheet-muted p-4">
            <h3 className="text-[13px] font-medium tracking-[-0.005em] text-[var(--ink)]">
              {item.title}
            </h3>
            <p className="mt-2 text-[12.5px] leading-[1.65] text-[var(--muted)]">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
