import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  calculateFutureValueLumpSum,
  calculatePensionContributionScenario,
  sanitizePensionMoney,
  sanitizePensionPercent,
  sanitizePensionYears,
} from "@/lib/pension";
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
  wealthPlanning: {
    points: Array<{
      year: number;
      pensionGross: number;
      pensionNetIndicative: number;
      investingGrossWithoutBox3: number;
      investingNetAfterBox3: number;
      box3TaxThisYear: number;
      cumulativeBox3Tax: number;
    }>;
    totalBox3TaxPaid: number;
    endInvestingWithoutBox3: number;
    endInvestingAfterBox3: number;
  };
};

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

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
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

function buildWealthPlanning(input: {
  year: number;
  contributionEligibleForJaarruimte: number;
  freeInvestingContribution: number;
  currentInvestableAssets: number;
  hasFiscalPartner: boolean;
  expectedAnnualReturn: number;
  horizonYears: number;
  expectedTaxRateAtPayout?: number;
  includeBox3Effect: boolean;
}) {
  const points: JaarruimteVsVrijBeleggenResult["wealthPlanning"]["points"] = [];
  const growthFactor = 1 + input.expectedAnnualReturn / 100;
  const payoutTaxFactor =
    input.expectedTaxRateAtPayout !== undefined
      ? Math.max(1 - input.expectedTaxRateAtPayout / 100, 0)
      : 1;

  let investingWithoutBox3 = input.freeInvestingContribution;
  let investingAfterBox3 = input.freeInvestingContribution;
  let cumulativeBox3Tax = 0;

  for (let yearIndex = 1; yearIndex <= input.horizonYears; yearIndex += 1) {
    const pensionGross = roundMoney(
      calculateFutureValueLumpSum(
        input.contributionEligibleForJaarruimte,
        input.expectedAnnualReturn,
        yearIndex,
      ),
    );
    const pensionNetIndicative = roundMoney(pensionGross * payoutTaxFactor);

    investingWithoutBox3 = roundMoney(investingWithoutBox3 * growthFactor);
    const investingBeforeTax = roundMoney(investingAfterBox3 * growthFactor);

    let box3TaxThisYear = 0;
    if (input.includeBox3Effect) {
      const baseBox3 = calculateBox3Tax({
        year: input.year,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "actual",
        bankDeposits: input.currentInvestableAssets,
        investmentsAndOtherAssets: 0,
        debts: 0,
        actualAnnualReturnRate: input.expectedAnnualReturn,
      });
      const scenarioBox3 = calculateBox3Tax({
        year: input.year,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "actual",
        bankDeposits: input.currentInvestableAssets,
        investmentsAndOtherAssets: investingBeforeTax,
        debts: 0,
        actualAnnualReturnRate: input.expectedAnnualReturn,
      });
      box3TaxThisYear = roundMoney(
        Math.max(scenarioBox3.box3Tax - baseBox3.box3Tax, 0),
      );
    }

    cumulativeBox3Tax = roundMoney(cumulativeBox3Tax + box3TaxThisYear);
    investingAfterBox3 = roundMoney(Math.max(investingBeforeTax - box3TaxThisYear, 0));

    points.push({
      year: yearIndex,
      pensionGross,
      pensionNetIndicative,
      investingGrossWithoutBox3: investingWithoutBox3,
      investingNetAfterBox3: investingAfterBox3,
      box3TaxThisYear,
      cumulativeBox3Tax,
    });
  }

  return {
    points,
    totalBox3TaxPaid: roundMoney(cumulativeBox3Tax),
    endInvestingWithoutBox3: roundMoney(investingWithoutBox3),
    endInvestingAfterBox3: roundMoney(investingAfterBox3),
  };
}

