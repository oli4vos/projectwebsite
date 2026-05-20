import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { calculateBox1Tax } from "@/lib/tax";

export type ZzpUurtariefInput = {
  taxYear?: number;
  targetNetMonthlyIncome?: number;
  monthlyBufferReserve?: number;
  monthlyPensionReserve?: number;
  pensionReservePercent?: number;
  monthlyAovPremium?: number;
  monthlyBusinessCosts?: number;
  billableHoursPerWeek?: number;
  workingWeeksPerYear?: number;
  vacationWeeksPerYear?: number;
  taxReservePercent?: number;
  grossAnnualSalaryComparison?: number;
};

export type ZzpUurtariefResult = {
  taxYear: number;
  activeWeeksPerYear: number;
  billableHoursPerYear: number;
  annualNetTarget: number;
  annualBufferReserve: number;
  annualPensionReserve: number;
  annualAovPremium: number;
  annualBusinessCosts: number;
  subtotalBeforeTaxReserve: number;
  annualTaxReserve: number;
  requiredAnnualRevenue: number;
  requiredHourlyRate: number;
  pensionReserveSource: "monthlyAmount" | "percentageOfNetTarget" | "none";
  grossSalaryComparison: null | {
    grossAnnualSalary: number;
    annualRevenueGap: number;
    requiredRevenueAsPercentOfSalary: number;
  };
  box1Reference: {
    indicativeTaxOnRequiredRevenue: number;
    effectiveRate: number;
    marginalRate: number;
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

function sanitizeHours(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, 0), 80);
}

function sanitizeWeeks(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(value as number), 0), 52);
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

export function calculateZzpUurtarief(
  input: ZzpUurtariefInput,
): ZzpUurtariefResult {
  const taxYear = sanitizeTaxYear(input.taxYear);
  const targetNetMonthlyIncome = sanitizeMoney(input.targetNetMonthlyIncome);
  const monthlyBufferReserve = sanitizeMoney(input.monthlyBufferReserve);
  const monthlyPensionReserve = sanitizeMoney(input.monthlyPensionReserve);
  const pensionReservePercent = sanitizePercent(input.pensionReservePercent, 0);
  const monthlyAovPremium = sanitizeMoney(input.monthlyAovPremium);
  const monthlyBusinessCosts = sanitizeMoney(input.monthlyBusinessCosts);
  const billableHoursPerWeek = sanitizeHours(input.billableHoursPerWeek, 24);
  const workingWeeksPerYear = sanitizeWeeks(input.workingWeeksPerYear, 48);
  const vacationWeeksPerYear = sanitizeWeeks(input.vacationWeeksPerYear, 6);
  const taxReservePercent = sanitizePercent(input.taxReservePercent, 37);
  const grossAnnualSalaryComparison = sanitizeMoney(input.grossAnnualSalaryComparison);

  const activeWeeksPerYear = Math.max(workingWeeksPerYear - vacationWeeksPerYear, 0);
  const billableHoursPerYear = roundMoney(billableHoursPerWeek * activeWeeksPerYear);

  const annualNetTarget = roundMoney(targetNetMonthlyIncome * 12);
  const annualBufferReserve = roundMoney(monthlyBufferReserve * 12);
  const annualAovPremium = roundMoney(monthlyAovPremium * 12);
  const annualBusinessCosts = roundMoney(monthlyBusinessCosts * 12);

  let annualPensionReserve = 0;
  let pensionReserveSource: ZzpUurtariefResult["pensionReserveSource"] = "none";
  if (monthlyPensionReserve > 0) {
    annualPensionReserve = roundMoney(monthlyPensionReserve * 12);
    pensionReserveSource = "monthlyAmount";
  } else if (pensionReservePercent > 0) {
    annualPensionReserve = roundMoney(annualNetTarget * (pensionReservePercent / 100));
    pensionReserveSource = "percentageOfNetTarget";
  }

  const subtotalBeforeTaxReserve = roundMoney(
    annualNetTarget +
      annualBufferReserve +
      annualPensionReserve +
      annualAovPremium +
      annualBusinessCosts,
  );
  const annualTaxReserve = roundMoney(
    subtotalBeforeTaxReserve * (taxReservePercent / 100),
  );
  const requiredAnnualRevenue = roundMoney(subtotalBeforeTaxReserve + annualTaxReserve);
  const requiredHourlyRate =
    billableHoursPerYear > 0
      ? roundMoney(requiredAnnualRevenue / billableHoursPerYear)
      : 0;

  const box1Reference = calculateBox1Tax({
    taxableIncome: requiredAnnualRevenue,
    year: taxYear,
  });

  const salaryComparison =
    grossAnnualSalaryComparison > 0
      ? {
          grossAnnualSalary: roundMoney(grossAnnualSalaryComparison),
          annualRevenueGap: roundMoney(requiredAnnualRevenue - grossAnnualSalaryComparison),
          requiredRevenueAsPercentOfSalary: roundMoney(
            (requiredAnnualRevenue / grossAnnualSalaryComparison) * 100,
          ),
        }
      : null;

  const warnings = [
    "Dit is een indicatieve rekentool en geen volledige ZZP- of inkomstenbelastingaangifte.",
    "Ondernemersaftrek, MKB-winstvrijstelling, btw, investeringsaftrek en persoonlijke aftrekposten zijn niet volledig meegenomen.",
    "Gebruik deze uitkomst als richttarief en toets je situatie met een boekhouder of adviseur.",
  ];

  if (billableHoursPerYear <= 0) {
    warnings.push(
      "Declarabele uren per jaar zijn 0. Vul declarabele uren en actieve werkweken in voor een bruikbaar uurtarief.",
    );
  }

  if (activeWeeksPerYear < 40) {
    warnings.push(
      "Je actieve werkweken zijn relatief laag; het benodigde uurtarief stijgt hierdoor snel.",
    );
  }

  if (taxReservePercent < 25) {
    warnings.push(
      "Je belastingreservering is laag. Controleer of dit realistisch is voor jouw situatie.",
    );
  }

  return {
    taxYear,
    activeWeeksPerYear,
    billableHoursPerYear,
    annualNetTarget,
    annualBufferReserve,
    annualPensionReserve,
    annualAovPremium,
    annualBusinessCosts,
    subtotalBeforeTaxReserve,
    annualTaxReserve,
    requiredAnnualRevenue,
    requiredHourlyRate,
    pensionReserveSource,
    grossSalaryComparison: salaryComparison,
    box1Reference: {
      indicativeTaxOnRequiredRevenue: roundMoney(box1Reference.totalTax),
      effectiveRate: roundMoney(box1Reference.effectiveRate),
      marginalRate: roundMoney(box1Reference.marginalRate),
    },
    warnings,
  };
}
