import type { SourceReference } from "@/lib/financial-constants";
import type {
  FieldId,
  QuestionCondition,
  QuestionId,
  ReasonCode,
  RegulationId,
  Result,
  ToolId,
} from "@/lib/regulations/types";

export type RegulationCategory =
  | "allowance"
  | "loan"
  | "tax"
  | "housing"
  | "education"
  | "family"
  | "other";

export type RegulationDomain =
  | "allowances"
  | "duo"
  | "mortgage"
  | "tax"
  | "family-financing"
  | "municipal"
  | "generic";

export type RegulationReviewPolicy = {
  readonly cadence: "annual" | "quarterly" | "monthly" | "event-driven" | "manual";
  readonly nextReviewAt?: string;
  readonly reasonCodes: readonly ReasonCode[];
};

export type RegulationFieldDatatype =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "currency"
  | "percentage"
  | "array";

export type RegulationFieldValidationType =
  | "none"
  | "non-negative-number"
  | "positive-number"
  | "integer"
  | "currency"
  | "percentage"
  | "date"
  | "enum";

export type RegulationUnknownStrategy = {
  readonly allowed: boolean;
  readonly inferable: boolean;
  readonly officialSourceAvailable: boolean;
  readonly confidenceImpact: number;
  readonly followUpPossible: boolean;
  readonly reasonCodes: readonly ReasonCode[];
  readonly alternativeQuestions?: readonly RegulationAlternativeQuestionDefinition[];
  readonly skipAllowed?: boolean;
  readonly confirmationRequired?: boolean;
};

export type RegulationAlternativeQuestionDefinition = {
  readonly routeId: string;
  readonly questionId: QuestionId;
  readonly fieldId?: FieldId;
  readonly labelKey: string;
  readonly descriptionKey?: string;
  readonly priority: number;
  readonly blocking: boolean;
  readonly confirmationRequired: boolean;
  readonly reasonCodes: readonly ReasonCode[];
};

export type RegulationInferenceMetadata = {
  readonly inferable: boolean;
  readonly preferredSources: readonly string[];
  readonly overwritePolicy: "always-allow" | "allow-with-warning" | "locked" | "not-applicable";
  readonly confidenceModifier: number;
  readonly reasonCodes: readonly ReasonCode[];
};

export type RegulationInputDefinition = {
  readonly fieldId: FieldId;
  readonly datatype: RegulationFieldDatatype;
  readonly required: boolean;
  readonly optional: boolean;
  readonly nullable: boolean;
  readonly supportsUnknown: boolean;
  readonly supportsInference: boolean;
  readonly validationType: RegulationFieldValidationType;
  readonly explanationCode: ReasonCode;
  readonly unknownStrategy?: RegulationUnknownStrategy;
  readonly inference?: RegulationInferenceMetadata;
};

export type RegulationQuestionDefinition = {
  readonly questionId: QuestionId;
  readonly fieldId: FieldId;
  readonly groupId?: string;
  readonly groupLabel?: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly dependsOn: readonly FieldId[];
  readonly condition?: QuestionCondition;
  readonly requiredWhen: "always" | "when-condition-true" | "never";
  readonly confidenceImpact: number;
  readonly evidenceContribution: readonly ReasonCode[];
};

export type RegulationEvidenceStrategy = {
  readonly expectedRuleIds: readonly string[];
  readonly expectedSourceReferenceIds: readonly string[];
  readonly requiredInputFields: readonly FieldId[];
  readonly reasonCodes: readonly ReasonCode[];
};

export type RegulationRecommendationStrategy = {
  readonly enabled: boolean;
  readonly expectedActionTypes: readonly string[];
  readonly reasonCodes: readonly ReasonCode[];
};

export type RegulationEstimateStrategy = {
  readonly supported: boolean;
  readonly estimateType: "none" | "signal-only" | "amount-range" | "percentage-range" | "custom";
  readonly confidenceRequired: boolean;
  readonly officialVerificationRequired: boolean;
  readonly reasonCodes: readonly ReasonCode[];
};

export type RegulationAdapterMetadata = {
  readonly adapterId: string;
  readonly adapterVersion: string;
  readonly supportedResultVersion: string;
  readonly relatedTools: readonly ToolId[];
};

export type RegulationDefinitionMetadata = {
  readonly regulationId: RegulationId;
  readonly displayName: string;
  readonly shortDescription: string;
  readonly category: RegulationCategory;
  readonly domain: RegulationDomain;
  readonly sourceReferences: readonly SourceReference[];
  readonly sourceYear: number;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly reviewPolicy: RegulationReviewPolicy;
};

export type RegulationDefinition = RegulationDefinitionMetadata & {
  readonly inputDefinitions: readonly RegulationInputDefinition[];
  readonly questionDefinitions: readonly RegulationQuestionDefinition[];
  readonly evidenceStrategy: RegulationEvidenceStrategy;
  readonly recommendationStrategy: RegulationRecommendationStrategy;
  readonly estimateStrategy: RegulationEstimateStrategy;
  readonly adapter: RegulationAdapterMetadata;
};

function isNonEmptyString(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function findDuplicates(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates].sort();
}

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

export function createRegulationDefinition(
  definition: RegulationDefinition,
): Result<RegulationDefinition> {
  const duplicateFieldIds = findDuplicates(
    definition.inputDefinitions.map((field) => field.fieldId),
  );
  const duplicateQuestionIds = findDuplicates(
    definition.questionDefinitions.map((question) => question.questionId),
  );

  const errors = [
    !isNonEmptyString(definition.regulationId) ? "missing-regulation-id" : undefined,
    !isNonEmptyString(definition.displayName) ? "missing-display-name" : undefined,
    !isNonEmptyString(definition.shortDescription) ? "missing-short-description" : undefined,
    !Number.isInteger(definition.sourceYear) ? "missing-source-year" : undefined,
    !isNonEmptyString(definition.validFrom) ? "missing-valid-from" : undefined,
    definition.sourceReferences.length === 0 ? "missing-source-references" : undefined,
    definition.inputDefinitions.length === 0 ? "missing-input-definitions" : undefined,
    definition.questionDefinitions.length === 0 ? "missing-question-definitions" : undefined,
    duplicateFieldIds.length > 0 ? "duplicate-field-ids" : undefined,
    duplicateQuestionIds.length > 0 ? "duplicate-question-ids" : undefined,
    !isNonEmptyString(definition.adapter.adapterId) ? "missing-adapter-id" : undefined,
    !isNonEmptyString(definition.adapter.adapterVersion) ? "missing-adapter-version" : undefined,
    !isNonEmptyString(definition.adapter.supportedResultVersion)
      ? "missing-supported-result-version"
      : undefined,
  ].filter(Boolean) as ReasonCode[];

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: deepFreeze(structuredClone(definition)) };
}
