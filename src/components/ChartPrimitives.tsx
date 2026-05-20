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
  className?: string;
};

export function ChartContainer({ chart, yearTicks, className }: ChartContainerProps) {
  return (
    <div className={className ?? "mt-5 overflow-x-auto"}>
      {chart}
      {yearTicks && yearTicks.length > 0 ? (
        <div className="axis mt-1 flex items-center justify-between gap-2 overflow-hidden">
          {yearTicks.map((tick) => (
            <span key={tick} className="min-w-0 truncate first:text-left last:text-right">
              jaar {tick}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
