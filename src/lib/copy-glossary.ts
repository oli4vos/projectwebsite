import type {
  AppAssumptionDomain,
  AppCalculationDomain,
  AppDisclaimerType,
  AppOutputType,
  AppRiskLevel,
} from "@/lib/app-types";
import type {
  EmploymentType,
  ProfileDuoSituation,
  ProfileRepaymentRule,
} from "@/lib/user-profile";

export type GlossaryTerm =
  | "box3"
  | "jaarruimte"
  | "brutering"
  | "wettelijkDuoBedrag"
  | "draagkracht"
  | "aflossingsvrijePeriode"
  | "fiscalePartner"
  | "jaarlijksOpnamepercentage"
  | "indicatieveBerekening"
  | "hypotheekrenteaftrek"
  | "eigenGeld"
  | "maandlasten"
  | "renteStresstest"
  | "achterafBetalen"
  | "privateLease"
  | "buffer"
  | "rendement"
  | "vrijstelling"
  | "toeslagen"
  | "kinderbijslag"
  | "kindgebondenBudget"
  | "zorgverzekering"
  | "zorgtoeslag"
  | "studiekosten"
  | "scenario";

export type GlossaryEntry = {
  term: GlossaryTerm;
  label: string;
  explanation: string;
  aliases: string[];
};

export type GlossaryTextMatch = {
  term: GlossaryTerm;
  text: string;
  start: number;
  end: number;
};

const glossaryLabels: Record<GlossaryTerm, string> = {
  box3: "Box 3",
  jaarruimte: "Jaarruimte",
  brutering: "Brutering",
  wettelijkDuoBedrag: "Wettelijk DUO-bedrag",
  draagkracht: "Draagkracht",
  aflossingsvrijePeriode: "Aflossingsvrije periode",
  fiscalePartner: "Fiscale partner",
  jaarlijksOpnamepercentage: "Jaarlijks opnamepercentage",
  indicatieveBerekening: "Indicatieve berekening",
  hypotheekrenteaftrek: "Hypotheekrenteaftrek",
  eigenGeld: "Eigen geld",
  maandlasten: "Maandlasten",
  renteStresstest: "Rente-stresstest",
  achterafBetalen: "Achteraf betalen",
  privateLease: "Private lease",
  buffer: "Buffer",
  rendement: "Rendement",
  vrijstelling: "Vrijstelling",
  toeslagen: "Toeslagen",
  kinderbijslag: "Kinderbijslag",
  kindgebondenBudget: "Kindgebonden budget",
  zorgverzekering: "Zorgverzekering",
  zorgtoeslag: "Zorgtoeslag",
  studiekosten: "Studiekosten",
  scenario: "Scenario",
};

const glossaryExplanations: Record<GlossaryTerm, string> = {
  box3: "Belasting over spaargeld, overige bezittingen en sommige schulden.",
  jaarruimte:
    "Het bedrag dat je mogelijk fiscaal voordelig voor pensioen kunt inleggen.",
  brutering:
    "Het omrekenen van een netto maandlast naar een bruto maandlast voor hypotheekruimte.",
  wettelijkDuoBedrag:
    "Het maandbedrag dat hoort bij je schuld, rente en looptijd, los van tijdelijke verlagingen.",
  draagkracht: "Een verlaging van je DUO-maandbedrag op basis van inkomen.",
  aflossingsvrijePeriode:
    "Een periode waarin je tijdelijk niet hoeft af te lossen volgens DUO-regels.",
  fiscalePartner:
    "Je fiscale partner kan invloed hebben op vrijstellingen en belastinguitkomsten.",
  jaarlijksOpnamepercentage:
    "Het percentage van je vermogen dat je jaarlijks wilt opnemen om van te leven.",
  indicatieveBerekening:
    "Een vereenvoudigde berekening voor inzicht; geen officiële aangifte of advies.",
  hypotheekrenteaftrek:
    "Een belastingvoordeel waardoor je een deel van je hypotheekrente kunt terugkrijgen via de inkomstenbelasting.",
  eigenGeld:
    "Spaargeld of ander geld dat je zelf inbrengt, bijvoorbeeld bij het kopen van een huis.",
  maandlasten:
    "Het bedrag dat je gemiddeld per maand betaalt, bijvoorbeeld voor huur, hypotheek, verzekering of aflossing.",
  renteStresstest:
    "Een simpele check wat er gebeurt als de rente hoger wordt dan waar je nu mee rekent.",
  achterafBetalen:
    "Nu kopen en later betalen. Het voelt klein, maar kan je overzicht en maandruimte verminderen.",
  privateLease:
    "Een auto huren voor een vast maandbedrag. Dat bedrag kan meetellen als vaste last.",
  buffer:
    "Geld dat je achter de hand houdt voor tegenvallers, zodat je niet direct hoeft te lenen of verkopen.",
  rendement:
    "De opbrengst of het verlies op geld dat je inzet. De uitkomst kan onzeker zijn.",
  vrijstelling:
    "Een bedrag waarover je geen of minder belasting betaalt.",
  toeslagen:
    "Bedragen van de overheid die je inkomen kunnen aanvullen, zoals huurtoeslag, zorgtoeslag of kinderopvangtoeslag.",
  kinderbijslag:
    "Een bijdrage van de overheid voor ouders met kinderen onder de 18 jaar.",
  kindgebondenBudget:
    "Een inkomensafhankelijke toeslag voor ouders met kinderen.",
  zorgverzekering:
    "De verplichte basisverzekering voor zorgkosten. Vanaf 18 jaar betaal je die zelf.",
  zorgtoeslag:
    "Een bijdrage van de overheid voor je zorgverzekering als je inkomen niet te hoog is.",
  studiekosten:
    "Kosten voor opleiding of studie, zoals lesgeld, boeken, laptop, vervoer of wonen.",
  scenario:
    "Een doorgerekende situatie met jouw ingevulde aannames, zodat je keuzes kunt vergelijken.",
};

