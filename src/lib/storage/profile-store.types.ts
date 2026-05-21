import type { UserProfile } from "@/lib/user-profile";

export type ProfileStoreResult<T> = {
  data: T | null;
  error?: string;
};

export type ProfileStore = {
  loadProfile(): ProfileStoreResult<UserProfile>;
  saveProfile(profile: UserProfile): ProfileStoreResult<UserProfile>;
  clearProfile(): ProfileStoreResult<null>;
};
