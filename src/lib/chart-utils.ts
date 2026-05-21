function toFiniteNumber(value: number | string | undefined | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, "").replace(",", ".");
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function normalizeChartYear(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

export function formatChartYear(value: number | string) {
  const numeric = toFiniteNumber(value);
  if (numeric === null) {
    return "Jaar -";
  }
  return `Jaar ${normalizeChartYear(numeric)}`;
}

export function formatChartEuro(value: number | string | undefined | null) {
  const numeric = toFiniteNumber(value);
  if (numeric === null) {
    return "€ 0";
  }
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function getWholeYearTicks(maxYears: number) {
  const safeYears = normalizeChartYear(maxYears);
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
