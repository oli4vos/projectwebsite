import {
  getAvailableDuoRateYears,
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoIncomeBasedRuleForRepaymentRule,
  getDuoRateForRule,
} from "@/lib/financial-constants";
import type {
  DuoDebtPartInput,
  DuoDebtPartResolved,
  DuoDebtPortfolioSummary,
  DuoIncomeBasedMonthlyPaymentResult,
  DuoExtraRepaymentProjectionInput,
  DuoExtraRepaymentProjectionResult,
  DuoRepaymentTimelinePoint,
  DuoRepaymentTimelineSummary,
  DuoMonthlyPaymentAfterExtraRepaymentInput,
  DuoPayoffTimingInput,
  DuoPayoffTimingResult,
  DuoRelevantPaymentInput,
  ExtraRepaymentPayoffImpactInput,
  ExtraRepaymentPayoffImpactResult,
  ExtraRepaymentStrategy,
  ExtraRepaymentVsInvestingInput,
  RelevantDuoPaymentResult,
  RepaymentRule,
} from "@/lib/duo/types";

const DEFAULT_YEAR = getDefaultFinancialYear();
const DEFAULT_DUO_RATE_YEARS = getAvailableDuoRateYears(5);
const DUO_DRAAGKRACHT_SOURCE_URL =
  "https://duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp";
const DUO_PAYOFF_STRATEGY_WARNING =
  "Deze berekening is indicatief. Als DUO je maandbedrag na extra aflossen verlaagt, ben je niet automatisch eerder klaar; je betaalt dan vooral per maand minder. Als je maandbedrag gelijk blijft, kan extra aflossen juist de looptijd verkorten. Controleer dit altijd in Mijn DUO.";

function safeFinite(value: number | undefined, fallback = 0) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function roundMoney(value: number) {
  return Math.round(sanitizeDuoMoney(value) * 100) / 100;
}

function sanitizeYears(value: number | undefined, fallback = 0) {
  const safeValue = safeFinite(value, fallback);
  if (safeValue <= 0) {
    return fallback > 0 ? fallback : 0;
  }
  return safeValue;
}

function resolveRepaymentRule(rule?: RepaymentRule): RepaymentRule {
  return rule ?? "UNKNOWN";
}

function resolveDuoRate(input: {
  annualInterestRate?: number;
  duoRateYear?: number;
  repaymentRule?: RepaymentRule;
}) {
  const rule = resolveRepaymentRule(input.repaymentRule);
  const rateYear = resolveDuoRateYear(input.duoRateYear);
  if (input.annualInterestRate === undefined) {
    return sanitizeDuoPercent(getDuoRateForRule(rule, rateYear));
  }
  return sanitizeDuoPercent(input.annualInterestRate);
}

function resolveDuoRateYear(rateYear?: number) {
  if (rateYear === undefined || rateYear === null || !Number.isFinite(rateYear)) {
    return DEFAULT_YEAR;
  }

  const roundedYear = Math.round(rateYear);
  return DEFAULT_DUO_RATE_YEARS.includes(roundedYear) ? roundedYear : DEFAULT_YEAR;
}

function resolveDuoTerm(input: {
  remainingTermYears?: number;
  repaymentRule?: RepaymentRule;
}) {
  const rule = resolveRepaymentRule(input.repaymentRule);
  const defaultTerm = getDuoDefaultTermForRule(rule, DEFAULT_YEAR);
  if (input.remainingTermYears === undefined) {
    return defaultTerm;
  }
  return sanitizeYears(input.remainingTermYears, defaultTerm);
}

function createDefaultStartDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function parseStartDate(startDate?: string) {
  if (!startDate) {
    return createDefaultStartDate();
  }

  const parsed = new Date(startDate);
  if (Number.isNaN(parsed.getTime())) {
    return createDefaultStartDate();
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatYearMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function calculateAnnuityMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
) {
  const safePrincipal = sanitizeDuoMoney(principal);
  const safeAnnualRate = sanitizeDuoPercent(annualRate);
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

function calculateSingleDebtStatutoryMonthlyPayment(input: {
  remainingDebt?: number;
  annualInterestRate?: number;
  remainingTermYears?: number;
}) {
  return calculateAnnuityMonthlyPayment(
    input.remainingDebt ?? 0,
    input.annualInterestRate ?? 0,
    input.remainingTermYears ?? 0,
  );
}

function createResolvedDebtPart(input: {
  index: number;
  part: DuoDebtPartInput;
  repaymentRule?: RepaymentRule;
  remainingTermYears: number;
  fallbackRateYear?: number;
}): DuoDebtPartResolved {
  const remainingDebt = sanitizeDuoMoney(input.part.remainingDebt);
  const rateYear = resolveDuoRateYear(input.part.rateYear ?? input.fallbackRateYear);
  const annualInterestRate = resolveDuoRate({
    annualInterestRate: input.part.annualInterestRate,
    duoRateYear: rateYear,
    repaymentRule: input.repaymentRule,
  });

  return {
    key: `${rateYear}-${input.index}`,
    label: input.part.label?.trim() || `Leningdeel ${input.index + 1}`,
    remainingDebt,
    rateYear,
    annualInterestRate,
    statutoryMonthlyPayment: calculateSingleDebtStatutoryMonthlyPayment({
      remainingDebt,
      annualInterestRate,
      remainingTermYears: input.remainingTermYears,
    }),
    debtShare: 0,
  };
}

function toDebtShare(value: number, total: number) {
  if (total <= 0 || !Number.isFinite(value)) {
    return 0;
  }

  return roundMoney(value / total);
}

export function calculateDuoDebtPortfolio(
  input: DuoRelevantPaymentInput,
): DuoDebtPortfolioSummary {
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const fallbackRateYear = resolveDuoRateYear(input.duoRateYear);
  const partsInput = (input.debtParts ?? []).filter(
    (part) => sanitizeDuoMoney(part.remainingDebt) > 0,
  );

  if (partsInput.length === 0) {
    const annualInterestRate = resolveDuoRate({
      annualInterestRate: input.annualInterestRate,
      duoRateYear: input.duoRateYear,
      repaymentRule,
    });
    const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
    const statutoryMonthlyPayment = calculateSingleDebtStatutoryMonthlyPayment({
      remainingDebt,
      annualInterestRate,
      remainingTermYears,
    });

    return {
      usesDebtParts: false,
      totalDebt: remainingDebt,
      totalStatutoryMonthlyPayment: statutoryMonthlyPayment,
      blendedAnnualInterestRate: annualInterestRate,
      rateYearUsed: fallbackRateYear,
      parts: [
        {
          key: `${fallbackRateYear}-single`,
          label: "Totale studieschuld",
          remainingDebt,
          rateYear: fallbackRateYear,
          annualInterestRate,
          statutoryMonthlyPayment,
          debtShare: remainingDebt > 0 ? 1 : 0,
        },
      ],
      warnings: [],
    };
  }

  const unresolvedParts = partsInput.map((part, index) =>
    createResolvedDebtPart({
      index,
      part,
      repaymentRule,
      remainingTermYears,
      fallbackRateYear,
    }),
  );
  const totalDebt = roundMoney(
    unresolvedParts.reduce((sum, part) => sum + part.remainingDebt, 0),
  );
  const totalStatutoryMonthlyPayment = roundMoney(
    unresolvedParts.reduce((sum, part) => sum + part.statutoryMonthlyPayment, 0),
  );
  const blendedAnnualInterestRate =
    totalDebt > 0
      ? roundMoney(
          unresolvedParts.reduce(
            (sum, part) => sum + part.remainingDebt * part.annualInterestRate,
            0,
          ) / totalDebt,
        )
      : 0;
  const parts = unresolvedParts.map((part) => ({
    ...part,
    debtShare: toDebtShare(part.remainingDebt, totalDebt),
  }));

  return {
    usesDebtParts: true,
    totalDebt,
    totalStatutoryMonthlyPayment,
    blendedAnnualInterestRate,
    rateYearUsed: fallbackRateYear,
    parts,
    warnings: [
      "Leningdelen gebruiken per deel het gekozen rentejaar. De totale wettelijke DUO-termijn is de som van de annuïtaire termijnen per deel.",
    ],
  };
}

type DuoDebtPortfolioAllocationPart = DuoDebtPartResolved & {
  extraRepaymentApplied: number;
};

export function applyExtraRepaymentToDuoDebtPortfolio(input: DuoRelevantPaymentInput & {
  extraRepaymentAmount?: number;
}) {
  const portfolio = calculateDuoDebtPortfolio(input);
  const extraRepaymentInput = sanitizeDuoMoney(input.extraRepaymentAmount);
  const extraRepaymentUsed = Math.min(extraRepaymentInput, portfolio.totalDebt);
  let remainingExtraRepayment = extraRepaymentUsed;

  const parts: DuoDebtPortfolioAllocationPart[] = [...portfolio.parts]
    .map((part) => ({
      ...part,
      extraRepaymentApplied: 0,
    }))
    .sort((left, right) => {
      if (right.annualInterestRate !== left.annualInterestRate) {
        return right.annualInterestRate - left.annualInterestRate;
      }

      return right.remainingDebt - left.remainingDebt;
    })
    .map((part) => {
      if (remainingExtraRepayment <= 0 || part.remainingDebt <= 0) {
        return part;
      }

      const extraRepaymentApplied = Math.min(remainingExtraRepayment, part.remainingDebt);
      remainingExtraRepayment = roundMoney(remainingExtraRepayment - extraRepaymentApplied);

      return {
        ...part,
        remainingDebt: roundMoney(part.remainingDebt - extraRepaymentApplied),
        extraRepaymentApplied: roundMoney(extraRepaymentApplied),
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));

  const totalDebt = roundMoney(parts.reduce((sum, part) => sum + part.remainingDebt, 0));

  return {
    extraRepaymentUsed: roundMoney(extraRepaymentUsed),
    newRemainingDebt: totalDebt,
    parts,
    warnings:
      portfolio.usesDebtParts && extraRepaymentUsed > 0
        ? [
            "Bij opgesplitste leningdelen verlaagt deze tool de duurste rente-eerst, in lijn met DUO-uitleg over extra aflossen.",
          ]
        : [],
  };
}

function futureValueLumpSum(principal: number, annualRate: number, years: number) {
  const safePrincipal = sanitizeDuoMoney(principal);
  const safeRate = sanitizeDuoPercent(annualRate);
  const safeYears = sanitizeYears(years, 0);

  if (safePrincipal === 0 || safeYears === 0) {
    return 0;
  }

  if (safeRate === 0) {
    return roundMoney(safePrincipal);
  }

  return roundMoney(safePrincipal * (1 + safeRate / 100) ** safeYears);
}

function futureValueMonthlyContributions(
  monthlyAmount: number,
  annualRate: number,
  years: number,
) {
  const safeMonthlyAmount = sanitizeDuoMoney(monthlyAmount);
  const safeRate = sanitizeDuoPercent(annualRate);
  const safeYears = sanitizeYears(years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (safeMonthlyAmount === 0 || months === 0) {
    return 0;
  }

  const monthlyRate = safeRate / 100 / 12;
  if (monthlyRate === 0) {
    return roundMoney(safeMonthlyAmount * months);
  }

  return roundMoney(
    safeMonthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate),
  );
}

export function sanitizeDuoMoney(value: number | undefined): number {
  return Math.max(safeFinite(value, 0), 0);
}

export function sanitizeDuoPercent(value: number | undefined): number {
  return Math.min(Math.max(safeFinite(value, 0), 0), 100);
}

export function calculateStatutoryDuoMonthlyPayment(input: DuoRelevantPaymentInput) {
  return calculateDuoDebtPortfolio(input).totalStatutoryMonthlyPayment;
}

export function calculateIndicativeIncomeBasedMonthlyPayment(input: {
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  repaymentRule?: RepaymentRule;
  statutoryMonthlyPayment?: number;
}): DuoIncomeBasedMonthlyPaymentResult {
  const rule = resolveRepaymentRule(input.repaymentRule);
  const ruleConfig = getDuoIncomeBasedRuleForRepaymentRule(rule, DEFAULT_YEAR);
  const hasPartner =
    input.hasPartner ?? sanitizeDuoMoney(input.partnerGrossAnnualIncome) > 0;
  const annualIncomeUsed = roundMoney(
    sanitizeDuoMoney(input.grossAnnualIncome) +
      sanitizeDuoMoney(input.partnerGrossAnnualIncome),
  );
  const allowanceUsed = hasPartner
    ? ruleConfig.partnerOrSingleParentAllowance
    : ruleConfig.singleAllowance;
  const amountAboveAllowance = roundMoney(Math.max(annualIncomeUsed - allowanceUsed, 0));
  const warnings: string[] = [];

  if (rule === "SF15_OLD") {
    warnings.push(
      "SF15-oud gebruikt schijven met oplopende percentages. Deze tool toont daarom alleen een richting op basis van je wettelijke maandbedrag.",
    );
  }

  if (rule === "UNKNOWN") {
    warnings.push(
      "Onbekende terugbetalingsregel: draagkrachtberekening valt indicatief terug op SF35-aannames.",
    );
  }

  const statutoryMonthlyPayment = sanitizeDuoMoney(input.statutoryMonthlyPayment);
  const incomeBasedMonthlyPayment =
    ruleConfig.percentage === null
      ? 0
      : roundMoney((amountAboveAllowance * (ruleConfig.percentage / 100)) / 12);
  const requiredMonthlyPayment =
    statutoryMonthlyPayment > 0
      ? roundMoney(Math.min(incomeBasedMonthlyPayment, statutoryMonthlyPayment))
      : incomeBasedMonthlyPayment;

  if (statutoryMonthlyPayment > 0) {
    warnings.push(
      "DUO vergelijkt draagkracht met je wettelijke maandbedrag. Je betaalt het laagste van die twee.",
    );
  }

  warnings.push(
    `Indicatief model op basis van DUO-uitleg over maandbedrag en draagkracht (${DUO_DRAAGKRACHT_SOURCE_URL}).`,
  );
  warnings.push(
    "Bijzondere DUO-situaties zoals peiljaarverlegging, buitenlandse inkomenssituaties en regeling-specifieke uitzonderingen zijn niet volledig doorgerekend in dit model.",
  );

  warnings.push(
    "Extra aflossen boven je verplichte bedrag blijft een keuze. Dat deel kun je ook als alternatiefscenario inzetten voor buffer of andere doelen.",
  );

  return {
    annualIncomeUsed,
    allowanceUsed: roundMoney(allowanceUsed),
    amountAboveAllowance,
    percentageUsed: ruleConfig.percentage,
    incomeBasedMonthlyPayment,
    requiredMonthlyPayment,
    source:
      rule === "UNKNOWN"
        ? "unknownRuleFallback"
        : ruleConfig.percentage === null
          ? "statutoryOnly"
          : "incomeBased",
    warnings,
  };
}

export function calculateRemainingDebtAfterExtraRepayment(
  remainingDebt: number,
  extraRepaymentAmount: number,
) {
  const safeDebt = sanitizeDuoMoney(remainingDebt);
  const safeRepayment = sanitizeDuoMoney(extraRepaymentAmount);
  return roundMoney(Math.max(safeDebt - safeRepayment, 0));
}

export function calculateDuoMonthlyPaymentAfterExtraRepayment(
  input: DuoMonthlyPaymentAfterExtraRepaymentInput,
) {
  const safeDebt = sanitizeDuoMoney(input.remainingDebt);
  const oldPortfolio = calculateDuoDebtPortfolio(input);
  const repayment = applyExtraRepaymentToDuoDebtPortfolio({
    ...input,
    remainingDebt: safeDebt,
    extraRepaymentAmount: input.extraRepaymentAmount,
  });
  const newStatutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    repaymentRule: input.repaymentRule,
    annualInterestRate: input.annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears: input.remainingTermYears,
    remainingDebt: repayment.newRemainingDebt,
    debtParts: repayment.parts.map((part) => ({
      label: part.label,
      remainingDebt: part.remainingDebt,
      rateYear: part.rateYear,
      annualInterestRate: part.annualInterestRate,
    })),
  });
  const monthlyPaymentReduction = roundMoney(
    Math.max(oldPortfolio.totalStatutoryMonthlyPayment - newStatutoryMonthlyPayment, 0),
  );

  return {
    extraRepaymentUsed: repayment.extraRepaymentUsed,
    oldStatutoryMonthlyPayment: oldPortfolio.totalStatutoryMonthlyPayment,
    newStatutoryMonthlyPayment,
    monthlyPaymentReduction,
    newRemainingDebt: repayment.newRemainingDebt,
  };
}

export function calculateRemainingMonthsToPayOff(input: DuoPayoffTimingInput) {
  const portfolio = calculateDuoDebtPortfolio(input);
  const remainingDebt = portfolio.totalDebt;
  if (remainingDebt <= 0) {
    return 0;
  }

  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const maxMonths = Math.max(Math.round(remainingTermYears * 12), 0);

  if (maxMonths <= 0) {
    return 0;
  }

  const statutoryMonthlyPayment = portfolio.totalStatutoryMonthlyPayment;

  const monthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const monthlyPayment =
    monthlyPaymentInput > 0 ? monthlyPaymentInput : statutoryMonthlyPayment;

  if (monthlyPayment <= 0) {
    return maxMonths;
  }

  return projectDuoRepaymentTimeline({
    remainingDebt,
    annualInterestRate: input.annualInterestRate ?? portfolio.blendedAnnualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: input.debtParts,
    monthlyPayment,
    startDate: input.startDate,
  }).months;
}

export function calculatePayoffDate(input: DuoPayoffTimingInput): DuoPayoffTimingResult {
  const portfolio = calculateDuoDebtPortfolio(input);
  const remainingDebt = portfolio.totalDebt;
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const statutoryMonthlyPayment = portfolio.totalStatutoryMonthlyPayment;
  const monthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const monthlyPayment =
    monthlyPaymentInput > 0 ? monthlyPaymentInput : statutoryMonthlyPayment;
  const warnings: string[] = [];
  const startDate = parseStartDate(input.startDate);

  if (remainingDebt === 0) {
    return {
      monthsRemaining: 0,
      yearsRemaining: 0,
      payoffDate: null,
      explanation: "Je resterende studieschuld staat op nul.",
      warnings,
    };
  }

  if (monthlyPaymentInput <= 0) {
    warnings.push(
      "Maandbedrag ontbrak of was ongeldig; voor de aflosdatum gebruiken we een annuïtaire schatting.",
    );
  }

  const monthsRemaining = calculateRemainingMonthsToPayOff({
    remainingDebt,
    annualInterestRate: input.annualInterestRate ?? portfolio.blendedAnnualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: input.debtParts,
    monthlyPayment,
    startDate: input.startDate,
  });
  const yearsRemaining = roundMoney(monthsRemaining / 12);
  const payoffDate = monthsRemaining > 0 ? formatYearMonth(addMonths(startDate, monthsRemaining)) : null;
  const maxMonths = Math.max(Math.round(remainingTermYears * 12), 0);

  if (monthsRemaining >= maxMonths && monthlyPaymentInput > 0 && monthlyPayment < statutoryMonthlyPayment) {
    warnings.push(
      "Je maandbedrag ligt lager dan de wettelijke annuïtaire schatting. Daardoor is de echte aflosdatum onzeker.",
    );
  }

  return {
    monthsRemaining,
    yearsRemaining,
    payoffDate,
    explanation:
      "Aflosdatum is indicatief berekend vanaf deze maand op basis van schuld, rente en maandbedrag.",
    warnings,
  };
}

export function calculateExtraRepaymentPayoffImpact(
  input: ExtraRepaymentPayoffImpactInput,
): ExtraRepaymentPayoffImpactResult {
  const strategy: ExtraRepaymentStrategy =
    input.strategy ?? "lowerMonthlyPayment";
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const portfolio = calculateDuoDebtPortfolio(input);
  const remainingDebt = portfolio.totalDebt;
  const annualInterestRate =
    input.annualInterestRate ?? portfolio.blendedAnnualInterestRate;
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const extraRepaymentInput = sanitizeDuoMoney(input.extraRepaymentAmount);
  const repayment = applyExtraRepaymentToDuoDebtPortfolio({
    ...input,
    remainingDebt,
    annualInterestRate,
    extraRepaymentAmount: extraRepaymentInput,
  });
  const extraRepaymentUsed = repayment.extraRepaymentUsed;
  const newRemainingDebt = repayment.newRemainingDebt;
  const warnings: string[] = [];

  const oldMonthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const statutoryOldMonthlyPayment = portfolio.totalStatutoryMonthlyPayment;
  const oldMonthlyPayment =
    oldMonthlyPaymentInput > 0
      ? oldMonthlyPaymentInput
      : statutoryOldMonthlyPayment;
  const originalTiming = calculatePayoffDate({
    remainingDebt,
    annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: input.debtParts,
    monthlyPayment: oldMonthlyPayment,
    startDate: input.startDate,
  });

  const newMonthlyPayment =
    strategy === "lowerMonthlyPayment"
      ? calculateStatutoryDuoMonthlyPayment({
          repaymentRule,
          remainingDebt: newRemainingDebt,
          annualInterestRate,
          duoRateYear: input.duoRateYear,
          remainingTermYears,
          debtParts: repayment.parts.map((part) => ({
            label: part.label,
            remainingDebt: part.remainingDebt,
            rateYear: part.rateYear,
            annualInterestRate: part.annualInterestRate,
          })),
        })
      : oldMonthlyPayment;
  const newTiming = calculatePayoffDate({
    remainingDebt: newRemainingDebt,
    annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: repayment.parts.map((part) => ({
      label: part.label,
      remainingDebt: part.remainingDebt,
      rateYear: part.rateYear,
      annualInterestRate: part.annualInterestRate,
    })),
    monthlyPayment: newMonthlyPayment,
    startDate: input.startDate,
  });

  if (extraRepaymentInput > remainingDebt && remainingDebt > 0) {
    warnings.push(
      "Extra aflossen is begrensd op je ingevulde resterende studieschuld.",
    );
  }

  warnings.push(DUO_PAYOFF_STRATEGY_WARNING);
  warnings.push(...repayment.warnings);
  warnings.push(...originalTiming.warnings);
  warnings.push(...newTiming.warnings);

  const originalMonthsRemaining = originalTiming.monthsRemaining;
  const newMonthsRemaining =
    strategy === "lowerMonthlyPayment"
      ? originalMonthsRemaining
      : newTiming.monthsRemaining;
  const monthsSaved = Math.max(originalMonthsRemaining - newMonthsRemaining, 0);
  const yearsSaved = roundMoney(monthsSaved / 12);

  const explanation =
    strategy === "lowerMonthlyPayment"
      ? "Scenario maandbedrag daalt: extra aflossen verlaagt vooral je maandlast en laat de indicatieve einddatum grotendeels gelijk."
      : "Scenario looptijd korter: je maandbedrag blijft gelijk waardoor je indicatief sneller schuldenvrij bent.";

  return {
    strategy,
    extraRepaymentUsed: roundMoney(extraRepaymentUsed),
    originalMonthsRemaining,
    newMonthsRemaining,
    monthsSaved,
    yearsSaved,
    originalPayoffDate: originalTiming.payoffDate,
    newPayoffDate: newTiming.payoffDate,
    newRemainingDebt,
    oldMonthlyPayment: roundMoney(oldMonthlyPayment),
    newMonthlyPayment: roundMoney(newMonthlyPayment),
    explanation,
    warnings: [...new Set(warnings)],
  };
}

function projectDuoRepaymentTimeline(input: {
  remainingDebt: number;
  annualInterestRate: number;
  duoRateYear?: number;
  remainingTermYears: number;
  repaymentRule: RepaymentRule;
  debtParts?: DuoDebtPartInput[];
  monthlyPayment?: number;
  extraMonthlyAmount?: number;
  startDate?: string;
}): DuoRepaymentTimelineSummary {
  const remainingTermYears = sanitizeYears(input.remainingTermYears, 0);
  const maxMonths = Math.max(Math.round(remainingTermYears * 12), 0);
  const portfolio = calculateDuoDebtPortfolio({
    repaymentRule: input.repaymentRule,
    remainingDebt: input.remainingDebt,
    annualInterestRate: input.annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    debtParts: input.debtParts,
  });
  const startDate = parseStartDate(input.startDate);
  const points: DuoRepaymentTimelinePoint[] = [];
  const extraMonthlyAmount = sanitizeDuoMoney(input.extraMonthlyAmount);
  const requestedBaseMonthlyPayment = sanitizeDuoMoney(input.monthlyPayment);
  const scheduledBaseMonthlyPayment =
    requestedBaseMonthlyPayment > 0
      ? requestedBaseMonthlyPayment
      : portfolio.totalStatutoryMonthlyPayment;
  const balanceAtStart = roundMoney(
    portfolio.parts.reduce((sum, part) => sum + part.remainingDebt, 0),
  );

  if (balanceAtStart <= 0 || maxMonths <= 0 || scheduledBaseMonthlyPayment <= 0) {
    return {
      months: 0,
      payoffDate: balanceAtStart <= 0 ? null : formatYearMonth(startDate),
      totalPaid: 0,
      totalInterest: 0,
      finalDebt: balanceAtStart,
      points,
    };
  }

  const basePaymentTotal =
    portfolio.totalStatutoryMonthlyPayment > 0
      ? portfolio.totalStatutoryMonthlyPayment
      : balanceAtStart;
  const scheduledPayments = portfolio.parts.map((part) => {
    const share =
      basePaymentTotal > 0 ? part.statutoryMonthlyPayment / basePaymentTotal : 0;
    const proportionalPayment = roundMoney(scheduledBaseMonthlyPayment * share);
    return {
      ...part,
      balance: part.remainingDebt,
      scheduledPayment:
        portfolio.parts.length === 1
          ? scheduledBaseMonthlyPayment
          : proportionalPayment,
    };
  });

  let totalPaid = 0;
  let totalInterest = 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    const currentDate = addMonths(startDate, month);
    const openingDebt = roundMoney(
      scheduledPayments.reduce((sum, part) => sum + part.balance, 0),
    );

    if (openingDebt <= 0) {
      break;
    }

    let interest = 0;
    let payment = 0;
    let principalPaid = 0;

    for (const part of scheduledPayments) {
      if (part.balance <= 0) {
        continue;
      }

      const monthlyRate = part.annualInterestRate / 100 / 12;
      const partInterest = roundMoney(part.balance * monthlyRate);
      const debtAfterInterest = roundMoney(part.balance + partInterest);
      const scheduledPayment = roundMoney(Math.max(part.scheduledPayment, 0));
      const partPayment = roundMoney(Math.min(scheduledPayment, debtAfterInterest));
      const partPrincipalPaid = roundMoney(Math.max(partPayment - partInterest, 0));
      part.balance = roundMoney(Math.max(debtAfterInterest - partPayment, 0));

      interest = roundMoney(interest + partInterest);
      payment = roundMoney(payment + partPayment);
      principalPaid = roundMoney(principalPaid + partPrincipalPaid);
    }

    let extraRemaining = extraMonthlyAmount;

    while (extraRemaining > 0.009) {
      const target = scheduledPayments
        .filter((part) => part.balance > 0)
        .sort((left, right) => {
          if (right.annualInterestRate !== left.annualInterestRate) {
            return right.annualInterestRate - left.annualInterestRate;
          }

          return right.balance - left.balance;
        })[0];

      if (!target) {
        break;
      }

      const extraPayment = roundMoney(Math.min(extraRemaining, target.balance));
      target.balance = roundMoney(Math.max(target.balance - extraPayment, 0));
      payment = roundMoney(payment + extraPayment);
      principalPaid = roundMoney(principalPaid + extraPayment);
      extraRemaining = roundMoney(extraRemaining - extraPayment);
    }

    const closingDebt = roundMoney(
      scheduledPayments.reduce((sum, part) => sum + part.balance, 0),
    );
    totalPaid = roundMoney(totalPaid + payment);
    totalInterest = roundMoney(totalInterest + interest);

    points.push({
      month,
      date: formatYearMonth(currentDate),
      openingDebt,
      interest,
      payment,
      principalPaid,
      closingDebt,
    });

    if (payment <= interest && closingDebt > 0) {
      break;
    }

    if (closingDebt <= 0) {
      break;
    }
  }

  const finalDebt =
    points.length > 0 ? points[points.length - 1].closingDebt : balanceAtStart;

  return {
    months: points.length,
    payoffDate: finalDebt <= 0 && points.length > 0 ? points[points.length - 1].date : null,
    totalPaid,
    totalInterest,
    finalDebt,
    points,
  };
}

