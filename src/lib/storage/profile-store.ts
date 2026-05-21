import {
  USER_PROFILE_STORAGE_EVENT,
  USER_PROFILE_STORAGE_KEY,
  defaultUserProfile,
  profileHasValues,
  sanitizeUserProfile,
  type UserProfile,
} from "@/lib/user-profile";
import { createLocalProfileStore } from "@/lib/storage/local-profile-store";

export const profileStore = createLocalProfileStore({
  storageKey: USER_PROFILE_STORAGE_KEY,
  storageEvent: USER_PROFILE_STORAGE_EVENT,
  defaultProfile: defaultUserProfile,
  sanitizeProfile: sanitizeUserProfile,
  profileHasValues,
});

export function loadUserProfileFromStore(): UserProfile {
  return profileStore.loadProfile().data ?? defaultUserProfile;
}

export function saveUserProfileToStore(profile: UserProfile): UserProfile {
  return profileStore.saveProfile(profile).data ?? defaultUserProfile;
}

export function clearUserProfileFromStore() {
  profileStore.clearProfile();
}
