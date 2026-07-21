import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { AppManifest } from "@/lib/app-types";
import { appComponents } from "@/lib/app-components";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";

function getManifestFiles() {
  return fs.readdirSync(path.join(process.cwd(), "apps"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(process.cwd(), "apps", entry.name, "app.json"))
    .filter((manifestPath) => fs.existsSync(manifestPath));
}

function readManifest(manifestPath: string): AppManifest {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as AppManifest;
}

describe("generated app registry", () => {
  it("does not expose hidden draft apps", () => {
    expect(appRegistryBySlug["compensatie-pechgeneratie"]).toBeUndefined();
    expect(appRegistry.some((app) => app.slug === "compensatie-pechgeneratie")).toBe(
      false,
    );
  });

  it("contains expected public tools", () => {
    expect(appRegistry).toHaveLength(11);
    expect(appRegistryBySlug["artifact-hypotheek-wonen-maximale-hypotheek"]).toBeDefined();
    expect(appRegistryBySlug["duo-doorlenen-of-stoppen"]).toBeUndefined();
    expect(appRegistryBySlug["duo-extra-aflossen"]).toBeDefined();
    expect(appRegistryBySlug["duo-leenbedrag-impact"]).toBeDefined();
    expect(appRegistryBySlug["duo-maandbedrag"]).toBeDefined();
    expect(appRegistryBySlug["duo-aanvullende-beurs"]).toBeDefined();
    expect(appRegistryBySlug["duo-schuld-bij-starten-lenen"]).toBeDefined();
    expect(appRegistryBySlug["duo-stoppen-kosten-prestatiebeurs"]).toBeDefined();
    expect(appRegistryBySlug["familiehulp-eerste-woning"]).toBeDefined();
    expect(appRegistryBySlug["hypotheek-impact-studieschuld"]).toBeDefined();
    expect(appRegistryBySlug["schulden-volgorde"]).toBeDefined();
    expect(appRegistryBySlug["studieschuld-vs-beleggen"]).toBeUndefined();
    expect(appRegistryBySlug["volgende-euro"]).toBeUndefined();
    expect(appRegistryBySlug["jaarruimte-vs-vrij-beleggen"]).toBeUndefined();
    expect(appRegistryBySlug["box-3-impact"]).toBeUndefined();
    expect(appRegistryBySlug["hypotheek-aflossen-vs-beleggen"]).toBeUndefined();
    expect(appRegistryBySlug["zzp-uurtarief"]).toBeUndefined();
    expect(appRegistryBySlug["koop-vs-huur"]).toBeUndefined();
    expect(appRegistryBySlug["kind-wordt-18-impact"]).toBeUndefined();
    expect(appRegistryBySlug["toeslagen-scan"]).toBeDefined();
    expect(appComponents["toeslagen-scan"]).toBeDefined();
    expect(appComponents["duo-aanvullende-beurs"]).toBeDefined();
  });

  it("publishes allowance scan while keeping other hidden manifests excluded", () => {
    const manifests = getManifestFiles().map(readManifest);
    const allowanceScan = manifests.find((manifest) => manifest.slug === "toeslagen-scan");
    const hiddenManifests = manifests.filter((manifest) => manifest.visibility === "hidden");

    expect(manifests).toHaveLength(167);
    expect(appRegistry).toHaveLength(11);
    expect(hiddenManifests).toHaveLength(156);
    expect(allowanceScan).toMatchObject({
      title: "Welke toeslagen passen mogelijk bij mij?",
      status: "beta",
      visibility: "public",
      type: "frontend",
      entry: "Calculator.tsx",
    });
    expect(appRegistryBySlug["toeslagen-scan"]).toMatchObject({
      status: "beta",
      visibility: "public",
      outputType: "checklist",
      disclaimerType: "taxIndicative",
    });
    expect(appComponents["volgende-euro"]).toBeUndefined();
  });

  it("keeps manifest metadata consistent for disclaimer and output type", () => {
    for (const manifest of appRegistry as AppManifest[]) {
      const assumptionsUsed = manifest.assumptionsUsed ?? [];
      const calculationDomains = manifest.calculationDomains ?? [];
      const disclaimerType = manifest.disclaimerType;
      const outputType = manifest.outputType;

      if (disclaimerType === "taxIndicative") {
        expect(
          assumptionsUsed.some(
            (value) => value === "tax" || value === "box1" || value === "box3",
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
