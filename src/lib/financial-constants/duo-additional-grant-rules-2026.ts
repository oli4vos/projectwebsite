export type DuoAdditionalGrantEducationType = "mbo-1-2" | "mbo-3-4" | "hbo" | "university";
export type DuoAdditionalGrantResidence = "living-at-home" | "living-away";

export type DuoAdditionalGrantSourceValue = {
  readonly regulationId: string;
  readonly calculationYear: 2026;
  readonly validFrom: string;
  readonly validUntil: string;
  readonly educationType?: DuoAdditionalGrantEducationType | "hbo-university" | "mbo";
  readonly residence?: DuoAdditionalGrantResidence | "both";
  readonly value: number | string | boolean;
  readonly unit: "eur-per-month" | "eur-per-year" | "eur" | "percent" | "year" | "month" | "boolean" | "text";
  readonly officialSourceTitle: string;
  readonly officialSourceUrl: string;
  readonly retrievedAt: string;
  readonly legalBasis: string;
  readonly verificationStatus: "verified" | "requires-calculation-guardian-review";
  readonly sourceSection: string;
  readonly explanation: string;
};

export type DuoAdditionalGrantRules2026 = {
  readonly year: 2026;
  readonly ruleVersion: string;
  readonly status: "prepared-source-specification";
  readonly officialApplicationUrl: string;
  readonly officialCalculatorUrl: string;
  readonly supportedMvpScope: readonly string[];
  readonly specialCases: readonly string[];
  readonly referenceYear: {
    readonly calculationYear: DuoAdditionalGrantSourceValue;
    readonly standardReferenceYear: DuoAdditionalGrantSourceValue;
    readonly incomeConcepts: readonly DuoAdditionalGrantSourceValue[];
    readonly estimatedIncomeCorrection: DuoAdditionalGrantSourceValue;
  };
  readonly referenceYearChange: {
    readonly minimumIncomeDropPercent: DuoAdditionalGrantSourceValue;
    readonly allowedAlternativeYearsWhenReferenceYear2024: readonly DuoAdditionalGrantSourceValue[];
    readonly applicant: DuoAdditionalGrantSourceValue;
    readonly calculationBase: DuoAdditionalGrantSourceValue;
    readonly repaymentRisk: DuoAdditionalGrantSourceValue;
  };
  readonly amounts: {
    readonly mbo: {
      readonly maximumLivingAtHome: DuoAdditionalGrantSourceValue;
      readonly maximumLivingAway: DuoAdditionalGrantSourceValue;
      readonly lowerAmountWithoutTuitionDue: DuoAdditionalGrantSourceValue;
      readonly parentalContributionTaperPercent: DuoAdditionalGrantSourceValue;
      readonly parentalStudentDebtDeductionFactor: DuoAdditionalGrantSourceValue;
      readonly parentFreeFootSingleParent: DuoAdditionalGrantSourceValue;
      readonly parentFreeFootOtherParentDiedOrIgnored: DuoAdditionalGrantSourceValue;
      readonly parentFreeFootTwoParentsPerParent: DuoAdditionalGrantSourceValue;
    };
    readonly hboUniversity: {
      readonly maximum: DuoAdditionalGrantSourceValue;
      readonly maximumGrantParentIncomeThreshold: DuoAdditionalGrantSourceValue;
      readonly parentalContributionTaperPercent: DuoAdditionalGrantSourceValue;
      readonly parentalStudentDebtDeductionFactor: DuoAdditionalGrantSourceValue;
      readonly parentFreeFootSingleParent: DuoAdditionalGrantSourceValue;
      readonly parentFreeFootOtherParentDiedOrIgnored: DuoAdditionalGrantSourceValue;
      readonly parentFreeFootTwoParentsPerParent: DuoAdditionalGrantSourceValue;
    };
  };
  readonly typedInputContract: readonly {
    readonly fieldId: string;
    readonly type: string;
    readonly required: boolean;
    readonly unknownRoute: string;
    readonly sourceHint: string;
  }[];
  readonly typedResultContract: {
    readonly statuses: readonly string[];
    readonly amountFields: readonly string[];
    readonly referenceYearFields: readonly string[];
    readonly traceFields: readonly string[];
  };
  readonly testVectors: readonly {
    readonly id: string;
    readonly description: string;
    readonly input: Readonly<Record<string, number | string | boolean>>;
    readonly expected: Readonly<Record<string, number | string | boolean>>;
    readonly sourceRuleIds: readonly string[];
  }[];
  readonly blockers: readonly string[];
};

