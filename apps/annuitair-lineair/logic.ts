import {
  TAX_FACTOR_DEFAULT,
  calculateAnnuitySchedule,
  calculateLinearSchedule,
} from "./mortgageCalculator";
import {
  aggregatePerYear,
  simulateInvestmentPot,
} from "./investmentStrategy";

export type MortgageInput = {
  loanAmount: number;
  interestRatePercent: number;
  loanTermYears: number;
  annualReturnPercent: number;
  taxFactor?: number;
};

export function calculateMortgageComparison({
  loanAmount,
  interestRatePercent,
  loanTermYears,
  annualReturnPercent,
  taxFactor = TAX_FACTOR_DEFAULT,
}: MortgageInput) {
  const annuityRows = calculateAnnuitySchedule(
    loanAmount,
    interestRatePercent,
    loanTermYears,
    taxFactor,
  );
  const linearRows = calculateLinearSchedule(
    loanAmount,
    interestRatePercent,
    loanTermYears,
    taxFactor,
  );
  const potSimulation = simulateInvestmentPot({
    annuityRows,
    linearRows,
    annualReturnPercent,
    clampToZero: true,
  });
  const yearlySummary = aggregatePerYear({
    potMonths: potSimulation.months,
  });

  const firstAnnuity = annuityRows[0];
  const firstLinear = linearRows[0];
  const totalAnnuityInterest = annuityRows.reduce(
    (sum, row) => sum + row.interestPayment,
    0,
  );
  const totalLinearInterest = linearRows.reduce(
    (sum, row) => sum + row.interestPayment,
    0,
  );

  return {
    annuityRows,
    linearRows,
    potSimulation,
    yearlySummary,
    firstMonth: {
      annuityBruto: firstAnnuity.totalPayment,
      annuityNetto: firstAnnuity.nettoMonthly,
      linearBruto: firstLinear.totalPayment,
      linearNetto: firstLinear.nettoMonthly,
      monthlyDifferenceNetto: firstLinear.nettoMonthly - firstAnnuity.nettoMonthly,
    },
    totals: {
      totalAnnuityInterest,
      totalLinearInterest,
      interestBenefitLinear: totalAnnuityInterest - totalLinearInterest,
      endPot: potSimulation.summary.eindPot,
      maxPot: potSimulation.summary.maxPot,
      totalInleg: potSimulation.summary.totalInleg,
      totalOnttrekking: potSimulation.summary.totalOnttrekking,
      totalRendement: potSimulation.summary.totalRendement,
      totalTekort: potSimulation.summary.totalTekort,
      omslagMaand: potSimulation.summary.omslagMaand,
    },
  };
}
