import { afterEach, describe, expect, it } from "vitest";
import {
  localSavedCalculationStore,
  SAVED_CALCULATIONS_STORAGE_KEY,
} from "@/lib/storage/saved-calculations/local-saved-calculation-store";

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
    __values: values,
  };
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("localSavedCalculationStore", () => {
  it("returns empty list on empty store", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    const result = localSavedCalculationStore.listCalculations();
    expect(result.data).toEqual([]);
  });

  it("saves and gets a calculation", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    const saved = localSavedCalculationStore.saveCalculation({
      toolSlug: "fire-na-belasting",
      input: { a: 1 },
      result: { b: 2 },
    });

    const loaded = localSavedCalculationStore.getCalculation(saved.data.id);

    expect(loaded.data?.toolSlug).toBe("fire-na-belasting");
    expect(loaded.data?.result).toEqual({ b: 2 });
  });

  it("updates title/input/result and timestamp/version", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    const saved = localSavedCalculationStore.saveCalculation({
      toolSlug: "volgende-euro",
      input: { x: 1 },
    }).data;
    const beforeUpdatedAt = saved.updatedAt;
    const beforeVersion = saved.version;

    const updated = localSavedCalculationStore.updateCalculation({
      id: saved.id,
      title: "Nieuwe titel",
      input: { x: 2 },
      result: { y: 3 },
    }).data;

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Nieuwe titel");
    expect(updated?.input).toEqual({ x: 2 });
    expect(updated?.result).toEqual({ y: 3 });
    expect(updated!.updatedAt >= beforeUpdatedAt).toBe(true);
    expect((updated?.version ?? 0) > beforeVersion).toBe(true);
  });

  it("deletes and clears calculations", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    const first = localSavedCalculationStore.saveCalculation({
      toolSlug: "box-3-impact",
      input: { x: 1 },
    }).data;
    const second = localSavedCalculationStore.saveCalculation({
      toolSlug: "zzp-uurtarief",
      input: { x: 2 },
    }).data;

    expect(localSavedCalculationStore.deleteCalculation(first.id).data).toBe(true);
    expect(localSavedCalculationStore.getCalculation(first.id).data).toBeNull();
    expect(localSavedCalculationStore.getCalculation(second.id).data).not.toBeNull();

    localSavedCalculationStore.clearCalculations();
    expect(localSavedCalculationStore.listCalculations().data).toEqual([]);
  });

  it("falls back to empty list on invalid json", () => {
    const windowMock = createWindowMock();
    windowMock.__values.set(SAVED_CALCULATIONS_STORAGE_KEY, "{invalid");
    (globalThis as { window?: unknown }).window = windowMock;

    const result = localSavedCalculationStore.listCalculations();
    expect(result.data).toEqual([]);
  });

  it("ignores invalid items", () => {
    const windowMock = createWindowMock();
    windowMock.__values.set(
      SAVED_CALCULATIONS_STORAGE_KEY,
      JSON.stringify([
        { foo: "bar" },
        {
          id: "ok",
          toolSlug: "fire-na-belasting",
          title: "Titel",
          input: { a: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      ]),
    );
    (globalThis as { window?: unknown }).window = windowMock;

    const result = localSavedCalculationStore.listCalculations();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.id).toBe("ok");
  });

  it("enforces max 50 and newest-first sorting", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    for (let index = 0; index < 55; index += 1) {
      localSavedCalculationStore.saveCalculation({
        toolSlug: "tool",
        title: `Scenario ${index}`,
        input: { index },
      });
    }

    const result = localSavedCalculationStore.listCalculations();
    expect(result.data).toHaveLength(50);
    expect(result.data[0]?.title).toBe("Scenario 54");
  });

  it("does not crash without window", () => {
    expect(localSavedCalculationStore.listCalculations().data).toEqual([]);
    expect(() =>
      localSavedCalculationStore.saveCalculation({
        toolSlug: "tool",
        input: {},
      }),
    ).not.toThrow();
  });
});
