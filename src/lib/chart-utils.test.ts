import { describe, expect, it } from "vitest";
import {
  formatChartEuro,
  formatChartYear,
  getWholeYearTicks,
  normalizeChartYear,
} from "@/lib/chart-utils";

describe("chart utils", () => {
  it("formats whole chart years", () => {
    expect(formatChartYear(1)).toBe("Jaar 1");
    expect(formatChartYear(1.7)).toBe("Jaar 2");
  });

  it("normalizes years to whole safe values", () => {
    expect(normalizeChartYear(12.4)).toBe(12);
    expect(normalizeChartYear(-3)).toBe(0);
    expect(normalizeChartYear(Number.NaN)).toBe(0);
  });

  it("formats euro values", () => {
    expect(formatChartEuro(12500)).toBe("€ 12.500");
  });

  it("returns safe euro fallback for invalid values", () => {
    expect(formatChartEuro(undefined)).toBe("€ 0");
    expect(formatChartEuro(Number.NaN)).toBe("€ 0");
    expect(formatChartEuro(Number.POSITIVE_INFINITY)).toBe("€ 0");
  });

  it("returns whole-year ticks for short horizons", () => {
    expect(getWholeYearTicks(5)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("returns stepped whole-year ticks for longer horizons", () => {
    const ticks = getWholeYearTicks(30);
    expect(ticks.every((tick) => Number.isInteger(tick))).toBe(true);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(30);
    expect(ticks).toContain(5);
    expect(ticks).toContain(10);
  });
});
