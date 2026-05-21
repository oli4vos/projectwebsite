import { describe, expect, it } from "vitest";
import { resolveProfileSyncPolicy } from "@/lib/storage/profile-sync-policy";
import type { UserProfile } from "@/lib/user-profile";

function profile(updatedAt?: string): UserProfile {
  return {
    updatedAt,
    income: { grossAnnualIncome: 1000 },
  };
}

describe("profile-sync-policy", () => {
  it("prefers local when local is newer", () => {
    const result = resolveProfileSyncPolicy(
      profile("2026-05-20T10:00:00.000Z"),
      profile("2026-05-19T10:00:00.000Z"),
      "preferNewest",
    );
    expect(result.winner).toBe("local");
    expect(result.reason).toBe("localNewer");
  });

  it("prefers remote when remote is newer", () => {
    const result = resolveProfileSyncPolicy(
      profile("2026-05-19T10:00:00.000Z"),
      profile("2026-05-20T10:00:00.000Z"),
      "preferNewest",
    );
    expect(result.winner).toBe("remote");
    expect(result.reason).toBe("remoteNewer");
  });

  it("preferLocal wins conflict", () => {
    const result = resolveProfileSyncPolicy(
      profile("2026-05-19T10:00:00.000Z"),
      profile("2026-05-20T10:00:00.000Z"),
      "preferLocal",
    );
    expect(result.winner).toBe("local");
  });

  it("preferRemote wins when remote exists", () => {
    const result = resolveProfileSyncPolicy(
      profile("2026-05-20T10:00:00.000Z"),
      profile("2026-05-19T10:00:00.000Z"),
      "preferRemote",
    );
    expect(result.winner).toBe("remote");
  });

  it("handles missing profiles safely", () => {
    expect(resolveProfileSyncPolicy(profile(), null).winner).toBe("local");
    expect(resolveProfileSyncPolicy(null, profile()).winner).toBe("remote");
    expect(resolveProfileSyncPolicy(null, null).winner).toBe("none");
  });

  it("handles invalid timestamps safely", () => {
    const result = resolveProfileSyncPolicy(
      profile("invalid"),
      profile("2026-01-01T00:00:00.000Z"),
      "preferNewest",
    );
    expect(result.winner).toBe("local");
    expect(result.reason).toBe("unknown");
  });
});
