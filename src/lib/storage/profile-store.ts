import {
  defaultUserProfile,
  type UserProfile,
} from "@/lib/user-profile";
import { localProfileStore } from "@/lib/storage/local-profile-store-instance";
import { createRemoteProfileStoreStub } from "@/lib/storage/remote-profile-store";
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

export function loadUserProfileFromStore(): UserProfile {
  return profileStore.loadProfile().data ?? defaultUserProfile;
}

export function saveUserProfileToStore(profile: UserProfile): UserProfile {
  return profileStore.saveProfile(profile).data ?? defaultUserProfile;
}

export function clearUserProfileFromStore() {
  profileStore.clearProfile();
}
