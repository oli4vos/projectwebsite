import type { ProfileStorageMode } from "@/lib/storage/storage-mode";
import type { SavedCalculationStore } from "@/lib/storage/saved-calculations/saved-calculation.types";

type CreateRemoteSavedCalculationStoreStubOptions = {
  mode: ProfileStorageMode;
  localStore: SavedCalculationStore;
};

/**
 * Future placeholder for a remote saved-calculation store.
 * For now, hybrid/remote modes safely fall back to the local store.
 */
export function createRemoteSavedCalculationStoreStub(
  options: CreateRemoteSavedCalculationStoreStubOptions,
): SavedCalculationStore {
  const { localStore } = options;
  return localStore;
}

