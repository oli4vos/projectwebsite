import { describe, expect, it } from "vitest";
import { calculateStudyStopScenarios } from "./studeren-stoppen";

const BASE_INPUT = {
  calculationMonth: "2026-07",
  studyLevel: "hbo" as const,
  currentLoanDebt: 30000,
  currentCollegegeldkredietDebt: 2000,
  currentBasisbeursDebt: 3000,
  currentAanvullendeBeursDebt: 1000,
  currentReisproductDebt: 0,
  monthlyLoan: 0,
  monthlyCollegegeldkrediet: 0,
  monthlyBasisbeurs: 0,
  monthlyAanvullendeBeurs: 0,
  monthlyReisproduct: 0,
  monthsUntilLaterDiploma: 24,
  monthsUntilContinueDiploma: 12,
  remainingDiplomaTermMonths: 120,
  repaymentRule: "SF35" as const,
  duoRateYear: 2026,
  annualStudyInterestRate: 0,
  annualRepaymentInterestRate: 0,
  grossAnnualIncome: 0,
  partnerGrossAnnualIncome: 0,
  hasPartner: false,
  oneTimeExtraRepayment: 0,
  monthlyExtraRepayment: 0,
  aflosvrijeMonths: 0,
};

describe("studeren-stoppen engine", () => {
  it("keeps a direct stop scenario stable when no interest is applied", () => {
    const result = calculateStudyStopScenarios(BASE_INPUT);
    const stopNow = result.scenarios[0];

    expect(stopNow.debtAtStop.total).toBe(36000);
    expect(stopNow.debtAtRepaymentStart.total).toBe(36000);
    expect(stopNow.repayment.statutoryMonthlyPayment).toBeGreaterThan(0);
    expect(stopNow.repayment.payoffDate).toBeDefined();
  });

  it("separates prestatiebeurs debt from always-repayable debt", () => {
    const result = calculateStudyStopScenarios(BASE_INPUT);
    const stopNow = result.scenarios[0];

    expect(stopNow.debtAtStop.alwaysRepayable).toBe(32000);
    expect(stopNow.debtAtStop.prestatiebeurs).toBe(4000);
    expect(stopNow.debtAtStop.giftConvertible).toBe(4000);
  });

  it("converts prestatiebeurs into a gift when a diploma is obtained on time", () => {
    const result = calculateStudyStopScenarios(BASE_INPUT);
    const laterDiploma = result.scenarios[1];

    expect(laterDiploma.diplomaMonth).toBe("2028-07");
    expect(laterDiploma.debtAtDiploma?.prestatiebeurs).toBe(0);
    expect(laterDiploma.debtAtRepaymentStart.total).toBe(32000);
  });

  it("projects extra study months into a higher debt than stopping now", () => {
    const result = calculateStudyStopScenarios({
      ...BASE_INPUT,
      monthlyLoan: 300,
      monthlyCollegegeldkrediet: 25,
      monthlyBasisbeurs: 100,
      monthlyAanvullendeBeurs: 50,
      monthlyReisproduct: 10,
    });

    const stopNow = result.scenarios[0];
    const continueToDiploma = result.scenarios[2];

    expect(continueToDiploma.debtAtStop.alwaysRepayable).toBeGreaterThan(
      stopNow.debtAtStop.alwaysRepayable,
    );
    expect(continueToDiploma.debtAtStop.total).toBeGreaterThanOrEqual(0);
  });

  it("builds the three user-facing focus scenarios from the same central scenario data", () => {
    const result = calculateStudyStopScenarios({
      ...BASE_INPUT,
      monthlyLoan: 300,
      monthlyCollegegeldkrediet: 25,
      monthlyBasisbeurs: 100,
      monthlyAanvullendeBeurs: 50,
      monthlyReisproduct: 10,
    });

    const [startBorrowing, stopCost, monthlyImpact] = result.focusScenarios;
    const stopNow = result.scenarios.find((scenario) => scenario.key === "stop-now-no-diploma");
    const continueToDiploma = result.scenarios.find((scenario) => scenario.key === "continue-to-diploma");

    expect(result.focusScenarios.map((scenario) => scenario.key)).toEqual([
      "start-study-borrowing",
      "stop-performance-grant-cost",
      "change-monthly-loan-impact",
    ]);
    expect(startBorrowing?.primaryAmount).toBe(continueToDiploma?.debtAtStop.total);
    expect(stopCost?.primaryAmount).toBe(stopNow?.debtAtStop.prestatiebeurs);
    expect(monthlyImpact?.primaryAmount).toBe(
      Math.round(
        ((continueToDiploma?.debtAtStop.alwaysRepayable ?? 0) -
          (stopNow?.debtAtStop.alwaysRepayable ?? 0)) *
          100,
      ) / 100,
    );
  });

  it("keeps interest running during an aflosvrije period", () => {
    const withoutAflosvrij = calculateStudyStopScenarios({
      ...BASE_INPUT,
      annualStudyInterestRate: 12,
      annualRepaymentInterestRate: 12,
      aflosvrijeMonths: 0,
    }).scenarios[0];
    const withAflosvrij = calculateStudyStopScenarios({
      ...BASE_INPUT,
      annualStudyInterestRate: 12,
      annualRepaymentInterestRate: 12,
      aflosvrijeMonths: 12,
    }).scenarios[0];

    expect(withAflosvrij.repayment.totalInterest).toBeGreaterThanOrEqual(
      withoutAflosvrij.repayment.totalInterest,
    );
    expect(withAflosvrij.repayment.monthsToDebtFree).toBeGreaterThanOrEqual(
      withoutAflosvrij.repayment.monthsToDebtFree,
    );
  });

  it("never increases debt when a voluntary extra repayment is added", () => {
    const noExtra = calculateStudyStopScenarios({
      ...BASE_INPUT,
      annualRepaymentInterestRate: 2.33,
      oneTimeExtraRepayment: 0,
      monthlyExtraRepayment: 0,
    }).scenarios[0];
    const withExtra = calculateStudyStopScenarios({
      ...BASE_INPUT,
      annualRepaymentInterestRate: 2.33,
      oneTimeExtraRepayment: 5000,
      monthlyExtraRepayment: 50,
    }).scenarios[0];

    expect(withExtra.repayment.finalDebt).toBeLessThanOrEqual(noExtra.repayment.finalDebt);
    expect(withExtra.repayment.monthsToDebtFree).toBeLessThanOrEqual(
      noExtra.repayment.monthsToDebtFree,
    );
  });

  it("sanitizes negative amounts defensively", () => {
    const result = calculateStudyStopScenarios({
      ...BASE_INPUT,
      currentLoanDebt: -100,
      currentCollegegeldkredietDebt: -100,
      monthlyLoan: -100,
      monthlyCollegegeldkrediet: -100,
      annualStudyInterestRate: -1,
      annualRepaymentInterestRate: -1,
      oneTimeExtraRepayment: -1,
      monthlyExtraRepayment: -1,
      aflosvrijeMonths: -1,
    });

    expect(result.currentBalances.total).toBe(4000);
    expect(result.annualStudyInterestRate).toBe(0);
    expect(result.scenarios[0].repayment.finalDebt).toBeGreaterThanOrEqual(0);
  });
});
