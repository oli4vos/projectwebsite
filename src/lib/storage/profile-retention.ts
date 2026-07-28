export const PROFILE_RETENTION_STORAGE_KEY =
  "project-site:user-profile:retention:v1";
export const PROFILE_RETENTION_EVENT =
  "project-site:user-profile:retention-changed";

export type ProfileRetention = "session" | "device";

export function sanitizeProfileRetention(
  value: unknown,
): ProfileRetention | null {
  return value === "session" || value === "device" ? value : null;
}

export function readProfileRetentionPreference(): ProfileRetention | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sanitizeProfileRetention(
      window.localStorage.getItem(PROFILE_RETENTION_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function writeProfileRetentionPreference(
  retention: ProfileRetention,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(PROFILE_RETENTION_STORAGE_KEY, retention);
    window.dispatchEvent(new Event(PROFILE_RETENTION_EVENT));
    return true;
  } catch {
    return false;
  }
}
