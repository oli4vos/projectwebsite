// Categorieën gebruikt in de hele app. Voeg er een toe? Update ook:
//   - tokens.css → `.dot-<id>` rule met een oklch-kleur
//   - CATEGORY_LABEL hieronder

export type Category = "studie" | "beleg" | "hyp" | "maand";

export const CATEGORY_LABEL: Record<Category, string> = {
  studie: "Studieschuld",
  beleg:  "Beleggen",
  hyp:    "Hypotheek",
  maand:  "Maandlasten",
};
