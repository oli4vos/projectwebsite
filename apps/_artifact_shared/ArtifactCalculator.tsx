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
  const parts = value
    .split(/[,;]+/g)
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

  const list = parseArrayList(trimmed);
  if (list !== undefined) return list;

  const number = tryParseNumber(trimmed);
  if (number !== undefined) return number;

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
          {draft.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border hair bg-[var(--paper-soft)] p-3 shadow-paper-sm"
            >
              <div className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]">
                <input
                  type="text"
                  value={entry.key}
                  onChange={(event) => updateDraft(entry.id, { key: event.target.value })}
                  placeholder="veldnaam (bijv. principal)"
                  className="ring-focus h-11 rounded-xl border hair bg-white px-3 text-sm text-[var(--ink)]"
                />
                <input
                  type="text"
                  value={entry.value}
                  onChange={(event) => updateDraft(entry.id, { value: event.target.value })}
                  placeholder="waarde (bijv. 100000 of 2,3,4)"
                  className="ring-focus h-11 rounded-xl border hair bg-white px-3 text-sm text-[var(--ink)]"
                />
                <ToolActionButton
                  type="button"
                  variant="secondary"
                  onClick={() => removeField(entry.id)}
                  disabled={draft.length <= 1}
                  className="h-11"
                >
                  Verwijder
                </ToolActionButton>
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
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${
                  result.isValid
                    ? "bg-[oklch(90%_0.04_150)] text-[oklch(36%_0.07_152)]"
                    : "bg-[oklch(95%_0.03_25)] text-[oklch(45%_0.12_25)]"
                }`}
              >
                {result.isValid ? "Berekening geslaagd" : "Controleer invoer"}
              </div>

              {result.errors.length > 0 ? (
                <div className="rounded-xl border hair bg-[oklch(98%_0.01_25)] p-3 text-sm text-[oklch(42%_0.1_25)]">
                  {result.errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              ) : null}

              {result.warnings.length > 0 ? (
                <div className="rounded-xl border hair bg-[oklch(98%_0.01_95)] p-3 text-sm text-[oklch(43%_0.09_95)]">
                  {result.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border hair bg-white p-4">
                {Object.entries(result.outputs).length > 0 ? (
                  Object.entries(result.outputs).map(([key, value]) => (
                    <ResultRow
                      key={key}
                      label={key}
                      value={formatOutputValue(value)}
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
