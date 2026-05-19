import { describe, expect, it } from "vitest";
import { calculateBox3ImpactScenario } from "./logic";

describe("calculateBox3ImpactScenario", () => {
  it("handles zero wealth", () => {
    const result = calculateBox3ImpactScenario({
      method: "actual",
      year: 2026,
      hasFiscalPartner: false,
      bankDeposits: 0,
      investmentsAndOtherAssets: 0,
      debts: 0,
    });

    expect(result.box3Tax).toBe(0);
    expect(result.taxableBase).toBe(0);
  });

  it("returns no tax below allowance", () => {
    const result = calculateBox3ImpactScenario({
      method: "forfaitary",
      year: 2026,
      hasFiscalPartner: false,
      bankDeposits: 10000,
      investmentsAndOtherAssets: 0,
      debts: 0,
    });

    expect(result.taxableBase).toBe(0);
    expect(result.box3Tax).toBe(0);
  });

  it("returns tax above allowance", () => {
    const result = calculateBox3ImpactScenario({
      method: "forfaitary",
      year: 2026,
      hasFiscalPartner: false,
      bankDeposits: 150000,
      investmentsAndOtherAssets: 0,
      debts: 0,
    });

    expect(result.taxableBase).toBeGreaterThan(0);
    expect(result.box3Tax).toBeGreaterThanOrEqual(0);
  });

  it("uses higher partner allowance", () => {
    const single = calculateBox3ImpactScenario({
      method: "forfaitary",
      year: 2026,
      hasFiscalPartner: false,
      bankDeposits: 140000,
      investmentsAndOtherAssets: 0,
      debts: 0,
    });
    const partner = calculateBox3ImpactScenario({
      method: "forfaitary",
      year: 2026,
      hasFiscalPartner: true,
      bankDeposits: 140000,
      investmentsAndOtherAssets: 0,
      debts: 0,
    });

    expect(partner.taxFreeAllowance).toBeGreaterThan(single.taxFreeAllowance);
    expect(partner.box3Tax).toBeLessThanOrEqual(single.box3Tax);
  });

  it("debts reduce outcome but never create negative tax", () => {
    const result = calculateBox3ImpactScenario({
      method: "forfaitary",
      year: 2026,
      hasFiscalPartner: false,
      bankDeposits: 200000,
      investmentsAndOtherAssets: 50000,
      debts: 220000,
    });

    expect(result.box3Tax).toBeGreaterThanOrEqual(0);
    expect(result.taxableBase).toBeGreaterThanOrEqual(0);
    expect(result.totalDeemedReturn).toBeGreaterThanOrEqual(0);
  });

  it("sanitizes negative inputs and avoids NaN/Infinity", () => {
    const result = calculateBox3ImpactScenario({
      method: "actual",
      year: 3026,
      hasFiscalPartner: false,
      bankDeposits: -1000,
      investmentsAndOtherAssets: -5000,
      debts: -3000,
      expectedSavingsReturn: -2,
      expectedInvestmentReturn: -9,
    });

    expect(Number.isFinite(result.box3Tax)).toBe(true);
    expect(Number.isFinite(result.netWorth)).toBe(true);
    expect(result.box3Tax).toBeGreaterThanOrEqual(0);
  });

  it("supports empty expected return input safely", () => {
    const result = calculateBox3ImpactScenario({
      method: "actual",
      year: 2026,
      hasFiscalPartner: false,
      bankDeposits: 25000,
      investmentsAndOtherAssets: 15000,
      debts: 0,
    });

    expect(result.expectedGrossReturn).toBeUndefined();
    expect(result.netExpectedReturnAfterBox3).toBeUndefined();
  });
});
