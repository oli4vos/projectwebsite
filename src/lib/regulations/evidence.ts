import type { SourceReference } from "@/lib/financial-constants";
import type { CalculationEvidence, ReasonCode } from "@/lib/regulations/types";

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function sourceKey(reference: SourceReference) {
  return `${reference.datasetId}:${reference.version}:${reference.sourceUrl}`;
}

function uniqueSources(references: readonly SourceReference[]) {
  const seen = new Set<string>();

  return references.filter((reference) => {
    const key = sourceKey(reference);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function minDate(values: readonly (string | undefined)[]) {
  return values.filter(Boolean).sort()[0];
}

function maxDate(values: readonly (string | undefined)[]) {
  return values.filter(Boolean).sort().at(-1);
}

export function mergeCalculationEvidence(
  entries: readonly CalculationEvidence[],
): CalculationEvidence {
  return {
    usedRuleIds: unique(entries.flatMap((entry) => entry.usedRuleIds)),
    sourceReferences: uniqueSources(entries.flatMap((entry) => entry.sourceReferences)),
    inputFieldIds: unique(entries.flatMap((entry) => entry.inputFieldIds)),
    inferredValueIds: unique(entries.flatMap((entry) => entry.inferredValueIds)),
    assumptions: unique(entries.flatMap((entry) => entry.assumptions)),
    excludedRuleIds: unique(entries.flatMap((entry) => entry.excludedRuleIds)),
    missingFieldIds: unique(entries.flatMap((entry) => entry.missingFieldIds)),
    confidenceFactorIds: unique(entries.flatMap((entry) => entry.confidenceFactorIds)),
    uncertaintyCodes: unique(entries.flatMap((entry) => entry.uncertaintyCodes as readonly ReasonCode[])),
    validity: {
      effectiveFrom: minDate(entries.map((entry) => entry.validity.effectiveFrom)),
      effectiveTo: maxDate(entries.map((entry) => entry.validity.effectiveTo)),
      referenceDate: maxDate(entries.map((entry) => entry.validity.referenceDate)),
    },
  };
}
