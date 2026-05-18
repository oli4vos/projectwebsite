import {
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoRateForRule,
  getFinancialConstants,
  getStudentDebtGrossUpFactor,
} from "@/lib/financial-constants";
import {
  calculateDuoMonthlyPaymentAfterExtraRepayment as calculateDuoMonthlyPaymentAfterExtraRepaymentCentral,
  determineRelevantDuoPayment as determineRelevantDuoPaymentCentral,
  sanitizeDuoMoney,
  sanitizeDuoPercent,
  type DuoSituation as CentralDuoSituation,
  type DuoPaymentSource as CentralDuoPaymentSource,
  type RepaymentRule as CentralRepaymentRule,
} from "@/lib/duo";

const DEFAULT_YEAR = getDefaultFinancialYear();
const FINANCIAL_CONSTANTS = getFinancialConstants(DEFAULT_YEAR);

export const LAST_CHECKED = FINANCIAL_CONSTANTS.duo.meta.lastChecked;

export type DuoSituation = CentralDuoSituation;

export type RepaymentRule = CentralRepaymentRule;

export type PaymentSource = CentralDuoPaymentSource;

export const DEFAULT_DUO_RATES_2026: Record<RepaymentRule, number> = {
  ...FINANCIAL_CONSTANTS.duo.rates,
};

export const DEFAULT_TERMS: Record<RepaymentRule, number> = {
  ...FINANCIAL_CONSTANTS.duo.defaultTerms,
};

export const BRUTERING_FACTORS: ReadonlyArray<{
  minRate: number;
  maxRate: number;
  factor: number;
  label: string;
}> = FINANCIAL_CONSTANTS.mortgage.studentDebtGrossUpFactors.map((band) => ({
  ...band,
  maxRate: band.maxRate === null ? Number.POSITIVE_INFINITY : band.maxRate,
}));

export const QUICK_RULE_SCENARIOS = [
  { key: "careful", label: "Voorzichtig", factor: 4.5 },
  { key: "middle", label: "Midden", factor: 5.0 },
  { key: "wide", label: "Ruim", factor: 5.5 },
] as const;

export type QuickRuleScenarioKey = (typeof QUICK_RULE_SCENARIOS)[number]["key"];

export type RelevantDuoPaymentResult = {
  primaryNetMonthlyPayment: number;
  optimisticNetMonthlyPayment: number;
  conservativeNetMonthlyPayment: number;
  estimatedStatutoryPayment: number;
  source: PaymentSource;
  explanation: string;
  warnings: string[];
};

export type MortgageImpactResult = {
  netDuoMonthlyPayment: number;
  bruteringFactor: number;
  bruteringLabel: string;
  grossDuoMonthlyImpact: number;
  principalImpact: number;
  optimisticPrincipalImpact: number;
  conservativePrincipalImpact: number;
  assumptions: string[];
  warnings: string[];
};

export type ExtraRepaymentScenarioResult = {
  extraRepaymentUsed: number;
  newStudentDebt: number;
  oldEstimatedMonthlyPayment: number;
  newEstimatedMonthlyPayment: number;
  monthlyPaymentReduction: number;
  grossMonthlyImpactReduction: number;
  extraMortgageRoomIndicative: number;
  ratio: number | null;
  warnings: string[];
};

export type HousingTargetSummary = {
  desiredHomePrice: number;
  ownMoney: number;
  neededMortgage: number;
  indicativeMortgageNeedWithStudentDebt: number;
  maxMortgageWithoutStudentDebt?: number;
  maxMortgageWithStudentDebtIndicative?: number;
  gapToTargetIfMaxProvided?: number;
  ownMoneyCoversHomePrice: boolean;
};

export type QuickRuleImpactScenario = {
  key: QuickRuleScenarioKey;
  label: string;
  factor: number;
  impact: number;
};

