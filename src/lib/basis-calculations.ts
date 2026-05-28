const EPSILON = 1e-12;

export type PeriodUnit = "month" | "quarter" | "year" | "week" | "day";
export type PaymentMoment = "end" | "begin";

export type AmortizationRow = {
  period: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  closingBalance: number;
};

export type AnnuityResult = {
  payment: number;
  totalPaid: number;
  totalInterest: number;
  periods: number;
  schedule: AmortizationRow[];
};

export type LinearLoanResult = {
  fixedPrincipal: number;
  firstPayment: number;
  lastPayment: number;
  totalPaid: number;
  totalInterest: number;
  periods: number;
  schedule: AmortizationRow[];
};

export type FractionResult = {
  numerator: number;
  denominator: number;
  fraction: string;
  decimalValue: number;
};

export type WeightedRateRow = {
  amount: number;
  ratePercent: number;
  weightedContribution: number;
};

export type WeightedRateResult = {
  weightedRatePercent: number;
  totalAmount: number;
  count: number;
  rows: WeightedRateRow[];
};

export type FutureValueResult = {
  futureValue: number;
  totalContributions: number;
  totalReturn: number;
  periods: number;
};

export type DcfYearRow = {
  year: number;
  cashflow: number;
  discountFactor: number;
  presentValue: number;
};

export type DcfResult = {
  totalPresentValue: number;
  presentValueCashflows: number;
  presentValueTerminal: number;
  rows: DcfYearRow[];
};

const ROMAN_TABLE: Array<{ value: number; symbol: string }> = [
  { value: 1000, symbol: "M" },
  { value: 900, symbol: "CM" },
  { value: 500, symbol: "D" },
  { value: 400, symbol: "CD" },
  { value: 100, symbol: "C" },
  { value: 90, symbol: "XC" },
  { value: 50, symbol: "L" },
  { value: 40, symbol: "XL" },
  { value: 10, symbol: "X" },
  { value: 9, symbol: "IX" },
  { value: 5, symbol: "V" },
  { value: 4, symbol: "IV" },
  { value: 1, symbol: "I" },
];

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function roundNumber(value: number, decimals = 6) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** Math.max(0, Math.floor(decimals));
  return Math.round(value * factor) / factor;
}

function assertFinite(value: number, message: string) {
  if (!Number.isFinite(value)) {
    throw new Error(message);
  }
}

function assertPositive(value: number, message: string) {
  if (!(value > 0)) {
    throw new Error(message);
  }
}

function assertNonNegative(value: number, message: string) {
  if (value < 0) {
    throw new Error(message);
  }
}

function periodicRate(annualRatePercent: number, periodsPerYear: number) {
  assertFinite(annualRatePercent, "Vul een geldige rente in.");
  assertPositive(periodsPerYear, "Het aantal perioden per jaar moet positief zijn.");
  return annualRatePercent / 100 / periodsPerYear;
}

export function periodsPerYearFromUnit(unit: PeriodUnit) {
  switch (unit) {
    case "month":
      return 12;
    case "quarter":
      return 4;
    case "year":
      return 1;
    case "week":
      return 52;
    case "day":
      return 365;
    default:
      return 12;
  }
}

export function calculateAnnuityPayment(input: {
  principal: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
  paymentMoment?: PaymentMoment;
}) {
  const periodUnit = input.periodUnit ?? "month";
  const paymentMoment = input.paymentMoment ?? "end";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);

  assertPositive(input.principal, "Vul een positief leenbedrag in.");
  assertNonNegative(input.annualRatePercent, "Vul een geldige rente in.");
  assertPositive(input.years, "Vul een positieve looptijd in.");

  const n = Math.round(input.years * periodsPerYear);
  assertPositive(n, "Vul een positieve looptijd in.");
  const r = periodicRate(input.annualRatePercent, periodsPerYear);

  if (Math.abs(r) < EPSILON) {
    return roundMoney(input.principal / n);
  }

  const basePayment = (input.principal * r) / (1 - (1 + r) ** -n);
  if (paymentMoment === "begin") {
    return roundMoney(basePayment / (1 + r));
  }
  return roundMoney(basePayment);
}

