import { describe, expect, it } from "vitest";
import {
  calculateDuoLoanProjectionView,
  createDuoLoanProjectionDefaultValues,
  createFutureLoanMonthOptions,
  createStoppedBorrowingMonthOptions,
  getDuoLoanProjectionSliderConfig,
  mapDuoLoanProjectionFormToInput,
  updateDuoLoanProjectionLoanStatus,
  updateDuoLoanProjectionMonthlyLoanAmount,
  validateDuoLoanProjectionForm,
  type DuoLoanProjectionFormValues,
} from "./logic";

const CALCULATION_MONTH = "2026-01";

const validValues: DuoLoanProjectionFormValues = {
  currentDebt: "25000",
  loanStatus: "still-borrowing",
  monthlyLoanAmount: "300",
  expectedLastLoanMonth: "2026-12",
  stoppedBorrowingMonth: "2026-01",
  includeMortgageImpact: false,
};

describe("duo-doorlenen-of-stoppen logic", () => {
  it("maps UI input to the central DUO loan projection input", () => {
    const mapping = mapDuoLoanProjectionFormToInput(validValues, CALCULATION_MONTH);

    expect(mapping.errors).toEqual({});
    expect(mapping.input).toEqual({
      currentDebt: 25_000,
      monthlyLoanAmount: 300,
      expectedLastLoanMonth: "2026-12",
      includeMortgageImpact: false,
    });
  });

  it("keeps slider and number input synchronized through one field value", () => {
    const updated = updateDuoLoanProjectionMonthlyLoanAmount(validValues, "600");

    expect(updated.monthlyLoanAmount).toBe("600");
    expect(mapDuoLoanProjectionFormToInput(updated, CALCULATION_MONTH).input)
      .toMatchObject({ monthlyLoanAmount: 600 });
  });

  it("uses central DUO borrowing limits for the slider", () => {
    const slider = getDuoLoanProjectionSliderConfig();

    expect(slider.min).toBe(0);
    expect(slider.max).toBe(1213.95);
    expect(slider.step).toBeGreaterThan(0);
    expect(slider.sourceUrl).toContain("duo.nl");
  });

  it("validates negative debt, excessive monthly borrowing and past last loan month", () => {
    const errors = validateDuoLoanProjectionForm(
      {
        currentDebt: "-1",
        loanStatus: "still-borrowing",
        monthlyLoanAmount: "99999",
        expectedLastLoanMonth: "2025-12",
        stoppedBorrowingMonth: "2026-01",
        includeMortgageImpact: false,
      },
      CALCULATION_MONTH,
    );

    expect(errors.currentDebt).toBeDefined();
    expect(errors.monthlyLoanAmount).toBeDefined();
    expect(errors.expectedLastLoanMonth).toBeDefined();
  });

  it("maps already-stopped input to zero future borrowing from the calculation month", () => {
    const stoppedValues = updateDuoLoanProjectionLoanStatus(
      {
        ...validValues,
        monthlyLoanAmount: "600",
        expectedLastLoanMonth: "2026-12",
      },
      "already-stopped",
      CALCULATION_MONTH,
    );
    const mapping = mapDuoLoanProjectionFormToInput(stoppedValues, CALCULATION_MONTH);

    expect(stoppedValues.loanStatus).toBe("already-stopped");
    expect(stoppedValues.monthlyLoanAmount).toBe("0");
    expect(mapping.errors).toEqual({});
    expect(mapping.input).toMatchObject({
      currentDebt: 25_000,
      monthlyLoanAmount: 0,
      expectedLastLoanMonth: CALCULATION_MONTH,
    });
  });

  it("validates stopped borrowing month separately from future loan month", () => {
    const errors = validateDuoLoanProjectionForm(
      {
        ...validValues,
        loanStatus: "already-stopped",
        monthlyLoanAmount: "99999",
        expectedLastLoanMonth: "2025-12",
        stoppedBorrowingMonth: "2026-02",
      },
      CALCULATION_MONTH,
    );

    expect(errors.monthlyLoanAmount).toBeUndefined();
    expect(errors.expectedLastLoanMonth).toBeUndefined();
    expect(errors.stoppedBorrowingMonth).toBeDefined();
  });

  it("creates quick month choices so users do not have to type a final loan month", () => {
    const futureOptions = createFutureLoanMonthOptions(CALCULATION_MONTH);
    const stoppedOptions = createStoppedBorrowingMonthOptions(CALCULATION_MONTH);

    expect(futureOptions.map((option) => option.value)).toEqual([
      "2026-01",
      "2026-03",
      "2026-06",
      "2026-12",
      "2027-12",
    ]);
    expect(stoppedOptions.map((option) => option.value)).toEqual([
      "2026-01",
      "2025-12",
      "2025-07",
      "2025-01",
    ]);
  });

  it("compares stopping now with borrowing through the chosen final loan month", () => {
    const view = calculateDuoLoanProjectionView(validValues, CALCULATION_MONTH);

    expect(view.isValid).toBe(true);
    if (!view.isValid) {
      throw new Error("view should be valid");
    }

    expect(view.stopNow.lastLoanMonth).toBe(CALCULATION_MONTH);
    expect(view.keepBorrowing.lastLoanMonth).toBe("2026-12");
    expect(view.keepBorrowing.borrowingMonths).toBe(12);
    expect(view.comparison.debtAtRepaymentStartDifference).toBeGreaterThan(0);
    expect(view.comparison.theoreticalMonthlyPaymentDifference).toBeGreaterThan(0);
  });

  it("does not show mortgage impact columns unless the user opts in", () => {
    const view = calculateDuoLoanProjectionView(validValues, CALCULATION_MONTH);

    expect(view.isValid).toBe(true);
    if (!view.isValid) {
      throw new Error("view should be valid");
    }

    expect(view.showMortgageImpact).toBe(false);
    expect(view.keepBorrowing.mortgageImpact).toBeUndefined();
    expect(view.comparison.tableRows.every((row) => row.mortgageCapacityReduction === undefined))
      .toBe(true);
  });

  it("shows mortgage impact when opted in and keeps it separate from DUO payments", () => {
    const view = calculateDuoLoanProjectionView(
      { ...validValues, includeMortgageImpact: true },
      CALCULATION_MONTH,
    );

    expect(view.isValid).toBe(true);
    if (!view.isValid) {
      throw new Error("view should be valid");
    }

    expect(view.showMortgageImpact).toBe(true);
    expect(view.keepBorrowing.mortgageImpact).toBeDefined();
    expect(view.comparison.mortgageCapacityReductionDifference).toBeGreaterThan(0);
    expect(view.comparison.theoreticalMonthlyPaymentDifference).toBe(
      view.comparison.tableRows[2]?.theoreticalMonthlyPayment,
    );
  });

  it("creates a realistic default with a future final loan month", () => {
    const defaults = createDuoLoanProjectionDefaultValues(CALCULATION_MONTH);

    expect(defaults.currentDebt).toBe("25000");
    expect(defaults.loanStatus).toBe("still-borrowing");
    expect(defaults.monthlyLoanAmount).toBe("300");
    expect(defaults.expectedLastLoanMonth).toBe("2026-12");
    expect(defaults.stoppedBorrowingMonth).toBe(CALCULATION_MONTH);
  });
});
