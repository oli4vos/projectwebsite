import { describe, expect, it } from "vitest";
import {
  createSimpleDuoView,
  defaultSimpleDuoValues,
  getSimpleDuoMonthlyLimits,
  maxBorrowingWithoutDiplomaValues,
  validateSimpleDuoValues,
  type SimpleDuoValues,
} from "./focused-logic";

function valuesForAugust2026(): SimpleDuoValues {
  return {
    ...defaultSimpleDuoValues("start-borrowing"),
    calculationMonth: "2026-08",
    monthlyLoan: "0",
    monthlyCollegegeldkrediet: "0",
    monthlyBasisbeurs: "0",
    monthlyAanvullendeBeurs: "0",
    monthlyReisproduct: "0",
  };
}

describe("centrale DUO-maandmaxima in de eenvoudige tools", () => {
  it("haalt alle veldlimieten uit de periodegebonden centrale 2026-dataset", () => {
    expect(getSimpleDuoMonthlyLimits("2026-08")).toEqual({
      monthlyLoan: 1_213.95,
      monthlyCollegegeldkrediet: 1_083.75,
      regularTuitionCredit: 216.75,
      monthlyBasisbeurs: 324.52,
      monthlyAanvullendeBeurs: 491.08,
      totalExcludingTuitionCredit: 1_213.95,
      periodId: "higher-education-2026-jan-aug",
    });
    expect(getSimpleDuoMonthlyLimits("2026-09")).toMatchObject({
      monthlyCollegegeldkrediet: 1_122.5,
      regularTuitionCredit: 224.5,
      periodId: "higher-education-2026-sep-dec",
    });
  });

  it.each([
    ["monthlyLoan", "1213,96", "€ 1.213,95"],
    ["monthlyCollegegeldkrediet", "1083,76", "€ 1.083,75"],
    ["monthlyBasisbeurs", "324,53", "€ 324,52"],
    ["monthlyAanvullendeBeurs", "491,09", "€ 491,08"],
  ] as const)("blokkeert %s boven de centrale norm", (field, value, maximum) => {
    const errors = validateSimpleDuoValues("start-borrowing", {
      ...valuesForAugust2026(),
      [field]: value,
    });

    expect(errors[field]).toContain(maximum);
  });

  it("accepteert de maxima zelf en blokkeert een te hoog samengesteld maandtotaal", () => {
    const limits = getSimpleDuoMonthlyLimits("2026-08");
    expect(limits).not.toBeNull();

    expect(
      validateSimpleDuoValues("start-borrowing", {
        ...valuesForAugust2026(),
        monthlyLoan: String(limits!.monthlyLoan),
      }),
    ).not.toHaveProperty("monthlyLoan");

    const combinedErrors = validateSimpleDuoValues("start-borrowing", {
      ...valuesForAugust2026(),
      monthlyLoan: "800",
      monthlyBasisbeurs: "324,52",
      monthlyAanvullendeBeurs: "491,08",
    });
    expect(combinedErrors.monthlyLoan).toContain("samen maximaal");
    expect(combinedErrors.monthlyLoan).toContain("€ 1.213,95");
  });

  it("begrenst geen opgebouwde schuldsaldi en blokkeert maanden zonder norm", () => {
    const stopErrors = validateSimpleDuoValues("stop-cost", {
      ...defaultSimpleDuoValues("stop-cost"),
      calculationMonth: "2026-08",
      currentLoanDebt: "250000",
      currentCollegegeldkredietDebt: "100000",
    });
    expect(stopErrors.currentLoanDebt).toBeUndefined();
    expect(stopErrors.currentCollegegeldkredietDebt).toBeUndefined();

    const unsupportedMonthErrors = validateSimpleDuoValues("monthly-impact", {
      ...defaultSimpleDuoValues("monthly-impact"),
      calculationMonth: "2027-01",
    });
    expect(unsupportedMonthErrors.calculationMonth).toBe(
      "Voor deze maand zijn geen centrale DUO-maximumbedragen beschikbaar.",
    );
  });

  it("bouwt het maximale scenario met centrale bedragen en zonder giftomzetting", () => {
    const values = maxBorrowingWithoutDiplomaValues({
      ...valuesForAugust2026(),
      monthsUntilDiploma: "24",
    });

    expect(values).toMatchObject({
      calculationMonth: "2026-08",
      monthsUntilDiploma: "24",
      monthlyLoan: "315.17",
      monthlyCollegegeldkrediet: "216.75",
      monthlyBasisbeurs: "324.52",
      monthlyAanvullendeBeurs: "491.08",
      monthlyReisproduct: "0",
    });

    const view = createSimpleDuoView(
      "start-borrowing",
      values,
      "max-borrowing-no-diploma",
    );
    expect(view.isValid).toBe(true);
    if (view.isValid) {
      const scenario = view.result.scenarios.find(
        ({ key }) => key === "continue-no-diploma",
      );
      expect(view.focusScenario.key).toBe("max-borrowing-no-diploma");
      expect(scenario?.diplomaMonth).toBeUndefined();
      expect(scenario?.debtAtStop.prestatiebeurs).toBeGreaterThan(0);
      expect(view.focusScenario.primaryAmount).toBe(scenario?.debtAtStop.total);
    }
  });
});