export type HypotheekImpactInput = {
  situation: DuoSituation;
  repaymentRule: RepaymentRule;
  actualMonthlyPayment?: number;
  statutoryMonthlyPayment?: number;
  remainingStudentDebt?: number;
  duoInterestRate?: number;
  remainingTermYears?: number;
  extraRepayment?: number;
  grossIncomeUser: number;
  grossIncomePartner: number;
  desiredHomePrice?: number;
  ownMoney?: number;
  maxMortgageWithoutStudentDebt?: number;
  mortgageRate: number;
  mortgageTermYears: number;
};

export type HypotheekImpactResult = {
  duoPayment: RelevantDuoPaymentResult;
  mortgageImpact: MortgageImpactResult;
  extraRepaymentScenario: ExtraRepaymentScenarioResult;
  grossIncomeTotal: number;
  debtToIncomeRatio?: number;
  housingTarget?: HousingTargetSummary;
  quickRuleImpactScenarios: QuickRuleImpactScenario[];
  duoRateUsed: number;
  duoTermYearsUsed: number;
  remainingStudentDebt: number;
  assumptions: string[];
  warnings: string[];
};

function sanitizeFiniteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function roundRatio(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value * 10000) / 10000;
}

function sanitizeYears(value: number, fallback = 0) {
  const safeValue = sanitizeFiniteNumber(value, fallback);

  if (safeValue <= 0) {
    return fallback > 0 ? fallback : 0;
  }

  return safeValue;
}

function sanitizeOptionalMoney(value?: number) {
  if (value === undefined) {
    return undefined;
  }

  return sanitizeMoney(value);
}

function safeRatio(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return undefined;
  }

  return roundRatio(numerator / denominator);
}

function getEffectiveDuoRate(input: {
  repaymentRule: RepaymentRule;
  duoInterestRate?: number;
}) {
  return input.duoInterestRate === undefined
    ? getDefaultDuoRate(input.repaymentRule)
    : sanitizePercent(input.duoInterestRate);
}

function getEffectiveDuoTerm(input: {
  repaymentRule: RepaymentRule;
  remainingTermYears?: number;
}) {
  const defaultTerm = getDefaultTerm(input.repaymentRule);

  if (input.remainingTermYears === undefined) {
    return defaultTerm;
  }

  const sanitizedTerm = sanitizeYears(input.remainingTermYears, 0);
  return sanitizedTerm > 0 ? sanitizedTerm : defaultTerm;
}

export function sanitizeMoney(value: number): number {
  return sanitizeDuoMoney(value);
}

export function sanitizePercent(value: number): number {
  return sanitizeDuoPercent(value);
}

export function getDefaultDuoRate(rule: RepaymentRule): number {
  return getDuoRateForRule(rule, DEFAULT_YEAR);
}

export function getDefaultTerm(rule: RepaymentRule): number {
  return getDuoDefaultTermForRule(rule, DEFAULT_YEAR);
}

export function calculateAnnuityPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  const safePrincipal = sanitizeMoney(principal);
  const safeAnnualRate = sanitizePercent(annualRate);
  const safeYears = sanitizeYears(years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (safePrincipal === 0 || months === 0) {
    return 0;
  }

  if (safeAnnualRate === 0) {
    return roundMoney(safePrincipal / months);
  }

  const monthlyRate = safeAnnualRate / 100 / 12;
  const denominator = 1 - (1 + monthlyRate) ** -months;

  if (denominator <= 0) {
    return 0;
  }

  return roundMoney((safePrincipal * monthlyRate) / denominator);
}

