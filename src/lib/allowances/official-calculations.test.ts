import { describe, expect, it } from "vitest";

import {
  calculateOfficialAllowance2026,
  calculateOfficialAllowanceScan2026,
} from "@/lib/allowances/official-calculations";
import { evaluateAllowanceSignals } from "@/lib/allowances/signaling";
import type { OfficialAllowanceCalculationInput } from "@/lib/allowances/official-calculations";

const completeInput: OfficialAllowanceCalculationInput = {
  calculationYear: 2026,
  year: 2026,
  age: 30,
  partnerStatus: "no",
  assessmentIncome: 29_500,
  assets: 10_000,
  healthcare: { hasDutchHealthInsurance: true },
  rent: {
    tenure: "rent",
    independentHome: true,
    basicRent: 900,
    hasCoResidents: false,
  },
  childBudget: {
    hasChildren: true,
    childAges: [6],
    receivesChildBenefit: true,
    childLivesWithApplicant: true,
  },
  childcare: {
    hasChildren: true,
    usesChildcare: true,
    registeredChildcare: true,
    childLivesWithApplicant: true,
    paysOwnContribution: true,
    applicantHasQualifyingActivity: true,
    partnerHasQualifyingActivity: "not-applicable",
    hoursPerMonth: 80,
  },
};

function expectOk<T>(result: { ok: true; value: T } | { ok: false; errors: readonly string[] }): T {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.errors.join(", "));
  }
  return result.value;
}

