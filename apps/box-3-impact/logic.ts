import { getDefaultFinancialYear, getFinancialConstants } from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";
import type { Box3Method } from "@/lib/tax";

export type Box3ImpactInput = {
  year?: number;
  hasFiscalPartner: boolean;
  method: Box3Method;
  bankDeposits: number;
  investmentsAndOtherAssets: number;
  debts: number;
  expectedSavingsReturn?: number;
  expectedInvestmentReturn?: number;
};

export type Box3ImpactResult = {
  year: number;
  method: Box3Method;
  assetsTotal: number;
  debtsTotal: number;
  netWorth: number;
  taxFreeAllowance: number;
  taxableBase: number;
  deemedReturnBankDeposits: number;
  deemedReturnInvestments: number;
  deemedReturnDebts: number;
  totalDeemedReturn: number;
  box3Tax: number;
  effectiveTaxRateOnNetWorth: number;
  netExpectedReturnAfterBox3?: number;
  expectedGrossReturn?: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
    taxRate: number;
    deemedReturnBankDepositsRate: number;
    deemedReturnInvestmentsRate: number;
    deemedReturnDebtsRate: number;
  };
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYear(value?: number) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

export function calculateBox3ImpactScenario(input: Box3ImpactInput): Box3ImpactResult {
  const year = sanitizeYear(input.year);
  const method = input.method ?? "actual";
  const bankDeposits = sanitizeMoney(input.bankDeposits);
  const investmentsAndOtherAssets = sanitizeMoney(input.investmentsAndOtherAssets);
  const debts = sanitizeMoney(input.debts);

  const base = calculateBox3Tax({
    year,
    method,
    hasFiscalPartner: Boolean(input.hasFiscalPartner),
    bankDeposits,
    investmentsAndOtherAssets,
    debts,
    actualAnnualReturnRate:
      method === "actual"
        ? sanitizePercent(
            Math.max(
              sanitizePercent(input.expectedSavingsReturn) ?? 0,
              sanitizePercent(input.expectedInvestmentReturn) ?? 0,
            ),
          )
        : undefined,
  });

  const constants = getFinancialConstants(year).box3;
  const netWorth = roundMoney(Math.max(base.assetsTotal - base.debtsTotal, 0));
  const totalDeemedReturn = roundMoney(
    Math.max(
      base.deemedReturnBankDeposits +
        base.deemedReturnInvestments -
        base.deemedReturnDebts,
      0,
    ),
  );

  const safeSavingsReturn = sanitizePercent(input.expectedSavingsReturn);
  const safeInvestmentsReturn = sanitizePercent(input.expectedInvestmentReturn);
  const hasExpectedReturn =
    safeSavingsReturn !== undefined || safeInvestmentsReturn !== undefined;

  const expectedGrossReturn = hasExpectedReturn
    ? roundMoney(
        bankDeposits * ((safeSavingsReturn ?? 0) / 100) +
          investmentsAndOtherAssets * ((safeInvestmentsReturn ?? 0) / 100),
      )
    : undefined;
  const netExpectedReturnAfterBox3 =
    expectedGrossReturn !== undefined
      ? roundMoney(Math.max(expectedGrossReturn - base.box3Tax, 0))
      : undefined;

  return {
    year: base.year,
    method: base.method,
    assetsTotal: base.assetsTotal,
    debtsTotal: base.debtsTotal,
    netWorth,
    taxFreeAllowance: base.taxFreeAllowance,
    taxableBase: base.taxableBase,
    deemedReturnBankDeposits: base.deemedReturnBankDeposits,
    deemedReturnInvestments: base.deemedReturnInvestments,
    deemedReturnDebts: base.deemedReturnDebts,
    totalDeemedReturn,
    box3Tax: base.box3Tax,
    effectiveTaxRateOnNetWorth: base.effectiveTaxRateOnNetWorth,
    expectedGrossReturn,
    netExpectedReturnAfterBox3,
    assumptions: {
      sourceLabel: constants.meta.sourceLabel,
      lastChecked: constants.meta.lastChecked,
      status: constants.meta.status,
      taxRate: constants.taxRate,
      deemedReturnBankDepositsRate: constants.deemedReturns.bankDeposits,
      deemedReturnInvestmentsRate: constants.deemedReturns.investmentsAndOtherAssets,
      deemedReturnDebtsRate: constants.deemedReturns.debts,
    },
    warnings: [
      ...base.warnings,
      "Deze tool is indicatief en geen officiële aangifteberekening.",
    ],
  };
}
