"use client";

import { useSyncExternalStore } from "react";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import {
  USER_PROFILE_STORAGE_KEY,
  USER_PROFILE_STORAGE_EVENT,
  clearUserProfile,
  defaultUserProfile,
  loadUserProfile,
  mergeProfilePatch,
  profileHasValues,
  saveUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

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
  if (!ENABLE_PROFILE) {
    return {
      profile: defaultUserProfile,
      isLoaded: true,
      hasProfile: false,
      saveProfile: (nextProfile: UserProfile) => nextProfile,
      mergeProfile: () => defaultUserProfile,
      clearProfile: () => undefined,
    };
  }

  const profile = useSyncExternalStore<UserProfile>(
    subscribeToUserProfile,
    loadUserProfile,
    loadUserProfile,
  );

  function saveProfile(nextProfile: UserProfile) {
    return saveUserProfile(nextProfile);
  }

  function mergeProfile(nextPatch: Partial<UserProfile>) {
    const mergedProfile = mergeProfilePatch(profile, nextPatch);
    return saveProfile(mergedProfile);
  }

  function clearProfile() {
    clearUserProfile();
  }

  return {
    profile,
    isLoaded: true,
    hasProfile: profileHasValues(profile),
    saveProfile,
    mergeProfile,
    clearProfile,
  };
}
