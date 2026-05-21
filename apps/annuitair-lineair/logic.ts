import {
  TAX_FACTOR_DEFAULT,
  calculateAnnuitySchedule,
  calculateLinearSchedule,
} from "./mortgageCalculator";
import { aggregatePerYear, simulateInvestmentPot } from "./investmentStrategy";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { calculateBox3Tax, type Box3Method } from "@/lib/tax";

export type MortgageInput = {
  loanAmount: number;
  interestRatePercent: number;
  loanTermYears: number;
  annualReturnPercent?: number;
  taxFactor?: number;
  includeInvestmentScenario?: boolean;
  box3EffectEnabled?: boolean;
  taxYear?: number;
  hasFiscalPartner?: boolean;
  box3Method?: Box3Method;
  box3BankDeposits?: number;
  box3InvestmentsAndOtherAssets?: number;
  box3Debts?: number;
};

type InvestmentScenarioYear = {
  year: number;
  annuityNettoSum: number;
  linearNettoSum: number;
  monthlyDifferenceTotal: number;
  grossReturn: number;
  box3TaxExtra: number;
  potAfterBox3: number;
};

type InvestmentScenarioResult = {
  annualReturnPercent: number;
  box3EffectEnabled: boolean;
  endPotBeforeBox3: number;
  endPotAfterBox3: number;
  totalInleg: number;
  totalOnttrekking: number;
  totalRendement: number;
  totalTekort: number;
  totalBox3TaxExtra: number;
  omslagMaand: number | null;
  yearly: InvestmentScenarioYear[];
};

