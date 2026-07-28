import {
  defaultUserProfile,
  profileHasValues,
  type UserProfile,
} from "@/lib/user-profile";
import { localProfileStore } from "@/lib/storage/local-profile-store-instance";
import {
  readProfileRetentionPreference,
  writeProfileRetentionPreference,
  type ProfileRetention,
} from "@/lib/storage/profile-retention";
import { createRemoteProfileStoreStub } from "@/lib/storage/remote-profile-store";
import { sessionProfileStore } from "@/lib/storage/session-profile-store-instance";
import {
  getConfiguredProfileStorageMode,
  type ProfileStorageMode,
} from "@/lib/storage/storage-mode";

function resolveProfileStore(mode: ProfileStorageMode) {
  if (mode === "local") {
    return localProfileStore;
  }

  return createRemoteProfileStoreStub({
    mode,
    localStore: localProfileStore,
  });
}

export const configuredProfileStorageMode = getConfiguredProfileStorageMode();
export const profileStore = resolveProfileStore(configuredProfileStorageMode);

export function getProfileRetentionFromStore(): ProfileRetention {
  const explicitPreference = readProfileRetentionPreference();
  if (explicitPreference) {
    return explicitPreference;
  }

  const existingLocalProfile = localProfileStore.loadProfile().data;
  return existingLocalProfile && profileHasValues(existingLocalProfile)
    ? "device"
    : "session";
}

function getActiveProfileStore() {
  if (configuredProfileStorageMode !== "local") {
    return profileStore;
  }

  return getProfileRetentionFromStore() === "device"
    ? localProfileStore
    : sessionProfileStore;
}

export function loadUserProfileFromStore(): UserProfile {
  return getActiveProfileStore().loadProfile().data ?? defaultUserProfile;
}

export function saveUserProfileToStore(profile: UserProfile): UserProfile {
  return getActiveProfileStore().saveProfile(profile).data ?? defaultUserProfile;
}

export function setProfileRetentionInStore(
  retention: ProfileRetention,
): UserProfile {
  if (configuredProfileStorageMode !== "local") {
    return loadUserProfileFromStore();
  }

  const currentRetention = getProfileRetentionFromStore();
  const currentProfile = loadUserProfileFromStore();
  if (currentRetention === retention) {
    return currentProfile;
  }

  localProfileStore.clearProfile();
  sessionProfileStore.clearProfile();
  writeProfileRetentionPreference(retention);

  if (!profileHasValues(currentProfile)) {
    return defaultUserProfile;
  }

  const targetStore =
    retention === "device" ? localProfileStore : sessionProfileStore;
  return targetStore.saveProfile(currentProfile).data ?? defaultUserProfile;
}

export function clearUserProfileFromStore() {
  if (configuredProfileStorageMode !== "local") {
    profileStore.clearProfile();
    return;
  }

  localProfileStore.clearProfile();
  sessionProfileStore.clearProfile();
}
