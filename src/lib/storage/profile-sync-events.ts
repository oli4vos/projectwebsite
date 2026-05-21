import type { ProfileSyncEvent } from "@/lib/storage/profile-sync.types";

const PROFILE_SYNC_EVENTS_KEY = "project-site:profile-sync-events:v1";
const MAX_PROFILE_SYNC_EVENTS = 20;
let memoryEvents: ProfileSyncEvent[] = [];

function hasWindow() {
  return typeof window !== "undefined";
}

function isValidEvent(value: unknown): value is ProfileSyncEvent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as ProfileSyncEvent;
  return (
    typeof candidate.status === "string" &&
    typeof candidate.reason === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.at === "string"
  );
}

function readEventsFromStorage(): ProfileSyncEvent[] {
  if (!hasWindow()) {
    return memoryEvents.slice();
  }

  try {
    const rawValue = window.localStorage.getItem(PROFILE_SYNC_EVENTS_KEY);
    if (!rawValue) {
      return [];
    }
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidEvent).slice(-MAX_PROFILE_SYNC_EVENTS);
  } catch {
    return [];
  }
}

function writeEvents(events: ProfileSyncEvent[]) {
  const trimmedEvents = events.slice(-MAX_PROFILE_SYNC_EVENTS);
  memoryEvents = trimmedEvents;

  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.setItem(PROFILE_SYNC_EVENTS_KEY, JSON.stringify(trimmedEvents));
  } catch {
    // Ignore storage write errors to keep app stable.
  }
}

export function recordProfileSyncEvent(event: ProfileSyncEvent): void {
  const events = readEventsFromStorage();
  events.push(event);
  writeEvents(events);
}

export function getProfileSyncEvents(): ProfileSyncEvent[] {
  return readEventsFromStorage();
}

export function clearProfileSyncEvents(): void {
  memoryEvents = [];
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.removeItem(PROFILE_SYNC_EVENTS_KEY);
  } catch {
    // Ignore storage clear errors to keep app stable.
  }
}
