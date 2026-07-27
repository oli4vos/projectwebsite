import {
  calculateDuoAdditionalGrant,
  type DuoAdditionalGrantFamilySituation,
  type DuoAdditionalGrantIncomeReliability,
  type DuoAdditionalGrantInput,
  type DuoAdditionalGrantResidence,
  type DuoAdditionalGrantResult,
  type DuoAdditionalGrantSpecialCase,
} from "@/lib/duo/additional-grant";
import type { DuoAdditionalGrantEducationType } from "@/lib/financial-constants/duo-additional-grant-rules-2026";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type AdditionalGrantFormValues = {
  educationType: "" | DuoAdditionalGrantEducationType;
  residence: "" | DuoAdditionalGrantResidence;
  familySituation: "" | DuoAdditionalGrantFamilySituation;
  parent1Income: string;
  parent2Income: string;
  parent1IncomeReliability: DuoAdditionalGrantIncomeReliability;
  parent2IncomeReliability: DuoAdditionalGrantIncomeReliability;
  parent1AnnualDuoRepaymentTerms: string;
  parent2AnnualDuoRepaymentTerms: string;
  parent1OtherQualifyingChildren: string;
  parent2OtherQualifyingChildren: string;
  parent1ChildrenWithAdditionalGrant: string;
  parent2ChildrenWithAdditionalGrant: string;
  calculationMonth: string;
  tuitionDue: "yes" | "no";
  specialCase: "none" | DuoAdditionalGrantSpecialCase;
};

export type AdditionalGrantErrors = Partial<Record<keyof AdditionalGrantFormValues, string>>;

export type AdditionalGrantView =
  | {
      isValid: false;
      errors: AdditionalGrantErrors;
    }
  | {
      isValid: true;
      errors: AdditionalGrantErrors;
      input: DuoAdditionalGrantInput;
      result: DuoAdditionalGrantResult;
      statusLabel: string;
      conclusion: string;
      monthlyGrantLabel: string;
      annualGrantLabel: string;
      probablyEligibleLabel: string;
      confidenceLabel: string;
      warningMessages: readonly string[];
      assumptionMessages: readonly string[];
      explanationRows: readonly { label: string; value: string }[];
      reasonMessages: readonly string[];
      sourceLinks: readonly { label: string; href: string }[];
    };

const calculationYear = 2026;

export const defaultValues: AdditionalGrantFormValues = {
  educationType: "hbo",
  residence: "living-at-home",
  familySituation: "two-parents",
  parent1Income: "25000",
  parent2Income: "25000",
  parent1IncomeReliability: "final",
  parent2IncomeReliability: "final",
  parent1AnnualDuoRepaymentTerms: "",
  parent2AnnualDuoRepaymentTerms: "",
  parent1OtherQualifyingChildren: "",
  parent2OtherQualifyingChildren: "",
  parent1ChildrenWithAdditionalGrant: "",
  parent2ChildrenWithAdditionalGrant: "",
  calculationMonth: "7",
  tuitionDue: "yes",
  specialCase: "none",
};

export const emptyValues: AdditionalGrantFormValues = {
  ...defaultValues,
  educationType: "",
  residence: "",
  familySituation: "",
  parent1Income: "",
  parent2Income: "",
  calculationMonth: "",
};

type PublicAdditionalGrantSpecialCase =
  | "parent-deceased"
  | "parent-unknown"
  | "parent-abroad"
  | "parent-ignored"
  | "no-contact-or-conflict";

export type AdditionalGrantSpecialCaseGuidance = {
  title: string;
  explanation: string;
  steps: readonly string[];
  sourceLabel: string;
  sourceUrl: string;
};

const specialCaseGuidance: Record<
  PublicAdditionalGrantSpecialCase,
  AdditionalGrantSpecialCaseGuidance
