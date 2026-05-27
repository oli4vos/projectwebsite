export type Child18ImpactInput = {
  childBenefitMonthly?: number;
  childBudgetMonthly?: number;
  healthInsuranceMonthly?: number;
  healthAllowanceMonthly?: number;
  studyCostsMonthly?: number;
  childContributionMonthly?: number;
};

export type Child18ImpactLine = {
  label: string;
  monthlyImpact: number;
  explanation: string;
};

export type Child18ImpactResult = {
  lostSupportMonthly: number;
  newCostsMonthly: number;
  offsetsMonthly: number;
  netMonthlyImpact: number;
  netAnnualImpact: number;
  lines: Child18ImpactLine[];
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value as number, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateChild18Impact(
  input: Child18ImpactInput,
): Child18ImpactResult {
  const childBenefitMonthly = roundMoney(sanitizeMoney(input.childBenefitMonthly));
  const childBudgetMonthly = roundMoney(sanitizeMoney(input.childBudgetMonthly));
  const healthInsuranceMonthly = roundMoney(
    sanitizeMoney(input.healthInsuranceMonthly),
  );
  const healthAllowanceMonthly = roundMoney(
    sanitizeMoney(input.healthAllowanceMonthly),
  );
  const studyCostsMonthly = roundMoney(sanitizeMoney(input.studyCostsMonthly));
  const childContributionMonthly = roundMoney(
    sanitizeMoney(input.childContributionMonthly),
  );
  const lostSupportMonthly = roundMoney(childBenefitMonthly + childBudgetMonthly);
  const newCostsMonthly = roundMoney(healthInsuranceMonthly + studyCostsMonthly);
  const offsetsMonthly = roundMoney(
    healthAllowanceMonthly + childContributionMonthly,
  );
  const netMonthlyImpact = roundMoney(lostSupportMonthly + newCostsMonthly - offsetsMonthly);
  const netAnnualImpact = roundMoney(netMonthlyImpact * 12);

  return {
    lostSupportMonthly,
    newCostsMonthly,
    offsetsMonthly,
    netMonthlyImpact,
    netAnnualImpact,
    lines: [
      {
        label: "Kinderbijslag en kindgebonden budget",
        monthlyImpact: lostSupportMonthly,
        explanation: "Deze ondersteuning kan dalen of stoppen rond 18 jaar.",
      },
      {
        label: "Zorgverzekering en studiekosten",
        monthlyImpact: newCostsMonthly,
        explanation: "Vanaf 18 jaar ontstaan vaker eigen zorg- en studiekosten.",
      },
      {
        label: "Zorgtoeslag en bijdrage kind",
        monthlyImpact: -offsetsMonthly,
        explanation: "Deze bedragen kunnen de extra maandlast deels opvangen.",
      },
    ],
    warnings: [
      "Toeslagen hangen af van inkomen, huishouden en actuele regels; controleer dit altijd officieel.",
      "Deze tool is bedoeld als maandruimte-check, niet als toeslagenberekening.",
    ],
  };
}
