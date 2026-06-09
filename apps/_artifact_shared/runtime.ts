/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export type ToolProfile =
  | "annuity_payment"
  | "annuity_principal"
  | "annuity_term"
  | "present_value"
  | "present_value_annuity"
  | "future_value"
  | "compound_interest"
  | "simple_interest"
  | "effective_rate"
  | "nominal_rate"
  | "weighted_average_rate"
  | "percentage_of_total"
  | "value_from_percentage"
  | "linear_loan"
  | "indexed_amount"
  | "fraction_calculation"
  | "required_grade"
  | "average_grade"
  | "roman_numerals"
  | "dcf_valuation"
  | "percentage_composition"
  | "loan_amortization_schedule"
  | "revolving_credit_comparison"
  | "loan_total_cost"
  | "loan_amount_from_payment"
  | "installment_purchase_cost"
  | "financial_lease_payment"
  | "loan_remaining_balance_after_period"
  | "loan_term_months"
  | "loan_monthly_payment"
  | "max_loan_from_budget"
  | "personal_loan_comparison"
  | "loan_interest_rate"
  | "financial_lease_interest_rate"
  | "financial_lease_remaining_balance"
  | "loan_remaining_balance"
  | "student_loan_repayment"
  | "debt_growth"
  | "generic_contract";

export type GenericCalculationInput = Record<string, unknown>;

export type GenericCalculationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  profile: ToolProfile;
  outputs: Record<string, number | string | boolean | null>;
};

export type ProfileFixture = {
  input: GenericCalculationInput;
  expectValid: boolean;
};

const NAME_ALIASES = {
  principal: [
    "principal",
    "lening",
    "leenbedrag",
    "schuld",
    "hypotheek",
    "hypotheekbedrag",
    "financiering",
    "financieringsbedrag",
  ],
  payment: [
    "payment",
    "maandbedrag",
    "termijn",
    "termijnbedrag",
    "annuiteit",
    "maandtermijn",
    "inleg",
  ],
  annualRate: [
    "annualrate",
    "rente",
    "rentepercentage",
    "jaarpercentage",
    "jaarrente",
    "nominalerente",
  ],
  years: ["years", "looptijdjaren", "jaren", "looptijd"],
  periods: ["periods", "n", "looptijdmaanden", "maanden", "aantaltermijnen"],
  paymentsPerYear: ["paymentsperyear", "termijnenperjaar", "periodesperjaar"],
  futureValue: ["futurevalue", "toekomstigewaarde", "doelkapitaal", "eindkapitaal"],
  presentValue: ["presentvalue", "contantewaarde", "startbedrag", "startamount", "beginwaarde"],
  percentage: ["percentage", "rentepct", "index", "indexpercentage"],
  part: ["part", "deel", "bedrag", "bedragofgetal", "inputbedrag"],
  total: ["total", "totaal", "geheel", "basis", "grondslag"],
  amounts: ["amounts", "bedragen", "hoofdsommen", "wegingenbedrag"],
  rates: ["rates", "rentes", "percentages", "wegingenrente"],
  indexPercentages: ["indexpercentages", "indexreeks", "jaarlijkseindex"],
  decimalValue: ["decimalvalue", "decimaal", "decimal", "waarde"],
  numerator: ["numerator", "teller"],
  denominator: ["denominator", "noemer"],
  currentScores: ["currentscores", "scores", "cijfers", "behaaldecijfers"],
  currentWeights: ["currentweights", "weights", "wegingen", "behaaldewegingen"],
  targetScore: ["targetscore", "doelcijfer", "gewensteindcijfer", "gewenst"],
  totalWeight: ["totalweight", "totaalweging", "total", "totaal"],
  numberInput: ["numberinput", "arabisch", "getal", "number", "value"],
  romanInput: ["romaninput", "romeins", "romeinscijfer", "roman", "input"],
  cashflows: ["cashflows", "kasstromen", "cashflowreeks", "flows"],
  terminalValue: ["terminalvalue", "eindwaarde", "restwaarde"],
  percentage1: ["percentage1", "pct1", "eerstepercentage", "p1"],
  percentage2: ["percentage2", "pct2", "tweedepercentage", "p2"],
} as const;

function round(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeKey(key: string) {
  return key
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readNumber(input: GenericCalculationInput, aliases: readonly string[]): number | undefined {
  const normalizedEntries = Object.entries(input).map(([key, value]) => [normalizeKey(key), value] as const);
  for (const alias of aliases) {
    const aliasKey = normalizeKey(alias);
    const direct = normalizedEntries.find(([key]) => key === aliasKey);
    if (!direct) continue;
    const parsed = toNumber(direct[1]);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
}

function parseSeries(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map((entry) => toNumber(entry)).filter((entry): entry is number => entry !== undefined);
  }
  if (typeof value === "string") {
    return value
      .split(/[;,|]/g)
      .map((part) => toNumber(part))
      .filter((entry): entry is number => entry !== undefined);
  }
  return [];
}

function readSeries(input: GenericCalculationInput, aliases: readonly string[]): number[] {
  const normalizedEntries = Object.entries(input).map(([key, value]) => [normalizeKey(key), value] as const);
  for (const alias of aliases) {
    const aliasKey = normalizeKey(alias);
    const direct = normalizedEntries.find(([key]) => key === aliasKey);
    if (!direct) continue;
    const parsed = parseSeries(direct[1]);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

function readString(input: GenericCalculationInput, aliases: readonly string[]): string | undefined {
  const normalizedEntries = Object.entries(input).map(([key, value]) => [normalizeKey(key), value] as const);
  for (const alias of aliases) {
    const aliasKey = normalizeKey(alias);
    const direct = normalizedEntries.find(([key]) => key === aliasKey);
    if (!direct) continue;
    const value = direct[1];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

function gcd(a: number, b: number) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function continuedFractionApproximation(value: number, maxDenominator = 1_000_000) {
  const sign = value < 0 ? -1 : 1;
  let x = Math.abs(value);
  let hPrev = 0;
  let h = 1;
  let kPrev = 1;
  let k = 0;

  while (true) {
    const a = Math.floor(x);
    const hNext = a * h + hPrev;
    const kNext = a * k + kPrev;

    if (kNext > maxDenominator || !Number.isFinite(hNext) || !Number.isFinite(kNext)) break;

    hPrev = h;
    h = hNext;
    kPrev = k;
    k = kNext;

    const remainder = x - a;
    if (remainder < 1e-12) break;
    x = 1 / remainder;
  }

  if (k === 0) return { numerator: sign, denominator: 1 };
  return { numerator: sign * h, denominator: k };
}

function toReducedFraction(value: number, maxDecimals = 10, maxDenominator = 1_000_000) {
  if (value === 0) return { numerator: 0, denominator: 1 };

  const sign = value < 0 ? -1 : 1;
  const absValue = Math.abs(value);
  const normalized = absValue.toFixed(maxDecimals).replace(/0+$/g, "").replace(/\.$/g, "");
  const decimalIndex = normalized.indexOf(".");
  const decimals = decimalIndex >= 0 ? normalized.length - decimalIndex - 1 : 0;
  let denominator = 10 ** decimals;
  let numerator = Math.round(absValue * denominator);

  const divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;

  if (denominator > maxDenominator) {
    const approx = continuedFractionApproximation(value, maxDenominator);
    return {
      numerator: approx.numerator,
      denominator: approx.denominator,
      approximated: true,
    };
  }

  return { numerator: sign * numerator, denominator, approximated: false };
}

const ROMAN_TABLE = [
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

function arabicToRoman(value: number) {
  let remainder = value;
  let result = "";
  for (const entry of ROMAN_TABLE) {
    while (remainder >= entry.value) {
      result += entry.symbol;
      remainder -= entry.value;
    }
  }
  return result;
}

function romanToArabic(roman: string) {
  const normalized = roman.toUpperCase();
  const validChars = /^[IVXLCDM]+$/;
  if (!validChars.test(normalized)) return undefined;

  const valueByChar: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    const current = valueByChar[normalized[i]];
    const next = valueByChar[normalized[i + 1]];
    if (next && current < next) total -= current;
    else total += current;
  }

  if (total < 1 || total > 3999) return undefined;
  const canonical = arabicToRoman(total);
  if (canonical !== normalized) return undefined;

  return total;
}

function getPeriods(input: GenericCalculationInput) {
  const directPeriods = readNumber(input, NAME_ALIASES.periods);
  if (directPeriods !== undefined && directPeriods > 0) return Math.round(directPeriods);
  const years = readNumber(input, NAME_ALIASES.years);
  const paymentsPerYear = Math.max(1, Math.round(readNumber(input, NAME_ALIASES.paymentsPerYear) ?? 12));
  if (years !== undefined && years > 0) return Math.round(years * paymentsPerYear);
  return undefined;
}

function getPaymentsPerYear(input: GenericCalculationInput) {
  const value = readNumber(input, NAME_ALIASES.paymentsPerYear);
  if (value === undefined || value <= 0) return 12;
  return Math.max(1, Math.round(value));
}

function getAnnualRate(input: GenericCalculationInput) {
  return readNumber(input, NAME_ALIASES.annualRate) ?? readNumber(input, NAME_ALIASES.percentage);
}

function monthlyRateFromAnnual(annualRatePercentage: number) {
  return annualRatePercentage / 100 / 12;
}

function annuityPaymentAmount(principal: number, monthlyRate: number, periods: number) {
  if (monthlyRate === 0) return principal / periods;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -periods);
}

function annuityPrincipalAmount(payment: number, monthlyRate: number, periods: number) {
  if (monthlyRate === 0) return payment * periods;
  return (payment * (1 - (1 + monthlyRate) ** -periods)) / monthlyRate;
}

function validateLoanBounds({
  principal,
  annualRate,
  periods,
}: {
  principal?: number;
  annualRate?: number;
  periods?: number;
}) {
  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een positief leenbedrag in.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  return errors;
}

function simulateDebtWithFixedPayment({
  principal,
  monthlyRate,
  monthlyPayment,
  months,
  maxMonths = 2400,
}: {
  principal: number;
  monthlyRate: number;
  monthlyPayment: number;
  months: number;
  maxMonths?: number;
}) {
  if (months > maxMonths) {
    return {
      error: "De looptijd is te lang voor deze berekening.",
    } as const;
  }

  let remaining = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let totalPrincipalPaid = 0;
  let paidMonths = 0;
  let lastPayment = 0;

  for (let month = 1; month <= months; month += 1) {
    if (remaining <= 0) break;

    const interest = remaining * monthlyRate;
    if (monthlyRate > 0 && monthlyPayment <= interest + 1e-12) {
      return {
        error: "De maandbetaling is te laag om de schuld af te lossen.",
      } as const;
    }

    let principalPart = monthlyPayment - interest;
    let paidThisMonth = monthlyPayment;

    if (principalPart >= remaining) {
      principalPart = remaining;
      paidThisMonth = interest + principalPart;
    }

    remaining = Math.max(0, remaining - principalPart);
    totalInterest += interest;
    totalPaid += paidThisMonth;
    totalPrincipalPaid += principalPart;
    paidMonths += 1;
    lastPayment = paidThisMonth;
  }

  return {
    remaining,
    totalInterest,
    totalPaid,
    totalPrincipalPaid,
    paidMonths,
    lastPayment,
  } as const;
}

function solveMonthlyRateByPayment({
  principal,
  payment,
  periods,
  maxAnnualRatePercentage = 100,
}: {
  principal: number;
  payment: number;
  periods: number;
  maxAnnualRatePercentage?: number;
}) {
  const minPaymentAtZeroRate = principal / periods;
  if (payment < minPaymentAtZeroRate - 1e-9) return undefined;
  if (Math.abs(payment - minPaymentAtZeroRate) <= 1e-9) return 0;

  const highRate = maxAnnualRatePercentage / 100 / 12;
  const paymentAtHigh = annuityPaymentAmount(principal, highRate, periods);
  if (payment > paymentAtHigh + 1e-9) return undefined;

  let low = 0;
  let high = highRate;
  for (let i = 0; i < 120; i += 1) {
    const mid = (low + high) / 2;
    const midPayment = annuityPaymentAmount(principal, mid, periods);
    if (midPayment > payment) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

function solveMonthlyRateForFinancialLease({
  financing,
  monthlyPayment,
  residualValue,
  periods,
  maxAnnualRatePercentage = 100,
}: {
  financing: number;
  monthlyPayment: number;
  residualValue: number;
  periods: number;
  maxAnnualRatePercentage?: number;
}) {
  const presentValueAtZero = (monthlyPayment * periods) + residualValue;
  if (presentValueAtZero < financing - 1e-9) return undefined;
  if (Math.abs(presentValueAtZero - financing) <= 1e-9) return 0;

  const pvForRate = (monthlyRate: number) => {
    if (monthlyRate === 0) return presentValueAtZero;
    return (
      (monthlyPayment * (1 - (1 + monthlyRate) ** -periods)) / monthlyRate +
      residualValue / (1 + monthlyRate) ** periods
    );
  };

  const highRate = maxAnnualRatePercentage / 100 / 12;
  const presentValueAtHigh = pvForRate(highRate);
  if (presentValueAtHigh > financing + 1e-9) return undefined;

  let low = 0;
  let high = highRate;
  for (let i = 0; i < 120; i += 1) {
    const mid = (low + high) / 2;
    const pv = pvForRate(mid);
    if (pv > financing) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function invalid(profile: ToolProfile, errors: string[]): GenericCalculationResult {
  return {
    isValid: false,
    errors,
    warnings: [],
    profile,
    outputs: {},
  };
}

function annuityPayment(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);
  const perYear = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een positief leenbedrag in.");
  if (annualRate === undefined || annualRate < 0) errors.push("Vul een geldig rentepercentage in.");
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const r = (annualRate / 100) / perYear;
  const payment = r === 0 ? principal / periods : (principal * r) / (1 - (1 + r) ** -periods);
  const totalPaid = payment * periods;
  const totalInterest = totalPaid - principal;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      payment: round(payment),
      periods,
      annualRate: round(annualRate, 4),
      totalPaid: round(totalPaid),
      totalInterest: round(totalInterest),
    },
  };
}

function annuityPrincipal(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const payment = readNumber(input, NAME_ALIASES.payment);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);
  const perYear = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (payment === undefined || payment <= 0) errors.push("Vul een positief termijnbedrag in.");
  if (annualRate === undefined || annualRate < 0) errors.push("Vul een geldig rentepercentage in.");
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const r = (annualRate / 100) / perYear;
  const principal = r === 0 ? payment * periods : (payment * (1 - (1 + r) ** -periods)) / r;
  const totalPaid = payment * periods;
  const totalInterest = totalPaid - principal;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      principal: round(principal),
      periods,
      totalPaid: round(totalPaid),
      totalInterest: round(totalInterest),
    },
  };
}

function annuityTerm(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const payment = readNumber(input, NAME_ALIASES.payment);
  const annualRate = getAnnualRate(input);
  const perYear = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een positief leenbedrag in.");
  if (payment === undefined || payment <= 0) errors.push("Vul een positief termijnbedrag in.");
  if (annualRate === undefined || annualRate < 0) errors.push("Vul een geldig rentepercentage in.");
  if (errors.length > 0) return invalid(profile, errors);

  const r = (annualRate / 100) / perYear;
  let periods: number;
  if (r === 0) {
    periods = principal / payment;
  } else {
    if (payment <= principal * r) {
      return invalid(profile, ["De termijn is te laag om de lening af te lossen."]);
    }
    periods = -Math.log(1 - (principal * r) / payment) / Math.log(1 + r);
  }

  if (!Number.isFinite(periods) || periods <= 0) {
    return invalid(profile, ["De looptijd kon niet worden berekend."]);
  }

  const periodsRounded = Math.ceil(periods);
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      periods: periodsRounded,
      years: round(periodsRounded / perYear, 2),
      payment: round(payment),
      principal: round(principal),
    },
  };
}

function presentValue(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const futureValue = readNumber(input, NAME_ALIASES.futureValue) ?? readNumber(input, NAME_ALIASES.total);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input) ?? Math.round(readNumber(input, NAME_ALIASES.years) ?? 0);
  const perYear = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (futureValue === undefined) errors.push("Vul een geldige toekomstige waarde in.");
  if (annualRate === undefined) errors.push("Vul een geldig rendement in.");
  if (!periods || periods <= 0) errors.push("Vul een positieve periode in.");
  if (errors.length > 0) return invalid(profile, errors);

  const r = (annualRate / 100) / perYear;
  if (1 + r <= 0) return invalid(profile, ["Het rendement per periode moet groter zijn dan -100%."]);
  const pv = futureValue / (1 + r) ** periods;
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      presentValue: round(pv),
      futureValue: round(futureValue),
      discountFactor: round(1 / (1 + r) ** periods, 6),
      periods,
    },
  };
}

