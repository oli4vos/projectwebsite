export type MarketRow = {
  label: string;
  value: string;
  delta: string;
  negative: boolean;
  points: number[];
};

const FALLBACK: MarketRow[] = [
  { label: "DUO-rente 2026", value: "2,56%", delta: "stabiel", negative: false, points: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
  { label: "Hypotheek 10 jaar", value: "3,89%", delta: "+0,02", negative: false, points: [4, 4, 4, 5, 4, 5, 6, 6, 5, 5] },
  { label: "AEX", value: "942,17", delta: "+1,24%", negative: false, points: [3, 4, 3, 5, 4, 5, 6, 5, 7, 8] },
  { label: "Spaarrente top-3", value: "1,80%", delta: "-0,05", negative: true, points: [7, 7, 6, 6, 5, 5, 4, 4, 3, 3] },
];

// DUO rate is set once per year on January 1st — update this constant annually.
const DUO_RENTE = FALLBACK[0];

function normalizePoints(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 5);
  return values.map((v) => Math.round(((v - min) / range) * 9) + 1);
}

function fmtDelta(change: number, percent = false): { delta: string; negative: boolean } {
  const negative = change < 0;
  const sign = negative ? "" : "+";
  const delta = percent
    ? `${sign}${change.toFixed(2)}%`
    : `${sign}${change.toFixed(2)}`;
  return { delta, negative };
}

async function fetchAex(): Promise<MarketRow> {
  const res = await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/%5EAEX?interval=1d&range=1mo",
    {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );
  if (!res.ok) return FALLBACK[2];

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) return FALLBACK[2];

  const price: number = result.meta.regularMarketPrice;
  const prevClose: number = result.meta.chartPreviousClose;
  const rawCloses: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const closes = rawCloses.filter((v): v is number => v !== null).slice(-10);

  const changePct = ((price - prevClose) / prevClose) * 100;
  const { delta, negative } = fmtDelta(changePct, true);

  return {
    label: "AEX",
    value: price.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    delta,
    negative,
    points: closes.length >= 2 ? normalizePoints(closes) : FALLBACK[2].points,
  };
}

function parseEcbValues(json: unknown): number[] | null {
  try {
    const j = json as Record<string, unknown>;
    const series = (j.dataSets as Record<string, unknown>[])[0].series as Record<string, unknown>;
    const firstSeries = Object.values(series)[0] as Record<string, unknown>;
    const obs = firstSeries.observations as Record<string, number[]>;
    const values = Object.values(obs)
      .map((v) => v[0])
      .filter((v): v is number => typeof v === "number" && !isNaN(v));
    return values.slice(-10);
  } catch {
    return null;
  }
}

async function fetchEcbRate(
  seriesKey: string,
  fallback: MarketRow,
  label: string
): Promise<MarketRow> {
  const url = `https://data-api.ecb.europa.eu/service/data/MIR/${seriesKey}?format=jsondata&lastNObservations=10`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return fallback;

  const json = await res.json();
  const values = parseEcbValues(json);
  if (!values || values.length < 2) return fallback;

  const current = values[values.length - 1];
  const previous = values[values.length - 2];
  const change = current - previous;
  const { delta, negative } = fmtDelta(change);

  return {
    label,
    value:
      current.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%",
    delta: Math.abs(change) < 0.005 ? "stabiel" : delta,
    negative,
    points: normalizePoints(values),
  };
}

export async function fetchMarketData(): Promise<MarketRow[]> {
  const [mortgageResult, aexResult, savingsResult] = await Promise.allSettled([
    fetchEcbRate("M.NL.B.A2C.AL.R.A.2250.EUR.N", FALLBACK[1], "Hypotheek 10 jaar"),
    fetchAex(),
    fetchEcbRate("M.NL.B.L22.SC.R.A.2240.EUR.N", FALLBACK[3], "Spaarrente top-3"),
  ]);

  return [
    DUO_RENTE,
    mortgageResult.status === "fulfilled" ? mortgageResult.value : FALLBACK[1],
    aexResult.status === "fulfilled" ? aexResult.value : FALLBACK[2],
    savingsResult.status === "fulfilled" ? savingsResult.value : FALLBACK[3],
  ];
}
