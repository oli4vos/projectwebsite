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
    .map((coord, index) => `${index ? "L" : "M"}${coord[0].toFixed(1)} ${coord[1].toFixed(1)}`)
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
  const safeYears = Math.max(Math.round(totalYears), 0);

  if (safeYears <= 6) {
    return Array.from({ length: safeYears + 1 }, (_, index) => index);
  }

  const step = safeYears <= 15 ? 2 : safeYears <= 30 ? 5 : 10;
  const ticks: number[] = [0];

  for (let year = step; year < safeYears; year += step) {
    ticks.push(year);
  }

  if (ticks[ticks.length - 1] !== safeYears) {
    ticks.push(safeYears);
  }

  return ticks;
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
}: AreaChartProps) {
  const allPoints = series.flatMap((entry) => entry.points);
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);
  const range = max - min || 1;
  const step = width / (series[0].points.length - 1);
  const xPoints = series[0].points.map((_, index) => index * step);
  const safeYTicks = yTicks && yTicks.length > 0 ? yTicks : getAdaptiveEuroTicks(max);
  const yGridValues = safeYTicks.filter((value) => value >= min && value <= max);
  const topPadding = 12;
  const bottomPadding = 24;

  function pathFor(points: number[], close: boolean) {
    const yPoints = points.map(
      (point) =>
        height -
        ((point - min) / range) * (height - bottomPadding) -
        topPadding,
    );
    let pathData = yPoints
      .map((yPoint, index) => `${index ? "L" : "M"}${xPoints[index].toFixed(1)} ${yPoint.toFixed(1)}`)
      .join(" ");

    if (close) {
      pathData += ` L${width} ${height} L0 ${height} Z`;
    }

    return pathData;
  }

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
      preserveAspectRatio="none"
    >
      {yGridValues.map((value, index) => {
        const y =
          height -
          ((value - min) / range) * (height - bottomPadding) -
          topPadding +
          0.5;

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
          <path d={pathFor(entry.points, false)} fill="none" stroke={entry.color} strokeWidth={1.75} />
        </g>
      ))}
    </svg>
  );
}
