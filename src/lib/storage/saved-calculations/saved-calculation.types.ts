export type SavedCalculationId = string;

export type SavedCalculation = {
  id: SavedCalculationId;
  toolSlug: string;
  title: string;
  input: unknown;
  result?: unknown;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type CreateSavedCalculationInput = {
  toolSlug: string;
  title?: string;
  input: unknown;
  result?: unknown;
};

export type UpdateSavedCalculationInput = {
  id: SavedCalculationId;
  title?: string;
  input?: unknown;
  result?: unknown;
};

export type SavedCalculationStoreResult<T> = {
  data: T;
  error?: string;
};

export type SavedCalculationStore = {
  listCalculations(): SavedCalculationStoreResult<SavedCalculation[]>;
  getCalculation(
    id: SavedCalculationId,
  ): SavedCalculationStoreResult<SavedCalculation | null>;
  saveCalculation(
    input: CreateSavedCalculationInput,
  ): SavedCalculationStoreResult<SavedCalculation>;
  updateCalculation(
    input: UpdateSavedCalculationInput,
  ): SavedCalculationStoreResult<SavedCalculation | null>;
  deleteCalculation(id: SavedCalculationId): SavedCalculationStoreResult<boolean>;
  clearCalculations(): SavedCalculationStoreResult<null>;
};

export type SavedCalculationStoreAsync = {
  listCalculations(): Promise<SavedCalculationStoreResult<SavedCalculation[]>>;
  getCalculation(
    id: SavedCalculationId,
  ): Promise<SavedCalculationStoreResult<SavedCalculation | null>>;
  saveCalculation(
    input: CreateSavedCalculationInput,
  ): Promise<SavedCalculationStoreResult<SavedCalculation>>;
  updateCalculation(
    input: UpdateSavedCalculationInput,
  ): Promise<SavedCalculationStoreResult<SavedCalculation | null>>;
  deleteCalculation(
    id: SavedCalculationId,
  ): Promise<SavedCalculationStoreResult<boolean>>;
  clearCalculations(): Promise<SavedCalculationStoreResult<null>>;
};
