import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type ToolGroup = {
  title: string;
  description: string;
  slugs: string[];
};

export const toolGroups: ToolGroup[] = [
  {
    title: "Extra geld",
    description: "Wat doe je als er geld overblijft: aflossen, buffer houden of iets anders?",
    slugs: ["volgende-euro", "schulden-volgorde", "kind-wordt-18-impact"],
  },
  {
    title: "Studieschuld",
    description: "Begin hier: je maandlast, extra aflossen en wat DUO voor je keuzes betekent.",
    slugs: [
      "studieschuld-vs-beleggen",
      "schulden-volgorde",
      "hypotheek-impact-studieschuld",
    ],
  },
  {
    title: "Wonen",
    description: "Verdieping voor kopen: hypotheekruimte, eigen geld en hulp van familie.",
    slugs: [
      "hypotheek-impact-studieschuld",
      "hypotheek-aflossen-vs-beleggen",
      "annuitair-lineair",
      "koop-vs-huur",
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
  "Persoonlijke financiën": "Extra geld",
  "Studieschuld & wonen": "Wonen",
};

const preferredSlugsByCategory: Record<string, string[]> = {
  Schulden: [
    "schulden-volgorde",
    "studieschuld-vs-beleggen",
    "hypotheek-impact-studieschuld",
  ],
  Hypotheek: [
    "koop-vs-huur",
    "hypotheek-aflossen-vs-beleggen",
    "annuitair-lineair",
    "hypotheekrenteaftrek-afschaffen",
  ],
  Beleggen: ["prive-beleggen-eindvermogen", "box-3-impact", "fire-na-belasting"],
  Belasting: ["box-3-impact", "jaarruimte-vs-vrij-beleggen"],
  Werk: ["zzp-uurtarief"],
  "Persoonlijke financiën": [
    "volgende-euro",
    "schulden-volgorde",
    "kind-wordt-18-impact",
  ],
  "Studieschuld & wonen": [
    "familiehulp-eerste-woning",
    "hypotheek-impact-studieschuld",
    "studieschuld-vs-beleggen",
  ],
};

export function getGroupAnchorForCategory(category: string) {
  const groupTitle = categoryToGroupTitle[category] ?? "Extra geld";
  return toAnchorId(groupTitle, "groep");
}

export function getCategoryFallbackToolHref(category: string, apps: AppManifest[]) {
  const preferred = preferredSlugsByCategory[category] ?? ["volgende-euro"];
  const match = preferred.find((slug) => apps.some((app) => app.slug === slug));
  return `/apps/${match ?? "volgende-euro"}`;
}
