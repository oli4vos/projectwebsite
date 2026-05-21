import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_PROFILE_STORAGE_KEY, type UserProfile } from "@/lib/user-profile";
import {
  clearUserProfileFromStoreAsync,
  loadUserProfileFromStoreAsync,
  saveUserProfileToStoreAsync,
} from "@/lib/storage/profile-store-async";

type LocalStorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createWindowMock() {
  const values = new Map<string, string>();
  const localStorage: LocalStorageMock = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };

  return {
    localStorage,
    dispatchEvent: () => true,
    __values: values,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  Reflect.deleteProperty(globalThis, "window");
});

describe("profile-store-async", () => {
  it("loads empty local profile safely in async mode", async () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "local");

    const result = await loadUserProfileFromStoreAsync();

    expect(result.data).toEqual({});
  });

  it("saves and loads profile in async local adapter", async () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "local");
    const profile: UserProfile = {
      income: {
        grossAnnualIncome: 82000,
      },
    };

    await saveUserProfileToStoreAsync(profile);
    const loaded = await loadUserProfileFromStoreAsync();

    expect(loaded.data?.income?.grossAnnualIncome).toBe(82000);
    expect(windowMock.__values.get(USER_PROFILE_STORAGE_KEY)).toBeTruthy();
  });

  it("clears profile in async mode", async () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "local");
    await saveUserProfileToStoreAsync({
      income: { grossAnnualIncome: 1000 },
    });

    await clearUserProfileFromStoreAsync();

    const loaded = await loadUserProfileFromStoreAsync();
    expect(loaded.data).toEqual({});
  });

  it("hybrid and remote async mode fall back safely", async () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "hybrid");
    const hybridResult = await loadUserProfileFromStoreAsync();
    expect(hybridResult.data).toEqual({});

    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "remote");
    const remoteResult = await loadUserProfileFromStoreAsync();
    expect(remoteResult.data).toEqual({});
  });

  it("invalid mode falls back to local behavior", async () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "invalid-mode");

    const result = await loadUserProfileFromStoreAsync();
    expect(result.data).toEqual({});
  });

  it("async API returns promise with result shape", async () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    const result = await loadUserProfileFromStoreAsync();
    expect(result).toHaveProperty("data");
    expect(result.data === null || typeof result.data === "object").toBe(true);
  });
});
