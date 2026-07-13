import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type ToolGroup = {
  title: string;
  description: string;
  slugs: string[];
};

export const toolGroups: ToolGroup[] = [
  {
    title: "Studieschuld",
    description: "Begin hier: stoppen, schuldopbouw, maandbedrag en wat DUO voor je keuzes betekent.",
    slugs: [
      "duo-doorlenen-of-stoppen",
      "duo-maandbedrag",
      "duo-extra-aflossen",
      "schulden-volgorde",
      "hypotheek-impact-studieschuld",
    ],
  },
  {
    title: "Wonen",
    description: "Verdieping voor kopen: hypotheekruimte, woningwaarde, eigen geld en hulp van familie.",
    slugs: [
      "hypotheek-impact-studieschuld",
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "familiehulp-eerste-woning",
    ],
  },
  {
    title: "Terugbetalen",
    description: "Bekijk aflossen als volgorde- en maandruimte-vraag, zonder adviesclaim.",
    slugs: ["duo-extra-aflossen", "duo-maandbedrag", "schulden-volgorde"],
  },
];

const categoryToGroupTitle: Record<string, string> = {
  Schulden: "Studieschuld",
  Hypotheek: "Wonen",
  Beleggen: "Terugbetalen",
  Belasting: "Belasting",
  Werk: "Werk & ZZP",
  "Persoonlijke financiën": "Terugbetalen",
  "Studieschuld & wonen": "Wonen",
};

const preferredSlugsByCategory: Record<string, string[]> = {
  Schulden: [
    "duo-doorlenen-of-stoppen",
    "duo-maandbedrag",
    "duo-extra-aflossen",
    "hypotheek-impact-studieschuld",
  ],
  Hypotheek: [
    "hypotheek-impact-studieschuld",
    "artifact-hypotheek-wonen-maximale-hypotheek",
    "familiehulp-eerste-woning",
  ],
  Beleggen: ["duo-extra-aflossen", "duo-maandbedrag"],
  Belasting: ["duo-maandbedrag"],
  Werk: ["zzp-uurtarief"],
  "Persoonlijke financiën": [
    "duo-maandbedrag",
    "duo-extra-aflossen",
    "schulden-volgorde",
  ],
  "Studieschuld & wonen": [
    "hypotheek-impact-studieschuld",
    "artifact-hypotheek-wonen-maximale-hypotheek",
    "familiehulp-eerste-woning",
  ],
};

export function getGroupAnchorForCategory(category: string) {
  const groupTitle = categoryToGroupTitle[category] ?? "Extra geld";
  return toAnchorId(groupTitle, "groep");
}

export function getCategoryFallbackToolHref(category: string, apps: AppManifest[]) {
  const preferred = preferredSlugsByCategory[category] ?? ["duo-doorlenen-of-stoppen"];
  const match = preferred.find((slug) => apps.some((app) => app.slug === slug));
  return `/apps/${match ?? "duo-doorlenen-of-stoppen"}`;
}
