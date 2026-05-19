type MobileFieldFlowControlsProps = {
  current: number;
  total: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
};

export function MobileFieldFlowControls({
  current,
  total,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  nextLabel = "Volgende veld",
}: MobileFieldFlowControlsProps) {
  if (total <= 1) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-3 md:hidden">
      <div className="mb-2 text-[12px] text-[var(--muted)]">
        Veld {current} van {total}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="ring-focus hair inline-flex h-11 flex-1 items-center justify-center rounded-full border bg-white px-4 text-[14px] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Vorige
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="ring-focus hair inline-flex h-11 flex-1 items-center justify-center rounded-full border bg-[var(--paper)] px-4 text-[14px] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