const glossaryAliases: Record<GlossaryTerm, string[]> = {
  box3: ["box 3", "box-3", "vermogensbelasting"],
  jaarruimte: ["jaarruimte", "pensioenruimte"],
  brutering: ["brutering", "bruteren"],
  wettelijkDuoBedrag: ["wettelijk duo-bedrag", "wettelijk duo bedrag"],
  draagkracht: ["draagkracht", "draagkrachtmeting"],
  aflossingsvrijePeriode: ["aflossingsvrije periode", "betaalpauze"],
  fiscalePartner: ["fiscale partner", "fiscaal partner"],
  jaarlijksOpnamepercentage: ["jaarlijks opnamepercentage", "opnamepercentage"],
  indicatieveBerekening: ["indicatieve berekening", "indicatief"],
  hypotheekrenteaftrek: ["hypotheekrenteaftrek", "renteaftrek"],
  eigenGeld: ["eigen geld", "eigen inleg"],
  maandlasten: ["maandlasten", "maandlast"],
  renteStresstest: ["rente-stresstest", "rente stresstest", "rentestress"],
  achterafBetalen: ["achteraf betalen", "bnpl", "buy now pay later"],
  privateLease: ["private lease", "lease"],
  buffer: ["buffer", "noodbuffer"],
  rendement: ["rendement", "verwacht rendement"],
  vrijstelling: ["vrijstelling", "heffingsvrij vermogen"],
  toeslagen: ["toeslagen", "toeslag"],
  kinderbijslag: ["kinderbijslag"],
  kindgebondenBudget: ["kindgebonden budget"],
  zorgverzekering: ["zorgverzekering"],
  zorgtoeslag: ["zorgtoeslag"],
  studiekosten: ["studiekosten", "studiekost"],
  scenario: ["scenario", "scenario's", "scenario’s"],
};

const disclaimerTypeLabels: Record<AppDisclaimerType, string> = {
  indicative: "Indicatieve berekening",
  financialEducation: "Educatieve keuzehulp",
  taxIndicative: "Indicatieve belastingberekening",
  mortgageIndicative: "Indicatieve hypotheekberekening",
  duoIndicative: "Indicatieve DUO-berekening",
};

const outputTypeLabels: Record<AppOutputType, string> = {
  singleResult: "Eén hoofdresultaat",
  scenarioComparison: "Vergelijk scenario's",
  timeline: "Tijdlijn",
  checklist: "Checklist",
  mixed: "Gemengd",
};

const riskLevelLabels: Record<AppRiskLevel, string> = {
  low: "Laag",
  medium: "Gemiddeld",
  high: "Hoog",
};

const repaymentRuleLabels: Record<ProfileRepaymentRule, string> = {
  SF35: "SF35",
  SF15: "SF15",
  SF15_OLD: "SF15 oude regeling",
  SF15_LLLK: "SF15 levenlanglerenkrediet",
  UNKNOWN: "Weet ik niet",
};