function presentValueAnnuity(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const payment = readNumber(input, NAME_ALIASES.payment);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);
  const perYear = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (payment === undefined) errors.push("Vul een geldig betalingsbedrag in.");
  if (annualRate === undefined) errors.push("Vul een geldig rendement in.");
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const r = (annualRate / 100) / perYear;
  if (1 + r <= 0) return invalid(profile, ["Het rendement per periode moet groter zijn dan -100%."]);
  const pv = r === 0 ? payment * periods : payment * (1 - (1 + r) ** -periods) / r;
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      presentValue: round(pv),
      payment: round(payment),
      periods,
    },
  };
}

function futureValue(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const present = readNumber(input, NAME_ALIASES.presentValue) ?? readNumber(input, NAME_ALIASES.principal) ?? 0;
  const payment = readNumber(input, NAME_ALIASES.payment) ?? 0;
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);
  const perYear = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (annualRate === undefined) errors.push("Vul een geldig rendement in.");
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const r = (annualRate / 100) / perYear;
  if (1 + r <= 0) return invalid(profile, ["Het rendement per periode moet groter zijn dan -100%."]);
  const fvPrincipal = present * (1 + r) ** periods;
  const fvAnnuity = r === 0 ? payment * periods : payment * (((1 + r) ** periods - 1) / r);
  const fv = fvPrincipal + fvAnnuity;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      futureValue: round(fv),
      totalContributions: round(present + payment * periods),
      gain: round(fv - (present + payment * periods)),
      periods,
    },
  };
}

function simpleInterest(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const years = readNumber(input, NAME_ALIASES.years) ?? (getPeriods(input) ?? 0) / getPaymentsPerYear(input);

  const errors: string[] = [];
  if (principal === undefined) errors.push("Vul een geldige hoofdsom in.");
  if (annualRate === undefined) errors.push("Vul een geldig rentepercentage in.");
  if (!Number.isFinite(years) || years <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const interest = principal * (annualRate / 100) * years;
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      interest: round(interest),
      futureValue: round(principal + interest),
      years: round(years, 4),
    },
  };
}

function compoundInterest(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const years = readNumber(input, NAME_ALIASES.years) ?? (getPeriods(input) ?? 0) / getPaymentsPerYear(input);
  const m = getPaymentsPerYear(input);

  const errors: string[] = [];
  if (principal === undefined) errors.push("Vul een geldige hoofdsom in.");
  if (annualRate === undefined) errors.push("Vul een geldig rentepercentage in.");
  if (!Number.isFinite(years) || years <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const ratePerPeriod = (annualRate / 100) / m;
  if (1 + ratePerPeriod <= 0) return invalid(profile, ["Het rendement per periode moet groter zijn dan -100%."]);
  const fv = principal * (1 + ratePerPeriod) ** (years * m);
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      futureValue: round(fv),
      interest: round(fv - principal),
      compoundingPerYear: m,
    },
  };
}

function effectiveRate(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const nominalRate = readNumber(input, NAME_ALIASES.annualRate);
  const m = getPaymentsPerYear(input);
  if (nominalRate === undefined) return invalid(profile, ["Vul een geldige nominale rente in."]);
  const effective = (1 + (nominalRate / 100) / m) ** m - 1;
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      nominalRate: round(nominalRate, 4),
      effectiveRate: round(effective * 100, 4),
      periodsPerYear: m,
    },
  };
}

function nominalRate(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const effectiveRateInput = readNumber(input, NAME_ALIASES.annualRate) ?? readNumber(input, NAME_ALIASES.percentage);
  const m = getPaymentsPerYear(input);
  if (effectiveRateInput === undefined) return invalid(profile, ["Vul een geldige effectieve rente in."]);
  const nominal = ((1 + effectiveRateInput / 100) ** (1 / m) - 1) * m;
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      effectiveRate: round(effectiveRateInput, 4),
      nominalRate: round(nominal * 100, 4),
      periodsPerYear: m,
    },
  };
}

function weightedAverageRate(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const amounts = readSeries(input, NAME_ALIASES.amounts);
  const rates = readSeries(input, NAME_ALIASES.rates);
  if (amounts.length === 0 || rates.length === 0 || amounts.length !== rates.length) {
    return invalid(profile, ["Vul evenveel bedragen als percentages in."]);
  }
  const weightedNom = amounts.reduce((sum, amount, index) => sum + amount * rates[index], 0);
  const weightedDen = amounts.reduce((sum, amount) => sum + amount, 0);
  if (weightedDen === 0) return invalid(profile, ["Het totaal van de bedragen mag niet 0 zijn."]);
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      weightedAverageRate: round(weightedNom / weightedDen, 6),
      totalAmount: round(weightedDen),
      inputs: amounts.length,
    },
  };
}

function percentageOfTotal(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const part = readNumber(input, NAME_ALIASES.part);
  const total = readNumber(input, NAME_ALIASES.total);
  if (part === undefined) return invalid(profile, ["Vul een geldig deel in."]);
  if (total === undefined || total === 0) return invalid(profile, ["Het totaal mag niet 0 zijn."]);
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      part: round(part),
      total: round(total),
      percentage: round((part / total) * 100, 6),
    },
  };
}

function valueFromPercentage(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const part = readNumber(input, NAME_ALIASES.part);
  const percentage = readNumber(input, NAME_ALIASES.percentage) ?? readNumber(input, NAME_ALIASES.annualRate);
  if (part === undefined) return invalid(profile, ["Vul een geldig bedrag of getal in."]);
  if (percentage === undefined || percentage === 0) return invalid(profile, ["Het percentage mag niet 0 zijn."]);
  const total = part / (percentage / 100);
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      part: round(part),
      percentage: round(percentage, 6),
      total: round(total),
    },
  };
}

function linearLoan(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);
  const perYear = getPaymentsPerYear(input);
  if (principal === undefined || principal <= 0) return invalid(profile, ["Vul een positief leenbedrag in."]);
  if (annualRate === undefined || annualRate < 0) return invalid(profile, ["Vul een geldig rentepercentage in."]);
  if (periods === undefined || periods <= 0) return invalid(profile, ["Vul een positieve looptijd in."]);

  const r = (annualRate / 100) / perYear;
  const principalPart = principal / periods;
  const firstInterest = principal * r;
  const firstPayment = principalPart + firstInterest;
  const totalInterest = principal * r * (periods + 1) / 2;
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      firstPayment: round(firstPayment),
      principalPart: round(principalPart),
      totalInterest: round(totalInterest),
      totalPaid: round(principal + totalInterest),
      periods,
    },
  };
}

function indexedAmount(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const startAmount = readNumber(input, NAME_ALIASES.presentValue) ?? readNumber(input, NAME_ALIASES.part);
  const indexSeries = readSeries(input, NAME_ALIASES.indexPercentages);
  const singleIndex = readNumber(input, NAME_ALIASES.percentage);
  const years = Math.round(readNumber(input, NAME_ALIASES.years) ?? 0);
  if (startAmount === undefined || startAmount < 0) return invalid(profile, ["Vul een geldig startbedrag in."]);
  const rates = indexSeries.length > 0 ? indexSeries : (singleIndex !== undefined && years > 0 ? Array.from({ length: years }, () => singleIndex) : []);
  if (rates.length === 0) return invalid(profile, ["Vul één of meer indexpercentages in."]);
  let amount = startAmount;
  for (const rate of rates) {
    amount *= 1 + rate / 100;
  }
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      startAmount: round(startAmount),
      endAmount: round(amount),
      years: rates.length,
      totalIncreasePercent: round(((amount / startAmount) - 1) * 100, 4),
    },
  };
}

function fractionCalculation(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const percentageInput = readNumber(input, NAME_ALIASES.percentage);
  const decimalInput = readNumber(input, NAME_ALIASES.decimalValue) ?? readNumber(input, NAME_ALIASES.part);

  if (percentageInput === undefined && decimalInput === undefined) {
    return invalid(profile, ["Vul een geldig percentage of decimaal getal in."]);
  }

  const value = percentageInput !== undefined ? percentageInput / 100 : decimalInput;
  if (value === undefined || !Number.isFinite(value)) {
    return invalid(profile, ["Vul een geldig percentage of decimaal getal in."]);
  }
  if (Math.abs(value) > 1e12) {
    return invalid(profile, ["De waarde is te groot om als praktische breuk weer te geven."]);
  }

  const fraction = toReducedFraction(value, 10, 1_000_000);
  return {
    isValid: true,
    errors: [],
    warnings: fraction.approximated ? ["De breuk is benaderd met een maximale noemer van 1.000.000."] : [],
    profile,
    outputs: {
      fraction: `${fraction.numerator}/${fraction.denominator}`,
      numerator: fraction.numerator,
      denominator: fraction.denominator,
      decimalValue: round(value, 10),
      percentageValue: round(value * 100, 6),
      verificationValue: round(fraction.numerator / fraction.denominator, 10),
    },
  };
}

