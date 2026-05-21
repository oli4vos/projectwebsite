import type { ReactNode } from "react";

type ChartLegendItem = {
  label: string;
  color: string;
};

type ChartLegendProps = {
  items: ChartLegendItem[];
  className?: string;
};

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={className ?? "flex flex-wrap items-center gap-4 text-[12px] text-[var(--muted)]"}>
      {items.map((item) => (
        <span key={`${item.label}-${item.color}`} className="flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-3" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

type ChartContainerProps = {
  chart: ReactNode;
  yearTicks?: number[];
  xValues?: number[];
  className?: string;
};

function getTickPositionPercent(tick: number, minX: number, maxX: number) {
  if (!Number.isFinite(tick) || !Number.isFinite(minX) || !Number.isFinite(maxX)) {
    return 0;
  }
  const range = maxX - minX;
  if (range <= 0) {
    return 0;
  }
  const raw = ((tick - minX) / range) * 100;
  return Math.max(0, Math.min(100, raw));
}

export function ChartContainer({ chart, yearTicks, xValues, className }: ChartContainerProps) {
  const resolvedXValues =
    xValues && xValues.length > 1
      ? xValues.filter((value) => Number.isFinite(value))
      : null;
  const minX = resolvedXValues ? Math.min(...resolvedXValues) : 0;
  const maxX = resolvedXValues ? Math.max(...resolvedXValues) : 0;

  return (
    <div className={className ?? "mt-5 overflow-x-auto"}>
      {chart}
      {yearTicks && yearTicks.length > 0 ? (
        resolvedXValues ? (
          <div className="axis relative mt-1 h-5 overflow-hidden">
            {yearTicks.map((tick) => {
              const left = getTickPositionPercent(tick, minX, maxX);
              const isLeftEdge = left <= 1;
              const isRightEdge = left >= 99;
              return (
                <span
                  key={tick}
                  className={`absolute whitespace-nowrap ${
                    isLeftEdge
                      ? "translate-x-0 text-left"
                      : isRightEdge
                        ? "-translate-x-full text-right"
                        : "-translate-x-1/2 text-center"
                  }`}
                  style={{ left: `${left}%` }}
                >
                  jaar {tick}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="axis mt-1 flex items-center justify-between gap-2 overflow-hidden">
            {yearTicks.map((tick) => (
              <span key={tick} className="min-w-0 truncate first:text-left last:text-right">
                jaar {tick}
              </span>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
