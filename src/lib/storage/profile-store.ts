import {
  USER_PROFILE_STORAGE_EVENT,
  USER_PROFILE_STORAGE_KEY,
  defaultUserProfile,
  profileHasValues,
  sanitizeUserProfile,
  type UserProfile,
} from "@/lib/user-profile";
import { createLocalProfileStore } from "@/lib/storage/local-profile-store";
import { createRemoteProfileStoreStub } from "@/lib/storage/remote-profile-store";
import {
  getConfiguredProfileStorageMode,
  type ProfileStorageMode,
} from "@/lib/storage/storage-mode";

const localProfileStore = createLocalProfileStore({
  storageKey: USER_PROFILE_STORAGE_KEY,
  storageEvent: USER_PROFILE_STORAGE_EVENT,
  defaultProfile: defaultUserProfile,
  sanitizeProfile: sanitizeUserProfile,
  profileHasValues,
});

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

export function loadUserProfileFromStore(): UserProfile {
  return profileStore.loadProfile().data ?? defaultUserProfile;
}

export function saveUserProfileToStore(profile: UserProfile): UserProfile {
  return profileStore.saveProfile(profile).data ?? defaultUserProfile;
}

export function clearUserProfileFromStore() {
  profileStore.clearProfile();
}
