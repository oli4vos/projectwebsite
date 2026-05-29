export type AnnuityScheduleRow = {
  period: number;
  beginBalance: number;
  payment: number;
  interestPart: number;
  principalPart: number;
  endBalance: number;
};

export type AnnuityBaseInput = {
  annualRatePercent: number;
  termYears: number;
  paymentsPerYear?: number;
};

const DEFAULT_PAYMENTS_PER_YEAR = 12;
const MAX_PERIODS = 1200;

function round2(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function sanitizePositive(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

export function resolvePaymentsPerYear(paymentsPerYear?: number) {
  const raw = Number.isFinite(paymentsPerYear)
    ? Math.round(paymentsPerYear ?? DEFAULT_PAYMENTS_PER_YEAR)
    : DEFAULT_PAYMENTS_PER_YEAR;
  return raw > 0 ? raw : DEFAULT_PAYMENTS_PER_YEAR;
}

export function toRatePerPeriod(annualRatePercent: number, paymentsPerYear = DEFAULT_PAYMENTS_PER_YEAR) {
  const annualRateDecimal = sanitizePositive(annualRatePercent) / 100;
  return annualRateDecimal / resolvePaymentsPerYear(paymentsPerYear);
}

export function getNumberOfPeriods(termYears: number, paymentsPerYear = DEFAULT_PAYMENTS_PER_YEAR) {
  return Math.round(sanitizePositive(termYears) * resolvePaymentsPerYear(paymentsPerYear));
}

export function exceedsPracticalLimit(periods: number) {
  return periods > MAX_PERIODS;
}

export function calculateAnnuityPayment(params: AnnuityBaseInput & { principal: number }) {
  const principal = sanitizePositive(params.principal);
  const periods = getNumberOfPeriods(params.termYears, params.paymentsPerYear);
  const ratePerPeriod = toRatePerPeriod(params.annualRatePercent, params.paymentsPerYear);

  if (periods <= 0) {
    return 0;
  }

  if (ratePerPeriod === 0) {
    return principal / periods;
  }

  return (principal * ratePerPeriod) / (1 - (1 + ratePerPeriod) ** -periods);
}

export function calculatePrincipalFromAnnuity(params: AnnuityBaseInput & { payment: number }) {
  const payment = sanitizePositive(params.payment);
  const periods = getNumberOfPeriods(params.termYears, params.paymentsPerYear);
  const ratePerPeriod = toRatePerPeriod(params.annualRatePercent, params.paymentsPerYear);

  if (periods <= 0) {
    return 0;
  }

  if (ratePerPeriod === 0) {
    return payment * periods;
  }

  return (payment * (1 - (1 + ratePerPeriod) ** -periods)) / ratePerPeriod;
}

export function generateAnnuitySchedule(params: AnnuityBaseInput & { principal: number; payment: number }) {
  const principal = sanitizePositive(params.principal);
  const payment = sanitizePositive(params.payment);
  const periods = getNumberOfPeriods(params.termYears, params.paymentsPerYear);
  const ratePerPeriod = toRatePerPeriod(params.annualRatePercent, params.paymentsPerYear);

  const schedule: AnnuityScheduleRow[] = [];
  let balance = principal;

  if (periods <= 0 || principal <= 0 || payment <= 0) {
    return schedule;
  }

  for (let period = 1; period <= periods; period += 1) {
    const beginBalance = round2(balance);
    const interestPart = round2(beginBalance * ratePerPeriod);
    let periodPayment = round2(payment);
    let principalPart = round2(periodPayment - interestPart);
    let endBalance = round2(beginBalance - principalPart);

    if (period === periods || endBalance < 0) {
      principalPart = round2(beginBalance);
      periodPayment = round2(interestPart + principalPart);
      endBalance = 0;
    }

    schedule.push({
      period,
      beginBalance,
      payment: periodPayment,
      interestPart,
      principalPart,
      endBalance,
    });

    balance = endBalance;
  }

  return schedule;
}

export function summarizeSchedule(schedule: AnnuityScheduleRow[]) {
  const totalPaid = round2(schedule.reduce((sum, row) => sum + row.payment, 0));
  const totalInterest = round2(schedule.reduce((sum, row) => sum + row.interestPart, 0));
  return {
    totalPaid,
    totalInterest,
  };
}

