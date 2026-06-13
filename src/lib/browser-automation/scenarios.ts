import type { MortgageAutomationScenario } from "@/lib/browser-automation/types";

export function buildMortgageComparisonScenarios(limit = 100): MortgageAutomationScenario[] {
  const scenarios: MortgageAutomationScenario[] = [];
  const incomes = [45_000, 55_000, 65_000, 75_000, 85_000];
  const rates = [3.0, 3.8, 4.5, 5.2, 5.8];
  const debtLevels = [0, 150, 250, 400];
  let id = 1;

  for (const income of incomes) {
    for (const rate of rates) {
      for (const debt of debtLevels) {
        const hasPartner = id % 2 === 0;
        scenarios.push({
          id,
          label: hasPartner ? "starter met partner" : "starter solo",
          input: {
            grossAnnualHouseholdIncome: income,
            grossAnnualPartnerIncome: hasPartner ? 20_000 : 0,
            annualMortgageRate: rate,
            fixedRatePeriodMonths: id % 4 === 0 ? 60 : 120,
            mortgageTermYears: 30,
            monthlyDebtPayments: debt,
            hasStudentLoan: id % 5 === 0,
            studentLoanMonthlyPayment: id % 5 === 0 ? 165 : undefined,
            purchasePrice: 275_000 + (id % 8) * 15_000,
            marketValue: 275_000 + (id % 8) * 15_000,
            ownFunds: 10_000 + (id % 6) * 4_000,
            nhgRequested: id % 3 !== 0,
            energyLabel: id % 4 === 0 ? "A" : id % 4 === 1 ? "B" : "unknown",
            energySavingMeasuresAmount: id % 4 === 0 ? 15_000 : 0,
          },
        });
        id += 1;
        if (scenarios.length === limit) {
          return scenarios;
        }
      }
    }
  }

  return scenarios.slice(0, limit);
}
