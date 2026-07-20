import { getAllowanceRegulationId } from "@/lib/allowances/adapter";
import type {
  AllowanceKind,
  AllowanceMissingField,
  AllowanceSignalDataset,
} from "@/lib/allowances/signaling";
import {
  getDatasetForDate,
  getDatasetFreshness,
} from "@/lib/financial-constants/source-datasets";
import type { SourceDataset, SourceReference } from "@/lib/financial-constants";
import { createRegulationDefinition } from "@/lib/regulations/definition";
import type {
  RegulationDefinition,
  RegulationFieldDatatype,
  RegulationFieldValidationType,
  RegulationInputDefinition,
  RegulationQuestionDefinition,
} from "@/lib/regulations/definition";
import type { FieldId } from "@/lib/regulations/types";

const dataset = getDatasetForDate("allowance-signal-rules", "2026-07-19", {
  scenario: "general",
}) as SourceDataset<AllowanceSignalDataset>;
const freshnessStatus = getDatasetFreshness(dataset, "2026-07-19").status;

const COMMON_FIELDS: readonly AllowanceMissingField[] = [
  "year",
  "age",
  "partnerStatus",
  "assessmentIncome",
  "jointAssessmentIncome",
  "assets",
  "jointAssets",
];

const FIELDS_BY_ALLOWANCE: Record<AllowanceKind, readonly AllowanceMissingField[]> = {
  healthcare: [
    "age",
    "partnerStatus",
    "assessmentIncome",
    "jointAssessmentIncome",
    "assets",
    "jointAssets",
    "healthcare.hasDutchHealthInsurance",
  ],
  rent: [
    ...COMMON_FIELDS,
    "householdIncome",
    "householdAssets",
    "rent.tenure",
    "rent.independentHome",
    "rent.basicRent",
    "rent.hasCoResidents",
  ],
  "child-budget": [
    ...COMMON_FIELDS,
    "children.hasChildren",
    "children.childAges",
    "children.receivesChildBenefit",
    "children.childLivesWithApplicant",
  ],
  childcare: [
    "year",
    "partnerStatus",
    "children.hasChildren",
    "childcare.usesChildcare",
    "childcare.registeredChildcare",
    "childcare.paysOwnContribution",
    "childcare.childLivesWithApplicant",
    "childcare.applicantHasQualifyingActivity",
    "childcare.partnerHasQualifyingActivity",
    "childcare.hoursPerMonth",
  ],
};

const DATATYPE_BY_FIELD: Partial<Record<AllowanceMissingField, RegulationFieldDatatype>> = {
  year: "number",
  age: "number",
  partnerStatus: "enum",
  assessmentIncome: "currency",
  jointAssessmentIncome: "currency",
  assets: "currency",
  jointAssets: "currency",
  householdIncome: "currency",
  householdAssets: "currency",
  "healthcare.hasDutchHealthInsurance": "boolean",
  "rent.tenure": "enum",
  "rent.independentHome": "boolean",
  "rent.basicRent": "currency",
  "rent.hasCoResidents": "boolean",
  "children.hasChildren": "boolean",
  "children.childAges": "array",
  "children.receivesChildBenefit": "boolean",
  "children.childLivesWithApplicant": "boolean",
  "childcare.usesChildcare": "boolean",
  "childcare.registeredChildcare": "boolean",
  "childcare.paysOwnContribution": "boolean",
  "childcare.childLivesWithApplicant": "boolean",
  "childcare.applicantHasQualifyingActivity": "boolean",
  "childcare.partnerHasQualifyingActivity": "boolean",
  "childcare.hoursPerMonth": "number",
};

function validationType(fieldId: AllowanceMissingField): RegulationFieldValidationType {
  const datatype = DATATYPE_BY_FIELD[fieldId];
  if (datatype === "currency") return "currency";
  if (datatype === "number") return fieldId === "year" || fieldId === "age" ? "integer" : "non-negative-number";
  if (datatype === "enum") return "enum";

  return "none";
}

function sourceReference(label: string, sourceUrl: string): SourceReference {
  return {
    label,
    sourceName: dataset.meta.sourceName,
    sourceUrl,
    sourceType: dataset.meta.sourceType,
    referenceDate: dataset.meta.lastVerifiedAt,
    year: dataset.meta.year,
    effectiveFrom: dataset.meta.effectiveFrom,
    effectiveTo: dataset.meta.effectiveTo,
    methodology: dataset.meta.methodology,
    methodologyType: dataset.meta.methodologyType,
    freshnessStatus,
    datasetId: dataset.meta.id,
    version: dataset.meta.version,
  };
}

function sourceReferencesFor(kind: AllowanceKind): readonly SourceReference[] {
  const data = dataset.data;
  if (kind === "healthcare") {
    return [
      sourceReference("Zorgtoeslag voorwaarden", data.healthcare.informationUrl),
      sourceReference("Zorgtoeslag inkomensgrenzen", data.healthcare.incomeUrl),
      sourceReference("Officiele proefberekening", data.healthcare.officialCalculationUrl),
      sourceReference("Toeslag aanvragen", data.healthcare.applicationUrl),
    ];
  }
  if (kind === "rent") {
    return [
      sourceReference("Huurtoeslag voorwaarden", data.rent.informationUrl),
      sourceReference("Huurtoeslag 2026 wijzigingen", data.rent.changes2026Url),
      sourceReference("Huurtoeslag vermogen", data.rent.assetsUrl),
      sourceReference("Huurtoeslag medebewoners", data.rent.coResidentUrl),
      sourceReference("Officiele proefberekening", data.rent.officialCalculationUrl),
      sourceReference("Toeslag aanvragen", data.rent.applicationUrl),
    ];
  }
  if (kind === "child-budget") {
    return [
      sourceReference("Kindgebonden budget voorwaarden", data.childBudget.informationUrl),
      sourceReference("Kindgebonden budget vermogen", data.childBudget.assetsUrl),
      sourceReference("Kindgebonden budget inkomen", data.childBudget.incomeUrl),
      sourceReference("Officiele proefberekening", data.childBudget.officialCalculationUrl),
      sourceReference("Toeslag aanvragen", data.childBudget.applicationUrl),
    ];
  }

  return [
    sourceReference("Kinderopvangtoeslag voorwaarden", data.childcare.informationUrl),
    sourceReference("Kinderopvangtoeslag aanvragen", data.childcare.applicationUrl),
    sourceReference("Maximaal uurtarief kinderopvang", data.childcare.maxHourlyRateUrl),
    sourceReference("Toeslagen 2026 wijzigingen", data.childcare.changes2026Url),
    sourceReference("Officiele proefberekening", data.childcare.officialCalculationUrl),
  ];
}

