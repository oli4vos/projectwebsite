import { describe, expect, it } from "vitest";
import { getProfileFixture } from "../../_shared/runtime";
import { calculateGesubsidieerdeRechtsbijstand, TOOL_PROFILE } from "./logic";

describe("calculateGesubsidieerdeRechtsbijstand", () => {
  it("runs fixture for profile", () => {
    const fixture = getProfileFixture(TOOL_PROFILE);
    const result = calculateGesubsidieerdeRechtsbijstand(fixture.input);
    expect(result.profile).toBe(TOOL_PROFILE);
    expect(result.isValid).toBe(fixture.expectValid);
  });

  it("rejects empty input safely", () => {
    const result = calculateGesubsidieerdeRechtsbijstand({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles non-finite values without crashing", () => {
    const result = calculateGesubsidieerdeRechtsbijstand({ valueA: Number.NaN, valueB: Number.POSITIVE_INFINITY });
    expect(result.isValid).toBe(false);
  });
});
