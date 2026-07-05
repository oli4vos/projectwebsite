import {
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoRateForRule,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { calculateStatutoryDuoMonthlyPayment, sanitizeDuoMoney } from "@/lib/duo/calculations";
import type {
  DuoLoanProjectionContext,
  DuoLoanProjectionInput,
  DuoLoanProjectionMortgageImpact,
  DuoLoanProjectionResult,
} from "@/lib/duo/types";
import { calculateMonthlyObligationMortgageCapacityReduction } from "@/lib/mortgage";

type YearMonth = {
  year: number;
  month: number;
};

function safeFinite(value: number | undefined, fallback = 0) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function roundMoney(value: number) {
  return Math.round(sanitizeDuoMoney(value) * 100) / 100;
}

function createCurrentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function parseYearMonth(value: string | undefined, fallback: YearMonth): YearMonth {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!match) {
    return fallback;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return fallback;
  }

  return { year, month };
}

function formatYearMonth(value: YearMonth) {
  return `${value.year}-${String(value.month).padStart(2, "0")}`;
}

function addMonths(value: YearMonth, months: number): YearMonth {
  const zeroBasedMonth = value.month - 1 + months;
  const date = new Date(value.year, zeroBasedMonth, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function monthsBetween(start: YearMonth, end: YearMonth) {
  return (end.year - start.year) * 12 + (end.month - start.month);
}

function getDefaultNormVersion(normYear: number) {
  const constants = getFinancialConstants(normYear);
  return `${constants.year} (${constants.duo.meta.lastChecked})`;
}

function resolveRateForMonth(
  month: YearMonth,
  context: DuoLoanProjectionContext,
) {
  const rawRate = context.getAnnualInterestRateForYear
    ? context.getAnnualInterestRateForYear(month.year)
    : getDuoRateForRule("SF35", month.year);
  return Math.min(Math.max(safeFinite(rawRate, 0), 0), 100);
}

function applyMonthlyInterest(input: {
  balance: number;
  annualRate: number;
}) {
  const monthlyRate = input.annualRate / 100 / 12;
  const interest = roundMoney(input.balance * monthlyRate);
  return {
    interest,
    balanceAfterInterest: roundMoney(input.balance + interest),
  };
}

function projectCore(
  input: DuoLoanProjectionInput,
  context: DuoLoanProjectionContext,
) {
  const calculationMonth = parseYearMonth(
    context.calculationMonth,
    createCurrentYearMonth(),
  );
  const lastLoanMonth = parseYearMonth(
    input.expectedLastLoanMonth,
    calculationMonth,
  );
  const borrowingMonths = Math.max(monthsBetween(calculationMonth, lastLoanMonth) + 1, 0);
  const monthlyLoanAmount = roundMoney(input.monthlyLoanAmount);
  let balance = roundMoney(input.currentDebt);
  let interestDuringBorrowingPhase = 0;

  for (let monthIndex = 0; monthIndex < borrowingMonths; monthIndex += 1) {
    const projectionMonth = addMonths(calculationMonth, monthIndex);
    const annualRate = resolveRateForMonth(projectionMonth, context);
    const interestStep = applyMonthlyInterest({ balance, annualRate });
    interestDuringBorrowingPhase = roundMoney(
      interestDuringBorrowingPhase + interestStep.interest,
    );
    balance = roundMoney(interestStep.balanceAfterInterest + monthlyLoanAmount);
  }

  const debtAtLastLoanMonth = balance;
  const repaymentStartMonth = { year: lastLoanMonth.year + 3, month: 1 };
  const monthsFromLastLoanMonthToRepaymentStart = monthsBetween(
    lastLoanMonth,
    repaymentStartMonth,
  );
  const gracePeriodMonths = Math.max(monthsFromLastLoanMonthToRepaymentStart - 1, 0);
  let interestDuringGracePeriod = 0;

  for (let monthIndex = 1; monthIndex <= gracePeriodMonths; monthIndex += 1) {
    const projectionMonth = addMonths(lastLoanMonth, monthIndex);
    const annualRate = resolveRateForMonth(projectionMonth, context);
    const interestStep = applyMonthlyInterest({ balance, annualRate });
    interestDuringGracePeriod = roundMoney(
      interestDuringGracePeriod + interestStep.interest,
    );
    balance = interestStep.balanceAfterInterest;
  }

  return {
    calculationMonth,
    lastLoanMonth,
    borrowingMonths,
    futurePrincipalBorrowed: roundMoney(monthlyLoanAmount * borrowingMonths),
    interestDuringBorrowingPhase,
    debtAtLastLoanMonth,
    repaymentStartMonth,
    gracePeriodMonths,
    interestDuringGracePeriod,
    debtAtRepaymentStart: balance,
  };
}

function calculateMortgageImpact(
  input: DuoLoanProjectionInput,
  context: DuoLoanProjectionContext,
  keepBorrowingMonthlyPayment: number,
): DuoLoanProjectionMortgageImpact {
  const calculationMonth = parseYearMonth(
    context.calculationMonth,
    createCurrentYearMonth(),
  );
  const stopNowProjection = projectCore(
    {
      ...input,
      monthlyLoanAmount: 0,
      expectedLastLoanMonth: formatYearMonth(calculationMonth),
      includeMortgageImpact: false,
    },
    context,
  );
  const stopNowMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    repaymentRule: "SF35",
    remainingDebt: stopNowProjection.debtAtRepaymentStart,
    annualInterestRate: resolveRateForMonth(stopNowProjection.repaymentStartMonth, context),
    remainingTermYears: 35,
  });
  const calculator =
    context.calculateMortgageCapacityReduction ??
    ((monthlyPayment: number) =>
      calculateMonthlyObligationMortgageCapacityReduction({ monthlyPayment })
        .principalReduction);
  const reductionStopNow = calculator(stopNowMonthlyPayment);
  const reductionKeepBorrowing = calculator(keepBorrowingMonthlyPayment);

  return {
    reductionStopNow: roundMoney(reductionStopNow),
    reductionKeepBorrowing: roundMoney(reductionKeepBorrowing),
    difference: roundMoney(Math.max(reductionKeepBorrowing - reductionStopNow, 0)),
  };
}