export function calculateAnnuitySchedule(input: {
  principal: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
  paymentMoment?: PaymentMoment;
}): AnnuityResult {
  const periodUnit = input.periodUnit ?? "month";
  const paymentMoment = input.paymentMoment ?? "end";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);

  assertPositive(input.principal, "Vul een positief leenbedrag in.");
  assertNonNegative(input.annualRatePercent, "Vul een geldige rente in.");
  assertPositive(input.years, "Vul een positieve looptijd in.");

  const periods = Math.round(input.years * periodsPerYear);
  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  let balance = roundMoney(input.principal);
  const payment = calculateAnnuityPayment({
    principal: input.principal,
    annualRatePercent: input.annualRatePercent,
    years: input.years,
    periodUnit,
    paymentMoment,
  });

  const schedule: AmortizationRow[] = [];
  let totalPaid = 0;
  let totalInterest = 0;

  for (let period = 1; period <= periods; period += 1) {
    const openingBalance = balance;
    let interest = 0;
    let principalPart = 0;
    let paymentForRow = payment;

    if (paymentMoment === "begin") {
      principalPart = Math.min(paymentForRow, openingBalance);
      const afterPayment = roundMoney(openingBalance - principalPart);
      interest = roundMoney(afterPayment * r);
      balance = roundMoney(afterPayment + interest);
    } else {
      interest = roundMoney(openingBalance * r);
      principalPart = roundMoney(paymentForRow - interest);
      if (period === periods || principalPart > openingBalance) {
        principalPart = openingBalance;
        paymentForRow = roundMoney(interest + principalPart);
      }
      balance = roundMoney(openingBalance - principalPart);
    }

    if (period === periods) {
      if (paymentMoment === "begin") {
        if (balance > 0) {
          const extra = balance;
          paymentForRow = roundMoney(paymentForRow + extra);
          principalPart = roundMoney(principalPart + extra);
          balance = 0;
        }
      } else {
        balance = 0;
      }
    }

    totalPaid = roundMoney(totalPaid + paymentForRow);
    totalInterest = roundMoney(totalInterest + interest);

    schedule.push({
      period,
      openingBalance,
      payment: paymentForRow,
      interest,
      principal: principalPart,
      closingBalance: balance,
    });
  }

  return {
    payment,
    totalPaid,
    totalInterest,
    periods,
    schedule,
  };
}

export function calculateLoanFromAnnuity(input: {
  annuityPayment: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
}) {
  const periodUnit = input.periodUnit ?? "month";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);
  const n = Math.round(input.years * periodsPerYear);

  assertPositive(input.annuityPayment, "Vul een positief termijnbedrag in.");
  assertNonNegative(input.annualRatePercent, "Vul een geldige rente in.");
  assertPositive(input.years, "Vul een positieve looptijd in.");

  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  if (Math.abs(r) < EPSILON) {
    return roundMoney(input.annuityPayment * n);
  }
  const principal = input.annuityPayment * ((1 - (1 + r) ** -n) / r);
  return roundMoney(principal);
}

export function calculateAnnuityTermCount(input: {
  principal: number;
  annuityPayment: number;
  annualRatePercent: number;
  periodUnit?: PeriodUnit;
}) {
  const periodUnit = input.periodUnit ?? "month";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);

  assertPositive(input.principal, "Vul een positief leenbedrag in.");
  assertPositive(input.annuityPayment, "Vul een positief termijnbedrag in.");
  assertNonNegative(input.annualRatePercent, "Vul een geldige rente in.");

  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  let exactPeriods = 0;
  if (Math.abs(r) < EPSILON) {
    exactPeriods = input.principal / input.annuityPayment;
  } else {
    if (input.annuityPayment <= input.principal * r) {
      throw new Error("De termijn is te laag om de lening af te lossen.");
    }
    exactPeriods =
      -Math.log(1 - (input.principal * r) / input.annuityPayment) / Math.log(1 + r);
  }

  const nearestInteger = Math.round(exactPeriods);
  const periods =
    Math.abs(exactPeriods - nearestInteger) <= 0.01
      ? nearestInteger
      : Math.ceil(exactPeriods);
  const years = Math.floor(periods / periodsPerYear);
  const remainingPeriods = periods % periodsPerYear;
  return {
    periods,
    exactPeriods: roundNumber(exactPeriods, 6),
    years,
    remainingPeriods,
  };
}

