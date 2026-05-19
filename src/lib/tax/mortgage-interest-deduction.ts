import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { calculateBox1Tax } from "@/lib/tax/box1";
import type {
  MortgageInterestDeductionInput,
  MortgageInterestDeductionResult,
} from "@/lib/tax/types";

function sanitizeMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateMortgageInterestDeduction(
  input: MortgageInterestDeductionInput,
): MortgageInterestDeductionResult {
  const year = input.year ?? getDefaultFinancialYear();
  const constants = getFinancialConstants(year);
  const grossInterest = roundMoney(sanitizeMoney(input.annualMortgageInterest));
  const box1Result = calculateBox1Tax({
    taxableIncome: input.taxableIncome,
    year,
  });
  const configuredMaxRate = constants.box1.mortgageInterestDeductionMaxRate;
  const appliedDeductionRate =
    configuredMaxRate === undefined
      ? box1Result.marginalRate
      : Math.min(box1Result.marginalRate, configuredMaxRate);
  const estimatedTaxBenefit = roundMoney(grossInterest * (appliedDeductionRate / 100));
  const netInterestCost = roundMoney(Math.max(grossInterest - estimatedTaxBenefit, 0));

  return {
    year,
    annualMortgageInterest: grossInterest,
    appliedDeductionRate,
    grossInterest,
    estimatedTaxBenefit,
    netInterestCost,
    warnings: [
      "Hypotheekrenteaftrek hangt af van je eigenwoningschuld, aflosvorm, looptijd en persoonlijke situatie.",
      "Dit is een indicatieve benadering en geen officiële aangifteberekening.",
      configuredMaxRate === undefined
        ? "Geen apart aftrekmaximum ingesteld in de constants; daarom gebruiken we de marginale box 1-schijf als benadering."
        : "Aftrekpercentage is begrensd op het ingestelde maximale aftrektarief voor dit jaar.",
    ],
  };
}