export function calculateDuoExtraRepaymentProjection(
  input: DuoExtraRepaymentProjectionInput,
): DuoExtraRepaymentProjectionResult {
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const portfolio = calculateDuoDebtPortfolio(input);
  const remainingDebt = portfolio.totalDebt;
  const annualInterestRate =
    input.annualInterestRate ?? portfolio.blendedAnnualInterestRate;
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const originalMonthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const originalMonthlyPayment =
    originalMonthlyPaymentInput > 0
      ? originalMonthlyPaymentInput
      : calculateStatutoryDuoMonthlyPayment({
          remainingDebt,
          annualInterestRate,
          duoRateYear: input.duoRateYear,
          remainingTermYears,
          repaymentRule,
          debtParts: input.debtParts,
        });
  const extraRepaymentInput = sanitizeDuoMoney(input.extraRepaymentAmount);
  const extraRepaymentUsed = Math.min(extraRepaymentInput, remainingDebt);
  const extraMonthlyAmountUsed = sanitizeDuoMoney(input.extraMonthlyAmount);
  const payoffImpact = calculateExtraRepaymentPayoffImpact({
    remainingDebt,
    annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: input.debtParts,
    monthlyPayment: originalMonthlyPayment,
    extraRepaymentAmount: extraRepaymentUsed,
    strategy: input.strategy,
    startDate: input.startDate,
  });
  const newRequiredMonthlyPayment =
    payoffImpact.strategy === "lowerMonthlyPayment"
      ? payoffImpact.newMonthlyPayment
      : originalMonthlyPayment;
  const effectiveNewMonthlyPayment = roundMoney(
    newRequiredMonthlyPayment + extraMonthlyAmountUsed,
  );
  const timelineBefore = projectDuoRepaymentTimeline({
    remainingDebt,
    annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: input.debtParts,
    monthlyPayment: originalMonthlyPayment,
    startDate: input.startDate,
  });
  const timelineAfter = projectDuoRepaymentTimeline({
    remainingDebt: payoffImpact.newRemainingDebt,
    annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    repaymentRule,
    debtParts: input.debtParts
      ? applyExtraRepaymentToDuoDebtPortfolio({
          ...input,
          extraRepaymentAmount: extraRepaymentUsed,
        }).parts.map((part) => ({
          label: part.label,
          remainingDebt: part.remainingDebt,
          rateYear: part.rateYear,
          annualInterestRate: part.annualInterestRate,
        }))
      : undefined,
    monthlyPayment: newRequiredMonthlyPayment,
    extraMonthlyAmount: extraMonthlyAmountUsed,
    startDate: input.startDate,
  });
  const interestSaved = roundMoney(
    Math.max(timelineBefore.totalInterest - timelineAfter.totalInterest, 0),
  );
  const warnings = [...payoffImpact.warnings];

  if (extraMonthlyAmountUsed > 0) {
    warnings.push(
      "Een extra maandbedrag bovenop je verplichte termijn kan de looptijd verder verkorten. DUO kan je verplichte termijn later opnieuw vaststellen.",
    );
  }
  if (remainingDebt === 0) {
    warnings.push(
      "Zonder resterende studieschuld is extra aflossen niet van toepassing.",
    );
  }

  return {
    repaymentRule,
    annualInterestRateUsed: annualInterestRate,
    remainingTermYearsUsed: remainingTermYears,
    originalMonthlyPayment: roundMoney(originalMonthlyPayment),
    extraRepaymentUsed: roundMoney(extraRepaymentUsed),
    extraMonthlyAmountUsed: roundMoney(extraMonthlyAmountUsed),
    newRemainingDebt: payoffImpact.newRemainingDebt,
    newRequiredMonthlyPayment: roundMoney(newRequiredMonthlyPayment),
    effectiveNewMonthlyPayment,
    interestSaved,
    payoffImpact,
    timelineBefore,
    timelineAfter,
    warnings: [...new Set(warnings)],
  };
}

