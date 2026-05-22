import type {
  CreateSavedCalculationInput,
  SavedCalculation,
  SavedCalculationId,
  SavedCalculationStore,
  SavedCalculationStoreResult,
  UpdateSavedCalculationInput,
} from "@/lib/storage/saved-calculations/saved-calculation.types";

export const SAVED_CALCULATIONS_STORAGE_KEY =
  "project-site:saved-calculations:v1";
export const MAX_SAVED_CALCULATIONS = 50;

function hasWindow() {
  return typeof window !== "undefined";
}

function nowIsoString() {
  return new Date().toISOString();
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown saved calculation error";
}

function generateSavedCalculationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `scn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function trimString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampTitle(value: unknown) {
  const fallback = "Opgeslagen berekening";
  const sanitizedValue = trimString(value);
  if (!sanitizedValue) {
    return fallback;
  }
  return sanitizedValue.slice(0, 120);
}

function sanitizeToolSlug(value: unknown) {
  return trimString(value).slice(0, 120);
}

function parseTimestamp(value: unknown): string {
  if (typeof value !== "string") {
    return nowIsoString();
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : nowIsoString();
}

function toTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeSavedCalculation(
  value: unknown,
): SavedCalculation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SavedCalculation>;
  const id = trimString(candidate.id);
  const toolSlug = sanitizeToolSlug(candidate.toolSlug);
  const title = clampTitle(candidate.title);

  if (!id || !toolSlug) {
    return null;
  }

  const createdAt = parseTimestamp(candidate.createdAt);
  const updatedAt = parseTimestamp(candidate.updatedAt);
  const version =
    typeof candidate.version === "number" && Number.isFinite(candidate.version)
      ? Math.max(1, Math.floor(candidate.version))
      : 1;

  const sanitized: SavedCalculation = {
    id,
    toolSlug,
    title,
    input: candidate.input,
    result: candidate.result,
    createdAt,
    updatedAt,
    version,
  };

  return sanitized;
}

function sortAndLimit(items: SavedCalculation[]) {
  return items
    .slice()
    .sort((left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt))
    .slice(0, MAX_SAVED_CALCULATIONS);
}

function readSavedCalculations(): SavedCalculationStoreResult<SavedCalculation[]> {
  if (!hasWindow()) {
    return { data: [] };
  }

  try {
    const raw = window.localStorage.getItem(SAVED_CALCULATIONS_STORAGE_KEY);
    if (!raw) {
      return { data: [] };
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { data: [] };
    }

    const sanitizedItems = parsed
      .map(sanitizeSavedCalculation)
      .filter((item): item is SavedCalculation => item !== null);

    return { data: sortAndLimit(sanitizedItems) };
  } catch (error) {
    return { data: [], error: safeErrorMessage(error) };
  }
}

function writeSavedCalculations(items: SavedCalculation[]): SavedCalculationStoreResult<SavedCalculation[]> {
  const sorted = sortAndLimit(items);

  if (!hasWindow()) {
    return { data: sorted };
  }

  try {
    window.localStorage.setItem(
      SAVED_CALCULATIONS_STORAGE_KEY,
      JSON.stringify(sorted),
    );
    return { data: sorted };
  } catch (error) {
    return { data: sorted, error: safeErrorMessage(error) };
  }
}

function defaultTitle(input: CreateSavedCalculationInput) {
  const title = clampTitle(input.title);
  if (title !== "Opgeslagen berekening") {
    return title;
  }

  const toolSlug = sanitizeToolSlug(input.toolSlug);
  return toolSlug ? `Scenario ${toolSlug}` : "Opgeslagen berekening";
}

export const localSavedCalculationStore: SavedCalculationStore = {
  listCalculations() {
    return readSavedCalculations();
  },

  getCalculation(id: SavedCalculationId) {
    const listResult = readSavedCalculations();
    const normalizedId = trimString(id);
    return {
      data:
        listResult.data.find((item) => item.id === normalizedId) ?? null,
      error: listResult.error,
    };
  },

  saveCalculation(input: CreateSavedCalculationInput) {
    const listResult = readSavedCalculations();
    const toolSlug = sanitizeToolSlug(input.toolSlug);
    const now = nowIsoString();

    const nextItem: SavedCalculation = {
      id: generateSavedCalculationId(),
      toolSlug: toolSlug || "unknown-tool",
      title: defaultTitle(input),
      input: input.input,
      result: input.result,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const writeResult = writeSavedCalculations([nextItem, ...listResult.data]);

    return {
      data: nextItem,
      error: writeResult.error ?? listResult.error,
    };
  },

  updateCalculation(input: UpdateSavedCalculationInput) {
    const listResult = readSavedCalculations();
    const normalizedId = trimString(input.id);
    const foundItem = listResult.data.find((item) => item.id === normalizedId);

    if (!foundItem) {
      return { data: null, error: listResult.error };
    }

    const updatedItem: SavedCalculation = {
      ...foundItem,
      title:
        input.title !== undefined
          ? clampTitle(input.title)
          : foundItem.title,
      input: input.input !== undefined ? input.input : foundItem.input,
      result: input.result !== undefined ? input.result : foundItem.result,
      updatedAt: nowIsoString(),
      version: Math.max(1, foundItem.version) + 1,
    };

    const writeResult = writeSavedCalculations(
      listResult.data.map((item) =>
        item.id === normalizedId ? updatedItem : item,
      ),
    );

    return {
      data: updatedItem,
      error: writeResult.error ?? listResult.error,
    };
  },

  deleteCalculation(id: SavedCalculationId) {
    const listResult = readSavedCalculations();
    const normalizedId = trimString(id);
    const nextItems = listResult.data.filter((item) => item.id !== normalizedId);

    if (nextItems.length === listResult.data.length) {
      return { data: false, error: listResult.error };
    }

    const writeResult = writeSavedCalculations(nextItems);
    return { data: true, error: writeResult.error ?? listResult.error };
  },

  clearCalculations() {
    if (!hasWindow()) {
      return { data: null };
    }

    try {
      window.localStorage.removeItem(SAVED_CALCULATIONS_STORAGE_KEY);
      return { data: null };
    } catch (error) {
      return { data: null, error: safeErrorMessage(error) };
    }
  },
};
