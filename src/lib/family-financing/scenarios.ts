import { calculateDuoMonthlyPaymentAfterExtraRepayment, determineRelevantDuoPayment } from "@/lib/duo";
import { calculateAnnuityPayment } from "@/lib/mortgage";
import { calculateFamilyLoan } from "@/lib/family-financing/family-loan";
import { calculateGiftCashflows } from "@/lib/family-financing/gifts";
import type {
  AssumptionMetadata,
  DebtBySource,
  FinancingScenario,
  FinancingScenarioResult,
  GiftCashflowResult,
  GiftInput,
  HouseholdCashflow,
  ParentCashflowSummary,
  StressTestResult,
} from "@/lib/family-financing/types";

function safeFinite(value: number | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeMoney(value: number | undefined) {
  return Math.max(safeFinite(value, 0), 0);
}

function roundMoney(value: number | undefined) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function roundSignedMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function sumMoney(values: Array<number | undefined>) {
  let total = 0;

  for (const value of values) {
    total += sanitizeMoney(value);
  }

  return roundMoney(total);
}

function defaultAssumptions(): AssumptionMetadata[] {
  return [
    {
      key: "no-double-counting",
      name: "Geen dubbeltelling",
      description:
        "Eenmalige schenkingen tellen per scenario maar op één plek mee. Periodieke schenkingen blijven aparte kasstromen en geen contractuele schuld.",
      value: true,
      unit: "boolean",
      status: "illustrative",
    },
    {
      key: "gift-not-guaranteed",
      name: "Schenking niet gegarandeerd",
      description:
        "Toekomstige periodieke schenkingen zijn onzeker en worden niet automatisch als gegarandeerd inkomen behandeld.",
      value: true,
      unit: "boolean",
      status: "illustrative",
    },
  ];
}

function monthlyEquivalentFromGifts(giftCashflows: GiftCashflowResult[]) {
  let total = 0;

  for (const gift of giftCashflows) {
    total += sanitizeMoney(gift.monthlyEquivalent);
  }

  return roundMoney(total);
}

function giftTotals(giftCashflows: GiftCashflowResult[]) {
  let oneTimeTotal = 0;
  let recurringTotal = 0;

  for (const gift of giftCashflows) {
    if (gift.kind === "one-time") {
      oneTimeTotal += sanitizeMoney(gift.totalAmount);
    }

    if (gift.kind === "recurring") {
      recurringTotal += sanitizeMoney(gift.totalAmount);
    }
  }

  return {
    oneTimeTotal: roundMoney(oneTimeTotal),
    recurringTotal: roundMoney(recurringTotal),
  };
}

function cashflowResultFromParts(input: {
  bankMortgagePayment?: number;
  familyLoanPayment?: number;
  duoPayment?: number;
  receivedGift?: number;
  otherHousingCosts?: number;
}): HouseholdCashflow {
  const grossContractualOutflow = sumMoney([
    input.bankMortgagePayment,
    input.familyLoanPayment,
    input.duoPayment,
    input.otherHousingCosts,
  ]);
  const receivedGift = roundMoney(sanitizeMoney(input.receivedGift));

  return {
    period: "month",
    bankMortgagePayment: roundMoney(sanitizeMoney(input.bankMortgagePayment)),
    familyLoanPayment: roundMoney(sanitizeMoney(input.familyLoanPayment)),
    duoPayment: roundMoney(sanitizeMoney(input.duoPayment)),
    receivedGift,
    otherHousingCosts: roundMoney(sanitizeMoney(input.otherHousingCosts)),
    grossContractualOutflow,
    netCashOutflowAfterReceipts: roundMoney(Math.max(grossContractualOutflow - receivedGift, 0)),
  };
}

function parentCashflowFromParts(input: {
  familyLoanPrincipalAdvanced?: number;
  familyLoanInterestReceived?: number;
  familyLoanPrincipalReceived?: number;
  giftGiven?: number;
  remainingClaim?: number;
}): ParentCashflowSummary {
  const interestReceived = roundMoney(sanitizeMoney(input.familyLoanInterestReceived));
  const principalReceived = roundMoney(sanitizeMoney(input.familyLoanPrincipalReceived));
  const giftGiven = roundMoney(sanitizeMoney(input.giftGiven));

  return {
    familyLoanPrincipalAdvanced: roundMoney(
      sanitizeMoney(input.familyLoanPrincipalAdvanced),
    ),
    interestReceived,
    principalReceived,
    giftGiven,
    netCashflow: roundSignedMoney(principalReceived + interestReceived - giftGiven),
    remainingClaim: roundMoney(sanitizeMoney(input.remainingClaim)),
  };
}

function bufferStressTest(input: {
  remainingBuffer: number;
  minimumBuffer: number;
}): StressTestResult | undefined {
  if (input.minimumBuffer <= 0) {
    return undefined;
  }

  return {
    type: "bufferBreach",
    passed: input.remainingBuffer >= input.minimumBuffer,
    financialEffect: roundMoney(Math.max(input.minimumBuffer - input.remainingBuffer, 0)),
    bufferAfterStress: roundMoney(input.remainingBuffer),
    warnings:
      input.remainingBuffer >= input.minimumBuffer
        ? []
        : ["De minimale buffer wordt in dit scenario niet gehaald."],
  };
}

function giftStopStressTest(input: {
  recurringMonthlyEquivalent: number;
  remainingBuffer: number;
  minimumBuffer: number;
}): StressTestResult | undefined {
  if (input.recurringMonthlyEquivalent <= 0) {
    return undefined;
  }

  const annualEffect = roundMoney(input.recurringMonthlyEquivalent * 12);
  const bufferAfterStress = roundMoney(Math.max(input.remainingBuffer - annualEffect, 0));

  return {
    type: "giftStops",
    passed: bufferAfterStress >= input.minimumBuffer,
    financialEffect: annualEffect,
    bufferAfterStress,
    warnings: [
      "Periodieke schenking valt weg; dit is een jaarlijkse indicatieve impact op de kasstroom.",
    ],
  };
}

function extractGiftCashflows(gifts: GiftInput[] | undefined) {
  return (gifts ?? []).map((gift) => calculateGiftCashflows(gift));
}

export function calculateFinancingScenario(
  scenario: FinancingScenario,
): FinancingScenarioResult {
  const input = scenario.input;
  const giftCashflows = extractGiftCashflows(input.gifts);
  const oneTimeGiftTotal = giftTotals(giftCashflows).oneTimeTotal;
  const recurringGiftTotal = giftTotals(giftCashflows).recurringTotal;
  const recurringGiftMonthlyEquivalent = monthlyEquivalentFromGifts(
    giftCashflows.filter((gift) => gift.kind === "recurring"),
  );
  const purchaseNeed = roundMoney(
    sanitizeMoney(input.purchasePrice) + sanitizeMoney(input.acquisitionCosts),
  );
  const minimumBuffer = roundMoney(sanitizeMoney(input.minimumBuffer));
  const ownFundsInput = roundMoney(sanitizeMoney(input.ownFunds));
  const bankMortgageUsed = roundMoney(
    sanitizeMoney(input.bankMortgage?.principal),
  );
  const familyLoanResult = input.familyLoan
    ? calculateFamilyLoan(input.familyLoan)
    : undefined;
  const familyLoanUsed = roundMoney(sanitizeMoney(input.familyLoan?.principal));
  const duoBase = input.duo
    ? determineRelevantDuoPayment(input.duo)
    : undefined;
  const duoExtraRepaymentGift =
    scenario.type === "gift-for-duo-repayment" ? oneTimeGiftTotal : 0;
  const duoAdjusted = input.duo
    ? calculateDuoMonthlyPaymentAfterExtraRepayment({
        remainingDebt: sanitizeMoney(input.duo.remainingDebt),
        annualInterestRate: sanitizeMoney(input.duo.annualInterestRate),
        remainingTermYears: sanitizeMoney(input.duo.remainingTermYears),
        repaymentRule: input.duo.repaymentRule,
        extraRepaymentAmount: duoExtraRepaymentGift,
      })
    : undefined;
  const duoDebtAfterGift = input.duo
    ? roundMoney(
        Math.max(
          sanitizeMoney(input.duo.remainingDebt) - duoExtraRepaymentGift,
          0,
        ),
      )
    : undefined;

  const oneTimeGiftsCountedAsOwnFunds =
    scenario.type === "gift-for-duo-repayment" ? 0 : oneTimeGiftTotal;
  const liquidFundsAvailable = roundMoney(ownFundsInput + oneTimeGiftsCountedAsOwnFunds);
  const purchaseFundingBeforeOwnFunds = roundMoney(bankMortgageUsed + familyLoanUsed);
  const requiredOwnFundsAfterLoans = roundMoney(
    Math.max(purchaseNeed - purchaseFundingBeforeOwnFunds, 0),
  );
  const usableLiquidFunds = roundMoney(Math.max(liquidFundsAvailable - minimumBuffer, 0));
  const ownFundsUsed = roundMoney(
    Math.min(requiredOwnFundsAfterLoans, usableLiquidFunds),
  );
  const totalFinancing = roundMoney(
    purchaseFundingBeforeOwnFunds + ownFundsUsed,
  );
  const financingGap = roundSignedMoney(purchaseNeed - totalFinancing);
  const remainingBuffer = roundMoney(Math.max(liquidFundsAvailable - ownFundsUsed, 0));
  const receivedGiftMonthly = recurringGiftMonthlyEquivalent;
  const bankMortgagePayment = input.bankMortgage
    ? input.bankMortgage.monthlyPaymentOverride !== undefined
      ? roundMoney(sanitizeMoney(input.bankMortgage.monthlyPaymentOverride))
      : calculateAnnuityPayment({
          principal: sanitizeMoney(input.bankMortgage.principal),
          annualRate: sanitizeMoney(input.bankMortgage.annualRate),
          years: sanitizeMoney(input.bankMortgage.years),
        })
    : 0;
  const familyLoanPayment = familyLoanResult?.monthlyPayment ?? 0;
  const duoPayment = duoAdjusted
    ? duoAdjusted.newStatutoryMonthlyPayment
    : duoBase?.primaryMonthlyPayment ?? 0;
  const contractualMonthlyPayments = cashflowResultFromParts({
    bankMortgagePayment,
    familyLoanPayment,
    duoPayment,
    receivedGift: receivedGiftMonthly,
  });
  const grossContractualOutflow = contractualMonthlyPayments.grossContractualOutflow ?? 0;
  const receivedGift = contractualMonthlyPayments.receivedGift ?? 0;
  const netHouseholdCashflow = roundSignedMoney(receivedGift - grossContractualOutflow);
  const parentCashflow = familyLoanResult
    ? parentCashflowFromParts({
        familyLoanPrincipalAdvanced: familyLoanUsed,
        familyLoanInterestReceived: familyLoanResult.totalInterest,
        familyLoanPrincipalReceived: familyLoanResult.totalPrincipal,
        giftGiven: oneTimeGiftTotal + recurringGiftTotal,
        remainingClaim: familyLoanResult.remainingDebt,
      })
    : undefined;

  const stressTests: StressTestResult[] = [];
  const bufferStress = bufferStressTest({
    remainingBuffer,
    minimumBuffer,
  });
  if (bufferStress) {
    stressTests.push(bufferStress);
  }
  const giftStopStress = giftStopStressTest({
    recurringMonthlyEquivalent: receivedGiftMonthly,
    remainingBuffer,
    minimumBuffer,
  });
  if (giftStopStress) {
    stressTests.push(giftStopStress);
  }

  const warnings = [
    ...giftCashflows.flatMap((gift) => gift.warnings),
    ...(familyLoanResult?.warnings ?? []),
    ...(duoAdjusted ? [] : []),
  ];

  if (scenario.type === "gift-for-duo-repayment" && duoExtraRepaymentGift > 0) {
    warnings.push(
      "De schenking wordt in dit scenario alleen als extra DUO-aflossing gebruikt en niet nogmaals als eigen inbreng.",
    );
  }

  if (financingGap > 0) {
    warnings.push("Er blijft een financieringstekort over na de gekozen bronnen.");
  } else if (financingGap < 0) {
    warnings.push("De gekozen bronnen overschrijden de benodigde financiering.");
  }

  if (scenario.type === "gift-stops" && receivedGiftMonthly > 0) {
    warnings.push(
      "Periodieke schenkingen zijn onzeker en worden hier apart gestresst in plaats van als gegarandeerde financiering.",
    );
  }

  const debtsBySource: DebtBySource = {
    bankMortgage: bankMortgageUsed || undefined,
    familyLoan: familyLoanUsed || undefined,
    duoDebt: duoDebtAfterGift || sanitizeMoney(input.duo?.remainingDebt) || undefined,
  };

  const assumptions = [...defaultAssumptions(), ...(scenario.assumptions ?? [])];

  return {
    totalFinancing,
    financingGap,
    ownFundsUsed,
    remainingBuffer,
    contractualMonthlyPayments,
    netHouseholdCashflow,
    parentCashflow,
    debtsBySource,
    giftCashflows,
    warnings,
    assumptions,
    stressTests,
  };
}
