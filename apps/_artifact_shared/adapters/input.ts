import type { GenericCalculationInput } from "../runtime";
import type { DraftEntry } from "../types";

export function normalizeNumberInput(value: string) {
  return value.replace(/\s+/g, "").replace(",", ".");
}

export function tryParseNumber(value: string) {
  const normalized = normalizeNumberInput(value);
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseNumberList(value: string) {
  const parts = value
    .split(/[;,|]+/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) return [];
  const numbers = parts.map((part) => tryParseNumber(part));
  if (numbers.some((entry) => entry === undefined)) return undefined;
  return numbers as number[];
}

export function stringifyValue(value: unknown) {
  if (Array.isArray(value)) return value.join("; ");
  if (value === undefined || value === null) return "";
  return String(value);
}

export function toHumanLabel(key: string, labelMap: Record<string, string>) {
  if (!key.trim()) return "Veld";
  if (labelMap[key]) return labelMap[key];
  if (labelMap[key.toLowerCase()]) return labelMap[key.toLowerCase()];
  const withSpaces = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export function formatOutputValue(value: number | string | boolean | null) {
  if (value === null) return "-";
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "Ongeldig getal";
    return new Intl.NumberFormat("nl-NL", {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 6,
    }).format(value);
  }
  return value;
}

export function formatSummaryValue(value: number | string | boolean | null) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("nl-NL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(value);
  }
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  if (value === null) return "-";
  return value;
}

export function buildDraft(defaultInput: GenericCalculationInput): DraftEntry[] {
  const entries = Object.entries(defaultInput).map(([key, value], index) => ({
    id: `field-${index}-${key}`,
    key,
    value: stringifyValue(value),
    locked: true,
  }));

  if (entries.length > 0) return entries;
  return [{ id: "field-0", key: "valueA", value: "100", locked: false }];
}

export function parseDraftValue(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Keep free-form text when JSON-like input is malformed.
    }
  }

  const number = tryParseNumber(trimmed);
  if (number !== undefined) return number;

  const list = parseNumberList(trimmed);
  if (list && list.length > 1) return list;

  return trimmed;
}

export function draftToInput(draft: DraftEntry[]): GenericCalculationInput {
  const input: GenericCalculationInput = {};
  for (const entry of draft) {
    const key = entry.key.trim();
    if (!key) continue;
    const parsedValue = parseDraftValue(entry.value);
    if (parsedValue === undefined) continue;
    input[key] = parsedValue;
  }
  return input;
}

export function formatProfile(profile: string) {
  return profile
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
