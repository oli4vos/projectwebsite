"use client";

import { useSyncExternalStore } from "react";
import {
  USER_PREFERENCES_STORAGE_EVENT,
  USER_PREFERENCES_STORAGE_KEY,
  loadUserPreferences,
  saveUserPreferences,
  type KnowledgeLevel,
} from "@/lib/user-preferences";

function subscribeToUserPreferences(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorageChange = (event: Event) => {
    if (event instanceof StorageEvent) {
      if (event.key && event.key !== USER_PREFERENCES_STORAGE_KEY) {
        return;
      }
    }
    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(USER_PREFERENCES_STORAGE_EVENT, handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(USER_PREFERENCES_STORAGE_EVENT, handleStorageChange);
  };
}

export function useUserPreferences() {
  const preferences = useSyncExternalStore(
    subscribeToUserPreferences,
    loadUserPreferences,
    loadUserPreferences,
  );

  function setKnowledgeLevel(knowledgeLevel: KnowledgeLevel) {
    return saveUserPreferences({ ...preferences, knowledgeLevel });
  }

  return {
    preferences,
    knowledgeLevel: preferences.knowledgeLevel,
    setKnowledgeLevel,
  };
}
