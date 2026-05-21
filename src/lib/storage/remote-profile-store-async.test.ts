import { describe, expect, it } from "vitest";
import { createRemoteProfileStoreAsync } from "@/lib/storage/remote-profile-store-async";
import type { ProfileStoreAsync } from "@/lib/storage/profile-store.types";

function createLocalStoreMock(): ProfileStoreAsync {
  return {
    async loadProfile() {
      return { data: { income: { grossAnnualIncome: 1000 } } };
    },
    async saveProfile(profile) {
      return { data: profile };
    },
    async clearProfile() {
      return { data: null };
    },
  };
}

describe("remote-profile-store-async", () => {
  it("falls back to local when client is not configured", async () => {
    const store = createRemoteProfileStoreAsync({
      mode: "remote",
      localStoreAsync: createLocalStoreMock(),
      createClient: () => null,
      getAuthSession: async () => ({
        data: { userId: "u1", isAuthenticated: true },
      }),
    });

    const result = await store.loadProfile();
    expect(result.data?.income?.grossAnnualIncome).toBe(1000);
  });

  it("falls back to local when session is unauthenticated", async () => {
    const store = createRemoteProfileStoreAsync({
      mode: "hybrid",
      localStoreAsync: createLocalStoreMock(),
      createClient: () =>
        ({
          from: () => ({
            select: () => ({
              eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
            }),
          }),
        }) as never,
      getAuthSession: async () => ({
        data: { userId: null, isAuthenticated: false },
      }),
    });

    const result = await store.loadProfile();
    expect(result.data?.income?.grossAnnualIncome).toBe(1000);
  });

  it("returns fallback result with error when remote save fails", async () => {
    const localStore = createLocalStoreMock();
    const store = createRemoteProfileStoreAsync({
      mode: "remote",
      localStoreAsync: localStore,
      createClient: () =>
        ({
          from: () => ({
            upsert: async () => ({ error: { message: "remote save failed" } }),
          }),
        }) as never,
      getAuthSession: async () => ({
        data: { userId: "u1", isAuthenticated: true },
      }),
    });

    const result = await store.saveProfile({ income: { grossAnnualIncome: 900 } });
    expect(result.data?.income?.grossAnnualIncome).toBe(900);
    expect(result.error).toBe("remote save failed");
  });

  it("sanitizes remote loaded data", async () => {
    const store = createRemoteProfileStoreAsync({
      mode: "remote",
      localStoreAsync: createLocalStoreMock(),
      createClient: () =>
        ({
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { data: { income: { grossAnnualIncome: -100 } } },
                  error: null,
                }),
              }),
            }),
          }),
        }) as never,
      getAuthSession: async () => ({
        data: { userId: "u1", isAuthenticated: true },
      }),
    });

    const result = await store.loadProfile();
    expect(result.data?.income?.grossAnnualIncome).toBe(0);
  });

  it("does not throw on remote exceptions", async () => {
    const store = createRemoteProfileStoreAsync({
      mode: "remote",
      localStoreAsync: createLocalStoreMock(),
      createClient: () =>
        ({
          from: () => ({
            delete: () => ({
              eq: () => {
                throw new Error("boom");
              },
            }),
          }),
        }) as never,
      getAuthSession: async () => ({
        data: { userId: "u1", isAuthenticated: true },
      }),
    });

    const result = await store.clearProfile();
    expect(result.data).toBeNull();
    expect(result.error).toBe("boom");
  });
});
