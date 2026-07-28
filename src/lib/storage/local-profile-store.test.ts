import { afterEach, describe, expect, it } from "vitest";
import {
  USER_PROFILE_STORAGE_EVENT,
  USER_PROFILE_STORAGE_KEY,
  defaultUserProfile,
  profileHasValues,
  sanitizeUserProfile,
  type UserProfile,
} from "@/lib/user-profile";
import { createLocalProfileStore } from "@/lib/storage/local-profile-store";

type LocalStorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createWindowMock() {
  const values = new Map<string, string>();
  const sessionValues = new Map<string, string>();
  const localStorage: LocalStorageMock = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  const sessionStorage: LocalStorageMock = {
    getItem: (key: string) => sessionValues.get(key) ?? null,
    setItem: (key: string, value: string) => {
      sessionValues.set(key, value);
    },
    removeItem: (key: string) => {
      sessionValues.delete(key);
    },
  };

  return {
    localStorage,
    sessionStorage,
    dispatchEvent: () => true,
    __values: values,
    __sessionValues: sessionValues,
  };
}

function createStore() {
  return createLocalProfileStore({
    storageKey: USER_PROFILE_STORAGE_KEY,
    storageEvent: USER_PROFILE_STORAGE_EVENT,
    defaultProfile: defaultUserProfile,
    sanitizeProfile: sanitizeUserProfile,
    profileHasValues,
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("createLocalProfileStore", () => {
  it("loads default profile safely when storage is empty", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    const store = createStore();

    const result = store.loadProfile();

    expect(result.data).toEqual(defaultUserProfile);
    expect(result.error).toBeUndefined();
  });

  it("saves and loads profile data", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    const store = createStore();
    const profile: UserProfile = {
      income: {
        grossAnnualIncome: 75000,
      },
    };

    const saveResult = store.saveProfile(profile);
    const loadResult = store.loadProfile();

    expect(saveResult.data?.income?.grossAnnualIncome).toBe(75000);
    expect(typeof saveResult.data?.updatedAt).toBe("string");
    expect(loadResult.data?.income?.grossAnnualIncome).toBe(75000);
    expect(windowMock.__values.get(USER_PROFILE_STORAGE_KEY)).toBeTruthy();
  });

  it("can keep profile data in session storage only", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    const store = createLocalProfileStore({
      storageKey: USER_PROFILE_STORAGE_KEY,
      storageEvent: USER_PROFILE_STORAGE_EVENT,
      storageArea: "sessionStorage",
      defaultProfile: defaultUserProfile,
      sanitizeProfile: sanitizeUserProfile,
      profileHasValues,
    });

    store.saveProfile({ income: { grossAnnualIncome: 64000 } });

    expect(windowMock.__sessionValues.get(USER_PROFILE_STORAGE_KEY)).toBeTruthy();
    expect(windowMock.__values.get(USER_PROFILE_STORAGE_KEY)).toBeUndefined();
    expect(store.loadProfile().data?.income?.grossAnnualIncome).toBe(64000);
  });

  it("clears profile data from storage", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    const store = createStore();
    store.saveProfile({
      income: {
        grossAnnualIncome: 1000,
      },
    });

    const clearResult = store.clearProfile();

    expect(clearResult.data).toBeNull();
    expect(windowMock.__values.get(USER_PROFILE_STORAGE_KEY)).toBeUndefined();
  });

  it("falls back safely on invalid JSON", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    windowMock.__values.set(USER_PROFILE_STORAGE_KEY, "{invalid-json");
    const store = createStore();

    const result = store.loadProfile();

    expect(result.data).toEqual(defaultUserProfile);
    expect(result.error).toBeTruthy();
  });

  it("keeps sanitizing behavior", () => {
    const windowMock = createWindowMock();
    (globalThis as { window?: unknown }).window = windowMock;
    const store = createStore();
    store.saveProfile({
      income: {
        grossAnnualIncome: -500,
      },
      studentDebt: {
        duoInterestRate: 140,
      },
    });

    const result = store.loadProfile();

    expect(result.data?.income?.grossAnnualIncome).toBe(0);
    expect(result.data?.studentDebt?.duoInterestRate).toBe(100);
  });
});
