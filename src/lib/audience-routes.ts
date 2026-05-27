import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type AudienceRouteId =
  | "all"
  | "starter-studieschuld"
  | "woningzoeker"
  | "zzp"
  | "schulden"
  | "gezin-kind-18"
  | "pensioen-fire";

export type AudienceRoute = {
  id: AudienceRouteId;
  label: string;
  summary: string;
  userQuestion: string;
  researchSignal: string;
  groups: string[];
  primaryToolSlugs: string[];
  futureOpportunity?: string;
};

export const audienceRoutes: AudienceRoute[] = [
  {
    id: "all",
    label: "Alles",
    summary: "Toon alle onderwerpen en kies daarna een tool die past bij je vraag.",
    userQuestion: "Ik wil zelf door de hele toolbibliotheek bladeren.",
    researchSignal:
      "Breed startpunt: de site blijft primair een rustige bibliotheek per onderwerp.",
    groups: [],
    primaryToolSlugs: [],
  },
  {
    id: "starter-studieschuld",
    label: "Starter met studieschuld",
    summary:
      "Begin bij DUO, buffer en wonen: wat betekent je schuld voor maandruimte, hypotheek en extra aflossen?",
    userQuestion: "Kan ik beter aflossen, sparen voor een huis of beleggen?",
    researchSignal:
      "Jongvolwassenen en oud-studenten zoeken vooral grip op studieschuld, wonen en de eerste grote geldkeuzes.",
    groups: ["Studieschuld", "Wonen", "Persoonlijke financiën"],
    primaryToolSlugs: [
      "volgende-euro",
      "studieschuld-vs-beleggen",
      "hypotheek-impact-studieschuld",
    ],
  },
  {
    id: "woningzoeker",
    label: "Woningzoeker",
    summary:
      "Focus op betaalbare maandlasten, eigen geld, renteaftrek en de impact van studieschuld of vaste lasten.",
    userQuestion: "Wat kan ik dragen als ik wil kopen of mijn hypotheek wil vergelijken?",
    researchSignal:
      "Woonlasten drukken relatief zwaar bij jonge en alleenstaande huurders; woningkeuzes vragen daarom maandlast- en stresstestdenken.",
    groups: ["Wonen", "Studieschuld", "Belasting"],
    primaryToolSlugs: [
      "hypotheek-impact-studieschuld",
      "annuitair-lineair",
      "hypotheekrenteaftrek-afschaffen",
    ],
    futureOpportunity:
      "Er staat nu een hidden concepttool klaar voor koop-vs-huur met eigen geld, maandlast en rente-stresstest.",
  },
  {
    id: "zzp",
    label: "ZZP / wisselend inkomen",
    summary:
      "Begin bij uurtarief, belastingpot, buffer en pensioenruimte voordat je privé-uitgaven verhoogt.",
    userQuestion: "Wat kan ik veilig privé uitgeven als mijn inkomen wisselt?",
    researchSignal:
      "Huishoudens met wisselend inkomen ervaren vaker onzekerheid; tools moeten daarom reserveringen en buffer expliciet maken.",
    groups: ["Werk & ZZP", "Belasting", "Persoonlijke financiën", "Sparen & beleggen"],
    primaryToolSlugs: ["zzp-uurtarief", "volgende-euro", "jaarruimte-vs-vrij-beleggen"],
  },
  {
    id: "schulden",
    label: "Schulden aanpakken",
    summary:
      "Breng dure schulden, DUO en hypotheekafwegingen in volgorde zonder lege velden als advies te behandelen.",
    userQuestion: "Welke schuld of keuze moet eerst aandacht krijgen?",
    researchSignal:
      "Kredieten, achteraf betalen en betalingsachterstanden vragen om een concrete volgorde in plaats van losse percentages.",
    groups: ["Persoonlijke financiën", "Studieschuld", "Wonen"],
    primaryToolSlugs: [
      "volgende-euro",
      "studieschuld-vs-beleggen",
      "hypotheek-aflossen-vs-beleggen",
    ],
    futureOpportunity:
      "Er staat nu een hidden concepttool klaar voor schulden-volgorde met achteraf betalen, creditcard, DUO en hypotheek.",
  },
  {
    id: "gezin-kind-18",
    label: "Gezin / kind wordt 18",
    summary:
      "Kijk naar maandruimte, toeslaggevoelige keuzes en reserveringen wanneer gezinsinkomen of kosten veranderen.",
    userQuestion: "Wat verandert er in mijn maandruimte als gezinssituatie of inkomsten wijzigen?",
    researchSignal:
      "Overgangsmomenten zoals een kind dat 18 wordt, werkuren en toeslagen veroorzaken juist behoefte aan eenvoudige scenario's.",
    groups: ["Persoonlijke financiën", "Werk & ZZP", "Belasting"],
    primaryToolSlugs: ["volgende-euro", "zzp-uurtarief", "box-3-impact"],
    futureOpportunity:
      "Er staat nu een hidden concepttool klaar voor kind-wordt-18 met kinderbijslag, kindgebonden budget, zorgverzekering en studiekosten.",
  },
  {
    id: "pensioen-fire",
    label: "Pensioen / FIRE",
    summary:
      "Vergelijk vrij beleggen, jaarruimte, box 3 en financiële vrijheid met focus op netto uitkomsten.",
    userQuestion: "Hoe bouw ik vermogen op zonder flexibiliteit en belastingeffecten te vergeten?",
    researchSignal:
      "Veel mensen denken laat na over pensioen; een light-first route kan jaarruimte, box 3 en FIRE begrijpelijk naast elkaar zetten.",
    groups: ["Sparen & beleggen", "FIRE / financiële vrijheid", "Belasting"],
    primaryToolSlugs: [
      "prive-beleggen-eindvermogen",
      "jaarruimte-vs-vrij-beleggen",
      "fire-na-belasting",
    ],
  },
];

const fallbackRoute = audienceRoutes[0];

export function getAudienceRoute(id: string | undefined): AudienceRoute {
  return audienceRoutes.find((route) => route.id === id) ?? fallbackRoute;
}

export function filterGroupsForAudience<T extends { title: string }>(
  groups: T[],
  routeId: string | undefined,
): T[] {
  const route = getAudienceRoute(routeId);

  if (route.groups.length === 0) {
    return groups;
  }

  return groups.filter((group) => route.groups.includes(group.title));
}

export function getAudienceRouteAnchorId(routeId: string | undefined): string {
  const route = getAudienceRoute(routeId);
  const firstGroup = route.groups[0];

  return firstGroup ? toAnchorId(firstGroup, "groep") : "apps";
}

export function getAudienceRouteApps(
  routeId: string | undefined,
  apps: AppManifest[],
): AppManifest[] {
  const route = getAudienceRoute(routeId);
  const appsBySlug = new Map(apps.map((app) => [app.slug, app]));

  return route.primaryToolSlugs
    .map((slug) => appsBySlug.get(slug))
    .filter((app): app is AppManifest => Boolean(app));
}
