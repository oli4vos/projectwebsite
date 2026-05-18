export type Category = "studie" | "beleg" | "hyp" | "maand";

export const CATEGORY_LABEL: Record<Category, string> = {
  studie: "Studieschuld",
  beleg: "Beleggen",
  hyp: "Hypotheek",
  maand: "Maandlasten",
};

export function resolveCategory(category: string, slug: string): Category {
  const value = `${category} ${slug}`.toLowerCase();

  if (value.includes("studie") || value.includes("duo") || value.includes("schuld")) {
    return "studie";
  }

  if (value.includes("beleg") || value.includes("rendement") || value.includes("vermogen")) {
    return "beleg";
  }

  if (value.includes("hyp") || value.includes("woning") || value.includes("huis")) {
    return "hyp";
  }

  return "maand";
}