> = {
  "parent-deceased": {
    title: "Een overleden ouder telt niet altijd meer mee",
    explanation:
      "DUO verwerkt een overlijden in Nederland normaal via de gemeente. Woonde de ouder in het buitenland, dan moet je het overlijden zelf doorgeven. De tool berekent daarom geen regulier bedrag.",
    steps: [
      "Vraag aanvullende beurs aan als je dat nog niet hebt gedaan.",
      "Controleer in Mijn DUO of het overlijden is verwerkt.",
      "Geef een overlijden in het buitenland zelf door; DUO kan om een overlijdensakte vragen.",
    ],
    sourceLabel: "Lees wat DUO doet als een ouder is overleden",
    sourceUrl:
      "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/vader-of-moeder-overleden.jsp",
  },
  "parent-unknown": {
    title: "DUO moet vaststellen welke ouder meetelt",
    explanation:
      "Als DUO niet weet wie of waar een ouder is, kun je na je aanvraag mogelijk vragen om het inkomen van die ouder buiten beschouwing te laten. DUO beoordeelt je situatie en bewijsstukken.",
    steps: [
      "Vraag eerst studiefinanciering met aanvullende beurs aan.",
      "Open in Mijn DUO je situatie bij Studiefinanciering.",
      "Gebruik zo nodig het verzoekformulier en stuur de gevraagde bewijsstukken mee.",
    ],
    sourceLabel: "Lees wat DUO vraagt bij problemen met oudergegevens",
    sourceUrl:
      "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/problemen-met-ouders.jsp",
  },
  "parent-abroad": {
    title: "Buitenlands ouderinkomen moet meestal worden aangeleverd",
    explanation:
      "DUO kan buitenlands inkomen meestal niet automatisch bij de Belastingdienst opvragen. De ouder geeft het bruto jaarinkomen door met bewijs van de buitenlandse belastingdienst. Tot die controle toont de tool geen regulier bedrag.",
    steps: [
      "Controleer welke inkomensbrief de ouder van DUO heeft gekregen.",
      "Geef het inkomen en de bewijsstukken door via Mijn DUO.",
      "Gebruik het formulier voor buitenlands inkomen als Mijn DUO niet beschikbaar is.",
    ],
    sourceLabel: "Lees hoe je buitenlands ouderinkomen doorgeeft",
    sourceUrl:
      "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/inkomen-ouders.jsp",
  },
  "parent-ignored": {
    title: "Buiten beschouwing laten vraagt een apart verzoek",
    explanation:
      "DUO laat ouderinkomen alleen in specifieke situaties buiten beschouwing. Je moet aanvullende beurs hebben aangevraagd en DUO beoordeelt daarna je verzoek en bewijsstukken.",
    steps: [
      "Vraag eerst studiefinanciering met aanvullende beurs aan.",
      "Kies in Mijn DUO de situatie die op jou van toepassing is.",
      "Stuur het verzoek en alle gevraagde verklaringen of bewijsstukken mee.",
    ],
    sourceLabel: "Bekijk de voorwaarden en aanvraagroute bij DUO",
    sourceUrl:
      "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/problemen-met-ouders.jsp",
  },
  "no-contact-or-conflict": {
    title: "Geen contact is niet automatisch genoeg",
    explanation:
      "DUO kan het inkomen van een ouder buiten beschouwing laten bij een erkende bijzondere situatie, bijvoorbeeld een ernstig en structureel conflict dat over meer dan geld gaat. DUO beoordeelt de omstandigheden en bewijsstukken.",
    steps: [
      "Vraag eerst studiefinanciering met aanvullende beurs aan.",
      "Controleer of jouw situatie onder de voorwaarden van DUO valt.",
      "Dien via Mijn DUO of het verzoekformulier je uitleg en bewijsstukken in.",
    ],
    sourceLabel: "Bekijk wanneer DUO ouderinkomen buiten beschouwing kan laten",
    sourceUrl:
      "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/problemen-met-ouders.jsp",
  },
};

