import { describe, expect, it } from "vitest";
import { createStudentDebtProfilePatch } from "@/lib/profile-result-mapping";

describe("profile result mapping", () => {
  it("keeps statutory, mortgage and debt-part values separate", () => {
    expect(
      createStudentDebtProfilePatch({
        remainingDebt: 27000,
        statutoryMonthlyPayment: 112.4,
        mortgageAssessmentMonthlyPayment: 112.4,
        repaymentRule: "SF35",
        duoInterestRate: 2.33,
        duoRateYear: 2026,
        remainingTermYears: 30,
        currentMonthlyPayment: 78,
        duoSituation: "incomeBasedReduction",
        debtParts: [
          { remainingDebt: 11000, rateYear: 2025 },
          { remainingDebt: 16000, rateYear: 2026 },
        ],
      }),
    ).toEqual({
      studentDebt: {
        remainingDebt: 27000,
        statutoryMonthlyPayment: 112.4,
        mortgageAssessmentMonthlyPayment: 112.4,
        repaymentRule: "SF35",
        duoInterestRate: 2.33,
        duoRateYear: 2026,
        remainingTermYears: 30,
        currentMonthlyPayment: 78,
        duoSituation: "incomeBasedReduction",
        debtParts: [
          { remainingDebt: 11000, rateYear: 2025 },
          { remainingDebt: 16000, rateYear: 2026 },
        ],
      },
    });
  });

  it("does not overwrite optional values that were not part of a result", () => {
    const patch = createStudentDebtProfilePatch({
      remainingDebt: 27000,
      statutoryMonthlyPayment: 112.4,
      mortgageAssessmentMonthlyPayment: 112.4,
      repaymentRule: "SF35",
      duoInterestRate: 2.33,
      duoRateYear: 2026,
      remainingTermYears: 30,
    });

    expect(patch.studentDebt).not.toHaveProperty("currentMonthlyPayment");
    expect(patch.studentDebt).not.toHaveProperty("duoSituation");
    expect(patch.studentDebt).toHaveProperty("debtParts", undefined);
  });
});