describe("official allowance calculations 2026", () => {
  it("requires calculationYear 2026 and rejects year mismatches", () => {
    expect(
      calculateOfficialAllowanceScan2026({
        ...completeInput,
        calculationYear: 2025,
      }).ok,
    ).toBe(false);
    expect(
      calculateOfficialAllowanceScan2026({
        ...completeInput,
        year: 2025,
      }),
    ).toEqual({
      ok: false,
      errors: ["allowance-input-year-mismatch"],
    });
  });

  it("returns all four immutable assessments with source references", () => {
    const input = structuredClone(completeInput);
    const original = structuredClone(input);
    const first = expectOk(calculateOfficialAllowanceScan2026(input));
    const second = expectOk(calculateOfficialAllowanceScan2026(input));

    expect(first.results.map((result) => result.allowanceKind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    expect(first).toEqual(second);
    expect(input).toEqual(original);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.results[0].amount.estimate)).toBe(true);
    expect(first.datasetId).toBe("allowance-calculation-rules-2026");
    expect(first.results.every((result) => result.sourceReferences.length > 0)).toBe(true);
    expect(first.results.every((result) => result.sourceYear === 2026)).toBe(true);
    expect(first.results.every((result) => result.officialVerificationRequired)).toBe(true);
  });

  it("keeps the original allowance signaling semantically available", () => {
    const scan = expectOk(calculateOfficialAllowanceScan2026(completeInput));
    const originalSignals = evaluateAllowanceSignals(completeInput);

    expect(scan.results.map((result) => result.signal)).toEqual(originalSignals.results);
    expect(scan.results[0].assessment.originalSignal).toEqual(originalSignals.results[0]);
  });

  it("calculates healthcare 2026 single amount from the official central table", () => {
    const healthcare = expectOk(
      calculateOfficialAllowance2026(completeInput, "healthcare"),
    );

    expect(healthcare.status).toBe("available");
    expect(healthcare.eligibilityStatus).toBe("passes-known-hard-checks");
    expect(healthcare.amount.monthlyAmount).toBe(129);
    expect(healthcare.amount.annualAmount).toBe(1_548);
    expect(healthcare.amount.estimate.availability).toBe("available");
    expect(healthcare.amount.estimate.range).toMatchObject({
      minimum: 129,
      likely: 129,
      maximum: 129,
      unit: "currency",
      period: "month",
      sourceYear: 2026,
    });
    expect(healthcare.amount.blockerCodes).toEqual([]);
    expect(healthcare.reasonCodes).toContain("healthcare-official-monthly-table-used");
    expect(
      healthcare.sourceReferences.some((source) =>
        source.sourceUrl.includes("belastingdienst.nl"),
      ),
    ).toBe(true);
  });

  it("calculates healthcare partner amount on the official table boundary", () => {
    const healthcare = expectOk(
      calculateOfficialAllowance2026(
        {
          ...completeInput,
          partnerStatus: "yes",
          jointAssessmentIncome: 51_000,
          jointAssets: 0,
          assessmentIncome: undefined,
          assets: undefined,
        },
        "healthcare",
      ),
    );

    expect(healthcare.status).toBe("available");
    expect(healthcare.amount.monthlyAmount).toBe(3);
    expect(healthcare.amount.annualAmount).toBe(36);
    expect(healthcare.amount.estimate.range?.likely).toBe(3);
  });

  it("returns zero healthcare amount for hard exclusions without inventing a range", () => {
    const healthcare = expectOk(
      calculateOfficialAllowance2026(
        {
          ...completeInput,
          assessmentIncome: 40_858,
        },
        "healthcare",
      ),
    );

    expect(healthcare.status).toBe("available");
    expect(healthcare.eligibilityStatus).toBe("fails-known-hard-checks");
    expect(healthcare.signal.hardExclusion).toBe(true);
    expect(healthcare.reasonCodes).toContain("healthcare-income-above-limit");
    expect(healthcare.amount.monthlyAmount).toBe(0);
    expect(healthcare.amount.annualAmount).toBe(0);
    expect(healthcare.amount.estimate.availability).toBe("available");
    expect(healthcare.amount.estimate.range).toMatchObject({
      minimum: 0,
      likely: 0,
      maximum: 0,
    });
  });

  it("marks incomplete healthcare input without showing fictive amounts", () => {
    const healthcare = expectOk(
      calculateOfficialAllowance2026(
        {
          calculationYear: 2026,
          year: 2026,
          age: 30,
        },
        "healthcare",
      ),
    );

    expect(healthcare.status).toBe("incomplete");
    expect(healthcare.eligibilityStatus).toBe("insufficient-information");
    expect(healthcare.missingFields).toEqual(
      expect.arrayContaining([
        "partnerStatus",
        "assessmentIncome",
        "assets",
        "healthcare.hasDutchHealthInsurance",
      ]),
    );
    expect(healthcare.amount.monthlyAmount).toBeUndefined();
    expect(healthcare.amount.estimate.availability).toBe("signal-only");
  });

  it("returns typed unavailable amount blockers for rent while preserving hard checks", () => {
    const rent = expectOk(
      calculateOfficialAllowance2026(
        {
          ...completeInput,
          assets: 38_480,
        },
        "rent",
      ),
    );

    expect(rent.status).toBe("special-case");
    expect(rent.eligibilityStatus).toBe("fails-known-hard-checks");
    expect(rent.reasonCodes).toContain("rent-assets-above-limit");
    expect(rent.amount.monthlyAmount).toBeUndefined();
    expect(rent.amount.estimate.availability).toBe("not-available");
    expect(rent.amount.blockerCodes).toEqual(
      expect.arrayContaining([
        "rent-amount-formula-not-normalized",
        "rent-basishuur-and-afbouw-not-normalized",
      ]),
    );
  });

  it("returns child budget unavailable when amount tables are not normalized", () => {
    const childBudget = expectOk(
      calculateOfficialAllowance2026(completeInput, "child-budget"),
    );

    expect(childBudget.status).toBe("special-case");
    expect(childBudget.amount.monthlyAmount).toBeUndefined();
    expect(childBudget.amount.blockerCodes).toEqual(
      expect.arrayContaining([
        "child-budget-amount-formula-not-normalized",
        "child-budget-income-table-not-normalized",
      ]),
    );
    expect(childBudget.sourceReferences.some((source) => source.year === 2026)).toBe(true);
  });

  it("returns childcare unavailable and preserves max-hour validation context", () => {
    const childcare = expectOk(
      calculateOfficialAllowance2026(
        {
          ...completeInput,
          childcare: {
            ...completeInput.childcare,
            hoursPerMonth: 230,
          },
        },
        "childcare",
      ),
    );

    expect(childcare.status).toBe("special-case");
    expect(childcare.signal.missingFields).not.toContain("childcare.hoursPerMonth");
    expect(childcare.amount.blockerCodes).toEqual(
      expect.arrayContaining([
        "childcare-reimbursement-table-not-normalized",
        "childcare-contract-level-inputs-not-modeled",
      ]),
    );
    expect(childcare.sourceReferences.some((source) => source.label.includes("Aantal opvanguren"))).toBe(true);
  });

  it("preserves special-case provenance and does not silently infer legal conclusions", () => {
    const result = expectOk(
      calculateOfficialAllowance2026(
        {
          ...completeInput,
          foreignOrResidenceSituation: true,
        },
        "healthcare",
      ),
    );

    expect(result.status).toBe("special-case");
    expect(result.eligibilityStatus).toBe("special-case");
    expect(result.uncertaintyCodes).toContain("foreign-or-residence-status");
    expect(result.amount.monthlyAmount).toBeUndefined();
    expect(result.amount.blockerCodes).toContain("healthcare-official-amount-not-calculable-for-input");
  });

  it("does not let multiple runs influence each other", () => {
    const single = expectOk(calculateOfficialAllowance2026(completeInput, "healthcare"));
    const partner = expectOk(
      calculateOfficialAllowance2026(
        {
          ...completeInput,
          partnerStatus: "yes",
          jointAssessmentIncome: 51_000,
          jointAssets: 0,
          assessmentIncome: undefined,
          assets: undefined,
        },
        "healthcare",
      ),
    );
    const singleAgain = expectOk(calculateOfficialAllowance2026(completeInput, "healthcare"));

    expect(single.amount.monthlyAmount).toBe(129);
    expect(partner.amount.monthlyAmount).toBe(3);
    expect(singleAgain).toEqual(single);
  });
});
