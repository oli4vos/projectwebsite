import { describe, expect, it } from "vitest";
import { calculateDuoBorrowingCapacity } from "@/lib/duo";

describe("calculateDuoBorrowingCapacity", () => {
  it("adds the missing supplementary grant to the regular loan maximum", () => {
    const result = calculateDuoBorrowingCapacity({
      asOf: "2026-03-01",
      educationTrack: "hbo-university",
      residence: "living-at-home",
      actualAdditionalGrant: 200,
    });

    expect(result.regularLoanMax).toBe(315.17);
    expect(result.additionalGrantMax).toBe(491.08);
    expect(result.additionalLoanForGrantShortfallMax).toBe(291.08);
    expect(result.totalInterestBearingLoanMax).toBe(606.25);
  });

  it("does not reduce loan capacity because of the basic grant", () => {
    const atHome = calculateDuoBorrowingCapacity({
      asOf: "2026-09-01",
      educationTrack: "hbo-university",
      residence: "living-at-home",
      actualAdditionalGrant: 491.08,
    });
    const away = calculateDuoBorrowingCapacity({
      asOf: "2026-09-01",
      educationTrack: "hbo-university",
      residence: "living-away",
      actualAdditionalGrant: 491.08,
    });

    expect(atHome.basicGrantMax).not.toBe(away.basicGrantMax);
    expect(atHome.totalInterestBearingLoanMax).toBe(315.17);
    expect(away.totalInterestBearingLoanMax).toBe(315.17);
  });

  it("uses the lower MBO grant ceiling when no tuition is due", () => {
    const result = calculateDuoBorrowingCapacity({
      asOf: "2026-08-01",
      educationTrack: "mbo",
      residence: "living-away",
      actualAdditionalGrant: 300,
      tuitionDue: false,
    });

    expect(result.additionalGrantMax).toBe(344.9);
    expect(result.additionalLoanForGrantShortfallMax).toBe(44.9);
    expect(result.totalInterestBearingLoanMax).toBe(278.55);
  });

  it("keeps the loan phase and tuition credit separate", () => {
    const result = calculateDuoBorrowingCapacity({
      asOf: "2026-10-01",
      educationTrack: "hbo-university",
      residence: "living-away",
      phase: "loan",
      actualAdditionalGrant: 0,
    });

    expect(result.totalInterestBearingLoanMax).toBe(1_213.95);
    expect(result.additionalGrantMax).toBe(0);
    expect(result.tuitionCreditMax).toBe(224.5);
  });

  it("is deterministic, immutable and clamps invalid grant amounts", () => {
    const input = {
      asOf: "2026-06-01",
      educationTrack: "mbo" as const,
      residence: "living-at-home" as const,
      actualAdditionalGrant: -50,
    };
    const first = calculateDuoBorrowingCapacity(input);
    const second = calculateDuoBorrowingCapacity(input);

    expect(first).toEqual(second);
    expect(first.additionalLoanForGrantShortfallMax).toBe(438.08);
    expect(Object.isFrozen(first)).toBe(true);
  });
});
