import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = [
  {
    "slug": "annuitair-lineair",
    "title": "Annuïtair of lineair",
    "description": "Vergelijk bruto en netto maandlasten van een annuïtaire en lineaire hypotheek, inclusief het effect van een beleggingspot.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "annuiteit",
      "lineair",
      "maandlasten"
    ],
    "status": "active",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheek-impact-studieschuld",
    "title": "Hypotheek-impact studieschuld",
    "description": "Schat indicatief hoeveel je DUO-maandlast kan drukken op je hypotheekruimte en wat dat betekent voor je woningdoel.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "studieschuld",
      "hypotheek",
      "duo",
      "leencapaciteit"
    ],
    "status": "active",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "studieschuld-vs-beleggen",
    "title": "Studieschuld aflossen of beleggen",
    "description": "Vergelijk of extra aflossen op je studieschuld financieel gunstiger is dan beleggen.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "studieschuld",
      "beleggen",
      "rente"
    ],
    "status": "active",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
