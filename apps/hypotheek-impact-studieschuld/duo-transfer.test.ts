import { describe, expect, it } from "vitest";
import type { DuoMortgageTransferCandidate } from "@/lib/duo-mortgage-transfer";
import { exampleValues } from "./form";
import {
  applyDuoMortgageCandidateToForm,
  getDuoMortgageCandidateTargetField,
  isFormStateDraft,
} from "./duo-transfer";

function candidate(
  basis: DuoMortgageTransferCandidate["assessment"]["basis"],
  amount = 123.45,
): DuoMortgageTransferCandidate {
  return {
    createdAt: "2026-07-19T10:00:00.000Z",
    sourceSituation: basis === "collectedPayment" ? "collected-payment" : "statutory-payment",
    recommendedMonthlyAssessmentPayment: amount,
    assessment: {
      recommendedMonthlyAssessmentPayment: amount,
      basis,
      situation: basis === "collectedPayment" ? "collected-payment" : "statutory-payment",
      reasonCode:
        basis === "collectedPayment"
          ? "collected-equals-statutory"
          : "use-estimated-statutory-payment",
      usedDebtParts: false,
      warnings: [],
      missingFields: [],
      uncertainty: basis === "collectedPayment" ? "low" : "high",
      providerDependent: true,
      userConfirmationRequired: [],
      assumptions: [],
    },
  };
}

describe("hypotheek-impact DUO transfer adapter", () => {
  it("fills the actual monthly payment for collected payments in active repayment", () => {
    expect(
      getDuoMortgageCandidateTargetField(
        { ...exampleValues, situation: "repaying" },
        candidate("collectedPayment"),
      ),
    ).toBe("actualMonthlyPayment");
  });

  it("fills the statutory monthly payment for reduced, paused and not-started situations", () => {
    for (const situation of [
      "incomeBasedReduction",
      "paymentPause",
      "gracePeriod",
      "unknown",
    ] as const) {
      expect(
        getDuoMortgageCandidateTargetField(
          { ...exampleValues, situation },
          candidate("statutoryPayment"),
        ),
      ).toBe("statutoryMonthlyPayment");
    }
  });

  it("applies the candidate amount without touching unrelated form values", () => {
    const values = {
      ...exampleValues,
      situation: "incomeBasedReduction" as const,
      actualMonthlyPayment: "75",
      statutoryMonthlyPayment: "",
    };

    const updated = applyDuoMortgageCandidateToForm(
      values,
      candidate("statutoryPayment", 144.1),
      (value) => value.toFixed(2).replace(".", ","),
    );

    expect(updated.actualMonthlyPayment).toBe("75");
    expect(updated.statutoryMonthlyPayment).toBe("144,10");
    expect(updated.grossIncomeUser).toBe(values.grossIncomeUser);
  });

  it("accepts the known form draft shape and rejects incomplete drafts", () => {
    expect(isFormStateDraft(exampleValues)).toBe(true);
    expect(isFormStateDraft({ ...exampleValues, debtParts: undefined })).toBe(false);
  });
});
