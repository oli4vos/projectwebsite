import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { calculateBox3Tax, calculateMortgageInterestDeduction } from "@/lib/tax";

export type HypotheekAflossenVsBeleggenInput = {
  remainingMortgageDebt?: number;
  mortgageRate?: number;
  remainingTermYears?: number;
  oneTimeExtraRepayment?: number;
  annualExtraRepayment?: number;
  taxableIncome?: number;
  includeMortgageInterestDeduction?: boolean;
  expectedAnnualReturn?: number;
  investmentHorizonYears?: number;
  includeBox3Effect?: boolean;
  currentInvestableAssets?: number;
  hasFiscalPartner?: boolean;
  taxYear?: number;
  keepBuffer?: boolean;
  minimumBuffer?: number;
};

type MortgageSimulationResult = {
  totalInterestPaid: number;
  remainingDebtEnd: number;
  annualInterest: number[];
  totalExtraUsed: number;
};

type InvestingTimelinePoint = {
  year: number;
  grossPortfolio: number;
  netPortfolioAfterBox3: number;
  additionalBox3TaxThisYear: number;
  cumulativeAdditionalBox3Tax: number;
};

export type HypotheekAflossenVsBeleggenTimelinePoint = {
  year: number;
  cumulativeGrossInterestSaved: number;
  cumulativeLostMortgageInterestDeduction: number;
  cumulativeNetBenefitAflossen: number;
  investingPortfolioGross: number;
  investingPortfolioNetAfterBox3: number;
  additionalBox3TaxThisYear: number;
  cumulativeAdditionalBox3Tax: number;
  differenceInvestingMinusAflossen: number;
};

export type HypotheekAflossenVsBeleggenResult = {
  taxYear: number;
  horizonYears: number;
  oneTimeExtraRepaymentUsed: number;
  annualExtraRepaymentUsed: number;
  grossInterestSaved: number;
  lostMortgageInterestDeduction: number;
  netBenefitAflossen: number;
  investingFutureValueGross: number;
  investingFutureValueNetAfterBox3: number;
  totalAdditionalBox3Tax: number;
  differenceInvestingMinusAflossen: number;
  breakEvenAnnualReturn: number | null;
  recommendation: "aflossen" | "beleggen" | "buffer";
  summary: string;
  assumptions: {
    includeMortgageInterestDeduction: boolean;
    includeBox3Effect: boolean;
    expectedAnnualReturn: number;
    mortgageRate: number;
  };
  timeline: {
    points: HypotheekAflossenVsBeleggenTimelinePoint[];
  };
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYears(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(value as number), 1), 60);
}

function sanitizeTaxYear(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function roundSignedMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number) {
  const safePrincipal = sanitizeMoney(principal);
  const months = Math.max(Math.round(termYears * 12), 1);
  const monthlyRate = annualRate / 100 / 12;
  if (safePrincipal <= 0) {
    return 0;
  }
  if (monthlyRate <= 0) {
    return safePrincipal / months;
  }
  return safePrincipal * (monthlyRate / (1 - (1 + monthlyRate) ** -months));
}