const DEFAULT_YEAR = getDefaultFinancialYear();

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function sanitizeMoney(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

function sanitizePercent(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

function annualToMonthlyRate(annualPercent: number) {
  const p = sanitizePercent(annualPercent);
  return Math.pow(1 + p / 100, 1 / 12) - 1;
}

function buildOptionalInvestmentScenario(input: {
  annuityRows: ReturnType<typeof calculateAnnuitySchedule>;
  linearRows: ReturnType<typeof calculateLinearSchedule>;
  annualReturnPercent: number;
  box3EffectEnabled: boolean;
  taxYear?: number;
  hasFiscalPartner: boolean;
  box3Method: Box3Method;
  box3BankDeposits: number;
  box3InvestmentsAndOtherAssets: number;
  box3Debts: number;
}): InvestmentScenarioResult {
  const rm = annualToMonthlyRate(input.annualReturnPercent);
  const monthsPerYear = 12;
  const totalMonths = input.annuityRows.length;
  const totalYears = Math.ceil(totalMonths / monthsPerYear);
  const usedYear = Number.isFinite(input.taxYear) ? Math.round(input.taxYear ?? DEFAULT_YEAR) : DEFAULT_YEAR;

  let pot = 0;
  let totalInleg = 0;
  let totalOnttrekking = 0;
  let totalRendement = 0;
  let totalTekort = 0;
  let totalBox3TaxExtra = 0;
  let omslagMaand: number | null = null;
  let hadPositive = false;
  const yearly: InvestmentScenarioYear[] = [];

  for (let year = 1; year <= totalYears; year += 1) {
    let annuityNettoSum = 0;
    let linearNettoSum = 0;
    let monthlyDifferenceTotal = 0;
    let grossReturn = 0;

    const startIndex = (year - 1) * monthsPerYear;
    const endIndex = Math.min(startIndex + monthsPerYear, totalMonths);

    for (let monthIndex = startIndex; monthIndex < endIndex; monthIndex += 1) {
      const annuity = input.annuityRows[monthIndex];
      const linear = input.linearRows[monthIndex];
      const annuityNetto = Number(annuity?.nettoMonthly) || 0;
      const linearNetto = Number(linear?.nettoMonthly) || 0;
      const difference = linearNetto - annuityNetto;

      annuityNettoSum += annuityNetto;
      linearNettoSum += linearNetto;
      monthlyDifferenceTotal += difference;

      const monthReturn = pot * rm;
      grossReturn += monthReturn;
      pot += monthReturn + difference;

      if (difference > 0) {
        hadPositive = true;
        totalInleg += difference;
      } else if (difference < 0) {
        totalOnttrekking += -difference;
      }

      if (pot < 0) {
        totalTekort += -pot;
        pot = 0;
      }

      if (omslagMaand === null && hadPositive && difference < 0) {
        omslagMaand = monthIndex + 1;
      }
    }

    totalRendement += grossReturn;

    let box3TaxExtra = 0;
    if (input.box3EffectEnabled) {
      const base = calculateBox3Tax({
        year: usedYear,
        hasFiscalPartner: input.hasFiscalPartner,
        method: input.box3Method,
        actualAnnualReturnRate:
          input.box3Method === "actual" ? input.annualReturnPercent : undefined,
        bankDeposits: input.box3BankDeposits,
        investmentsAndOtherAssets: input.box3InvestmentsAndOtherAssets,
        debts: input.box3Debts,
      });
      const withPot = calculateBox3Tax({
        year: usedYear,
        hasFiscalPartner: input.hasFiscalPartner,
        method: input.box3Method,
        actualAnnualReturnRate:
          input.box3Method === "actual" ? input.annualReturnPercent : undefined,
        bankDeposits: input.box3BankDeposits,
        investmentsAndOtherAssets: input.box3InvestmentsAndOtherAssets + Math.max(pot, 0),
        debts: input.box3Debts,
      });
      box3TaxExtra = Math.max(withPot.box3Tax - base.box3Tax, 0);
      pot = Math.max(pot - box3TaxExtra, 0);
      totalBox3TaxExtra += box3TaxExtra;
    }

    yearly.push({
      year,
      annuityNettoSum: roundMoney(annuityNettoSum),
      linearNettoSum: roundMoney(linearNettoSum),
      monthlyDifferenceTotal: roundMoney(monthlyDifferenceTotal),
      grossReturn: roundMoney(grossReturn),
      box3TaxExtra: roundMoney(box3TaxExtra),
      potAfterBox3: roundMoney(pot),
    });
  }

  return {
    annualReturnPercent: sanitizePercent(input.annualReturnPercent),
    box3EffectEnabled: input.box3EffectEnabled,
    endPotBeforeBox3: roundMoney(Math.max(pot + totalBox3TaxExtra, 0)),
    endPotAfterBox3: roundMoney(Math.max(pot, 0)),
    totalInleg: roundMoney(totalInleg),
    totalOnttrekking: roundMoney(totalOnttrekking),
    totalRendement: roundMoney(totalRendement),
    totalTekort: roundMoney(totalTekort),
    totalBox3TaxExtra: roundMoney(totalBox3TaxExtra),
    omslagMaand,
    yearly,
  };
}

export function calculateMortgageComparison({
  loanAmount,
  interestRatePercent,
  loanTermYears,
  annualReturnPercent = 0,
  taxFactor = TAX_FACTOR_DEFAULT,
  includeInvestmentScenario = false,
  box3EffectEnabled = false,
  taxYear,
  hasFiscalPartner = false,
  box3Method = "actual",
  box3BankDeposits,
  box3InvestmentsAndOtherAssets,
  box3Debts,
}: MortgageInput) {
  const annuityRows = calculateAnnuitySchedule(
    loanAmount,
    interestRatePercent,
    loanTermYears,
    taxFactor,
  );
  const linearRows = calculateLinearSchedule(
    loanAmount,
    interestRatePercent,
    loanTermYears,
    taxFactor,
  );
  const potSimulation = simulateInvestmentPot({
    annuityRows,
    linearRows,
    annualReturnPercent,
    clampToZero: true,
  });
  const yearlySummary = aggregatePerYear({ potMonths: potSimulation.months });
  const investmentScenario = includeInvestmentScenario
    ? buildOptionalInvestmentScenario({
        annuityRows,
        linearRows,
        annualReturnPercent,
        box3EffectEnabled,
        taxYear,
        hasFiscalPartner,
        box3Method,
        box3BankDeposits: sanitizeMoney(box3BankDeposits),
        box3InvestmentsAndOtherAssets: sanitizeMoney(box3InvestmentsAndOtherAssets),
        box3Debts: sanitizeMoney(box3Debts),
      })
    : undefined;

  const firstAnnuity = annuityRows[0];
  const firstLinear = linearRows[0];
  const totalAnnuityInterest = annuityRows.reduce(
    (sum, row) => sum + row.interestPayment,
    0,
  );
  const totalLinearInterest = linearRows.reduce(
    (sum, row) => sum + row.interestPayment,
    0,
  );

  return {
    annuityRows,
    linearRows,
    potSimulation,
    yearlySummary,
    investmentScenario,
    firstMonth: {
      annuityBruto: firstAnnuity.totalPayment,
      annuityNetto: firstAnnuity.nettoMonthly,
      linearBruto: firstLinear.totalPayment,
      linearNetto: firstLinear.nettoMonthly,
      monthlyDifferenceNetto: firstLinear.nettoMonthly - firstAnnuity.nettoMonthly,
    },
    totals: {
      totalAnnuityInterest,
      totalLinearInterest,
      interestBenefitLinear: totalAnnuityInterest - totalLinearInterest,
      endPot: investmentScenario?.endPotAfterBox3 ?? 0,
      maxPot: includeInvestmentScenario ? potSimulation.summary.maxPot : 0,
      totalInleg: investmentScenario?.totalInleg ?? 0,
      totalOnttrekking: investmentScenario?.totalOnttrekking ?? 0,
      totalRendement: investmentScenario?.totalRendement ?? 0,
      totalTekort: investmentScenario?.totalTekort ?? 0,
      omslagMaand: investmentScenario?.omslagMaand ?? null,
    },
  };
}
