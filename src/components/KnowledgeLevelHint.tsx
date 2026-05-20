"use client";

import { useUserPreferences } from "@/hooks/useUserPreferences";
import { ENABLE_KNOWLEDGE_LEVEL } from "@/lib/feature-flags";

export function KnowledgeLevelHint() {
  const { knowledgeLevel } = useUserPreferences();

  if (!ENABLE_KNOWLEDGE_LEVEL) {
    return null;
  }

  if (knowledgeLevel === "basic") {
    return (
      <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
        Je bekijkt de basisuitleg. Vul eerst de velden in; details kun je later openklappen.
      </p>
    );
  }

  if (knowledgeLevel === "advanced") {
    return (
      <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
        Je bekijkt de verdiepte uitleg. Open de verdiepingsblokken voor aannames en aandachtspunten.
      </p>
    );
  }

  return (
    <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
      Je bekijkt de standaarduitleg. Vul eerst in, daarna kun je de belangrijkste verdieping openen.
    </p>
  );
}
