import {
  USER_PROFILE_STORAGE_EVENT,
  USER_PROFILE_STORAGE_KEY,
  defaultUserProfile,
  profileHasValues,
  sanitizeUserProfile,
} from "@/lib/user-profile";
import { createLocalProfileStore } from "@/lib/storage/local-profile-store";

export const localProfileStore = createLocalProfileStore({
  storageKey: USER_PROFILE_STORAGE_KEY,
  storageEvent: USER_PROFILE_STORAGE_EVENT,
  defaultProfile: defaultUserProfile,
  sanitizeProfile: sanitizeUserProfile,
  profileHasValues,
});
