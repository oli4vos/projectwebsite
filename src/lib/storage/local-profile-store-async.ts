import type { UserProfile } from "@/lib/user-profile";
import { localProfileStore } from "@/lib/storage/local-profile-store-instance";
import type { ProfileStoreAsync } from "@/lib/storage/profile-store.types";

export const localProfileStoreAsync: ProfileStoreAsync = {
  async loadProfile() {
    return localProfileStore.loadProfile();
  },
  async saveProfile(profile: UserProfile) {
    return localProfileStore.saveProfile(profile);
  },
  async clearProfile() {
    return localProfileStore.clearProfile();
  },
};