export function calculateLinearLoanSchedule(input: {
  principal: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
}): LinearLoanResult {
  const periodUnit = input.periodUnit ?? "month";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);
  const periods = Math.round(input.years * periodsPerYear);

  assertPositive(input.principal, "Vul een positief leenbedrag in.");
  assertNonNegative(input.annualRatePercent, "Vul een geldige rente in.");
  assertPositive(input.years, "Vul een positieve looptijd in.");

  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  let balance = roundMoney(input.principal);
  const fixedPrincipal = roundMoney(input.principal / periods);
  const schedule: AmortizationRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;

  for (let period = 1; period <= periods; period += 1) {
    const openingBalance = balance;
    const interest = roundMoney(openingBalance * r);
    let principalPart = fixedPrincipal;
    if (period === periods || principalPart > openingBalance) {
      principalPart = openingBalance;
    }
    const payment = roundMoney(principalPart + interest);
    balance = roundMoney(openingBalance - principalPart);
    if (period === periods) {
      balance = 0;
    }

    totalInterest = roundMoney(totalInterest + interest);
    totalPaid = roundMoney(totalPaid + payment);
    schedule.push({
      period,
      openingBalance,
      payment,
      interest,
      principal: principalPart,
      closingBalance: balance,
    });
  }

  return {
    fixedPrincipal,
    firstPayment: schedule[0]?.payment ?? 0,
    lastPayment: schedule.at(-1)?.payment ?? 0,
    totalPaid,
    totalInterest,
    periods,
    schedule,
  };
}

export function calculatePresentValue(input: {
  futureValue: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
}) {
  const periodUnit = input.periodUnit ?? "year";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);
  const periods = Math.round(input.years * periodsPerYear);

  assertFinite(input.futureValue, "Vul een geldige toekomstige waarde in.");
  assertPositive(input.years, "Vul een positieve periode in.");
  assertFinite(input.annualRatePercent, "Vul een geldige rente in.");

  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  if (1 + r <= 0) {
    throw new Error("Deze rente leidt tot een ongeldige berekening.");
  }
  const factor = 1 / (1 + r) ** periods;
  return {
    presentValue: roundMoney(input.futureValue * factor),
    discountFactor: roundNumber(factor, 6),
    periods,
  };
}

export function calculatePresentValueAnnuity(input: {
  payment: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
}) {
  const periodUnit = input.periodUnit ?? "year";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);
  const periods = Math.round(input.years * periodsPerYear);

  assertFinite(input.payment, "Vul een geldig betalingsbedrag in.");
  assertPositive(input.years, "Vul een positieve looptijd in.");
  assertFinite(input.annualRatePercent, "Vul een geldige rente in.");

  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  if (1 + r <= 0) {
    throw new Error("Vul een geldige rente in.");
  }

  const presentValue =
    Math.abs(r) < EPSILON
      ? input.payment * periods
      : input.payment * ((1 - (1 + r) ** -periods) / r);

  return {
    presentValue: roundMoney(presentValue),
    periods,
  };
}

export function calculateFutureValue(input: {
  currentValue: number;
  periodicContribution: number;
  annualRatePercent: number;
  years: number;
  periodUnit?: PeriodUnit;
}) {
  const periodUnit = input.periodUnit ?? "year";
  const periodsPerYear = periodsPerYearFromUnit(periodUnit);
  const periods = Math.round(input.years * periodsPerYear);

  assertFinite(input.currentValue, "Vul een geldige huidige waarde in.");
  assertFinite(input.periodicContribution, "Vul een geldige inleg in.");
  assertPositive(input.years, "Vul een positieve looptijd in.");
  assertFinite(input.annualRatePercent, "Vul een geldige rente in.");

  const r = periodicRate(input.annualRatePercent, periodsPerYear);
  if (1 + r <= 0) {
    throw new Error("Vul een geldige rente in.");
  }

  const growth = (1 + r) ** periods;
  const contributionsGrowth =
    Math.abs(r) < EPSILON ? input.periodicContribution * periods : input.periodicContribution * ((growth - 1) / r);
  const futureValue = input.currentValue * growth + contributionsGrowth;
  const totalContributions = input.currentValue + input.periodicContribution * periods;

  return {
    futureValue: roundMoney(futureValue),
    totalContributions: roundMoney(totalContributions),
    totalReturn: roundMoney(futureValue - totalContributions),
    periods,
  } satisfies FutureValueResult;
}

export function calculateEffectiveRateFromNominal(
  nominalRatePercent: number,
  periodsPerYear: number,
) {
  assertFinite(nominalRatePercent, "Vul een geldige nominale rente in.");
  assertPositive(periodsPerYear, "Het aantal perioden per jaar moet positief zijn.");
  const nominal = nominalRatePercent / 100;
  if (1 + nominal / periodsPerYear <= 0) {
    throw new Error("Vul een geldige nominale rente in.");
  }
  return roundNumber(((1 + nominal / periodsPerYear) ** periodsPerYear - 1) * 100, 6);
}

