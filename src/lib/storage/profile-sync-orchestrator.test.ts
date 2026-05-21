import { describe, expect, it } from "vitest";
import { syncProfileOnce } from "@/lib/storage/profile-sync-orchestrator";
import type { ProfileStoreAsync } from "@/lib/storage/profile-store.types";

function makeStore(
  data: Record<string, unknown> | null,
  opts?: { error?: string },
): ProfileStoreAsync {
  return {
    async loadProfile() {
      return { data: data as never, error: opts?.error };
    },
    async saveProfile(profile) {
      return { data: profile as never, error: opts?.error };
    },
    async clearProfile() {
      return { data: null, error: opts?.error };
    },
  };
}

describe("profile-sync-orchestrator", () => {
  it("skips in local mode", async () => {
    const result = await syncProfileOnce({ mode: "local" });
    expect(result.status).toBe("skipped");
    expect(result.reason).toBe("localMode");
  });

  it("falls back in hybrid mode when remote reports fallback", async () => {
    const result = await syncProfileOnce({
      mode: "hybrid",
      stores: {
        local: makeStore({ updatedAt: "2026-01-01T00:00:00.000Z", income: { grossAnnualIncome: 1 } }),
        remote: makeStore({}, { error: "Hybrid async profile storage gebruikt momenteel lokale fallback." }),
      },
    });
    expect(["pushedLocal", "fallbackLocal", "idle"]).toContain(result.status);
    expect(result.events.length).toBeGreaterThan(0);
  });

  it("remote mode falls back to local profile when remote missing", async () => {
    const result = await syncProfileOnce({
      mode: "remote",
      stores: {
        local: makeStore({ updatedAt: "2026-01-01T00:00:00.000Z", income: { grossAnnualIncome: 2 } }),
        remote: makeStore({}, { error: "notAuthenticated fallback" }),
      },
    });
    expect(result.status).toBe("fallbackLocal");
    expect(result.profile?.income?.grossAnnualIncome).toBe(2);
  });

  it("preferNewest selects newest profile", async () => {
    const result = await syncProfileOnce({
      mode: "hybrid",
      policy: "preferNewest",
      stores: {
        local: makeStore({ updatedAt: "2026-01-02T00:00:00.000Z", income: { grossAnnualIncome: 3 } }),
        remote: makeStore({ updatedAt: "2026-01-01T00:00:00.000Z", income: { grossAnnualIncome: 4 } }),
      },
    });
    expect(result.profile?.income?.grossAnnualIncome).toBe(3);
  });

  it("does not throw and returns error result on internal failure", async () => {
    const brokenStore: ProfileStoreAsync = {
      async loadProfile() {
        throw new Error("load failed");
      },
      async saveProfile(profile) {
        return { data: profile };
      },
      async clearProfile() {
        return { data: null };
      },
    };

    const result = await syncProfileOnce({
      mode: "hybrid",
      stores: { local: brokenStore, remote: makeStore(null) },
    });
    expect(result.status).toBe("error");
    expect(result.error).toBe("load failed");
  });
});
