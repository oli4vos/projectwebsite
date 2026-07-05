export type Category = "studie" | "planning" | "hyp" | "maand";

export const CATEGORY_LABEL: Record<Category, string> = {
  studie: "Studieschuld",
  planning: "Planning",
  hyp: "Hypotheek",
  maand: "Maandlasten",
};

export function resolveCategory(category: string, slug: string): Category {
  const value = `${category} ${slug}`.toLowerCase();

  if (value.includes("studie") || value.includes("duo") || value.includes("schuld")) {
    return "studie";
  }

  if (value.includes("hyp") || value.includes("woning") || value.includes("huis")) {
    return "hyp";
  }

  return "maand";
}