function requiredGrade(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const targetScore = readNumber(input, NAME_ALIASES.targetScore) ?? readNumber(input, NAME_ALIASES.part);
  const totalWeight = readNumber(input, NAME_ALIASES.totalWeight) ?? 100;
  const scores = readSeries(input, NAME_ALIASES.currentScores);
  const weights = readSeries(input, NAME_ALIASES.currentWeights);

  if (targetScore === undefined || !Number.isFinite(targetScore) || targetScore < 1 || targetScore > 10) {
    return invalid(profile, ["Vul een geldig gewenst eindcijfer in."]);
  }
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return invalid(profile, ["Vul geldige cijfers en wegingen in."]);
  }
  if (scores.length === 0 || weights.length === 0 || scores.length !== weights.length) {
    return invalid(profile, ["Vul geldige cijfers en wegingen in."]);
  }

  const invalidRow = scores.some((score, index) => score < 1 || score > 10 || !Number.isFinite(score) || weights[index] <= 0 || !Number.isFinite(weights[index]));
  if (invalidRow) return invalid(profile, ["Vul geldige cijfers en wegingen in."]);

  const usedWeight = weights.reduce((sum, value) => sum + value, 0);
  const remainingWeight = totalWeight - usedWeight;
  if (remainingWeight <= 0) {
    return invalid(profile, ["Er moet nog een resterende weging zijn."]);
  }

  const achievedPoints = scores.reduce((sum, score, index) => sum + score * weights[index], 0);
  const required = ((targetScore * totalWeight) - achievedPoints) / remainingWeight;
  const feasible = required >= 1 && required <= 10;

  return {
    isValid: true,
    errors: [],
    warnings: feasible ? [] : ["Het benodigde cijfer ligt buiten de mogelijke cijferschaal."],
    profile,
    outputs: {
      targetScore: round(targetScore, 2),
      totalWeight: round(totalWeight, 2),
      usedWeight: round(usedWeight, 2),
      remainingWeight: round(remainingWeight, 2),
      requiredScore: round(required, 4),
      feasible,
      currentWeightedAverage: round(achievedPoints / usedWeight, 4),
    },
  };
}

function averageGrade(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const scores = readSeries(input, NAME_ALIASES.currentScores);
  const weights = readSeries(input, NAME_ALIASES.currentWeights);

  if (scores.length === 0) return invalid(profile, ["Vul minimaal één cijfer in."]);
  if (scores.some((score) => !Number.isFinite(score) || score < 1 || score > 10)) {
    return invalid(profile, ["Vul geldige cijfers in."]);
  }

  const hasWeights = weights.length > 0;
  if (hasWeights) {
    if (weights.length !== scores.length) return invalid(profile, ["Vul geldige positieve wegingen in."]);
    if (weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) {
      return invalid(profile, ["Vul geldige positieve wegingen in."]);
    }
  }

  let average: number;
  let totalWeight: number;
  if (hasWeights) {
    totalWeight = weights.reduce((sum, value) => sum + value, 0);
    if (totalWeight <= 0) return invalid(profile, ["Vul geldige positieve wegingen in."]);
    const weightedPoints = scores.reduce((sum, score, index) => sum + score * weights[index], 0);
    average = weightedPoints / totalWeight;
  } else {
    totalWeight = scores.length;
    average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      averageScore: round(average, 4),
      roundedToOneDecimal: round(average, 1),
      count: scores.length,
      weighted: hasWeights,
      totalWeight: round(totalWeight, 4),
    },
  };
}

function romanNumerals(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const numberInput = readNumber(input, NAME_ALIASES.numberInput);
  const romanInput = readString(input, NAME_ALIASES.romanInput);

  if (numberInput !== undefined) {
    if (!Number.isInteger(numberInput) || numberInput < 1 || numberInput > 3999) {
      return invalid(profile, ["Vul een getal van 1 t/m 3999 of een geldig Romeins cijfer in."]);
    }
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        arabicNumber: numberInput,
        romanNumeral: arabicToRoman(numberInput),
        direction: "arabisch-naar-romeins",
      },
    };
  }

  if (romanInput) {
    const parsed = romanToArabic(romanInput);
    if (parsed === undefined) {
      return invalid(profile, ["Dit is geen geldige Romeinse notatie."]);
    }
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        arabicNumber: parsed,
        romanNumeral: arabicToRoman(parsed),
        direction: "romeins-naar-arabisch",
      },
    };
  }

  return invalid(profile, ["Vul een getal van 1 t/m 3999 of een geldig Romeins cijfer in."]);
}

function dcfValuation(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const wacc = readNumber(input, NAME_ALIASES.annualRate);
  const cashflows = readSeries(input, NAME_ALIASES.cashflows);
  const terminalValue = readNumber(input, NAME_ALIASES.terminalValue) ?? 0;

  if (wacc === undefined || !Number.isFinite(wacc)) return invalid(profile, ["Vul een geldige WACC in."]);
  if (wacc <= -100) return invalid(profile, ["De WACC moet hoger zijn dan -100%."]);
  if (cashflows.length === 0) return invalid(profile, ["Vul minimaal één kasstroom in."]);
  if (cashflows.length > 100) return invalid(profile, ["De horizon is te lang voor deze berekening."]);
  if (cashflows.some((value) => !Number.isFinite(value))) return invalid(profile, ["Vul minimaal één kasstroom in."]);

  const discountRate = wacc / 100;
  let pvCashflows = 0;
  for (let year = 1; year <= cashflows.length; year += 1) {
    pvCashflows += cashflows[year - 1] / (1 + discountRate) ** year;
  }
  const pvTerminal = terminalValue / (1 + discountRate) ** cashflows.length;
  const totalValue = pvCashflows + pvTerminal;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      dcfValue: round(totalValue),
      presentValueCashflows: round(pvCashflows),
      presentValueTerminal: round(pvTerminal),
      waccPercentage: round(wacc, 6),
      horizonYears: cashflows.length,
    },
  };
}

function percentageComposition(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const percentage1 = readNumber(input, NAME_ALIASES.percentage1) ?? readNumber(input, NAME_ALIASES.part);
  const percentage2 = readNumber(input, NAME_ALIASES.percentage2) ?? readNumber(input, NAME_ALIASES.total);

  if (percentage1 === undefined || percentage2 === undefined) {
    return invalid(profile, ["Vul twee geldige percentages in."]);
  }
  if (percentage1 < -100 || percentage2 < -100) {
    return invalid(profile, ["Een percentage lager dan -100% is niet toegestaan."]);
  }

  const factor1 = 1 + (percentage1 / 100);
  const factor2 = 1 + (percentage2 / 100);
  const compositeFactor = factor1 * factor2;
  const compositePercentage = (compositeFactor - 1) * 100;
  const sumPercentagePoints = percentage1 + percentage2;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      percentage1: round(percentage1, 6),
      percentage2: round(percentage2, 6),
      compositeFactor: round(compositeFactor, 8),
      compositePercentage: round(compositePercentage, 6),
      sumPercentagePoints: round(sumPercentagePoints, 6),
      compositionDifference: round(compositePercentage - sumPercentagePoints, 6),
    },
  };
}

function loanAmortizationSchedule(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);

  const errors = validateLoanBounds({ principal, annualRate, periods });
  if (periods !== undefined && periods > 1200) errors.push("De looptijd is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  const monthlyPayment = annuityPaymentAmount(principal, monthlyRate, periods);
  const simulation = simulateDebtWithFixedPayment({
    principal,
    monthlyRate,
    monthlyPayment,
    months: periods,
    maxMonths: 1200,
  });
  if ("error" in simulation) return invalid(profile, [simulation.error]);

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      monthlyPayment: round(monthlyPayment),
      periods,
      totalPaid: round(simulation.totalPaid),
      totalInterest: round(simulation.totalInterest),
      endRemainingBalance: round(simulation.remaining),
    },
  };
}

function revolvingCreditComparison(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal =
    readNumber(input, ["principal", "restschuld", "schuld", "leenbedrag"]) ??
    readNumber(input, ["oldPrincipal"]);
  const oldAnnualRate = readNumber(input, ["oldAnnualRate", "oudeRente", "renteOud"]);
  const newAnnualRate = readNumber(input, ["newAnnualRate", "nieuweRente", "renteNieuw"]);
  const oldMonthlyPayment = readNumber(input, ["oldMonthlyPayment", "maandbetalingOud", "payment"]);
  const newMonthlyPayment =
    readNumber(input, ["newMonthlyPayment", "maandbetalingNieuw"]) ?? oldMonthlyPayment;

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een geldige restschuld in.");
  if (oldAnnualRate === undefined || oldAnnualRate < 0 || oldAnnualRate > 100) {
    errors.push("Vul een geldige oude rente in.");
  }
  if (newAnnualRate === undefined || newAnnualRate < 0 || newAnnualRate > 100) {
    errors.push("Vul een geldige nieuwe rente in.");
  }
  if (oldMonthlyPayment === undefined || oldMonthlyPayment <= 0) {
    errors.push("Vul een geldige maandbetaling in voor het oude krediet.");
  }
  if (newMonthlyPayment === undefined || newMonthlyPayment <= 0) {
    errors.push("Vul een geldige maandbetaling in voor het nieuwe krediet.");
  }
  if (errors.length > 0) return invalid(profile, errors);

  const oldSimulation = simulateDebtWithFixedPayment({
    principal,
    monthlyRate: monthlyRateFromAnnual(oldAnnualRate),
    monthlyPayment: oldMonthlyPayment,
    months: 2400,
    maxMonths: 2400,
  });
  if ("error" in oldSimulation) return invalid(profile, [oldSimulation.error]);

  const newSimulation = simulateDebtWithFixedPayment({
    principal,
    monthlyRate: monthlyRateFromAnnual(newAnnualRate),
    monthlyPayment: newMonthlyPayment,
    months: 2400,
    maxMonths: 2400,
  });
  if ("error" in newSimulation) return invalid(profile, [newSimulation.error]);

  if (oldSimulation.remaining > 0 || newSimulation.remaining > 0) {
    return invalid(profile, ["De looptijd overschrijdt de maximale simulatieduur."]);
  }

  const savingsInterest = oldSimulation.totalInterest - newSimulation.totalInterest;
  const savingsTotal = oldSimulation.totalPaid - newSimulation.totalPaid;
  const advice =
    savingsTotal > 0
      ? "Nieuw krediet lijkt voordeliger."
      : savingsTotal < 0
        ? "Bestaand krediet lijkt voordeliger."
        : "Beide kredieten zijn vergelijkbaar.";

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      oldTermMonths: oldSimulation.paidMonths,
      newTermMonths: newSimulation.paidMonths,
      oldTotalInterest: round(oldSimulation.totalInterest),
      newTotalInterest: round(newSimulation.totalInterest),
      savingsInterest: round(savingsInterest),
      savingsTotal: round(savingsTotal),
      advice,
    },
  };
}

function loanTotalCost(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);

  const errors = validateLoanBounds({ principal, annualRate, periods });
  if (periods !== undefined && periods > 1200) errors.push("De looptijd is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyPayment = annuityPaymentAmount(principal, monthlyRateFromAnnual(annualRate), periods);
  const totalPaid = monthlyPayment * periods;
  const loanCosts = totalPaid - principal;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      monthlyPayment: round(monthlyPayment),
      totalPaid: round(totalPaid),
      loanCosts: round(loanCosts),
      loanCostPercentage: round((loanCosts / principal) * 100, 6),
      periods,
    },
  };
}

function loanAmountFromPayment(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const payment = readNumber(input, NAME_ALIASES.payment);
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);

  const errors: string[] = [];
  if (payment === undefined || payment <= 0) errors.push("Vul een positief maandbedrag in.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (periods !== undefined && periods > 1200) errors.push("De looptijd is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const principal = annuityPrincipalAmount(payment, monthlyRateFromAnnual(annualRate), periods);
  const totalPaid = payment * periods;
  const totalInterest = totalPaid - principal;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      loanAmount: round(principal),
      monthlyPayment: round(payment),
      totalPaid: round(totalPaid),
      totalInterest: round(totalInterest),
      periods,
    },
  };
}