export function calculateJaarruimteVsVrijBeleggen(
  input: JaarruimteVsVrijBeleggenInput,
): JaarruimteVsVrijBeleggenResult {
  const year = sanitizeYear(input.year);
  const constants = getFinancialConstants(year);
  const grossAnnualIncome = sanitizePensionMoney(input.grossAnnualIncome);
  const taxableIncomeInput = sanitizePensionMoney(input.taxableIncome);
  const usedTaxableIncome = taxableIncomeInput > 0 ? taxableIncomeInput : grossAnnualIncome;
  const availableJaarruimte = sanitizePensionMoney(input.availableJaarruimte);
  const contributionRequested = sanitizePensionMoney(input.plannedContribution);
  const contributionEligibleForJaarruimte = Math.min(
    contributionRequested,
    availableJaarruimte,
  );
  const contributionOutsideJaarruimte = roundMoney(
    Math.max(contributionRequested - contributionEligibleForJaarruimte, 0),
  );
  const expectedAnnualReturn = sanitizePensionPercent(input.expectedAnnualReturn) ?? 5;
  const horizonYears = sanitizePensionYears(input.horizonYears);
  const includeBox3Effect = Boolean(input.includeBox3Effect);
  const hasFiscalPartner = Boolean(input.hasFiscalPartner);
  const currentInvestableAssets = sanitizePensionMoney(input.currentInvestableAssets);
  const flexibilityPreference = input.flexibilityPreference ?? "medium";

  const box1Result = calculateBox1Tax({
    taxableIncome: usedTaxableIncome,
    year,
  });
  const derivedCurrentTaxRate = box1Result.marginalRate;
  const overrideCurrentTaxRate = sanitizePensionPercent(input.overrideCurrentTaxRate);
  const currentTaxRateUsed = roundPercent(
    overrideCurrentTaxRate ?? derivedCurrentTaxRate,
  );
  const expectedTaxRateAtPayout = sanitizePensionPercent(input.expectedTaxRateAtPayout);
  const pensionScenario = calculatePensionContributionScenario({
    contribution: contributionEligibleForJaarruimte,
    annualReturnPercent: expectedAnnualReturn,
    horizonYears,
    currentTaxRatePercent: currentTaxRateUsed,
    payoutTaxRatePercent: expectedTaxRateAtPayout,
  });
  const freeInvestingContribution = roundMoney(pensionScenario.netCostNow);

  const freeInvestingFutureValueGross = calculateFutureValueLumpSum(
    freeInvestingContribution,
    expectedAnnualReturn,
    horizonYears,
  );

  const wealthPlanning = buildWealthPlanning({
    year,
    contributionEligibleForJaarruimte,
    freeInvestingContribution,
    currentInvestableAssets,
    hasFiscalPartner,
    expectedAnnualReturn,
    horizonYears,
    expectedTaxRateAtPayout,
    includeBox3Effect,
  });
  const additionalBox3TaxIndicative = includeBox3Effect
    ? wealthPlanning.points.at(-1)?.box3TaxThisYear ?? 0
    : undefined;

  const freeInvestingFutureValueNetIndicative = roundMoney(
    includeBox3Effect
      ? wealthPlanning.endInvestingAfterBox3
      : Math.max(freeInvestingFutureValueGross, 0),
  );

  const netDifferencePensionMinusInvesting = roundMoney(
    pensionScenario.futureValueNetIndicative - freeInvestingFutureValueNetIndicative,
  );

  const flexibilityAdjustment = getFlexibilityAdjustment(flexibilityPreference);
  const taxEdgeScore = contributionRequested > 0
    ? Math.min((pensionScenario.taxBenefitNow / contributionRequested) * 100, 20)
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
      "Het box 3-effect is indicatief en wordt hier als jaarlijkse benadering over de horizon verwerkt.",
    );
  }
  for (const pensionWarning of pensionScenario.warnings) {
    if (!warnings.includes(pensionWarning)) {
      warnings.push(pensionWarning);
    }
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
      taxBenefitNow: pensionScenario.taxBenefitNow,
      netCostNow: pensionScenario.netCostNow,
      futureValueGross: pensionScenario.futureValueGross,
      estimatedTaxAtPayout: pensionScenario.estimatedTaxAtPayout,
      futureValueNetIndicative: pensionScenario.futureValueNetIndicative,
    },
    scenarioFreeInvesting: {
      contribution: freeInvestingContribution,
      futureValueGross: roundMoney(freeInvestingFutureValueGross),
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
    wealthPlanning,
  };
}