const duoSituationLabels: Record<ProfileDuoSituation, string> = {
  repaying: "Ik betaal al maandelijks",
  gracePeriod: "Aanloopfase",
  incomeBasedReduction: "Verlaagd door draagkracht",
  paymentPause: "Aflossingsvrije periode",
  unknown: "Weet ik niet",
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  employee: "In loondienst",
  selfEmployed: "ZZP / ondernemer",
  mixed: "Combinatie loondienst + zelfstandig",
  unknown: "Onbekend / nog niet ingevuld",
};

const assumptionDomainLabels: Record<AppAssumptionDomain, string> = {
  duo: "DUO",
  tax: "Belasting",
  box1: "Box 1",
  box3: "Box 3",
  mortgage: "Hypotheek",
  investment: "Beleggen",
  inflation: "Inflatie",
  charts: "Grafieken",
};

const calculationDomainLabels: Record<AppCalculationDomain, string> = {
  studentDebt: "Studieschuld",
  mortgage: "Hypotheek",
  housing: "Wonen",
  tax: "Belasting",
  investing: "Beleggen",
  saving: "Sparen",
  cashflow: "Cashflow",
  employment: "Werk",
  pension: "Pensioen",
};

export function getGlossaryLabel(term: GlossaryTerm): string {
  return glossaryLabels[term];
}

export function getGlossaryExplanation(term: GlossaryTerm): string {
  return glossaryExplanations[term];
}

export function getGlossaryEntry(term: GlossaryTerm): GlossaryEntry {
  return {
    term,
    label: glossaryLabels[term],
    explanation: glossaryExplanations[term],
    aliases: glossaryAliases[term],
  };
}

export function getGlossaryEntries(): GlossaryEntry[] {
  return (Object.keys(glossaryLabels) as GlossaryTerm[]).map(getGlossaryEntry);
}

function isWordChar(value: string | undefined): boolean {
  return value !== undefined && /[\p{L}\p{N}]/u.test(value);
}

function overlapsExistingMatch(
  matches: GlossaryTextMatch[],
  start: number,
  end: number,
) {
  return matches.some((match) => start < match.end && end > match.start);
}

export function findGlossaryMatches(text: string): GlossaryTextMatch[] {
  const lowerText = text.toLowerCase();
  const aliases = getGlossaryEntries()
    .flatMap((entry) =>
      entry.aliases.map((alias) => ({
        term: entry.term,
        alias,
        lowerAlias: alias.toLowerCase(),
      })),
    )
    .sort((left, right) => right.lowerAlias.length - left.lowerAlias.length);

  const matches: GlossaryTextMatch[] = [];

  for (const item of aliases) {
    let index = lowerText.indexOf(item.lowerAlias);

    while (index >= 0) {
      const end = index + item.lowerAlias.length;
      const hasStartBoundary = !isWordChar(text[index - 1]);
      const hasEndBoundary = !isWordChar(text[end]);

      if (
        hasStartBoundary &&
        hasEndBoundary &&
        !overlapsExistingMatch(matches, index, end)
      ) {
        matches.push({
          term: item.term,
          text: text.slice(index, end),
          start: index,
          end,
        });
      }

      index = lowerText.indexOf(item.lowerAlias, index + item.lowerAlias.length);
    }
  }

  return matches.sort((left, right) => left.start - right.start);
}

export function getDisclaimerTypeLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return (
    disclaimerTypeLabels[value as AppDisclaimerType] ??
    "Indicatieve berekening"
  );
}

export function getOutputTypeLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return outputTypeLabels[value as AppOutputType] ?? "Onbekend";
}

export function getRiskLevelLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return riskLevelLabels[value as AppRiskLevel] ?? "Onbekend";
}

export function getRepaymentRuleLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return repaymentRuleLabels[value as ProfileRepaymentRule] ?? "Onbekend";
}

export function getDuoSituationLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return duoSituationLabels[value as ProfileDuoSituation] ?? "Onbekend";
}

export function getEmploymentTypeLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return employmentTypeLabels[value as EmploymentType] ?? "Onbekend";
}

export function getAssumptionDomainLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return assumptionDomainLabels[value as AppAssumptionDomain] ?? "Onbekend";
}

export function getCalculationDomainLabel(value?: string): string {
  if (!value) {
    return "Onbekend";
  }

  return calculationDomainLabels[value as AppCalculationDomain] ?? "Onbekend";
}
