type MobileFieldFlowControlsProps = {
  current: number;
  total: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  canComplete?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onComplete?: () => void;
  nextLabel?: string;
  completeLabel?: string;
};

export function MobileFieldFlowControls({
  current,
  total,
  canGoPrev,
  canGoNext,
  canComplete = true,
  onPrev,
  onNext,
  onComplete,
  nextLabel = "Volgende veld",
  completeLabel = "Bekijk uitkomst",
}: MobileFieldFlowControlsProps) {
  if (total <= 1) {
    return null;
  }

  const isLastField = current >= total;
  const primaryAction = isLastField && onComplete ? onComplete : onNext;
  const primaryLabel = isLastField && onComplete ? completeLabel : nextLabel;
  const primaryDisabled = isLastField && onComplete ? !canComplete : !canGoNext;

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
          onClick={primaryAction}
          disabled={primaryDisabled}
          className="ring-focus hair inline-flex h-11 flex-1 items-center justify-center rounded-full border bg-[var(--paper)] px-4 text-[14px] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
