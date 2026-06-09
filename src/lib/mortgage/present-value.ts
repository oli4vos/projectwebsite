import type { MortgagePresentValueInput } from "@/lib/mortgage/types";

function safeFinite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function sanitizeMoney(value: number) {
  return Math.max(safeFinite(value, 0), 0);
}

function sanitizePercent(value: number) {
  return Math.min(Math.max(safeFinite(value, 0), 0), 100);
}

function sanitizeYears(value: number, fallback = 0) {
  const safeValue = safeFinite(value, fallback);

  if (safeValue <= 0) {
    return fallback > 0 ? fallback : 0;
  }

  return safeValue;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

export function calculatePresentValueFromMonthlyPayment({
  monthlyPayment,
  annualRate,
  years,
}: MortgagePresentValueInput): number {
  const safeMonthlyPayment = sanitizeMoney(monthlyPayment);
  const safeAnnualRate = sanitizePercent(annualRate);
  const safeYears = sanitizeYears(years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (safeMonthlyPayment === 0 || months === 0) {
    return 0;
  }

  if (safeAnnualRate === 0) {
    return roundMoney(safeMonthlyPayment * months);
  }

  const monthlyRate = safeAnnualRate / 100 / 12;

  return roundMoney(
    safeMonthlyPayment * (1 - (1 + monthlyRate) ** -months) / monthlyRate,
  );
}
