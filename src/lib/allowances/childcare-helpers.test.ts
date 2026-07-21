import { describe, expect, it } from "vitest";

import {
  capChildcareContract2026,
  lookupChildcarePercentageBand2026,
  selectFirstChildForChildcare2026,
} from "@/lib/allowances/childcare-helpers";

describe("childcare allowance 2026 helpers", () => {
  it("looks up first and next child percentages for low, middle and high income bands", () => {
    expect(lookupChildcarePercentageBand2026(0)).toMatchObject({
      incomeFrom: 0,
      firstChildPercent: 96,
      nextChildPercent: 96,
    });
    expect(lookupChildcarePercentageBand2026(60_000)).toMatchObject({
      incomeFrom: 59_958,
      firstChildPercent: 93.9,
      nextChildPercent: 95.6,
    });
    expect(lookupChildcarePercentageBand2026(250_000)?.firstChildPercent).toBe(36.5);
  });

  it("uses inclusive band boundaries and moves one euro above a boundary to the next band", () => {
    expect(lookupChildcarePercentageBand2026(24_149)?.incomeFrom).toBe(0);
    expect(lookupChildcarePercentageBand2026(24_150)?.incomeFrom).toBe(24_150);
    expect(lookupChildcarePercentageBand2026(-1)).toBeUndefined();
  });

  it("caps hours and hourly rates per care type", () => {
    expect(capChildcareContract2026({
      childId: "a",
      careType: "daycare",
      hoursPerMonth: 240,
      hourlyRate: 12,
    })).toMatchObject({
      cappedHours: 230,
      cappedHourlyRate: 11.23,
      subsidisableCosts: 2_582.9,
    });
    expect(capChildcareContract2026({
      childId: "b",
      careType: "out-of-school-care",
      hoursPerMonth: 100,
      hourlyRate: 12,
    }).cappedHourlyRate).toBe(9.98);
    expect(capChildcareContract2026({
      childId: "c",
      careType: "childminder-care",
      hoursPerMonth: 100,
      hourlyRate: 12,
    }).cappedHourlyRate).toBe(8.49);
  });

  it("selects the first child by most subsidisable hours", () => {
    const selection = selectFirstChildForChildcare2026([
      { childId: "a", careType: "daycare", hoursPerMonth: 90, hourlyRate: 10 },
      { childId: "b", careType: "daycare", hoursPerMonth: 120, hourlyRate: 9 },
    ]);

    expect(selection?.firstChildId).toBe("b");
    expect(selection?.childSummaries.find((child) => child.childId === "b")?.isFirstChild).toBe(true);
    expect(Object.isFrozen(selection)).toBe(true);
  });

  it("breaks ties on highest subsidisable costs and then child id", () => {
    expect(selectFirstChildForChildcare2026([
      { childId: "a", careType: "daycare", hoursPerMonth: 100, hourlyRate: 9 },
      { childId: "b", careType: "daycare", hoursPerMonth: 100, hourlyRate: 10 },
    ])?.firstChildId).toBe("b");
    expect(selectFirstChildForChildcare2026([
      { childId: "b", careType: "daycare", hoursPerMonth: 100, hourlyRate: 10 },
      { childId: "a", careType: "daycare", hoursPerMonth: 100, hourlyRate: 10 },
    ])?.firstChildId).toBe("a");
  });

  it("returns undefined when no contracts are available", () => {
    expect(selectFirstChildForChildcare2026([])).toBeUndefined();
  });
});
