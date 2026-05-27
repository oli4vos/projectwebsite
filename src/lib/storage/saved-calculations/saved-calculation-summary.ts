import type { SavedCalculation } from "@/lib/storage/saved-calculations/saved-calculation.types";

export type SavedCalculationSummary = {
  primary: string;
  details: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
}

function getTopRecommendationLabel(result: unknown) {
  if (!isRecord(result)) {
    return undefined;
  }

  const topRecommendation = result.topRecommendation;
  if (isRecord(topRecommendation)) {
    return getNestedString(topRecommendation, "label");
  }

  return undefined;
}

function countArray(value: unknown) {
  return Array.isArray(value) ? value.length : undefined;
}

export function summarizeSavedCalculation(
  calculation: SavedCalculation,
): SavedCalculationSummary {
  const result = isRecord(calculation.result) ? calculation.result : undefined;
  const input = isRecord(calculation.input) ? calculation.input : undefined;
  const topRecommendation = getTopRecommendationLabel(calculation.result);
  const priorityCount = result ? countArray(result.priorityPlan) : undefined;
  const missingCount = result ? countArray(result.missingDataSummary) : undefined;
  const inputCount = input ? Object.keys(input).length : 0;
  const details = [
    `${inputCount} invoerveld${inputCount === 1 ? "" : "en"} opgeslagen`,
  ];

  if (priorityCount !== undefined) {
    details.push(`${priorityCount} stap${priorityCount === 1 ? "" : "pen"} in de volgorde`);
  }

  if (missingCount !== undefined && missingCount > 0) {
    details.push(`${missingCount} onderdeel${missingCount === 1 ? "" : "en"} met ontbrekende gegevens`);
  }

  return {
    primary: topRecommendation
      ? `Hoofdroute: ${topRecommendation}`
      : "Opgeslagen scenario-snapshot",
    details,
  };
}