function installmentPurchaseCost(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const purchasePrice = readNumber(input, ["purchasePrice", "aankoopbedrag"]);
  const downPayment = readNumber(input, ["downPayment", "aanbetaling"]) ?? 0;
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);

  const errors: string[] = [];
  if (purchasePrice === undefined || purchasePrice <= 0) errors.push("Vul een geldig aankoopbedrag in.");
  if (downPayment < 0) errors.push("Aanbetaling mag niet negatief zijn.");
  if (purchasePrice !== undefined && downPayment > purchasePrice) {
    errors.push("Aanbetaling mag niet hoger zijn dan het aankoopbedrag.");
  }
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const financingAmount = purchasePrice - downPayment;
  const monthlyPayment =
    financingAmount === 0
      ? 0
      : annuityPaymentAmount(financingAmount, monthlyRateFromAnnual(annualRate), periods);
  const totalInstallments = monthlyPayment * periods;
  const totalPaid = downPayment + totalInstallments;
  const extraCosts = totalPaid - purchasePrice;
  const totalInterest = totalInstallments - financingAmount;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      financingAmount: round(financingAmount),
      monthlyPayment: round(monthlyPayment),
      totalPaid: round(totalPaid),
      extraCosts: round(extraCosts),
      totalInterest: round(totalInterest),
      periods,
    },
  };
}

function financialLeasePayment(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const purchasePrice = readNumber(input, ["purchasePrice", "aanschafwaarde"]);
  const downPayment = readNumber(input, ["downPayment", "aanbetaling"]) ?? 0;
  const residualValue = readNumber(input, ["residualValue", "slottermijn", "restwaarde"]) ?? 0;
  const annualRate = getAnnualRate(input);
  const periods = getPeriods(input);

  const errors: string[] = [];
  if (purchasePrice === undefined || purchasePrice <= 0) errors.push("Vul een geldige aanschafwaarde in.");
  if (downPayment < 0) errors.push("Aanbetaling mag niet negatief zijn.");
  if (purchasePrice !== undefined && downPayment > purchasePrice) {
    errors.push("Aanbetaling mag niet hoger zijn dan de aanschafwaarde.");
  }
  if (residualValue < 0) errors.push("Slottermijn mag niet negatief zijn.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (periods === undefined || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const financingAmount = purchasePrice - downPayment;
  if (residualValue > financingAmount) {
    return invalid(profile, ["Slottermijn mag niet hoger zijn dan het financieringsbedrag."]);
  }

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  const monthlyPayment =
    monthlyRate === 0
      ? (financingAmount - residualValue) / periods
      : ((financingAmount - residualValue / (1 + monthlyRate) ** periods) * monthlyRate) /
        (1 - (1 + monthlyRate) ** -periods);
  const totalPaid = downPayment + (monthlyPayment * periods) + residualValue;
  const totalInterest = totalPaid - purchasePrice;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      leasePaymentPerMonth: round(monthlyPayment),
      financingAmount: round(financingAmount),
      residualValue: round(residualValue),
      totalPaid: round(totalPaid),
      totalInterest: round(totalInterest),
      periods,
    },
  };
}

function loanRemainingBalanceAfterPeriod(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const payment = readNumber(input, NAME_ALIASES.payment);
  const annualRate = getAnnualRate(input);
  const monthsPaid = Math.round(readNumber(input, ["monthsPaid", "verstrekenMaanden", "periode"]) ?? 0);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een geldige beginschuld in.");
  if (payment === undefined || payment <= 0) errors.push("Vul een geldige maandbetaling in.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (!Number.isFinite(monthsPaid) || monthsPaid < 0) errors.push("Vul een geldige periode in maanden in.");
  if (monthsPaid > 2400) errors.push("De periode is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  if (monthsPaid === 0) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        remainingBalance: round(principal),
        monthsPaid: 0,
        totalPaid: 0,
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
      },
    };
  }

  const simulation = simulateDebtWithFixedPayment({
    principal,
    monthlyRate,
    monthlyPayment: payment,
    months: monthsPaid,
    maxMonths: 2400,
  });
  if ("error" in simulation) return invalid(profile, [simulation.error]);

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      remainingBalance: round(simulation.remaining),
      monthsPaid: simulation.paidMonths,
      totalPaid: round(simulation.totalPaid),
      totalInterestPaid: round(simulation.totalInterest),
      totalPrincipalPaid: round(simulation.totalPrincipalPaid),
    },
  };
}

function loanTermMonths(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const payment = readNumber(input, NAME_ALIASES.payment);
  const annualRate = getAnnualRate(input);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een geldige beginschuld in.");
  if (payment === undefined || payment <= 0) errors.push("Vul een geldige maandbetaling in.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  let exactMonths: number;
  if (monthlyRate === 0) {
    exactMonths = principal / payment;
  } else {
    if (payment <= principal * monthlyRate) {
      return invalid(profile, ["De maandbetaling is te laag om de schuld af te lossen."]);
    }
    exactMonths = -Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
  }

  if (!Number.isFinite(exactMonths) || exactMonths <= 0) {
    return invalid(profile, ["De looptijd kon niet worden berekend."]);
  }

  const months = Math.ceil(exactMonths);
  if (months > 2400) return invalid(profile, ["De looptijd is te lang voor deze berekening."]);

  const simulation = simulateDebtWithFixedPayment({
    principal,
    monthlyRate,
    monthlyPayment: payment,
    months,
    maxMonths: 2400,
  });
  if ("error" in simulation) return invalid(profile, [simulation.error]);

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      months,
      years: round(months / 12, 4),
      yearsPart: Math.floor(months / 12),
      monthsPart: months % 12,
      totalPaid: round(simulation.totalPaid),
      totalInterest: round(simulation.totalInterest),
      lastPayment: round(simulation.lastPayment),
    },
  };
}

function loanMonthlyPayment(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const periods = Math.round(readNumber(input, ["periods", "looptijdMaanden", "maanden"]) ?? 0);

  const errors = validateLoanBounds({ principal, annualRate, periods });
  if (periods !== undefined && periods > 1200) errors.push("De looptijd is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyPayment = annuityPaymentAmount(principal, monthlyRateFromAnnual(annualRate), periods);
  const totalPaid = monthlyPayment * periods;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      monthlyPayment: round(monthlyPayment),
      totalPaid: round(totalPaid),
      totalInterest: round(totalPaid - principal),
      periods,
    },
  };
}

function maxLoanFromBudget(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const directMaxMonthly = readNumber(input, ["maxMonthlyPayment", "maximaalMaandbedrag"]);
  const netIncome = readNumber(input, ["netIncome", "nettoInkomen"]);
  const fixedCosts = readNumber(input, ["fixedCosts", "vasteLasten"]);
  const minimumLiving = readNumber(input, ["minimumLiving", "minimaleLeefruimte"]);
  const annualRate = getAnnualRate(input);
  const periods = Math.round(readNumber(input, ["periods", "looptijdMaanden", "maanden"]) ?? 0);

  const errors: string[] = [];
  let monthlyBudget = directMaxMonthly;
  if (monthlyBudget === undefined) {
    if (netIncome === undefined || fixedCosts === undefined || minimumLiving === undefined) {
      errors.push("Vul een maximaal maandbedrag in of complete inkomensgegevens.");
    } else {
      monthlyBudget = netIncome - fixedCosts - minimumLiving;
    }
  }
  if (monthlyBudget === undefined || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
    errors.push("Er is geen positieve maandruimte beschikbaar.");
  }
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) {
    errors.push("Vul een geldig rentepercentage in.");
  }
  if (!Number.isFinite(periods) || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (periods > 1200) errors.push("De looptijd is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const maxLoan = annuityPrincipalAmount(monthlyBudget, monthlyRateFromAnnual(annualRate), periods);
  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      maxLoan: round(maxLoan),
      maxMonthlyPayment: round(monthlyBudget),
      monthlyBudget: round(monthlyBudget),
      periods,
      annualRate: round(annualRate, 6),
    },
  };
}

function personalLoanComparison(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const loanAmountA = readNumber(input, ["loanAmountA", "leenbedragA", "principalA", "leenbedrag"]);
  const loanAmountB =
    readNumber(input, ["loanAmountB", "leenbedragB", "principalB"]) ?? loanAmountA;
  const annualRateA = readNumber(input, ["annualRateA", "renteA"]);
  const annualRateB = readNumber(input, ["annualRateB", "renteB"]);
  const periodsA = Math.round(readNumber(input, ["periodsA", "looptijdMaandenA", "periods"]) ?? 0);
  const periodsB = Math.round(readNumber(input, ["periodsB", "looptijdMaandenB", "periods"]) ?? 0);

  const errors: string[] = [];
  if (loanAmountA === undefined || loanAmountA <= 0 || loanAmountB === undefined || loanAmountB <= 0) {
    errors.push("Vul geldige leenbedragen in voor beide leningen.");
  }
  if (annualRateA === undefined || annualRateA < 0 || annualRateA > 100) errors.push("Vul een geldige rente voor lening A in.");
  if (annualRateB === undefined || annualRateB < 0 || annualRateB > 100) errors.push("Vul een geldige rente voor lening B in.");
  if (periodsA <= 0 || periodsB <= 0) errors.push("Vul geldige looptijden in.");
  if (periodsA > 1200 || periodsB > 1200) errors.push("De looptijd is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyA = annuityPaymentAmount(loanAmountA, monthlyRateFromAnnual(annualRateA), periodsA);
  const monthlyB = annuityPaymentAmount(loanAmountB, monthlyRateFromAnnual(annualRateB), periodsB);
  const totalPaidA = monthlyA * periodsA;
  const totalPaidB = monthlyB * periodsB;
  const totalInterestA = totalPaidA - loanAmountA;
  const totalInterestB = totalPaidB - loanAmountB;
  const cheaper = totalPaidA < totalPaidB ? "Lening A" : totalPaidB < totalPaidA ? "Lening B" : "Gelijk";
  const savings = Math.abs(totalPaidA - totalPaidB);

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      monthlyPaymentA: round(monthlyA),
      monthlyPaymentB: round(monthlyB),
      totalInterestA: round(totalInterestA),
      totalInterestB: round(totalInterestB),
      totalPaidA: round(totalPaidA),
      totalPaidB: round(totalPaidB),
      cheapestOption: cheaper,
      savings: round(savings),
    },
  };
}

function loanInterestRate(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const payment = readNumber(input, NAME_ALIASES.payment);
  const periods = Math.round(readNumber(input, ["periods", "looptijdMaanden", "maanden"]) ?? 0);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een positief leenbedrag in.");
  if (payment === undefined || payment <= 0) errors.push("Vul een positief maandbedrag in.");
  if (!Number.isFinite(periods) || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyRate = solveMonthlyRateByPayment({ principal, payment, periods, maxAnnualRatePercentage: 100 });
  if (monthlyRate === undefined) {
    return invalid(profile, ["De ingevoerde waarden passen niet bij een positieve rente tot 100% per jaar."]);
  }

  const annualRate = monthlyRate * 12 * 100;
  const totalPaid = payment * periods;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      annualRatePercentage: round(annualRate, 6),
      monthlyRatePercentage: round(monthlyRate * 100, 6),
      totalPaid: round(totalPaid),
      totalInterest: round(totalPaid - principal),
    },
  };
}

function financialLeaseInterestRate(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const purchasePrice = readNumber(input, ["purchasePrice", "aanschafwaarde"]);
  const downPayment = readNumber(input, ["downPayment", "aanbetaling"]) ?? 0;
  const residualValue = readNumber(input, ["residualValue", "slottermijn", "restwaarde"]) ?? 0;
  const monthlyPayment = readNumber(input, ["payment", "maandtermijn", "leasetermijn"]);
  const periods = Math.round(readNumber(input, ["periods", "looptijdMaanden", "maanden"]) ?? 0);

  const errors: string[] = [];
  if (purchasePrice === undefined || purchasePrice <= 0) errors.push("Vul een geldige aanschafwaarde in.");
  if (downPayment < 0) errors.push("Aanbetaling mag niet negatief zijn.");
  if (purchasePrice !== undefined && downPayment > purchasePrice) errors.push("Aanbetaling mag niet hoger zijn dan de aanschafwaarde.");
  if (monthlyPayment === undefined || monthlyPayment <= 0) errors.push("Vul een geldige maandtermijn in.");
  if (!Number.isFinite(periods) || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (errors.length > 0) return invalid(profile, errors);

  const financingAmount = purchasePrice - downPayment;
  if (residualValue < 0 || residualValue > financingAmount) {
    return invalid(profile, ["Vul een geldige slottermijn in."]);
  }

  const monthlyRate = solveMonthlyRateForFinancialLease({
    financing: financingAmount,
    monthlyPayment,
    residualValue,
    periods,
    maxAnnualRatePercentage: 100,
  });
  if (monthlyRate === undefined) {
    return invalid(profile, ["De ingevoerde waarden passen niet bij een niet-negatieve rente tot 100% per jaar."]);
  }

  const annualRate = monthlyRate * 12 * 100;
  const totalPaid = downPayment + (monthlyPayment * periods) + residualValue;

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      annualRatePercentage: round(annualRate, 6),
      monthlyRatePercentage: round(monthlyRate * 100, 6),
      financingAmount: round(financingAmount),
      totalPaid: round(totalPaid),
      totalInterest: round(totalPaid - purchasePrice),
    },
  };
}

