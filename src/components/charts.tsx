"use client";

import { useState } from "react";
import { formatChartEuro, formatChartYear, getWholeYearTicks } from "@/lib/chart-utils";

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  negative?: boolean;
  fill?: boolean;
}

export function Sparkline({
  points,
  width = 120,
  height = 36,
  negative = false,
  fill = true,
}: SparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map(
    (point, index) =>
      [index * step, height - ((point - min) / range) * (height - 4) - 2] as const,
  );
  const linePath = coords
    .map(
      (coord, index) =>
        `${index ? "L" : "M"}${coord[0].toFixed(1)} ${coord[1].toFixed(1)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill ? (
        <path
          d={areaPath}
          className="spark-area"
          style={negative ? { fill: "var(--neg)" } : undefined}
        />
      ) : null}
      <path d={linePath} className={negative ? "spark-line-neg" : "spark-line"} />
    </svg>
  );
}

interface AreaSeries {
  color: string;
  points: number[];
}

interface AreaChartProps {
  width?: number;
  height?: number;
  series: AreaSeries[];
  yTicks?: number[];
  xValues?: number[];
  seriesLabels?: string[];
}

function getEuroAxisStep(maxValue: number) {
  if (maxValue <= 2000) {
    return 250;
  }

  if (maxValue <= 10000) {
    return 1000;
  }

  if (maxValue <= 50000) {
    return 5000;
  }

  if (maxValue <= 200000) {
    return 10000;
  }

  return 25000;
}

export function getAdaptiveYearTicks(totalYears: number) {
  return getWholeYearTicks(totalYears);
}

export function getAdaptiveEuroTicks(maxValue: number) {
  const safeMax = Math.max(maxValue, 0);
  const step = getEuroAxisStep(safeMax);
  const roundedMax = Math.ceil(safeMax / step) * step;
  const tickCount = 4;
  const interval = Math.max(Math.round(roundedMax / tickCount / step) * step, step);
  const ticks: number[] = [];

  for (let value = 0; value <= roundedMax; value += interval) {
    ticks.push(value);
  }

  if (ticks[ticks.length - 1] !== roundedMax) {
    ticks.push(roundedMax);
  }

  return ticks;
}

export function AreaChart({
  width = 560,
  height = 220,
  series,
  yTicks,
  xValues,
  seriesLabels,
}: AreaChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const allPoints = series.flatMap((entry) => entry.points);
  const minPoint = Math.min(...allPoints);
  const min = minPoint >= 0 ? 0 : minPoint;
  const max = Math.max(...allPoints);
  const range = max - min || 1;
  const step = width / Math.max(series[0].points.length - 1, 1);
  const xPoints = series[0].points.map((_, index) => index * step);
  const resolvedXValues =
    xValues && xValues.length === series[0].points.length
      ? xValues
      : series[0].points.map((_, index) => index);
  const safeYTicks = yTicks && yTicks.length > 0 ? yTicks : getAdaptiveEuroTicks(max);
  const yGridValues = safeYTicks.filter((value) => value >= min && value <= max);
  const topPadding = 12;
  const bottomPadding = 24;

  function getY(point: number) {
    return (
      height - ((point - min) / range) * (height - bottomPadding) - topPadding
    );
  }

  function pathFor(points: number[], close: boolean) {
    const yPoints = points.map((point) => getY(point));
    let pathData = yPoints
      .map(
        (yPoint, index) =>
          `${index ? "L" : "M"}${xPoints[index].toFixed(1)} ${yPoint.toFixed(1)}`,
      )
      .join(" ");

    if (close) {
      pathData += ` L${width} ${height} L0 ${height} Z`;
    }

    return pathData;
  }

  const activeX = activeIndex === null ? null : xPoints[activeIndex];

  return (
    <div className="relative" onMouseLeave={() => setActiveIndex(null)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        preserveAspectRatio="none"
      >
        {yGridValues.map((value, index) => {
          const y = getY(value) + 0.5;

          return (
            <line
              key={`${value}-${index}`}
              x1={0}
              x2={width}
              y1={y}
              y2={y}
              stroke="var(--hair)"
              strokeDasharray={index === 0 ? "0" : "2 4"}
            />
          );
        })}

        {series.map((entry, index) => (
          <g key={index}>
            <path d={pathFor(entry.points, true)} fill={entry.color} opacity={0.12} />
            <path
              d={pathFor(entry.points, false)}
              fill="none"
              stroke={entry.color}
              strokeWidth={1.75}
            />
            {entry.points.map((point, pointIndex) => {
              const x = xPoints[pointIndex];
              const y = getY(point);
              const isActive = activeIndex === pointIndex;
              return (
                <circle
                  key={`${index}-${pointIndex}`}
                  cx={x}
                  cy={y}
                  r={isActive ? 3.2 : 2.3}
                  fill={entry.color}
                  opacity={isActive ? 1 : 0.75}
                  onMouseEnter={() => setActiveIndex(pointIndex)}
                  onFocus={() => setActiveIndex(pointIndex)}
                />
              );
            })}
          </g>
        ))}

        {xPoints.map((x, index) => (
          <rect
            key={`hit-${index}`}
            x={x - step / 2}
            y={0}
            width={Math.max(step, 8)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setActiveIndex(index)}
            onTouchStart={() => setActiveIndex(index)}
          />
        ))}

        {activeX !== null ? (
          <line
            x1={activeX}
            x2={activeX}
            y1={0}
            y2={height}
            stroke="var(--hair)"
            strokeDasharray="3 4"
          />
        ) : null}
      </svg>

      {activeIndex !== null ? (
        <div className="pointer-events-none absolute left-2 top-2 max-w-[80%] rounded-md border border-[var(--hair)] bg-white/95 px-3 py-2 text-[12px] shadow-paper">
          <div className="font-medium text-[var(--ink)]">
            {formatChartYear(resolvedXValues[activeIndex] ?? activeIndex)}
          </div>
          <div className="mt-1 space-y-1 text-[var(--muted)]">
            {series.map((entry, index) => (
              <div key={`tip-${index}`} className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: entry.color }}
                />
                <span>
                  {(seriesLabels?.[index] ?? `Reeks ${index + 1}`)}:{" "}
                  {formatChartEuro(entry.points[activeIndex] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