export function getAdditionalGrantSpecialCaseGuidance(
  value: AdditionalGrantFormValues["specialCase"],
): AdditionalGrantSpecialCaseGuidance | null {
  if (value === "none" || !(value in specialCaseGuidance)) {
    return null;
  }

  return specialCaseGuidance[value as PublicAdditionalGrantSpecialCase];
}

function parseMoney(value: string) {
  return parseOptionalDecimalInput(value);
}

function parseOptionalWholeNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed.replace(/\s+/g, ""));
  return Number.isInteger(parsed) ? parsed : undefined;
}

function hasInvalidMoney(value: string, allowNegative = false) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parsed = parseMoney(value);
  return parsed === undefined || !Number.isFinite(parsed) || (!allowNegative && parsed < 0);
}

function hasInvalidWholeNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parsed = parseOptionalWholeNumber(value);
  return parsed === undefined || parsed < 0;
}

export function validateAdditionalGrantForm(values: AdditionalGrantFormValues): AdditionalGrantErrors {
  const errors: AdditionalGrantErrors = {};
  const usesRegularParentCalculation = values.specialCase === "none";

  if (!values.educationType) {
    errors.educationType = "Kies mbo, hbo of universiteit.";
  }
  if (!values.residence) {
    errors.residence = "Kies thuiswonend of uitwonend.";
  }
  if (usesRegularParentCalculation && !values.familySituation) {
    errors.familySituation = "Kies of één of twee ouders meetellen.";
  }
  if (usesRegularParentCalculation && values.parent1Income.trim().length === 0) {
    errors.parent1Income = "Vul het ouderinkomen 2024 van ouder 1 in.";
  } else if (
    usesRegularParentCalculation &&
    hasInvalidMoney(values.parent1Income, true)
  ) {
    errors.parent1Income = "Gebruik een geldig bedrag voor ouder 1. Negatief inkomen mag als DUO dat zo verwerkt.";
  }
  if (usesRegularParentCalculation && values.familySituation === "two-parents") {
    if (values.parent2Income.trim().length === 0) {
      errors.parent2Income = "Vul het ouderinkomen 2024 van ouder 2 in.";
    } else if (hasInvalidMoney(values.parent2Income, true)) {
      errors.parent2Income = "Gebruik een geldig bedrag voor ouder 2. Negatief inkomen mag als DUO dat zo verwerkt.";
    }
  }

  if (usesRegularParentCalculation) {
    for (const field of [
      "parent1AnnualDuoRepaymentTerms",
      "parent2AnnualDuoRepaymentTerms",
    ] as const) {
      if (hasInvalidMoney(values[field])) {
        errors[field] = "Gebruik 0 of een hoger jaarbedrag.";
      }
    }
    for (const field of [
      "parent1OtherQualifyingChildren",
      "parent2OtherQualifyingChildren",
      "parent1ChildrenWithAdditionalGrant",
      "parent2ChildrenWithAdditionalGrant",
    ] as const) {
      if (hasInvalidWholeNumber(values[field])) {
        errors[field] = "Gebruik een heel aantal van 0 of hoger.";
      }
    }
  }
  if (values.calculationMonth.trim().length > 0) {
    const month = parseOptionalWholeNumber(values.calculationMonth);
    if (month === undefined || month < 1 || month > 12) {
      errors.calculationMonth = "Gebruik een maandnummer van 1 tot en met 12.";
    }
  }

  return errors;
}

