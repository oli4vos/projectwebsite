import {
  getDefaultFinancialYear,
  getFinancialConstants,
  getStudentDebtGrossUpFactor,
} from "@/lib/financial-constants";
import { calculatePresentValueFromMonthlyPayment } from "@/lib/mortgage/present-value";
import type {
  MortgageMonthlyObligationCapacityReductionInput,
  MortgageMonthlyObligationCapacityReductionResult,
} from "@/lib/mortgage/types";

function safeFinite(value: number | undefined, fallback = 0) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function sanitizeMoney(value: number | undefined) {
  return Math.max(safeFinite(value, 0), 0);
}

function sanitizePercent(value: number | undefined, fallback = 0) {
  return Math.max(safeFinite(value, fallback), 0);
}

function sanitizeYears(value: number | undefined, fallback: number) {
  const safeValue = safeFinite(value, fallback);
  return safeValue > 0 ? safeValue : fallback;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

export function calculateMonthlyObligationMortgageCapacityReduction(
  input: MortgageMonthlyObligationCapacityReductionInput,
): MortgageMonthlyObligationCapacityReductionResult {
  const normYear = input.normYear ?? getDefaultFinancialYear();
  const constants = getFinancialConstants(normYear);
  const monthlyPayment = roundMoney(input.monthlyPayment);
  const annualMortgageRateUsed = sanitizePercent(
    input.annualMortgageRate,
    constants.mortgage.defaultMortgageRate,
  );
  const mortgageTermYearsUsed = sanitizeYears(
    input.mortgageTermYears,
    constants.mortgage.defaultMortgageTermYears,
  );
  const grossUpBand = getStudentDebtGrossUpFactor(annualMortgageRateUsed, normYear);
  const grossedMonthlyImpact = roundMoney(monthlyPayment * grossUpBand.factor);
  const principalReduction = calculatePresentValueFromMonthlyPayment({
    monthlyPayment: grossedMonthlyImpact,
    annualRate: annualMortgageRateUsed,
    years: mortgageTermYearsUsed,
  });

  return {
    monthlyPayment,
    grossUpFactor: grossUpBand.factor,
    grossedMonthlyImpact,
    principalReduction,
    annualMortgageRateUsed,
    mortgageTermYearsUsed,
    assumptions: [
      `Studieschuld-maandlast wordt indicatief gebruteerd met factor ${grossUpBand.factor} (${grossUpBand.label}).`,
      `De verlaging is omgerekend naar hypotheekruimte met ${annualMortgageRateUsed}% hypotheekrente en ${mortgageTermYearsUsed} jaar looptijd.`,
    ],
  };
}
