import { describe, expect, it } from "vitest";
import { ALLOWANCE_CALCULATION_RULES_2026, type AllowanceCalculationRules2026 } from "@/lib/financial-constants/allowance-calculation-rules-2026";
import { getActiveDataset, validateDatasetRegistry } from "@/lib/financial-constants/source-datasets";
import type { SourceDataset } from "@/lib/financial-constants/types";

function collectSourceValues(value: unknown): Array<Record<string, unknown>> {
  const sourceValues: Array<Record<string, unknown>> = [];

  function visit(candidateValue: unknown) {
    if (Array.isArray(candidateValue)) {
      for (const item of candidateValue) visit(item);
      return;
    }

    if (typeof candidateValue !== "object" || candidateValue === null) {
      return;
    }

    const candidate = candidateValue as Record<string, unknown>;
    if (typeof candidate.regulationId === "string" && typeof candidate.officialSourceUrl === "string") {
      sourceValues.push(candidate);
    }

    for (const nested of Object.values(candidate)) visit(nested);
  }

  visit(value);
  return sourceValues;
}

function datasetFor(data: AllowanceCalculationRules2026): SourceDataset {
  const activeDataset = getActiveDataset("allowance-calculation-rules", {
    scenario: "official-2026-prepared",
    asOf: "2026-07-20",
  });

  return {
    ...activeDataset,
    meta: {
      ...activeDataset.meta,
      id: "test-allowance-calculation-rules",
    },
    data,
  };
}

function expectStrictlyIncreasingIncomeTable(table: readonly { incomeUpTo: number; monthlyAmount: number }[]) {
  for (let index = 1; index < table.length; index += 1) {
    expect(table[index].incomeUpTo).toBeGreaterThan(table[index - 1].incomeUpTo);
  }
}

function expectNonIncreasingMonthlyAmounts(table: readonly { incomeUpTo: number; monthlyAmount: number }[]) {
  for (let index = 1; index < table.length; index += 1) {
    expect(table[index].monthlyAmount).toBeLessThanOrEqual(table[index - 1].monthlyAmount);
  }
}

