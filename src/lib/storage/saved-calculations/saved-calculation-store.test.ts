import { afterEach, describe, expect, it } from "vitest";
import {
  clearSavedCalculations,
  getSavedCalculationStore,
  listSavedCalculations,
  saveSavedCalculation,
} from "@/lib/storage/saved-calculations/saved-calculation-store";

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
  };
}

function withStorageMode(mode: string | undefined, callback: () => void) {
  const previousMode = process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE;
  if (mode === undefined) {
    delete process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE;
  } else {
    process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE = mode;
  }

  try {
    callback();
  } finally {
    if (previousMode === undefined) {
      delete process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE;
    } else {
      process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE = previousMode;
    }
  }
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  delete process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE;
});

describe("saved calculation store entrypoint", () => {
  it("uses local behavior by default", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();

    const saved = saveSavedCalculation({
      toolSlug: "volgende-euro",
      input: { amount: 100 },
    });

    const list = listSavedCalculations();
    expect(saved.data.toolSlug).toBe("volgende-euro");
    expect(list.data).toHaveLength(1);
  });

  it("falls back to local store in hybrid mode", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();

    withStorageMode("hybrid", () => {
      saveSavedCalculation({
        toolSlug: "box-3-impact",
        input: { amount: 200 },
      });
      const list = listSavedCalculations();
      expect(list.data).toHaveLength(1);
      expect(list.data[0]?.toolSlug).toBe("box-3-impact");
    });
  });

  it("falls back to local store in remote mode", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();

    withStorageMode("remote", () => {
      saveSavedCalculation({
        toolSlug: "fire-na-belasting",
        input: { amount: 300 },
      });
      const list = listSavedCalculations();
      expect(list.data).toHaveLength(1);
      expect(list.data[0]?.toolSlug).toBe("fire-na-belasting");
    });
  });

  it("clear works through entrypoint", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    saveSavedCalculation({
      toolSlug: "zzp-uurtarief",
      input: { amount: 400 },
    });

    clearSavedCalculations();
    expect(listSavedCalculations().data).toEqual([]);
  });

  it("resolves a store instance for every mode", () => {
    withStorageMode(undefined, () => {
      expect(getSavedCalculationStore()).toBeDefined();
    });
    withStorageMode("hybrid", () => {
      expect(getSavedCalculationStore()).toBeDefined();
    });
    withStorageMode("remote", () => {
      expect(getSavedCalculationStore()).toBeDefined();
    });
  });
});

