import { describe, expect, it } from "vitest";
import type { DuoMortgageTransferCandidate } from "@/lib/duo-mortgage-transfer";
import { exampleValues } from "./logic";
import {
  applyDuoMortgageCandidateToMaxMortgageForm,
  formatMortgageDuoPaymentInput,
  isMaxMortgageFormStateDraft,
} from "./duo-transfer";

function candidate(amount = 144.1): DuoMortgageTransferCandidate {
  return {
    createdAt: "2026-07-24T10:00:00.000Z",
    sourceSituation: "statutory-payment",
    recommendedMonthlyAssessmentPayment: amount,
    assessment: {
      recommendedMonthlyAssessmentPayment: amount,
      basis: "statutoryPayment",
      situation: "statutory-payment",
      reasonCode: "use-estimated-statutory-payment",
      usedDebtParts: false,
      warnings: [],
      missingFields: [],
      uncertainty: "medium",
      providerDependent: true,
      userConfirmationRequired: ["confirm-statutory-payment-in-mijn-duo"],
      assumptions: [],
    },
  };
}

describe("max mortgage DUO transfer adapter", () => {
  it("formats the DUO payment for the mortgage form", () => {
    expect(formatMortgageDuoPaymentInput(144.1)).toBe("144,10");
  });

  it("applies the statutory DUO payment and keeps existing mortgage input", () => {
    const updated = applyDuoMortgageCandidateToMaxMortgageForm(
      {
        ...exampleValues,
        hasStudentLoan: false,
        actualMonthlyPayment: "75",
        statutoryMonthlyPayment: "",
      },
      candidate(144.1),
    );

    expect(updated.hasStudentLoan).toBe(true);
    expect(updated.studentLoanStatus).toBe("unknown");
    expect(updated.statutoryMonthlyPayment).toBe("144,10");
    expect(updated.actualMonthlyPayment).toBe("75");
    expect(updated.grossAnnualHouseholdIncome).toBe(exampleValues.grossAnnualHouseholdIncome);
    expect(updated.purchasePrice).toBe(exampleValues.purchasePrice);
  });

  it("accepts only complete maximum mortgage drafts", () => {
    expect(isMaxMortgageFormStateDraft(exampleValues)).toBe(true);
    expect(isMaxMortgageFormStateDraft({ ...exampleValues, ownFunds: undefined })).toBe(false);
  });
});