export function projectDuoLoan(
  input: DuoLoanProjectionInput,
  context: DuoLoanProjectionContext = {},
): DuoLoanProjectionResult {
  const normYear = context.normYear ?? getDefaultFinancialYear();
  const repaymentRegime = context.repaymentRegime ?? "SF35";
  const repaymentTermYears = getDuoDefaultTermForRule(repaymentRegime, normYear);
  const repaymentTermMonths = Math.max(Math.round(repaymentTermYears * 12), 0);
  const projection = projectCore(input, context);
  const projectedAnnualInterestRate = resolveRateForMonth(
    projection.calculationMonth,
    context,
  );
  const repaymentAnnualInterestRate = resolveRateForMonth(
    projection.repaymentStartMonth,
    context,
  );
  const theoreticalMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    repaymentRule: repaymentRegime,
    remainingDebt: projection.debtAtRepaymentStart,
    annualInterestRate: repaymentAnnualInterestRate,
    remainingTermYears: repaymentTermYears,
  });
  const totalRepayment = roundMoney(theoreticalMonthlyPayment * repaymentTermMonths);
  const totalInterest = roundMoney(
    Math.max(totalRepayment - projection.debtAtRepaymentStart, 0),
  );
  const mortgageImpact = input.includeMortgageImpact
    ? calculateMortgageImpact(input, context, theoreticalMonthlyPayment)
    : undefined;
  const normVersion = context.duoRateVersion ?? getDefaultNormVersion(normYear);

  return {
    calculationMonth: formatYearMonth(projection.calculationMonth),
    lastLoanMonth: formatYearMonth(projection.lastLoanMonth),
    borrowingMonths: projection.borrowingMonths,
    futurePrincipalBorrowed: projection.futurePrincipalBorrowed,
    interestDuringBorrowingPhase: projection.interestDuringBorrowingPhase,
    debtAtLastLoanMonth: projection.debtAtLastLoanMonth,
    repaymentStartMonth: formatYearMonth(projection.repaymentStartMonth),
    gracePeriodMonths: projection.gracePeriodMonths,
    interestDuringGracePeriod: projection.interestDuringGracePeriod,
    debtAtRepaymentStart: projection.debtAtRepaymentStart,
    projectedAnnualInterestRate,
    repaymentTermMonths,
    theoreticalMonthlyPayment,
    totalRepayment,
    totalInterest,
    mortgageImpact,
    assumptions: [
      "De rekenmaand is de eerste prognosemaand en de laatste leenmaand telt inclusief mee.",
      "Per maand wordt eerst rente berekend over de openstaande schuld; daarna wordt de maandelijkse opname toegevoegd.",
      "Tijdens de aanloopfase loopt rente door tot de start van de aflosfase.",
      "Deze prognose gebruikt het huidige DUO-rentepercentage als aanname voor toekomstige jaren. De werkelijke rente en maandtermijn kunnen later hoger of lager uitvallen.",
      "DUO kan je werkelijke maandbedrag op basis van draagkracht lager vaststellen. Daardoor kan de schuld langer blijven staan of minder snel dalen. Deze tool voorspelt geen persoonlijke draagkrachttoets.",
    ],
    normVersion,
  };
}
