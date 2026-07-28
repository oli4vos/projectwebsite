import type { UserProfile } from "@/lib/user-profile";
import type { ProfileStore, ProfileStoreResult } from "@/lib/storage/profile-store.types";

type LocalProfileStoreOptions = {
  storageKey: string;
  storageEvent: string;
  storageArea?: "localStorage" | "sessionStorage";
  defaultProfile: UserProfile;
  sanitizeProfile: (profile: UserProfile) => UserProfile;
  profileHasValues: (profile: UserProfile) => boolean;
};

function resolveWindow(): Window | null {
  return typeof window === "undefined" ? null : window;
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown storage error";
}

export function createLocalProfileStore({
  storageKey,
  storageEvent,
  storageArea = "localStorage",
  defaultProfile,
  sanitizeProfile,
  profileHasValues,
}: LocalProfileStoreOptions): ProfileStore {
  function loadProfile(): ProfileStoreResult<UserProfile> {
    const activeWindow = resolveWindow();

    if (!activeWindow) {
      return { data: defaultProfile };
    }

    try {
      const rawValue = activeWindow[storageArea].getItem(storageKey);

      if (!rawValue) {
        return { data: defaultProfile };
      }

      const parsedValue = JSON.parse(rawValue) as UserProfile;
      return { data: sanitizeProfile(parsedValue) };
    } catch (error) {
      return {
        data: defaultProfile,
        error: safeErrorMessage(error),
      };
    }
  }

  function saveProfile(profile: UserProfile): ProfileStoreResult<UserProfile> {
    const sanitizedProfile = sanitizeProfile({
      ...profile,
      updatedAt: new Date().toISOString(),
    });
    const activeWindow = resolveWindow();

    if (!activeWindow) {
      return { data: sanitizedProfile };
    }

    try {
      if (!profileHasValues(sanitizedProfile)) {
        activeWindow[storageArea].removeItem(storageKey);
        activeWindow.dispatchEvent(new Event(storageEvent));
        return { data: defaultProfile };
      }

      activeWindow[storageArea].setItem(storageKey, JSON.stringify(sanitizedProfile));
      activeWindow.dispatchEvent(new Event(storageEvent));

      return { data: sanitizedProfile };
    } catch (error) {
      return {
        data: sanitizedProfile,
        error: safeErrorMessage(error),
      };
    }
  }

  function clearProfile(): ProfileStoreResult<null> {
    const activeWindow = resolveWindow();

    if (!activeWindow) {
      return { data: null };
    }

    try {
      activeWindow[storageArea].removeItem(storageKey);
      activeWindow.dispatchEvent(new Event(storageEvent));
      return { data: null };
    } catch (error) {
      return {
        data: null,
        error: safeErrorMessage(error),
      };
    }
  }

  return {
    loadProfile,
    saveProfile,
    clearProfile,
  };
}
