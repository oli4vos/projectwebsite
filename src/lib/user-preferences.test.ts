import { describe, expect, it } from "vitest";
import {
  defaultUserPreferences,
  getKnowledgeLevelLabel,
  sanitizeKnowledgeLevel,
  sanitizeUserPreferences,
} from "./user-preferences";

describe("user preferences", () => {
  it("uses standard as default knowledge level", () => {
    expect(defaultUserPreferences.knowledgeLevel).toBe("standard");
  });

  it("falls back to standard for invalid knowledge level", () => {
    expect(sanitizeKnowledgeLevel("invalid")).toBe("standard");
    expect(sanitizeKnowledgeLevel(undefined)).toBe("standard");
  });

  it("returns labels for all levels", () => {
    expect(getKnowledgeLevelLabel("basic")).toBe("Basis");
    expect(getKnowledgeLevelLabel("standard")).toBe("Normaal");
    expect(getKnowledgeLevelLabel("advanced")).toBe("Verdiept");
  });

  it("sanitizes serialized preferences safely", () => {
    expect(sanitizeUserPreferences({ knowledgeLevel: "basic" }).knowledgeLevel).toBe(
      "basic",
    );
    expect(sanitizeUserPreferences({ knowledgeLevel: "x" }).knowledgeLevel).toBe(
      "standard",
    );
    expect(sanitizeUserPreferences(null).knowledgeLevel).toBe("standard");
  });
});
