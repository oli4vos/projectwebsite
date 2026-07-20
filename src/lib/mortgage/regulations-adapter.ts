import {
  getDatasetForDate,
  getDatasetFreshness,
} from "@/lib/financial-constants/source-datasets";
import type {
  SourceDataset,
  SourceReference,
} from "@/lib/financial-constants/types";
import type {
  MortgageMaxMortgageInput,
  MortgageMaxMortgageResult,
} from "@/lib/mortgage/types";
import { createRegulationDefinition } from "@/lib/regulations/definition";
import type {
  RegulationDefinition,
  RegulationFieldDatatype,
  RegulationFieldValidationType,
} from "@/lib/regulations/definition";
import { createUnavailableEstimateResult } from "@/lib/regulations/estimate-engine";
import type {
  EstimateResult,
  EstimateSource,
  EstimateStrategy,
} from "@/lib/regulations/estimate-engine";
import { evaluateRegulation } from "@/lib/regulations/evaluator";
import {
  buildRecommendations,
  mergeRecommendations,
} from "@/lib/regulations/recommendations";
import type { RecommendationResult } from "@/lib/regulations/recommendations";
import {
  resolveRegulationInputs,
} from "@/lib/regulations/unknown";
import type {
  UnknownResolution,
} from "@/lib/regulations/unknown";
import type {
  ActionPlanItem,
  AnswerState,
  CalculationEvidence,
  ConfidenceAssessment,
  FieldId,
  Recommendation,
  RegulationEvaluationResult,
  RegulationId,
  Result,
} from "@/lib/regulations/types";

export type MortgageRegulationToolId =
  | "artifact-hypotheek-wonen-maximale-hypotheek"
  | "hypotheek-impact-studieschuld"
  | "familiehulp-eerste-woning";

export type MortgageRegulationFieldId =
  | "grossAnnualHouseholdIncome"
  | "grossAnnualPartnerIncome"
  | "annualMortgageRate"
  | "fixedRatePeriodMonths"
  | "mortgageTermYears"
  | "purchasePrice"
  | "marketValue"
  | "ownFunds"
  | "monthlyDebtPayments"
  | "hasStudentLoan"
  | "studentLoanStatus"
  | "studentLoanActualMonthlyPayment"
  | "studentLoanStatutoryMonthlyPayment"
  | "nhgRequested"
  | "energyLabel"
  | "energySavingMeasuresAmount"
  | "renovationAmount"
  | "afmStressAnnualRate";

export type MortgageRegulationMigrationInventory = {
  readonly activeMortgageTools: readonly MortgageRegulationToolId[];
  readonly hiddenOrDraftMortgageToolPatterns: readonly string[];
  readonly sharedInputFields: readonly MortgageRegulationFieldId[];
  readonly sharedQuestionGroups: readonly string[];
  readonly sharedDependencies: readonly string[];
  readonly sharedUnknowns: readonly MortgageRegulationFieldId[];
  readonly sharedRecommendations: readonly string[];
  readonly sharedReportingCapabilities: readonly string[];
  readonly toolSpecificRemaining: readonly string[];
};

export type MortgageRegulationAdapterInput = {
  readonly toolId: MortgageRegulationToolId;
  readonly mortgageInput: MortgageMaxMortgageInput;
  readonly result?: MortgageMaxMortgageResult;
  readonly referenceDate?: string;
};

export type MortgageRegulationAssessment = {
  readonly toolId: MortgageRegulationToolId;
  readonly regulationId: RegulationId;
  readonly definition: RegulationDefinition;
  readonly answers: Readonly<Record<FieldId, AnswerState>>;
  readonly unknownResolutions: readonly UnknownResolution[];
  readonly blockingUnknowns: readonly UnknownResolution[];
  readonly evaluation: RegulationEvaluationResult;
  readonly recommendations: readonly RecommendationResult[];
  readonly estimate: EstimateResult;
  readonly actionPlan: readonly ActionPlanItem[];
  readonly evidence: CalculationEvidence;
  readonly sourceReferences: readonly SourceReference[];
  readonly sourceYear: number;
  readonly reporting: {
    readonly available: boolean;
    readonly source: "mortgage-pdf-report-viewmodel";
    readonly reasonCodes: readonly string[];
  };
};

