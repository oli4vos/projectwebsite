export function normalizeDecimalInput(value: string | undefined | null): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, "").replace(",", ".");
}

export function parseOptionalDecimalInput(value: string | undefined | null): number | undefined {
  const normalized = normalizeDecimalInput(value);
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}
