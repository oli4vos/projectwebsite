"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import type { GenericCalculationInput, GenericCalculationResult } from "./runtime";

type ArtifactCalculatorProps = {
  title: string;
  defaultInput: GenericCalculationInput;
  calculate: (input: GenericCalculationInput) => GenericCalculationResult;
};

type DraftEntry = {
  id: string;
  key: string;
  value: string;
};

const FIELD_LABELS: Record<string, string> = {
  principal: "Leenbedrag",
  payment: "Termijnbedrag",
  annualRate: "Jaarrente (%)",
  years: "Looptijd (jaren)",
  periods: "Aantal termijnen",
  paymentsPerYear: "Termijnen per jaar",
  futureValue: "Toekomstige waarde",
  presentValue: "Contante waarde",
  percentage: "Percentage",
  part: "Deelwaarde",
  total: "Totaalwaarde",
  amounts: "Bedragenreeks",
  rates: "Rentesreeks",
};

const OUTPUT_LABELS: Record<string, string> = {
  payment: "Termijnbedrag",
  principal: "Leenbedrag",
  periods: "Aantal termijnen",
  years: "Looptijd (jaren)",
  annualRate: "Jaarrente (%)",
  totalPaid: "Totaal betaald",
  totalInterest: "Totale rente",
  presentValue: "Contante waarde",
  futureValue: "Toekomstige waarde",
  discountFactor: "Disconteringsfactor",
  finalValue: "Eindwaarde",
  returnAmount: "Opbrengst",
  returnPercentage: "Rendement (%)",
};

function normalizeNumberInput(value: string) {
  return value.replace(/\s+/g, "").replace(",", ".");
}

function tryParseNumber(value: string) {
  const normalized = normalizeNumberInput(value);
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringifyDraftValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function buildDraft(defaultInput: GenericCalculationInput): DraftEntry[] {
  const entries = Object.entries(defaultInput).map(([key, value], index) => ({
    id: `field-${index}-${key}`,
    key,
    value: stringifyDraftValue(value),
  }));

  if (entries.length > 0) return entries;

  return [
    {
      id: "field-0",
      key: "valueA",
      value: "100",
    },
  ];
}

function parseArrayList(value: string) {
  const shouldParseAsList =
    value.includes(";") || value.includes("|") || value.includes(", ") || (value.match(/,/g)?.length ?? 0) > 1;
  if (!shouldParseAsList) return undefined;

  const parts = value
    .split(/[;|]+|,\s+/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length <= 1) return undefined;

  const numericParts = parts.map((part) => tryParseNumber(part));
  if (numericParts.every((part) => part !== undefined)) {
    return numericParts as number[];
  }

  return parts;
}

function parseDraftValue(value: string): unknown {
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
      // Ignore and continue with fallback parsing.
    }
  }

  const number = tryParseNumber(trimmed);
  if (number !== undefined) return number;

  const list = parseArrayList(trimmed);
  if (list !== undefined) return list;

  return trimmed;
}

function draftToInput(draft: DraftEntry[]): GenericCalculationInput {
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

function formatOutputValue(value: number | string | boolean | null) {
  if (value === null) return "-";
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "Ongeldig getal";
    return new Intl.NumberFormat("nl-NL", {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 4,
    }).format(value);
  }
  return value;
}