function financialLeaseRemainingBalance(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const purchasePrice = readNumber(input, ["purchasePrice", "aanschafwaarde"]);
  const downPayment = readNumber(input, ["downPayment", "aanbetaling"]) ?? 0;
  const residualValue = readNumber(input, ["residualValue", "slottermijn", "restwaarde"]) ?? 0;
  const annualRate = getAnnualRate(input);
  const periods = Math.round(readNumber(input, ["periods", "looptijdMaanden", "maanden"]) ?? 0);
  const monthsPaid = Math.round(readNumber(input, ["monthsPaid", "verstrekenMaanden"]) ?? 0);
  const monthlyPaymentInput = readNumber(input, ["payment", "maandtermijn", "leasetermijn"]);

  const errors: string[] = [];
  if (purchasePrice === undefined || purchasePrice <= 0) errors.push("Vul een geldige aanschafwaarde in.");
  if (downPayment < 0) errors.push("Aanbetaling mag niet negatief zijn.");
  if (purchasePrice !== undefined && downPayment > purchasePrice) errors.push("Aanbetaling mag niet hoger zijn dan de aanschafwaarde.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) errors.push("Vul een geldig rentepercentage in.");
  if (!Number.isFinite(periods) || periods <= 0) errors.push("Vul een positieve looptijd in.");
  if (!Number.isFinite(monthsPaid) || monthsPaid < 0 || monthsPaid > periods) {
    errors.push("Vul een geldige verstreken periode in.");
  }
  if (errors.length > 0) return invalid(profile, errors);

  const financingAmount = purchasePrice - downPayment;
  if (residualValue < 0 || residualValue > financingAmount) {
    return invalid(profile, ["Vul een geldige slottermijn in."]);
  }

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  const monthlyPayment =
    monthlyPaymentInput ??
    (monthlyRate === 0
      ? (financingAmount - residualValue) / periods
      : ((financingAmount - residualValue / (1 + monthlyRate) ** periods) * monthlyRate) /
        (1 - (1 + monthlyRate) ** -periods));

  const simulation = simulateDebtWithFixedPayment({
    principal: financingAmount,
    monthlyRate,
    monthlyPayment,
    months: monthsPaid,
    maxMonths: 2400,
  });
  if ("error" in simulation) return invalid(profile, [simulation.error]);

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      remainingBalance: round(simulation.remaining),
      monthsPaid: simulation.paidMonths,
      totalPaid: round(simulation.totalPaid),
      totalInterestPaid: round(simulation.totalInterest),
      totalPrincipalPaid: round(simulation.totalPrincipalPaid),
      residualValue: round(residualValue),
    },
  };
}

function loanRemainingBalance(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  return loanRemainingBalanceAfterPeriod(profile, input);
}

function studentLoanRepayment(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const years = readNumber(input, ["repaymentYears", "terugbetaalTermijnJaren", "years"]);
  const monthlyPaymentInput = readNumber(input, NAME_ALIASES.payment);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een geldige studieschuld in.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) errors.push("Vul een geldig rentepercentage in.");
  if (years === undefined || years <= 0) errors.push("Vul een geldige terugbetaaltermijn in jaren in.");
  if (monthlyPaymentInput !== undefined && monthlyPaymentInput <= 0) {
    errors.push("Vul een geldig maandbedrag in.");
  }
  if (errors.length > 0) return invalid(profile, errors);

  const periods = Math.round(years * 12);
  const monthlyRate = monthlyRateFromAnnual(annualRate);
  const monthlyPayment =
    monthlyPaymentInput ??
    annuityPaymentAmount(principal, monthlyRate, periods);

  let remaining = principal;
  let totalPaid = 0;
  let totalInterest = 0;
  for (let month = 1; month <= periods; month += 1) {
    if (remaining <= 0) break;
    const interest = remaining * monthlyRate;
    let principalPart = monthlyPayment - interest;
    let paidThisMonth = monthlyPayment;
    if (principalPart >= remaining) {
      principalPart = remaining;
      paidThisMonth = interest + principalPart;
    }
    remaining = Math.max(0, remaining - principalPart);
    totalPaid += paidThisMonth;
    totalInterest += interest;
  }

  const warnings: string[] = [];
  if (monthlyRate > 0 && monthlyPayment <= principal * monthlyRate) {
    warnings.push("Het maandbedrag ligt op of onder de rentelast van de eerste maand.");
  }

  return {
    isValid: true,
    errors: [],
    warnings,
    profile,
    outputs: {
      monthlyPayment: round(monthlyPayment),
      periods,
      years: round(periods / 12, 2),
      totalPaid: round(totalPaid),
      totalInterest: round(totalInterest),
      remainingDebtAfterTerm: round(remaining),
    },
  };
}

function debtGrowth(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const principal = readNumber(input, NAME_ALIASES.principal);
  const annualRate = getAnnualRate(input);
  const monthlyPayment = readNumber(input, NAME_ALIASES.payment) ?? 0;
  const periods = Math.round(readNumber(input, ["periods", "aantalMaanden", "maanden"]) ?? 0);

  const errors: string[] = [];
  if (principal === undefined || principal <= 0) errors.push("Vul een geldige beginschuld in.");
  if (annualRate === undefined || annualRate < 0 || annualRate > 100) errors.push("Vul een geldig rentepercentage in.");
  if (!Number.isFinite(periods) || periods <= 0) errors.push("Vul een geldige periode in maanden in.");
  if (monthlyPayment < 0) errors.push("Maandbetaling mag niet negatief zijn.");
  if (periods > 1200) errors.push("De periode is te lang voor deze berekening.");
  if (errors.length > 0) return invalid(profile, errors);

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  let remaining = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  for (let month = 1; month <= periods; month += 1) {
    const interest = remaining * monthlyRate;
    remaining = remaining + interest - monthlyPayment;
    totalInterest += interest;
    totalPaid += monthlyPayment;
  }

  return {
    isValid: true,
    errors: [],
    warnings: [],
    profile,
    outputs: {
      finalDebt: round(remaining),
      debtIncrease: round(remaining - principal),
      totalInterest: round(totalInterest),
      totalPaid: round(totalPaid),
      periods,
    },
  };
}

