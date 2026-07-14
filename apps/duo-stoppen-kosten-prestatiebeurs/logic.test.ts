import { describe, expect, it } from "vitest";
import { createSimpleDuoView, defaultSimpleDuoValues } from "../_duo_simple/focused-logic";

describe("duo-stoppen-kosten-prestatiebeurs", () => {
  it("keeps the performance grant cost separate from always repayable debt", () => {
    const view = createSimpleDuoView("stop-cost", {
      ...defaultSimpleDuoValues("stop-cost"),
      calculationMonth: "2026-07",
      currentLoanDebt: "1000",
      currentCollegegeldkredietDebt: "500",
      currentBasisbeursDebt: "1200",
      currentAanvullendeBeursDebt: "800",
      currentReisproductDebt: "400",
      duoRateYear: "2026",
    });

    expect(view.isValid).toBe(true);
    if (view.isValid) {
      expect(view.focusScenario.key).toBe("stop-performance-grant-cost");
      expect(view.focusScenario.primaryAmount).toBe(2400);
      expect(view.result.scenarios[0].debtAtStop.alwaysRepayable).toBe(1500);
    }
  });
});