function toHumanLabel(key: string, labelMap: Record<string, string>) {
  if (!key.trim()) return "Veld";
  if (labelMap[key]) return labelMap[key];
  if (labelMap[key.toLowerCase()]) return labelMap[key.toLowerCase()];
  const withSpaces = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function getEntryValueHint(value: string) {
  const parsed = parseDraftValue(value);
  if (Array.isArray(parsed)) return "Type: lijst (gebruik bij voorkeur `;` als scheiding, bijv. `2; 3; 4`).";
  if (typeof parsed === "boolean") return "Type: boolean (`true` of `false`).";
  if (typeof parsed === "number") return "Type: getal (komma of punt als decimaal).";
  if (!value.trim()) return "Type: nog leeg.";
  return "Type: tekst.";
}

function formatProfile(profile: string) {
  return profile
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ArtifactCalculator({
  title,
  defaultInput,
  calculate,
}: ArtifactCalculatorProps) {
  const [draft, setDraft] = useState<DraftEntry[]>(() => buildDraft(defaultInput));
  const [result, setResult] = useState<GenericCalculationResult | null>(null);
  const [lastInput, setLastInput] = useState<GenericCalculationInput | null>(null);

  const hasDraftValues = useMemo(
    () => draft.some((entry) => entry.key.trim().length > 0 && entry.value.trim().length > 0),
    [draft],
  );
  const outputEntries = useMemo(
    () =>
      result
        ? Object.entries(result.outputs).sort(([a], [b]) => a.localeCompare(b))
        : [],
    [result],
  );

  function updateDraft(id: string, patch: Partial<DraftEntry>) {
    setDraft((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  function addField() {
    setDraft((current) => [
      ...current,
      {
        id: `field-${current.length}-${Date.now()}`,
        key: "",
        value: "",
      },
    ]);
  }

  function removeField(id: string) {
    setDraft((current) => {
      if (current.length <= 1) return current;
      return current.filter((entry) => entry.id !== id);
    });
  }

  function applyExample() {
    setDraft(buildDraft(defaultInput));
    setResult(null);
    setLastInput(null);
  }

  function handleCalculate() {
    const input = draftToInput(draft);
    setLastInput(input);
    setResult(calculate(input));
  }

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Artifacts staging
          </div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Deze tool is geimporteerd uit ingevulde artifacts en draait met dezelfde centrale
            rekenruntime. Gebruik de velden hieronder en klik daarna op berekenen.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton type="button" variant="secondary" onClick={applyExample}>
            Voorbeeld invullen
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={addField}>
            Veld toevoegen
          </ToolActionButton>
        </div>
      }
      inputs={
        <div className="space-y-3">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Vul per invoer de veldnaam en waarde in. Gebruik voor lijsten bij voorkeur een
            puntkomma (`;`) of JSON-notatie (`[1,2,3]`).
          </p>
          {draft.map((entry, index) => (
            <div
              key={entry.id}
              className="rounded-2xl border hair bg-[var(--paper-soft)] p-3 shadow-paper-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  Invoer {index + 1}
                </div>
                <ToolActionButton
                  type="button"
                  variant="secondary"
                  onClick={() => removeField(entry.id)}
                  disabled={draft.length <= 1}
                  className="h-9"
                >
                  Verwijder
                </ToolActionButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[var(--ink)]">Veldnaam</span>
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(event) => updateDraft(entry.id, { key: event.target.value })}
                    placeholder="bijv. principal"
                    className="ring-focus h-11 w-full rounded-xl border hair bg-white px-3 text-sm text-[var(--ink)]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[var(--ink)]">Waarde</span>
                  <input
                    type="text"
                    value={entry.value}
                    onChange={(event) => updateDraft(entry.id, { value: event.target.value })}
                    placeholder="bijv. 100000"
                    className="ring-focus h-11 w-full rounded-xl border hair bg-white px-3 text-sm text-[var(--ink)]"
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
                <span>{getEntryValueHint(entry.value)}</span>
                {entry.key.trim() ? (
                  <span>Label: {toHumanLabel(entry.key.trim(), FIELD_LABELS)}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      }
      submitAction={
        <ToolActionButton
          type="button"
          variant="submit"
          full
          onClick={handleCalculate}
          disabled={!hasDraftValues}
        >
          Bereken met artifacts-runtime
        </ToolActionButton>
      }
      result={
        <section
          id="tool-result-summary"
          className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper"
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Uitkomst
          </div>
          {result ? (
            <div className="mt-3 space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div
                  className={`rounded-xl px-3 py-2 text-xs font-medium ${
                    result.isValid
                      ? "bg-[oklch(90%_0.04_150)] text-[oklch(36%_0.07_152)]"
                      : "bg-[oklch(95%_0.03_25)] text-[oklch(45%_0.12_25)]"
                  }`}
                >
                  {result.isValid ? "Status: geslaagd" : "Status: controleer invoer"}
                </div>
                <div className="rounded-xl border hair bg-[var(--paper-soft)] px-3 py-2 text-xs text-[var(--ink)]">
                  Profiel: {formatProfile(result.profile)}
                </div>
                <div className="rounded-xl border hair bg-[var(--paper-soft)] px-3 py-2 text-xs text-[var(--ink)]">
                  Outputvelden: {outputEntries.length}
                </div>
              </div>

              {result.errors.length > 0 ? (
                <div className="rounded-xl border hair bg-[oklch(98%_0.01_25)] p-3 text-sm text-[oklch(42%_0.1_25)]">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.1em]">Fouten</p>
                  {result.errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              ) : null}

              {result.warnings.length > 0 ? (
                <div className="rounded-xl border hair bg-[oklch(98%_0.01_95)] p-3 text-sm text-[oklch(43%_0.09_95)]">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.1em]">Waarschuwingen</p>
                  {result.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border hair bg-white p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Resultaten
                </div>
                {outputEntries.length > 0 ? (
                  outputEntries.map(([key, value]) => (
                    <ResultRow
                      key={key}
                      label={toHumanLabel(key, OUTPUT_LABELS)}
                      value={formatOutputValue(value)}
                      sub={`Technische sleutel: ${key}`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    Geen outputvelden teruggekregen voor deze invoer.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Vul velden in en klik op berekenen om de uitkomst te tonen.
            </p>
          )}
        </section>
      }
      details={
        <DisclosureSection title="Technische details" subtitle="Artifact input/output">
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--soft)]">
                Laatste input
              </div>
              <pre className="mt-2 overflow-auto rounded-xl border hair bg-[var(--paper-soft)] p-3 text-xs text-[var(--ink)]">
                {JSON.stringify(lastInput ?? {}, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--soft)]">
                Laatste output
              </div>
              <pre className="mt-2 overflow-auto rounded-xl border hair bg-[var(--paper-soft)] p-3 text-xs text-[var(--ink)]">
                {JSON.stringify(result ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </DisclosureSection>
      }
    />
  );
}