export function calculateNominalRateFromEffective(
  effectiveRatePercent: number,
  periodsPerYear: number,
) {
  assertFinite(effectiveRatePercent, "Vul een geldige effectieve rente in.");
  assertPositive(periodsPerYear, "Het aantal perioden per jaar moet positief zijn.");
  const effective = effectiveRatePercent / 100;
  if (1 + effective <= 0) {
    throw new Error("Vul een geldige effectieve rente in.");
  }
  const nominal = periodsPerYear * ((1 + effective) ** (1 / periodsPerYear) - 1);
  return roundNumber(nominal * 100, 6);
}

export function calculateSimpleRateFromCompound(
  compoundRatePerPeriodPercent: number,
  periods: number,
) {
  assertFinite(compoundRatePerPeriodPercent, "Vul een geldige samengestelde rente in.");
  assertPositive(periods, "Het aantal perioden moet groter zijn dan 0.");

  const r = compoundRatePerPeriodPercent / 100;
  if (1 + r <= 0) {
    throw new Error("Vul een geldige samengestelde rente in.");
  }
  const simple = ((1 + r) ** periods - 1) / periods;
  return roundNumber(simple * 100, 6);
}

export function calculateCompoundRateFromSimple(
  simpleRatePerPeriodPercent: number,
  periods: number,
) {
  assertFinite(simpleRatePerPeriodPercent, "Vul een geldige enkelvoudige rente in.");
  assertPositive(periods, "Het aantal perioden moet groter zijn dan 0.");

  const s = simpleRatePerPeriodPercent / 100;
  if (1 + s * periods <= 0) {
    throw new Error("Vul een geldige enkelvoudige rente in.");
  }
  const compound = (1 + s * periods) ** (1 / periods) - 1;
  return roundNumber(compound * 100, 6);
}

export function calculatePercentage(part: number, total: number) {
  assertFinite(part, "Vul twee geldige getallen in.");
  assertFinite(total, "Vul twee geldige getallen in.");
  if (Math.abs(total) < EPSILON) {
    throw new Error("Het tweede getal mag niet 0 zijn.");
  }
  return roundNumber((part / total) * 100, 6);
}

export function calculateTotalFromPercentage(part: number, percentage: number) {
  assertFinite(part, "Vul een geldig bedrag of getal in.");
  assertFinite(percentage, "Vul een geldig percentage in.");
  if (Math.abs(percentage) < EPSILON) {
    throw new Error("Het percentage mag niet 0 zijn.");
  }
  return roundMoney(part / (percentage / 100));
}

export function calculateCombinedPercentage(percentage1: number, percentage2: number) {
  assertFinite(percentage1, "Vul twee geldige percentages in.");
  assertFinite(percentage2, "Vul twee geldige percentages in.");

  const p1 = percentage1 / 100;
  const p2 = percentage2 / 100;
  if (p1 < -1 || p2 < -1) {
    throw new Error("Een percentage lager dan -100% is niet toegestaan.");
  }
  return roundNumber(((1 + p1) * (1 + p2) - 1) * 100, 6);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

export function percentageToFraction(percentage: number): FractionResult {
  assertFinite(percentage, "Vul een geldig percentage of decimaal getal in.");
  const decimalValue = percentage / 100;
  if (!Number.isFinite(decimalValue)) {
    throw new Error("Vul een geldig percentage of decimaal getal in.");
  }

  const fixed = decimalValue.toFixed(10).replace(/\.?0+$/, "");
  if (fixed.includes("e") || fixed.includes("E")) {
    throw new Error("De waarde is te groot om als praktische breuk weer te geven.");
  }
  const [intPartRaw, fracPartRaw = ""] = fixed.split(".");
  const intPart = Number(intPartRaw);
  const denominator = 10 ** fracPartRaw.length;
  const numerator = intPart * denominator + Number(fracPartRaw || 0) * Math.sign(decimalValue || 1);
  const divisor = gcd(numerator, denominator);
  const reducedNumerator = numerator / divisor;
  const reducedDenominator = denominator / divisor;

  return {
    numerator: reducedNumerator,
    denominator: reducedDenominator,
    fraction: `${reducedNumerator}/${reducedDenominator}`,
    decimalValue: roundNumber(decimalValue, 10),
  };
}

export function calculateWeightedAverageRate(
  rows: Array<{ amount: number; ratePercent: number }>,
): WeightedRateResult {
  if (!rows.length) {
    throw new Error("Vul minimaal één bedrag en rentepercentage in.");
  }

  const normalized = rows
    .filter((row) => Number.isFinite(row.amount) && Number.isFinite(row.ratePercent))
    .map((row) => ({ amount: row.amount, ratePercent: row.ratePercent }));

  if (!normalized.length) {
    throw new Error("Vul minimaal één bedrag en rentepercentage in.");
  }

  let weightedSum = 0;
  let totalAmount = 0;
  const normalizedRows: WeightedRateRow[] = [];
  for (const row of normalized) {
    if (!(row.amount > 0)) {
      continue;
    }
    const contribution = row.amount * row.ratePercent;
    weightedSum += contribution;
    totalAmount += row.amount;
    normalizedRows.push({
      amount: roundMoney(row.amount),
      ratePercent: roundNumber(row.ratePercent, 6),
      weightedContribution: roundNumber(contribution, 6),
    });
  }

  if (!(totalAmount > 0)) {
    throw new Error("De som van de bedragen moet groter zijn dan 0.");
  }

  return {
    weightedRatePercent: roundNumber(weightedSum / totalAmount, 6),
    totalAmount: roundMoney(totalAmount),
    count: normalizedRows.length,
    rows: normalizedRows,
  };
}

export function toRoman(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    throw new Error("Vul een getal van 1 t/m 3999 of een geldig Romeins cijfer in.");
  }

  let remaining = value;
  let output = "";
  for (const row of ROMAN_TABLE) {
    while (remaining >= row.value) {
      output += row.symbol;
      remaining -= row.value;
    }
  }
  return output;
}

