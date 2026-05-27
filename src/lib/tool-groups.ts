import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type ToolGroup = {
  title: string;
  description: string;
  slugs: string[];
};

export const toolGroups: ToolGroup[] = [
  {
    title: "Persoonlijke financiën",
    description: "Voor je eerste prioriteit als je extra geld overhoudt.",
    slugs: ["volgende-euro"],
  },
  {
    title: "Studieschuld",
    description: "Vergelijk verplicht aflossen, extra aflossen en alternatieven.",
    slugs: ["studieschuld-vs-beleggen", "hypotheek-impact-studieschuld"],
  },
  {
    title: "Wonen",
    description: "Inzicht in hypotheekkeuzes, maandlasten en extra aflossen.",
    slugs: [
      "hypotheek-impact-studieschuld",
      "hypotheek-aflossen-vs-beleggen",
      "annuitair-lineair",
      "hypotheekrenteaftrek-afschaffen",
    ],
  },
  {
    title: "Sparen & beleggen",
    description: "Voor vermogensopbouw met belastingimpact en flexibiliteit.",
    slugs: [
      "prive-beleggen-eindvermogen",
      "box-3-impact",
      "jaarruimte-vs-vrij-beleggen",
      "fire-na-belasting",
    ],
  },
  {
    title: "Belasting",
    description: "Rekentools rond box 3 en fiscale afwegingen.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen", "hypotheekrenteaftrek-afschaffen"],
  },
  {
    title: "FIRE / financiële vrijheid",
    description: "Langetermijnprojectie richting minder of niet meer hoeven werken.",
    slugs: ["fire-na-belasting"],
  },
  {
    title: "Werk & ZZP",
    description: "Inschatten welk uurtarief nodig is inclusief reserveringen.",
    slugs: ["zzp-uurtarief"],
  },
];

const categoryToGroupTitle: Record<string, string> = {
  Schulden: "Studieschuld",
  Hypotheek: "Wonen",
  Beleggen: "Sparen & beleggen",
  Belasting: "Belasting",
  Werk: "Werk & ZZP",
  "Persoonlijke financiën": "Persoonlijke financiën",
};

const preferredSlugsByCategory: Record<string, string[]> = {
  Schulden: ["studieschuld-vs-beleggen", "hypotheek-impact-studieschuld"],
  Hypotheek: [
    "hypotheek-aflossen-vs-beleggen",
    "annuitair-lineair",
    "hypotheekrenteaftrek-afschaffen",
  ],
  Beleggen: ["prive-beleggen-eindvermogen", "box-3-impact", "fire-na-belasting"],
  Belasting: ["box-3-impact", "jaarruimte-vs-vrij-beleggen"],
  Werk: ["zzp-uurtarief"],
  "Persoonlijke financiën": ["volgende-euro"],
};

export function getGroupAnchorForCategory(category: string) {
  const groupTitle = categoryToGroupTitle[category] ?? "Persoonlijke financiën";
  return toAnchorId(groupTitle, "groep");
}

export function getCategoryFallbackToolHref(category: string, apps: AppManifest[]) {
  const preferred = preferredSlugsByCategory[category] ?? ["volgende-euro"];
  const match = preferred.find((slug) => apps.some((app) => app.slug === slug));
  return `/apps/${match ?? "volgende-euro"}`;
}
