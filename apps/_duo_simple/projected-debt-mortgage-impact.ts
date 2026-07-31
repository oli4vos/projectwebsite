import {
  getAvailableDuoRateYears,
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoRateForRule,
} from "@/lib/financial-constants";
import {
  calculateStatutoryDuoMonthlyPayment,
  sanitizeDuoMoney,
} from "@/lib/duo";
import { calculateMonthlyObligationMortgageCapacityReduction } from "@/lib/mortgage";

export type ProjectedDebtMortgageImpact = Readonly<{
  debtAtStudyEnd: number;
  statutoryMonthlyPayment: number;
  indicativeMortgageSpaceReduction: number;
  duoRateYear: number;
  duoAnnualInterestRate: number;
  duoRepaymentTermYears: number;
  mortgageAnnualInterestRate: number;
  mortgageTermYears: number;
  mortgageGrossUpFactor: number;
  assumptions: readonly string[];
}>;

export function calculateProjectedDebtMortgageImpact(
  debtAtStudyEnd: number,
): ProjectedDebtMortgageImpact {
  const normYear = getDefaultFinancialYear();
  const duoRateYear = getAvailableDuoRateYears(1)[0] ?? normYear;
  const duoAnnualInterestRate = getDuoRateForRule("SF35", duoRateYear);
  const duoRepaymentTermYears = getDuoDefaultTermForRule("SF35", normYear);
  const safeDebtAtStudyEnd = sanitizeDuoMoney(debtAtStudyEnd);
  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    repaymentRule: "SF35",
    remainingDebt: safeDebtAtStudyEnd,
    annualInterestRate: duoAnnualInterestRate,
    duoRateYear,
    remainingTermYears: duoRepaymentTermYears,
  });
  const mortgageImpact = calculateMonthlyObligationMortgageCapacityReduction({
    monthlyPayment: statutoryMonthlyPayment,
    normYear,
  });

  return Object.freeze({
    debtAtStudyEnd: safeDebtAtStudyEnd,
    statutoryMonthlyPayment,
    indicativeMortgageSpaceReduction: mortgageImpact.principalReduction,
    duoRateYear,
    duoAnnualInterestRate,
    duoRepaymentTermYears,
    mortgageAnnualInterestRate: mortgageImpact.annualMortgageRateUsed,
    mortgageTermYears: mortgageImpact.mortgageTermYearsUsed,
    mortgageGrossUpFactor: mortgageImpact.grossUpFactor,
    assumptions: Object.freeze([
      `De eindschuld wordt annuïtair afgelost volgens SF35 in ${duoRepaymentTermYears} jaar.`,
      `We gebruiken de meest recente centrale DUO-rente: ${duoAnnualInterestRate.toFixed(2)}% voor rentejaar ${duoRateYear}.`,
      ...mortgageImpact.assumptions,
      "Inkomen, draagkracht, andere schulden, woningwaarde en acceptatiebeleid van een bank zijn niet meegerekend.",
    ]),
  });
}
