import {
  USER_PROFILE_SESSION_STORAGE_KEY,
  USER_PROFILE_STORAGE_EVENT,
  defaultUserProfile,
  profileHasValues,
  sanitizeUserProfile,
} from "@/lib/user-profile";
import { createLocalProfileStore } from "@/lib/storage/local-profile-store";

export const sessionProfileStore = createLocalProfileStore({
  storageKey: USER_PROFILE_SESSION_STORAGE_KEY,
  storageEvent: USER_PROFILE_STORAGE_EVENT,
  storageArea: "sessionStorage",
  defaultProfile: defaultUserProfile,
  sanitizeProfile: sanitizeUserProfile,
  profileHasValues,
});
