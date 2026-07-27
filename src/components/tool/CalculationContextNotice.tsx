type ResultContextKind = "duo" | "mortgage" | "allowances" | "comparison";

const resultContextCopy: Record<ResultContextKind, string> = {
  duo: "Controleer je persoonlijke bedragen en regeling in Mijn DUO.",
  mortgage: "Dit is geen hypotheekaanbod; een geldverstrekker maakt de definitieve beoordeling.",
  allowances: "Dit is geen officiële beschikking van Dienst Toeslagen.",
  comparison: "Dit is een vergelijking op basis van je invoer, geen persoonlijk betalingsadvies.",
};

export function ExampleValuesNotice() {
  return (
    <div
      role="status"
      className="mt-3 rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] px-4 py-3"
    >
      <p className="text-[12px] font-semibold text-[var(--ink)]">
        Voorbeeldgegevens ingevuld
      </p>
      <p className="mt-1 text-[12px] leading-[1.55] text-[var(--muted)]">
        Vervang deze bedragen door je eigen gegevens voor een persoonlijke indicatie.
      </p>
    </div>
  );
}

export function ResultContextNotice({
  kind,
  isExample,
}: {
  kind: ResultContextKind;
  isExample: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {isExample ? "Voorbeeldberekening" : "Jouw indicatie"}
      </p>
      <p className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-2)]">
        Gebaseerd op {isExample ? "de ingevulde voorbeeldgegevens" : "jouw ingevulde gegevens"}.{" "}
        {resultContextCopy[kind]}
      </p>
    </div>
  );
}
