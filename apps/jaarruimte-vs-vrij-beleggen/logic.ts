import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { calculateBox1Tax, calculateBox3Tax } from "@/lib/tax";

export type FlexibilityPreference = "low" | "medium" | "high";

export type JaarruimteVsVrijBeleggenInput = {
  year?: number;
  grossAnnualIncome?: number;
  taxableIncome?: number;
  availableJaarruimte?: number;
  plannedContribution?: number;
  currentInvestableAssets?: number;
  hasFiscalPartner?: boolean;
  expectedAnnualReturn?: number;
  horizonYears?: number;
  overrideCurrentTaxRate?: number;
  expectedTaxRateAtPayout?: number;
  includeBox3Effect?: boolean;
  flexibilityPreference?: FlexibilityPreference;
};

export type JaarruimteVsVrijBeleggenResult = {
  year: number;
  usedTaxableIncome: number;
  contributionRequested: number;
  contributionEligibleForJaarruimte: number;
  contributionOutsideJaarruimte: number;
  expectedAnnualReturn: number;
  horizonYears: number;
  currentTaxRateUsed: number;
  expectedTaxRateAtPayoutUsed?: number;
  scenarioPension: {
    contribution: number;
    taxBenefitNow: number;
    netCostNow: number;
    futureValueGross: number;
    estimatedTaxAtPayout?: number;
    futureValueNetIndicative: number;
  };
  scenarioFreeInvesting: {
    contribution: number;
    futureValueGross: number;
    additionalBox3TaxIndicative?: number;
    futureValueNetIndicative: number;
  };
  comparison: {
    netDifferencePensionMinusInvesting: number;
    pensionFitScore: number;
    investingFitScore: number;
    headline: string;
  };
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
    box3TaxRate: number;
  };
  warnings: string[];
  guidance: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYear(value?: number) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function sanitizeYears(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 10;
  }
  return Math.min(Math.max(Math.round(value as number), 1), 60);
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function calculateFutureValueLumpSum(principal: number, annualReturn: number, years: number) {
  const safePrincipal = sanitizeMoney(principal);
  const safeReturn = sanitizePercent(annualReturn) ?? 0;
  const safeYears = sanitizeYears(years);
  return roundMoney(safePrincipal * Math.pow(1 + safeReturn / 100, safeYears));
}

function clampScore(score: number) {
  return Math.min(Math.max(Math.round(score), 0), 100);
}

function getFlexibilityAdjustment(preference: FlexibilityPreference) {
  if (preference === "low") {
    return { pension: 18, investing: -18 };
  }
  if (preference === "high") {
    return { pension: -18, investing: 18 };
  }
  return { pension: 0, investing: 0 };
}

function chooseHeadline(input: {
  netDiff: number;
  pensionScore: number;
  investingScore: number;
}) {
  if (input.netDiff > 0 && input.pensionScore >= input.investingScore) {
    return "Pensioeninleg lijkt in dit scenario fiscaal aantrekkelijker.";
  }

  if (input.netDiff < 0 && input.investingScore >= input.pensionScore) {
    return "Vrij beleggen lijkt in dit scenario sterker of flexibeler.";
  }

  return "De uitkomst ligt dicht bij elkaar; flexibiliteit en timing bepalen de keuze.";
}

