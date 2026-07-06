import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getDefaultFinancialYear,
  getDuoRateForRule,
} from "@/lib/financial-constants";
import { fetchMarketData } from "@/lib/market";

function formatPercent(value: number): string {
  return `${value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

describe("market data", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("derives the DUO widget rate from the central SF35 constants", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
      })),
    );

    const [duoRate] = await fetchMarketData();
    const year = getDefaultFinancialYear();
    const expectedRate = getDuoRateForRule("SF35", year);

    expect(duoRate.label).toBe(`DUO-rente ${year}`);
    expect(duoRate.value).toBe(formatPercent(expectedRate));
  });
});
