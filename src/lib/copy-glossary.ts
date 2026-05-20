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
  | "indicatieveBerekening";

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
};

const glossaryExplanations: Record<GlossaryTerm, string> = {
  box3: "Belasting over sparen, beleggen en sommige schulden.",
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
