import type { AssumptionMeta, RepaymentRuleKey } from "@/lib/financial-constants/types";
import { DEFAULT_FINANCIAL_YEAR } from "@/lib/financial-constants/years";

export const DUO_RATE_HISTORY_META: AssumptionMeta = {
  sourceLabel: "DUO rente voor terugbetalers",
  lastChecked: "2026-07-13",
  status: "definitief",
  sourceUrl: "https://www.duo.nl/particulier/rente/rente-voor-terugbetalers.jsp",
  sourceTier: "overheidsuitleg",
  notes:
    "DUO publiceert jaarlijks nieuwe rentepercentages. Voor terugbetalers blijft een gekozen rente daarna vijf jaar vaststaan. Deze tabel bevat de laatste vijf rentejaren voor SF35, SF15, SF15-oud en levenlanglerenkrediet.",
};

type DuoRateHistoryEntry = Record<RepaymentRuleKey, number>;

const UNKNOWN_RULE_FALLBACK: RepaymentRuleKey = "UNKNOWN";

export const DUO_RATE_HISTORY_BY_YEAR: Record<number, DuoRateHistoryEntry> = {
  2022: {
    SF35: 0,
    SF15: 0,
    SF15_OLD: 0,
    SF15_LLLK: 0,
    UNKNOWN: 0,
  },
  2023: {
    SF35: 0.46,
    SF15: 1.78,
    SF15_OLD: 1.78,
    SF15_LLLK: 0.46,
    UNKNOWN: 0.46,
  },
  2024: {
    SF35: 2.56,
    SF15: 2.95,
    SF15_OLD: 2.95,
    SF15_LLLK: 2.56,
    UNKNOWN: 2.56,
  },
  2025: {
    SF35: 2.57,
    SF15: 2.21,
    SF15_OLD: 2.21,
    SF15_LLLK: 2.57,
    UNKNOWN: 2.57,
  },
  2026: {
    SF35: 2.33,
    SF15: 2.29,
    SF15_OLD: 2.29,
    SF15_LLLK: 2.33,
    UNKNOWN: 2.33,
  },
};

function sanitizeRateYear(year?: number) {
  if (year === undefined || year === null || !Number.isFinite(year)) {
    return DEFAULT_FINANCIAL_YEAR;
  }

  return Math.round(year);
}

function sanitizeRate(rate?: number) {
  if (rate === undefined || rate === null || !Number.isFinite(rate)) {
    return undefined;
  }

  return Math.round(rate * 100) / 100;
}

export function getAvailableDuoRateYears(limit = 5) {
  return Object.keys(DUO_RATE_HISTORY_BY_YEAR)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => right - left)
    .slice(0, Math.max(Math.round(limit), 0));
}

export function isSupportedDuoRateYear(year?: number) {
  const safeYear = sanitizeRateYear(year);
  return safeYear in DUO_RATE_HISTORY_BY_YEAR;
}

export function getDuoHistoricalRateForRule(rule: RepaymentRuleKey, year?: number) {
  const safeYear = sanitizeRateYear(year);
  const fallbackYear = getAvailableDuoRateYears(1)[0] ?? DEFAULT_FINANCIAL_YEAR;
  const entry =
    DUO_RATE_HISTORY_BY_YEAR[safeYear] ??
    DUO_RATE_HISTORY_BY_YEAR[fallbackYear];

  return entry[rule] ?? entry[UNKNOWN_RULE_FALLBACK];
}

export function getDuoHistoricalRateYearForRule(
  rule: RepaymentRuleKey,
  rate?: number,
) {
  const safeRate = sanitizeRate(rate);

  if (safeRate === undefined) {
    return undefined;
  }

  return getAvailableDuoRateYears().find((year) => {
    const historicalRate = getDuoHistoricalRateForRule(rule, year);
    return sanitizeRate(historicalRate) === safeRate;
  });
}
