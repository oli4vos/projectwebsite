import {
  localSavedCalculationStore,
} from "@/lib/storage/saved-calculations/local-saved-calculation-store";
import { createRemoteSavedCalculationStoreStub } from "@/lib/storage/saved-calculations/remote-saved-calculation-store";
import type {
  CreateSavedCalculationInput,
  SavedCalculationId,
  SavedCalculationStore,
  SavedCalculationStoreResult,
  SavedCalculation,
  UpdateSavedCalculationInput,
} from "@/lib/storage/saved-calculations/saved-calculation.types";
import {
  getConfiguredProfileStorageMode,
  type ProfileStorageMode,
} from "@/lib/storage/storage-mode";

function resolveSavedCalculationStore(mode: ProfileStorageMode): SavedCalculationStore {
  if (mode === "local") {
    return localSavedCalculationStore;
  }

  return createRemoteSavedCalculationStoreStub({
    mode,
    localStore: localSavedCalculationStore,
  });
}

export function getSavedCalculationStore(): SavedCalculationStore {
  return resolveSavedCalculationStore(getConfiguredProfileStorageMode());
}

export function listSavedCalculations(): SavedCalculationStoreResult<
  SavedCalculation[]
> {
  return getSavedCalculationStore().listCalculations();
}

export function getSavedCalculation(
  id: SavedCalculationId,
): SavedCalculationStoreResult<SavedCalculation | null> {
  return getSavedCalculationStore().getCalculation(id);
}

export function saveSavedCalculation(
  input: CreateSavedCalculationInput,
): SavedCalculationStoreResult<SavedCalculation> {
  return getSavedCalculationStore().saveCalculation(input);
}

export function updateSavedCalculation(
  input: UpdateSavedCalculationInput,
): SavedCalculationStoreResult<SavedCalculation | null> {
  return getSavedCalculationStore().updateCalculation(input);
}

export function deleteSavedCalculation(
  id: SavedCalculationId,
): SavedCalculationStoreResult<boolean> {
  return getSavedCalculationStore().deleteCalculation(id);
}

export function clearSavedCalculations(): SavedCalculationStoreResult<null> {
  return getSavedCalculationStore().clearCalculations();
}

