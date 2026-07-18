import { describe, expect, it } from "vitest";

import { buildMortgageCalculationInput, exampleValues } from "./logic";
import {
  buildSalaryExplorerViewModel,
  defaultSalaryExplorerForm,
  getSalaryExplorerSliderConfig,
  validateSalaryExplorerForm,
} from "./salary-explorer";

const baseInput = buildMortgageCalculationInput(exampleValues);

describe("maximale hypotheek salary explorer adapter", () => {
  it("starts from the submitted household income without suggesting an increase", () => {
    expect(defaultSalaryExplorerForm(baseInput)).toEqual({
      newGrossAnnualIncome: "80000",
    });

    const viewModel = buildSalaryExplorerViewModel(
      defaultSalaryExplorerForm(baseInput),
      baseInput,
    );

    expect(viewModel?.currentGrossAnnualIncome).toBe(80000);
    expect(viewModel?.monthlyIncrease).toBe(0);
    expect(
      viewModel?.result.scenarios.find((scenario) => scenario.key === "custom")
        ?.additionalBorrowingPower,
    ).toBe(0);
  });

  it("builds the required fixed salary scenarios through the central adapter", () => {
    const viewModel = buildSalaryExplorerViewModel(
      { newGrossAnnualIncome: "86000" },
      baseInput,
    );

    expect(viewModel?.result.scenarios.map((scenario) => scenario.key)).toEqual([
      "current",
      "plus-100-month",
      "plus-250-month",
      "plus-500-month",
      "custom",
    ]);
    expect(
      viewModel?.result.scenarios.find((scenario) => scenario.key === "plus-100-month")
        ?.monthlyIncrease,
    ).toBe(100);
    expect(
      viewModel?.result.scenarios.find((scenario) => scenario.key === "plus-250-month")
        ?.monthlyIncrease,
    ).toBe(250);
    expect(
      viewModel?.result.scenarios.find((scenario) => scenario.key === "plus-500-month")
        ?.monthlyIncrease,
    ).toBe(500);
    expect(viewModel?.monthlyIncrease).toBe(500);
    expect(viewModel?.result.scenarios[4].maxMortgage).toBeGreaterThan(
      viewModel?.result.scenarios[0].maxMortgage ?? 0,
    );
  });

  it("allows a lower new income and surfaces the central warning", () => {
    const viewModel = buildSalaryExplorerViewModel(
      { newGrossAnnualIncome: "70000" },
      baseInput,
    );

    expect(viewModel?.monthlyIncrease).toBeLessThan(0);
    expect(viewModel?.result.warnings).toContain("custom-income-below-current-income");
  });

  it("rejects invalid, below-minimum and above-maximum exact input", () => {
    expect(validateSalaryExplorerForm({ newGrossAnnualIncome: "" }, baseInput)).toMatchObject({
      parsed: null,
      error: "Vul een geldig bruto jaarinkomen in.",
    });
    expect(
      validateSalaryExplorerForm({ newGrossAnnualIncome: "-1" }, baseInput),
    ).toMatchObject({
      parsed: null,
    });
    expect(
      validateSalaryExplorerForm({ newGrossAnnualIncome: "300000" }, baseInput),
    ).toMatchObject({
      parsed: null,
    });
  });

  it("keeps valid exact input outside the practical slider range without silent clamp", () => {
    const slider = getSalaryExplorerSliderConfig(80000, 100000);
    const validation = validateSalaryExplorerForm(
      { newGrossAnnualIncome: "100000" },
      baseInput,
    );
    const viewModel = buildSalaryExplorerViewModel(
      { newGrossAnnualIncome: "100000" },
      baseInput,
    );

    expect(slider.max).toBe(96000);
    expect(validation).toMatchObject({
      parsed: 100000,
      outsidePracticalSliderRange: true,
    });
    expect(viewModel?.newGrossAnnualIncome).toBe(100000);
    expect(viewModel?.slider.value).toBe(96000);
  });
});
