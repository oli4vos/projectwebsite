import { describe, expect, it } from "vitest";
import { calculateBox3Tax } from "@/lib/tax/box3";

describe("calculateBox3Tax", () => {
  it("returns zero tax when there is no wealth", () => {
    const result = calculateBox3Tax({
      bankDeposits: 0,
      investmentsAndOtherAssets: 0,
      debts: 0,
      method: "actual",
      actualAnnualReturnRate: 5,
      year: 2026,
    });

    expect(result.box3Tax).toBe(0);
    expect(result.taxableBase).toBe(0);
  });

  it("returns zero tax below tax-free allowance", () => {
    const result = calculateBox3Tax({
      bankDeposits: 30000,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: false,
      method: "actual",
      actualAnnualReturnRate: 5,
      year: 2026,
    });

    expect(result.taxableBase).toBe(0);
    expect(result.box3Tax).toBe(0);
  });

  it("returns tax at or above zero above tax-free allowance", () => {
    const result = calculateBox3Tax({
      bankDeposits: 100000,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: false,
      method: "actual",
      actualAnnualReturnRate: 5,
      year: 2026,
    });

    expect(result.taxableBase).toBeGreaterThan(0);
    expect(result.box3Tax).toBeGreaterThanOrEqual(0);
  });

  it("returns positive tax for investments above tax-free allowance", () => {
    const result = calculateBox3Tax({
      bankDeposits: 0,
      investmentsAndOtherAssets: 200000,
      debts: 0,
      hasFiscalPartner: false,
      method: "actual",
      actualAnnualReturnRate: 6,
      year: 2026,
    });

    expect(result.box3Tax).toBeGreaterThan(0);
  });

  it("uses higher allowance for fiscal partners", () => {
    const single = calculateBox3Tax({
      bankDeposits: 120000,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: false,
      method: "actual",
      actualAnnualReturnRate: 4,
      year: 2026,
    });
    const partners = calculateBox3Tax({
      bankDeposits: 120000,
      investmentsAndOtherAssets: 0,
      debts: 0,
      hasFiscalPartner: true,
      method: "actual",
      actualAnnualReturnRate: 4,
      year: 2026,
    });

    expect(partners.taxFreeAllowance).toBeGreaterThan(single.taxFreeAllowance);
    expect(partners.box3Tax).toBeLessThanOrEqual(single.box3Tax);
  });

  it("debts lower taxable metrics without creating negative tax", () => {
    const result = calculateBox3Tax({
      bankDeposits: 100000,
      investmentsAndOtherAssets: 50000,
      debts: 120000,
      hasFiscalPartner: false,
      method: "actual",
      actualAnnualReturnRate: 5,
      year: 2026,
    });

    expect(result.box3Tax).toBeGreaterThanOrEqual(0);
    expect(result.taxableBase).toBeGreaterThanOrEqual(0);
    expect(result.taxableDeemedReturn).toBeGreaterThanOrEqual(0);
  });

  it("sanitizes negative input to zero", () => {
    const result = calculateBox3Tax({
      bankDeposits: -5000,
      investmentsAndOtherAssets: -5000,
      debts: -2000,
      hasFiscalPartner: false,
      method: "actual",
      actualAnnualReturnRate: 5,
      year: 2026,
    });

    expect(result.assetsTotal).toBe(0);
    expect(result.debtsTotal).toBe(0);
    expect(result.box3Tax).toBe(0);
  });

  it("supports forfaitary mode explicitly", () => {
    const result = calculateBox3Tax({
      bankDeposits: 100000,
      investmentsAndOtherAssets: 100000,
      debts: 0,
      hasFiscalPartner: false,
      method: "forfaitary",
      year: 2026,
    });

    expect(result.method).toBe("forfaitary");
    expect(result.deemedReturnInvestments).toBeGreaterThan(0);
    expect(result.box3Tax).toBeGreaterThan(0);
  });
});