export function calculateJaarruimteVsVrijBeleggen(
  input: JaarruimteVsVrijBeleggenInput,
): JaarruimteVsVrijBeleggenResult {
  const year = sanitizeYear(input.year);
  const constants = getFinancialConstants(year);
  const grossAnnualIncome = sanitizeMoney(input.grossAnnualIncome);
  const taxableIncomeInput = sanitizeMoney(input.taxableIncome);
  const usedTaxableIncome = taxableIncomeInput > 0 ? taxableIncomeInput : grossAnnualIncome;
  const availableJaarruimte = sanitizeMoney(input.availableJaarruimte);
  const contributionRequested = sanitizeMoney(input.plannedContribution);
  const contributionEligibleForJaarruimte = Math.min(
    contributionRequested,
    availableJaarruimte,
  );
  const contributionOutsideJaarruimte = roundMoney(
    Math.max(contributionRequested - contributionEligibleForJaarruimte, 0),
  );
  const expectedAnnualReturn = sanitizePercent(input.expectedAnnualReturn) ?? 5;
  const horizonYears = sanitizeYears(input.horizonYears);
  const includeBox3Effect = Boolean(input.includeBox3Effect);
  const hasFiscalPartner = Boolean(input.hasFiscalPartner);
  const currentInvestableAssets = sanitizeMoney(input.currentInvestableAssets);
  const flexibilityPreference = input.flexibilityPreference ?? "medium";

  const box1Result = calculateBox1Tax({
    taxableIncome: usedTaxableIncome,
    year,
  });
  const derivedCurrentTaxRate = box1Result.marginalRate;
  const overrideCurrentTaxRate = sanitizePercent(input.overrideCurrentTaxRate);
  const currentTaxRateUsed = roundPercent(
    overrideCurrentTaxRate ?? derivedCurrentTaxRate,
  );
  const expectedTaxRateAtPayout = sanitizePercent(input.expectedTaxRateAtPayout);

  const taxBenefitNow = roundMoney(
    contributionEligibleForJaarruimte * (currentTaxRateUsed / 100),
  );
  const netCostNow = roundMoney(
    Math.max(contributionEligibleForJaarruimte - taxBenefitNow, 0),
  );
  const pensionFutureValueGross = calculateFutureValueLumpSum(
    contributionEligibleForJaarruimte,
    expectedAnnualReturn,
    horizonYears,
  );
  const estimatedTaxAtPayout =
    expectedTaxRateAtPayout === undefined
      ? undefined
      : roundMoney(pensionFutureValueGross * (expectedTaxRateAtPayout / 100));
  const pensionFutureValueNetIndicative = roundMoney(
    Math.max(
      pensionFutureValueGross - (estimatedTaxAtPayout ?? 0),
      0,
    ),
  );

  const freeInvestingFutureValueGross = calculateFutureValueLumpSum(
    contributionRequested,
    expectedAnnualReturn,
    horizonYears,
  );

  let additionalBox3TaxIndicative: number | undefined;
  if (includeBox3Effect) {
    const baseBox3 = calculateBox3Tax({
      year,
      hasFiscalPartner,
      method: "actual",
      bankDeposits: currentInvestableAssets,
      investmentsAndOtherAssets: 0,
      debts: 0,
      actualAnnualReturnRate: expectedAnnualReturn,
    });
    const scenarioBox3 = calculateBox3Tax({
      year,
      hasFiscalPartner,
      method: "actual",
      bankDeposits: currentInvestableAssets,
      investmentsAndOtherAssets: freeInvestingFutureValueGross,
      debts: 0,
      actualAnnualReturnRate: expectedAnnualReturn,
    });
    additionalBox3TaxIndicative = roundMoney(
      Math.max(scenarioBox3.box3Tax - baseBox3.box3Tax, 0),
    );
  }

  const freeInvestingFutureValueNetIndicative = roundMoney(
    Math.max(
      freeInvestingFutureValueGross - (additionalBox3TaxIndicative ?? 0),
      0,
    ),
  );

  const netDifferencePensionMinusInvesting = roundMoney(
    pensionFutureValueNetIndicative - freeInvestingFutureValueNetIndicative,
  );

  const flexibilityAdjustment = getFlexibilityAdjustment(flexibilityPreference);
  const taxEdgeScore = contributionRequested > 0
    ? Math.min((taxBenefitNow / contributionRequested) * 100, 20)
    : 0;
  const pensionFitScore = clampScore(
    50 + flexibilityAdjustment.pension + taxEdgeScore,
  );
  const investingFitScore = clampScore(
    50 +
      flexibilityAdjustment.investing +
      (includeBox3Effect ? -8 : 0) +
      (contributionOutsideJaarruimte > 0 ? 8 : 0),
  );

  const warnings = [
    "Deze tool is indicatief en geen officiële pensioen- of aangifteberekening.",
    "Controleer je echte jaarruimte altijd in je pensioenoverzicht of met een adviseur.",
    "Pensioen/lijfrente kan fiscaal voordeel geven, maar geld staat meestal vast tot pensioendatum.",
  ];
  if (includeBox3Effect) {
    warnings.push(
      "Het box 3-effect is indicatief en vereenvoudigd naar één vergelijkingsjaar.",
    );
  }
  if (expectedTaxRateAtPayout === undefined) {
    warnings.push(
      "Belasting bij uitkering is niet ingevuld; netto pensioenuitkomst kan dus afwijken.",
    );
  }

  const guidance = [
    "Pensioeninleg is vaak logisch als je nu in een hoger tarief valt en later lager verwacht uit te keren.",
    "Vrij beleggen is vaak logischer als flexibiliteit en tussentijdse opneembaarheid belangrijk zijn.",
    "Voor FIRE-planning telt naast rendement ook beschikbaarheid van vermogen vóór pensioendatum.",
  ];

  return {
    year,
    usedTaxableIncome: roundMoney(usedTaxableIncome),
    contributionRequested,
    contributionEligibleForJaarruimte,
    contributionOutsideJaarruimte,
    expectedAnnualReturn,
    horizonYears,
    currentTaxRateUsed,
    expectedTaxRateAtPayoutUsed: expectedTaxRateAtPayout,
    scenarioPension: {
      contribution: contributionEligibleForJaarruimte,
      taxBenefitNow,
      netCostNow,
      futureValueGross: pensionFutureValueGross,
      estimatedTaxAtPayout,
      futureValueNetIndicative: pensionFutureValueNetIndicative,
    },
    scenarioFreeInvesting: {
      contribution: contributionRequested,
      futureValueGross: freeInvestingFutureValueGross,
      additionalBox3TaxIndicative,
      futureValueNetIndicative: freeInvestingFutureValueNetIndicative,
    },
    comparison: {
      netDifferencePensionMinusInvesting,
      pensionFitScore,
      investingFitScore,
      headline: chooseHeadline({
        netDiff: netDifferencePensionMinusInvesting,
        pensionScore: pensionFitScore,
        investingScore: investingFitScore,
      }),
    },
    assumptions: {
      sourceLabel: constants.box1.meta.sourceLabel,
      lastChecked: constants.box1.meta.lastChecked,
      status: constants.box1.meta.status,
      box3TaxRate: constants.box3.taxRate,
    },
    warnings,
    guidance,
  };
}