export function determineRelevantDuoPayment(
  input: DuoRelevantPaymentInput,
): RelevantDuoPaymentResult {
  const situation = input.situation ?? "unknown";
  const rule = resolveRepaymentRule(input.repaymentRule);
  const currentMonthlyPayment =
    input.currentMonthlyPayment === undefined
      ? undefined
      : sanitizeDuoMoney(input.currentMonthlyPayment);
  const providedStatutoryPayment =
    input.statutoryMonthlyPayment === undefined
      ? undefined
      : sanitizeDuoMoney(input.statutoryMonthlyPayment);
  const estimatedStatutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt: input.remainingDebt,
    annualInterestRate: input.annualInterestRate,
    remainingTermYears: input.remainingTermYears,
    repaymentRule: rule,
  });
  const statutoryMonthlyPayment =
    providedStatutoryPayment !== undefined && providedStatutoryPayment > 0
      ? providedStatutoryPayment
      : estimatedStatutoryMonthlyPayment;
  const warnings: string[] = [];

  if (rule === "UNKNOWN") {
    warnings.push(
      "Terugbetalingsregel staat op onbekend; deze berekening valt terug op SF35-defaults.",
    );
  }
  if (input.annualInterestRate === undefined) {
    warnings.push(
      "DUO-rente ontbreekt; we gebruiken de standaard rente voor deze regeling.",
    );
  }
  if (input.remainingTermYears === undefined) {
    warnings.push(
      "Resterende looptijd ontbreekt; we gebruiken de standaard looptijd voor deze regeling.",
    );
  }

  switch (situation) {
    case "repaying": {
      if (currentMonthlyPayment !== undefined && currentMonthlyPayment > 0) {
        const conservative = roundMoney(
          Math.max(currentMonthlyPayment, statutoryMonthlyPayment),
        );
        return {
          primaryMonthlyPayment: roundMoney(currentMonthlyPayment),
          optimisticMonthlyPayment: roundMoney(currentMonthlyPayment),
          conservativeMonthlyPayment: conservative,
          statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
          estimatedStatutoryMonthlyPayment: roundMoney(
            estimatedStatutoryMonthlyPayment,
          ),
          source: "actual",
          explanation:
            "Je lost al af. Het actuele maandbedrag is het startpunt; als voorzichtig scenario nemen we het hoogste van actueel en wettelijk/geschat.",
          warnings,
        };
      }

      const source =
        providedStatutoryPayment !== undefined && providedStatutoryPayment > 0
          ? "statutory"
          : "estimated";
      return {
        primaryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        optimisticMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        conservativeMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        estimatedStatutoryMonthlyPayment: roundMoney(
          estimatedStatutoryMonthlyPayment,
        ),
        source,
        explanation:
          "Je lost al af, maar zonder actueel bedrag rekenen we met wettelijk of geschat maandbedrag.",
        warnings,
      };
    }

    case "gracePeriod":
      warnings.push(
        "Je betaalt nu mogelijk nog niets, maar een hypotheekverstrekker kijkt vaak naar wat je straks moet betalen.",
      );
      return {
        primaryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        optimisticMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        conservativeMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        estimatedStatutoryMonthlyPayment: roundMoney(
          estimatedStatutoryMonthlyPayment,
        ),
        source:
          providedStatutoryPayment !== undefined && providedStatutoryPayment > 0
            ? "statutory"
            : "estimated",
        explanation:
          "In de aanloopfase nemen we het wettelijke of geschatte bedrag dat straks relevant wordt.",
        warnings,
      };

    case "incomeBasedReduction": {
      const optimistic = roundMoney(currentMonthlyPayment ?? 0);
      const conservative = roundMoney(statutoryMonthlyPayment);
      warnings.push(
        "Bij draagkrachtverlaging kan een hypotheekverstrekker met een hoger bedrag rekenen dan je feitelijke betaling.",
      );
      return {
        primaryMonthlyPayment: conservative,
        optimisticMonthlyPayment: optimistic,
        conservativeMonthlyPayment: conservative,
        statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        estimatedStatutoryMonthlyPayment: roundMoney(
          estimatedStatutoryMonthlyPayment,
        ),
        source: "incomeBased",
        explanation:
          "Hier tonen we bewust twee scenario's: optimistisch je huidige lagere betaling, voorzichtig het wettelijke of geschatte bedrag.",
        warnings,
      };
    }

    case "paymentPause":
      warnings.push(
        "Een tijdelijke betaalpauze maakt de hypotheekimpact meestal niet nul.",
      );
      return {
        primaryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        optimisticMonthlyPayment: roundMoney(currentMonthlyPayment ?? 0),
        conservativeMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        estimatedStatutoryMonthlyPayment: roundMoney(
          estimatedStatutoryMonthlyPayment,
        ),
        source: "mixed",
        explanation:
          "Bij een betaalpauze gebruiken we voor de hoofdinschatting het bedrag dat je structureel zou moeten betalen.",
        warnings,
      };

    case "unknown":
    default:
      warnings.push(
        "Situatie staat op onbekend. Controleer Mijn DUO; deze tool gebruikt een veilige schatting.",
      );
      return {
        primaryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        optimisticMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        conservativeMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
        estimatedStatutoryMonthlyPayment: roundMoney(
          estimatedStatutoryMonthlyPayment,
        ),
        source:
          providedStatutoryPayment !== undefined && providedStatutoryPayment > 0
            ? "statutory"
            : "estimated",
        explanation:
          "Zonder duidelijke situatie rekenen we met wettelijk of geschat maandbedrag.",
        warnings,
      };
  }
}

