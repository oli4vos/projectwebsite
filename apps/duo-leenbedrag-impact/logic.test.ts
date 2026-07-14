import { describe, expect, it } from "vitest";
import { createSimpleDuoView, defaultSimpleDuoValues } from "../_duo_simple/focused-logic";

describe("duo-leenbedrag-impact", () => {
  it("shows the extra always repayable debt from a monthly loan amount", () => {
    const view = createSimpleDuoView("monthly-impact", {
      ...defaultSimpleDuoValues("monthly-impact"),
      calculationMonth: "2026-07",
      monthsUntilDiploma: "12",
      currentLoanDebt: "10000",
      currentCollegegeldkredietDebt: "0",
      currentBasisbeursDebt: "0",
      currentAanvullendeBeursDebt: "0",
      currentReisproductDebt: "0",
      monthlyLoan: "200",
      monthlyCollegegeldkrediet: "0",
      duoRateYear: "2026",
      repaymentRule: "SF35",
    });

    expect(view.isValid).toBe(true);
    if (view.isValid) {
      expect(view.focusScenario.key).toBe("change-monthly-loan-impact");
      expect(view.focusScenario.primaryAmount).toBeGreaterThanOrEqual(2400);
      expect(view.result.repaymentRule).toBe("SF35");
      expect(view.focusScenario.repaymentTermYears).toBe(35);
      expect(view.focusScenario.debtAtRepaymentStart).toBeGreaterThan(0);
      expect(view.focusScenario.totalPaid).toBeGreaterThanOrEqual(
        view.focusScenario.debtAtRepaymentStart,
      );
      expect(view.focusScenario.totalInterest).toBeGreaterThanOrEqual(0);
    }
  });
});
