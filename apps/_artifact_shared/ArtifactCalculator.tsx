"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultRow } from "@/components/ResultRow";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import type {
  GenericCalculationInput,
  GenericCalculationResult,
  ToolProfile,
} from "./runtime";

type ArtifactCalculatorProps = {
  title: string;
  defaultInput: GenericCalculationInput;
  calculate: (input: GenericCalculationInput) => GenericCalculationResult;
  profile?: ToolProfile;
};

type DraftEntry = {
  id: string;
  key: string;
  value: string;
};

type FieldType =
  | "currency"
  | "number"
  | "integer"
  | "percentage"
  | "number-list"
  | "text";

type StrictField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
};

type StrictProfileConfig = {
  description: string;
  fields: StrictField[];
  outputOrder?: string[];
  summaryKey?: string;
  summaryLabel?: string;
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
  requiredScore: "Benodigd cijfer",
  averageScore: "Gemiddeld cijfer",
  fraction: "Breuk",
  romanNumeral: "Romeins cijfer",
  arabicNumber: "Arabisch getal",
  dcfValue: "DCF-waarde",
  compositePercentage: "Samengesteld percentage",
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
  requiredScore: "Benodigd cijfer",
  feasible: "Haalbaar",
  averageScore: "Gemiddelde",
  roundedToOneDecimal: "Afgerond (1 decimaal)",
  fraction: "Breuk",
  numerator: "Teller",
  denominator: "Noemer",
  decimalValue: "Decimale waarde",
  percentageValue: "Percentage",
  romanNumeral: "Romeins cijfer",
  arabicNumber: "Arabisch getal",
  dcfValue: "DCF-waarde",
  presentValueCashflows: "Contante waarde kasstromen",
  presentValueTerminal: "Contante waarde eindwaarde",
  compositePercentage: "Samengesteld percentage",
  compositeFactor: "Samengestelde factor",
};

