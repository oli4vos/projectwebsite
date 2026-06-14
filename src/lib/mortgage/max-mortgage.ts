import {
  getDefaultFinancialYear,
  getFinancialConstants,
  getIndicativeIncomeHousingCostRatio,
  getMortgageFinancingLoadRatio,
  getMortgageFinancingLoadTable,
  getStudentDebtGrossUpFactor,
} from "@/lib/financial-constants";
import { calculateAnnuityPayment } from "@/lib/mortgage/annuity";
import type {
  MortgageMaxMortgageBreakdown,
  MortgageMaxMortgageDebug,
  MortgageMaxMortgageInput,
  MortgageMaxMortgageDetailedLimitingFactor,
  MortgageMaxMortgageLimitingFactor,
  MortgageMaxMortgagePropertyInput,
  MortgageMaxMortgageResult,
  MortgageMaxMortgageStudentLoanInput,
  MortgageMaxMortgageWarning,
  MortgageMaxMortgageWarningSeverity,
} from "@/lib/mortgage/types";

const DEFAULT_NHG_STANDARD_LIMIT = 470_000;
const DEFAULT_NHG_WITH_ENERGY_LIMIT = 498_200;
const DEFAULT_BUYER_COST_RATE = 0.04;
const DEFAULT_ENERGY_SAVING_ALLOWANCE_CAP_RATIO = 0.06;
const DEFAULT_CREDIT_LIMIT_FACTOR = 0.01;

const ENERGY_LABEL_PURCHASE_ALLOWANCES: Readonly<Record<string, number>> = {
  G: 0,
  F: 0,
  E: 0,
  D: 5_000,
  C: 5_000,
  B: 10_000,
  A: 10_000,
  "A+": 20_000,
  "A++": 20_000,
  "A+++": 25_000,
  "A++++": 30_000,
  APLUSGUARANTEE: 40_000,
  unknown: 0,
};

const ENERGY_SAVING_MEASURE_ALLOWANCES: Readonly<Record<string, number>> = {
  G: 20_000,
  F: 20_000,
  E: 20_000,
  D: 15_000,
  C: 15_000,
  B: 10_000,
  A: 10_000,
  "A+": 10_000,
  "A++": 10_000,
  "A+++": 0,
  "A++++": 0,
  APLUSGUARANTEE: 0,
  unknown: 0,
};

function safeFinite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function sanitizeMoney(value: number) {
  return Math.max(safeFinite(value, 0), 0);
}

function sanitizePercent(value: number) {
  return Math.max(safeFinite(value, 0), 0);
}

function sanitizeYears(value: number, fallback = 0) {
  const safeValue = safeFinite(value, fallback);
  return safeValue > 0 ? safeValue : fallback > 0 ? fallback : 0;
}