function genericContract(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const numericValues = Object.values(input).map((value) => toNumber(value)).filter((value): value is number => value !== undefined);
  if (numericValues.length === 0) {
    return invalid(profile, ["Vul minimaal één numerieke invoer in."]);
  }

  const geboorteJaar = readNumber(input, ["geboorteJaar", "birthYear", "geboortejaar"]);
  if (geboorteJaar !== undefined && (geboorteJaar < 1900 || geboorteJaar > 2100)) {
    return invalid(profile, ["Vul een realistisch geboortejaar in (tussen 1900 en 2100)."]);
  }
  if (geboorteJaar !== undefined && geboorteJaar >= 1900 && geboorteJaar <= 2100) {
    const currentYear = new Date().getFullYear();
    const leeftijdNu = Math.max(0, currentYear - Math.round(geboorteJaar));
    const aowLeeftijdJaren = 67;
    const jarenTotAow = Math.max(0, aowLeeftijdJaren - leeftijdNu);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "aow_leeftijd_indicatie",
        modelExplanation:
          "Indicatieve berekening op basis van geboortejaar en een AOW-richtleeftijd van 67 jaar.",
        geboorteJaar: Math.round(geboorteJaar),
        leeftijdNu,
        aowLeeftijdJaren,
        jarenTotAow,
        verwachteAowJaar: currentYear + jarenTotAow,
      },
    };
  }

  const pensioengrondslag = readNumber(input, ["pensioengrondslag", "grondslag", "pensioenGrondslag"]);
  const aFactor = readNumber(input, ["aFactor", "afactor", "a-factor"]);
  if (pensioengrondslag !== undefined || aFactor !== undefined) {
    if (
      pensioengrondslag === undefined ||
      pensioengrondslag < 0 ||
      aFactor === undefined ||
      aFactor < 0
    ) {
      return invalid(profile, [
        "Vul een geldige pensioengrondslag en A-factor in voor de jaarruimteberekening.",
      ]);
    }
    const reserveringsruimteInput =
      readNumber(input, ["reserveringsruimte", "reserveringsRuimte"]) ?? 0;
    const voorgenomenStorting =
      readNumber(input, ["voorgenomenStorting", "storting", "inleg"]) ?? 0;
    const jaarruimteIndicatie = Math.max(0, (pensioengrondslag * 0.133) - (aFactor * 6.27));
    const totaleFiscaleRuimte = jaarruimteIndicatie + Math.max(0, reserveringsruimteInput);
    const fiscaleRuimteResterend = totaleFiscaleRuimte - voorgenomenStorting;
    const warnings: string[] = [];
    if (fiscaleRuimteResterend < 0) {
      warnings.push("De voorgenomen storting ligt boven de indicatieve fiscale ruimte.");
    }
    return {
      isValid: true,
      errors: [],
      warnings,
      profile,
      outputs: {
        modelUsed: "pensioen_jaarruimte_indicatie",
        modelExplanation:
          "Indicatieve jaarruimte op basis van pensioengrondslag, A-factor en reserveringsruimte.",
        pensioengrondslag: round(pensioengrondslag),
        aFactor: round(aFactor, 2),
        jaarruimteIndicatie: round(jaarruimteIndicatie),
        reserveringsruimte: round(Math.max(0, reserveringsruimteInput)),
        totaleFiscaleRuimte: round(totaleFiscaleRuimte),
        voorgenomenStorting: round(voorgenomenStorting),
        fiscaleRuimteResterend: round(fiscaleRuimteResterend),
      },
    };
  }

  const huidigeLeeftijd = readNumber(input, ["huidigeLeeftijd", "leeftijdNu"]);
  const verwachteEindleeftijd = readNumber(input, ["verwachteEindleeftijd", "eindleeftijd"]);
  if (huidigeLeeftijd !== undefined || verwachteEindleeftijd !== undefined) {
    if (
      huidigeLeeftijd === undefined ||
      verwachteEindleeftijd === undefined ||
      huidigeLeeftijd < 0 ||
      verwachteEindleeftijd <= huidigeLeeftijd
    ) {
      return invalid(profile, ["Vul een geldige huidige leeftijd en hogere eindleeftijd in."]);
    }
    const jaarlijkseZorgkosten =
      readNumber(input, ["jaarlijkseZorgkosten", "zorgkostenPerJaar"]) ?? 0;
    const resterendeLevensjaren = verwachteEindleeftijd - huidigeLeeftijd;
    const totaleZorgkostenTotEindleeftijd = resterendeLevensjaren * jaarlijkseZorgkosten;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "levensverwachting_indicatie",
        modelExplanation:
          "Indicatieve resterende levensverwachting met optionele cumulatieve zorgkosten.",
        huidigeLeeftijd: round(huidigeLeeftijd, 1),
        verwachteEindleeftijd: round(verwachteEindleeftijd, 1),
        resterendeLevensjaren: round(resterendeLevensjaren, 1),
        totaleZorgkostenTotEindleeftijd: round(totaleZorgkostenTotEindleeftijd),
        gemiddeldeZorgkostenPerLevensjaar: round(jaarlijkseZorgkosten),
      },
    };
  }

  const huidigeAlimentatiePerMaand = readNumber(input, [
    "huidigeAlimentatiePerMaand",
    "huidigeAlimentatie",
    "alimentatiePerMaand",
  ]);
  const indexPercentage = readNumber(input, ["indexPercentage", "indexeringPercentage"]);
  if (huidigeAlimentatiePerMaand !== undefined || indexPercentage !== undefined) {
    if (
      huidigeAlimentatiePerMaand === undefined ||
      huidigeAlimentatiePerMaand < 0 ||
      indexPercentage === undefined ||
      indexPercentage < -100
    ) {
      return invalid(profile, ["Vul een geldige alimentatie en indexeringspercentage in."]);
    }
    const aantalMaanden = Math.max(1, Math.round(readNumber(input, ["aantalMaanden", "maanden"]) ?? 12));
    const geindexeerdeAlimentatiePerMaand =
      huidigeAlimentatiePerMaand * (1 + indexPercentage / 100);
    const maandelijkseStijging = geindexeerdeAlimentatiePerMaand - huidigeAlimentatiePerMaand;
    const jaarlijksVerschil = maandelijkseStijging * aantalMaanden;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "alimentatie_indexering_indicatie",
        modelExplanation:
          "Indicatieve indexering van alimentatie met maand- en jaarverschil.",
        huidigeAlimentatiePerMaand: round(huidigeAlimentatiePerMaand),
        geindexeerdeAlimentatiePerMaand: round(geindexeerdeAlimentatiePerMaand),
        maandelijkseStijging: round(maandelijkseStijging),
        jaarlijksVerschil: round(jaarlijksVerschil),
        indexPercentage: round(indexPercentage, 2),
      },
    };
  }

  const brutoPensioenPerMaand = readNumber(input, [
    "brutoPensioenPerMaand",
    "brutoPensioen",
    "brutoMaand",
  ]);
  const aowPerMaand = readNumber(input, ["aowPerMaand", "aowMaand"]);
  if (brutoPensioenPerMaand !== undefined || aowPerMaand !== undefined) {
    const pensioen = brutoPensioenPerMaand ?? 0;
    const aow = aowPerMaand ?? 0;
    const aanvullend = readNumber(input, [
      "aanvullendInkomenPerMaand",
      "aanvullendInkomen",
      "extraInkomen",
    ]) ?? 0;
    const belastingPercentage = readNumber(input, ["belastingPercentage", "belasting"]) ?? 28;
    const totaalBrutoPerMaand = pensioen + aow + aanvullend;
    const totaalNettoPerMaand = totaalBrutoPerMaand * (1 - belastingPercentage / 100);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "pensioen_inkomen_indicatie",
        modelExplanation:
          "Indicatieve pensioenberekening met bruto maandinkomen en een vast belastingpercentage.",
        totaalBrutoPerMaand: round(totaalBrutoPerMaand),
        totaalNettoPerMaand: round(totaalNettoPerMaand),
        totaalBrutoPerJaar: round(totaalBrutoPerMaand * 12),
        totaalNettoPerJaar: round(totaalNettoPerMaand * 12),
        belastingPercentage: round(belastingPercentage, 2),
      },
    };
  }

  const koopprijs = readNumber(input, ["koopprijs", "aankoopprijs"]);
  const tariefPercentage = readNumber(input, ["tariefPercentage", "overdrachtsbelastingPercentage", "tarief"]);
  const notariskosten = readNumber(input, ["notariskosten"]) ?? 0;
  const advieskosten = readNumber(input, ["advieskosten"]) ?? 0;
  const taxatiekosten = readNumber(input, ["taxatiekosten"]) ?? 0;
  if (koopprijs !== undefined && tariefPercentage !== undefined) {
    if (koopprijs <= 0 || tariefPercentage < 0 || tariefPercentage > 100) {
      return invalid(profile, ["Vul een geldige koopprijs en belastingtarief in."]);
    }
    const overdrachtsbelasting = koopprijs * (tariefPercentage / 100);
    const totaleKostenKoper = overdrachtsbelasting + Math.max(0, notariskosten) + Math.max(0, advieskosten) + Math.max(0, taxatiekosten);
    const warnings: string[] = [];
    if (notariskosten === 0 && advieskosten === 0 && taxatiekosten === 0) {
      warnings.push("Overige kosten zijn op 0 gezet; vul ze in voor een realistischer beeld.");
    }
    return {
      isValid: true,
      errors: [],
      warnings,
      profile,
      outputs: {
        modelUsed: "kosten_koper_indicatie",
        modelExplanation:
          "Indicatieve kosten koper met overdrachtsbelasting en optionele bijkomende aankoopkosten.",
        koopprijs: round(koopprijs),
        tariefPercentage: round(tariefPercentage, 2),
        overdrachtsbelasting: round(overdrachtsbelasting),
        notariskosten: round(Math.max(0, notariskosten)),
        advieskosten: round(Math.max(0, advieskosten)),
        taxatiekosten: round(Math.max(0, taxatiekosten)),
        totaleKostenKoper: round(totaleKostenKoper),
        totaleAankoopLast: round(koopprijs + totaleKostenKoper),
      },
    };
  }

  const woningWaardeOverdracht = readNumber(input, ["woningWaarde", "wozWaarde"]);
  if (woningWaardeOverdracht !== undefined && tariefPercentage !== undefined) {
    if (woningWaardeOverdracht <= 0 || tariefPercentage < 0 || tariefPercentage > 100) {
      return invalid(profile, ["Vul een geldige woningwaarde en tarief in."]);
    }
    const overdrachtsbelasting = woningWaardeOverdracht * (tariefPercentage / 100);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "overdrachtsbelasting_indicatie",
        modelExplanation:
          "Indicatieve berekening van overdrachtsbelasting op basis van woningwaarde en tarief.",
        woningWaarde: round(woningWaardeOverdracht),
        tariefPercentage: round(tariefPercentage, 2),
        overdrachtsbelasting: round(overdrachtsbelasting),
        totaleAankoopLast: round(woningWaardeOverdracht + overdrachtsbelasting),
      },
    };
  }

  const forfaitPercentage = readNumber(input, ["forfaitPercentage", "eigenwoningforfaitPercentage"]);
  if (woningWaardeOverdracht !== undefined && forfaitPercentage !== undefined) {
    if (woningWaardeOverdracht <= 0 || forfaitPercentage < 0 || forfaitPercentage > 100) {
      return invalid(profile, ["Vul een geldige woningwaarde en forfaitpercentage in."]);
    }
    const eigenwoningforfait = woningWaardeOverdracht * (forfaitPercentage / 100);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "eigenwoningforfait_indicatie",
        modelExplanation:
          "Indicatieve berekening van het eigenwoningforfait op basis van WOZ-waarde en forfaitpercentage.",
        woningWaarde: round(woningWaardeOverdracht),
        forfaitPercentage: round(forfaitPercentage, 4),
        eigenwoningforfaitPerJaar: round(eigenwoningforfait),
        eigenwoningforfaitPerMaand: round(eigenwoningforfait / 12),
      },
    };
  }

  const jaarlijkseStijgingPercentage = readNumber(input, [
    "jaarlijkseStijgingPercentage",
    "stijgingPercentage",
    "prijsstijgingPercentage",
  ]);
  if (
    woningWaardeOverdracht !== undefined &&
    jaarlijkseStijgingPercentage !== undefined &&
    readNumber(input, ["looptijdJaren", "jaren", "years"]) !== undefined
  ) {
    const jaren = readNumber(input, ["looptijdJaren", "jaren", "years"]) ?? 0;
    if (woningWaardeOverdracht <= 0 || jaren <= 0 || jaarlijkseStijgingPercentage <= -100) {
      return invalid(profile, ["Vul een geldige woningwaarde, stijging en looptijd in."]);
    }
    const factor = (1 + jaarlijkseStijgingPercentage / 100) ** jaren;
    const toekomstigeWoningWaarde = woningWaardeOverdracht * factor;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "woningwaarde_groei_indicatie",
        modelExplanation:
          "Indicatieve prijsontwikkeling van een woning op basis van jaarlijkse procentuele groei.",
        huidigeWoningWaarde: round(woningWaardeOverdracht),
        jaarlijkseStijgingPercentage: round(jaarlijkseStijgingPercentage, 3),
        vergelijkingJaren: round(jaren, 1),
        toekomstigeWoningWaarde: round(toekomstigeWoningWaarde),
        waardestijgingInEuro: round(toekomstigeWoningWaarde - woningWaardeOverdracht),
      },
    };
  }

  const brutoJaarInkomen = readNumber(input, ["brutoJaarInkomen", "jaarInkomen", "inkomen"]);
  if (brutoJaarInkomen !== undefined) {
    if (brutoJaarInkomen < 0) {
      return invalid(profile, ["Vul een geldig bruto jaarinkomen in."]);
    }
    const partnerInkomen = readNumber(input, ["partnerJaarInkomen", "partnerInkomen"]) ?? 0;
    const inkomensFactor = readNumber(input, ["inkomensFactor", "factor"]) ?? 4.5;
    const toetsInkomen = brutoJaarInkomen + Math.max(0, partnerInkomen);
    const maximaleHypotheek = toetsInkomen * inkomensFactor;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "maximale_hypotheek_indicatie",
        modelExplanation:
          "Indicatieve maximale hypotheek op basis van (gezamenlijk) inkomen en een inkomensfactor.",
        toetsInkomen: round(toetsInkomen),
        inkomensFactor: round(inkomensFactor, 2),
        maximaleHypotheekIndicatie: round(maximaleHypotheek),
      },
    };
  }

  const oudeRentePercentage = readNumber(input, [
    "oudeRentePercentage",
    "oudeRente",
    "huidigeRentePercentage",
  ]);
  const nieuweRentePercentage = readNumber(input, [
    "nieuweRentePercentage",
    "nieuweRente",
    "renteNieuw",
  ]);
  const resterendeHypotheek = readNumber(input, [
    "resterendeHypotheek",
    "hypotheekBedrag",
    "restschuld",
    "lening",
  ]);
  const resterendeLooptijdJaren = readNumber(input, [
    "resterendeLooptijdJaren",
    "looptijdJaren",
    "years",
  ]);
  if (
    oudeRentePercentage !== undefined &&
    nieuweRentePercentage !== undefined &&
    resterendeHypotheek !== undefined &&
    resterendeLooptijdJaren !== undefined
  ) {
    if (
      resterendeHypotheek <= 0 ||
      resterendeLooptijdJaren <= 0 ||
      oudeRentePercentage < 0 ||
      nieuweRentePercentage < 0 ||
      oudeRentePercentage > 100 ||
      nieuweRentePercentage > 100
    ) {
      return invalid(profile, [
        "Vul een geldige resterende hypotheek, looptijd en oude/nieuwe rente in.",
      ]);
    }
    const maanden = Math.max(1, Math.round(resterendeLooptijdJaren * 12));
    const oudeMaandlast = annuityPaymentAmount(
      resterendeHypotheek,
      monthlyRateFromAnnual(oudeRentePercentage),
      maanden,
    );
    const nieuweMaandlast = annuityPaymentAmount(
      resterendeHypotheek,
      monthlyRateFromAnnual(nieuweRentePercentage),
      maanden,
    );
    const oversluitKosten = Math.max(
      0,
      readNumber(input, ["oversluitKosten", "boeterente", "advieskosten"]) ?? 0,
    );
    const maandelijkseBesparing = oudeMaandlast - nieuweMaandlast;
    const terugverdientijdMaanden =
      maandelijkseBesparing > 0 && oversluitKosten > 0
        ? oversluitKosten / maandelijkseBesparing
        : 0;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "hypotheek_rentevergelijking_indicatie",
        modelExplanation:
          "Indicatieve vergelijking van oude en nieuwe rente op maandlast en terugverdientijd.",
        oudeMaandlast: round(oudeMaandlast),
        nieuweMaandlast: round(nieuweMaandlast),
        maandelijkseBesparing: round(maandelijkseBesparing),
        oversluitKosten: round(oversluitKosten),
        terugverdientijdMaanden:
          maandelijkseBesparing > 0
            ? round(terugverdientijdMaanden, 1)
            : null,
      },
    };
  }

  const huidigeHypotheek = readNumber(input, [
    "huidigeHypotheek",
    "hypotheekBedrag",
    "resterendeHypotheek",
  ]);
  const extraAflossing = readNumber(input, ["extraAflossing", "aflossingExtra"]);
  const aflossingsRente = readNumber(input, ["rentePercentage", "jaarrente", "annualRate"]);
  const aflossingsLooptijdJaren = readNumber(input, ["looptijdJaren", "years"]);
  if (
    huidigeHypotheek !== undefined &&
    extraAflossing !== undefined &&
    aflossingsRente !== undefined &&
    aflossingsLooptijdJaren !== undefined
  ) {
    if (
      huidigeHypotheek <= 0 ||
      extraAflossing < 0 ||
      extraAflossing >= huidigeHypotheek ||
      aflossingsRente < 0 ||
      aflossingsRente > 100 ||
      aflossingsLooptijdJaren <= 0
    ) {
      return invalid(profile, ["Vul geldige waarden in voor hypotheek, aflossing, rente en looptijd."]);
    }
    const maanden = Math.max(1, Math.round(aflossingsLooptijdJaren * 12));
    const maandRente = monthlyRateFromAnnual(aflossingsRente);
    const maandlastVoor = annuityPaymentAmount(huidigeHypotheek, maandRente, maanden);
    const maandlastNa = annuityPaymentAmount(
      huidigeHypotheek - extraAflossing,
      maandRente,
      maanden,
    );
    const totaleRenteVoor = maandlastVoor * maanden - huidigeHypotheek;
    const totaleRenteNa = maandlastNa * maanden - (huidigeHypotheek - extraAflossing);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "hypotheek_aflossen_indicatie",
        modelExplanation:
          "Indicatieve vergelijking van maandlast en totale rente vóór en na een extra aflossing.",
        maandlastVoor: round(maandlastVoor),
        maandlastNa: round(maandlastNa),
        maandlastBesparing: round(maandlastVoor - maandlastNa),
        totaleRenteVoor: round(totaleRenteVoor),
        totaleRenteNa: round(totaleRenteNa),
        renteBesparing: round(totaleRenteVoor - totaleRenteNa),
      },
    };
  }

  const hypotheekBedrag = readNumber(input, ["hypotheekBedrag", "hypotheek", "lening", "principal"]);
  const rentePercentage = readNumber(input, ["rentePercentage", "jaarrente", "annualRate"]);
  const looptijdJaren = readNumber(input, ["looptijdJaren", "looptijd", "years"]);
  if (
    hypotheekBedrag !== undefined &&
    rentePercentage !== undefined &&
    looptijdJaren !== undefined &&
    hypotheekBedrag > 0 &&
    rentePercentage >= 0 &&
    looptijdJaren > 0
  ) {
    const looptijdMaanden = Math.max(1, Math.round(looptijdJaren * 12));
    const maandRente = monthlyRateFromAnnual(rentePercentage);
    const brutoMaandlast = annuityPaymentAmount(hypotheekBedrag, maandRente, looptijdMaanden);
    const totaalBetaald = brutoMaandlast * looptijdMaanden;
    const woningWaarde = readNumber(input, ["woningWaarde", "wozWaarde"]);
    const ltv =
      woningWaarde && woningWaarde > 0
        ? (hypotheekBedrag / woningWaarde) * 100
        : undefined;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "hypotheek_lasten_indicatie",
        modelExplanation:
          "Indicatieve annuïtaire berekening met leenbedrag, rente en looptijd.",
        brutoMaandlast: round(brutoMaandlast),
        totaalBetaald: round(totaalBetaald),
        totaleRente: round(totaalBetaald - hypotheekBedrag),
        looptijdMaanden,
        ltvPercentage: ltv !== undefined ? round(ltv, 2) : null,
      },
    };
  }

  const huurPerMaand = readNumber(input, ["huurPerMaand", "huur", "maandhuur"]);
  const koopWaarde = readNumber(input, ["woningWaarde", "koopprijs"]);
  if (huurPerMaand !== undefined && koopWaarde !== undefined && huurPerMaand > 0 && koopWaarde > 0) {
    const jaren = readNumber(input, ["looptijdJaren", "vergelijkingJaren", "years"]) ?? 10;
    const eigenGeld = readNumber(input, ["eigenGeld", "aanbetaling"]) ?? 0;
    const hypotheek = Math.max(0, koopWaarde - eigenGeld);
    const rente = readNumber(input, ["rentePercentage", "jaarrente"]) ?? 4;
    const maanden = Math.max(1, Math.round(jaren * 12));
    const maandlastKoop = annuityPaymentAmount(hypotheek, monthlyRateFromAnnual(rente), maanden);
    const totaleHuur = huurPerMaand * maanden;
    const totaleKooplasten = maandlastKoop * maanden + eigenGeld;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "huren_kopen_indicatie",
        modelExplanation:
          "Indicatieve vergelijking van totale huurlasten versus kooplasten over dezelfde periode.",
        totaleHuurLasten: round(totaleHuur),
        totaleKoopLasten: round(totaleKooplasten),
        maandlastKoop: round(maandlastKoop),
        verschilKoopMinHuur: round(totaleKooplasten - totaleHuur),
        vergelijkingJaren: round(jaren, 1),
      },
    };
  }

  const leenbedrag = readNumber(input, ["leenbedrag", "lening", "schuld", "principal"]);
  const leenRente = readNumber(input, ["rentePercentage", "jaarrente", "annualRate"]);
  const looptijdMaanden = readNumber(input, ["looptijdMaanden", "periods", "maanden"]);
  if (
    leenbedrag !== undefined &&
    leenRente !== undefined &&
    looptijdMaanden !== undefined &&
    leenbedrag > 0 &&
    leenRente >= 0 &&
    looptijdMaanden > 0
  ) {
    const termijnen = Math.max(1, Math.round(looptijdMaanden));
    const maandRente = monthlyRateFromAnnual(leenRente);
    const maandbedrag = annuityPaymentAmount(leenbedrag, maandRente, termijnen);
    const totaal = maandbedrag * termijnen;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "lening_kosten_indicatie",
        modelExplanation:
          "Indicatieve annuïtaire leningberekening met maandlast en totale kosten.",
        maandbedrag: round(maandbedrag),
        totaleKosten: round(totaal),
        totaleRente: round(totaal - leenbedrag),
        looptijdMaanden: termijnen,
      },
    };
  }

  const startVermogen = readNumber(input, ["startVermogen", "startBedrag", "presentValue"]);
  const maandelijkseInleg = readNumber(input, ["maandelijkseInleg", "periodiekeInleg", "payment"]) ?? 0;
  const rendement = readNumber(input, ["verwachtRendementProcent", "rendementProcent", "percentage", "annualRate"]);
  const horizonJaren = readNumber(input, ["looptijdJaren", "jaren", "years"]);
  if (
    startVermogen !== undefined &&
    rendement !== undefined &&
    horizonJaren !== undefined &&
    startVermogen >= 0 &&
    horizonJaren > 0
  ) {
    const maanden = Math.max(1, Math.round(horizonJaren * 12));
    const maandRente = rendement / 100 / 12;
    const eindStart = startVermogen * (1 + maandRente) ** maanden;
    const eindInleg =
      maandRente === 0
        ? maandelijkseInleg * maanden
        : maandelijkseInleg * (((1 + maandRente) ** maanden - 1) / maandRente);
    const eindvermogen = eindStart + eindInleg;
    const totaleInleg = startVermogen + maandelijkseInleg * maanden;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "vermogensgroei_indicatie",
        modelExplanation:
          "Indicatieve vermogensgroei met samengesteld rendement en periodieke inleg.",
        eindVermogen: round(eindvermogen),
        totaleInleg: round(totaleInleg),
        rendementInEuro: round(eindvermogen - totaleInleg),
        horizonJaren: round(horizonJaren, 1),
      },
    };
  }

  const schenkingBedrag = readNumber(input, ["schenkingBedrag", "bedrag", "giftAmount"]);
  const vrijstelling = readNumber(input, ["vrijstelling", "vrijgesteldBedrag"]) ?? 0;
  if (schenkingBedrag !== undefined && schenkingBedrag >= 0) {
    const tarief = readNumber(input, ["tariefProcent", "belastingPercentage", "tarief"]) ?? 10;
    const belastbareGrondslag = Math.max(0, schenkingBedrag - vrijstelling);
    const belasting = belastbareGrondslag * (tarief / 100);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "schenken_erven_indicatie",
        modelExplanation:
          "Indicatieve fiscale berekening op basis van vrijstelling en vast tarief.",
        belastbareGrondslag: round(belastbareGrondslag),
        verschuldigdeBelasting: round(belasting),
        nettoNaBelasting: round(schenkingBedrag - belasting),
      },
    };
  }

  const brutoMaandloon = readNumber(input, ["brutoMaandloon", "brutoMaand", "salaris"]);
  if (brutoMaandloon !== undefined && brutoMaandloon > 0) {
    const belastingPercentage = readNumber(input, ["belastingPercentage", "belasting"]) ?? 30;
    const vakantiegeldPercentage = readNumber(input, ["vakantiegeldPercentage", "vakantiegeld"]) ?? 8;
    const nettoMaandloon = brutoMaandloon * (1 - belastingPercentage / 100);
    const vakantiegeldBruto = brutoMaandloon * (vakantiegeldPercentage / 100);
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "inkomen_indicatie",
        modelExplanation:
          "Indicatieve omzetting van bruto naar netto met een vast belastingpercentage.",
        brutoMaandloon: round(brutoMaandloon),
        nettoMaandloon: round(nettoMaandloon),
        vakantiegeldBrutoPerJaar: round(vakantiegeldBruto * 12),
        nettoJaarloonIndicatie: round(nettoMaandloon * 12),
      },
    };
  }

  const jaaromzet = readNumber(input, ["jaaromzet", "omzet"]);
  if (jaaromzet !== undefined && jaaromzet >= 0) {
    const zakelijkeKosten = readNumber(input, ["zakelijkeKosten", "kosten"]) ?? 0;
    const winst = jaaromzet - zakelijkeKosten;
    const belastingReserve = winst > 0 ? winst * 0.37 : 0;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "ondernemers_resultaat_indicatie",
        modelExplanation:
          "Indicatieve ondernemersberekening met omzet, kosten en belastingreservering.",
        jaaromzet: round(jaaromzet),
        zakelijkeKosten: round(zakelijkeKosten),
        winstVoorBelasting: round(winst),
        geadviseerdeBelastingReserve: round(belastingReserve),
        nettoResultaatIndicatie: round(winst - belastingReserve),
      },
    };
  }

  const nettoInkomenOuder1 = readNumber(input, ["nettoInkomenOuder1"]);
  const nettoInkomenOuder2 = readNumber(input, ["nettoInkomenOuder2"]);
  if (nettoInkomenOuder1 !== undefined || nettoInkomenOuder2 !== undefined) {
    const inkomen1 = nettoInkomenOuder1 ?? 0;
    const inkomen2 = nettoInkomenOuder2 ?? 0;
    const kinderen = Math.max(0, Math.round(readNumber(input, ["aantalKinderen", "kinderen"]) ?? 0));
    const kostenPerKind = readNumber(input, ["kostenPerKindPerMaand", "kostenPerKind"]) ?? 0;
    const totaleKindkosten = kinderen * kostenPerKind;
    return {
      isValid: true,
      errors: [],
      warnings: [],
      profile,
      outputs: {
        modelUsed: "gezin_budget_indicatie",
        modelExplanation:
          "Indicatieve gezinsberekening met netto inkomsten en maandelijkse kindkosten.",
        totaalNettoInkomenPerMaand: round(inkomen1 + inkomen2),
        totaleKindkostenPerMaand: round(totaleKindkosten),
        beschikbaarNaKindkosten: round(inkomen1 + inkomen2 - totaleKindkosten),
        aantalKinderen: kinderen,
      },
    };
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const sum = numericValues.reduce((total, value) => total + value, 0);
  const average = sum / numericValues.length;

  return {
    isValid: true,
    errors: [],
    warnings: [
      "Generieke modus: controleer deze tool handmatig voordat je hem naar apps verplaatst.",
    ],
    profile,
    outputs: {
      modelUsed: "fallback_statistiek",
      modelExplanation:
        "Fallback-model: de tool berekent basisstatistiek over de numerieke invoerwaarden.",
      inputCount: numericValues.length,
      min: round(min),
      max: round(max),
      sum: round(sum),
      average: round(average),
    },
  };
}

