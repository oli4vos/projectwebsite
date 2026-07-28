import { afterEach, describe, expect, it } from "vitest";
import {
  USER_PROFILE_SESSION_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
} from "@/lib/user-profile";
import {
  clearUserProfileFromStore,
  getProfileRetentionFromStore,
  loadUserProfileFromStore,
  saveUserProfileToStore,
  setProfileRetentionInStore,
} from "@/lib/storage/profile-store";
import { PROFILE_RETENTION_STORAGE_KEY } from "@/lib/storage/profile-retention";

type StorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createStorage(values: Map<string, string>): StorageMock {
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function createWindowMock() {
  const localValues = new Map<string, string>();
  const sessionValues = new Map<string, string>();

  return {
    localStorage: createStorage(localValues),
    sessionStorage: createStorage(sessionValues),
    dispatchEvent: () => true,
    localValues,
    sessionValues,
  };
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("profile store retention", () => {
  it("uses session storage by default for a new profile", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;

    saveUserProfileToStore({ income: { grossAnnualIncome: 58000 } });

    expect(getProfileRetentionFromStore()).toBe("session");
    expect(
      windowMock.sessionValues.get(USER_PROFILE_SESSION_STORAGE_KEY),
    ).toBeTruthy();
    expect(windowMock.localValues.get(USER_PROFILE_STORAGE_KEY)).toBeUndefined();
  });

  it("keeps an existing local profile as a device profile", () => {
    const windowMock = createWindowMock();
    windowMock.localValues.set(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify({ income: { grossAnnualIncome: 61000 } }),
    );
    (globalThis as { window?: unknown }).window = windowMock;

    expect(getProfileRetentionFromStore()).toBe("device");
    expect(loadUserProfileFromStore().income?.grossAnnualIncome).toBe(61000);
  });

  it("moves profile data between device and session storage", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    setProfileRetentionInStore("device");
    saveUserProfileToStore({ studentDebt: { remainingDebt: 19000 } });

    const migrated = setProfileRetentionInStore("session");

    expect(migrated.studentDebt?.remainingDebt).toBe(19000);
    expect(windowMock.localValues.get(USER_PROFILE_STORAGE_KEY)).toBeUndefined();
    expect(
      windowMock.sessionValues.get(USER_PROFILE_SESSION_STORAGE_KEY),
    ).toBeTruthy();
    expect(windowMock.localValues.get(PROFILE_RETENTION_STORAGE_KEY)).toBe(
      "session",
    );

    clearUserProfileFromStore();
    expect(
      windowMock.sessionValues.get(USER_PROFILE_SESSION_STORAGE_KEY),
    ).toBeUndefined();
  });
});
