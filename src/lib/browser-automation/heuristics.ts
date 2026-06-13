export function normalizeComparisonText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreKeywordHit(haystack: string, keywords: string[]) {
  const normalizedHaystack = normalizeComparisonText(haystack);
  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeComparisonText(keyword);
    return normalizedHaystack.includes(normalizedKeyword) ? score + 1 : score;
  }, 0);
}

export function parseDutchCurrency(value: string) {
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function findCurrencyValues(text: string) {
  const matches = text.match(/€\s?[\d.]+(?:,\d{2})?/g) ?? [];
  return matches
    .map((match) => parseDutchCurrency(match))
    .filter((value): value is number => value !== null);
}

export function summarizeDelta(reference: number, actual: number) {
  const difference = actual - reference;
  const percent = reference === 0 ? null : (difference / reference) * 100;

  return {
    difference,
    percent,
  };
}