const STRICT_PROFILE_CONFIGS: Partial<Record<ToolProfile, StrictProfileConfig>> = {
  annuity_payment: {
    description: "Bereken een annuïtaire termijn op basis van lening, rente en looptijd.",
    summaryKey: "payment",
    summaryLabel: "Termijnbedrag",
    fields: [
      { key: "principal", label: "Leenbedrag", type: "currency", required: true, min: 0.01 },
      { key: "annualRate", label: "Jaarrente (%)", type: "percentage", required: true, min: 0 },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["payment", "periods", "annualRate", "totalPaid", "totalInterest"],
  },
  annuity_principal: {
    description: "Bereken de hoofdsom die past bij een annuïteit.",
    summaryKey: "principal",
    summaryLabel: "Geleend bedrag",
    fields: [
      { key: "payment", label: "Termijnbedrag", type: "currency", required: true, min: 0.01 },
      { key: "annualRate", label: "Jaarrente (%)", type: "percentage", required: true, min: 0 },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["principal", "periods", "totalPaid", "totalInterest"],
  },
  annuity_term: {
    description: "Bereken het aantal termijnen dat nodig is om af te lossen.",
    summaryKey: "years",
    summaryLabel: "Looptijd (jaren)",
    fields: [
      { key: "principal", label: "Leenbedrag", type: "currency", required: true, min: 0.01 },
      { key: "payment", label: "Termijnbedrag", type: "currency", required: true, min: 0.01 },
      { key: "annualRate", label: "Jaarrente (%)", type: "percentage", required: true, min: 0 },
    ],
    outputOrder: ["periods", "years", "payment", "principal"],
  },
  present_value: {
    description: "Bereken de contante waarde van een toekomstig bedrag.",
    summaryKey: "presentValue",
    summaryLabel: "Contante waarde",
    fields: [
      { key: "futureValue", label: "Toekomstige waarde", type: "currency", required: true },
      { key: "annualRate", label: "Rendement (%)", type: "percentage", required: true },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["presentValue", "futureValue", "discountFactor", "periods"],
  },
  present_value_annuity: {
    description: "Bereken de contante waarde van een reeks gelijke betalingen.",
    summaryKey: "presentValue",
    summaryLabel: "Contante waarde",
    fields: [
      { key: "payment", label: "Bedrag per termijn", type: "currency", required: true },
      { key: "annualRate", label: "Rendement (%)", type: "percentage", required: true },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["presentValue", "payment", "periods"],
  },
  future_value: {
    description: "Bereken de toekomstige waarde met startbedrag en optionele periodieke inleg.",
    summaryKey: "futureValue",
    summaryLabel: "Toekomstige waarde",
    fields: [
      { key: "presentValue", label: "Startbedrag", type: "currency", required: true, min: 0 },
      { key: "payment", label: "Periodieke inleg", type: "currency", placeholder: "0 voor geen inleg" },
      { key: "annualRate", label: "Rendement (%)", type: "percentage", required: true },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["futureValue", "totalContributions", "gain", "periods"],
  },
  compound_interest: {
    description: "Bereken samengestelde rente over de looptijd.",
    summaryKey: "futureValue",
    summaryLabel: "Eindwaarde",
    fields: [
      { key: "principal", label: "Hoofdsom", type: "currency", required: true, min: 0 },
      { key: "annualRate", label: "Jaarrente (%)", type: "percentage", required: true },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["futureValue", "interest", "compoundingPerYear"],
  },
  simple_interest: {
    description: "Bereken enkelvoudige rente over de looptijd.",
    summaryKey: "futureValue",
    summaryLabel: "Eindwaarde",
    fields: [
      { key: "principal", label: "Hoofdsom", type: "currency", required: true, min: 0 },
      { key: "annualRate", label: "Jaarrente (%)", type: "percentage", required: true },
      { key: "years", label: "Looptijd (jaren)", type: "number", required: true, min: 0.01 },
    ],
    outputOrder: ["interest", "futureValue", "years"],
  },
  effective_rate: {
    description: "Reken nominale rente om naar effectieve rente.",
    summaryKey: "effectiveRate",
    summaryLabel: "Effectieve rente (%)",
    fields: [
      { key: "annualRate", label: "Nominale rente (%)", type: "percentage", required: true },
      { key: "paymentsPerYear", label: "Termijnen per jaar", type: "integer", required: true, min: 1 },
    ],
    outputOrder: ["nominalRate", "effectiveRate", "periodsPerYear"],
  },
  nominal_rate: {
    description: "Reken effectieve rente om naar nominale rente.",
    summaryKey: "nominalRate",
    summaryLabel: "Nominale rente (%)",
    fields: [
      { key: "percentage", label: "Effectieve rente (%)", type: "percentage", required: true },
      { key: "paymentsPerYear", label: "Termijnen per jaar", type: "integer", required: true, min: 1 },
    ],
    outputOrder: ["effectiveRate", "nominalRate", "periodsPerYear"],
  },
  weighted_average_rate: {
    description: "Bereken een gewogen gemiddeld rentepercentage.",
    summaryKey: "weightedAverageRate",
    summaryLabel: "Gewogen rente (%)",
    fields: [
      {
        key: "amounts",
        label: "Bedragen",
        type: "number-list",
        required: true,
        placeholder: "100000; 50000",
      },
      {
        key: "rates",
        label: "Percentages",
        type: "number-list",
        required: true,
        placeholder: "4; 6",
      },
    ],
    outputOrder: ["weightedAverageRate", "totalAmount", "inputs"],
  },
  percentage_of_total: {
    description: "Bereken welk percentage een deel is van het totaal.",
    summaryKey: "percentage",
    summaryLabel: "Percentage",
    fields: [
      { key: "part", label: "Deel", type: "number", required: true },
      { key: "total", label: "Totaal", type: "number", required: true },
    ],
    outputOrder: ["part", "total", "percentage"],
  },
  value_from_percentage: {
    description: "Bereken het totaal als deel en percentage bekend zijn.",
    summaryKey: "total",
    summaryLabel: "Totaal",
    fields: [
      { key: "part", label: "Bedrag/getal", type: "number", required: true },
      { key: "percentage", label: "Percentage (%)", type: "percentage", required: true },
    ],
    outputOrder: ["part", "percentage", "total"],
  },
  linear_loan: {
    description: "Bereken kernuitkomsten voor lineair aflossen.",
    summaryKey: "firstPayment",
    summaryLabel: "Eerste termijn",
    fields: [
      { key: "principal", label: "Leenbedrag", type: "currency", required: true, min: 0.01 },
      { key: "annualRate", label: "Jaarrente (%)", type: "percentage", required: true, min: 0 },
      { key: "periods", label: "Aantal termijnen", type: "integer", required: true, min: 1 },
    ],
    outputOrder: ["firstPayment", "principalPart", "totalInterest", "totalPaid", "periods"],
  },
  fraction_calculation: {
    description: "Zet een percentage of decimaal om naar een vereenvoudigde breuk.",
    summaryKey: "fraction",
    summaryLabel: "Breuk",
    fields: [
      { key: "percentage", label: "Percentage (%)", type: "percentage", placeholder: "bijv. 12,5" },
      { key: "decimalValue", label: "Decimale waarde", type: "number", placeholder: "bijv. 0,125" },
    ],
    outputOrder: ["fraction", "numerator", "denominator", "decimalValue", "percentageValue"],
  },
  required_grade: {
    description: "Bereken welk cijfer nog nodig is voor een doelgemiddelde.",
    summaryKey: "requiredScore",
    summaryLabel: "Benodigd cijfer",
    fields: [
      { key: "targetScore", label: "Gewenst eindcijfer", type: "number", required: true, min: 1, max: 10 },
      { key: "totalWeight", label: "Totale weging", type: "number", required: true, min: 0.01 },
      { key: "currentScores", label: "Behaalde cijfers", type: "number-list", required: true, placeholder: "6; 8" },
      { key: "currentWeights", label: "Wegingen", type: "number-list", required: true, placeholder: "40; 30" },
    ],
    outputOrder: ["requiredScore", "feasible", "targetScore", "usedWeight", "remainingWeight", "currentWeightedAverage"],
  },
  average_grade: {
    description: "Bereken het gemiddelde cijfer, met of zonder wegingen.",
    summaryKey: "averageScore",
    summaryLabel: "Gemiddelde",
    fields: [
      { key: "currentScores", label: "Cijfers", type: "number-list", required: true, placeholder: "6; 7; 8" },
      { key: "currentWeights", label: "Wegingen (optioneel)", type: "number-list", placeholder: "40; 60" },
    ],
    outputOrder: ["averageScore", "roundedToOneDecimal", "count", "weighted", "totalWeight"],
  },
  roman_numerals: {
    description: "Converteer tussen Arabische getallen en Romeinse cijfers.",
    summaryKey: "romanNumeral",
    summaryLabel: "Romeins cijfer",
    fields: [
      { key: "numberInput", label: "Arabisch getal (1-3999)", type: "integer", min: 1, max: 3999 },
      { key: "romanInput", label: "Romeins cijfer", type: "text", placeholder: "bijv. MMXXVI" },
    ],
    outputOrder: ["arabicNumber", "romanNumeral", "direction"],
  },
  dcf_valuation: {
    description: "Bereken DCF-waarde met jaarlijkse kasstromen en optionele eindwaarde.",
    summaryKey: "dcfValue",
    summaryLabel: "DCF-waarde",
    fields: [
      { key: "annualRate", label: "WACC (%)", type: "percentage", required: true },
      { key: "cashflows", label: "Kasstromen per jaar", type: "number-list", required: true, placeholder: "100; 100; 100" },
      { key: "terminalValue", label: "Eindwaarde (optioneel)", type: "currency", placeholder: "0 of leeg" },
    ],
    outputOrder: ["dcfValue", "presentValueCashflows", "presentValueTerminal", "waccPercentage", "horizonYears"],
  },
  percentage_composition: {
    description: "Bereken het samengestelde effect van twee opeenvolgende percentages.",
    summaryKey: "compositePercentage",
    summaryLabel: "Samengesteld percentage",
    fields: [
      { key: "percentage1", label: "Percentage 1 (%)", type: "percentage", required: true, min: -100 },
      { key: "percentage2", label: "Percentage 2 (%)", type: "percentage", required: true, min: -100 },
    ],
    outputOrder: ["compositePercentage", "compositeFactor", "sumPercentagePoints", "compositionDifference"],
  },
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

function parseNumberList(value: string) {
  const parts = value
    .split(/[;,|]+/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) return [];
  const numbers = parts.map((part) => tryParseNumber(part));
  if (numbers.some((entry) => entry === undefined)) return undefined;
  return numbers as number[];
}

function stringifyValue(value: unknown) {
  if (Array.isArray(value)) return value.join("; ");
  if (value === undefined || value === null) return "";
  return String(value);
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

function formatOutputValue(value: number | string | boolean | null) {
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

function formatSummaryValue(value: number | string | boolean | null) {
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

function buildDraft(defaultInput: GenericCalculationInput): DraftEntry[] {
  const entries = Object.entries(defaultInput).map(([key, value], index) => ({
    id: `field-${index}-${key}`,
    key,
    value: stringifyValue(value),
  }));

  if (entries.length > 0) return entries;
  return [{ id: "field-0", key: "valueA", value: "100" }];
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
      // noop
    }
  }

  const number = tryParseNumber(trimmed);
  if (number !== undefined) return number;

  const list = parseNumberList(trimmed);
  if (list && list.length > 1) return list;

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
  profile,
}: ArtifactCalculatorProps) {
  const strictConfig = profile ? STRICT_PROFILE_CONFIGS[profile] : undefined;

  const [dynamicDraft, setDynamicDraft] = useState<DraftEntry[]>(() => buildDraft(defaultInput));
  const [dynamicResult, setDynamicResult] = useState<GenericCalculationResult | null>(null);
  const [dynamicLastInput, setDynamicLastInput] = useState<GenericCalculationInput | null>(null);

  const dynamicHasDraftValues = useMemo(
    () =>
      dynamicDraft.some(
        (entry) => entry.key.trim().length > 0 && entry.value.trim().length > 0,
      ),
    [dynamicDraft],
  );

  const dynamicOutputEntries = useMemo(
    () =>
      dynamicResult
        ? Object.entries(dynamicResult.outputs).sort(([a], [b]) => a.localeCompare(b))
        : [],
    [dynamicResult],
  );

  const strictInitialValues = useMemo(() => {
    if (!strictConfig) return {};
    return strictConfig.fields.reduce<Record<string, string>>((accumulator, field) => {
      accumulator[field.key] = stringifyValue(defaultInput[field.key]);
      return accumulator;
    }, {});
  }, [defaultInput, strictConfig]);

  const strictForm = useSubmittedCalculation<Record<string, string>>(strictInitialValues);
  const strictMobileFlow = useMobileFieldFlow(
    strictConfig ? strictConfig.fields.map((field) => field.key) : [],
  );

  const parseStrictInput = (values: Record<string, string>) => {
    if (!strictConfig) {
      return { errors: {} as Record<string, string>, parsed: {} as GenericCalculationInput };
    }

    const errors: Record<string, string> = {};
    const parsed: GenericCalculationInput = {};

    for (const field of strictConfig.fields) {
      const raw = (values[field.key] ?? "").trim();
      if (!raw) {
        if (field.required) errors[field.key] = `Vul ${field.label.toLowerCase()} in.`;
        continue;
      }

      if (field.type === "number-list") {
        const list = parseNumberList(raw);
        if (!list || list.length === 0) {
          errors[field.key] = `Vul een geldige lijst in voor ${field.label.toLowerCase()}.`;
          continue;
        }
        parsed[field.key] = list;
        continue;
      }

      if (field.type === "text") {
        parsed[field.key] = raw;
        continue;
      }

      const numericValue = tryParseNumber(raw);
      if (numericValue === undefined) {
        errors[field.key] = `Vul een geldig getal in voor ${field.label.toLowerCase()}.`;
        continue;
      }

      if (field.type === "integer" && !Number.isInteger(numericValue)) {
        errors[field.key] = `${field.label} moet een geheel getal zijn.`;
        continue;
      }
      if (field.min !== undefined && numericValue < field.min) {
        errors[field.key] = `${field.label} moet minimaal ${field.min} zijn.`;
        continue;
      }
      if (field.max !== undefined && numericValue > field.max) {
        errors[field.key] = `${field.label} mag maximaal ${field.max} zijn.`;
        continue;
      }

      parsed[field.key] = numericValue;
    }

    if (profile === "fraction_calculation") {
      if (
        !parsed.percentage &&
        !parsed.decimalValue &&
        parsed.percentage !== 0 &&
        parsed.decimalValue !== 0
      ) {
        errors.percentage = "Vul een percentage of decimale waarde in.";
      }
    }
    if (profile === "roman_numerals") {
      const hasNumber = parsed.numberInput !== undefined;
      const hasRoman =
        parsed.romanInput !== undefined &&
        String(parsed.romanInput).trim().length > 0;
      if (!hasNumber && !hasRoman) {
        errors.numberInput = "Vul een getal of Romeins cijfer in.";
      }
    }

    return { errors, parsed };
  };

  const strictValidation = parseStrictInput(strictForm.formValues);

  const strictSubmittedValidation =
    strictConfig && strictForm.submittedValues
      ? parseStrictInput(strictForm.submittedValues)
      : null;

  const strictResult = useMemo(() => {
    if (!strictConfig || !strictSubmittedValidation) return null;
    if (Object.keys(strictSubmittedValidation.errors).length > 0) return null;
    return calculate(strictSubmittedValidation.parsed);
  }, [calculate, strictConfig, strictSubmittedValidation]);

  const strictOutputEntries = useMemo(() => {
    if (!strictConfig || !strictResult) return [] as Array<[string, number | string | boolean | null]>;
    const entries = Object.entries(strictResult.outputs);
    if (!strictConfig.outputOrder || strictConfig.outputOrder.length === 0) {
      return entries.sort(([a], [b]) => a.localeCompare(b));
    }
    const order = new Map(strictConfig.outputOrder.map((key, index) => [key, index]));
    return entries.sort(([a], [b]) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
  }, [strictConfig, strictResult]);

  function updateDynamicDraft(id: string, patch: Partial<DraftEntry>) {
    setDynamicDraft((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  function addDynamicField() {
    setDynamicDraft((current) => [
      ...current,
      {
        id: `field-${current.length}-${Date.now()}`,
        key: "",
        value: "",
      },
    ]);
  }

  function removeDynamicField(id: string) {
    setDynamicDraft((current) => {
      if (current.length <= 1) return current;
      return current.filter((entry) => entry.id !== id);
    });
  }

  function applyDynamicExample() {
    setDynamicDraft(buildDraft(defaultInput));
    setDynamicResult(null);
    setDynamicLastInput(null);
  }

  function handleDynamicCalculate() {
    const input = draftToInput(dynamicDraft);
    setDynamicLastInput(input);
    setDynamicResult(calculate(input));
  }

  function handleStrictCalculate() {
    if (Object.keys(strictValidation.errors).length > 0) return;
    strictForm.submit();
  }

  if (strictConfig) {
    const summaryValue =
      strictResult && strictConfig.summaryKey
        ? strictResult.outputs[strictConfig.summaryKey]
        : null;

    return (
      <CalculatorShell
        intro={
          <>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Artifact-tool
            </div>
            <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
              {title}
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
              {strictConfig.description}
            </p>
          </>
        }
        inputs={
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              handleStrictCalculate();
            }}
          >
            {strictConfig.fields.map((field) => (
              <label key={field.key} className={strictMobileFlow.getFieldClassName(field.key)}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  {field.label}
                </span>
                <input
                  type={field.type === "integer" || field.type === "number" || field.type === "percentage" || field.type === "currency" ? "text" : "text"}
                  value={strictForm.formValues[field.key] ?? ""}
                  onChange={(event) =>
                    strictForm.setFormValues((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  onKeyDown={strictMobileFlow.handleEnterAdvance(
                    field.key,
                    Boolean(strictValidation.errors[field.key]),
                  )}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                />
                {field.hint ? (
                  <p className="text-xs text-[var(--muted)]">{field.hint}</p>
                ) : null}
                <FieldError message={strictValidation.errors[field.key]} />
              </label>
            ))}

            <ToolActionButton
              type="submit"
              variant="submit"
              size="md"
              full
              disabled={Object.keys(strictValidation.errors).length > 0}
            >
              {strictForm.submittedValues && strictForm.hasDirtyChanges
                ? "Bereken opnieuw"
                : "Bereken"}
            </ToolActionButton>
          </form>
        }
        submitAction={
          <MobileFieldFlowControls
            current={strictMobileFlow.activeIndex + 1}
            total={strictMobileFlow.total}
            canGoPrev={strictMobileFlow.canGoPrev}
            canGoNext={strictMobileFlow.canGoNext}
            canComplete={Object.keys(strictValidation.errors).length === 0}
            onPrev={strictMobileFlow.goPrev}
            onNext={strictMobileFlow.goNext}
            onComplete={handleStrictCalculate}
          />
        }
        result={
          <div
            id="tool-result-summary"
            className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg"
          >
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Samenvatting
            </div>
            {!strictResult ? (
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Vul de velden in en klik op Bereken.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="font-serif text-[30px] leading-none tracking-[-0.03em]">
                  {summaryValue !== null && summaryValue !== undefined
                    ? formatSummaryValue(summaryValue)
                    : strictResult.isValid
                      ? "Berekening geslaagd"
                      : "Controleer invoer"}
                </p>
                <p className="text-[14px] leading-[1.65] text-white/75">
                  {strictConfig.summaryLabel ?? "Resultaat"}
                </p>
                {strictResult.errors.length > 0 ? (
                  <p className="text-[13px] leading-[1.6] text-[oklch(85%_0.08_25)]">
                    {strictResult.errors.join(" ")}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        }
        details={
          strictResult ? (
            <DisclosureSection
              title="Berekeningsdetails"
              subtitle="Volledige output en technische context."
            >
              <div className="space-y-3">
                <div className="rounded-xl border hair bg-white p-4">
                  {strictOutputEntries.map(([key, value]) => (
                    <ResultRow
                      key={key}
                      label={toHumanLabel(key, OUTPUT_LABELS)}
                      value={formatOutputValue(value)}
                      sub={`Sleutel: ${key}`}
                    />
                  ))}
                </div>
                {strictResult.warnings.length > 0 ? (
                  <div className="rounded-xl border hair bg-[oklch(98%_0.01_95)] p-3 text-sm text-[oklch(43%_0.09_95)]">
                    <p className="mb-1 text-[11px] uppercase tracking-[0.1em]">
                      Waarschuwingen
                    </p>
                    {strictResult.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--soft)]">
                      Invoer
                    </div>
                    <pre className="mt-2 overflow-auto rounded-xl border hair bg-[var(--paper-soft)] p-3 text-xs text-[var(--ink)]">
                      {JSON.stringify(
                        strictSubmittedValidation?.parsed ?? {},
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--soft)]">
                      Output
                    </div>
                    <pre className="mt-2 overflow-auto rounded-xl border hair bg-[var(--paper-soft)] p-3 text-xs text-[var(--ink)]">
                      {JSON.stringify(strictResult, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </DisclosureSection>
          ) : null
        }
      />
    );
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
            Deze tool draait nog in generieke artifact-modus. Vul velden in en klik op
            berekenen.
          </p>
        </>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton type="button" variant="secondary" onClick={applyDynamicExample}>
            Voorbeeld invullen
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={addDynamicField}>
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
          {dynamicDraft.map((entry, index) => (
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
                  onClick={() => removeDynamicField(entry.id)}
                  disabled={dynamicDraft.length <= 1}
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
                    onChange={(event) =>
                      updateDynamicDraft(entry.id, { key: event.target.value })
                    }
                    placeholder="bijv. principal"
                    className="ring-focus h-11 w-full rounded-xl border hair bg-white px-3 text-sm text-[var(--ink)]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[var(--ink)]">Waarde</span>
                  <input
                    type="text"
                    value={entry.value}
                    onChange={(event) =>
                      updateDynamicDraft(entry.id, { value: event.target.value })
                    }
                    placeholder="bijv. 100000"
                    className="ring-focus h-11 w-full rounded-xl border hair bg-white px-3 text-sm text-[var(--ink)]"
                  />
                </label>
              </div>
              <div className="mt-2 text-[11px] text-[var(--muted)]">
                Label: {entry.key.trim() ? toHumanLabel(entry.key.trim(), FIELD_LABELS) : "n.v.t."}
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
          onClick={handleDynamicCalculate}
          disabled={!dynamicHasDraftValues}
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
          {dynamicResult ? (
            <div className="mt-3 space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div
                  className={`rounded-xl px-3 py-2 text-xs font-medium ${
                    dynamicResult.isValid
                      ? "bg-[oklch(90%_0.04_150)] text-[oklch(36%_0.07_152)]"
                      : "bg-[oklch(95%_0.03_25)] text-[oklch(45%_0.12_25)]"
                  }`}
                >
                  {dynamicResult.isValid ? "Status: geslaagd" : "Status: controleer invoer"}
                </div>
                <div className="rounded-xl border hair bg-[var(--paper-soft)] px-3 py-2 text-xs text-[var(--ink)]">
                  Profiel: {formatProfile(dynamicResult.profile)}
                </div>
                <div className="rounded-xl border hair bg-[var(--paper-soft)] px-3 py-2 text-xs text-[var(--ink)]">
                  Outputvelden: {dynamicOutputEntries.length}
                </div>
              </div>

              {dynamicResult.errors.length > 0 ? (
                <div className="rounded-xl border hair bg-[oklch(98%_0.01_25)] p-3 text-sm text-[oklch(42%_0.1_25)]">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.1em]">Fouten</p>
                  {dynamicResult.errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border hair bg-white p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  Resultaten
                </div>
                {dynamicOutputEntries.length > 0 ? (
                  dynamicOutputEntries.map(([key, value]) => (
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
                {JSON.stringify(dynamicLastInput ?? {}, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--soft)]">
                Laatste output
              </div>
              <pre className="mt-2 overflow-auto rounded-xl border hair bg-[var(--paper-soft)] p-3 text-xs text-[var(--ink)]">
                {JSON.stringify(dynamicResult ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </DisclosureSection>
      }
    />
  );
}
