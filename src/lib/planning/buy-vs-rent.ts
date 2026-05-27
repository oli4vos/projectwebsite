export type BuyVsRentInput = {
  monthlyRent?: number;
  purchasePrice?: number;
  ownFunds?: number;
  mortgageRate?: number;
  mortgageTermYears?: number;
  buyerCostsPercent?: number;
  monthlyOwnerCosts?: number;
  stressRateIncrease?: number;
};

export type BuyVsRentResult = {
  monthlyRent: number;
  purchasePrice: number;
  ownFunds: number;
  buyerCostsPercent: number;
  estimatedBuyerCosts: number;
  ownFundsGap: number;
  mortgagePrincipal: number;
  mortgageRate: number;
  mortgageTermYears: number;
  grossMonthlyMortgagePayment: number;
  monthlyOwnerCosts: number;
  buyMonthlyCost: number;
  monthlyDifferenceVsRent: number;
  stressRate: number;
  stressBuyMonthlyCost: number;
  stressMonthlyIncrease: number;
  warnings: string[];
};

function sanitizeNumber(value: number | undefined, fallback = 0) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(value as number, 0);
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function calculateAnnuityPayment(principal: number, annualRate: number, years: number) {
  const months = Math.max(Math.round(years * 12), 1);
  const monthlyRate = annualRate / 100 / 12;

  if (principal <= 0) {
    return 0;
  }

  if (monthlyRate <= 0) {
    return principal / months;
  }

  return (
    principal *
    (monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)))
  );
}

export function calculateBuyVsRent(input: BuyVsRentInput): BuyVsRentResult {
  const monthlyRent = roundMoney(sanitizeNumber(input.monthlyRent));
  const purchasePrice = roundMoney(sanitizeNumber(input.purchasePrice));
  const ownFunds = roundMoney(sanitizeNumber(input.ownFunds));
  const mortgageRate = sanitizeNumber(input.mortgageRate);
  const mortgageTermYears = sanitizeNumber(input.mortgageTermYears, 30) || 30;
  const buyerCostsPercent = sanitizeNumber(input.buyerCostsPercent, 6);
  const monthlyOwnerCosts = roundMoney(sanitizeNumber(input.monthlyOwnerCosts));
  const stressRateIncrease = sanitizeNumber(input.stressRateIncrease, 2);
  const estimatedBuyerCosts = roundMoney(purchasePrice * (buyerCostsPercent / 100));
  const ownFundsGap = roundMoney(Math.max(estimatedBuyerCosts - ownFunds, 0));
  const ownFundsAfterCosts = Math.max(ownFunds - estimatedBuyerCosts, 0);
  const mortgagePrincipal = roundMoney(
    Math.max(purchasePrice - ownFundsAfterCosts, 0),
  );
  const grossMonthlyMortgagePayment = roundMoney(
    calculateAnnuityPayment(mortgagePrincipal, mortgageRate, mortgageTermYears),
  );
  const buyMonthlyCost = roundMoney(
    grossMonthlyMortgagePayment + monthlyOwnerCosts,
  );
  const monthlyDifferenceVsRent = Math.round((buyMonthlyCost - monthlyRent) * 100) / 100;
  const stressRate = Math.round((mortgageRate + stressRateIncrease) * 100) / 100;
  const stressBuyMonthlyCost = roundMoney(
    calculateAnnuityPayment(mortgagePrincipal, stressRate, mortgageTermYears) +
      monthlyOwnerCosts,
  );
  const stressMonthlyIncrease = roundMoney(
    Math.max(stressBuyMonthlyCost - buyMonthlyCost, 0),
  );

  return {
    monthlyRent,
    purchasePrice,
    ownFunds,
    buyerCostsPercent,
    estimatedBuyerCosts,
    ownFundsGap,
    mortgagePrincipal,
    mortgageRate,
    mortgageTermYears,
    grossMonthlyMortgagePayment,
    monthlyOwnerCosts,
    buyMonthlyCost,
    monthlyDifferenceVsRent,
    stressRate,
    stressBuyMonthlyCost,
    stressMonthlyIncrease,
    warnings: [
      "Dit vergelijkt maandruimte en eigen geld indicatief; waardestijging, onderhoud en persoonlijke hypotheeknormen blijven buiten beeld.",
      "Laat een echte koopbeslissing altijd toetsen met actuele hypotheeknormen en je volledige huishoudsituatie.",
    ],
  };
}