const SOURCE_REFERENCE_DATE = "2026-07-20";
const DEFAULT_NORM_YEAR = 2026;
const REGULATION_ID: RegulationId = "mortgage.max-borrowing-power.integration";
const RELATED_TOOLS: readonly MortgageRegulationToolId[] = [
  "artifact-hypotheek-wonen-maximale-hypotheek",
  "hypotheek-impact-studieschuld",
  "familiehulp-eerste-woning",
];

export const MORTGAGE_REGULATION_MIGRATION_INVENTORY: MortgageRegulationMigrationInventory = {
  activeMortgageTools: RELATED_TOOLS,
  hiddenOrDraftMortgageToolPatterns: [
    "apps/artifact-hypotheek-wonen-*",
    "apps/private-lease-impact-hypotheek",
    "apps/hypotheek-aflossen-vs-beleggen",
    "apps/hypotheekrenteaftrek-afschaffen",
    "apps/koop-vs-huur",
    "apps/annuitair-lineair",
  ],
  sharedInputFields: [
    "grossAnnualHouseholdIncome",
    "grossAnnualPartnerIncome",
    "annualMortgageRate",
    "fixedRatePeriodMonths",
    "mortgageTermYears",
    "purchasePrice",
    "marketValue",
    "ownFunds",
    "monthlyDebtPayments",
    "hasStudentLoan",
    "studentLoanStatus",
    "studentLoanActualMonthlyPayment",
    "studentLoanStatutoryMonthlyPayment",
    "nhgRequested",
    "energyLabel",
    "energySavingMeasuresAmount",
    "renovationAmount",
    "afmStressAnnualRate",
  ],
  sharedQuestionGroups: [
    "income",
    "mortgage-terms",
    "property",
    "student-loan",
    "other-obligations",
    "nhg-energy-own-funds",
  ],
  sharedDependencies: [
    "partner income is optional and relevant only when present",
    "student loan payment fields depend on hasStudentLoan and repayment status",
    "property collateral questions depend on purchase or market value",
    "AFM stress rate is relevant when the fixed-rate period is shorter than 10 years",
    "energy saving and renovation fields are optional collateral modifiers",
  ],
  sharedUnknowns: [
    "grossAnnualHouseholdIncome",
    "annualMortgageRate",
    "fixedRatePeriodMonths",
    "mortgageTermYears",
    "purchasePrice",
    "marketValue",
    "studentLoanActualMonthlyPayment",
    "studentLoanStatutoryMonthlyPayment",
  ],
  sharedRecommendations: [
    "collect-data",
    "verify-officially",
    "run-project-tool",
    "review-later",
    "monitor-year-change",
  ],
  sharedReportingCapabilities: [
    "same MortgageMaxMortgageInput and MortgageMaxMortgageResult can feed buildMortgagePdfReport",
    "source references can be mapped from central mortgage source datasets",
    "warnings and assumptions can be exposed as evaluation evidence without recalculation",
  ],
  toolSpecificRemaining: [
    "React form state and validation stays in each app for now",
    "hypotheek-impact-studieschuld keeps DUO-specific payment and debt portfolio mapping",
    "familiehulp-eerste-woning keeps family loan, gift and own-money scenario orchestration",
    "hidden artifact calculators keep their current generic runtime until separately activated or migrated",
    "PDF rendering stays in the existing mortgage report layer",
  ],
};

const FIELD_METADATA: Record<
  MortgageRegulationFieldId,
  {
    readonly datatype: RegulationFieldDatatype;
    readonly validationType: RegulationFieldValidationType;
    readonly required: boolean;
    readonly groupId: string;
    readonly groupLabel: string;
  }
