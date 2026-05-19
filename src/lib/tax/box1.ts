import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import type { Box1IncomeInput, Box1TaxResult } from "@/lib/tax/types";

function sanitizeMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundRate(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function calculateBox1Tax(input: Box1IncomeInput): Box1TaxResult {
  const year = input.year ?? getDefaultFinancialYear();
  const constants = getFinancialConstants(year);
  const brackets = constants.box1.brackets;
  const taxableIncome = sanitizeMoney(input.taxableIncome);
  const bracketBreakdown: Box1TaxResult["bracketBreakdown"] = [];
  let totalTax = 0;
  let previousLimit = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    const upperLimit = bracket.upTo ?? Number.POSITIVE_INFINITY;
    const span = Math.max(upperLimit - previousLimit, 0);
    const taxableAmount = Math.max(
      Math.min(taxableIncome - previousLimit, span),
      0,
    );

    if (taxableAmount > 0) {
      marginalRate = bracket.rate;
    }

    const tax = roundMoney(taxableAmount * (bracket.rate / 100));
    totalTax = roundMoney(totalTax + tax);
    bracketBreakdown.push({
      label: bracket.label,
      taxableAmount: roundMoney(taxableAmount),
      rate: bracket.rate,
      tax,
    });

    if (bracket.upTo === null) {
      break;
    }

    previousLimit = bracket.upTo;
  }

  const effectiveRate =
    taxableIncome > 0 ? roundRate((totalTax / taxableIncome) * 100) : 0;

  return {
    year,
    taxableIncome: roundMoney(taxableIncome),
    totalTax,
    effectiveRate,
    marginalRate,
    bracketBreakdown,
    warnings: [
      "Dit is een indicatieve box 1-berekening zonder heffingskortingen, toeslagen of persoonlijke aftrekposten.",
      "Gebruik deze uitkomst als oriëntatie, niet als volledige aangifteberekening.",
    ],
  };
}