export function executeProfile(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  if (!input || typeof input !== "object") {
    return invalid(profile, ["Vul geldige invoer in."]);
  }

  switch (profile) {
    case "annuity_payment":
      return annuityPayment(profile, input);
    case "annuity_principal":
      return annuityPrincipal(profile, input);
    case "annuity_term":
      return annuityTerm(profile, input);
    case "present_value":
      return presentValue(profile, input);
    case "present_value_annuity":
      return presentValueAnnuity(profile, input);
    case "future_value":
      return futureValue(profile, input);
    case "compound_interest":
      return compoundInterest(profile, input);
    case "simple_interest":
      return simpleInterest(profile, input);
    case "effective_rate":
      return effectiveRate(profile, input);
    case "nominal_rate":
      return nominalRate(profile, input);
    case "weighted_average_rate":
      return weightedAverageRate(profile, input);
    case "percentage_of_total":
      return percentageOfTotal(profile, input);
    case "value_from_percentage":
      return valueFromPercentage(profile, input);
    case "linear_loan":
      return linearLoan(profile, input);
    case "indexed_amount":
      return indexedAmount(profile, input);
    case "fraction_calculation":
      return fractionCalculation(profile, input);
    case "required_grade":
      return requiredGrade(profile, input);
    case "average_grade":
      return averageGrade(profile, input);
    case "roman_numerals":
      return romanNumerals(profile, input);
    case "dcf_valuation":
      return dcfValuation(profile, input);
    case "percentage_composition":
      return percentageComposition(profile, input);
    case "loan_amortization_schedule":
      return loanAmortizationSchedule(profile, input);
    case "revolving_credit_comparison":
      return revolvingCreditComparison(profile, input);
    case "loan_total_cost":
      return loanTotalCost(profile, input);
    case "loan_amount_from_payment":
      return loanAmountFromPayment(profile, input);
    case "installment_purchase_cost":
      return installmentPurchaseCost(profile, input);
    case "financial_lease_payment":
      return financialLeasePayment(profile, input);
    case "loan_remaining_balance_after_period":
      return loanRemainingBalanceAfterPeriod(profile, input);
    case "loan_term_months":
      return loanTermMonths(profile, input);
    case "loan_monthly_payment":
      return loanMonthlyPayment(profile, input);
    case "max_loan_from_budget":
      return maxLoanFromBudget(profile, input);
    case "personal_loan_comparison":
      return personalLoanComparison(profile, input);
    case "loan_interest_rate":
      return loanInterestRate(profile, input);
    case "financial_lease_interest_rate":
      return financialLeaseInterestRate(profile, input);
    case "financial_lease_remaining_balance":
      return financialLeaseRemainingBalance(profile, input);
    case "loan_remaining_balance":
      return loanRemainingBalance(profile, input);
    case "student_loan_repayment":
      return studentLoanRepayment(profile, input);
    case "debt_growth":
      return debtGrowth(profile, input);
    case "generic_contract":
      return genericContract(profile, input);
    default:
      return invalid("generic_contract", ["Onbekend profiel."]);
  }
}

