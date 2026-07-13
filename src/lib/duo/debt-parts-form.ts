import { getAvailableDuoRateYears } from "@/lib/financial-constants";
import type { DuoDebtPartInput } from "@/lib/duo/types";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoDebtPartFormValue = {
  id: string;
  amount: string;
  rateYear: string;
};

export type DuoDebtPartFieldErrors = {
  amount?: string;
  rateYear?: string;
};

export type DuoDebtPartFormValidationResult = {
  sanitizedParts: DuoDebtPartInput[];
  totalDebt: number;
  errorsById: Record<string, DuoDebtPartFieldErrors>;
};

let duoDebtPartCounter = 0;

function createDebtPartId() {
  duoDebtPartCounter += 1;
  return `duo-debt-part-${duoDebtPartCounter}`;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

export function getDefaultDuoDebtPartRateYear() {
  return getAvailableDuoRateYears(1)[0] ?? new Date().getFullYear();
}

export function createDuoDebtPartFormValue(rateYear = getDefaultDuoDebtPartRateYear()): DuoDebtPartFormValue {
  return {
    id: createDebtPartId(),
    amount: "",
    rateYear: String(rateYear),
  };
}

export function createDefaultDuoDebtPartFormValues(): DuoDebtPartFormValue[] {
  return [createDuoDebtPartFormValue()];
}

export function validateDuoDebtPartFormValues(
  values: DuoDebtPartFormValue[],
): DuoDebtPartFormValidationResult {
  const supportedYears = new Set(getAvailableDuoRateYears());
  const sanitizedParts: DuoDebtPartInput[] = [];
  const errorsById: Record<string, DuoDebtPartFieldErrors> = {};

  for (const value of values) {
    const amount = parseOptionalDecimalInput(value.amount);
    const rateYear = Number.parseInt(value.rateYear, 10);
    const fieldErrors: DuoDebtPartFieldErrors = {};
    const hasAnyInput =
      value.amount.trim().length > 0 || value.rateYear.trim().length > 0;

    if (!hasAnyInput) {
      continue;
    }

    if (amount === undefined || !Number.isFinite(amount) || amount <= 0) {
      fieldErrors.amount = "Gebruik per leningdeel een schuld groter dan 0.";
    }

    if (!Number.isInteger(rateYear) || !supportedYears.has(rateYear)) {
      fieldErrors.rateYear = "Kies een rentejaar uit de laatste 5 jaar.";
    }

    if (fieldErrors.amount || fieldErrors.rateYear) {
      errorsById[value.id] = fieldErrors;
      continue;
    }

    const normalizedAmount = amount ?? 0;

    sanitizedParts.push({
      remainingDebt: roundMoney(normalizedAmount),
      rateYear,
    });
  }

  return {
    sanitizedParts,
    totalDebt: roundMoney(
      sanitizedParts.reduce((sum, part) => sum + (part.remainingDebt ?? 0), 0),
    ),
    errorsById,
  };
}