function simulateMortgage(input: {
  principal: number;
  annualRate: number;
  termYears: number;
  horizonYears: number;
  oneTimeExtraRepayment: number;
  annualExtraRepayment: number;
  useExtraRepayments: boolean;
}): MortgageSimulationResult {
  const principal = sanitizeMoney(input.principal);
  const annualRate = sanitizePercent(input.annualRate, 0);
  const termYears = sanitizeYears(input.termYears, 30);
  const horizonYears = sanitizeYears(input.horizonYears, termYears);
  const horizonMonths = Math.min(horizonYears * 12, termYears * 12);
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  const annualInterest = Array.from({ length: horizonYears }, () => 0);

  let remainingDebt = principal;
  let totalExtraUsed = 0;

  for (let month = 1; month <= horizonMonths; month += 1) {
    if (remainingDebt <= 0) {
      break;
    }

    if (input.useExtraRepayments) {
      if (month === 1) {
        const oneTime = Math.min(sanitizeMoney(input.oneTimeExtraRepayment), remainingDebt);
        remainingDebt -= oneTime;
        totalExtraUsed += oneTime;
      } else if ((month - 1) % 12 === 0) {
        const yearlyExtra = Math.min(sanitizeMoney(input.annualExtraRepayment), remainingDebt);
        remainingDebt -= yearlyExtra;
        totalExtraUsed += yearlyExtra;
      }
    }

    if (remainingDebt <= 0) {
      break;
    }

    const interest = monthlyRate > 0 ? remainingDebt * monthlyRate : 0;
    let principalPart = monthlyPayment - interest;
    if (principalPart <= 0) {
      principalPart = remainingDebt;
    }
    principalPart = Math.min(principalPart, remainingDebt);
    remainingDebt = Math.max(remainingDebt - principalPart, 0);

    const yearIndex = Math.floor((month - 1) / 12);
    if (yearIndex < annualInterest.length) {
      annualInterest[yearIndex] += interest;
    }
  }

  return {
    totalInterestPaid: roundMoney(annualInterest.reduce((sum, value) => sum + value, 0)),
    remainingDebtEnd: roundMoney(remainingDebt),
    annualInterest: annualInterest.map((value) => roundMoney(value)),
    totalExtraUsed: roundMoney(totalExtraUsed),
  };
}

function simulateInvestingScenario(input: {
  oneTimeAmount: number;
  annualAmount: number;
  years: number;
  annualReturnPercent: number;
  includeBox3Effect: boolean;
  taxYear: number;
  hasFiscalPartner: boolean;
  currentInvestableAssets: number;
}) {
  const years = sanitizeYears(input.years, 20);
  const annualAmount = sanitizeMoney(input.annualAmount);
  const oneTimeAmount = sanitizeMoney(input.oneTimeAmount);
  const annualReturnPercent = sanitizePercent(input.annualReturnPercent, 5);
  const returnFactor = 1 + annualReturnPercent / 100;
  const currentInvestableAssets = sanitizeMoney(input.currentInvestableAssets);

  let grossPortfolio = oneTimeAmount;
  let netPortfolio = oneTimeAmount;
  let totalAdditionalBox3Tax = 0;
  const timelinePoints: InvestingTimelinePoint[] = [];

  for (let year = 1; year <= years; year += 1) {
    grossPortfolio = roundMoney(grossPortfolio * returnFactor + annualAmount);
    netPortfolio = roundMoney(netPortfolio * returnFactor + annualAmount);
    let additionalTax = 0;

    if (input.includeBox3Effect) {
      const base = calculateBox3Tax({
        year: input.taxYear,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "actual",
        bankDeposits: currentInvestableAssets,
        investmentsAndOtherAssets: 0,
        debts: 0,
        actualAnnualReturnRate: annualReturnPercent,
      });
      const scenario = calculateBox3Tax({
        year: input.taxYear,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "actual",
        bankDeposits: currentInvestableAssets,
        investmentsAndOtherAssets: netPortfolio,
        debts: 0,
        actualAnnualReturnRate: annualReturnPercent,
      });
      additionalTax = roundMoney(Math.max(scenario.box3Tax - base.box3Tax, 0));
      totalAdditionalBox3Tax = roundMoney(totalAdditionalBox3Tax + additionalTax);
      netPortfolio = roundMoney(Math.max(netPortfolio - additionalTax, 0));
    }

    timelinePoints.push({
      year,
      grossPortfolio: roundMoney(grossPortfolio),
      netPortfolioAfterBox3: roundMoney(netPortfolio),
      additionalBox3TaxThisYear: roundMoney(additionalTax),
      cumulativeAdditionalBox3Tax: roundMoney(totalAdditionalBox3Tax),
    });
  }

  return {
    futureValueGross: roundMoney(grossPortfolio),
    futureValueNetAfterBox3: roundMoney(netPortfolio),
    totalAdditionalBox3Tax: roundMoney(totalAdditionalBox3Tax),
    timelinePoints,
  };
}

