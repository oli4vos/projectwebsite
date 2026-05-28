import { describe, expect, it } from "vitest";
import {
  buildSavedCalculationHref,
  getSavedCalculationIdFromSearchParams,
} from "@/lib/storage/saved-calculations/saved-calculation-links";

describe("saved calculation links", () => {
  it("builds tool urls with saved calculation query id", () => {
    const href = buildSavedCalculationHref("volgende-euro", "abc-123");
    expect(href).toBe("/apps/volgende-euro?savedCalculationId=abc-123");
  });

  it("encodes slug and id safely", () => {
    const href = buildSavedCalculationHref(
      "tool met spatie",
      "id met spatie",
    );
    expect(href).toBe(
      "/apps/tool%20met%20spatie?savedCalculationId=id%20met%20spatie",
    );
  });

  it("reads and sanitizes saved calculation id from search params", () => {
    const params = new URLSearchParams({
      savedCalculationId: "  scenario-1  ",
    });
    expect(getSavedCalculationIdFromSearchParams(params)).toBe("scenario-1");
  });

  it("returns null for missing ids", () => {
    const params = new URLSearchParams();
    expect(getSavedCalculationIdFromSearchParams(params)).toBeNull();
    expect(getSavedCalculationIdFromSearchParams(null)).toBeNull();
  });
});

