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

function genericContract(profile: ToolProfile, input: GenericCalculationInput): GenericCalculationResult {
  const numericValues = Object.values(input).map((value) => toNumber(value)).filter((value): value is number => value !== undefined);
  if (numericValues.length === 0) {
    return invalid(profile, ["Vul minimaal één numerieke invoer in."]);
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
    case "generic_contract":
      return genericContract(profile, input);
    default:
      return invalid("generic_contract", ["Onbekend profiel."]);
  }
}

export function getProfileFixture(profile: ToolProfile): ProfileFixture {
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
    case "generic_contract":
    default:
      return { input: { valueA: 100, valueB: 250 }, expectValid: true };
  }
}