> = {
  grossAnnualHouseholdIncome: {
    datatype: "currency",
    validationType: "currency",
    required: true,
    groupId: "income",
    groupLabel: "Inkomen",
  },
  grossAnnualPartnerIncome: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "income",
    groupLabel: "Inkomen",
  },
  annualMortgageRate: {
    datatype: "percentage",
    validationType: "percentage",
    required: true,
    groupId: "mortgage-terms",
    groupLabel: "Hypotheekvoorwaarden",
  },
  fixedRatePeriodMonths: {
    datatype: "number",
    validationType: "integer",
    required: true,
    groupId: "mortgage-terms",
    groupLabel: "Hypotheekvoorwaarden",
  },
  mortgageTermYears: {
    datatype: "number",
    validationType: "positive-number",
    required: true,
    groupId: "mortgage-terms",
    groupLabel: "Hypotheekvoorwaarden",
  },
  purchasePrice: {
    datatype: "currency",
    validationType: "currency",
    required: true,
    groupId: "property",
    groupLabel: "Woning",
  },
  marketValue: {
    datatype: "currency",
    validationType: "currency",
    required: true,
    groupId: "property",
    groupLabel: "Woning",
  },
  ownFunds: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "nhg-energy-own-funds",
    groupLabel: "NHG, energie en eigen geld",
  },
  monthlyDebtPayments: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "other-obligations",
    groupLabel: "Andere verplichtingen",
  },
  hasStudentLoan: {
    datatype: "boolean",
    validationType: "none",
    required: false,
    groupId: "student-loan",
    groupLabel: "Studieschuld",
  },
  studentLoanStatus: {
    datatype: "enum",
    validationType: "enum",
    required: false,
    groupId: "student-loan",
    groupLabel: "Studieschuld",
  },
  studentLoanActualMonthlyPayment: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "student-loan",
    groupLabel: "Studieschuld",
  },
  studentLoanStatutoryMonthlyPayment: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "student-loan",
    groupLabel: "Studieschuld",
  },
  nhgRequested: {
    datatype: "boolean",
    validationType: "none",
    required: false,
    groupId: "nhg-energy-own-funds",
    groupLabel: "NHG, energie en eigen geld",
  },
  energyLabel: {
    datatype: "enum",
    validationType: "enum",
    required: false,
    groupId: "nhg-energy-own-funds",
    groupLabel: "NHG, energie en eigen geld",
  },
  energySavingMeasuresAmount: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "nhg-energy-own-funds",
    groupLabel: "NHG, energie en eigen geld",
  },
  renovationAmount: {
    datatype: "currency",
    validationType: "currency",
    required: false,
    groupId: "nhg-energy-own-funds",
    groupLabel: "NHG, energie en eigen geld",
  },
  afmStressAnnualRate: {
    datatype: "percentage",
    validationType: "percentage",
    required: false,
    groupId: "mortgage-terms",
    groupLabel: "Hypotheekvoorwaarden",
  },
};

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return value;
}

function sourceReference(dataset: SourceDataset, label: string): SourceReference {
  const freshness = getDatasetFreshness(dataset, SOURCE_REFERENCE_DATE);

  return {
    label,
    sourceName: dataset.meta.sourceName,
    sourceUrl: dataset.meta.sourceUrl,
    sourceType: dataset.meta.sourceType,
    referenceDate: dataset.meta.lastVerifiedAt,
    year: dataset.meta.year,
    effectiveFrom: dataset.meta.effectiveFrom,
    effectiveTo: dataset.meta.effectiveTo,
    methodology: dataset.meta.methodology,
    methodologyType: dataset.meta.methodologyType,
    freshnessStatus: freshness.status,
    warning: freshness.message,
    datasetId: dataset.meta.id,
    version: dataset.meta.version,
  };
}

function mortgageSourceReferences(): readonly SourceReference[] {
  const financingLoad = getDatasetForDate("mortgage-financing-load", "2026-07-20", {
    scenario: "before-and-from-aow",
  });
  const nhg = getDatasetForDate("mortgage-nhg", "2026-07-20", {
    scenario: "standard-and-energy-measures",
  });
  const ltv = getDatasetForDate("mortgage-ltv", "2026-07-20", {
    scenario: "base-and-energy-saving-measures",
  });
  const energy = getDatasetForDate("mortgage-energy-loan-space", "2026-07-20", {
    scenario: "income-space-by-energy-label",
  });
  const afm = getDatasetForDate("mortgage-afm-test-rate", "2026-07-20", {
    scenario: "short-fixed-rate-2026-q3",
  });

  return [
    sourceReference(financingLoad, "Financieringslastpercentages hypotheeknormen"),
    sourceReference(nhg, "NHG grens en borgtochtprovisie"),
    sourceReference(ltv, "Loan-to-value regels"),
    sourceReference(energy, "Energielabel en energiebesparende maatregelen"),
    sourceReference(afm, "AFM toetsrente kortere rentevaste periode"),
  ];
}

