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
      expect(source.officialSourceUrl).toMatch(/^https:\/\/www\.belastingdienst\.nl\//);
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