function sanitizeMonths(value: number, fallback = 0) {
  const safeValue = safeFinite(value, fallback);
  return safeValue > 0 ? Math.round(safeValue) : fallback > 0 ? fallback : 0;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function roundMonthlyMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function calculateAnnuityFactor(input: {
  annualRate: number;
  years: number;
}) {
  const safeAnnualRate = sanitizePercent(input.annualRate);
  const safeYears = sanitizeYears(input.years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (months === 0) {
    return 0;
  }

  if (safeAnnualRate === 0) {
    return months;
  }

  const monthlyRate = safeAnnualRate / 100 / 12;
  return (1 - (1 + monthlyRate) ** -months) / monthlyRate;
}

function pushWarning(
  warnings: MortgageMaxMortgageWarning[],
  code: MortgageMaxMortgageWarning["code"],
  severity: MortgageMaxMortgageWarningSeverity,
  message: string,
) {
  warnings.push({ code, severity, message });
}

function normalizeEnergyLabel(value?: MortgageMaxMortgagePropertyInput["energyLabel"]) {
  if (!value) {
    return "unknown";
  }

  const normalized = String(value).trim().toUpperCase();

  if (normalized === "A++++ GUARANTEE" || normalized === "A++++_GUARANTEE") {
    return "APLUSGUARANTEE";
  }

  return normalized in ENERGY_LABEL_PURCHASE_ALLOWANCES ? normalized : "unknown";
}

function resolveHouseholdIncome(input: MortgageMaxMortgageInput) {
  const baseIncome = sanitizeMoney(input.grossAnnualHouseholdIncome);
  const partnerIncome = sanitizeMoney(input.grossAnnualPartnerIncome ?? 0);
  const householdType =
    input.householdType ?? (partnerIncome > 0 ? "partners" : "single");

  return {
    householdIncome:
      householdType === "partners" ? baseIncome + partnerIncome : baseIncome,
    partnerIncome,
  };
}

function resolveMortgageRate(
  input: MortgageMaxMortgageInput,
  defaultMortgageRate: number,
) {
  const annualMortgageRate =
    input.annualMortgageRate === undefined || input.annualMortgageRate === null
      ? sanitizePercent(defaultMortgageRate)
      : sanitizePercent(input.annualMortgageRate);
  const fixedRatePeriodMonths = sanitizeMonths(input.fixedRatePeriodMonths ?? 0);
  const afmStressAnnualRate = sanitizePercent(input.afmStressAnnualRate ?? annualMortgageRate);

  if (fixedRatePeriodMonths > 0 && fixedRatePeriodMonths < 120) {
    const testRateUsed = Math.max(annualMortgageRate, afmStressAnnualRate);
    return {
      annualMortgageRate,
      testRateUsed,
      testRateSource: testRateUsed > annualMortgageRate ? ("afm_stress_rate" as const) : ("input" as const),
    };
  }

  return {
    annualMortgageRate,
    testRateUsed: annualMortgageRate,
    testRateSource: "input" as const,
  };
}

function calculateStudentLoanMonthlyImpact(
  studentLoan: MortgageMaxMortgageStudentLoanInput | undefined,
  studentDebtMonthlyPayment: number,
  studentDebtNormativeMonthlyPayment: number,
  studentDebtRegime: MortgageMaxMortgageInput["studentDebtRegime"],
  mortgageRate: number,
  warnings: MortgageMaxMortgageWarning[],
) {
  if (studentLoan?.hasStudentLoan) {
    const status = studentLoan.status ?? "repaying";
    const actualMonthlyPayment = sanitizeMoney(studentLoan.actualMonthlyPayment ?? 0);
    const statutoryMonthlyPayment = sanitizeMoney(studentLoan.statutoryMonthlyPayment ?? 0);
    const baseMonthlyPayment =
      status === "repaying" ? actualMonthlyPayment : statutoryMonthlyPayment;

    if (baseMonthlyPayment <= 0) {
      pushWarning(
        warnings,
        "MISSING_STUDENT_LOAN_PAYMENT",
        "blocking",
        "Vul het wettelijke of actuele DUO-maandbedrag in.",
      );
      return 0;
    }

    return roundMonthlyMoney(baseMonthlyPayment * getStudentDebtGrossUpFactor(mortgageRate).factor);
  }

  const monthlyPayment = sanitizeMoney(studentDebtMonthlyPayment);
  const normativeMonthlyPayment = sanitizeMoney(studentDebtNormativeMonthlyPayment);
  const prefersNormative =
    studentDebtRegime === "SF15" || studentDebtRegime === "SF35";
  const baseMonthlyPayment = prefersNormative
    ? normativeMonthlyPayment > 0
      ? normativeMonthlyPayment
      : monthlyPayment
    : monthlyPayment > 0
      ? monthlyPayment
      : normativeMonthlyPayment;

  if (baseMonthlyPayment <= 0) {
    return 0;
  }

  return roundMonthlyMoney(baseMonthlyPayment * getStudentDebtGrossUpFactor(mortgageRate).factor);
}

function calculateLiabilityMonthlyImpact(
  input: MortgageMaxMortgageInput,
  warnings: MortgageMaxMortgageWarning[],
) {
  const monthlyFinancialObligations = sanitizeMoney(
    input.monthlyFinancialObligations ?? input.monthlyDebtPayments ?? 0,
  );
  const liabilitiesImpact = (input.liabilities ?? []).reduce((total, liability) => {
    if (liability.type === "ground_lease") {
      return total + roundMonthlyMoney(sanitizeMoney(liability.annualCanon ?? 0) / 12);
    }

    const monthlyPayment = sanitizeMoney(liability.monthlyPayment ?? 0);

    if (monthlyPayment > 0) {
      return total + monthlyPayment;
    }

    if (
      (liability.type === "personal_loan" ||
        liability.type === "revolving_credit" ||
        liability.type === "credit_card" ||
        liability.type === "overdraft") &&
      sanitizeMoney(liability.creditLimit ?? 0) > 0
    ) {
      return total + sanitizeMoney(liability.creditLimit ?? 0) * DEFAULT_CREDIT_LIMIT_FACTOR;
    }

    if (liability.type === "student_loan") {
      pushWarning(
        warnings,
        "MISSING_STUDENT_LOAN_PAYMENT",
        "blocking",
        "Vul het wettelijke of actuele DUO-maandbedrag in.",
      );
    }

    return total;
  }, 0);

  return roundMonthlyMoney(monthlyFinancialObligations + liabilitiesImpact);
}

function calculateEnergyLabelAllowance(property: MortgageMaxMortgagePropertyInput | undefined) {
  const normalized = normalizeEnergyLabel(property?.energyLabel);
  return ENERGY_LABEL_PURCHASE_ALLOWANCES[normalized] ?? 0;
}

function calculateEnergySavingAllowance(
  property: MortgageMaxMortgagePropertyInput | undefined,
  marketValue: number,
) {
  const energySavingMeasuresAmount = sanitizeMoney(property?.energySavingMeasuresAmount ?? 0);
  const normalized = normalizeEnergyLabel(property?.energyLabel);
  const labelMaximum = ENERGY_SAVING_MEASURE_ALLOWANCES[normalized] ?? 0;

  if (energySavingMeasuresAmount <= 0 || marketValue <= 0 || labelMaximum <= 0) {
    return 0;
  }

  return roundMoney(
    Math.min(
      energySavingMeasuresAmount,
      labelMaximum,
      marketValue * DEFAULT_ENERGY_SAVING_ALLOWANCE_CAP_RATIO,
    ),
  );
}

function calculateLtvLimit(
  baseMaxMortgageByLtv: number,
  energySavingAllowance: number,
) {
  if (baseMaxMortgageByLtv <= 0) {
    return undefined;
  }

  return roundMoney(baseMaxMortgageByLtv + energySavingAllowance);
}

function calculateNhgLimit(
  input: MortgageMaxMortgageInput,
  purchasePrice: number,
  energySavingAllowance: number,
) {
  if (!input.property?.nhgRequested) {
    return undefined;
  }

  const standardLimit = sanitizeMoney(input.nhgStandardLimit ?? DEFAULT_NHG_STANDARD_LIMIT);
  const energyLimit = sanitizeMoney(input.nhgWithEnergyLimit ?? DEFAULT_NHG_WITH_ENERGY_LIMIT);
  const relevantCosts = purchasePrice + sanitizeMoney(input.property?.renovationAmount ?? 0);

  if (relevantCosts <= standardLimit) {
    return standardLimit;
  }

  if (energySavingAllowance > 0 && relevantCosts <= energyLimit) {
    return energyLimit;
  }

  return standardLimit;
}

function calculateLimitingFactor(input: {
  maxMortgageByIncome: number;
  maxMortgageByLtv?: number;
  maxMortgageByNhg?: number;
}): MortgageMaxMortgageLimitingFactor {
  const candidates: Array<[MortgageMaxMortgageLimitingFactor, number]> = [
    ["income", input.maxMortgageByIncome],
  ];

  if (input.maxMortgageByLtv !== undefined) {
    candidates.push(["ltv", input.maxMortgageByLtv]);
  }

  if (input.maxMortgageByNhg !== undefined) {
    candidates.push(["nhg", input.maxMortgageByNhg]);
  }

  return candidates.reduce((current, candidate) =>
    candidate[1] < current[1] ? candidate : current,
  )[0];
}

function calculateDetailedLimitingFactor(input: {
  maxMortgageByIncome: number;
  maxMortgageByCollateral?: number | null;
}) {
  if (!Number.isFinite(input.maxMortgageByIncome) || input.maxMortgageByIncome <= 0) {
    return "unknown" as MortgageMaxMortgageDetailedLimitingFactor;
  }

  if (input.maxMortgageByCollateral === undefined || input.maxMortgageByCollateral === null) {
    return "income" as MortgageMaxMortgageDetailedLimitingFactor;
  }

  if (!Number.isFinite(input.maxMortgageByCollateral) || input.maxMortgageByCollateral <= 0) {
    return "unknown" as MortgageMaxMortgageDetailedLimitingFactor;
  }

  const income = roundMoney(input.maxMortgageByIncome);
  const collateral = roundMoney(input.maxMortgageByCollateral);

  if (income === collateral) {
    return "both" as MortgageMaxMortgageDetailedLimitingFactor;
  }

  return income < collateral
    ? ("income" as MortgageMaxMortgageDetailedLimitingFactor)
    : ("collateral" as MortgageMaxMortgageDetailedLimitingFactor);
}

export function calculateIndicativeMaxMortgage(
  input: MortgageMaxMortgageInput,
): MortgageMaxMortgageResult {
  const normYear = getDefaultFinancialYear();
  const financialConstants = getFinancialConstants(normYear);
  const warnings: MortgageMaxMortgageWarning[] = [];
  const assumptions: string[] = [];
  const mortgageRateResolution = resolveMortgageRate(
    input,
    financialConstants.mortgage.defaultMortgageRate,
  );

  pushWarning(
    warnings,
    "INDICATIVE_ONLY",
    "info",
    "Deze berekening is indicatief en geen hypotheekadvies.",
  );
  assumptions.push(
    `Gebaseerd op normjaar ${normYear}; de gebruikte tabelversie en eventuele fallback worden afzonderlijk vastgelegd.`,
  );

  const { householdIncome, partnerIncome } = resolveHouseholdIncome(input);
  const annualMortgageRateUsed = mortgageRateResolution.annualMortgageRate;
  const mortgageTermYears = sanitizeYears(
    input.mortgageTermYears ?? financialConstants.mortgage.defaultMortgageTermYears,
    financialConstants.mortgage.defaultMortgageTermYears,
  );
  const mortgageTermMonths = Math.max(Math.round(mortgageTermYears * 12), 0);
  const financingLoadTable = getMortgageFinancingLoadTable(input.borrowerAgeYears);
  const financingLoadTableRatio = getMortgageFinancingLoadRatio({
    annualIncome: householdIncome,
    mortgageRate: mortgageRateResolution.testRateUsed,
    ageYears: input.borrowerAgeYears,
    year: normYear,
  });
  const fallbackHousingCostRatio =
    getIndicativeIncomeHousingCostRatio(normYear) ??
    financialConstants.mortgage.indicativeIncomeHousingCostRatio;
  const financingLoadSource =
    input.incomeHousingCostRatio !== undefined
      ? ("input" as const)
      : financingLoadTableRatio !== null
        ? ("official_table" as const)
        : ("fallback" as const);
  const annualHousingCostRatio = sanitizePercent(
    input.incomeHousingCostRatio ??
      financingLoadTableRatio ??
      fallbackHousingCostRatio,
  );

  assumptions.push(
    financingLoadSource === "official_table"
      ? `Financieringslastpercentage uit ${financingLoadTable.versionLabel} (${financingLoadTable.ageGroup === "fromAow" ? "AOW-leeftijd bereikt" : "AOW-leeftijd niet bereikt"}).`
      : financingLoadSource === "input"
        ? "Financieringslastpercentage is handmatig opgegeven."
        : `Financieringslastpercentage gebruikt de indicatieve fallback van normjaar ${normYear}.`,
  );

  if (financingLoadSource === "fallback") {
    pushWarning(
      warnings,
      "FINANCING_LOAD_TABLE_FALLBACK",
      "warning",
      "De officiële financieringslasttabel paste niet bij het gekozen normjaar; een indicatieve fallback is gebruikt.",
    );
  }

  if (householdIncome <= 0) {
    pushWarning(warnings, "MISSING_INCOME", "blocking", "Vul je bruto jaarinkomen in.");
  }

  if (input.annualMortgageRate === undefined || input.annualMortgageRate === null) {
    pushWarning(warnings, "MISSING_RATE", "warning", "Vul een hypotheekrente in.");
  }

  if (mortgageTermMonths <= 0) {
    pushWarning(warnings, "MISSING_TERM", "blocking", "Vul een looptijd in jaren in.");
  }

  const maxAnnualHousingCost = roundMoney((householdIncome * annualHousingCostRatio) / 100);
  const monthlyHousingBudgetBeforeLiabilities = roundMonthlyMoney(maxAnnualHousingCost / 12);
  const studentLoanMonthlyImpact = calculateStudentLoanMonthlyImpact(
    input.studentLoan,
    input.studentDebtMonthlyPayment ?? 0,
    input.studentDebtNormativeMonthlyPayment ?? 0,
    input.studentDebtRegime ?? "unknown",
    annualMortgageRateUsed,
    warnings,
  );
  const monthlyLiabilityImpact = roundMonthlyMoney(
    studentLoanMonthlyImpact + calculateLiabilityMonthlyImpact(input, warnings),
  );
  const monthlyHousingBudgetAfterLiabilities = roundMonthlyMoney(
    Math.max(monthlyHousingBudgetBeforeLiabilities - monthlyLiabilityImpact, 0),
  );
  const annuityFactor = calculateAnnuityFactor({
    annualRate: mortgageRateResolution.testRateUsed,
    years: mortgageTermYears,
  });
  const studentLoanBorrowingCapacityImpact = roundMoney(
    studentLoanMonthlyImpact * annuityFactor,
  );
  const baseMaxMortgageByIncome = roundMoney(
    monthlyHousingBudgetAfterLiabilities * annuityFactor,
  );

  const property = input.property;
  const propertyValue = sanitizeMoney(
    property?.propertyValue ?? property?.marketValue ?? property?.purchasePrice ?? 0,
  );
  const marketValue = sanitizeMoney(property?.marketValue ?? propertyValue);
  const purchasePrice = sanitizeMoney(property?.purchasePrice ?? propertyValue);
  const ltvPercentage = sanitizePercent(property?.ltvPercentage ?? 100);
  const energyLabelAllowance = calculateEnergyLabelAllowance(property);
  const energySavingAllowance = calculateEnergySavingAllowance(property, marketValue);
  const maxMortgageByIncome = roundMoney(
    baseMaxMortgageByIncome + energyLabelAllowance + energySavingAllowance,
  );
  const baseMaxMortgageByLtv = roundMoney(
    propertyValue * (ltvPercentage / 100),
  );
  const maxMortgageByCollateral = calculateLtvLimit(
    baseMaxMortgageByLtv,
    energySavingAllowance,
  );
  const maxMortgageByNhg = calculateNhgLimit(input, purchasePrice, energySavingAllowance);

  const limits = [maxMortgageByIncome];
  if (maxMortgageByCollateral !== undefined) {
    limits.push(maxMortgageByCollateral);
  }
  if (maxMortgageByNhg !== undefined) {
    limits.push(maxMortgageByNhg);
  }

  const maxMortgageFinal = roundMoney(Math.min(...limits));
  const ownFunds = sanitizeMoney(input.ownFunds ?? 0);
  const buyerCostRate = sanitizePercent(input.buyerCostRate ?? DEFAULT_BUYER_COST_RATE);
  const buyerCostsEstimate = roundMoney(purchasePrice * buyerCostRate);
  const renovationAmount = sanitizeMoney(property?.renovationAmount ?? 0);
  const requiredOwnFunds = roundMoney(
    Math.max(purchasePrice + buyerCostsEstimate + renovationAmount - maxMortgageFinal - ownFunds, 0),
  );
  const fundingGap = requiredOwnFunds;

  if (maxMortgageFinal === maxMortgageByIncome) {
    pushWarning(warnings, "INCOME_LIMITING", "info", "Je inkomen begrenst je hypotheek.");
  }

  if (maxMortgageByCollateral !== undefined && maxMortgageFinal === maxMortgageByCollateral) {
    pushWarning(warnings, "LTV_LIMITING", "info", "De woningwaarde begrenst je hypotheek.");
  }

  if (maxMortgageByNhg !== undefined && maxMortgageFinal === maxMortgageByNhg) {
    pushWarning(warnings, "NHG_LIMITING", "warning", "NHG begrenst deze indicatieve hypotheek.");
  }

  if (requiredOwnFunds > 0) {
    pushWarning(
      warnings,
      "OWN_FUNDS_SHORTAGE",
      "warning",
      "Je hebt indicatief onvoldoende eigen middelen voor deze aankoop.",
    );
  }

  const limitingFactor = calculateLimitingFactor({
    maxMortgageByIncome,
    maxMortgageByLtv: maxMortgageByCollateral ?? undefined,
    maxMortgageByNhg,
  });

  const limitingFactorDetailed = calculateDetailedLimitingFactor({
    maxMortgageByIncome,
    maxMortgageByCollateral,
  });

  const monthlyPaymentGross = roundMonthlyMoney(
    maxMortgageFinal > 0 && mortgageTermMonths > 0
      ? calculateAnnuityPayment({
          principal: maxMortgageFinal,
          annualRate: annualMortgageRateUsed,
          years: mortgageTermYears,
        })
      : 0,
  );

  const maxHomeBudget =
    propertyValue > 0 || purchasePrice > 0
      ? roundMoney(Math.max(maxMortgageFinal + ownFunds - buyerCostsEstimate - renovationAmount, 0))
      : null;

  const debug: MortgageMaxMortgageDebug = {
    toetsinkomen: roundMoney(householdIncome),
    primaryIncome: roundMoney(input.grossAnnualHouseholdIncome),
    partnerIncome: roundMoney(partnerIncome),
    financingLoadPercentage: annualHousingCostRatio,
    maxAnnualHousingCost,
    maxMonthlyHousingCost: monthlyHousingBudgetBeforeLiabilities,
    monthlyObligations: monthlyLiabilityImpact,
    availableMortgageMonthlyCost: monthlyHousingBudgetAfterLiabilities,
    annuityFactor,
    interestRate: mortgageRateResolution.testRateUsed,
    durationMonths: mortgageTermMonths,
    collateralValue: maxMortgageByCollateral ?? null,
    ownFunds,
    ltvPercentage: maxMortgageByCollateral !== undefined ? ltvPercentage : null,
  };

  const breakdown: MortgageMaxMortgageBreakdown = {
    householdIncome: roundMoney(householdIncome),
    partnerIncome: roundMoney(partnerIncome),
    annualMortgageRateUsed,
    testRateUsed: mortgageRateResolution.testRateUsed,
    testRateSource: mortgageRateResolution.testRateSource,
    mortgageTermMonths,
    annualHousingCostRatio,
    financingLoadSource,
    financingLoadTableYear:
      financingLoadSource === "official_table" ? financingLoadTable.normYear : undefined,
    financingLoadTableVersion:
      financingLoadSource === "official_table" ? financingLoadTable.versionLabel : undefined,
    financingLoadTableSourceUrl:
      financingLoadSource === "official_table" ? financingLoadTable.sourceUrl : undefined,
    financingLoadAgeGroup:
      financingLoadSource === "official_table" ? financingLoadTable.ageGroup : undefined,
    monthlyHousingBudgetBeforeLiabilities,
    monthlyLiabilityImpact,
    studentLoanMonthlyImpact,
    studentLoanBorrowingCapacityImpact,
    monthlyHousingBudgetAfterLiabilities,
    baseMaxMortgageByIncome,
    energyLabelAllowance,
    propertyValue,
    purchasePrice,
    marketValue,
    ltvPercentage,
    baseMaxMortgageByLtv,
    maxMortgageByIncome,
    maxMortgageByLtv: maxMortgageByCollateral ?? 0,
    maxMortgageByNhg,
    buyerCostsEstimate,
    energySavingAllowance,
    ownFunds,
    requiredOwnFunds,
  };

  const confidence: MortgageMaxMortgageResult["confidence"] =
    warnings.some((warning) => warning.severity === "blocking")
      ? "low"
      : warnings.some((warning) => warning.severity === "warning")
        ? "medium"
        : "high";

  return {
    normYear,
    maxMortgageByIncome,
    maxMortgageByCollateral: maxMortgageByCollateral ?? null,
    finalMaxMortgage: maxMortgageFinal,
    maxHomeBudget,
    limitingFactorDetailed,
    debug,
    maxMortgageFinal,
    monthlyPaymentGross,
    monthlyHousingBudget: monthlyHousingBudgetAfterLiabilities,
    fundingGap,
    limitingFactor,
    confidence,
    warnings,
    assumptions,
    breakdown,
  };
}
