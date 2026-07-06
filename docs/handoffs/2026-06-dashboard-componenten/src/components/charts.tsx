// SVG-charts zonder externe deps. Voor echt gebruik: vervang door bv. recharts
// of een eigen wrapper. De vorm + axes blijven gelijk.

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  negative?: boolean;
  fill?: boolean;
}
export function Sparkline({ points, width = 120, height = 36, negative = false, fill = true }: SparklineProps) {
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step  = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - ((p - min) / range) * (height - 4) - 2] as const);
  const d = coords.map((c, i) => `${i ? "L" : "M"}${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(" ");
  const area = `${d} L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <path
          d={area}
          className="spark-area"
          style={negative ? { fill: "var(--neg)" } : undefined}
        />
      )}
      <path d={d} className={negative ? "spark-line-neg" : "spark-line"} />
    </svg>
  );
}

interface Series { name?: string; color: string; points: number[] }
interface AreaChartProps {
  width?: number;
  height?: number;
  series: Series[];
}
export function AreaChart({ width = 560, height = 220, series }: AreaChartProps) {
  const all = series.flatMap(s => s.points);
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const step = width / (series[0].points.length - 1);
  const xs = series[0].points.map((_, i) => i * step);

  function pathFor(points: number[], close: boolean) {
    const ys = points.map(p => height - ((p - min) / range) * (height - 24) - 12);
    let d = ys.map((y, i) => `${i ? "L" : "M"}${xs[i].toFixed(1)} ${y.toFixed(1)}`).join(" ");
    if (close) d += ` L${width} ${height} L0 ${height} Z`;
    return d;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      {/* gridlines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i}
          x1={0} x2={width}
          y1={(height / 4) * i + 0.5} y2={(height / 4) * i + 0.5}
          stroke="var(--hair)"
          strokeDasharray={i === 4 ? "0" : "2 4"}
        />
      ))}
      {series.map((s, i) => (
        <g key={i}>
          <path d={pathFor(s.points, true)}  fill={s.color} opacity={0.12} />
          <path d={pathFor(s.points, false)} fill="none"   stroke={s.color} strokeWidth={1.75} />
        </g>
      ))}
    </svg>
  );
}
