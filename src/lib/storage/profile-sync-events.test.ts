import { afterEach, describe, expect, it } from "vitest";
import {
  clearProfileSyncEvents,
  getProfileSyncEvents,
  recordProfileSyncEvent,
} from "@/lib/storage/profile-sync-events";
import type { ProfileSyncEvent } from "@/lib/storage/profile-sync.types";

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

function event(index: number): ProfileSyncEvent {
  return {
    status: "idle",
    reason: "manual",
    message: `event-${index}`,
    at: `2026-01-01T00:00:${String(index).padStart(2, "0")}.000Z`,
  };
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  clearProfileSyncEvents();
});

describe("profile-sync-events", () => {
  it("stores and reads events", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    recordProfileSyncEvent(event(1));
    recordProfileSyncEvent(event(2));
    const events = getProfileSyncEvents();
    expect(events.length).toBe(2);
    expect(events[1]?.message).toBe("event-2");
  });

  it("clears events", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    recordProfileSyncEvent(event(1));
    clearProfileSyncEvents();
    expect(getProfileSyncEvents()).toEqual([]);
  });

  it("caps event list at max size", () => {
    (globalThis as { window?: unknown }).window = createWindowMock();
    for (let index = 0; index < 25; index += 1) {
      recordProfileSyncEvent(event(index));
    }
    const events = getProfileSyncEvents();
    expect(events.length).toBe(20);
    expect(events[0]?.message).toBe("event-5");
  });

  it("falls back safely on invalid JSON", () => {
    const windowMock = createWindowMock();
    windowMock.__values.set("project-site:profile-sync-events:v1", "{invalid");
    (globalThis as { window?: unknown }).window = windowMock;
    expect(getProfileSyncEvents()).toEqual([]);
  });

  it("does not throw without window", () => {
    expect(() => recordProfileSyncEvent(event(1))).not.toThrow();
    expect(getProfileSyncEvents()).toHaveLength(1);
    clearProfileSyncEvents();
    expect(getProfileSyncEvents()).toEqual([]);
  });
});