export function mapFormToAdditionalGrantInput(values: AdditionalGrantFormValues): DuoAdditionalGrantInput {
  const usesRegularParentCalculation = values.specialCase === "none";
  const familySituation = usesRegularParentCalculation
    ? values.familySituation || undefined
    : undefined;
  const parent2Required = familySituation === "two-parents";
  const standardReferenceYearInput = usesRegularParentCalculation
    ? {
        parent1Income: parseMoney(values.parent1Income),
        parent2Income: parent2Required
          ? parseMoney(values.parent2Income)
          : undefined,
        parent1IncomeReliability: values.parent1IncomeReliability,
        parent2IncomeReliability: parent2Required
          ? values.parent2IncomeReliability
          : undefined,
        parent1AnnualDuoRepaymentTerms: parseMoney(
          values.parent1AnnualDuoRepaymentTerms,
        ),
        parent2AnnualDuoRepaymentTerms: parent2Required
          ? parseMoney(values.parent2AnnualDuoRepaymentTerms)
          : undefined,
        parent1OtherQualifyingChildren: parseOptionalWholeNumber(
          values.parent1OtherQualifyingChildren,
        ),
        parent2OtherQualifyingChildren: parent2Required
          ? parseOptionalWholeNumber(values.parent2OtherQualifyingChildren)
          : undefined,
        parent1ChildrenWithAdditionalGrant: parseOptionalWholeNumber(
          values.parent1ChildrenWithAdditionalGrant,
        ),
        parent2ChildrenWithAdditionalGrant: parent2Required
          ? parseOptionalWholeNumber(values.parent2ChildrenWithAdditionalGrant)
          : undefined,
      }
    : undefined;

  return {
    calculationYear,
    educationType: values.educationType || undefined,
    residence: values.residence || undefined,
    familySituation,
    calculationMonth: parseOptionalWholeNumber(values.calculationMonth),
    tuitionDue: values.tuitionDue === "yes",
    standardReferenceYearInput,
    specialCases: values.specialCase === "none" ? [] : [values.specialCase],
  };
}

function formatCurrency(value: number | undefined) {
  if (value === undefined) return "Niet berekend";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number | undefined, suffix = "") {
  if (value === undefined) return "Niet berekend";
  return `${new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`;
}

function statusLabel(result: DuoAdditionalGrantResult) {
  if (result.status === "calculated" && (result.estimatedMonthlyGrant ?? 0) > 0) {
    return "Waarschijnlijk aanvullende beurs";
  }
  if (result.status === "calculated") {
    return "Waarschijnlijk geen aanvullende beurs";
  }
  if (result.status === "special-case") {
    return "Bijzondere DUO-situatie";
  }
  if (result.status === "official-verification-required") {
    return "Officiële controle nodig";
  }
  if (result.status === "unsupported") {
    return "Niet ondersteund";
  }
  return "Aanvullende gegevens nodig";
}

function conclusion(result: DuoAdditionalGrantResult) {
  if (result.status === "calculated" && (result.estimatedMonthlyGrant ?? 0) > 0) {
    return "Op basis van deze gegevens is dit je geschatte aanvullende beurs.";
  }
  if (result.status === "calculated") {
    return "De berekende ouderbijdrage is minstens zo hoog als het maximale maandbedrag. Daardoor komt de schatting uit op €0.";
  }
  if (result.status === "special-case") {
    return "Deze situatie heeft een aparte DUO-beoordeling nodig. De tool gebruikt daarom niet stil de reguliere formule.";
  }
  if (result.status === "official-verification-required") {
    return "De berekening gebruikt een schatting of onzekere input. DUO kan later corrigeren zodra definitieve gegevens bekend zijn.";
  }
  return "Vul eerst de ontbrekende gegevens aan voordat de berekening kan worden gemaakt.";
}

function probablyEligibleLabel(result: DuoAdditionalGrantResult) {
  if (result.status !== "calculated") return "Nog niet verantwoord vast te stellen";
  return (result.estimatedMonthlyGrant ?? 0) > 0 ? "Ja, waarschijnlijk" : "Waarschijnlijk niet";
}

