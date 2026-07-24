import { describe, expect, it } from "vitest";
import { getToolNextSteps } from "@/lib/tool-journeys";

describe("tool journeys", () => {
  it("filters disabled tool links through the generated public registry", () => {
    const duo = getToolNextSteps("duo-maandbedrag");
    const mortgage = getToolNextSteps("artifact-hypotheek-wonen-maximale-hypotheek");
    const impact = getToolNextSteps("hypotheek-impact-studieschuld");

    expect([
      duo.primary.href,
      ...(duo.secondary ?? []).map((link) => link.href),
      mortgage.primary.href,
      ...(mortgage.secondary ?? []).map((link) => link.href),
      impact.primary.href,
      ...(impact.secondary ?? []).map((link) => link.href),
    ]).not.toContain("/apps/familiehulp-eerste-woning");
    expect(mortgage.primary.href).toBe("/apps/hypotheek-impact-studieschuld");
  });
});
