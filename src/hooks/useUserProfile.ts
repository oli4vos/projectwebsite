"use client";

import { useSyncExternalStore } from "react";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import {
  USER_PROFILE_SESSION_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
  USER_PROFILE_STORAGE_EVENT,
  defaultUserProfile,
  mergeProfilePatch,
  profileHasValues,
  type UserProfile,
} from "@/lib/user-profile";
import {
  clearUserProfileFromStore,
  getProfileRetentionFromStore,
  loadUserProfileFromStore,
  saveUserProfileToStore,
  setProfileRetentionInStore,
} from "@/lib/storage/profile-store";
import {
  PROFILE_RETENTION_EVENT,
  PROFILE_RETENTION_STORAGE_KEY,
  type ProfileRetention,
} from "@/lib/storage/profile-retention";

let cachedProfile = defaultUserProfile;
let cachedProfileValue = JSON.stringify(defaultUserProfile);

function getUserProfileSnapshot() {
  const nextProfile = loadUserProfileFromStore();
  const nextProfileValue = JSON.stringify(nextProfile);

  if (nextProfileValue !== cachedProfileValue) {
    cachedProfile = nextProfile;
    cachedProfileValue = nextProfileValue;
  }

  return cachedProfile;
}

function subscribeToUserProfile(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorageChange = (event: Event) => {
    if (event instanceof StorageEvent) {
      if (
        event.key &&
        ![
          USER_PROFILE_STORAGE_KEY,
          USER_PROFILE_SESSION_STORAGE_KEY,
          PROFILE_RETENTION_STORAGE_KEY,
        ].includes(event.key)
      ) {
        return;
      }
    }

    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(USER_PROFILE_STORAGE_EVENT, handleStorageChange);
  window.addEventListener(PROFILE_RETENTION_EVENT, handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(USER_PROFILE_STORAGE_EVENT, handleStorageChange);
    window.removeEventListener(PROFILE_RETENTION_EVENT, handleStorageChange);
  };
}

export function useUserProfile() {
  const profile = useSyncExternalStore<UserProfile>(
    ENABLE_PROFILE ? subscribeToUserProfile : () => () => undefined,
    ENABLE_PROFILE ? getUserProfileSnapshot : () => defaultUserProfile,
    () => defaultUserProfile,
  );
  const retention = useSyncExternalStore<ProfileRetention>(
    ENABLE_PROFILE ? subscribeToUserProfile : () => () => undefined,
    ENABLE_PROFILE ? getProfileRetentionFromStore : () => "session",
    () => "session",
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

  function setRetention(nextRetention: ProfileRetention) {
    if (!ENABLE_PROFILE) {
      return defaultUserProfile;
    }

    return setProfileRetentionInStore(nextRetention);
  }

  return {
    profile,
    isLoaded: true,
    hasProfile: ENABLE_PROFILE ? profileHasValues(profile) : false,
    retention,
    saveProfile,
    mergeProfile,
    clearProfile,
    setRetention,
  };
}
