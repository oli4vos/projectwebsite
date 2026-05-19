import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import type { Box3Input, Box3Result } from "@/lib/tax/types";

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundRate(value: number) {
  return Math.round(value * 10000) / 10000;
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value as number, 0), 100);
}

export function calculateBox3Tax(input: Box3Input): Box3Result {
  const year = input.year ?? getDefaultFinancialYear();
  const constants = getFinancialConstants(year);
  const box3 = constants.box3;
  const bankDeposits = sanitizeMoney(input.bankDeposits);
  const investmentsAndOtherAssets = sanitizeMoney(input.investmentsAndOtherAssets);
  const debts = sanitizeMoney(input.debts);
  const assetsTotal = roundMoney(bankDeposits + investmentsAndOtherAssets);
  const debtsTotal = roundMoney(debts);
  const netWorth = roundMoney(Math.max(assetsTotal - debtsTotal, 0));
  const taxFreeAllowance = input.hasFiscalPartner
    ? box3.taxFreeAllowancePartners
    : box3.taxFreeAllowanceSingle;
  const taxableBase = roundMoney(Math.max(netWorth - taxFreeAllowance, 0));
  const method = input.method ?? "actual";

  const deemedReturnBankDeposits =
    method === "forfaitary"
      ? roundMoney(bankDeposits * (box3.deemedReturns.bankDeposits / 100))
      : 0;
  const deemedReturnInvestments =
    method === "forfaitary"
      ? roundMoney(
          investmentsAndOtherAssets *
            (box3.deemedReturns.investmentsAndOtherAssets / 100),
        )
      : 0;
  const deemedReturnDebts =
    method === "forfaitary"
      ? roundMoney(debtsTotal * (box3.deemedReturns.debts / 100))
      : 0;

  const taxableDeemedReturn =
    method === "forfaitary"
      ? (() => {
          const grossDeemedReturn = roundMoney(
            deemedReturnBankDeposits + deemedReturnInvestments - deemedReturnDebts,
          );
          const taxableShare = netWorth > 0 ? taxableBase / netWorth : 0;
          return roundMoney(Math.max(grossDeemedReturn * taxableShare, 0));
        })()
      : (() => {
          const actualAnnualReturnRate = sanitizePercent(input.actualAnnualReturnRate);
          const annualReturnOnNetWorth = roundMoney(
            netWorth * (actualAnnualReturnRate / 100),
          );
          const taxableShare = netWorth > 0 ? taxableBase / netWorth : 0;
          return roundMoney(Math.max(annualReturnOnNetWorth * taxableShare, 0));
        })();

  const box3Tax = roundMoney(taxableDeemedReturn * (box3.taxRate / 100));
  const effectiveTaxRateOnNetWorth =
    netWorth > 0 ? roundRate((box3Tax / netWorth) * 100) : 0;

  const warnings =
    method === "forfaitary"
      ? [
          "Dit is een indicatieve box 3-berekening op basis van forfaitaire rendementen en een vereenvoudigde benadering.",
          "Werkelijke box 3-systematiek kan wijzigen en persoonlijke fiscale regels kunnen afwijken.",
        ]
      : [
          "Dit is een indicatieve box 3-berekening op basis van een ingevuld werkelijk rendement.",
          "Werkelijke box 3-systematiek kan wijzigen en persoonlijke fiscale regels kunnen afwijken.",
        ];
  if (box3.meta.status === "voorlopig") {
    warnings.push(
      "De gebruikte box 3-percentages zijn voorlopig en kunnen later definitief worden aangepast.",
    );
  }

  return {
    year,
    assetsTotal,
    debtsTotal,
    taxFreeAllowance,
    taxableBase,
    deemedReturnBankDeposits,
    deemedReturnInvestments,
    deemedReturnDebts,
    taxableDeemedReturn,
    box3Tax,
    effectiveTaxRateOnNetWorth,
    method,
    warnings,
  };
}
