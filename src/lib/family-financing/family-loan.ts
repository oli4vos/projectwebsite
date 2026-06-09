import { calculateAnnuityPayment } from "@/lib/mortgage";
import type {
  FamilyLoanInput,
  FamilyLoanResult,
  FamilyLoanScheduleRow,
  EuroAmount,
} from "@/lib/family-financing/types";

function safeFinite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function sanitizeMoney(value: number) {
  return Math.max(safeFinite(value, 0), 0);
}

function sanitizePercent(value: number) {
  return Math.min(Math.max(safeFinite(value, 0), 0), 100);
}

function sanitizeYears(value: number) {
  const safeValue = safeFinite(value, 0);
  if (safeValue <= 0) {
    return 0;
  }
  return safeValue;
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function summarizeCashflow(
  totalPayments: EuroAmount,
  totalInterest: EuroAmount,
  totalPrincipal: EuroAmount,
  endingDebt: EuroAmount,
) {
  return {
    totalPayments,
    totalInterest,
    totalPrincipal,
    endingDebt,
  };
}

function createEmptyResult(input: FamilyLoanInput, warning: string): FamilyLoanResult {
  return {
    input,
    principalUsed: 0,
    annualRateUsed: 0,
    termYearsUsed: 0,
    repaymentType: input.repaymentType,
    monthlyPayment: 0,
    periods: 0,
    schedule: [],
    totalPayments: 0,
    totalInterest: 0,
    totalPrincipal: 0,
    remainingDebt: 0,
    borrowerCashflow: summarizeCashflow(0, 0, 0, 0),
    lenderCashflow: summarizeCashflow(0, 0, 0, 0),
    warnings: [warning],
  };
}

function buildAnnuitySchedule(input: {
  principal: number;
  annualRate: number;
  termYears: number;
}) {
  const periods = Math.max(Math.round(input.termYears * 12), 0);
  const monthlyRate = input.annualRate / 100 / 12;
  const monthlyPayment = calculateAnnuityPayment({
    principal: input.principal,
    annualRate: input.annualRate,
    years: input.termYears,
  });

  const schedule: FamilyLoanScheduleRow[] = [];
  let balance = roundMoney(input.principal);
  let totalPayments = 0;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let period = 1; period <= periods; period += 1) {
    const openingBalance = balance;
    const interestPayment = roundMoney(openingBalance * monthlyRate);
    let principalPayment = roundMoney(monthlyPayment - interestPayment);
    let payment = monthlyPayment;

    if (period === periods) {
      principalPayment = openingBalance;
      payment = roundMoney(interestPayment + principalPayment);
    } else if (principalPayment > openingBalance) {
      principalPayment = openingBalance;
      payment = roundMoney(interestPayment + principalPayment);
    }

    const closingBalance = roundMoney(openingBalance - principalPayment);
    balance = period === periods ? 0 : closingBalance;

    const row: FamilyLoanScheduleRow = {
      period,
      openingBalance,
      payment,
      interestPayment,
      principalPayment,
      closingBalance: balance,
      borrowerCashOutflow: payment,
      lenderCashInflow: payment,
    };

    schedule.push(row);
    totalPayments = roundMoney(totalPayments + payment);
    totalInterest = roundMoney(totalInterest + interestPayment);
    totalPrincipal = roundMoney(totalPrincipal + principalPayment);
  }

  return {
    monthlyPayment,
    periods,
    schedule,
    totalPayments,
    totalInterest,
    totalPrincipal,
    remainingDebt: balance,
  };
}

function buildLinearSchedule(input: {
  principal: number;
  annualRate: number;
  termYears: number;
}) {
  const periods = Math.max(Math.round(input.termYears * 12), 0);
  const monthlyRate = input.annualRate / 100 / 12;
  const fixedPrincipalBeforeRounding = periods === 0 ? 0 : input.principal / periods;
  const fixedPrincipal = roundMoney(fixedPrincipalBeforeRounding);

  const schedule: FamilyLoanScheduleRow[] = [];
  let balance = roundMoney(input.principal);
  let totalPayments = 0;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let period = 1; period <= periods; period += 1) {
    const openingBalance = balance;
    const interestPayment = roundMoney(openingBalance * monthlyRate);
    let principalPayment =
      period === periods ? openingBalance : Math.min(fixedPrincipal, openingBalance);
    principalPayment = roundMoney(principalPayment);
    const payment = roundMoney(interestPayment + principalPayment);
    const closingBalance = roundMoney(openingBalance - principalPayment);
    balance = period === periods ? 0 : closingBalance;

    const row: FamilyLoanScheduleRow = {
      period,
      openingBalance,
      payment,
      interestPayment,
      principalPayment,
      closingBalance: balance,
      borrowerCashOutflow: payment,
      lenderCashInflow: payment,
    };

    schedule.push(row);
    totalPayments = roundMoney(totalPayments + payment);
    totalInterest = roundMoney(totalInterest + interestPayment);
    totalPrincipal = roundMoney(totalPrincipal + principalPayment);
  }

  const monthlyPayment = schedule[0]?.payment ?? 0;

  return {
    monthlyPayment,
    periods,
    schedule,
    totalPayments,
    totalInterest,
    totalPrincipal,
    remainingDebt: balance,
  };
}

export function calculateFamilyLoan(input: FamilyLoanInput): FamilyLoanResult {
  const principalUsed = sanitizeMoney(input.principal);
  const annualRateUsed = sanitizePercent(input.annualRate);
  const termYearsUsed = sanitizeYears(input.termYears);
  const repaymentType = input.repaymentType;
  const warnings: string[] = [];

  if (principalUsed === 0) {
    return createEmptyResult(input, "Vul een positieve hoofdsom in.");
  }

  if (termYearsUsed === 0) {
    return createEmptyResult(input, "Vul een positieve looptijd in.");
  }

  if (repaymentType !== "annuity" && repaymentType !== "linear") {
    return createEmptyResult(input, "Vul een ondersteunde aflossingsvorm in.");
  }

  if (annualRateUsed === 0) {
    warnings.push("Rente is 0%; de lening lost volledig lineair af over de looptijd.");
  }

  const baseSchedule =
    repaymentType === "annuity"
      ? buildAnnuitySchedule({
          principal: principalUsed,
          annualRate: annualRateUsed,
          termYears: termYearsUsed,
        })
      : buildLinearSchedule({
          principal: principalUsed,
          annualRate: annualRateUsed,
          termYears: termYearsUsed,
        });

  const borrowerCashflow = summarizeCashflow(
    baseSchedule.totalPayments,
    baseSchedule.totalInterest,
    baseSchedule.totalPrincipal,
    baseSchedule.remainingDebt,
  );

  const lenderCashflow = summarizeCashflow(
    baseSchedule.totalPayments,
    baseSchedule.totalInterest,
    baseSchedule.totalPrincipal,
    baseSchedule.remainingDebt,
  );

  return {
    input,
    principalUsed,
    annualRateUsed,
    termYearsUsed,
    repaymentType,
    monthlyPayment: baseSchedule.monthlyPayment,
    periods: baseSchedule.periods,
    schedule: baseSchedule.schedule,
    totalPayments: baseSchedule.totalPayments,
    totalInterest: baseSchedule.totalInterest,
    totalPrincipal: baseSchedule.totalPrincipal,
    remainingDebt: baseSchedule.remainingDebt,
    borrowerCashflow,
    lenderCashflow,
    warnings,
  };
}
