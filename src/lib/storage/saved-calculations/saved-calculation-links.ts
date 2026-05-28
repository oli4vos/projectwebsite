import type { SavedCalculationId } from "@/lib/storage/saved-calculations/saved-calculation.types";

export const SAVED_CALCULATION_ID_QUERY_PARAM = "savedCalculationId";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

function sanitizeSavedCalculationId(value: unknown): SavedCalculationId | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 200);
}

export function buildSavedCalculationHref(
  toolSlug: string,
  calculationId: SavedCalculationId,
): string {
  const slug = toolSlug.trim();
  const id = calculationId.trim();

  return `/apps/${encodeURIComponent(slug)}?${SAVED_CALCULATION_ID_QUERY_PARAM}=${encodeURIComponent(id)}`;
}

export function getSavedCalculationIdFromSearchParams(
  searchParams: SearchParamsLike | null | undefined,
): SavedCalculationId | null {
  if (!searchParams) {
    return null;
  }

  return sanitizeSavedCalculationId(
    searchParams.get(SAVED_CALCULATION_ID_QUERY_PARAM),
  );
}

