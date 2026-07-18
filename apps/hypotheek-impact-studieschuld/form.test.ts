import { describe, expect, it } from "vitest";
import {
  defaultValues,
  exampleValues,
  validateForm,
  type FormState,
} from "./form";

function validValues(overrides: Partial<FormState> = {}): FormState {
  return {
    ...exampleValues,
    ...overrides,
  };
}

describe("hypotheek-impact-studieschuld form adapter", () => {
  it("keeps defaults empty except explicit structural defaults", () => {
    expect(defaultValues.situation).toBe("repaying");
    expect(defaultValues.repaymentRule).toBe("SF35");
    expect(defaultValues.actualMonthlyPayment).toBe("");
    expect(defaultValues.remainingStudentDebt).toBe("");
    expect(defaultValues.debtParts.length).toBeGreaterThan(0);
    expect(defaultValues.useDebtParts).toBe(false);
  });

  it("keeps example values usable for a full calculation", () => {
    const validation = validateForm(exampleValues);

    expect(validation.errors).toEqual({});
    expect(validation.parsedValues).toMatchObject({
      situation: "repaying",
      repaymentRule: "SF35",
      actualMonthlyPayment: 150,
      remainingStudentDebt: 22000,
      grossIncomeUser: 48000,
      grossIncomePartner: 0,
      desiredHomePrice: 375000,
      ownMoney: 25000,
    });
  });

  it("maps split debt parts to domain input and total debt", () => {
    const validation = validateForm(
      validValues({
        useDebtParts: true,
        remainingStudentDebt: "",
        debtParts: [
          { id: "part-a", amount: "16000", rateYear: "2026" },
          { id: "part-b", amount: "9000", rateYear: "2024" },
        ],
      }),
    );

    expect(validation.errors).toEqual({});
    expect(validation.debtPartsTotal).toBe(25000);
    expect(validation.parsedValues?.remainingStudentDebt).toBe(25000);
    expect(validation.parsedValues?.duoDebtParts).toEqual([
      { remainingDebt: 16000, rateYear: 2026 },
      { remainingDebt: 9000, rateYear: 2024 },
    ]);
  });

  it("requires only relevant DUO payment fields for the selected situation", () => {
    const gracePeriodValidation = validateForm(
      validValues({
        situation: "gracePeriod",
        actualMonthlyPayment: "",
        statutoryMonthlyPayment: "",
        remainingStudentDebt: "",
      }),
    );

    expect(gracePeriodValidation.errors.actualMonthlyPayment).toBeUndefined();
    expect(gracePeriodValidation.errors.remainingStudentDebt).toContain(
      "resterende studieschuld",
    );
    expect(gracePeriodValidation.parsedValues).toBeNull();

    const incomeReductionValidation = validateForm(
      validValues({
        situation: "incomeBasedReduction",
        actualMonthlyPayment: "",
        statutoryMonthlyPayment: "",
        remainingStudentDebt: "22000",
      }),
    );

    expect(incomeReductionValidation.errors.actualMonthlyPayment).toContain(
      "draagkrachtbedrag",
    );
    expect(incomeReductionValidation.errors.statutoryMonthlyPayment).toBeUndefined();
  });

  it("keeps extra repayment tied to a valid remaining student debt", () => {
    const validation = validateForm(
      validValues({
        remainingStudentDebt: "1000",
        extraRepayment: "1500",
      }),
    );

    expect(validation.errors.extraRepayment).toContain("niet hoger");
    expect(validation.parsedValues).toBeNull();
  });

  it("returns field errors without producing domain input for invalid values", () => {
    const validation = validateForm(
      validValues({
        grossIncomeUser: "-1",
        mortgageTermYears: "0",
      }),
    );

    expect(validation.errors.grossIncomeUser).toBeDefined();
    expect(validation.errors.mortgageTermYears).toBeDefined();
    expect(validation.parsedValues).toBeNull();
  });
});
