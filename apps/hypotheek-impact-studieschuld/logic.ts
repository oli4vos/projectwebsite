export const IMPACT_SCENARIOS = [
  { key: "careful", label: "Voorzichtig", factor: 4.5 },
  { key: "middle", label: "Midden", factor: 5.0 },
  { key: "wide", label: "Ruim", factor: 5.5 },
] as const;

export type ImpactScenarioKey = (typeof IMPACT_SCENARIOS)[number]["key"];

export type HypotheekImpactInput = {
  grossIncomeUser: number;
  grossIncomePartner: number;
  duoMonthlyPayment: number;
  remainingStudentDebt?: number;
  desiredHomePrice?: number;
  ownMoney?: number;
  extraRepaymentScenario?: number;
};

export type ImpactScenarioResult = {
  key: ImpactScenarioKey;
  label: string;
  factor: number;
  impact: number;
};

export type HousingTargetSummary = {
  desiredHomePrice: number;
  ownMoney: number;
  neededMortgage: number;
  neededMortgageWithImpactMiddle: number;
};

export type ExtraRepaymentScenarioResult = {
  extraRepaymentAmount: number;
  estimatedRemainingStudentDebt: number;
  assumedMonthlyPaymentReductionRatio: number;
  estimatedMonthlyPayment: number;
  duoYearlyPayment: number;
  impactScenarios: ImpactScenarioResult[];
  middleImpactReduction: number;
};

export type HypotheekImpactResult = {
  grossIncomeTotal: number;
  duoMonthlyPayment: number;
  duoYearlyPayment: number;
  impactScenarios: ImpactScenarioResult[];
  debtToIncomeRatio?: number;
  housingTarget?: HousingTargetSummary;
  extraRepaymentScenario?: ExtraRepaymentScenarioResult;
};

function calculateImpactScenarios(duoMonthlyPayment: number): ImpactScenarioResult[] {
  const duoYearlyPayment = duoMonthlyPayment * 12;

  return IMPACT_SCENARIOS.map((scenario) => ({
    ...scenario,
    impact: duoYearlyPayment * scenario.factor,
  }));
}

export function calculateHypotheekImpact(
  input: HypotheekImpactInput,
): HypotheekImpactResult {
  const grossIncomeTotal = input.grossIncomeUser + input.grossIncomePartner;
  const duoYearlyPayment = input.duoMonthlyPayment * 12;
  const impactScenarios = calculateImpactScenarios(input.duoMonthlyPayment);
  const middleImpact =
    impactScenarios.find((scenario) => scenario.key === "middle")?.impact ?? 0;

  const debtToIncomeRatio =
    input.remainingStudentDebt !== undefined && grossIncomeTotal > 0
      ? input.remainingStudentDebt / grossIncomeTotal
      : undefined;

  const housingTarget =
    input.desiredHomePrice !== undefined
      ? {
          desiredHomePrice: input.desiredHomePrice,
          ownMoney: input.ownMoney ?? 0,
          neededMortgage: Math.max(
            input.desiredHomePrice - (input.ownMoney ?? 0),
            0,
          ),
          neededMortgageWithImpactMiddle:
            Math.max(input.desiredHomePrice - (input.ownMoney ?? 0), 0) +
            middleImpact,
        }
      : undefined;

  let extraRepaymentScenario: ExtraRepaymentScenarioResult | undefined;

  if (
    input.extraRepaymentScenario !== undefined &&
    input.remainingStudentDebt !== undefined &&
    input.remainingStudentDebt > 0
  ) {
    const estimatedRemainingStudentDebt = Math.max(
      input.remainingStudentDebt - input.extraRepaymentScenario,
      0,
    );
    const assumedMonthlyPaymentReductionRatio =
      estimatedRemainingStudentDebt / input.remainingStudentDebt;
    const estimatedMonthlyPayment =
      input.duoMonthlyPayment * assumedMonthlyPaymentReductionRatio;
    const adjustedImpactScenarios = calculateImpactScenarios(estimatedMonthlyPayment);
    const adjustedMiddleImpact =
      adjustedImpactScenarios.find((scenario) => scenario.key === "middle")?.impact ?? 0;

    extraRepaymentScenario = {
      extraRepaymentAmount: input.extraRepaymentScenario,
      estimatedRemainingStudentDebt,
      assumedMonthlyPaymentReductionRatio,
      estimatedMonthlyPayment,
      duoYearlyPayment: estimatedMonthlyPayment * 12,
      impactScenarios: adjustedImpactScenarios,
      middleImpactReduction: middleImpact - adjustedMiddleImpact,
    };
  }

  return {
    grossIncomeTotal,
    duoMonthlyPayment: input.duoMonthlyPayment,
    duoYearlyPayment,
    impactScenarios,
    debtToIncomeRatio,
    housingTarget,
    extraRepaymentScenario,
  };
}