export function calculateExtraRepaymentVsInvesting(
  input: ExtraRepaymentVsInvestingInput,
) {
  const rule = resolveRepaymentRule(input.repaymentRule);
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const annualDuoInterestRate = resolveDuoRate({
    annualInterestRate: input.annualDuoInterestRate,
    repaymentRule: rule,
  });
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule: rule,
  });
  const extraRepaymentAmount = sanitizeDuoMoney(input.extraRepaymentAmount);
  const monthlyExtraAmount = sanitizeDuoMoney(input.monthlyExtraAmount);
  const investmentHorizonYears = sanitizeYears(input.investmentHorizonYears, 0);
  const expectedAnnualReturn = sanitizeDuoPercent(input.expectedAnnualReturn);
  const box3TaxDragPercent = sanitizeDuoPercent(input.box3TaxDragPercent);
  const effectiveAnnualReturn = Math.max(expectedAnnualReturn - box3TaxDragPercent, 0);
  const warnings: string[] = [];

  const repaymentScenario = calculateDuoMonthlyPaymentAfterExtraRepayment({
    remainingDebt,
    annualInterestRate: annualDuoInterestRate,
    remainingTermYears,
    repaymentRule: rule,
    extraRepaymentAmount,
  });

  const termMonths = Math.max(Math.round(remainingTermYears * 12), 0);
  const oldTotalPaid = repaymentScenario.oldStatutoryMonthlyPayment * termMonths;
  const newTotalPaid =
    repaymentScenario.extraRepaymentUsed +
    repaymentScenario.newStatutoryMonthlyPayment * termMonths;
  const oldInterest = Math.max(oldTotalPaid - remainingDebt, 0);
  const newInterest = Math.max(newTotalPaid - remainingDebt, 0);
  const duoInterestSavedIndicative = roundMoney(Math.max(oldInterest - newInterest, 0));

  const futureValueIfInvested =
    monthlyExtraAmount > 0
      ? futureValueMonthlyContributions(
          monthlyExtraAmount,
          effectiveAnnualReturn,
          investmentHorizonYears,
        )
      : futureValueLumpSum(
          repaymentScenario.extraRepaymentUsed,
          effectiveAnnualReturn,
          investmentHorizonYears,
        );

  const netFutureValueIfInvested = roundMoney(futureValueIfInvested);
  const repaymentValueIndicative = roundMoney(
    repaymentScenario.extraRepaymentUsed + duoInterestSavedIndicative,
  );
  const differenceInvestingVsRepayment = roundMoney(
    netFutureValueIfInvested - repaymentValueIndicative,
  );

  let breakEvenAnnualReturn: number | null = null;
  if (
    repaymentScenario.extraRepaymentUsed > 0 &&
    investmentHorizonYears > 0 &&
    monthlyExtraAmount === 0
  ) {
    const ratio =
      repaymentValueIndicative / Math.max(repaymentScenario.extraRepaymentUsed, 1);
    if (ratio > 0) {
      breakEvenAnnualReturn = roundMoney(((ratio ** (1 / investmentHorizonYears)) - 1) * 100);
    }
  }

  if (remainingDebt === 0) {
    warnings.push(
      "Zonder resterende studieschuld is rentebesparing door extra aflossen niet van toepassing.",
    );
  }
  if (extraRepaymentAmount > remainingDebt && remainingDebt > 0) {
    warnings.push(
      "Extra aflossen is begrensd op de ingevulde resterende studieschuld.",
    );
  }
  if (box3TaxDragPercent > 0) {
    warnings.push(
      "Het beleggingsrendement is indicatief verlaagd met box 3-druk; dit is geen volledige fiscale berekening.",
    );
  }
  warnings.push(
    "Deze vergelijking is indicatief en geen financieel advies. Kijk ook naar buffer, flexibiliteit en risico.",
  );

  return {
    extraRepaymentUsed: repaymentScenario.extraRepaymentUsed,
    monthlyPaymentReduction: repaymentScenario.monthlyPaymentReduction,
    duoInterestSavedIndicative,
    futureValueIfInvested: roundMoney(futureValueIfInvested),
    netFutureValueIfInvested,
    differenceInvestingVsRepayment,
    breakEvenAnnualReturn:
      breakEvenAnnualReturn !== null && Number.isFinite(breakEvenAnnualReturn)
        ? Math.max(breakEvenAnnualReturn, 0)
        : null,
    warnings,
  };
}
