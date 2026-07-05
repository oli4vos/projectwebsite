import {
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoIncomeBasedRuleForRepaymentRule,
  getDuoRateForRule,
} from "@/lib/financial-constants";
import type {
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
  repaymentRule?: RepaymentRule;
}) {
  const rule = resolveRepaymentRule(input.repaymentRule);
  if (input.annualInterestRate === undefined) {
    return sanitizeDuoPercent(getDuoRateForRule(rule, DEFAULT_YEAR));
  }
  return sanitizeDuoPercent(input.annualInterestRate);
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
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const annualInterestRate = resolveDuoRate({
    annualInterestRate: input.annualInterestRate,
    repaymentRule,
  });
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });

  return calculateAnnuityMonthlyPayment(
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
  );
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
  const extraRepaymentInput = sanitizeDuoMoney(input.extraRepaymentAmount);
  const extraRepaymentUsed = Math.min(extraRepaymentInput, safeDebt);
  const newRemainingDebt = calculateRemainingDebtAfterExtraRepayment(
    safeDebt,
    extraRepaymentUsed,
  );

  const oldStatutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt: safeDebt,
    annualInterestRate: input.annualInterestRate,
    remainingTermYears: input.remainingTermYears,
    repaymentRule: input.repaymentRule,
  });
  const newStatutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt: newRemainingDebt,
    annualInterestRate: input.annualInterestRate,
    remainingTermYears: input.remainingTermYears,
    repaymentRule: input.repaymentRule,
  });
  const monthlyPaymentReduction = roundMoney(
    Math.max(oldStatutoryMonthlyPayment - newStatutoryMonthlyPayment, 0),
  );

  return {
    extraRepaymentUsed: roundMoney(extraRepaymentUsed),
    oldStatutoryMonthlyPayment,
    newStatutoryMonthlyPayment,
    monthlyPaymentReduction,
    newRemainingDebt,
  };
}

export function calculateRemainingMonthsToPayOff(input: DuoPayoffTimingInput) {
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  if (remainingDebt <= 0) {
    return 0;
  }

  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const annualInterestRate = resolveDuoRate({
    annualInterestRate: input.annualInterestRate,
    repaymentRule,
  });
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const maxMonths = Math.max(Math.round(remainingTermYears * 12), 0);

  if (maxMonths <= 0) {
    return 0;
  }

  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
  });

  const monthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const monthlyPayment =
    monthlyPaymentInput > 0 ? monthlyPaymentInput : statutoryMonthlyPayment;

  if (monthlyPayment <= 0) {
    return maxMonths;
  }

  if (annualInterestRate === 0) {
    return Math.min(Math.ceil(remainingDebt / monthlyPayment), maxMonths);
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  let balance = remainingDebt;

  for (let month = 1; month <= maxMonths; month += 1) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyPayment - interest;

    if (principalPaid <= 0) {
      return maxMonths;
    }

    balance = Math.max(balance - principalPaid, 0);
    if (balance <= 0) {
      return month;
    }
  }

  return maxMonths;
}

