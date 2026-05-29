import {
  convertCurrency,
  getSupportedCurrencies,
  type FeeCurrencyMode,
  type SupportedCurrency,
} from "@/lib/calendar";

export type WisselkoersValutaInput = {
  amount: number;
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  rateOverride?: number;
  feePercent: number;
  fixedFee: number;
  feeCurrencyMode: FeeCurrencyMode;
};

export type WisselkoersValutaResult = ReturnType<typeof convertCurrency> & {
  supportedCurrencies: SupportedCurrency[];
  warnings: string[];
};

export function calculateWisselkoersValuta(
  input: WisselkoersValutaInput,
): WisselkoersValutaResult {
  const conversion = convertCurrency({
    amount: input.amount,
    fromCurrency: input.fromCurrency,
    toCurrency: input.toCurrency,
    rateOverride: input.rateOverride,
    feePercent: input.feePercent,
    fixedFee: input.fixedFee,
    feeCurrencyMode: input.feeCurrencyMode,
  });

  return {
    ...conversion,
    supportedCurrencies: getSupportedCurrencies(),
    warnings: [
      "Wisselkoersen kunnen realtime afwijken van deze indicatie.",
      "Controleer altijd de definitieve bank- of brokerkosten.",
    ],
  };
}