function inputDefinition(fieldId: MortgageRegulationFieldId) {
  const field = FIELD_METADATA[fieldId];

  return {
    fieldId,
    datatype: field.datatype,
    required: field.required,
    optional: !field.required,
    nullable: true,
    supportsUnknown: true,
    supportsInference: fieldId === "marketValue",
    validationType: field.validationType,
    explanationCode: `mortgage.field.${fieldId}.explanation`,
    unknownStrategy: {
      allowed: !field.required,
      inferable: fieldId === "marketValue",
      officialSourceAvailable: field.required,
      confidenceImpact: field.required ? -20 : -5,
      followUpPossible: true,
      reasonCodes: [`mortgage.unknown.${fieldId}`],
    },
    inference: {
      inferable: fieldId === "marketValue",
      preferredSources: fieldId === "marketValue" ? ["purchasePrice"] : [],
      overwritePolicy: fieldId === "marketValue" ? "allow-with-warning" : "not-applicable",
      confidenceModifier: fieldId === "marketValue" ? -5 : 0,
      reasonCodes: [
        fieldId === "marketValue"
          ? "mortgage.inference.market-value-from-purchase-price"
          : `mortgage.no-inference.${fieldId}`,
      ],
    },
  } as const;
}

function questionDefinition(fieldId: MortgageRegulationFieldId, order: number) {
  const field = FIELD_METADATA[fieldId];

  return {
    questionId: `mortgage.question.${fieldId}`,
    fieldId,
    groupId: field.groupId,
    groupLabel: field.groupLabel,
    titleKey: `mortgage.question.${fieldId}.title`,
    descriptionKey: `mortgage.question.${fieldId}.description`,
    dependsOn: [],
    condition: conditionFor(fieldId),
    requiredWhen: field.required ? "always" : "when-condition-true",
    confidenceImpact: Math.max(1, 18 - order),
    evidenceContribution: [`mortgage.evidence.${fieldId}`],
  } as const;
}

function conditionFor(fieldId: MortgageRegulationFieldId) {
  if (fieldId === "studentLoanStatus") {
    return { type: "equals" as const, fieldId: "hasStudentLoan", value: true };
  }
  if (fieldId === "studentLoanActualMonthlyPayment") {
    return {
      type: "all" as const,
      conditions: [
        { type: "equals" as const, fieldId: "hasStudentLoan", value: true },
        { type: "equals" as const, fieldId: "studentLoanStatus", value: "repaying" },
      ],
    };
  }
  if (fieldId === "studentLoanStatutoryMonthlyPayment") {
    return {
      type: "all" as const,
      conditions: [
        { type: "equals" as const, fieldId: "hasStudentLoan", value: true },
        { type: "not-equals" as const, fieldId: "studentLoanStatus", value: "repaying" },
      ],
    };
  }
  if (fieldId === "afmStressAnnualRate") {
    return {
      type: "all" as const,
      conditions: [
        { type: "known" as const, fieldId: "fixedRatePeriodMonths" },
        { type: "not-equals" as const, fieldId: "fixedRatePeriodMonths", value: 120 },
      ],
    };
  }

  return undefined;
}