export function calculatePresentValueFromMonthlyPayment(
  monthlyPayment: number,
  annualRate: number,
  years: number,
): number {
  const safeMonthlyPayment = sanitizeMoney(monthlyPayment);
  const safeAnnualRate = sanitizePercent(annualRate);
  const safeYears = sanitizeYears(years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (safeMonthlyPayment === 0 || months === 0) {
    return 0;
  }

  if (safeAnnualRate === 0) {
    return roundMoney(safeMonthlyPayment * months);
  }

  const monthlyRate = safeAnnualRate / 100 / 12;

  return roundMoney(
    safeMonthlyPayment * (1 - (1 + monthlyRate) ** -months) / monthlyRate,
  );
}

export function getBruteringFactor(mortgageRate: number): {
  factor: number;
  label: string;
} {
  const safeMortgageRate = sanitizePercent(mortgageRate);
  const band = getStudentDebtGrossUpFactor(safeMortgageRate, DEFAULT_YEAR);

  return {
    factor: band.factor,
    label: band.label,
  };
}

export function determineRelevantDuoPayment(
  input: Pick<
    HypotheekImpactInput,
    | "situation"
    | "repaymentRule"
    | "actualMonthlyPayment"
    | "statutoryMonthlyPayment"
    | "remainingStudentDebt"
    | "duoInterestRate"
    | "remainingTermYears"
  >,
): RelevantDuoPaymentResult {
  const result = determineRelevantDuoPaymentCentral({
    situation: input.situation,
    repaymentRule: input.repaymentRule,
    currentMonthlyPayment: input.actualMonthlyPayment,
    statutoryMonthlyPayment: input.statutoryMonthlyPayment,
    remainingDebt: input.remainingStudentDebt,
    annualInterestRate: input.duoInterestRate,
    remainingTermYears: input.remainingTermYears,
  });

  return {
    primaryNetMonthlyPayment: result.primaryMonthlyPayment,
    optimisticNetMonthlyPayment: result.optimisticMonthlyPayment,
    conservativeNetMonthlyPayment: result.conservativeMonthlyPayment,
    estimatedStatutoryPayment: result.estimatedStatutoryMonthlyPayment,
    source: result.source,
    explanation: result.explanation,
    warnings: result.warnings,
  };
}

export function calculateMortgageImpact(
  input: Pick<
    HypotheekImpactInput,
    | "situation"
    | "repaymentRule"
    | "actualMonthlyPayment"
    | "statutoryMonthlyPayment"
    | "remainingStudentDebt"
    | "duoInterestRate"
    | "remainingTermYears"
    | "mortgageRate"
    | "mortgageTermYears"
  >,
): MortgageImpactResult {
  const duoPayment = determineRelevantDuoPayment(input);
  const mortgageRate = sanitizePercent(input.mortgageRate);
  const mortgageTermYears = sanitizeYears(input.mortgageTermYears, 30);
  const brutering = getBruteringFactor(mortgageRate);
  const netDuoMonthlyPayment = roundMoney(duoPayment.primaryNetMonthlyPayment);
  const grossDuoMonthlyImpact = roundMoney(netDuoMonthlyPayment * brutering.factor);
  const principalImpact = calculatePresentValueFromMonthlyPayment(
    grossDuoMonthlyImpact,
    mortgageRate,
    mortgageTermYears,
  );
  const optimisticPrincipalImpact = calculatePresentValueFromMonthlyPayment(
    roundMoney(duoPayment.optimisticNetMonthlyPayment * brutering.factor),
    mortgageRate,
    mortgageTermYears,
  );
  const conservativePrincipalImpact = calculatePresentValueFromMonthlyPayment(
    roundMoney(duoPayment.conservativeNetMonthlyPayment * brutering.factor),
    mortgageRate,
    mortgageTermYears,
  );

  return {
    netDuoMonthlyPayment,
    bruteringFactor: brutering.factor,
    bruteringLabel: brutering.label,
    grossDuoMonthlyImpact,
    principalImpact,
    optimisticPrincipalImpact,
    conservativePrincipalImpact,
    assumptions: [
      "We gebruiken een indicatieve bruteringsstaffel om een netto DUO-last om te rekenen naar een bruto vergelijkbare maandlast.",
      `Voor de hypotheekimpact rekenen we met ${mortgageRate.toFixed(2).replace(".", ",")}% hypotheekrente en ${mortgageTermYears} jaar looptijd.`,
      "De hoofdsom-impact volgt uit de contante waarde van die gebruteerde maandlast als annuïteit.",
      "Een hogere bruteringsfactor verhoogt altijd de maandlast-impact. Bij hogere hypotheekrente kan de hoofdsom-impact toch lager lijken, omdat dezelfde maandlast dan minder leenhoofdsom vertegenwoordigt.",
    ],
    warnings: duoPayment.warnings,
  };
}

export function calculateExtraRepaymentScenario(
  input: Pick<
    HypotheekImpactInput,
    | "repaymentRule"
    | "remainingStudentDebt"
    | "duoInterestRate"
    | "remainingTermYears"
    | "extraRepayment"
    | "mortgageRate"
    | "mortgageTermYears"
  >,
): ExtraRepaymentScenarioResult {
  const remainingStudentDebt = sanitizeOptionalMoney(input.remainingStudentDebt) ?? 0;
  const duoRate = getEffectiveDuoRate(input);
  const duoTermYears = getEffectiveDuoTerm(input);
  const mortgageRate = sanitizePercent(input.mortgageRate);
  const mortgageTermYears = sanitizeYears(input.mortgageTermYears, 30);
  const extraRepaymentInput = sanitizeOptionalMoney(input.extraRepayment) ?? 0;
  const repaymentScenario = calculateDuoMonthlyPaymentAfterExtraRepaymentCentral({
    repaymentRule: input.repaymentRule,
    remainingDebt: remainingStudentDebt,
    annualInterestRate: duoRate,
    remainingTermYears: duoTermYears,
    extraRepaymentAmount: extraRepaymentInput,
  });
  const extraRepaymentUsed = repaymentScenario.extraRepaymentUsed;
  const newStudentDebt = repaymentScenario.newRemainingDebt;
  const oldEstimatedMonthlyPayment = repaymentScenario.oldStatutoryMonthlyPayment;
  const newEstimatedMonthlyPayment = repaymentScenario.newStatutoryMonthlyPayment;
  const monthlyPaymentReduction = repaymentScenario.monthlyPaymentReduction;
  const brutering = getBruteringFactor(mortgageRate);
  const grossMonthlyImpactReduction = roundMoney(
    monthlyPaymentReduction * brutering.factor,
  );
  const extraMortgageRoomIndicative = calculatePresentValueFromMonthlyPayment(
    grossMonthlyImpactReduction,
    mortgageRate,
    mortgageTermYears,
  );
  const warnings: string[] = [];

  if (remainingStudentDebt === 0) {
    warnings.push(
      "Zonder resterende studieschuld kunnen we geen effect van extra aflossen schatten.",
    );
  }

  if (extraRepaymentInput > remainingStudentDebt && remainingStudentDebt > 0) {
    warnings.push(
      "Extra aflossen is begrensd op je ingevulde resterende studieschuld.",
    );
  }

  if (extraRepaymentUsed > 0) {
    warnings.push(
      "Dit effect ontstaat alleen als DUO je maandbedrag na extra aflossen daadwerkelijk verlaagt.",
    );
    warnings.push(
      "Vraag na extra aflossen altijd een nieuw DUO-overzicht op voordat je een hypotheekgesprek ingaat.",
    );
    warnings.push(
      "Extra aflossen is niet automatisch slim: buffer, aankoopkosten, verduurzaming of lagere hypotheek kunnen ook waardevoller zijn.",
    );
  }

  return {
    extraRepaymentUsed,
    newStudentDebt,
    oldEstimatedMonthlyPayment,
    newEstimatedMonthlyPayment,
    monthlyPaymentReduction,
    grossMonthlyImpactReduction,
    extraMortgageRoomIndicative,
    ratio:
      extraRepaymentUsed > 0
        ? roundRatio(extraMortgageRoomIndicative / extraRepaymentUsed)
        : null,
    warnings,
  };
}

function calculateQuickRuleScenarios(
  netMonthlyPayment: number,
): QuickRuleImpactScenario[] {
  const duoYearlyPayment = sanitizeMoney(netMonthlyPayment) * 12;

  return QUICK_RULE_SCENARIOS.map((scenario) => ({
    ...scenario,
    impact: roundMoney(duoYearlyPayment * scenario.factor),
  }));
}

export function calculateHypotheekImpact(
  input: HypotheekImpactInput,
): HypotheekImpactResult {
  const grossIncomeUser = sanitizeMoney(input.grossIncomeUser);
  const grossIncomePartner = sanitizeMoney(input.grossIncomePartner);
  const grossIncomeTotal = roundMoney(grossIncomeUser + grossIncomePartner);
  const remainingStudentDebt = sanitizeOptionalMoney(input.remainingStudentDebt) ?? 0;
  const desiredHomePrice = sanitizeOptionalMoney(input.desiredHomePrice);
  const ownMoney = sanitizeOptionalMoney(input.ownMoney) ?? 0;
  const maxMortgageWithoutStudentDebt = sanitizeOptionalMoney(
    input.maxMortgageWithoutStudentDebt,
  );
  const duoRateUsed = getEffectiveDuoRate(input);
  const duoTermYearsUsed = getEffectiveDuoTerm(input);
  const duoPayment = determineRelevantDuoPayment({
    ...input,
    duoInterestRate: duoRateUsed,
    remainingTermYears: duoTermYearsUsed,
  });
  const mortgageImpact = calculateMortgageImpact({
    ...input,
    duoInterestRate: duoRateUsed,
    remainingTermYears: duoTermYearsUsed,
  });
  const extraRepaymentScenario = calculateExtraRepaymentScenario({
    ...input,
    duoInterestRate: duoRateUsed,
    remainingTermYears: duoTermYearsUsed,
  });
  const quickRuleImpactScenarios = calculateQuickRuleScenarios(
    duoPayment.primaryNetMonthlyPayment,
  );
  const debtToIncomeRatio =
    remainingStudentDebt > 0
      ? safeRatio(remainingStudentDebt, grossIncomeTotal)
      : undefined;

  const housingTarget = (() => {
    if (desiredHomePrice === undefined) {
      return undefined;
    }

    const neededMortgage = roundMoney(Math.max(desiredHomePrice - ownMoney, 0));
    const ownMoneyCoversHomePrice = ownMoney >= desiredHomePrice;
    const indicativeMortgageNeedWithStudentDebt = ownMoneyCoversHomePrice
      ? 0
      : roundMoney(neededMortgage + mortgageImpact.principalImpact);

    const summary: HousingTargetSummary = {
      desiredHomePrice,
      ownMoney,
      neededMortgage,
      indicativeMortgageNeedWithStudentDebt,
      ownMoneyCoversHomePrice,
    };

    if (maxMortgageWithoutStudentDebt !== undefined) {
      summary.maxMortgageWithoutStudentDebt = maxMortgageWithoutStudentDebt;
      summary.maxMortgageWithStudentDebtIndicative = roundMoney(
        Math.max(
          maxMortgageWithoutStudentDebt - mortgageImpact.principalImpact,
          0,
        ),
      );
      summary.gapToTargetIfMaxProvided = roundMoney(
        Math.max(
          neededMortgage - (summary.maxMortgageWithStudentDebtIndicative ?? 0),
          0,
        ),
      );
    }

    return summary;
  })();

  const assumptions = [
    `Bedragen en aannames gecontroleerd op ${LAST_CHECKED}.`,
    `Voor ${input.repaymentRule === "UNKNOWN" ? "de onbekende terugbetalingsregel" : input.repaymentRule} rekenen we standaard met ${duoRateUsed.toFixed(2).replace(".", ",")}% DUO-rente en ${duoTermYearsUsed} jaar als je geen eigen waarden invult.`,
    "De hoofdconclusie gebruikt netto DUO-last -> brutering -> indicatieve annuïtaire hypotheekimpact, niet alleen een grove jaarfactor.",
  ];

  const warnings = [
    ...duoPayment.warnings,
    ...mortgageImpact.warnings,
    ...extraRepaymentScenario.warnings,
  ].filter((warning, index, all) => all.indexOf(warning) === index);

  return {
    duoPayment,
    mortgageImpact,
    extraRepaymentScenario,
    grossIncomeTotal,
    debtToIncomeRatio,
    housingTarget,
    quickRuleImpactScenarios,
    duoRateUsed,
    duoTermYearsUsed,
    remainingStudentDebt,
    assumptions,
    warnings,
  };
}
