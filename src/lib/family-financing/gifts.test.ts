import { describe, expect, it } from "vitest";
import { calculateGiftCashflows } from "@/lib/family-financing/gifts";

describe("gift cashflows", () => {
  it("handles a one-time gift", () => {
    const result = calculateGiftCashflows({
      kind: "one-time",
      amount: 5000,
      transferDate: "2026-01-15",
    });

    expect(result.kind).toBe("one-time");
    expect(result.periods).toBe(1);
    expect(result.totalAmount).toBe(5000);
    expect(result.monthlyEquivalent).toBe(0);
    expect(result.schedule[0].amount).toBe(5000);
    expect(result.schedule[0].scheduledAt).toBe("2026-01");
  });

  it("handles a recurring gift", () => {
    const result = calculateGiftCashflows({
      kind: "recurring",
      amountPerPeriod: 100,
      frequency: "monthly",
      startDate: "2026-01-15",
      maxPayments: 6,
    });

    expect(result.kind).toBe("recurring");
    expect(result.periods).toBe(6);
    expect(result.totalAmount).toBe(600);
    expect(result.monthlyEquivalent).toBe(100);
    expect(result.schedule).toHaveLength(6);
    expect(result.schedule[0].scheduledAt).toBe("2026-01");
    expect(result.schedule.at(-1)?.scheduledAt).toBe("2026-06");
  });

  it("defaults safely when recurring gift duration is not provided", () => {
    const result = calculateGiftCashflows({
      kind: "recurring",
      amountPerPeriod: 50,
      frequency: "quarterly",
    });

    expect(result.periods).toBe(12);
    expect(result.totalAmount).toBe(600);
    expect(result.monthlyEquivalent).toBe(16.67);
  });

  it("handles zero and invalid values safely", () => {
    const result = calculateGiftCashflows({
      kind: "one-time",
      amount: -100,
    });

    expect(result.totalAmount).toBe(0);
    expect(result.schedule[0].amount).toBe(0);
  });
});