const validFrom = "2026-01-01";
const validUntil = "2026-12-31";
const retrievedAt = "2026-07-20";
const duoAmountsUrl = "https://www.duo.nl/particulier/studiefinanciering/bedragen.jsp";
const duoAdditionalGrantAmountUrl = "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/hoeveel-is-het.jsp";
const duoParentIncomeUrl = "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/inkomen-ouders.jsp";
const duoMboCalculationPdfUrl = "https://duo.nl/images/folder-berekening-aanvullende-beurs-mbo-2026.pdf";
const duoHboUniversityCalculationPdfUrl = "https://duo.nl/images/folder-berekening-aanvullende-beurs-hbo-universiteit-2026.pdf";

function value(input: Omit<DuoAdditionalGrantSourceValue, "calculationYear" | "validFrom" | "validUntil" | "retrievedAt">): DuoAdditionalGrantSourceValue {
  return {
    calculationYear: 2026,
    validFrom,
    validUntil,
    retrievedAt,
    ...input,
  };
}

export const DUO_ADDITIONAL_GRANT_RULES_2026: DuoAdditionalGrantRules2026 = {
  year: 2026,
  ruleVersion: "0.1.0",
  status: "prepared-source-specification",
  officialApplicationUrl: "https://duo.nl/particulier/studiefinanciering/aanvragen.jsp",
  officialCalculatorUrl: "https://duo.nl/particulier/rekenhulpen/rekenhulp-studiefinanciering.jsp",
  supportedMvpScope: [
    "mbo bol-student met bekende opleidingstype en woonsituatie",
    "hbo- of wo-student met bekende ouderinkomens in standaardpeiljaar",
    "een of twee bekende ouders zonder buitenlands inkomen of buitenbeschouwingstelling",
    "indicatieve peiljaarvergelijking op basis van gezamenlijk inkomen en 15 procent daling",
  ],
  specialCases: [
    "ouder overleden",
    "ouder onbekend of buiten beschouwing laten",
    "ouder in het buitenland of buitenlands inkomen",
    "geen contact of ernstig conflict met ouder",
    "gescheiden ouders met onduidelijke inkomensgegevens",
    "ouders met DUO-studieschuld",
    "broers/zussen met aanvullende beurs of andere schoolgaande kinderen",
    "inkomen is nog een schatting",
    "mbo-student zonder lesgeldplicht",
  ],
  referenceYear: {
    calculationYear: value({
      regulationId: "duo.additional-grant.calculation-year.2026",
      value: 2026,
      unit: "year",
      officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
      officialSourceUrl: duoParentIncomeUrl,
      legalBasis: "Wet studiefinanciering 2000 en DUO-uitvoeringsinformatie aanvullende beurs.",
      verificationStatus: "verified",
      sourceSection: "Peiljaar",
      explanation: "De scan is bedoeld voor aanvullende beurs in kalenderjaar 2026.",
    }),
    standardReferenceYear: value({
      regulationId: "duo.additional-grant.standard-reference-year.2026",
      value: 2024,
      unit: "year",
      officialSourceTitle: "Hoeveel is het? - Aanvullende beurs",
      officialSourceUrl: duoAdditionalGrantAmountUrl,
      legalBasis: "DUO gebruikt voor 2026 het ouderinkomen van 2024.",
      verificationStatus: "verified",
      sourceSection: "Aanvullende beurs hbo en universiteit",
      explanation: "Voor aanvullende beurs in 2026 kijkt DUO in beginsel naar ouderinkomen uit 2024.",
    }),
    incomeConcepts: [
      value({
        regulationId: "duo.additional-grant.parent-income-concept-aggregate-income.2026",
        value: "verzamelinkomen",
        unit: "text",
        officialSourceTitle: "Rekenhulp studiefinanciering",
        officialSourceUrl: "https://duo.nl/particulier/rekenhulpen/rekenhulp-studiefinanciering.jsp",
        legalBasis: "DUO vraagt verzamelinkomen of belastbaar loon voor de aanvullende beurs.",
        verificationStatus: "verified",
        sourceSection: "Benodigde gegevens aanvullende beurs",
        explanation: "Als de ouder aangifte inkomstenbelasting doet, is het verzamelinkomen leidend.",
      }),
      value({
        regulationId: "duo.additional-grant.parent-income-concept-taxable-wage.2026",
        value: "belastbaar loon",
        unit: "text",
        officialSourceTitle: "Rekenhulp studiefinanciering",
        officialSourceUrl: "https://duo.nl/particulier/rekenhulpen/rekenhulp-studiefinanciering.jsp",
        legalBasis: "DUO vraagt verzamelinkomen of belastbaar loon voor de aanvullende beurs.",
        verificationStatus: "verified",
        sourceSection: "Benodigde gegevens aanvullende beurs",
        explanation: "Als geen verzamelinkomen beschikbaar is, kan belastbaar loon nodig zijn.",
      }),
    ],
    estimatedIncomeCorrection: value({
      regulationId: "duo.additional-grant.estimated-income-correction.2026",
      value: true,
      unit: "boolean",
      officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
      officialSourceUrl: duoParentIncomeUrl,
      legalBasis: "DUO past later met terugwerkende kracht aan wanneer het definitieve inkomen van de Belastingdienst bekend wordt.",
      verificationStatus: "verified",
      sourceSection: "Inkomen nog niet bekend",
      explanation: "Een te lage inkomensschatting kan later tot terugbetaling leiden.",
    }),
  },
  referenceYearChange: {
    minimumIncomeDropPercent: value({
      regulationId: "duo.additional-grant.reference-year-change.minimum-income-drop.2026",
      value: 15,
      unit: "percent",
      officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
      officialSourceUrl: duoParentIncomeUrl,
      legalBasis: "Voor verlegging peiljaar moet het gezamenlijk inkomen minstens 15 procent zijn gedaald.",
      verificationStatus: "verified",
      sourceSection: "Voorwaarden verlegging peiljaar",
      explanation: "Bij standaardpeiljaar 2024 kan DUO naar 2025 of 2026 kijken als gezamenlijk ouderinkomen minimaal 15 procent lager is.",
    }),
    allowedAlternativeYearsWhenReferenceYear2024: [
      value({
        regulationId: "duo.additional-grant.reference-year-change.alternative-year-2025.2026",
        value: 2025,
        unit: "year",
        officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
        officialSourceUrl: duoParentIncomeUrl,
        legalBasis: "Als peiljaar 2024 is, kan het verlegd worden naar 2025 of 2026.",
        verificationStatus: "verified",
        sourceSection: "Peiljaar verleggen",
        explanation: "Alternatief peiljaar 2025 is mogelijk wanneer de inkomensdaling voldoet.",
      }),
      value({
        regulationId: "duo.additional-grant.reference-year-change.alternative-year-2026.2026",
        value: 2026,
        unit: "year",
        officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
        officialSourceUrl: duoParentIncomeUrl,
        legalBasis: "Als peiljaar 2024 is, kan het verlegd worden naar 2025 of 2026.",
        verificationStatus: "verified",
        sourceSection: "Peiljaar verleggen",
        explanation: "Alternatief peiljaar 2026 is mogelijk wanneer de inkomensdaling voldoet.",
      }),
    ],
    applicant: value({
      regulationId: "duo.additional-grant.reference-year-change.applicant.2026",
      value: "parents-apply-in-mijn-duo",
      unit: "text",
      officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
      officialSourceUrl: duoParentIncomeUrl,
      legalBasis: "Volgens DUO kunnen ouders verlegging peiljaar aanvragen in Mijn DUO.",
      verificationStatus: "verified",
      sourceSection: "Aanvragen verlegging peiljaar",
      explanation: "De student kan signaleren, maar de ouder(s) vragen de verlegging aan.",
    }),
    calculationBase: value({
      regulationId: "duo.additional-grant.reference-year-change.calculation-base.2026",
      value: "joint-parent-income",
      unit: "text",
      officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
      officialSourceUrl: duoParentIncomeUrl,
      legalBasis: "DUO noemt voor mbo, hbo en universiteit het gezamenlijk inkomen als toets voor de 15 procent daling.",
      verificationStatus: "verified",
      sourceSection: "Voorwaarden verlegging peiljaar",
      explanation: "De MVP vergelijkt standaard gezamenlijk ouderinkomen; bijzondere eenouder- of buitenbeschouwinggevallen krijgen special-case.",
    }),
    repaymentRisk: value({
      regulationId: "duo.additional-grant.reference-year-change.repayment-risk.2026",
      value: true,
      unit: "boolean",
      officialSourceTitle: "Inkomen ouders - Aanvullende beurs",
      officialSourceUrl: duoParentIncomeUrl,
      legalBasis: "DUO neemt met terugwerkende kracht een nieuwe beslissing wanneer het definitieve inkomen bekend is.",
      verificationStatus: "verified",
      sourceSection: "Inkomen nog niet bekend",
      explanation: "Bij te lage schatting kan te veel ontvangen aanvullende beurs moeten worden terugbetaald.",
    }),
  },
  amounts: {
    mbo: {
      maximumLivingAtHome: value({
        regulationId: "duo.additional-grant.mbo.maximum-living-at-home.2026",
        educationType: "mbo",
        residence: "living-at-home",
        value: 438.08,
        unit: "eur-per-month",
        officialSourceTitle: "Hoeveel is het? - Aanvullende beurs",
        officialSourceUrl: duoAdditionalGrantAmountUrl,
        legalBasis: "DUO bedragen aanvullende beurs mbo januari tot en met juli 2026.",
        verificationStatus: "verified",
        sourceSection: "Aanvullende beurs mbo, januari tot en met juli 2026",
        explanation: "Maximale aanvullende beurs voor thuiswonende mbo-student volgens DUO-publiekstabel.",
      }),
      maximumLivingAway: value({
        regulationId: "duo.additional-grant.mbo.maximum-living-away.2026",
        educationType: "mbo",
        residence: "living-away",
        value: 466.40,
        unit: "eur-per-month",
        officialSourceTitle: "Hoeveel is het? - Aanvullende beurs",
        officialSourceUrl: duoAdditionalGrantAmountUrl,
        legalBasis: "DUO bedragen aanvullende beurs mbo januari tot en met juli 2026.",
        verificationStatus: "verified",
        sourceSection: "Aanvullende beurs mbo, januari tot en met juli 2026",
        explanation: "Maximale aanvullende beurs voor uitwonende mbo-student volgens DUO-publiekstabel.",
      }),
      lowerAmountWithoutTuitionDue: value({
        regulationId: "duo.additional-grant.mbo.no-tuition-deduction.2026",
        educationType: "mbo",
        residence: "both",
        value: 125.92,
        unit: "eur-per-month",
        officialSourceTitle: "Bedragen - Studiefinanciering",
        officialSourceUrl: duoAmountsUrl,
        legalBasis: "DUO vermeldt lagere aanvullende beurs wanneer nog geen lesgeld hoeft te worden betaald.",
        verificationStatus: "verified",
        sourceSection: "Studiefinanciering mbo",
        explanation: "Als de student nog geen lesgeld betaalt, is de aanvullende beurs dit bedrag lager.",
      }),
      parentalContributionTaperPercent: value({
        regulationId: "duo.additional-grant.mbo.parental-contribution-taper.2026",
        educationType: "mbo",
        value: 26,
        unit: "percent",
        officialSourceTitle: "Folder berekening aanvullende beurs mbo 2026",
        officialSourceUrl: duoMboCalculationPdfUrl,
        legalBasis: "Interactieve DUO-berekeningsfolder 2026 gebruikt factor 0,26 voor ouderbijdrage over meerinkomen.",
        verificationStatus: "verified",
        sourceSection: "PDF-formulierlogica: `* 0.26`",
        explanation: "Officiele PDF-bron; de factor is gevalideerd voor de centrale reguliere 2026-berekening.",
      }),
      parentalStudentDebtDeductionFactor: value({
        regulationId: "duo.additional-grant.parental-student-debt-deduction-factor.2026",
        value: 363,
        unit: "eur-per-year",
        officialSourceTitle: "Folder berekening aanvullende beurs mbo 2026",
        officialSourceUrl: duoMboCalculationPdfUrl,
        legalBasis: "Interactieve DUO-berekeningsfolder 2026 gebruikt factor 363 bij DUO-terugbetaling ouder.",
        verificationStatus: "verified",
        sourceSection: "PDF-formulierlogica: `* 363`",
        explanation: "Geldt als aftrekpost per ander kwalificerend kind in de ouderbijdrageberekening.",
      }),
      parentFreeFootSingleParent: value({
        regulationId: "duo.additional-grant.mbo.parent-free-foot-single-parent.2026",
        value: 29_333.26,
        unit: "eur",
        officialSourceTitle: "Folder berekening aanvullende beurs mbo 2026",
        officialSourceUrl: duoMboCalculationPdfUrl,
        legalBasis: "Officiele DUO-berekeningsfolder mbo 2026.",
        verificationStatus: "verified",
        sourceSection: "PDF-keuzeveld Situatie ouder: Alleenstaande ouder",
        explanation: "Vrijgesteld bedrag voor reguliere alleenstaande-ouderberekening.",
      }),
      parentFreeFootOtherParentDiedOrIgnored: value({
        regulationId: "duo.additional-grant.mbo.parent-free-foot-other-parent-died-or-ignored.2026",
        value: 46_305.40,
        unit: "eur",
        officialSourceTitle: "Folder berekening aanvullende beurs mbo 2026",
        officialSourceUrl: duoMboCalculationPdfUrl,
        legalBasis: "Officiele DUO-berekeningsfolder mbo 2026.",
        verificationStatus: "verified",
        sourceSection: "PDF-keuzeveld Situatie ouder: andere ouder overleden / inkomen andere ouder telt niet mee",
        explanation: "Vrijstelling/bedrag uit interactieve PDF voor special-case situaties.",
      }),
      parentFreeFootTwoParentsPerParent: value({
        regulationId: "duo.additional-grant.mbo.parent-free-foot-two-parents-per-parent.2026",
        value: 23_152.70,
        unit: "eur",
        officialSourceTitle: "Folder berekening aanvullende beurs mbo 2026",
        officialSourceUrl: duoMboCalculationPdfUrl,
        legalBasis: "Officiele DUO-berekeningsfolder mbo 2026.",
        verificationStatus: "verified",
        sourceSection: "PDF-keuzeveld Situatie ouder: geen van bovengenoemde situaties",
        explanation: "Bedrag per ouder in tweouderberekening; niet hetzelfde als gezamenlijke maximale-beurs-inkomensgrens.",
      }),
    },
    hboUniversity: {
      maximum: value({
        regulationId: "duo.additional-grant.hbo-university.maximum.2026",
        educationType: "hbo-university",
        residence: "both",
        value: 491.08,
        unit: "eur-per-month",
        officialSourceTitle: "Hoeveel is het? - Aanvullende beurs",
        officialSourceUrl: duoAdditionalGrantAmountUrl,
        legalBasis: "DUO bedragen aanvullende beurs hbo en universiteit januari tot en met december 2026.",
        verificationStatus: "verified",
        sourceSection: "Aanvullende beurs hbo en universiteit",
        explanation: "Maximale aanvullende beurs hbo/wo is onafhankelijk van thuis- of uitwonend voor dit onderdeel.",
      }),
      maximumGrantParentIncomeThreshold: value({
        regulationId: "duo.additional-grant.hbo-university.maximum-parent-income-threshold.2026",
        educationType: "hbo-university",
        value: 41_500.60,
        unit: "eur",
        officialSourceTitle: "Hoeveel is het? - Aanvullende beurs",
        officialSourceUrl: duoAdditionalGrantAmountUrl,
        legalBasis: "DUO vermeldt dat bij ouderinkomen samen minder dan EUR 41.500,60 per jaar de maximale aanvullende beurs geldt.",
        verificationStatus: "verified",
        sourceSection: "Aanvullende beurs hbo en universiteit",
        explanation: "Grens voor maximale aanvullende beurs; hogere inkomens kunnen nog gedeeltelijke beurs geven.",
      }),
      parentalContributionTaperPercent: value({
        regulationId: "duo.additional-grant.hbo-university.parental-contribution-taper.2026",
        educationType: "hbo-university",
        value: 13.6,
        unit: "percent",
        officialSourceTitle: "Folder berekening aanvullende beurs hbo universiteit 2026",
        officialSourceUrl: duoHboUniversityCalculationPdfUrl,
        legalBasis: "Interactieve DUO-berekeningsfolder 2026 gebruikt factor 0,136 voor ouderbijdrage over meerinkomen.",
        verificationStatus: "verified",
        sourceSection: "PDF-formulierlogica: `* 0.136`",
        explanation: "Officiele PDF-bron; de factor is gevalideerd voor de centrale reguliere 2026-berekening.",
      }),
      parentalStudentDebtDeductionFactor: value({
        regulationId: "duo.additional-grant.parental-student-debt-deduction-factor.2026",
        value: 363,
        unit: "eur-per-year",
        officialSourceTitle: "Folder berekening aanvullende beurs hbo universiteit 2026",
        officialSourceUrl: duoHboUniversityCalculationPdfUrl,
        legalBasis: "Interactieve DUO-berekeningsfolder 2026 gebruikt factor 363 bij DUO-terugbetaling ouder.",
        verificationStatus: "verified",
        sourceSection: "PDF-formulierlogica: `* 363`",
        explanation: "Geldt als aftrekpost per ander kwalificerend kind in de ouderbijdrageberekening.",
      }),
      parentFreeFootSingleParent: value({
        regulationId: "duo.additional-grant.hbo-university.parent-free-foot-single-parent.2026",
        value: 26_289.28,
        unit: "eur",
        officialSourceTitle: "Folder berekening aanvullende beurs hbo universiteit 2026",
        officialSourceUrl: duoHboUniversityCalculationPdfUrl,
        legalBasis: "Officiele DUO-berekeningsfolder hbo/universiteit 2026.",
        verificationStatus: "verified",
        sourceSection: "PDF-keuzeveld Situatie ouder: Alleenstaande ouder",
        explanation: "Vrijgesteld bedrag voor reguliere alleenstaande-ouderberekening.",
      }),
      parentFreeFootOtherParentDiedOrIgnored: value({
        regulationId: "duo.additional-grant.hbo-university.parent-free-foot-other-parent-died-or-ignored.2026",
        value: 41_500.60,
        unit: "eur",
        officialSourceTitle: "Folder berekening aanvullende beurs hbo universiteit 2026",
        officialSourceUrl: duoHboUniversityCalculationPdfUrl,
        legalBasis: "Officiele DUO-berekeningsfolder hbo/universiteit 2026.",
        verificationStatus: "verified",
        sourceSection: "PDF-keuzeveld Situatie ouder: andere ouder overleden / inkomen andere ouder telt niet mee",
        explanation: "Vrijstelling/bedrag uit interactieve PDF voor special-case situaties.",
      }),
      parentFreeFootTwoParentsPerParent: value({
        regulationId: "duo.additional-grant.hbo-university.parent-free-foot-two-parents-per-parent.2026",
        value: 20_750.30,
        unit: "eur",
        officialSourceTitle: "Folder berekening aanvullende beurs hbo universiteit 2026",
        officialSourceUrl: duoHboUniversityCalculationPdfUrl,
        legalBasis: "Officiele DUO-berekeningsfolder hbo/universiteit 2026.",
        verificationStatus: "verified",
        sourceSection: "PDF-keuzeveld Situatie ouder: geen van bovengenoemde situaties",
        explanation: "Bedrag per ouder in tweouderberekening; gezamenlijke maximale-beursgrens is EUR 41.500,60.",
      }),
    },
  },
  typedInputContract: [
    { fieldId: "calculationYear", type: "number", required: true, unknownRoute: "default-2026-only-in-mvp", sourceHint: "Toolcontext" },
    { fieldId: "educationType", type: "mbo-1-2|mbo-3-4|hbo|university", required: true, unknownRoute: "ask-school-and-level", sourceHint: "Inschrijving opleiding / Mijn DUO" },
    { fieldId: "residence", type: "living-at-home|living-away", required: true, unknownRoute: "ask-registration-and-actual-living-situation", sourceHint: "BRP/adres en Mijn DUO woonsituatie" },
    { fieldId: "parent1ReferenceYearIncome", type: "currency", required: true, unknownRoute: "ask-tax-return-or-income-statement", sourceHint: "Aangifte inkomstenbelasting 2024 of jaaropgave" },
    { fieldId: "parent2ReferenceYearIncome", type: "currency|null", required: false, unknownRoute: "ask-parent-status-special-case", sourceHint: "Aangifte inkomstenbelasting 2024 of jaaropgave" },
    { fieldId: "parent1AlternativeYearIncome", type: "currency", required: false, unknownRoute: "ask-estimate-and-risk-warning", sourceHint: "Jaaropgave 2025/2026, loonstrook, uitkeringsspecificatie of ondernemersschatting" },
    { fieldId: "parent2AlternativeYearIncome", type: "currency|null", required: false, unknownRoute: "ask-estimate-and-risk-warning", sourceHint: "Jaaropgave 2025/2026, loonstrook, uitkeringsspecificatie of ondernemersschatting" },
    { fieldId: "alternativeReferenceYear", type: "2025|2026", required: false, unknownRoute: "suggest-lower-known-year-first", sourceHint: "DUO peiljaarverlegging" },
    { fieldId: "siblings", type: "array", required: false, unknownRoute: "ask-count-and-study-status", sourceHint: "Gezinssituatie ouders" },
    { fieldId: "parentSpecialSituation", type: "enum", required: false, unknownRoute: "route-to-special-case", sourceHint: "DUO situaties ouder onbekend/overleden/buitenland/contactproblemen" },
  ],
  typedResultContract: {
    statuses: ["eligible-estimate", "possibly-eligible", "ineligible", "incomplete", "special-case", "unavailable"],
    amountFields: ["estimatedMonthlyGrant", "estimatedAnnualGrant", "standardReferenceYearAmount", "alternativeReferenceYearAmount", "estimatedMonthlyBenefit", "estimatedAnnualBenefit", "extraBorrowingIfNoGrant"],
    referenceYearFields: ["standardReferenceYear", "alternativeReferenceYear", "incomeDropPerParent", "incomeDropPercent", "referenceYearChangeLikelihood", "referenceYearChangeReason"],
    traceFields: ["decisiveInputs", "inferredInputs", "missingInputs", "reasonCodes", "calculationTrace", "confidence", "sourceReferences", "officialVerificationRequired", "studentNextSteps", "parentNextSteps"],
  },
  testVectors: [
    {
      id: "hbo-wo-maximum-parent-income-threshold",
      description: "Hbo/wo-student krijgt bij gezamenlijk ouderinkomen onder EUR 41.500,60 maximaal bedrag als geen special cases spelen.",
      input: { educationType: "hbo", parentIncome2024: 41_500, residence: "living-at-home" },
      expected: { status: "eligible-estimate", monthlyGrantLikely: 491.08, sourceYear: 2026 },
      sourceRuleIds: ["duo.additional-grant.hbo-university.maximum-parent-income-threshold.2026", "duo.additional-grant.hbo-university.maximum.2026"],
    },
    {
      id: "mbo-living-away-maximum",
      description: "Mbo-student uitwonend gebruikt hoger maximaal mbo-bedrag.",
      input: { educationType: "mbo-3-4", residence: "living-away", parentIncome2024: 0 },
      expected: { status: "eligible-estimate", monthlyGrantLikely: 466.40, performanceGrant: true },
      sourceRuleIds: ["duo.additional-grant.mbo.maximum-living-away.2026"],
    },
    {
      id: "mbo-without-tuition-due-deduction",
      description: "Mbo-bedrag is lager als student nog geen lesgeld hoeft te betalen.",
      input: { educationType: "mbo-1-2", residence: "living-at-home", tuitionDue: false, parentIncome2024: 0 },
      expected: { monthlyGrantLikely: 312.16, noTuitionDeduction: 125.92 },
      sourceRuleIds: ["duo.additional-grant.mbo.maximum-living-at-home.2026", "duo.additional-grant.mbo.no-tuition-deduction.2026"],
    },
    {
      id: "reference-year-change-drop-below-threshold",
      description: "Gezamenlijke inkomensdaling onder 15 procent is waarschijnlijk onvoldoende voor peiljaarverlegging.",
      input: { parentIncome2024: 50_000, alternativeParentIncome: 43_000, alternativeReferenceYear: 2025 },
      expected: { incomeDropPercent: 14, referenceYearChangeLikelihood: "unlikely" },
      sourceRuleIds: ["duo.additional-grant.reference-year-change.minimum-income-drop.2026"],
    },
    {
      id: "reference-year-change-drop-on-threshold",
      description: "Gezamenlijke inkomensdaling van 15 procent haalt de DUO-drempel.",
      input: { parentIncome2024: 50_000, alternativeParentIncome: 42_500, alternativeReferenceYear: 2025 },
      expected: { incomeDropPercent: 15, referenceYearChangeLikelihood: "possible" },
      sourceRuleIds: ["duo.additional-grant.reference-year-change.minimum-income-drop.2026"],
    },
    {
      id: "parent-deceased-special-case",
      description: "Overleden ouder gebruikt special-case contract en mag niet stil als tweouderberekening worden behandeld.",
      input: { educationType: "university", parent1Income2024: 25_000, parent2Status: "deceased" },
      expected: { status: "special-case", officialVerificationRequired: true },
      sourceRuleIds: ["duo.additional-grant.hbo-university.parent-free-foot-other-parent-died-or-ignored.2026"],
    },
  ],
  blockers: [
    "PDF-formulierlogica moet door de Calculation Guardian worden vertaald naar expliciete pure formules met veldsemantiek, afronding en tests.",
    "Broer-/zusfactoren en ouders met andere schoolgaande kinderen zijn bronbaar, maar nog niet volledig als machineleesbare formule uitgewerkt.",
    "Ouder buiten Nederland, geen contact/conflict, ouder buiten beschouwing en overleden ouder blijven special-case tot DUO-procesregels volledig zijn gemodelleerd.",
    "Mbo-bedragen na juli 2026 en lesgeldperioden moeten voor publieke bedragen extra tegen DUO-bedragenpagina worden gecontroleerd.",
  ],
};
