"use client";

import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getKnowledgeLevelLabel, type KnowledgeLevel } from "@/lib/user-preferences";

const options: Array<{ value: KnowledgeLevel; description: string }> = [
  {
    value: "basic",
    description: "Korte uitleg, zo min mogelijk vaktaal.",
  },
  {
    value: "standard",
    description: "Standaarduitleg met de belangrijkste aannames.",
  },
  {
    value: "advanced",
    description: "Meer context en aandachtspunten in de verdieping.",
  },
];

export function KnowledgeLevelSelector() {
  const { knowledgeLevel, setKnowledgeLevel } = useUserPreferences();

  return (
    <section className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        Uitlegniveau
      </div>
      <h3 className="mt-2 font-serif text-[clamp(1.3rem,1.1rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
        Hoeveel uitleg wil je zien?
      </h3>
      <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
        Deze voorkeur wordt alleen lokaal in je browser opgeslagen. Je kunt dit altijd aanpassen.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const selected = knowledgeLevel === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setKnowledgeLevel(option.value)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-transparent bg-[var(--accent-soft)]"
                  : "border-[var(--hair)] bg-[var(--paper-soft)] hover:bg-white"
              }`}
            >
              <div className="text-[14px] font-medium text-[var(--ink)]">
                {getKnowledgeLevelLabel(option.value)}
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