function createMortgageRegulationDefinition(): RegulationDefinition {
  const sourceReferences = mortgageSourceReferences();
  const fieldIds = MORTGAGE_REGULATION_MIGRATION_INVENTORY.sharedInputFields;
  const definition = createRegulationDefinition({
    regulationId: REGULATION_ID,
    displayName: "mortgage.maxBorrowingPower.displayName",
    shortDescription: "mortgage.maxBorrowingPower.shortDescription",
    category: "housing",
    domain: "mortgage",
    sourceReferences,
    sourceYear: DEFAULT_NORM_YEAR,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    reviewPolicy: {
      cadence: "annual",
      nextReviewAt: "2026-11-15",
      reasonCodes: ["mortgage-source-annual-review"],
    },
    inputDefinitions: fieldIds.map(inputDefinition),
    questionDefinitions: fieldIds.map(questionDefinition),
    evidenceStrategy: {
      expectedRuleIds: [
        "mortgage.max-borrowing-power.existing-domain-result",
        "mortgage.max-borrowing-power.no-calculation-change",
      ],
      expectedSourceReferenceIds: sourceReferences.map((reference) => reference.datasetId),
      requiredInputFields: [
        "grossAnnualHouseholdIncome",
        "annualMortgageRate",
        "fixedRatePeriodMonths",
        "mortgageTermYears",
        "purchasePrice",
        "marketValue",
      ],
      reasonCodes: ["mortgage-evidence-required"],
    },
    recommendationStrategy: {
      enabled: true,
      expectedActionTypes: [
        "collect-data",
        "verify-officially",
        "run-project-tool",
        "review-later",
        "monitor-year-change",
      ],
      reasonCodes: ["mortgage-recommendation-policy"],
    },
    estimateStrategy: {
      supported: false,
      estimateType: "signal-only",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["mortgage-estimate-adapter-only"],
    },
    adapter: {
      adapterId: "mortgage-regulations-adapter",
      adapterVersion: "0.1.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: RELATED_TOOLS,
    },
  });

  if (!definition.ok) {
    throw new Error(`Ongeldige mortgage regulation definition: ${definition.errors.join(", ")}`);
  }

  return definition.value;
}

export const MORTGAGE_REGULATION_DEFINITION = createMortgageRegulationDefinition();

function known<T>(fieldId: FieldId, value: T): AnswerState<T> {
  return { state: "known", fieldId, value, source: "adapter" };
}

function unknown(fieldId: FieldId, reasonCodes: readonly string[]): AnswerState {
  return { state: "unknown", fieldId, reasonCodes };
}

function notApplicable(fieldId: FieldId, reasonCodes: readonly string[]): AnswerState {
  return { state: "not-applicable", fieldId, reasonCodes };
}

