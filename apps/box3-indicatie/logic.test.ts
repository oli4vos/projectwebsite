import { describe, expect, it } from "vitest";
import { calculateBox3Indicatie } from "./logic";

describe("calculateBox3Indicatie", () => {
  it("returns zero tax for zero assets", () => {
    const result = calculateBox3Indicatie({
      method: "actual",
      bankDeposits: 0,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: false,
      actualAnnualReturnRate: 4,
    });

    expect(result.box3Tax).toBe(0);
    expect(result.taxableBase).toBe(0);
  });

  it("applies partner allowance when selected", () => {
    const single = calculateBox3Indicatie({
      method: "forfaitary",
      bankDeposits: 120000,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: false,
    });
    const partner = calculateBox3Indicatie({
      method: "forfaitary",
      bankDeposits: 120000,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: true,
    });

    expect(partner.taxFreeAllowance).toBeGreaterThan(single.taxFreeAllowance);
    expect(partner.box3Tax).toBeLessThanOrEqual(single.box3Tax);
  });

  it("sanitizes negative inputs to safe values", () => {
    const result = calculateBox3Indicatie({
      method: "actual",
      bankDeposits: -1000,
      investmentsAndOtherAssets: -5000,
      debts: -2000,
      hasFiscalPartner: false,
      actualAnnualReturnRate: -2,
      year: 3025,
    });

    expect(result.assetsTotal).toBe(0);
    expect(result.debtsTotal).toBe(0);
    expect(result.box3Tax).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.box3Tax)).toBe(true);
  });
});
