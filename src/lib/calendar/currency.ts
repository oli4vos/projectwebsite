export type SupportedCurrency =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "JPY"
  | "CAD"
  | "AUD";

export type FeeCurrencyMode = "source" | "target";

export type CurrencyConversionInput = {
  amount: number;
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  rateOverride?: number;
  feePercent?: number;
  fixedFee?: number;
  feeCurrencyMode?: FeeCurrencyMode;
};

export type CurrencyConversionResult = {
  amount: number;
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  exchangeRate: number;
  grossConvertedAmount: number;
  percentFeeAmountTarget: number;
  fixedFeeAmountTarget: number;
  totalFeeAmountTarget: number;
  netConvertedAmount: number;
  effectiveRate: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
};

const DECIMALS_BY_CURRENCY: Record<SupportedCurrency, number> = {
  EUR: 2,
  USD: 2,
  GBP: 2,
  CHF: 2,
  SEK: 2,
  NOK: 2,
  DKK: 2,
  JPY: 0,
  CAD: 2,
  AUD: 2,
};

const REFERENCE_RATE_TO_EUR: Record<SupportedCurrency, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.85,
  CHF: 0.97,
  SEK: 11.4,
  NOK: 11.5,
  DKK: 7.46,
  JPY: 169.5,
  CAD: 1.48,
  AUD: 1.64,
};

function sanitizeNumber(value: number | undefined, fallback = 0) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return value as number;
}

function roundToDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getSupportedCurrencies(): SupportedCurrency[] {
  return Object.keys(REFERENCE_RATE_TO_EUR) as SupportedCurrency[];
}

export function calculateExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  const fromRate = REFERENCE_RATE_TO_EUR[fromCurrency];
  const toRate = REFERENCE_RATE_TO_EUR[toCurrency];
  return toRate / fromRate;
}

export function convertCurrency(
  input: CurrencyConversionInput,
): CurrencyConversionResult {
  const amount = Math.max(sanitizeNumber(input.amount, 0), 0);
  const feePercent = Math.min(Math.max(sanitizeNumber(input.feePercent, 0), 0), 100);
  const fixedFee = Math.max(sanitizeNumber(input.fixedFee, 0), 0);
  const feeCurrencyMode = input.feeCurrencyMode ?? "target";
  const exchangeRate =
    input.rateOverride && input.rateOverride > 0
      ? input.rateOverride
      : calculateExchangeRate(input.fromCurrency, input.toCurrency);
  const targetDecimals = DECIMALS_BY_CURRENCY[input.toCurrency];

  const grossConvertedAmount = amount * exchangeRate;
  let percentFeeAmountTarget = 0;
  let fixedFeeAmountTarget = 0;
  let netConvertedAmount = grossConvertedAmount;

  if (feeCurrencyMode === "target") {
    percentFeeAmountTarget = (grossConvertedAmount * feePercent) / 100;
    fixedFeeAmountTarget = fixedFee;
    const netBeforeClamp =
      grossConvertedAmount - percentFeeAmountTarget - fixedFeeAmountTarget;
    netConvertedAmount = Math.max(netBeforeClamp, 0);
  } else {
    const feeInSource = (amount * feePercent) / 100 + fixedFee;
    const netSourceAmount = Math.max(amount - feeInSource, 0);
    netConvertedAmount = netSourceAmount * exchangeRate;
    percentFeeAmountTarget = grossConvertedAmount - netConvertedAmount - fixedFee * exchangeRate;
    fixedFeeAmountTarget = fixedFee * exchangeRate;
    if (percentFeeAmountTarget < 0) {
      percentFeeAmountTarget = 0;
    }
  }

  const totalFeeAmountTarget = Math.max(
    grossConvertedAmount - netConvertedAmount,
    0,
  );
  const roundedGross = roundToDecimals(grossConvertedAmount, targetDecimals);
  const roundedNet = roundToDecimals(netConvertedAmount, targetDecimals);
  const roundedPercentFee = roundToDecimals(percentFeeAmountTarget, targetDecimals);
  const roundedFixedFee = roundToDecimals(fixedFeeAmountTarget, targetDecimals);
  const roundedTotalFee = roundToDecimals(totalFeeAmountTarget, targetDecimals);

  return {
    amount,
    fromCurrency: input.fromCurrency,
    toCurrency: input.toCurrency,
    exchangeRate: roundToDecimals(exchangeRate, 6),
    grossConvertedAmount: roundedGross,
    percentFeeAmountTarget: roundedPercentFee,
    fixedFeeAmountTarget: roundedFixedFee,
    totalFeeAmountTarget: roundedTotalFee,
    netConvertedAmount: roundedNet,
    effectiveRate:
      amount > 0 ? roundToDecimals(roundedNet / amount, 6) : 0,
    assumptions: {
      sourceLabel: "Interne referentiekoersen (alleen indicatief)",
      lastChecked: "2026-05-29",
      status: "indicatief",
    },
  };
}
