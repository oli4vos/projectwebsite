"use client";

import { useState } from "react";
import {
  clearSavedCalculations,
  deleteSavedCalculation,
  getSavedCalculation,
  listSavedCalculations,
  saveSavedCalculation,
  updateSavedCalculation,
} from "@/lib/storage/saved-calculations/saved-calculation-store";
import type {
  CreateSavedCalculationInput,
  SavedCalculation,
  SavedCalculationId,
  SavedCalculationStoreResult,
  UpdateSavedCalculationInput,
} from "@/lib/storage/saved-calculations/saved-calculation.types";

type SavedCalculationsHookResult = {
  calculations: SavedCalculation[];
  hasCalculations: boolean;
  isLoaded: boolean;
  lastError: string | null;
  refresh: () => SavedCalculation[];
  getCalculation: (id: SavedCalculationId) => SavedCalculation | null;
  saveCalculation: (
    input: CreateSavedCalculationInput,
  ) => SavedCalculationStoreResult<SavedCalculation>;
  updateCalculation: (
    input: UpdateSavedCalculationInput,
  ) => SavedCalculationStoreResult<SavedCalculation | null>;
  deleteCalculation: (
    id: SavedCalculationId,
  ) => SavedCalculationStoreResult<boolean>;
  clearCalculations: () => SavedCalculationStoreResult<null>;
};

export function useSavedCalculations(): SavedCalculationsHookResult {
  const initialList = listSavedCalculations();
  const [calculations, setCalculations] = useState<SavedCalculation[]>(
    initialList.data,
  );
  const [lastError, setLastError] = useState<string | null>(
    initialList.error ?? null,
  );

  function applyListState() {
    const result = listSavedCalculations();
    setCalculations(result.data);
    setLastError(result.error ?? null);
    return result.data;
  }

  function refresh() {
    return applyListState();
  }

  function getCalculationById(id: SavedCalculationId) {
    const result = getSavedCalculation(id);
    setLastError(result.error ?? null);
    return result.data;
  }

  function saveCalculationFromInput(input: CreateSavedCalculationInput) {
    const result = saveSavedCalculation(input);
    setLastError(result.error ?? null);
    applyListState();
    return result;
  }

  function updateCalculationFromInput(input: UpdateSavedCalculationInput) {
    const result = updateSavedCalculation(input);
    setLastError(result.error ?? null);
    applyListState();
    return result;
  }

  function deleteCalculationById(id: SavedCalculationId) {
    const result = deleteSavedCalculation(id);
    setLastError(result.error ?? null);
    applyListState();
    return result;
  }

  function clearCalculationList() {
    const result = clearSavedCalculations();
    setLastError(result.error ?? null);
    applyListState();
    return result;
  }

  return {
    calculations,
    hasCalculations: calculations.length > 0,
    isLoaded: true,
    lastError,
    refresh,
    getCalculation: getCalculationById,
    saveCalculation: saveCalculationFromInput,
    updateCalculation: updateCalculationFromInput,
    deleteCalculation: deleteCalculationById,
    clearCalculations: clearCalculationList,
  };
}
