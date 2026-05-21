"use client";

import { useSyncExternalStore } from "react";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import {
  USER_PROFILE_STORAGE_KEY,
  USER_PROFILE_STORAGE_EVENT,
  defaultUserProfile,
  mergeProfilePatch,
  profileHasValues,
  type UserProfile,
} from "@/lib/user-profile";
import {
  clearUserProfileFromStore,
  loadUserProfileFromStore,
  saveUserProfileToStore,
} from "@/lib/storage/profile-store";

function subscribeToUserProfile(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorageChange = (event: Event) => {
    if (event instanceof StorageEvent) {
      if (event.key && event.key !== USER_PROFILE_STORAGE_KEY) {
        return;
      }
    }

    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(USER_PROFILE_STORAGE_EVENT, handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(USER_PROFILE_STORAGE_EVENT, handleStorageChange);
  };
}

export function useUserProfile() {
  const profile = useSyncExternalStore<UserProfile>(
    ENABLE_PROFILE ? subscribeToUserProfile : () => () => undefined,
    ENABLE_PROFILE ? loadUserProfileFromStore : () => defaultUserProfile,
    ENABLE_PROFILE ? loadUserProfileFromStore : () => defaultUserProfile,
  );

  function saveProfile(nextProfile: UserProfile) {
    if (!ENABLE_PROFILE) {
      return nextProfile;
    }
    return saveUserProfileToStore(nextProfile);
  }

  function mergeProfile(nextPatch: Partial<UserProfile>) {
    if (!ENABLE_PROFILE) {
      return defaultUserProfile;
    }
    const mergedProfile = mergeProfilePatch(profile, nextPatch);
    return saveProfile(mergedProfile);
  }

  function clearProfile() {
    if (!ENABLE_PROFILE) {
      return;
    }
    clearUserProfileFromStore();
  }

  return {
    profile,
    isLoaded: true,
    hasProfile: ENABLE_PROFILE ? profileHasValues(profile) : false,
    saveProfile,
    mergeProfile,
    clearProfile,
  };
}
