import type {
  PensionContributionScenarioInput,
  PensionContributionScenarioResult,
} from "@/lib/pension/types";

export function sanitizePensionMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

export function sanitizePensionPercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

export function sanitizePensionYears(value: number | undefined) {
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

export function calculateFutureValueLumpSum(
  principal: number | undefined,
  annualReturnPercent: number | undefined,
  years: number | undefined,
) {
  const safePrincipal = sanitizePensionMoney(principal);
  const safeAnnualReturn = sanitizePensionPercent(annualReturnPercent) ?? 0;
  const safeYears = sanitizePensionYears(years);
  return roundMoney(safePrincipal * Math.pow(1 + safeAnnualReturn / 100, safeYears));
}

export function calculatePensionContributionScenario(
  input: PensionContributionScenarioInput,
): PensionContributionScenarioResult {
  const contributionUsed = sanitizePensionMoney(input.contribution);
  const annualReturnPercentUsed = sanitizePensionPercent(input.annualReturnPercent) ?? 0;
  const horizonYearsUsed = sanitizePensionYears(input.horizonYears);
  const currentTaxRatePercentUsed = roundPercent(
    sanitizePensionPercent(input.currentTaxRatePercent) ?? 0,
  );
  const payoutTaxRatePercentUsed = sanitizePensionPercent(input.payoutTaxRatePercent);

  const taxBenefitNow = roundMoney(
    contributionUsed * (currentTaxRatePercentUsed / 100),
  );
  const netCostNow = roundMoney(Math.max(contributionUsed - taxBenefitNow, 0));
  const futureValueGross = calculateFutureValueLumpSum(
    contributionUsed,
    annualReturnPercentUsed,
    horizonYearsUsed,
  );
  const estimatedTaxAtPayout =
    payoutTaxRatePercentUsed === undefined
      ? undefined
      : roundMoney(futureValueGross * (payoutTaxRatePercentUsed / 100));
  const futureValueNetIndicative = roundMoney(
    Math.max(futureValueGross - (estimatedTaxAtPayout ?? 0), 0),
  );

  const warnings: string[] = [];
  if (contributionUsed === 0) {
    warnings.push("Geen pensioeninleg opgegeven; scenario bevat geen inleggroei.");
  }
  if (payoutTaxRatePercentUsed === undefined) {
    warnings.push(
      "Geen uitkeringsbelasting ingevuld; netto pensioenuitkomst blijft indicatief.",
    );
  }

  return {
    contributionUsed,
    annualReturnPercentUsed: roundPercent(annualReturnPercentUsed),
    horizonYearsUsed,
    currentTaxRatePercentUsed,
    payoutTaxRatePercentUsed,
    taxBenefitNow,
    netCostNow,
    futureValueGross,
    estimatedTaxAtPayout,
    futureValueNetIndicative,
    warnings,
  };
}