export function fromRoman(input: string) {
  const normalized = input.trim().replace(/\s+/g, "").toUpperCase();
  if (!normalized || !/^[IVXLCDM]+$/.test(normalized)) {
    throw new Error("Dit is geen geldige Romeinse notatie.");
  }

  let index = 0;
  let total = 0;
  while (index < normalized.length) {
    const two = normalized.slice(index, index + 2);
    const pair = ROMAN_TABLE.find((row) => row.symbol === two);
    if (pair) {
      total += pair.value;
      index += 2;
      continue;
    }
    const single = ROMAN_TABLE.find((row) => row.symbol === normalized[index]);
    if (!single) {
      throw new Error("Dit is geen geldige Romeinse notatie.");
    }
    total += single.value;
    index += 1;
  }

  if (total < 1 || total > 3999 || toRoman(total) !== normalized) {
    throw new Error("Dit is geen geldige Romeinse notatie.");
  }
  return total;
}

export function convertRomanOrArabic(input: string) {
  const normalized = input.trim();
  if (!normalized) {
    throw new Error("Vul een getal van 1 t/m 3999 of een geldig Romeins cijfer in.");
  }
  if (/^\d+$/.test(normalized)) {
    const number = Number(normalized);
    return {
      direction: "arabic-to-roman" as const,
      arabic: number,
      roman: toRoman(number),
    };
  }
  const arabic = fromRoman(normalized);
  return {
    direction: "roman-to-arabic" as const,
    arabic,
    roman: toRoman(arabic),
  };
}

export function calculateDcf(input: {
  cashflows: number[];
  discountRatePercent: number;
  terminalValue?: number;
}) {
  const cashflows = input.cashflows.filter((value) => Number.isFinite(value));
  if (!cashflows.length) {
    throw new Error("Vul minimaal één kasstroom in.");
  }
  assertFinite(input.discountRatePercent, "Vul een geldige WACC in.");
  const r = input.discountRatePercent / 100;
  if (r <= -1) {
    throw new Error("Vul een geldige WACC in.");
  }

  let presentValueCashflows = 0;
  const rows: DcfYearRow[] = [];
  for (let year = 1; year <= cashflows.length; year += 1) {
    const cashflow = cashflows[year - 1];
    const discountFactor = 1 / (1 + r) ** year;
    const presentValue = cashflow * discountFactor;
    presentValueCashflows += presentValue;
    rows.push({
      year,
      cashflow: roundMoney(cashflow),
      discountFactor: roundNumber(discountFactor, 6),
      presentValue: roundMoney(presentValue),
    });
  }

  const terminalValue = Number.isFinite(input.terminalValue) ? (input.terminalValue as number) : 0;
  const terminalDiscountFactor = 1 / (1 + r) ** cashflows.length;
  const presentValueTerminal = terminalValue * terminalDiscountFactor;
  const total = presentValueCashflows + presentValueTerminal;

  return {
    totalPresentValue: roundMoney(total),
    presentValueCashflows: roundMoney(presentValueCashflows),
    presentValueTerminal: roundMoney(presentValueTerminal),
    rows,
  } satisfies DcfResult;
}
