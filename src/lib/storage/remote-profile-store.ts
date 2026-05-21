import type { ProfileStore } from "@/lib/storage/profile-store.types";
import type { ProfileStorageMode } from "@/lib/storage/storage-mode";

type RemoteProfileStoreOptions = {
  mode: Exclude<ProfileStorageMode, "local">;
  localStore: ProfileStore;
};

export function createRemoteProfileStoreStub({
  mode,
  localStore,
}: RemoteProfileStoreOptions): ProfileStore {
  // Stub: remote/hybrid storage is intentionally not implemented yet.
  // To preserve current production behavior, we safely delegate to local storage.
  // A future database-backed implementation will likely require an async store API.
  const fallbackMessage =
    mode === "hybrid"
      ? "Hybrid profile storage is not implemented yet; local storage fallback is active."
      : "Remote profile storage is not implemented yet; local storage fallback is active.";

  return {
    loadProfile() {
      const result = localStore.loadProfile();
      return result.error
        ? result
        : { ...result, error: result.error ?? fallbackMessage };
    },
    saveProfile(profile) {
      const result = localStore.saveProfile(profile);
      return result.error
        ? result
        : { ...result, error: result.error ?? fallbackMessage };
    },
    clearProfile() {
      const result = localStore.clearProfile();
      return result.error
        ? result
        : { ...result, error: result.error ?? fallbackMessage };
    },
  };
}