function isRequired(fieldId: AllowanceMissingField) {
  return ![
    "year",
    "jointAssessmentIncome",
    "jointAssets",
    "householdIncome",
    "householdAssets",
    "childcare.partnerHasQualifyingActivity",
  ].includes(fieldId);
}

function inputDefinition(fieldId: AllowanceMissingField): RegulationInputDefinition {
  const supportsInference = fieldId === "children.hasChildren" || fieldId === "childcare.partnerHasQualifyingActivity";

  return {
    fieldId,
    datatype: DATATYPE_BY_FIELD[fieldId] ?? "string",
    required: isRequired(fieldId),
    optional: !isRequired(fieldId),
    nullable: true,
    supportsUnknown: true,
    supportsInference,
    validationType: validationType(fieldId),
    explanationCode: `allowance.field.${fieldId}.explanation`,
    unknownStrategy: {
      allowed: true,
      inferable: supportsInference,
      officialSourceAvailable: true,
      confidenceImpact: isRequired(fieldId) ? -15 : -5,
      followUpPossible: true,
      reasonCodes: [`allowance.unknown.${fieldId}`],
    },
    inference: supportsInference
      ? {
          inferable: true,
          preferredSources: fieldId === "children.hasChildren" ? ["children.childAges"] : ["partnerStatus"],
          overwritePolicy: "allow-with-warning",
          confidenceModifier: -5,
          reasonCodes: [`allowance.inference.${fieldId}`],
        }
      : {
          inferable: false,
          preferredSources: [],
          overwritePolicy: "not-applicable",
          confidenceModifier: 0,
          reasonCodes: [`allowance.no-inference.${fieldId}`],
        },
  };
}

function questionDefinition(fieldId: AllowanceMissingField): RegulationQuestionDefinition {
  return {
    questionId: `allowance.question.${fieldId}`,
    fieldId,
    titleKey: `allowance.question.${fieldId}.title`,
    descriptionKey: `allowance.question.${fieldId}.description`,
    dependsOn: [],
    requiredWhen: isRequired(fieldId) ? "always" : "when-condition-true",
    confidenceImpact: isRequired(fieldId) ? 10 : 5,
    evidenceContribution: [`allowance.evidence.${fieldId}`],
  };
}

function defineAllowance(kind: AllowanceKind): RegulationDefinition {
  const references = sourceReferencesFor(kind);
  const result = createRegulationDefinition({
    regulationId: getAllowanceRegulationId(kind),
    displayName: `allowance.${kind}.displayName`,
    shortDescription: `allowance.${kind}.shortDescription`,
    category: "allowance",
    domain: "allowances",
    sourceReferences: references,
    sourceYear: dataset.data.year,
    validFrom: dataset.meta.effectiveFrom,
    validUntil: dataset.meta.effectiveTo,
    reviewPolicy: {
      cadence: "annual",
      nextReviewAt: dataset.meta.nextReviewAt,
      reasonCodes: ["allowance-source-annual-review"],
    },
    inputDefinitions: FIELDS_BY_ALLOWANCE[kind].map(inputDefinition),
    questionDefinitions: FIELDS_BY_ALLOWANCE[kind].map(questionDefinition),
    evidenceStrategy: {
      expectedRuleIds: [`${getAllowanceRegulationId(kind)}.signal-only`],
      expectedSourceReferenceIds: references.map((reference) => reference.datasetId),
      requiredInputFields: FIELDS_BY_ALLOWANCE[kind] as readonly FieldId[],
      reasonCodes: ["allowance-signal-evidence-required"],
    },
    recommendationStrategy: {
      enabled: true,
      expectedActionTypes: ["collect-data", "verify-officially", "run-project-tool", "review-later"],
      reasonCodes: ["allowance-signal-recommendation-policy"],
    },
    estimateStrategy: {
      supported: false,
      estimateType: "signal-only",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["allowance-estimate-not-implemented"],
    },
    adapter: {
      adapterId: "allowance-regulations-adapter",
      adapterVersion: "0.1.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: ["toeslagen-scan"],
    },
  });

  if (!result.ok) {
    throw new Error(`Ongeldige allowance definition ${kind}: ${result.errors.join(", ")}`);
  }

  return result.value;
}

export const ALLOWANCE_REGULATION_DEFINITIONS = {
  healthcare: defineAllowance("healthcare"),
  rent: defineAllowance("rent"),
  "child-budget": defineAllowance("child-budget"),
  childcare: defineAllowance("childcare"),
} as const satisfies Record<AllowanceKind, RegulationDefinition>;

export function getAllowanceRegulationDefinition(kind: AllowanceKind): RegulationDefinition {
  return ALLOWANCE_REGULATION_DEFINITIONS[kind];
}
