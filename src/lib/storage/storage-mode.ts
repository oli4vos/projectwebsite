export type ProfileStorageMode = "local" | "hybrid" | "remote";

const PROFILE_STORAGE_MODES = new Set<ProfileStorageMode>([
  "local",
  "hybrid",
  "remote",
]);

export function sanitizeProfileStorageMode(value: unknown): ProfileStorageMode {
  if (typeof value !== "string") {
    return "local";
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!PROFILE_STORAGE_MODES.has(normalizedValue as ProfileStorageMode)) {
    return "local";
  }

  return normalizedValue as ProfileStorageMode;
}

export function getConfiguredProfileStorageMode(): ProfileStorageMode {
  return sanitizeProfileStorageMode(
    process.env.NEXT_PUBLIC_PROFILE_STORAGE_MODE,
  );
}

export function isRemoteProfileStorageMode(mode: ProfileStorageMode): boolean {
  return mode === "hybrid" || mode === "remote";
}
