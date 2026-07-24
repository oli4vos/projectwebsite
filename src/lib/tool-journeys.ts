import { appRegistryBySlug } from "@/lib/app-registry";

export type ToolNextStepLink = {
  href: string;
  label: string;
};

export type ToolNextStepsConfig = {
  title: string;
  description: string;
  primary: ToolNextStepLink;
  secondary?: ToolNextStepLink[];
};

export const publicToolJourneys = {
  "duo-schuld-bij-starten-lenen": {
    title: "Van schuldgroei naar maandbedrag",
    description:
      "Je weet nu wat je studieschuld ongeveer wordt. De volgende vraag is meestal wat je later per maand betaalt en of een beurs of lagere leenruimte helpt.",
    primary: {
      href: "/apps/duo-maandbedrag",
      label: "Bereken DUO-maandbedrag",
    },
    secondary: [
      {
        href: "/apps/duo-aanvullende-beurs",
        label: "Bekijk aanvullende beurs",
      },
      {
        href: "/apps/duo-leenbedrag-impact",
        label: "Vergelijk leenbedrag",
      },
    ],
  },
  "duo-stoppen-kosten-prestatiebeurs": {
    title: "Van stopkosten naar maandlast",
    description:
      "Je ziet nu welk prestatiebeursdeel schuld blijft. De volgende vraag is vaak wat je later per maand betaalt en hoe dat doorwerkt naar wonen.",
    primary: {
      href: "/apps/duo-maandbedrag",
      label: "Bereken DUO-maandbedrag",
    },
    secondary: [
      {
        href: "/apps/hypotheek-impact-studieschuld",
        label: "Bekijk hypotheekimpact",
      },
      {
        href: "/apps/duo-extra-aflossen",
        label: "Vergelijk extra aflossen",
      },
    ],
  },
  "duo-leenbedrag-impact": {
    title: "Van leenbedrag naar totale schuld",
    description:
      "Je hebt nu het maandelijkse leenverschil in beeld. De volgende vraag is meestal hoeveel schuld dat aan het eind van je studie oplevert.",
    primary: {
      href: "/apps/duo-schuld-bij-starten-lenen",
      label: "Bereken totale studieschuld",
    },
    secondary: [
      {
        href: "/apps/duo-maandbedrag",
        label: "Naar DUO-maandbedrag",
      },
      {
        href: "/apps/duo-aanvullende-beurs",
        label: "Bekijk aanvullende beurs",
      },
    ],
  },
  "duo-aanvullende-beurs": {
    title: "Van beurs naar maandbedrag",
    description:
      "Je weet nu wat aanvullende beurs kan doen. De volgende vraag is meestal wat je later per maand betaalt en of je leenbedrag of afloskeuze daarbij past.",
    primary: {
      href: "/apps/duo-maandbedrag",
      label: "Bereken DUO-maandbedrag",
    },
    secondary: [
      {
        href: "/apps/duo-leenbedrag-impact",
        label: "Vergelijk leenbedrag",
      },
      {
        href: "/apps/duo-extra-aflossen",
        label: "Vergelijk extra aflossen",
      },
    ],
  },
  "duo-maandbedrag": {
    title: "Van maandbedrag naar woningruimte",
    description:
      "Je weet nu wat je later per maand betaalt. De volgende vraag is vaak hoeveel hypotheekruimte daar nog overblijft.",
    primary: {
      href: "/apps/hypotheek-impact-studieschuld",
      label: "Bekijk hypotheekimpact",
    },
    secondary: [
      {
        href: "/apps/duo-extra-aflossen",
        label: "Vergelijk extra aflossen",
      },
      {
        href: "/apps/familiehulp-eerste-woning",
        label: "Bekijk familiehulp",
      },
    ],
  },
  "duo-extra-aflossen": {
    title: "Van extra aflossen naar woningimpact",
    description:
      "Je ziet nu wat extra aflossen doet met looptijd en rentelast. De volgende vraag is meestal wat dat voor je hypotheekruimte betekent.",
    primary: {
      href: "/apps/hypotheek-impact-studieschuld",
      label: "Bekijk hypotheekimpact",
    },
    secondary: [
      {
        href: "/apps/duo-maandbedrag",
        label: "Terug naar DUO-maandbedrag",
      },
      {
        href: "/apps/duo-aanvullende-beurs",
        label: "Bekijk aanvullende beurs",
      },
    ],
  },
  "hypotheek-impact-studieschuld": {
    title: "Van studieschuld naar volledige hypotheek",
    description:
      "Je weet nu hoeveel leencapaciteit je studieschuld indicatief kost. De volgende vraag is meestal wat je totale hypotheekruimte is en of familiehulp nodig is.",
    primary: {
      href: "/apps/artifact-hypotheek-wonen-maximale-hypotheek",
      label: "Bereken maximale hypotheek",
    },
    secondary: [
      {
        href: "/apps/familiehulp-eerste-woning",
        label: "Bekijk familiehulp",
      },
      {
        href: "/apps/duo-maandbedrag",
        label: "Controleer DUO-maandbedrag",
      },
    ],
  },
  "artifact-hypotheek-wonen-maximale-hypotheek": {
    title: "Van maximale hypotheek naar hulp uit familie",
    description:
      "Je ziet nu wat je bank op inkomen en woningwaarde kan lenen. De volgende vraag is vaak hoe familiehulp of schenking het gat kan dichten.",
    primary: {
      href: "/apps/familiehulp-eerste-woning",
      label: "Bekijk familiehulp",
    },
    secondary: [
      {
        href: "/apps/hypotheek-impact-studieschuld",
        label: "Terug naar studieschuld",
      },
      {
        href: "/kennisbank",
        label: "Lees de kennisbank",
      },
    ],
  },
  "familiehulp-eerste-woning": {
    title: "Van familiehulp naar toeslagen",
    description:
      "Je ziet nu hoe eigen geld, lening en schenking samen uitpakken. De volgende vraag is vaak welke toeslagen nog passen bij je situatie.",
    primary: {
      href: "/apps/toeslagen-scan",
      label: "Open toeslagen-scan",
    },
    secondary: [
      {
        href: "/apps/artifact-hypotheek-wonen-maximale-hypotheek",
        label: "Terug naar hypotheek",
      },
    ],
  },
  "toeslagen-scan": {
    title: "Van toeslagen naar uitleg",
    description:
      "Je hebt nu een indicatie voor de mogelijke toeslagen. De volgende vraag is meestal waarom een toeslag wel of niet voorkomt en wat de officiële regels zijn.",
    primary: {
      href: "/kennisbank",
      label: "Lees de kennisbank",
    },
    secondary: [
      {
        href: "/apps/duo-maandbedrag",
        label: "Naar DUO-maandbedrag",
      },
    ],
  },
  "schulden-volgorde": {
    title: "Van schuldvolgorde naar concrete maandruimte",
    description:
      "Je hebt nu een aflosvolgorde. De volgende vraag is meestal hoeveel ruimte DUO of hypotheek daar uiteindelijk van vraagt.",
    primary: {
      href: "/apps/duo-maandbedrag",
      label: "Bereken DUO-maandbedrag",
    },
    secondary: [
      {
        href: "/apps/duo-extra-aflossen",
        label: "Vergelijk extra aflossen",
      },
      {
        href: "/apps/hypotheek-impact-studieschuld",
        label: "Bekijk hypotheekimpact",
      },
    ],
  },
} as const satisfies Record<string, ToolNextStepsConfig>;

export type PublicToolSlug = keyof typeof publicToolJourneys;

function appSlugFromHref(href: string) {
  const match = /^\/apps\/([^/?#]+)/.exec(href);
  return match?.[1];
}

function isEnabledToolHref(href: string) {
  const slug = appSlugFromHref(href);
  return !slug || Boolean(appRegistryBySlug[slug]);
}

export function getToolNextSteps(slug: PublicToolSlug): ToolNextStepsConfig {
  const config = publicToolJourneys[slug];
  const availableSecondary = (config.secondary ?? []).filter((link) =>
    isEnabledToolHref(link.href),
  );
  if (isEnabledToolHref(config.primary.href)) {
    return {
      ...config,
      secondary: availableSecondary,
    };
  }
  const [primary, ...secondary] = availableSecondary;
  return {
    ...config,
    primary: primary ?? {
      href: "/apps",
      label: "Bekijk alle tools",
    },
    secondary,
  };
}
