export type PensionContributionScenarioInput = {
  contribution?: number;
  annualReturnPercent?: number;
  horizonYears?: number;
  currentTaxRatePercent?: number;
  payoutTaxRatePercent?: number;
};

export type PensionContributionScenarioResult = {
  contributionUsed: number;
  annualReturnPercentUsed: number;
  horizonYearsUsed: number;
  currentTaxRatePercentUsed: number;
  payoutTaxRatePercentUsed?: number;
  taxBenefitNow: number;
  netCostNow: number;
  futureValueGross: number;
  estimatedTaxAtPayout?: number;
  futureValueNetIndicative: number;
  warnings: string[];
};
