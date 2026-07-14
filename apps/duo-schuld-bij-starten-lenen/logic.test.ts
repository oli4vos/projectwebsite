import { describe, expect, it } from "vitest";
import { createSimpleDuoView, defaultSimpleDuoValues } from "../_duo_simple/focused-logic";

describe("duo-schuld-bij-starten-lenen", () => {
  it("uses the central DUO engine for the start borrowing scenario", () => {
    const view = createSimpleDuoView("start-borrowing", {
      ...defaultSimpleDuoValues("start-borrowing"),
      calculationMonth: "2026-07",
      monthsUntilDiploma: "24",
      monthlyLoan: "300",
      monthlyCollegegeldkrediet: "25",
      monthlyBasisbeurs: "0",
      monthlyAanvullendeBeurs: "0",
      monthlyReisproduct: "0",
      duoRateYear: "2026",
    });

    expect(view.isValid).toBe(true);
    if (view.isValid) {
      expect(view.focusScenario.key).toBe("start-study-borrowing");
      expect(view.focusScenario.primaryAmount).toBeGreaterThan(0);
      expect(view.result.scenarios[2].debtAtStop.alwaysRepayable).toBe(view.focusScenario.secondaryAmount);
    }
  });
});
