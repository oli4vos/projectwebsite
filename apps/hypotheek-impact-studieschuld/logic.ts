import {
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoRateForRule,
  getFinancialConstants,
  getIndicativeIncomeHousingCostRatio,
  getStudentDebtGrossUpFactor,
} from "@/lib/financial-constants";
import {
  calculateDuoDebtPortfolio,
  calculateIndicativeIncomeBasedMonthlyPayment,
  calculateDuoMonthlyPaymentAfterExtraRepayment as calculateDuoMonthlyPaymentAfterExtraRepaymentCentral,
  calculateExtraRepaymentPayoffImpact,
  determineRelevantDuoPayment as determineRelevantDuoPaymentCentral,
  sanitizeDuoMoney,
  sanitizeDuoPercent,
  type DuoDebtPartInput,
  type DuoDebtPortfolioSummary,
  type DuoSituation as CentralDuoSituation,
  type ExtraRepaymentPayoffImpactResult,
  type DuoPaymentSource as CentralDuoPaymentSource,
  type RepaymentRule as CentralRepaymentRule,
} from "@/lib/duo";
import {
  calculateAnnuityPayment as calculateMortgageAnnuityPayment,
  calculatePresentValueFromMonthlyPayment as calculateMortgagePresentValueFromMonthlyPayment,
} from "@/lib/mortgage";

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

export type RelevantDuoPaymentResult = {
  primaryNetMonthlyPayment: number;
  optimisticNetMonthlyPayment: number;
  conservativeNetMonthlyPayment: number;
  statutoryMonthlyPayment: number;
  estimatedStatutoryPayment: number;
  source: PaymentSource;
  explanation: string;
  warnings: string[];
};

export type MortgageImpactResult = {
  netDuoMonthlyPayment: number;
  legalMonthlyPayment: number;
  bruteringBaseMonthlyPayment: number;
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
  payoffWithLowerMonthlyPayment: ExtraRepaymentPayoffImpactResult;
  payoffWithShorterTerm: ExtraRepaymentPayoffImpactResult;
  warnings: string[];
};

export type HousingTargetSummary = {
  desiredHomePrice: number;
  ownMoney: number;
  neededMortgage: number;
  indicativeMortgageNeedWithStudentDebt: number;
  incomeBasedMaxMortgageIndicative: number;
  incomeBasedMaxMortgageWithStudentDebtIndicative: number;
  incomeToHousingCostRatioUsed: number;
  maxMortgageWithoutStudentDebt?: number;
  maxMortgageWithStudentDebtIndicative?: number;
  gapToTargetIfMaxProvided?: number;
  ownMoneyCoversHomePrice: boolean;
};

export type IncomeCapacitySummary = {
  incomeBasedMaxMortgageIndicative: number;
  incomeBasedMaxMortgageWithStudentDebtIndicative: number;
  incomeToHousingCostRatioUsed: number;
  monthlyBudgetFromIncome: number;
};

export type DuoMandatoryPaymentSummary = {
  annualIncomeUsed: number;
  allowanceUsed: number;
  amountAboveAllowance: number;
  percentageUsed: number | null;
  incomeBasedMonthlyPayment: number;
  statutoryMonthlyPayment: number;
  requiredMonthlyPayment: number;
  remainingChoiceBudgetMonthly: number;
  warnings: string[];
};

export type HypotheekImpactInput = {
  situation: DuoSituation;
  repaymentRule: RepaymentRule;
  actualMonthlyPayment?: number;
  statutoryMonthlyPayment?: number;
  remainingStudentDebt?: number;
  duoInterestRate?: number;
  duoRateYear?: number;
  duoDebtParts?: DuoDebtPartInput[];
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
  incomeCapacity: IncomeCapacitySummary;
  duoMandatoryPayment: DuoMandatoryPaymentSummary;
  debtPortfolio: DuoDebtPortfolioSummary;
  debtToIncomeRatio?: number;
  housingTarget?: HousingTargetSummary;
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
  return calculateMortgageAnnuityPayment({ principal, annualRate, years });
}