function hasPositiveNumber(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

function hasKnownNumber(value: number | undefined) {
  return value !== undefined && Number.isFinite(value);
}

function answerForField(
  input: MortgageMaxMortgageInput,
  fieldId: MortgageRegulationFieldId,
): AnswerState | undefined {
  const property = input.property;
  const hasStudentLoan = Boolean(input.studentLoan?.hasStudentLoan);
  const studentLoanStatus = input.studentLoan?.status ?? "repaying";

  switch (fieldId) {
    case "grossAnnualHouseholdIncome":
      return hasPositiveNumber(input.grossAnnualHouseholdIncome)
        ? known(fieldId, input.grossAnnualHouseholdIncome)
        : unknown(fieldId, ["mortgage.unknown.grossAnnualHouseholdIncome"]);
    case "grossAnnualPartnerIncome":
      return hasKnownNumber(input.grossAnnualPartnerIncome)
        ? known(fieldId, input.grossAnnualPartnerIncome)
        : undefined;
    case "annualMortgageRate":
      return hasKnownNumber(input.annualMortgageRate)
        ? known(fieldId, input.annualMortgageRate)
        : unknown(fieldId, ["mortgage.unknown.annualMortgageRate"]);
    case "fixedRatePeriodMonths":
      return hasPositiveNumber(input.fixedRatePeriodMonths)
        ? known(fieldId, input.fixedRatePeriodMonths)
        : unknown(fieldId, ["mortgage.unknown.fixedRatePeriodMonths"]);
    case "mortgageTermYears":
      return hasPositiveNumber(input.mortgageTermYears)
        ? known(fieldId, input.mortgageTermYears)
        : unknown(fieldId, ["mortgage.unknown.mortgageTermYears"]);
    case "purchasePrice":
      return hasPositiveNumber(property?.purchasePrice)
        ? known(fieldId, property?.purchasePrice)
        : unknown(fieldId, ["mortgage.unknown.purchasePrice"]);
    case "marketValue":
      return hasPositiveNumber(property?.marketValue)
        ? known(fieldId, property?.marketValue)
        : unknown(fieldId, ["mortgage.unknown.marketValue"]);
    case "ownFunds":
      return hasKnownNumber(input.ownFunds) ? known(fieldId, input.ownFunds) : undefined;
    case "monthlyDebtPayments":
      return hasKnownNumber(input.monthlyDebtPayments)
        ? known(fieldId, input.monthlyDebtPayments)
        : undefined;
    case "hasStudentLoan":
      return known(fieldId, hasStudentLoan);
    case "studentLoanStatus":
      return hasStudentLoan
        ? known(fieldId, studentLoanStatus)
        : notApplicable(fieldId, ["mortgage.not-applicable.no-student-loan"]);
    case "studentLoanActualMonthlyPayment":
      if (!hasStudentLoan || studentLoanStatus !== "repaying") {
        return notApplicable(fieldId, ["mortgage.not-applicable.no-current-student-loan-payment"]);
      }
      return hasPositiveNumber(input.studentLoan?.actualMonthlyPayment)
        ? known(fieldId, input.studentLoan?.actualMonthlyPayment)
        : unknown(fieldId, ["mortgage.unknown.studentLoanActualMonthlyPayment"]);
    case "studentLoanStatutoryMonthlyPayment":
      if (!hasStudentLoan || studentLoanStatus === "repaying") {
        return notApplicable(fieldId, ["mortgage.not-applicable.no-statutory-student-loan-payment"]);
      }
      return hasPositiveNumber(input.studentLoan?.statutoryMonthlyPayment)
        ? known(fieldId, input.studentLoan?.statutoryMonthlyPayment)
        : unknown(fieldId, ["mortgage.unknown.studentLoanStatutoryMonthlyPayment"]);
    case "nhgRequested":
      return known(fieldId, Boolean(property?.nhgRequested));
    case "energyLabel":
      return property?.energyLabel ? known(fieldId, property.energyLabel) : undefined;
    case "energySavingMeasuresAmount":
      return hasKnownNumber(property?.energySavingMeasuresAmount)
        ? known(fieldId, property?.energySavingMeasuresAmount)
        : undefined;
    case "renovationAmount":
      return hasKnownNumber(property?.renovationAmount)
        ? known(fieldId, property?.renovationAmount)
        : undefined;
    case "afmStressAnnualRate":
      return hasKnownNumber(input.afmStressAnnualRate)
        ? known(fieldId, input.afmStressAnnualRate)
        : undefined;
  }
}

export function mapMortgageInputToRegulationAnswers(
  input: MortgageMaxMortgageInput,
): Readonly<Record<FieldId, AnswerState>> {
  const answers: Record<FieldId, AnswerState> = {};

  for (const fieldId of MORTGAGE_REGULATION_MIGRATION_INVENTORY.sharedInputFields) {
    const answer = answerForField(input, fieldId);
    if (answer) {
      answers[fieldId] = answer;
    }
  }

  return deepFreeze(answers);
}

function confidenceFromResult(
  result: MortgageMaxMortgageResult | undefined,
  missingFields: readonly FieldId[],
): ConfidenceAssessment {
  const baseScore = result?.confidence === "high" ? 82 : result?.confidence === "medium" ? 62 : 42;
  const score = Math.max(0, Math.min(100, baseScore - missingFields.length * 3));

  return {
    score,
    label: score >= 75 ? "high" : score >= 50 ? "medium" : score >= 25 ? "low" : "very-low",
    factors: missingFields.map((fieldId) => ({
      factorId: `mortgage.missing.${fieldId}`,
      impact: -3,
      reasonCode: `mortgage.unknown.${fieldId}`,
      fieldId,
    })),
    missingFields,
    uncertaintyCodes: [
      "mortgage-regulations-adapter-no-calculation-change",
      ...(result?.warnings.map((warning) => warning.code) ?? []),
    ],
    explanationCodes: [
      "mortgage-confidence-from-existing-result",
      "mortgage-regulations-adapter-thin-wrapper",
    ],
  };
}

function evaluationStatus(result: MortgageMaxMortgageResult | undefined) {
  if (!result) {
    return {
      status: "insufficient-data" as const,
      signal: "insufficient-information" as const,
    };
  }
  if (result.warnings.some((warning) => warning.severity === "blocking")) {
    return {
      status: "insufficient-data" as const,
      signal: "insufficient-information" as const,
    };
  }

  return {
    status: "official-verification-required" as const,
    signal: "official-check-needed" as const,
  };
}

function buildEvidence(input: {
  definition: RegulationDefinition;
  answers: Readonly<Record<FieldId, AnswerState>>;
  missingFields: readonly FieldId[];
  result?: MortgageMaxMortgageResult;
}): CalculationEvidence {
  return {
    usedRuleIds: [
      "mortgage.max-borrowing-power.existing-domain-result",
      "mortgage.max-borrowing-power.no-calculation-change",
      ...(input.result?.warnings.map((warning) => `mortgage.warning.${warning.code}`) ?? []),
    ],
    sourceReferences: input.definition.sourceReferences,
    inputFieldIds: Object.keys(input.answers),
    inferredValueIds: [],
    assumptions: [
      "mortgage-regulations-adapter-only",
      ...(input.result?.assumptions ?? []),
    ],
    excludedRuleIds: [],
    missingFieldIds: input.missingFields,
    confidenceFactorIds: input.missingFields.map((fieldId) => `mortgage.missing.${fieldId}`),
    uncertaintyCodes: [
      "mortgage-official-verification-required",
      ...(input.result?.warnings.map((warning) => warning.code) ?? []),
    ],
    validity: {
      effectiveFrom: input.definition.validFrom,
      effectiveTo: input.definition.validUntil,
      referenceDate: SOURCE_REFERENCE_DATE,
    },
  };
}

function buildEvaluation(input: {
  definition: RegulationDefinition;
  answers: Readonly<Record<FieldId, AnswerState>>;
  missingFields: readonly FieldId[];
  result?: MortgageMaxMortgageResult;
}): RegulationEvaluationResult {
  const confidence = confidenceFromResult(input.result, input.missingFields);
  const status = evaluationStatus(input.result);
  const evidence = buildEvidence({
    definition: input.definition,
    answers: input.answers,
    missingFields: input.missingFields,
    result: input.result,
  });
  const actionPlan: ActionPlanItem[] = [];

  if (input.missingFields.length > 0) {
    actionPlan.push({
      actionId: `${input.definition.regulationId}.collect-missing-data`,
      type: "collect-data",
      priority: 10,
      urgency: "high",
      reasonCodes: input.missingFields.map((fieldId) => `mortgage.unknown.${fieldId}`),
      requiredFieldIds: input.missingFields,
      sourceReferences: input.definition.sourceReferences,
      blocking: true,
    });
  }

  actionPlan.push({
    actionId: `${input.definition.regulationId}.verify-officially`,
    type: "verify-officially",
    priority: 20,
    urgency: "medium",
    reasonCodes: ["mortgage-official-verification-required"],
    requiredFieldIds: [],
    sourceReferences: input.definition.sourceReferences,
    blocking: true,
  });

  actionPlan.push({
    actionId: `${input.definition.regulationId}.run-project-tool`,
    type: "run-project-tool",
    priority: 40,
    urgency: "low",
    reasonCodes: ["mortgage-regulations-adapter-thin-wrapper"],
    requiredFieldIds: [],
    sourceReferences: [],
    target: {
      type: "project-tool",
      targetId: "artifact-hypotheek-wonen-maximale-hypotheek",
    },
    relatedTool: "artifact-hypotheek-wonen-maximale-hypotheek",
    blocking: false,
  });

  const recommendations: Recommendation[] = [{
    recommendationId: `${input.definition.regulationId}.adapter.verify-officially`,
    type: "verify",
    reasonCodes: ["mortgage-official-verification-required"],
    confidence,
    urgency: "medium",
    dependencies: input.missingFields,
    nextSteps: actionPlan.map((action) => action.actionId),
    sourceReferences: input.definition.sourceReferences,
    relatedTools: input.definition.adapter.relatedTools,
  }];

  return {
    regulationId: input.definition.regulationId,
    status: status.status,
    signal: status.signal,
    confidence,
    uncertainties: evidence.uncertaintyCodes.map((code) => ({
      code,
      severity: "info",
      reasonCode: code,
      fieldIds: input.missingFields,
      confidenceImpact: -3,
      estimateRangeImpact: "widen",
      officialVerificationRequired: true,
    })),
    evidence,
    recommendations,
    actionPlan,
    complexity: {
      level: input.result?.warnings.length ? "complex" : "normal",
      reasonCodes: input.result?.warnings.map((warning) => warning.code) ?? [],
      affectedRegulationIds: input.result?.warnings.length ? [input.definition.regulationId] : [],
      affectedRuleIds: input.result?.warnings.map((warning) => `mortgage.warning.${warning.code}`) ?? [],
      confidenceImpact: input.result?.warnings.length ? -5 : 0,
      officialVerificationRecommended: true,
    },
    sourceYear: input.result?.normYear ?? input.definition.sourceYear,
    validity: evidence.validity,
    officialVerification: {
      required: true,
      reasonCodes: ["mortgage-official-verification-required"],
      sourceReferences: input.definition.sourceReferences,
    },
  };
}

function estimateStrategyFor(definition: RegulationDefinition): EstimateStrategy {
  return {
    strategyId: `${definition.regulationId}.adapter-only-estimate`,
    estimateType: "signal-only",
    rangeMergePolicy: "union",
    confidencePolicy: "minimum",
    minimumConfidenceLevel: "low",
    officialVerificationRequired: true,
    reasonCodes: definition.estimateStrategy.reasonCodes,
  };
}

function estimateSourceFor(definition: RegulationDefinition): EstimateSource {
  return {
    sourceId: `${definition.regulationId}.source`,
    sourceType: "adapter",
    sourceReferences: definition.sourceReferences,
    reasonCodes: ["mortgage-existing-domain-result-source"],
    validFrom: definition.validFrom,
    validUntil: definition.validUntil,
  };
}

export function adaptMortgageToRegulationAssessment(
  input: MortgageRegulationAdapterInput,
): Result<MortgageRegulationAssessment> {
  const definition = MORTGAGE_REGULATION_DEFINITION;
  const answers = mapMortgageInputToRegulationAnswers(input.mortgageInput);
  const resolved = resolveRegulationInputs({ definition, answers });
  if (!resolved.ok) {
    return resolved;
  }

  const missingFields = resolved.value.unknownResolutions
    .filter((resolution) => resolution.unknown)
    .map((resolution) => resolution.fieldId);
  const adapterOutput = buildEvaluation({
    definition,
    answers: resolved.value.answers,
    missingFields,
    result: input.result,
  });
  const evaluated = evaluateRegulation(
    { regulationId: definition.regulationId, sourceYear: definition.sourceYear },
    adapterOutput,
    { referenceDate: input.referenceDate ?? SOURCE_REFERENCE_DATE },
  );
  if (!evaluated.ok) {
    return evaluated;
  }

  const recommendations = mergeRecommendations(buildRecommendations({
    definition,
    evaluation: evaluated.value,
    unknownResolutions: resolved.value.unknownResolutions,
    inferences: resolved.value.inferences,
  }));
  const estimate = createUnavailableEstimateResult({
    estimateId: `${definition.regulationId}.estimate`,
    strategy: estimateStrategyFor(definition),
    confidence: evaluated.value.confidence,
    sources: [estimateSourceFor(definition)],
    availability: "signal-only",
    reasonCodes: ["mortgage-estimate-adapter-only"],
    assumptions: evaluated.value.evidence.assumptions,
    warnings: evaluated.value.evidence.uncertaintyCodes,
    officialVerificationRequired: true,
  });
  if (!estimate.ok) {
    return estimate;
  }

  return {
    ok: true,
    value: deepFreeze({
      toolId: input.toolId,
      regulationId: definition.regulationId,
      definition,
      answers: resolved.value.answers,
      unknownResolutions: resolved.value.unknownResolutions,
      blockingUnknowns: resolved.value.blockingUnknowns,
      evaluation: evaluated.value,
      recommendations,
      estimate: estimate.value,
      actionPlan: evaluated.value.actionPlan,
      evidence: evaluated.value.evidence,
      sourceReferences: evaluated.value.evidence.sourceReferences,
      sourceYear: evaluated.value.sourceYear,
      reporting: {
        available: Boolean(input.result),
        source: "mortgage-pdf-report-viewmodel",
        reasonCodes: ["mortgage-reporting-existing-viewmodel"],
      },
    }),
  };
}