function getGenericFixtureForTool(toolSlug?: string): ProfileFixture {
  if (toolSlug?.startsWith("artifact-pensioen-aow-")) {
    if (toolSlug.includes("aow-leeftijd")) {
      return {
        input: {
          geboorteJaar: 1988,
          geboorteMaand: 6,
          gewenstePensioenLeeftijd: 67,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("jaarruimte") || toolSlug.includes("reserveringsruimte")) {
      return {
        input: {
          pensioengrondslag: 52000,
          aFactor: 1200,
          reserveringsruimte: 4500,
          voorgenomenStorting: 3000,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("levensverwachting")) {
      return {
        input: {
          huidigeLeeftijd: 45,
          verwachteEindleeftijd: 87,
          jaarlijkseZorgkosten: 3500,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("netto") || toolSlug.includes("bruto-netto")) {
      return {
        input: {
          brutoPensioenPerMaand: 2400,
          aowPerMaand: 1345,
          aanvullendInkomenPerMaand: 250,
          belastingPercentage: 28,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("pensioenstorting") || toolSlug.includes("pensioensparen")) {
      return {
        input: {
          pensioengrondslag: 52000,
          aFactor: 1200,
          reserveringsruimte: 3000,
          voorgenomenStorting: 2500,
        },
        expectValid: true,
      };
    }
    return {
      input: {
        brutoPensioenPerMaand: 2400,
        aowPerMaand: 1345,
        aanvullendInkomenPerMaand: 250,
        belastingPercentage: 28,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-hypotheek-wonen-")) {
    if (toolSlug.includes("kosten-koper")) {
      return {
        input: {
          koopprijs: 475000,
          tariefPercentage: 2,
          notariskosten: 1800,
          advieskosten: 2500,
          taxatiekosten: 750,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("huren-of-kopen")) {
      return {
        input: {
          huurPerMaand: 1450,
          woningWaarde: 475000,
          eigenGeld: 60000,
          rentePercentage: 4.1,
          looptijdJaren: 30,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("overdrachtsbelasting")) {
      return {
        input: {
          woningWaarde: 475000,
          tariefPercentage: 2,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("eigenwoningforfait")) {
      return {
        input: {
          woningWaarde: 475000,
          forfaitPercentage: 0.35,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("prijsontwikkeling")) {
      return {
        input: {
          woningWaarde: 475000,
          jaarlijkseStijgingPercentage: 3.2,
          looptijdJaren: 10,
        },
        expectValid: true,
      };
    }
    if (
      toolSlug.includes("oversluiten") ||
      toolSlug.includes("rentemiddeling") ||
      toolSlug.includes("rentewijziging")
    ) {
      return {
        input: {
          resterendeHypotheek: 300000,
          oudeRentePercentage: 4.8,
          nieuweRentePercentage: 3.9,
          resterendeLooptijdJaren: 22,
          oversluitKosten: 7800,
        },
        expectValid: true,
      };
    }
    if (
      toolSlug.includes("aflossen") ||
      toolSlug.includes("aflossingsvrije") ||
      toolSlug.includes("restschuld")
    ) {
      return {
        input: {
          huidigeHypotheek: 320000,
          extraAflossing: 25000,
          rentePercentage: 4.1,
          looptijdJaren: 24,
        },
        expectValid: true,
      };
    }
    if (toolSlug.includes("maximale-hypotheek")) {
      return {
        input: {
          brutoJaarInkomen: 78000,
          partnerJaarInkomen: 32000,
          inkomensFactor: 4.4,
        },
        expectValid: true,
      };
    }
    return {
      input: {
        woningWaarde: 475000,
        hypotheekBedrag: 340000,
        rentePercentage: 4.1,
        looptijdJaren: 30,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-gezin-relatie-")) {
    if (toolSlug.includes("indexering-alimentatie")) {
      return {
        input: {
          huidigeAlimentatiePerMaand: 525,
          indexPercentage: 6.2,
          aantalMaanden: 12,
        },
        expectValid: true,
      };
    }
    return {
      input: {
        nettoInkomenOuder1: 3200,
        nettoInkomenOuder2: 2700,
        aantalKinderen: 2,
        kostenPerKindPerMaand: 450,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-geld-lenen-financiering-")) {
    return {
      input: {
        leenbedrag: 25000,
        rentePercentage: 6.2,
        looptijdMaanden: 60,
        maandbedrag: 485,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-basis-berekeningen-")) {
    return {
      input: {
        startBedrag: 10000,
        percentage: 5,
        looptijdJaren: 10,
        periodiekeInleg: 100,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-sparen-beleggen-")) {
    return {
      input: {
        startVermogen: 25000,
        maandelijkseInleg: 350,
        verwachtRendementProcent: 6,
        looptijdJaren: 15,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-schenken-erven-")) {
    return {
      input: {
        schenkingBedrag: 25000,
        vrijstelling: 6650,
        tariefProcent: 10,
        belastbareGrondslag: 18350,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-werk-inkomen-ontslag-")) {
    return {
      input: {
        brutoMaandloon: 4200,
        belastingPercentage: 30,
        arbeidsurenPerWeek: 40,
        vakantiegeldPercentage: 8,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-ondernemen-zzp-dga-")) {
    return {
      input: {
        jaaromzet: 120000,
        zakelijkeKosten: 35000,
        uurtarief: 95,
        declarabeleUrenPerJaar: 1200,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-kalender-vrije-tijd-")) {
    return {
      input: {
        aantalDagen: 30,
        aantalWerkdagen: 22,
        feestdagenInPeriode: 1,
      },
      expectValid: true,
    };
  }

  if (toolSlug?.startsWith("artifact-overig-")) {
    return {
      input: {
        basisBedrag: 1000,
        percentage: 12.5,
        periodeInMaanden: 12,
      },
      expectValid: true,
    };
  }

  return { input: { valueA: 100, valueB: 250 }, expectValid: true };
}

export function getProfileFixture(profile: ToolProfile, toolSlug?: string): ProfileFixture {
  switch (profile) {
    case "annuity_payment":
      return { input: { principal: 100000, annualRate: 5, years: 30 }, expectValid: true };
    case "annuity_principal":
      return { input: { payment: 536.82, annualRate: 5, years: 30 }, expectValid: true };
    case "annuity_term":
      return { input: { principal: 10000, payment: 860.66, annualRate: 6 }, expectValid: true };
    case "present_value":
      return { input: { futureValue: 1000, annualRate: 5, years: 1 }, expectValid: true };
    case "present_value_annuity":
      return { input: { payment: 1000, annualRate: 5, years: 5 }, expectValid: true };
    case "future_value":
      return { input: { presentValue: 10000, annualRate: 5, years: 10 }, expectValid: true };
    case "compound_interest":
      return { input: { principal: 1000, annualRate: 5, years: 2 }, expectValid: true };
    case "simple_interest":
      return { input: { principal: 1000, annualRate: 5, years: 2 }, expectValid: true };
    case "effective_rate":
      return { input: { annualRate: 6, paymentsPerYear: 12 }, expectValid: true };
    case "nominal_rate":
      return { input: { percentage: 6.1678, paymentsPerYear: 12 }, expectValid: true };
    case "weighted_average_rate":
      return { input: { amounts: [100000, 50000], rates: [4, 6] }, expectValid: true };
    case "percentage_of_total":
      return { input: { part: 50, total: 200 }, expectValid: true };
    case "value_from_percentage":
      return { input: { part: 80, percentage: 12.5 }, expectValid: true };
    case "linear_loan":
      return { input: { principal: 10000, annualRate: 6, periods: 12 }, expectValid: true };
    case "indexed_amount":
      return { input: { startAmount: 1000, indexPercentages: [2, 3] }, expectValid: true };
    case "fraction_calculation":
      return { input: { percentage: 12.5 }, expectValid: true };
    case "required_grade":
      return {
        input: {
          targetScore: 7,
          totalWeight: 100,
          currentScores: [6, 8],
          currentWeights: [40, 30],
        },
        expectValid: true,
      };
    case "average_grade":
      return { input: { currentScores: [6, 7, 8] }, expectValid: true };
    case "roman_numerals":
      return { input: { numberInput: 2026 }, expectValid: true };
    case "dcf_valuation":
      return {
        input: { annualRate: 10, cashflows: [100, 100, 100], terminalValue: 1000 },
        expectValid: true,
      };
    case "percentage_composition":
      return { input: { percentage1: 10, percentage2: 20 }, expectValid: true };
    case "loan_amortization_schedule":
      return { input: { principal: 10000, annualRate: 6, periods: 12 }, expectValid: true };
    case "revolving_credit_comparison":
      return {
        input: {
          principal: 10000,
          oldAnnualRate: 10,
          newAnnualRate: 6,
          oldMonthlyPayment: 250,
          newMonthlyPayment: 250,
        },
        expectValid: true,
      };
    case "loan_total_cost":
      return { input: { principal: 10000, annualRate: 6, periods: 12 }, expectValid: true };
    case "loan_amount_from_payment":
      return { input: { payment: 860.66, annualRate: 6, periods: 12 }, expectValid: true };
    case "installment_purchase_cost":
      return {
        input: { purchasePrice: 1200, downPayment: 0, annualRate: 12, periods: 12 },
        expectValid: true,
      };
    case "financial_lease_payment":
      return {
        input: {
          purchasePrice: 30000,
          downPayment: 5000,
          residualValue: 5000,
          annualRate: 6,
          periods: 60,
        },
        expectValid: true,
      };
    case "loan_remaining_balance_after_period":
      return {
        input: {
          principal: 10000,
          payment: 860.66,
          annualRate: 6,
          monthsPaid: 6,
        },
        expectValid: true,
      };
    case "loan_term_months":
      return {
        input: { principal: 10000, payment: 860.66, annualRate: 6 },
        expectValid: true,
      };
    case "loan_monthly_payment":
      return { input: { principal: 10000, annualRate: 6, periods: 12 }, expectValid: true };
    case "max_loan_from_budget":
      return {
        input: { maxMonthlyPayment: 250, annualRate: 6, periods: 60 },
        expectValid: true,
      };
    case "personal_loan_comparison":
      return {
        input: {
          loanAmountA: 10000,
          annualRateA: 6,
          periodsA: 60,
          loanAmountB: 10000,
          annualRateB: 8,
          periodsB: 60,
        },
        expectValid: true,
      };
    case "loan_interest_rate":
      return {
        input: { principal: 10000, payment: 860.66, periods: 12 },
        expectValid: true,
      };
    case "financial_lease_interest_rate":
      return {
        input: {
          purchasePrice: 20000,
          downPayment: 0,
          residualValue: 5000,
          periods: 48,
          payment: 350.68,
        },
        expectValid: true,
      };
    case "financial_lease_remaining_balance":
      return {
        input: {
          purchasePrice: 20000,
          downPayment: 0,
          residualValue: 5000,
          annualRate: 5,
          periods: 48,
          monthsPaid: 24,
        },
        expectValid: true,
      };
    case "loan_remaining_balance":
      return {
        input: { principal: 10000, payment: 860.66, annualRate: 6, monthsPaid: 6 },
        expectValid: true,
      };
    case "student_loan_repayment":
      return {
        input: { principal: 30000, annualRate: 2, repaymentYears: 35 },
        expectValid: true,
      };
    case "debt_growth":
      return {
        input: { principal: 10000, annualRate: 12, payment: 0, periods: 12 },
        expectValid: true,
      };
    case "generic_contract":
    default:
      return getGenericFixtureForTool(toolSlug);
  }
}
