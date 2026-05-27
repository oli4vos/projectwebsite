export type PrivateLeaseImpactInput = {
  maxMortgageWithoutLease?: number;
  monthlyLeaseCost?: number;
  debtToMortgageFactor?: number;
};

export type PrivateLeaseImpactResult = {
  maxMortgageWithoutLease: number;
  monthlyLeaseCost: number;
  yearlyLeaseCost: number;
  debtToMortgageFactor: number;
  indicativeMortgageReduction: number;
  indicativeMortgageAfterLease: number;
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(value as number, 0);
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

export function calculatePrivateLeaseImpact(
  input: PrivateLeaseImpactInput,
): PrivateLeaseImpactResult {
  const maxMortgageWithoutLease = roundMoney(
    sanitizeMoney(input.maxMortgageWithoutLease),
  );
  const monthlyLeaseCost = roundMoney(sanitizeMoney(input.monthlyLeaseCost));
  const yearlyLeaseCost = roundMoney(monthlyLeaseCost * 12);
  const debtToMortgageFactor = roundMoney(
    Math.max(
      Number.isFinite(input.debtToMortgageFactor)
        ? (input.debtToMortgageFactor as number)
        : 4.5,
      0,
    ),
  );
  const indicativeMortgageReduction = roundMoney(
    yearlyLeaseCost * debtToMortgageFactor,
  );
  const indicativeMortgageAfterLease = roundMoney(
    Math.max(maxMortgageWithoutLease - indicativeMortgageReduction, 0),
  );

  return {
    maxMortgageWithoutLease,
    monthlyLeaseCost,
    yearlyLeaseCost,
    debtToMortgageFactor,
    indicativeMortgageReduction,
    indicativeMortgageAfterLease,
    warnings: [
      "Dit is een indicatieve benadering en geen bindende hypotheektoets.",
      "Verstrekkers gebruiken eigen normen; laat je definitieve situatie altijd toetsen.",
    ],
  };
}

