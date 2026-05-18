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
}

export function AreaChart({ width = 560, height = 220, series }: AreaChartProps) {
  const allPoints = series.flatMap((entry) => entry.points);
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);
  const range = max - min || 1;
  const step = width / (series[0].points.length - 1);
  const xPoints = series[0].points.map((_, index) => index * step);

  function pathFor(points: number[], close: boolean) {
    const yPoints = points.map(
      (point) => height - ((point - min) / range) * (height - 24) - 12,
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      {[0, 1, 2, 3, 4].map((index) => (
        <line
          key={index}
          x1={0}
          x2={width}
          y1={(height / 4) * index + 0.5}
          y2={(height / 4) * index + 0.5}
          stroke="var(--hair)"
          strokeDasharray={index === 4 ? "0" : "2 4"}
        />
      ))}
      {series.map((entry, index) => (
        <g key={index}>
          <path d={pathFor(entry.points, true)} fill={entry.color} opacity={0.12} />
          <path d={pathFor(entry.points, false)} fill="none" stroke={entry.color} strokeWidth={1.75} />
        </g>
      ))}
    </svg>
  );
}
