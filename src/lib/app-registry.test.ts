import { describe, expect, it } from "vitest";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";

describe("generated app registry", () => {
  it("does not expose hidden draft apps", () => {
    expect(appRegistryBySlug["compensatie-pechgeneratie"]).toBeUndefined();
    expect(appRegistry.some((app) => app.slug === "compensatie-pechgeneratie")).toBe(
      false,
    );
  });

  it("contains expected public tools", () => {
    expect(appRegistryBySlug["hypotheek-impact-studieschuld"]).toBeDefined();
    expect(appRegistryBySlug["studieschuld-vs-beleggen"]).toBeDefined();
    expect(appRegistryBySlug["jaarruimte-vs-vrij-beleggen"]).toBeDefined();
    expect(appRegistryBySlug["box-3-impact"]).toBeDefined();
    expect(appRegistryBySlug["volgende-euro"]).toBeDefined();
  });

  it("keeps manifest metadata consistent for disclaimer and output type", () => {
    for (const app of appRegistry) {
      if (app.disclaimerType === "taxIndicative") {
        expect(app.assumptionsUsed ?? []).toContain("tax");
        expect(
          (app.assumptionsUsed ?? []).some(
            (value) => value === "box1" || value === "box3",
          ),
        ).toBe(true);
      }

      if (app.disclaimerType === "mortgageIndicative") {
        expect(
          (app.calculationDomains ?? []).some(
            (value) => value === "mortgage" || value === "housing",
          ),
        ).toBe(true);
      }

      if (app.disclaimerType === "duoIndicative") {
        expect(app.assumptionsUsed ?? []).toContain("duo");
      }

      if (app.outputType === "singleResult") {
        expect((app.tags ?? []).length).toBeGreaterThan(0);
      }

      if (app.outputType === "scenarioComparison") {
        expect((app.calculationDomains ?? []).length).toBeGreaterThan(0);
      }
    }
  });

  it("uses central box3 domain metadata consistently", () => {
    const box3Apps = appRegistry.filter((app) =>
      (app.assumptionsUsed ?? []).includes("box3"),
    );
    expect(box3Apps.length).toBeGreaterThan(0);

    for (const app of box3Apps) {
      expect((app.calculationDomains ?? []).length).toBeGreaterThan(0);
      expect(
        (app.calculationDomains ?? []).some(
          (value) => value === "tax" || value === "investing" || value === "saving",
        ),
      ).toBe(true);
      expect(
        app.disclaimerType === "taxIndicative" ||
          app.disclaimerType === "financialEducation",
      ).toBe(true);
    }
  });
});
