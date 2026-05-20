import { describe, expect, it } from "vitest";
import { calculateHypotheekAflossenVsBeleggen } from "./logic";

describe("calculateHypotheekAflossenVsBeleggen", () => {
  it("handles zero extra amount safely", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: 300000,
      mortgageRate: 4,
      remainingTermYears: 25,
      oneTimeExtraRepayment: 0,
      annualExtraRepayment: 0,
      taxableIncome: 60000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 20,
    });

    expect(result.oneTimeExtraRepaymentUsed).toBe(0);
    expect(result.annualExtraRepaymentUsed).toBe(0);
    expect(result.grossInterestSaved).toBe(0);
    expect(result.netBenefitAflossen).toBe(0);
  });

  it("returns gross interest savings when repaying extra", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: 300000,
      mortgageRate: 4.2,
      remainingTermYears: 30,
      oneTimeExtraRepayment: 10000,
      annualExtraRepayment: 2500,
      taxableIncome: 70000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 20,
      includeMortgageInterestDeduction: false,
    });

    expect(result.grossInterestSaved).toBeGreaterThan(0);
    expect(result.netBenefitAflossen).toBeGreaterThan(0);
  });

  it("shows lower net repayment benefit when mortgage deduction is included", () => {
    const baseInput = {
      remainingMortgageDebt: 280000,
      mortgageRate: 4,
      remainingTermYears: 28,
      oneTimeExtraRepayment: 12000,
      annualExtraRepayment: 2000,
      taxableIncome: 65000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 18,
    };

    const withoutDeduction = calculateHypotheekAflossenVsBeleggen({
      ...baseInput,
      includeMortgageInterestDeduction: false,
    });
    const withDeduction = calculateHypotheekAflossenVsBeleggen({
      ...baseInput,
      includeMortgageInterestDeduction: true,
    });

    expect(withDeduction.lostMortgageInterestDeduction).toBeGreaterThanOrEqual(0);
    expect(withDeduction.netBenefitAflossen).toBeLessThanOrEqual(
      withoutDeduction.netBenefitAflossen,
    );
  });

  it("lets investing grow with positive return", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: 250000,
      mortgageRate: 3.8,
      remainingTermYears: 24,
      oneTimeExtraRepayment: 8000,
      annualExtraRepayment: 3000,
      taxableIncome: 58000,
      expectedAnnualReturn: 6,
      investmentHorizonYears: 15,
      includeBox3Effect: false,
    });

    const totalContributed =
      result.oneTimeExtraRepaymentUsed +
      result.annualExtraRepaymentUsed;
    expect(result.investingFutureValueGross).toBeGreaterThan(totalContributed);
  });

  it("applies box3 effect when toggle is enabled", () => {
    const baseInput = {
      remainingMortgageDebt: 300000,
      mortgageRate: 4,
      remainingTermYears: 30,
      oneTimeExtraRepayment: 15000,
      annualExtraRepayment: 3000,
      taxableIncome: 65000,
      expectedAnnualReturn: 6,
      investmentHorizonYears: 20,
      currentInvestableAssets: 200000,
      hasFiscalPartner: false,
      taxYear: 2026,
    };

    const withoutBox3 = calculateHypotheekAflossenVsBeleggen({
      ...baseInput,
      includeBox3Effect: false,
    });
    const withBox3 = calculateHypotheekAflossenVsBeleggen({
      ...baseInput,
      includeBox3Effect: true,
    });

    expect(withBox3.totalAdditionalBox3Tax).toBeGreaterThanOrEqual(0);
    expect(withBox3.investingFutureValueNetAfterBox3).toBeLessThanOrEqual(
      withoutBox3.investingFutureValueNetAfterBox3,
    );
  });

  it("sanitizes negative values and avoids NaN/Infinity", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: -10,
      mortgageRate: -1,
      remainingTermYears: -20,
      oneTimeExtraRepayment: -5000,
      annualExtraRepayment: -1000,
      taxableIncome: -8000,
      expectedAnnualReturn: -4,
      investmentHorizonYears: -5,
      currentInvestableAssets: -3000,
      minimumBuffer: -10000,
    });

    expect(Number.isFinite(result.netBenefitAflossen)).toBe(true);
    expect(Number.isFinite(result.investingFutureValueNetAfterBox3)).toBe(true);
    expect(Number.isFinite(result.differenceInvestingMinusAflossen)).toBe(true);
    expect(result.oneTimeExtraRepaymentUsed).toBeGreaterThanOrEqual(0);
    expect(result.annualExtraRepaymentUsed).toBeGreaterThanOrEqual(0);
  });

  it("returns a safe break-even value", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: 300000,
      mortgageRate: 4.1,
      remainingTermYears: 30,
      oneTimeExtraRepayment: 10000,
      annualExtraRepayment: 2400,
      taxableIncome: 60000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 20,
      includeBox3Effect: true,
      currentInvestableAssets: 60000,
      taxYear: 2026,
    });

    if (result.breakEvenAnnualReturn !== null) {
      expect(Number.isFinite(result.breakEvenAnnualReturn)).toBe(true);
      expect(result.breakEvenAnnualReturn).toBeGreaterThanOrEqual(0);
    } else {
      expect(result.breakEvenAnnualReturn).toBeNull();
    }
  });

  it("builds a consistent yearly timeline", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: 260000,
      mortgageRate: 4,
      remainingTermYears: 25,
      oneTimeExtraRepayment: 10000,
      annualExtraRepayment: 2400,
      taxableIncome: 62000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 12,
      includeMortgageInterestDeduction: true,
      includeBox3Effect: true,
      currentInvestableAssets: 50000,
      taxYear: 2026,
    });

    expect(result.timeline.points).toHaveLength(12);
    expect(result.timeline.points[0]?.year).toBe(1);
    expect(result.timeline.points[11]?.year).toBe(12);

    for (let i = 1; i < result.timeline.points.length; i += 1) {
      const prev = result.timeline.points[i - 1];
      const next = result.timeline.points[i];
      expect(next.cumulativeNetBenefitAflossen).toBeGreaterThanOrEqual(
        prev.cumulativeNetBenefitAflossen,
      );
      expect(next.cumulativeAdditionalBox3Tax).toBeGreaterThanOrEqual(
        prev.cumulativeAdditionalBox3Tax,
      );
    }

    const finalPoint = result.timeline.points[result.timeline.points.length - 1];
    expect(finalPoint.cumulativeNetBenefitAflossen).toBeCloseTo(
      result.netBenefitAflossen,
      1,
    );
    expect(finalPoint.investingPortfolioNetAfterBox3).toBeCloseTo(
      result.investingFutureValueNetAfterBox3,
      1,
    );
    expect(finalPoint.cumulativeAdditionalBox3Tax).toBeCloseTo(
      result.totalAdditionalBox3Tax,
      1,
    );
    expect(finalPoint.differenceInvestingMinusAflossen).toBeCloseTo(
      result.differenceInvestingMinusAflossen,
      1,
    );
  });

  it("keeps yearly box3 tax at zero when box3 effect is disabled", () => {
    const result = calculateHypotheekAflossenVsBeleggen({
      remainingMortgageDebt: 260000,
      mortgageRate: 4,
      remainingTermYears: 25,
      oneTimeExtraRepayment: 10000,
      annualExtraRepayment: 2400,
      taxableIncome: 62000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 10,
      includeBox3Effect: false,
      currentInvestableAssets: 50000,
      taxYear: 2026,
    });

    expect(
      result.timeline.points.every((point) => point.additionalBox3TaxThisYear === 0),
    ).toBe(true);
    expect(result.totalAdditionalBox3Tax).toBe(0);
  });
});
