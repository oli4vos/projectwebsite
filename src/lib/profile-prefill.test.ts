import { describe, expect, it } from "vitest";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";

describe("profile prefill helpers", () => {
  it("marks profile values as relevant only when profile exists and patch has values", () => {
    const base = createProfilePrefillState({
      defaultValues: { income: "1000", rate: "4.0" },
      profilePatch: { income: "2000" },
      hasProfile: true,
      profileUpdatedAt: "2026-05-19T10:00:00.000Z",
    });

    expect(base.hasRelevantProfileValues).toBe(true);
    expect(base.initialValues.income).toBe("1000");
    expect(base.profileKey).toContain("profile-2026-05-19");
  });

  it("keeps profile empty state when patch has no values", () => {
    const empty = createProfilePrefillState({
      defaultValues: { income: "1000", rate: "4.0" },
      profilePatch: {},
      hasProfile: true,
    });

    expect(empty.hasRelevantProfileValues).toBe(false);
    expect(empty.profileKey).toBe("profile-empty");
    expect(empty.initialValues.income).toBe("1000");
  });

  it("does not create a new object when merging an empty patch", () => {
    const current = { income: "1000", rate: "4.0" };
    const merged = mergeProfilePatchIntoValues(current, {});
    expect(merged).toBe(current);
  });
});
