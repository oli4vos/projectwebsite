type ProfilePatch<T extends Record<string, unknown>> = Partial<T>;

function hasPatchValues<T extends Record<string, unknown>>(patch: ProfilePatch<T>) {
  return Object.keys(patch).length > 0;
}

export function createProfilePrefillState<T extends Record<string, unknown>>(input: {
  defaultValues: T;
  profilePatch: ProfilePatch<T>;
  hasProfile: boolean;
  profileUpdatedAt?: string;
}) {
  const { defaultValues, profilePatch, hasProfile, profileUpdatedAt } = input;
  const hasRelevantProfileValues = hasProfile && hasPatchValues(profilePatch);
  const profileKey = hasRelevantProfileValues
    ? `profile-${profileUpdatedAt ?? JSON.stringify(profilePatch)}`
    : "profile-empty";

  return {
    hasRelevantProfileValues,
    profileKey,
    initialValues: {
      ...defaultValues,
      ...profilePatch,
    },
  };
}

export function mergeProfilePatchIntoValues<T extends Record<string, unknown>>(
  currentValues: T,
  profilePatch: ProfilePatch<T>,
) {
  if (!hasPatchValues(profilePatch)) {
    return currentValues;
  }

  return {
    ...currentValues,
    ...profilePatch,
  };
}
