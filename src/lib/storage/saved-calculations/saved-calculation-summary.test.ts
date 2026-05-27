import { describe, expect, it } from "vitest";
import type { SavedCalculation } from "@/lib/storage/saved-calculations/saved-calculation.types";
import { summarizeSavedCalculation } from "@/lib/storage/saved-calculations/saved-calculation-summary";

const baseCalculation: SavedCalculation = {
  id: "scenario-1",
  toolSlug: "volgende-euro",
  title: "Scenario",
  input: { extraAmount: 1000, currentBuffer: 500 },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  version: 1,
};

describe("summarizeSavedCalculation", () => {
  it("summarizes next-euro snapshots", () => {
    const summary = summarizeSavedCalculation({
      ...baseCalculation,
      result: {
        topRecommendation: { label: "Buffer aanvullen" },
        priorityPlan: [{ key: "buffer" }, { key: "expensiveDebt" }],
        missingDataSummary: [{ key: "freeInvesting" }],
      },
    });

    expect(summary.primary).toBe("Hoofdroute: Buffer aanvullen");
    expect(summary.details).toContain("2 invoervelden opgeslagen");
    expect(summary.details).toContain("2 stappen in de volgorde");
    expect(summary.details).toContain("1 onderdeel met ontbrekende gegevens");
  });

  it("falls back safely for unknown payloads", () => {
    const summary = summarizeSavedCalculation({
      ...baseCalculation,
      input: "unknown",
      result: undefined,
    });

    expect(summary.primary).toBe("Opgeslagen scenario-snapshot");
    expect(summary.details).toEqual(["0 invoervelden opgeslagen"]);
  });
});
