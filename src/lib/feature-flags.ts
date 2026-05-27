export function parseFeatureFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

export const ENABLE_KNOWLEDGE_LEVEL = parseFeatureFlag(
  process.env.NEXT_PUBLIC_ENABLE_KNOWLEDGE_LEVEL,
);

export const ENABLE_PROFILE = parseFeatureFlag(
  process.env.NEXT_PUBLIC_ENABLE_PROFILE,
);

export const ENABLE_PROFILE_SYNC_PANEL = parseFeatureFlag(
  process.env.NEXT_PUBLIC_ENABLE_PROFILE_SYNC_PANEL,
);

export const ENABLE_SAVED_CALCULATIONS = parseFeatureFlag(
  process.env.NEXT_PUBLIC_ENABLE_SAVED_CALCULATIONS,
);
