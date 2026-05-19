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
  });
});