const reasonCodeMessages: Record<string, string> = {
  "duo-additional-grant-calculated": "De reguliere 2026-berekening is uitgevoerd met concrete invoer.",
  "duo-additional-grant-parental-contribution-at-or-above-maximum": "De ouderbijdrage is minstens gelijk aan het maximale maandbedrag.",
  "duo-additional-grant-reference-year-change-not-requested": "Er is geen peiljaarverlegging doorgerekend.",
  "duo-additional-grant-estimated-income-repayment-risk": "Een geschat inkomen kan later tot correctie of terugbetaling leiden.",
  "duo-additional-grant-mbo-no-tuition-due-special-case": "Mbo zonder lesgeldplicht vraagt om aparte DUO-controle.",
  "duo-additional-grant-mbo-period-after-july-special-case": "Mbo-bedragen na juli 2026 zijn in deze publieke tool nog een aparte controle.",
  "duo-additional-grant-calculation-year-unsupported": "Deze tool ondersteunt alleen berekeningsjaar 2026.",
};

function reasonMessage(code: string) {
  if (code.startsWith("duo-additional-grant-special-case-")) {
    return "Er is een bijzondere oudersituatie gekozen; DUO moet dit apart beoordelen.";
  }
  if (code.startsWith("missing-")) {
    return "Er ontbreekt nog invoer voor de berekening.";
  }
  if (code.startsWith("invalid-")) {
    return "Controleer de gemarkeerde ingevulde waarde.";
  }
  return reasonCodeMessages[code] ?? "Bekijk de toelichting bij deze uitkomst.";
}

function sourceLinks(result: DuoAdditionalGrantResult) {
  const seen = new Set<string>();
  return result.sourceReferences
    .filter((source) => source.sourceUrl.startsWith("https://duo.nl/") || source.sourceUrl.startsWith("https://www.duo.nl/"))
    .map((source) => ({
      label: source.label.replace(" - ", ": "),
      href: source.sourceUrl,
    }))
    .filter((source) => {
      if (seen.has(source.href)) return false;
      seen.add(source.href);
      return true;
    });
}

export function createAdditionalGrantView(values: AdditionalGrantFormValues): AdditionalGrantView {
  const errors = validateAdditionalGrantForm(values);
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  const input = mapFormToAdditionalGrantInput(values);
  const result = calculateDuoAdditionalGrant(input);
  const trace = result.standardReferenceYearResult;

  return {
    isValid: true,
    errors,
    input,
    result,
    statusLabel: statusLabel(result),
    conclusion: conclusion(result),
    monthlyGrantLabel: formatCurrency(result.estimatedMonthlyGrant),
    annualGrantLabel: formatCurrency(result.estimatedAnnualGrant),
    probablyEligibleLabel: probablyEligibleLabel(result),
    confidenceLabel: result.confidence === "high" ? "Hoog" : result.confidence === "medium" ? "Middel" : "Laag",
    warningMessages: [
      ...result.limitations,
      ...result.missingInputs.map((item) => item.guidance.explanation),
      ...(result.officialVerificationRequired ? ["DUO blijft leidend voor aanvraag, beschikking en correcties."] : []),
    ],
    assumptionMessages: result.assumptions,
    explanationRows: [
      { label: "Berekeningsjaar", value: String(result.calculationYear) },
      { label: "Standaardpeiljaar ouderinkomen", value: String(result.standardReferenceYear) },
      { label: "Maximale aanvullende beurs per maand", value: formatCurrency(result.appliedMaximumMonthlyGrant) },
      { label: "Berekende ouderbijdrage per maand", value: formatCurrency(trace.parentalMonthlyContribution) },
      { label: "Gezamenlijk ouderinkomen gebruikt", value: formatCurrency(trace.usedJointParentIncome) },
      { label: "Betrouwbaarheid", value: result.confidence === "high" ? "Hoog" : result.confidence === "medium" ? "Middel" : "Laag" },
      {
        label: "Controle door DUO",
        value: result.officialVerificationRequired
          ? "Nodig door onzekere of bijzondere invoer"
          : "DUO stelt het officiële bedrag vast na je aanvraag",
      },
      { label: "Inkomensdaling peiljaarverlegging", value: formatNumber(result.referenceYearComparison.incomeDropPercent, "%") },
    ],
    reasonMessages: result.reasonCodes.map(reasonMessage),
    sourceLinks: sourceLinks(result),
  };
}