export function calculatePayoffDate(input: DuoPayoffTimingInput): DuoPayoffTimingResult {
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const annualInterestRate = resolveDuoRate({
    annualInterestRate: input.annualInterestRate,
    repaymentRule,
  });
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
  });
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
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
    monthlyPayment,
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
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const annualInterestRate = resolveDuoRate({
    annualInterestRate: input.annualInterestRate,
    repaymentRule,
  });
  const remainingTermYears = resolveDuoTerm({
    remainingTermYears: input.remainingTermYears,
    repaymentRule,
  });
  const extraRepaymentInput = sanitizeDuoMoney(input.extraRepaymentAmount);
  const extraRepaymentUsed = Math.min(extraRepaymentInput, remainingDebt);
  const newRemainingDebt = calculateRemainingDebtAfterExtraRepayment(
    remainingDebt,
    extraRepaymentUsed,
  );
  const warnings: string[] = [];

  const oldMonthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const statutoryOldMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
  });
  const oldMonthlyPayment =
    oldMonthlyPaymentInput > 0
      ? oldMonthlyPaymentInput
      : statutoryOldMonthlyPayment;
  const originalTiming = calculatePayoffDate({
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
    monthlyPayment: oldMonthlyPayment,
    startDate: input.startDate,
  });

  const newMonthlyPayment =
    strategy === "lowerMonthlyPayment"
      ? calculateStatutoryDuoMonthlyPayment({
          remainingDebt: newRemainingDebt,
          annualInterestRate,
          remainingTermYears,
          repaymentRule,
        })
      : oldMonthlyPayment;
  const newTiming = calculatePayoffDate({
    remainingDebt: newRemainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
    monthlyPayment: newMonthlyPayment,
    startDate: input.startDate,
  });

  if (extraRepaymentInput > remainingDebt && remainingDebt > 0) {
    warnings.push(
      "Extra aflossen is begrensd op je ingevulde resterende studieschuld.",
    );
  }

  warnings.push(DUO_PAYOFF_STRATEGY_WARNING);
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
  remainingTermYears: number;
  repaymentRule: RepaymentRule;
  monthlyPayment?: number;
  extraMonthlyAmount?: number;
  startDate?: string;
}): DuoRepaymentTimelineSummary {
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const annualInterestRate = sanitizeDuoPercent(input.annualInterestRate);
  const remainingTermYears = sanitizeYears(input.remainingTermYears, 0);
  const maxMonths = Math.max(Math.round(remainingTermYears * 12), 0);
  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule: input.repaymentRule,
  });
  const baseMonthlyPaymentInput = sanitizeDuoMoney(input.monthlyPayment);
  const baseMonthlyPayment =
    baseMonthlyPaymentInput > 0 ? baseMonthlyPaymentInput : statutoryMonthlyPayment;
  const extraMonthlyAmount = sanitizeDuoMoney(input.extraMonthlyAmount);
  const scheduledMonthlyPayment = roundMoney(baseMonthlyPayment + extraMonthlyAmount);
  const monthlyRate = annualInterestRate / 100 / 12;
  const startDate = parseStartDate(input.startDate);
  const points: DuoRepaymentTimelinePoint[] = [];
  let balance = remainingDebt;
  let totalPaid = 0;
  let totalInterest = 0;

  if (balance <= 0 || maxMonths <= 0 || scheduledMonthlyPayment <= 0) {
    return {
      months: 0,
      payoffDate: balance <= 0 ? null : formatYearMonth(startDate),
      totalPaid: 0,
      totalInterest: 0,
      finalDebt: roundMoney(balance),
      points,
    };
  }

  for (let month = 1; month <= maxMonths && balance > 0; month += 1) {
    const currentDate = addMonths(startDate, month);
    const openingDebt = roundMoney(balance);
    const interest = roundMoney(openingDebt * monthlyRate);
    const debtAfterInterest = roundMoney(openingDebt + interest);
    const payment = roundMoney(Math.min(scheduledMonthlyPayment, debtAfterInterest));
    const principalPaid = roundMoney(Math.max(payment - interest, 0));
    balance = roundMoney(Math.max(debtAfterInterest - payment, 0));
    totalPaid = roundMoney(totalPaid + payment);
    totalInterest = roundMoney(totalInterest + interest);

    points.push({
      month,
      date: formatYearMonth(currentDate),
      openingDebt,
      interest,
      payment,
      principalPaid,
      closingDebt: balance,
    });

    if (payment <= interest && balance > 0) {
      break;
    }
  }

  return {
    months: points.length,
    payoffDate: balance <= 0 && points.length > 0 ? points[points.length - 1].date : null,
    totalPaid,
    totalInterest,
    finalDebt: roundMoney(balance),
    points,
  };
}

export function calculateDuoExtraRepaymentProjection(
  input: DuoExtraRepaymentProjectionInput,
): DuoExtraRepaymentProjectionResult {
  const repaymentRule = resolveRepaymentRule(input.repaymentRule);
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const annualInterestRate = resolveDuoRate({
    annualInterestRate: input.annualInterestRate,
    repaymentRule,
  });
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
          remainingTermYears,
          repaymentRule,
        });
  const extraRepaymentInput = sanitizeDuoMoney(input.extraRepaymentAmount);
  const extraRepaymentUsed = Math.min(extraRepaymentInput, remainingDebt);
  const extraMonthlyAmountUsed = sanitizeDuoMoney(input.extraMonthlyAmount);
  const payoffImpact = calculateExtraRepaymentPayoffImpact({
    remainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
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
    remainingTermYears,
    repaymentRule,
    monthlyPayment: originalMonthlyPayment,
    startDate: input.startDate,
  });
  const timelineAfter = projectDuoRepaymentTimeline({
    remainingDebt: payoffImpact.newRemainingDebt,
    annualInterestRate,
    remainingTermYears,
    repaymentRule,
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