describe("allowance calculation rules 2026 source data", () => {
  it("keeps healthcare allowance tables ordered and bounded at the official 2026 income cutoffs", () => {
    const { healthcare } = ALLOWANCE_CALCULATION_RULES_2026;

    expectStrictlyIncreasingIncomeTable(healthcare.monthlyTableSingle);
    expectStrictlyIncreasingIncomeTable(healthcare.monthlyTableWithPartner);
    expectNonIncreasingMonthlyAmounts(healthcare.monthlyTableSingle);
    expectNonIncreasingMonthlyAmounts(healthcare.monthlyTableWithPartner);

    expect(healthcare.monthlyTableSingle[0]).toEqual({ incomeUpTo: 29_500, monthlyAmount: 129 });
    expect(healthcare.monthlyTableSingle.at(-1)).toEqual({ incomeUpTo: 41_000, monthlyAmount: 0 });
    expect(healthcare.monthlyTableWithPartner[0]).toEqual({ incomeUpTo: 29_500, monthlyAmount: 246 });
    expect(healthcare.monthlyTableWithPartner.at(-1)).toEqual({ incomeUpTo: 51_500, monthlyAmount: 0 });
  });

  it("keeps every machine-readable allowance source tied to the 2026 Belastingdienst source contract", () => {
    const sourceValues = collectSourceValues(ALLOWANCE_CALCULATION_RULES_2026);

    expect(sourceValues.length).toBeGreaterThanOrEqual(15);
    for (const source of sourceValues) {
      expect(source.calculationYear).toBe(2026);
      expect(source.validFrom).toBe("2026-01-01");
      expect(source.validUntil).toBe("2026-12-31");
      expect(source.reviewedAt).toBe("2026-07-20");
      expect(source.officialSourceUrl).toMatch(/^https:\/\/(www|download)\.belastingdienst\.nl\//);
      expect(source.verificationStatus).toMatch(/^(verified|blocked-pending-official-normalization)$/);
      expect(typeof source.interpretationNote).toBe("string");
      expect((source.interpretationNote as string).length).toBeGreaterThan(20);
    }
  });

  it("documents unsupported official amount engines with explicit blockers and required inputs", () => {
    const { healthcare, rent, childBudget, childcare } = ALLOWANCE_CALCULATION_RULES_2026;

    expect(healthcare.requiredInputs).toEqual(
      expect.arrayContaining([
        "age",
        "hasDutchHealthInsurance",
        "partnerStatus",
        "assessmentIncome or jointAssessmentIncome",
      ]),
    );
    expect(rent.blockers.length).toBeGreaterThan(0);
    expect(childBudget.blockers.length).toBeGreaterThan(0);
    expect(childcare.blockers.length).toBeGreaterThan(0);
    expect(ALLOWANCE_CALCULATION_RULES_2026.unknownRoutes.map((route) => route.fieldId)).toEqual(
      expect.arrayContaining(["assessmentIncome", "assets", "rent.basicRent", "childcare.hoursAndHourlyRate"]),
    );
  });

  it("normalizes official 2026 rent benefit calculation parameters and examples", () => {
    const { rent } = ALLOWANCE_CALCULATION_RULES_2026;

    expect(rent.calculationStatus).toBe("amount-ready");
    expect(rent.baseRentSingleHousehold.value).toBe(202.52);
    expect(rent.baseRentMultiPersonHousehold.value).toBe(200.71);
    expect(rent.qualityDiscountThreshold.value).toBe(498.2);
    expect(rent.cappingThresholdOneOrTwoPersons.value).toBe(713.02);
    expect(rent.cappingThresholdThreeOrMorePersons.value).toBe(764.14);
    expect(rent.incomeReferencePointSingleHousehold.value).toBe(23_425);
    expect(rent.incomeReferencePointMultiPersonHousehold.value).toBe(31_500);
    expect(rent.incomeTaperSingleHousehold.value).toBe(27);
    expect(rent.incomeTaperMultiPersonHousehold.value).toBe(22);
    expect(rent.roundingRule.value).toBe("round-monthly-down-whole-euros");
    expect(rent.calculationSteps).toHaveLength(11);

    expect(ALLOWANCE_CALCULATION_RULES_2026.officialTestVectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "rent-official-example-young-single-2026" }),
        expect.objectContaining({ id: "rent-official-example-partners-high-rent-2026" }),
        expect.objectContaining({ id: "rent-official-example-aow-single-2026" }),
      ]),
    );
  });

  it("normalizes official 2026 child budget amounts and taper parameters", () => {
    const { childBudget } = ALLOWANCE_CALCULATION_RULES_2026;

    expect(childBudget.calculationStatus).toBe("amount-ready");
    expect(childBudget.maxAnnualOneChildSingleParent.value).toBe(5_996);
    expect(childBudget.maxAnnualTwoChildrenSingleParent.value).toBe(8_576);
    expect(childBudget.maxAnnualOneChildWithPartner.value).toBe(2_580);
    expect(childBudget.maxAnnualTwoChildrenWithPartner.value).toBe(5_160);
    expect(childBudget.additionalAnnualFromThirdChild.value).toBe(2_580);
    expect(childBudget.ageIncrease12To15.value).toBe(724);
    expect(childBudget.ageIncrease16To17.value).toBe(964);
    expect(childBudget.thresholdIncomeSingleParentChange2026.value).toBe(29_736);
    expect(childBudget.thresholdIncomeSingleParentChange2026.interpretationNote).toContain("afbouwpunt");
    expect(childBudget.thresholdIncomePartnersChange2026.value).toBe(39_141);
    expect(childBudget.taperPercent.value).toBe(7.6);
    expect(childBudget.domesticResidenceFactor.value).toBe(100);
  });

  it("normalizes the official 2026 childcare reimbursement table and first-child rule", () => {
    const { childcare } = ALLOWANCE_CALCULATION_RULES_2026;

    expect(childcare.calculationStatus).toBe("blocked-pending-formula");
    expect(childcare.firstChildRule.value).toBe("child-with-most-subsidisable-hours-then-highest-subsidisable-costs");
    expect(childcare.percentageTable).toHaveLength(69);
    expect(childcare.percentageTable[0]).toEqual({
      incomeFrom: 0,
      incomeTo: 24_149,
      firstChildPercent: 96,
      nextChildPercent: 96,
    });
    expect(childcare.percentageTable.at(-1)).toEqual({
      incomeFrom: 235_698,
      incomeTo: 99_999_999,
      firstChildPercent: 36.5,
      nextChildPercent: 68.2,
    });

    for (let index = 1; index < childcare.percentageTable.length; index += 1) {
      expect(childcare.percentageTable[index].incomeFrom).toBe(childcare.percentageTable[index - 1].incomeTo + 1);
    }
  });

  it("fails validation when a source value loses its official URL or becomes negative", () => {
    const rules: AllowanceCalculationRules2026 = {
      ...ALLOWANCE_CALCULATION_RULES_2026,
      healthcare: {
        ...ALLOWANCE_CALCULATION_RULES_2026.healthcare,
        maxIncomeSingle: {
          ...ALLOWANCE_CALCULATION_RULES_2026.healthcare.maxIncomeSingle,
          value: -1,
          officialSourceUrl: "https://example.com/not-official",
        },
      },
    };

    const result = validateDatasetRegistry([datasetFor(rules)], "2026-07-20");

    expect(result.ok).toBe(false);
    expect(result.errors.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Toeslagenbronwaarde moet naar een officiele Belastingdienst/Dienst Toeslagen-URL verwijzen.",
        "Toeslagenbronwaarde mag niet negatief zijn.",
      ]),
    );
  });

  it("fails validation when prepared non-healthcare amount engines lose explicit blockers", () => {
    const rules: AllowanceCalculationRules2026 = {
      ...ALLOWANCE_CALCULATION_RULES_2026,
      rent: { ...ALLOWANCE_CALCULATION_RULES_2026.rent, blockers: [] },
      childBudget: { ...ALLOWANCE_CALCULATION_RULES_2026.childBudget, blockers: [] },
      childcare: { ...ALLOWANCE_CALCULATION_RULES_2026.childcare, blockers: [] },
    };

    const result = validateDatasetRegistry([datasetFor(rules)], "2026-07-20");

    expect(result.ok).toBe(false);
    expect(result.errors.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Toeslagenberekeningsdataset mist expliciete blockers voor rent.",
        "Toeslagenberekeningsdataset mist expliciete blockers voor childBudget.",
        "Toeslagenberekeningsdataset mist expliciete blockers voor childcare.",
      ]),
    );
  });
});
