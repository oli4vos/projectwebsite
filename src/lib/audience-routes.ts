import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type AudienceRouteId =
  | "all"
  | "starter-studieschuld"
  | "koopstarter-familiehulp"
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
  enabled?: boolean;
  futureOpportunity?: string;
};

export const audienceRoutes: AudienceRoute[] = [
  {
    id: "all",
    label: "Alle tools",
    summary: "Toon alle zichtbare tools wanneer je zelf wilt kiezen.",
    userQuestion: "Ik wil zelf alle tools zien.",
    researchSignal:
      "Alle tools blijven beschikbaar, maar de standaardroute begint bewust eenvoudiger.",
    groups: [],
    primaryToolSlugs: [],
  },
  {
    id: "starter-studieschuld",
    label: "Start bij DUO",
    summary:
      "Begin bij stoppen, schuldopbouw, maandbedrag en wat je studieschuld later betekent.",
    userQuestion: "Wat doet mijn studieschuld met mijn ruimte per maand?",
    researchSignal:
      "Eerst grip op DUO, daarna pas wonen en familiehulp.",
    groups: ["Studieschuld", "Wonen"],
    primaryToolSlugs: [
      "duo-schuld-bij-starten-lenen",
      "duo-stoppen-kosten-prestatiebeurs",
      "duo-leenbedrag-impact",
      "duo-aanvullende-beurs",
      "duo-maandbedrag",
      "duo-extra-aflossen",
      "hypotheek-impact-studieschuld",
    ],
  },
  {
    id: "koopstarter-familiehulp",
    label: "Daarna wonen",
    summary:
      "Vergelijk woningprijs, eigen geld, DUO, bankhypotheek, familielening en schenking.",
    userQuestion:
      "Kan ik kopen met studieschuld, eigen geld en hulp van familie?",
    researchSignal:
      "Wonen is een verdiepingslaag: familielening, schenking en contractuele lasten blijven apart.",
    groups: ["Studieschuld", "Wonen"],
    primaryToolSlugs: [
      "hypotheek-impact-studieschuld",
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "familiehulp-eerste-woning",
      "duo-leenbedrag-impact",
    ],
  },
  {
    id: "woningzoeker",
    label: "Woningzoeker",
    enabled: false,
    summary:
      "Focus op betaalbare maandlasten, eigen geld, renteaftrek en de impact van studieschuld of vaste lasten.",
    userQuestion: "Wat kan ik dragen als ik wil kopen of mijn hypotheek wil vergelijken?",
    researchSignal:
      "Woonlasten drukken relatief zwaar bij jonge en alleenstaande huurders; woningkeuzes vragen daarom maandlast- en stresstestdenken.",
    groups: ["Wonen", "Studieschuld", "Belasting"],
    primaryToolSlugs: [
      "koop-vs-huur",
      "hypotheek-impact-studieschuld",
      "annuitair-lineair",
      "hypotheekrenteaftrek-afschaffen",
    ],
  },
  {
    id: "zzp",
    label: "ZZP / wisselend inkomen",
    enabled: false,
    summary:
      "Begin bij uurtarief, belastingpot, buffer en pensioenruimte voordat je privé-uitgaven verhoogt.",
    userQuestion: "Wat kan ik veilig privé uitgeven als mijn inkomen wisselt?",
    researchSignal:
      "Huishoudens met wisselend inkomen ervaren vaker onzekerheid; tools moeten daarom reserveringen en buffer expliciet maken.",
    groups: ["Werk & ZZP", "Belasting", "Terugbetalen"],
    primaryToolSlugs: ["zzp-uurtarief"],
  },
  {
    id: "schulden",
    label: "Schulden aanpakken",
    enabled: false,
    summary:
      "Breng dure schulden, DUO en hypotheekafwegingen in volgorde zonder lege velden als advies te behandelen.",
    userQuestion: "Welke schuld of keuze moet eerst aandacht krijgen?",
    researchSignal:
      "Kredieten, achteraf betalen en betalingsachterstanden vragen om een concrete volgorde in plaats van losse percentages.",
    groups: ["Terugbetalen", "Studieschuld", "Wonen"],
    primaryToolSlugs: ["schulden-volgorde", "duo-maandbedrag", "duo-extra-aflossen"],
  },
  {
    id: "gezin-kind-18",
    label: "Gezin / kind wordt 18",
    enabled: false,
    summary:
      "Kijk naar maandruimte, toeslaggevoelige keuzes en reserveringen wanneer gezinsinkomen of kosten veranderen.",
    userQuestion: "Wat verandert er in mijn maandruimte als gezinssituatie of inkomsten wijzigen?",
    researchSignal:
      "Overgangsmomenten zoals een kind dat 18 wordt, werkuren en toeslagen veroorzaken juist behoefte aan eenvoudige scenario's.",
    groups: ["Terugbetalen", "Werk & ZZP", "Belasting"],
    primaryToolSlugs: ["kind-wordt-18-impact", "zzp-uurtarief"],
  },
  {
    id: "pensioen-fire",
    label: "Pensioen / lange termijn",
    enabled: false,
    summary:
      "Vergelijk pensioenruimte, box 3 en lange termijn met focus op netto uitkomsten.",
    userQuestion: "Hoe plan ik later zonder flexibiliteit en belastingeffecten te vergeten?",
    researchSignal:
      "Veel mensen denken laat na over pensioen; een light-first route kan jaarruimte, box 3 en FIRE begrijpelijk naast elkaar zetten.",
    groups: ["Belasting"],
    primaryToolSlugs: [],
  },
];

export const visibleAudienceRoutes = audienceRoutes.filter(
  (route) => route.enabled !== false,
);

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