export function calculatePresentValueFromMonthlyPayment(
  monthlyPayment: number,
  annualRate: number,
  years: number,
): number {
  return calculateMortgagePresentValueFromMonthlyPayment({
    monthlyPayment,
    annualRate,
    years,
  });
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
    | "duoRateYear"
    | "duoDebtParts"
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
    duoRateYear: input.duoRateYear,
    debtParts: input.duoDebtParts,
    remainingTermYears: input.remainingTermYears,
  });

  return {
    primaryNetMonthlyPayment: result.primaryMonthlyPayment,
    optimisticNetMonthlyPayment: result.optimisticMonthlyPayment,
    conservativeNetMonthlyPayment: result.conservativeMonthlyPayment,
    statutoryMonthlyPayment: result.statutoryMonthlyPayment,
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
    | "duoRateYear"
    | "duoDebtParts"
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
  const legalMonthlyPayment = roundMoney(netDuoMonthlyPayment);
  const bruteringBaseMonthlyPayment = roundMoney(duoPayment.statutoryMonthlyPayment);
  const grossDuoMonthlyImpact = roundMoney(
    bruteringBaseMonthlyPayment * brutering.factor,
  );
  const principalImpact = calculatePresentValueFromMonthlyPayment(
    grossDuoMonthlyImpact,
    mortgageRate,
    mortgageTermYears,
  );

  return {
    netDuoMonthlyPayment,
    legalMonthlyPayment,
    bruteringBaseMonthlyPayment,
    bruteringFactor: brutering.factor,
    bruteringLabel: brutering.label,
    grossDuoMonthlyImpact,
    principalImpact,
    optimisticPrincipalImpact: principalImpact,
    conservativePrincipalImpact: principalImpact,
    assumptions: [
      "We gebruiken een indicatieve bruteringsstaffel om de annuïtaire DUO-maandlast naar een bruto vergelijkbare maandlast om te rekenen.",
      "Voor de brutering nemen we het annuïtaire DUO-bedrag dat nodig is om de studieschuld aan het einde van de looptijd op nul te brengen.",
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
    | "duoRateYear"
    | "duoDebtParts"
    | "remainingTermYears"
    | "extraRepayment"
    | "mortgageRate"
    | "mortgageTermYears"
  >,
): ExtraRepaymentScenarioResult {
  const debtPortfolio = calculateDuoDebtPortfolio({
    repaymentRule: input.repaymentRule,
    remainingDebt: input.remainingStudentDebt,
    annualInterestRate: input.duoInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears: input.remainingTermYears,
    debtParts: input.duoDebtParts,
  });
  const remainingStudentDebt = debtPortfolio.totalDebt;
  const duoRate = debtPortfolio.blendedAnnualInterestRate;
  const duoTermYears = getEffectiveDuoTerm(input);
  const mortgageRate = sanitizePercent(input.mortgageRate);
  const mortgageTermYears = sanitizeYears(input.mortgageTermYears, 30);
  const extraRepaymentInput = sanitizeOptionalMoney(input.extraRepayment) ?? 0;
  const repaymentScenario = calculateDuoMonthlyPaymentAfterExtraRepaymentCentral({
    repaymentRule: input.repaymentRule,
    remainingDebt: remainingStudentDebt,
    annualInterestRate: duoRate,
    duoRateYear: input.duoRateYear,
    debtParts: input.duoDebtParts,
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
  const payoffWithLowerMonthlyPayment = calculateExtraRepaymentPayoffImpact({
    repaymentRule: input.repaymentRule,
    remainingDebt: remainingStudentDebt,
    annualInterestRate: duoRate,
    duoRateYear: input.duoRateYear,
    debtParts: input.duoDebtParts,
    remainingTermYears: duoTermYears,
    monthlyPayment: oldEstimatedMonthlyPayment,
    extraRepaymentAmount: extraRepaymentInput,
    strategy: "lowerMonthlyPayment",
  });
  const payoffWithShorterTerm = calculateExtraRepaymentPayoffImpact({
    repaymentRule: input.repaymentRule,
    remainingDebt: remainingStudentDebt,
    annualInterestRate: duoRate,
    duoRateYear: input.duoRateYear,
    debtParts: input.duoDebtParts,
    remainingTermYears: duoTermYears,
    monthlyPayment: oldEstimatedMonthlyPayment,
    extraRepaymentAmount: extraRepaymentInput,
    strategy: "shortenTerm",
  });

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
    warnings.push(
      "Als DUO je maandbedrag verlaagt, zit het voordeel vooral in lagere maandlast. Alleen bij gelijk maandbedrag ben je duidelijk eerder klaar.",
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
    payoffWithLowerMonthlyPayment,
    payoffWithShorterTerm,
    warnings: [
      ...new Set([
        ...warnings,
        ...payoffWithLowerMonthlyPayment.warnings,
        ...payoffWithShorterTerm.warnings,
      ]),
    ],
  };
}

export function calculateHypotheekImpact(
  input: HypotheekImpactInput,
): HypotheekImpactResult {
  const grossIncomeUser = sanitizeMoney(input.grossIncomeUser);
  const grossIncomePartner = sanitizeMoney(input.grossIncomePartner);
  const grossIncomeTotal = roundMoney(grossIncomeUser + grossIncomePartner);
  const debtPortfolio = calculateDuoDebtPortfolio({
    repaymentRule: input.repaymentRule,
    remainingDebt: input.remainingStudentDebt,
    annualInterestRate: input.duoInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears: input.remainingTermYears,
    debtParts: input.duoDebtParts,
  });
  const remainingStudentDebt = debtPortfolio.totalDebt;
  const desiredHomePrice = sanitizeOptionalMoney(input.desiredHomePrice);
  const ownMoney = sanitizeOptionalMoney(input.ownMoney) ?? 0;
  const maxMortgageWithoutStudentDebt = sanitizeOptionalMoney(
    input.maxMortgageWithoutStudentDebt,
  );
  const duoRateUsed = debtPortfolio.blendedAnnualInterestRate;
  const duoTermYearsUsed = getEffectiveDuoTerm(input);
  const duoPayment = determineRelevantDuoPayment({
    ...input,
    duoInterestRate: duoRateUsed,
    duoRateYear: input.duoRateYear,
    duoDebtParts: input.duoDebtParts,
    remainingStudentDebt,
    remainingTermYears: duoTermYearsUsed,
  });
  const duoMandatoryBase = calculateIndicativeIncomeBasedMonthlyPayment({
    grossAnnualIncome: grossIncomeUser,
    partnerGrossAnnualIncome: grossIncomePartner,
    hasPartner: grossIncomePartner > 0,
    repaymentRule: input.repaymentRule,
    statutoryMonthlyPayment: duoPayment.estimatedStatutoryPayment,
  });
  const statutoryMonthlyPayment = roundMoney(duoPayment.estimatedStatutoryPayment);
  const requiredMonthlyPayment = roundMoney(
    Math.min(duoMandatoryBase.requiredMonthlyPayment, statutoryMonthlyPayment),
  );
  const remainingChoiceBudgetMonthly = roundMoney(
    Math.max(duoPayment.primaryNetMonthlyPayment - requiredMonthlyPayment, 0),
  );
  const mortgageImpact = calculateMortgageImpact({
    ...input,
    duoInterestRate: duoRateUsed,
    duoRateYear: input.duoRateYear,
    duoDebtParts: input.duoDebtParts,
    remainingStudentDebt,
    remainingTermYears: duoTermYearsUsed,
  });
  const extraRepaymentScenario = calculateExtraRepaymentScenario({
    ...input,
    duoInterestRate: duoRateUsed,
    duoRateYear: input.duoRateYear,
    duoDebtParts: input.duoDebtParts,
    remainingStudentDebt,
    remainingTermYears: duoTermYearsUsed,
  });
  const debtToIncomeRatio =
    remainingStudentDebt > 0
      ? safeRatio(remainingStudentDebt, grossIncomeTotal)
      : undefined;
  const incomeToHousingCostRatioUsed = getIndicativeIncomeHousingCostRatio(DEFAULT_YEAR);
  const monthlyBudgetFromIncome = roundMoney(
    (grossIncomeTotal * (incomeToHousingCostRatioUsed / 100)) / 12,
  );
  const incomeBasedMaxMortgageIndicative = calculatePresentValueFromMonthlyPayment(
    monthlyBudgetFromIncome,
    sanitizePercent(input.mortgageRate),
    sanitizeYears(
      input.mortgageTermYears,
      FINANCIAL_CONSTANTS.mortgage.defaultMortgageTermYears,
    ),
  );
  const incomeBasedMaxMortgageWithStudentDebtIndicative =
    calculatePresentValueFromMonthlyPayment(
      Math.max(monthlyBudgetFromIncome - mortgageImpact.grossDuoMonthlyImpact, 0),
      sanitizePercent(input.mortgageRate),
      sanitizeYears(
        input.mortgageTermYears,
        FINANCIAL_CONSTANTS.mortgage.defaultMortgageTermYears,
      ),
    );

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
      incomeBasedMaxMortgageIndicative,
      incomeBasedMaxMortgageWithStudentDebtIndicative,
      incomeToHousingCostRatioUsed,
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
    ...(debtPortfolio.usesDebtParts
      ? ["Opgesplitste leningdelen rekenen we per deel door met het gekozen rentejaar; daarna tellen we de wettelijke DUO-termijnen bij elkaar op."]
      : []),
    "De hoofdconclusie gebruikt netto DUO-last -> brutering -> indicatieve annuïtaire hypotheekimpact, niet alleen een grove jaarfactor.",
    "DUO-verplichting is indicatief benaderd als het laagste van wettelijk maandbedrag en draagkracht op basis van inkomen.",
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
    incomeCapacity: {
      incomeBasedMaxMortgageIndicative,
      incomeBasedMaxMortgageWithStudentDebtIndicative,
      incomeToHousingCostRatioUsed,
      monthlyBudgetFromIncome,
    },
    duoMandatoryPayment: {
      annualIncomeUsed: duoMandatoryBase.annualIncomeUsed,
      allowanceUsed: duoMandatoryBase.allowanceUsed,
      amountAboveAllowance: duoMandatoryBase.amountAboveAllowance,
      percentageUsed: duoMandatoryBase.percentageUsed,
      incomeBasedMonthlyPayment: duoMandatoryBase.incomeBasedMonthlyPayment,
      statutoryMonthlyPayment,
      requiredMonthlyPayment,
      remainingChoiceBudgetMonthly,
      warnings: duoMandatoryBase.warnings,
    },
    debtPortfolio,
    debtToIncomeRatio,
    housingTarget,
    duoRateUsed,
    duoTermYearsUsed,
    remainingStudentDebt,
    assumptions,
    warnings,
  };
}
