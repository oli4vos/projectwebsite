import { describe, expect, it } from "vitest";
import type { AppManifest } from "@/lib/app-types";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";

describe("generated app registry", () => {
  it("does not expose hidden draft apps", () => {
    expect(appRegistryBySlug["compensatie-pechgeneratie"]).toBeUndefined();
    expect(appRegistry.some((app) => app.slug === "compensatie-pechgeneratie")).toBe(
      false,
    );
  });

  it("contains expected public tools", () => {
    expect(appRegistry).toHaveLength(5);
    expect(appRegistryBySlug["familiehulp-eerste-woning"]).toBeDefined();
    expect(appRegistryBySlug["hypotheek-impact-studieschuld"]).toBeDefined();
    expect(appRegistryBySlug["studieschuld-vs-beleggen"]).toBeDefined();
    expect(appRegistryBySlug["volgende-euro"]).toBeDefined();
    expect(appRegistryBySlug["schulden-volgorde"]).toBeDefined();
    expect(appRegistryBySlug["jaarruimte-vs-vrij-beleggen"]).toBeUndefined();
    expect(appRegistryBySlug["box-3-impact"]).toBeUndefined();
    expect(appRegistryBySlug["hypotheek-aflossen-vs-beleggen"]).toBeUndefined();
    expect(appRegistryBySlug["zzp-uurtarief"]).toBeUndefined();
    expect(appRegistryBySlug["koop-vs-huur"]).toBeUndefined();
    expect(appRegistryBySlug["kind-wordt-18-impact"]).toBeUndefined();
  });

  it("keeps manifest metadata consistent for disclaimer and output type", () => {
    for (const manifest of appRegistry as AppManifest[]) {
      const assumptionsUsed = manifest.assumptionsUsed ?? [];
      const calculationDomains = manifest.calculationDomains ?? [];
      const disclaimerType = manifest.disclaimerType;
      const outputType = manifest.outputType;

      if (disclaimerType === "taxIndicative") {
        expect(assumptionsUsed).toContain("tax");
        expect(
          assumptionsUsed.some(
            (value) => value === "box1" || value === "box3",
          ),
        ).toBe(true);
      }

      if (disclaimerType === "mortgageIndicative") {
        expect(
          calculationDomains.some(
            (value) => value === "mortgage" || value === "housing",
          ),
        ).toBe(true);
      }

      if (disclaimerType === "duoIndicative") {
        expect(assumptionsUsed).toContain("duo");
      }

      if (outputType === "singleResult") {
        expect((manifest.tags ?? []).length).toBeGreaterThan(0);
      }

      if (outputType === "scenarioComparison") {
        expect(calculationDomains.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps reasonHint compact and user-facing", () => {
    for (const manifest of appRegistry as AppManifest[]) {
      expect(typeof manifest.reasonHint).toBe("string");
      const reasonHint = manifest.reasonHint?.trim() ?? "";
      expect(reasonHint.length).toBeGreaterThan(0);
      expect(reasonHint.length).toBeLessThanOrEqual(180);
      expect(reasonHint.includes("<")).toBe(false);
      expect(reasonHint.includes(">")).toBe(false);
    }
  });

  it("uses central box3 domain metadata consistently", () => {
    const box3Apps = (appRegistry as AppManifest[]).filter((app) =>
      (app.assumptionsUsed ?? []).includes("box3"),
    );

    for (const app of box3Apps) {
      expect((app.calculationDomains ?? []).length).toBeGreaterThan(0);
      expect(
        (app.calculationDomains ?? []).some(
          (value) => value === "tax" || value === "investing" || value === "saving",
        ),
      ).toBe(true);
      expect(
        app.disclaimerType === "taxIndicative" ||
          app.disclaimerType === "financialEducation" ||
          app.disclaimerType === "mortgageIndicative",
      ).toBe(true);
    }
  });
});