function calculateBreakEvenAnnualReturn(input: {
  oneTimeAmount: number;
  annualAmount: number;
  years: number;
  includeBox3Effect: boolean;
  taxYear: number;
  hasFiscalPartner: boolean;
  currentInvestableAssets: number;
  targetValue: number;
}) {
  const targetValue = sanitizeMoney(input.targetValue);
  if (targetValue <= 0) {
    return 0;
  }

  const valueAtZero = simulateInvestingScenario({
    oneTimeAmount: input.oneTimeAmount,
    annualAmount: input.annualAmount,
    years: input.years,
    annualReturnPercent: 0,
    includeBox3Effect: input.includeBox3Effect,
    taxYear: input.taxYear,
    hasFiscalPartner: input.hasFiscalPartner,
    currentInvestableAssets: input.currentInvestableAssets,
  }).futureValueNetAfterBox3;

  if (valueAtZero >= targetValue) {
    return 0;
  }

  const valueAtMax = simulateInvestingScenario({
    oneTimeAmount: input.oneTimeAmount,
    annualAmount: input.annualAmount,
    years: input.years,
    annualReturnPercent: 25,
    includeBox3Effect: input.includeBox3Effect,
    taxYear: input.taxYear,
    hasFiscalPartner: input.hasFiscalPartner,
    currentInvestableAssets: input.currentInvestableAssets,
  }).futureValueNetAfterBox3;

  if (valueAtMax < targetValue) {
    return null;
  }

  let low = 0;
  let high = 25;
  for (let i = 0; i < 35; i += 1) {
    const mid = (low + high) / 2;
    const valueAtMid = simulateInvestingScenario({
      oneTimeAmount: input.oneTimeAmount,
      annualAmount: input.annualAmount,
      years: input.years,
      annualReturnPercent: mid,
      includeBox3Effect: input.includeBox3Effect,
      taxYear: input.taxYear,
      hasFiscalPartner: input.hasFiscalPartner,
      currentInvestableAssets: input.currentInvestableAssets,
    }).futureValueNetAfterBox3;
    if (valueAtMid >= targetValue) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return roundMoney(high);
}

export function calculateHypotheekAflossenVsBeleggen(
  input: HypotheekAflossenVsBeleggenInput,
): HypotheekAflossenVsBeleggenResult {
  const remainingMortgageDebt = sanitizeMoney(input.remainingMortgageDebt);
  const mortgageRate = sanitizePercent(input.mortgageRate, 4);
  const remainingTermYears = sanitizeYears(input.remainingTermYears, 30);
  const oneTimeExtraRepayment = sanitizeMoney(input.oneTimeExtraRepayment);
  const annualExtraRepayment = sanitizeMoney(input.annualExtraRepayment);
  const taxableIncome = sanitizeMoney(input.taxableIncome);
  const includeMortgageInterestDeduction = Boolean(input.includeMortgageInterestDeduction);
  const expectedAnnualReturn = sanitizePercent(input.expectedAnnualReturn, 5);
  const investmentHorizonYears = sanitizeYears(
    input.investmentHorizonYears,
    remainingTermYears,
  );
  const includeBox3Effect = Boolean(input.includeBox3Effect);
  const currentInvestableAssets = sanitizeMoney(input.currentInvestableAssets);
  const hasFiscalPartner = Boolean(input.hasFiscalPartner);
  const taxYear = sanitizeTaxYear(input.taxYear);
  const keepBuffer = Boolean(input.keepBuffer);
  const minimumBuffer = sanitizeMoney(input.minimumBuffer);

  const baseline = simulateMortgage({
    principal: remainingMortgageDebt,
    annualRate: mortgageRate,
    termYears: remainingTermYears,
    horizonYears: investmentHorizonYears,
    oneTimeExtraRepayment,
    annualExtraRepayment,
    useExtraRepayments: false,
  });
  const withExtra = simulateMortgage({
    principal: remainingMortgageDebt,
    annualRate: mortgageRate,
    termYears: remainingTermYears,
    horizonYears: investmentHorizonYears,
    oneTimeExtraRepayment,
    annualExtraRepayment,
    useExtraRepayments: true,
  });

  const grossInterestSaved = roundMoney(
    Math.max(baseline.totalInterestPaid - withExtra.totalInterestPaid, 0),
  );

  let lostMortgageInterestDeduction = 0;
  if (includeMortgageInterestDeduction && taxableIncome > 0) {
    for (let i = 0; i < baseline.annualInterest.length; i += 1) {
      const baseDeduction = calculateMortgageInterestDeduction({
        annualMortgageInterest: baseline.annualInterest[i] ?? 0,
        taxableIncome,
        year: taxYear,
      });
      const extraDeduction = calculateMortgageInterestDeduction({
        annualMortgageInterest: withExtra.annualInterest[i] ?? 0,
        taxableIncome,
        year: taxYear,
      });
      lostMortgageInterestDeduction += Math.max(
        baseDeduction.estimatedTaxBenefit - extraDeduction.estimatedTaxBenefit,
        0,
      );
    }
  }
  lostMortgageInterestDeduction = roundMoney(lostMortgageInterestDeduction);

  const netBenefitAflossen = roundMoney(
    Math.max(grossInterestSaved - lostMortgageInterestDeduction, 0),
  );

  const investing = simulateInvestingScenario({
    oneTimeAmount: oneTimeExtraRepayment,
    annualAmount: annualExtraRepayment,
    years: investmentHorizonYears,
    annualReturnPercent: expectedAnnualReturn,
    includeBox3Effect,
    taxYear,
    hasFiscalPartner,
    currentInvestableAssets,
  });

  const breakEvenAnnualReturn = calculateBreakEvenAnnualReturn({
    oneTimeAmount: oneTimeExtraRepayment,
    annualAmount: annualExtraRepayment,
    years: investmentHorizonYears,
    includeBox3Effect,
    taxYear,
    hasFiscalPartner,
    currentInvestableAssets,
    targetValue: netBenefitAflossen,
  });

  const totalExtraUsed = withExtra.totalExtraUsed;
  const annualExtraRepaymentUsed = roundMoney(
    Math.max(totalExtraUsed - Math.min(oneTimeExtraRepayment, remainingMortgageDebt), 0),
  );

  const comparisonSignal = roundSignedMoney(
    investing.futureValueNetAfterBox3 - netBenefitAflossen,
  );
  let recommendation: HypotheekAflossenVsBeleggenResult["recommendation"] =
    comparisonSignal >= 0 ? "beleggen" : "aflossen";
  if (keepBuffer && currentInvestableAssets < minimumBuffer) {
    recommendation = "buffer";
  }

  const summary =
    recommendation === "buffer"
      ? "Bij jouw aannames is buffer/eigen geld behouden nu waarschijnlijk logischer dan direct aflossen of beleggen."
      : recommendation === "beleggen"
        ? "Bij jouw aannames lijkt beleggen financieel gunstiger, maar extra aflossen geeft vaak meer rust en lager schuldgevoel."
        : "Bij jouw aannames lijkt extra aflossen financieel gunstiger, maar beleggen biedt meestal meer flexibiliteit.";

  const warnings = [
    "Dit is een indicatieve vergelijking en geen officieel hypotheek- of beleggingsadvies.",
    "Werkelijke uitkomsten hangen af van renteontwikkeling, persoonlijke fiscale situatie en risico.",
  ];
  if (!includeMortgageInterestDeduction) {
    warnings.push("Hypotheekrenteaftrek staat uit in dit scenario; netto voordeel aflossen kan in praktijk anders zijn.");
  }
  if (!includeBox3Effect) {
    warnings.push("Box 3 staat uit in het beleggingsscenario; netto uitkomst kan te optimistisch zijn.");
  }
  if (keepBuffer && currentInvestableAssets < minimumBuffer) {
    warnings.push(
      "Je huidige buffer ligt onder je minimum. Daarom krijgt buffer/eigen geld prioriteit in de samenvatting.",
    );
  }

  const timelinePoints: HypotheekAflossenVsBeleggenTimelinePoint[] = [];
  let cumulativeGrossInterestSaved = 0;
  let cumulativeLostMortgageInterestDeduction = 0;

  for (let yearIndex = 0; yearIndex < investmentHorizonYears; yearIndex += 1) {
    const baselineInterest = baseline.annualInterest[yearIndex] ?? 0;
    const withExtraInterest = withExtra.annualInterest[yearIndex] ?? 0;
    const annualGrossSaved = roundMoney(
      Math.max(baselineInterest - withExtraInterest, 0),
    );
    cumulativeGrossInterestSaved = roundMoney(
      cumulativeGrossInterestSaved + annualGrossSaved,
    );

    let annualLostDeduction = 0;
    if (includeMortgageInterestDeduction && taxableIncome > 0) {
      const baseDeduction = calculateMortgageInterestDeduction({
        annualMortgageInterest: baselineInterest,
        taxableIncome,
        year: taxYear,
      });
      const extraDeduction = calculateMortgageInterestDeduction({
        annualMortgageInterest: withExtraInterest,
        taxableIncome,
        year: taxYear,
      });
      annualLostDeduction = roundMoney(
        Math.max(
          baseDeduction.estimatedTaxBenefit - extraDeduction.estimatedTaxBenefit,
          0,
        ),
      );
    }
    cumulativeLostMortgageInterestDeduction = roundMoney(
      cumulativeLostMortgageInterestDeduction + annualLostDeduction,
    );
    const cumulativeNetBenefitAflossen = roundMoney(
      Math.max(
        cumulativeGrossInterestSaved - cumulativeLostMortgageInterestDeduction,
        0,
      ),
    );

    const investingPoint = investing.timelinePoints[yearIndex] ?? {
      year: yearIndex + 1,
      grossPortfolio: investing.futureValueGross,
      netPortfolioAfterBox3: investing.futureValueNetAfterBox3,
      additionalBox3TaxThisYear: 0,
      cumulativeAdditionalBox3Tax: investing.totalAdditionalBox3Tax,
    };

    timelinePoints.push({
      year: yearIndex + 1,
      cumulativeGrossInterestSaved,
      cumulativeLostMortgageInterestDeduction,
      cumulativeNetBenefitAflossen,
      investingPortfolioGross: investingPoint.grossPortfolio,
      investingPortfolioNetAfterBox3: investingPoint.netPortfolioAfterBox3,
      additionalBox3TaxThisYear: investingPoint.additionalBox3TaxThisYear,
      cumulativeAdditionalBox3Tax: investingPoint.cumulativeAdditionalBox3Tax,
      differenceInvestingMinusAflossen: roundSignedMoney(
        investingPoint.netPortfolioAfterBox3 - cumulativeNetBenefitAflossen,
      ),
    });
  }

  const finalTimelinePoint = timelinePoints[timelinePoints.length - 1];
  const differenceInvestingMinusAflossenFinal = finalTimelinePoint
    ? finalTimelinePoint.differenceInvestingMinusAflossen
    : roundSignedMoney(investing.futureValueNetAfterBox3 - netBenefitAflossen);

  return {
    taxYear,
    horizonYears: investmentHorizonYears,
    oneTimeExtraRepaymentUsed: roundMoney(
      Math.min(oneTimeExtraRepayment, remainingMortgageDebt),
    ),
    annualExtraRepaymentUsed,
    grossInterestSaved,
    lostMortgageInterestDeduction,
    netBenefitAflossen,
    investingFutureValueGross: investing.futureValueGross,
    investingFutureValueNetAfterBox3: investing.futureValueNetAfterBox3,
    totalAdditionalBox3Tax: investing.totalAdditionalBox3Tax,
    differenceInvestingMinusAflossen: differenceInvestingMinusAflossenFinal,
    breakEvenAnnualReturn,
    recommendation,
    summary,
    assumptions: {
      includeMortgageInterestDeduction,
      includeBox3Effect,
      expectedAnnualReturn,
      mortgageRate,
    },
    timeline: {
      points: timelinePoints,
    },
    warnings,
  };
}
