import { describe, expect, it } from "vitest";
import { calculateFinancingScenario } from "@/lib/family-financing/scenarios";
import type { FinancingScenario } from "@/lib/family-financing";

const baseFamilyLoan = {
  principal: 1200,
  annualRate: 12,
  termYears: 1,
  repaymentType: "annuity" as const,
};

const baseScenarioInput: FinancingScenario["input"] = {
  purchasePrice: 1200,
  acquisitionCosts: 0,
  ownFunds: 0,
  minimumBuffer: 0,
  bankMortgage: undefined,
  familyLoan: undefined,
  gifts: [],
  duo: {
    situation: "repaying",
    repaymentRule: "SF35",
    remainingDebt: 1200,
    annualInterestRate: 2.5,
    remainingTermYears: 30,
    grossAnnualIncome: 50000,
    partnerGrossAnnualIncome: 0,
    currentMonthlyPayment: 100,
  },
};

function makeScenario(overrides: Partial<FinancingScenario> = {}): FinancingScenario {
  return {
    id: "scenario-1",
    title: "Test scenario",
    description: "Test",
    type: "family-loan",
    usedSources: ["bankMortgage", "familyLoan", "ownFunds"],
    assumptions: [],
    includesFutureGifts: false,
    ...overrides,
    input: {
      ...baseScenarioInput,
      ...overrides.input,
      duo: {
        ...baseScenarioInput.duo,
        ...overrides.input?.duo,
      },
    },
  };
}

describe("family financing scenarios", () => {
  it("handles a one-time gift as own funds", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "gift-as-own-funds",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 100,
          bankMortgage: { principal: 1000, annualRate: 4, years: 30 },
          familyLoan: undefined,
          gifts: [{ kind: "one-time", amount: 100, transferDate: "2026-01-01" }],
          duo: baseScenarioInput.duo,
        },
        usedSources: ["bankMortgage", "ownFunds", "oneTimeGift"],
      }),
    );

    expect(result.totalFinancing).toBe(1200);
    expect(result.financingGap).toBe(0);
    expect(result.ownFundsUsed).toBe(200);
    expect(result.giftCashflows?.[0].totalAmount).toBe(100);
  });

  it("handles a recurring gift and stress tests a gift stop", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "gift-stops",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 200,
          bankMortgage: { principal: 1000, annualRate: 4, years: 30 },
          familyLoan: undefined,
          gifts: [
            {
              kind: "recurring",
              amountPerPeriod: 100,
              frequency: "monthly",
              startDate: "2026-01-01",
              maxPayments: 6,
            },
          ],
          duo: baseScenarioInput.duo,
        },
        usedSources: ["bankMortgage", "ownFunds", "recurringGift"],
        includesFutureGifts: true,
      }),
    );

    expect(result.giftCashflows?.[0].periods).toBe(6);
    expect(result.stressTests?.some((test) => test.type === "giftStops")).toBe(true);
    expect(result.contractualMonthlyPayments?.receivedGift).toBe(100);
  });

  it("keeps the minimum buffer intact when possible", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "minimum-buffer",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 300,
          minimumBuffer: 100,
          bankMortgage: { principal: 1000, annualRate: 4, years: 30 },
          familyLoan: undefined,
          duo: baseScenarioInput.duo,
        },
        usedSources: ["bankMortgage", "ownFunds"],
      }),
    );

    expect(result.remainingBuffer).toBe(100);
    expect(result.financingGap).toBe(0);
    expect(result.stressTests?.some((test) => test.type === "bufferBreach")).toBe(true);
  });

  it("reports a minimum buffer shortfall when the buffer is too small", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "minimum-buffer",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 80,
          minimumBuffer: 100,
          bankMortgage: { principal: 1000, annualRate: 4, years: 30 },
          familyLoan: undefined,
          duo: baseScenarioInput.duo,
        },
        usedSources: ["bankMortgage", "ownFunds"],
      }),
    );

    expect(result.remainingBuffer).toBe(80);
    expect(result.financingGap).toBe(200);
    expect(result.stressTests?.find((test) => test.type === "bufferBreach")?.passed).toBe(
      false,
    );
  });

  it("uses the DUO repayment adjustment without double-counting a gift", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "gift-for-duo-repayment",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 200,
          bankMortgage: { principal: 1000, annualRate: 4, years: 30 },
          familyLoan: undefined,
          gifts: [{ kind: "one-time", amount: 100, transferDate: "2026-01-01" }],
          duo: {
            ...baseScenarioInput.duo,
            remainingDebt: 1200,
          },
        },
        usedSources: ["bankMortgage", "familyLoan", "ownFunds", "oneTimeGift"],
      }),
    );

    expect(result.financingGap).toBe(0);
    expect(result.debtsBySource?.duoDebt).toBe(1100);
    expect(result.contractualMonthlyPayments?.duoPayment).toBeGreaterThan(0);
  });

  it("supports family loan with separate periodic gift", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "family-loan-with-gift",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 0,
          bankMortgage: undefined,
          familyLoan: baseFamilyLoan,
          gifts: [
            {
              kind: "recurring",
              amountPerPeriod: 50,
              frequency: "monthly",
              startDate: "2026-01-01",
              maxPayments: 12,
            },
          ],
          duo: baseScenarioInput.duo,
        },
        usedSources: ["bankMortgage", "familyLoan", "ownFunds", "recurringGift"],
      }),
    );

    expect(result.contractualMonthlyPayments?.familyLoanPayment).toBeGreaterThan(0);
    expect(result.contractualMonthlyPayments?.receivedGift).toBe(50);
    const contractualMonthlyPayments = result.contractualMonthlyPayments;
    const receivedGift = contractualMonthlyPayments?.receivedGift ?? 0;
    const grossContractualOutflow = contractualMonthlyPayments?.grossContractualOutflow ?? 0;
    expect(result.netHouseholdCashflow).toBe(
      receivedGift - grossContractualOutflow,
    );
  });

  it("handles financing overshoot and zero input safely", () => {
    const result = calculateFinancingScenario(
      makeScenario({
        type: "gift-as-own-funds",
        input: {
          ...baseScenarioInput,
          purchasePrice: 1200,
          ownFunds: 0,
          bankMortgage: { principal: 1500, annualRate: 4, years: 30 },
          familyLoan: undefined,
          gifts: [{ kind: "one-time", amount: 100, transferDate: "2026-01-01" }],
          duo: baseScenarioInput.duo,
        },
      }),
    );

    expect(result.financingGap).toBe(-300);
  });
});
