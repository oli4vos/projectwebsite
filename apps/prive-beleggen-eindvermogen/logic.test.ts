import { describe, expect, it } from "vitest";
import { calculatePriveBeleggenEindvermogen } from "./logic";

describe("calculatePriveBeleggenEindvermogen", () => {
  it("grows vermogen with positive inleg and rendement", () => {
    const result = calculatePriveBeleggenEindvermogen({
      startVermogen: 10000,
      maandelijkseInleg: 500,
      verwachtRendementPct: 6,
      horizonJaren: 10,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3Method: "forfaitary",
    });
    expect(result.eindVermogenMetBox3).toBeGreaterThan(result.startVermogen);
    expect(result.timeline.length).toBe(10);
  });

  it("keeps box3 belasting zero when vermogen stays below vrijstelling", () => {
    const result = calculatePriveBeleggenEindvermogen({
      startVermogen: 1000,
      maandelijkseInleg: 50,
      verwachtRendementPct: 2,
      horizonJaren: 3,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3Method: "forfaitary",
    });
    expect(result.totaleBox3Belasting).toBe(0);
    expect(result.timeline.every((point) => point.box3Belasting === 0)).toBe(true);
  });

  it("applies box3 impact when vermogen gets above vrijstelling", () => {
    const result = calculatePriveBeleggenEindvermogen({
      startVermogen: 100000,
      maandelijkseInleg: 1500,
      verwachtRendementPct: 7,
      horizonJaren: 12,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3Method: "forfaitary",
    });
    expect(result.totaleBox3Belasting).toBeGreaterThan(0);
    expect(result.verschilDoorBox3).toBeGreaterThan(0);
    expect(result.eindVermogenZonderBox3).toBeGreaterThan(result.eindVermogenMetBox3);
  });

  it("sanitizes negative values safely", () => {
    const result = calculatePriveBeleggenEindvermogen({
      startVermogen: -1000,
      maandelijkseInleg: -250,
      verwachtRendementPct: -5,
      horizonJaren: -3,
      taxYear: 5000,
    });
    expect(Number.isFinite(result.eindVermogenMetBox3)).toBe(true);
    expect(result.eindVermogenMetBox3).toBeGreaterThanOrEqual(0);
    expect(result.horizonJaren).toBeGreaterThanOrEqual(1);
    expect(result.taxYear).toBeGreaterThanOrEqual(2000);
    expect(result.taxYear).toBeLessThanOrEqual(2200);
  });
});

