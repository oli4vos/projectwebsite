import type { UserProfile } from "@/lib/user-profile";
import type { ProfileStoreAsync } from "@/lib/storage/profile-store.types";
import type { ProfileStorageMode } from "@/lib/storage/storage-mode";

type RemoteProfileStoreAsyncOptions = {
  mode: Exclude<ProfileStorageMode, "local">;
  localStoreAsync: ProfileStoreAsync;
};

export function createRemoteProfileStoreAsyncStub({
  mode,
  localStoreAsync,
}: RemoteProfileStoreAsyncOptions): ProfileStoreAsync {
  // Stub only: this keeps behavior local-first until a real remote database is added.
  // Future remote implementation will likely use network calls and auth and remain async.
  const fallbackMessage =
    mode === "hybrid"
      ? "Hybrid async profile storage is not implemented yet; local fallback is active."
      : "Remote async profile storage is not implemented yet; local fallback is active.";

  return {
    async loadProfile() {
      const result = await localStoreAsync.loadProfile();
      return result.error
        ? result
        : { ...result, error: result.error ?? fallbackMessage };
    },
    async saveProfile(profile: UserProfile) {
      const result = await localStoreAsync.saveProfile(profile);
      return result.error
        ? result
        : { ...result, error: result.error ?? fallbackMessage };
    },
    async clearProfile() {
      const result = await localStoreAsync.clearProfile();
      return result.error
        ? result
        : { ...result, error: result.error ?? fallbackMessage };
    },
  };
}
