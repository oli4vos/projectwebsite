import {
  calculateFinancingScenario,
  calculateFamilyLoan,
  type FinancingScenario,
  type FinancingScenarioResult,
  type FamilyLoanInput,
  type FamilyLoanResult,
  type GiftFrequency,
  type FamilyLoanRepaymentType,
} from "@/lib/family-financing";
import { calculateDuoMonthlyPaymentAfterExtraRepayment } from "@/lib/duo";
import type { DuoSituation, RepaymentRule } from "@/lib/duo";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type { UserProfile } from "@/lib/user-profile";

export type FamilyHomeFormState = {
  purchasePrice: string;
  acquisitionCosts: string;
  ownFunds: string;
  minimumBuffer: string;
  bankMortgagePrincipal: string;
  bankMortgageAnnualRate: string;
  bankMortgageTermYears: string;
  duoSituation: DuoSituation;
  duoRepaymentRule: RepaymentRule;
  duoRemainingDebt: string;
  duoAnnualInterestRate: string;
  duoRemainingTermYears: string;
  duoCurrentMonthlyPayment: string;
  duoStatutoryMonthlyPayment: string;
  duoGrossAnnualIncome: string;
  duoPartnerGrossAnnualIncome: string;
  extraDuoRepayment: string;
  familyLoanPrincipal: string;
  familyLoanAnnualRate: string;
  familyLoanTermYears: string;
  familyLoanRepaymentType: FamilyLoanRepaymentType;
  oneTimeGiftAmount: string;
  recurringGiftEnabled: boolean;
  recurringGiftAmountPerPeriod: string;
  recurringGiftFrequency: GiftFrequency;
  recurringGiftStartDate: string;
  recurringGiftEndDate: string;
  recurringGiftMaxPayments: string;
};

export type FamilyHomeValidationErrors = Partial<Record<keyof FamilyHomeFormState, string>>;

export type FamilyHomeScenarioSummary = {
  primaryScenario: FinancingScenarioResult;
  withoutRecurringGiftScenario: FinancingScenarioResult;
  familyLoanResult?: FamilyLoanResult;
  familyLoanInput?: FamilyLoanInput;
  familyLoanMonthlyPayment: number;
};

const numberInput = (value: string) => parseOptionalDecimalInput(value);

export const exampleValues: FamilyHomeFormState = {
  purchasePrice: "425000",
  acquisitionCosts: "18000",
  ownFunds: "35000",
  minimumBuffer: "10000",
  bankMortgagePrincipal: "390000",
  bankMortgageAnnualRate: "4.1",
  bankMortgageTermYears: "30",
  duoSituation: "repaying",
  duoRepaymentRule: "SF35",
  duoRemainingDebt: "18500",
  duoAnnualInterestRate: "2.33",
  duoRemainingTermYears: "30",
  duoCurrentMonthlyPayment: "165",
  duoStatutoryMonthlyPayment: "",
  duoGrossAnnualIncome: "52000",
  duoPartnerGrossAnnualIncome: "",
  extraDuoRepayment: "2500",
  familyLoanPrincipal: "25000",
  familyLoanAnnualRate: "3",
  familyLoanTermYears: "15",
  familyLoanRepaymentType: "annuity",
  oneTimeGiftAmount: "10000",
  recurringGiftEnabled: true,
  recurringGiftAmountPerPeriod: "250",
  recurringGiftFrequency: "monthly",
  recurringGiftStartDate: "2026-01-01",
  recurringGiftEndDate: "",
  recurringGiftMaxPayments: "24",
};

export const defaultValues: FamilyHomeFormState = {
  purchasePrice: "",
  acquisitionCosts: "",
  ownFunds: "",
  minimumBuffer: "",
  bankMortgagePrincipal: "",
  bankMortgageAnnualRate: "",
  bankMortgageTermYears: "",
  duoSituation: "repaying",
  duoRepaymentRule: "SF35",
  duoRemainingDebt: "",
  duoAnnualInterestRate: "",
  duoRemainingTermYears: "",
  duoCurrentMonthlyPayment: "",
  duoStatutoryMonthlyPayment: "",
  duoGrossAnnualIncome: "",
  duoPartnerGrossAnnualIncome: "",
  extraDuoRepayment: "",
  familyLoanPrincipal: "",
  familyLoanAnnualRate: "",
  familyLoanTermYears: "",
  familyLoanRepaymentType: "annuity",
  oneTimeGiftAmount: "",
  recurringGiftEnabled: false,
  recurringGiftAmountPerPeriod: "",
  recurringGiftFrequency: "monthly",
  recurringGiftStartDate: "",
  recurringGiftEndDate: "",
  recurringGiftMaxPayments: "",
};

export function buildProfilePatchFromProfile(profile: UserProfile): Partial<FamilyHomeFormState> {
  return {
    purchasePrice:
      profile.housing?.targetHomePrice !== undefined
        ? String(profile.housing.targetHomePrice)
        : "",
    ownFunds:
      profile.housing?.ownFunds !== undefined ? String(profile.housing.ownFunds) : "",
    bankMortgageAnnualRate:
      profile.housing?.mortgageRate !== undefined
        ? String(profile.housing.mortgageRate)
        : "",
    bankMortgageTermYears:
      profile.housing?.mortgageTermYears !== undefined
        ? String(profile.housing.mortgageTermYears)
        : "",
    minimumBuffer:
      profile.savingInvesting?.targetEmergencyFund !== undefined
        ? String(profile.savingInvesting.targetEmergencyFund)
        : "",
    duoRemainingDebt:
      profile.studentDebt?.remainingDebt !== undefined
        ? String(profile.studentDebt.remainingDebt)
        : "",
    duoCurrentMonthlyPayment:
      profile.studentDebt?.currentMonthlyPayment !== undefined
        ? String(profile.studentDebt.currentMonthlyPayment)
        : "",
    duoStatutoryMonthlyPayment:
      profile.studentDebt?.statutoryMonthlyPayment !== undefined
        ? String(profile.studentDebt.statutoryMonthlyPayment)
        : "",
    duoRepaymentRule: profile.studentDebt?.repaymentRule ?? "SF35",
    duoSituation: profile.studentDebt?.duoSituation ?? "repaying",
    duoAnnualInterestRate:
      profile.studentDebt?.duoInterestRate !== undefined
        ? String(profile.studentDebt.duoInterestRate)
        : "",
    duoRemainingTermYears:
      profile.studentDebt?.remainingTermYears !== undefined
        ? String(profile.studentDebt.remainingTermYears)
        : "",
    duoGrossAnnualIncome:
      profile.income?.grossAnnualIncome !== undefined
        ? String(profile.income.grossAnnualIncome)
        : "",
    duoPartnerGrossAnnualIncome:
      profile.income?.partnerGrossAnnualIncome !== undefined
        ? String(profile.income.partnerGrossAnnualIncome)
        : "",
  };
}

export function buildFamilyLoanInput(
  values: FamilyHomeFormState,
): FamilyLoanInput | undefined {
  const principal = numberInput(values.familyLoanPrincipal);
  if (principal === undefined || principal <= 0) {
    return undefined;
  }

  return {
    principal,
    annualRate: Math.max(numberInput(values.familyLoanAnnualRate) ?? 0, 0),
    termYears: Math.max(numberInput(values.familyLoanTermYears) ?? 0, 0),
    repaymentType: values.familyLoanRepaymentType,
  };
}

function buildGiftInputs(values: FamilyHomeFormState) {
  const gifts = [];
  const oneTimeGiftAmount = numberInput(values.oneTimeGiftAmount);
  if (oneTimeGiftAmount !== undefined && oneTimeGiftAmount > 0) {
    gifts.push({
      kind: "one-time" as const,
      amount: oneTimeGiftAmount,
      transferDate: undefined,
    });
  }

  if (values.recurringGiftEnabled) {
    const recurringGiftAmount = numberInput(values.recurringGiftAmountPerPeriod);
    if (recurringGiftAmount !== undefined && recurringGiftAmount > 0) {
      gifts.push({
        kind: "recurring" as const,
        amountPerPeriod: recurringGiftAmount,
        frequency: values.recurringGiftFrequency,
        startDate: values.recurringGiftStartDate || undefined,
        endDate: values.recurringGiftEndDate || undefined,
        maxPayments: numberInput(values.recurringGiftMaxPayments),
      });
    }
  }

  return gifts;
}

function buildScenarioType(values: FamilyHomeFormState) {
  if (values.recurringGiftEnabled) {
    if (buildFamilyLoanInput(values)) {
      return "family-loan-with-gift" as const;
    }
    return "gift-stops" as const;
  }

  if (buildFamilyLoanInput(values)) {
    return "family-loan" as const;
  }

  if ((numberInput(values.oneTimeGiftAmount) ?? 0) > 0) {
    return "gift-as-own-funds" as const;
  }

  return "bank-and-own-funds" as const;
}

export function buildFinancingScenario(values: FamilyHomeFormState): FinancingScenario {
  const familyLoan = buildFamilyLoanInput(values);
  return {
    id: "familiehulp-eerste-woning",
    title: "Familiehulp eerste woning",
    description: "Scenario voor eerste woning met bankhypotheek, DUO en familiehulp.",
    type: buildScenarioType(values),
    input: {
      purchasePrice: numberInput(values.purchasePrice) ?? 0,
      acquisitionCosts: numberInput(values.acquisitionCosts) ?? 0,
      ownFunds: numberInput(values.ownFunds) ?? 0,
      minimumBuffer: numberInput(values.minimumBuffer) ?? 0,
      extraDuoRepayment: numberInput(values.extraDuoRepayment) ?? 0,
      bankMortgage:
        numberInput(values.bankMortgagePrincipal) !== undefined &&
        numberInput(values.bankMortgagePrincipal)! > 0
          ? {
              principal: numberInput(values.bankMortgagePrincipal) ?? 0,
              annualRate: Math.max(numberInput(values.bankMortgageAnnualRate) ?? 0, 0),
              years: Math.max(numberInput(values.bankMortgageTermYears) ?? 0, 0),
            }
          : undefined,
      familyLoan,
      gifts: buildGiftInputs(values),
      duo: {
        situation: values.duoSituation,
        repaymentRule: values.duoRepaymentRule,
        remainingDebt: numberInput(values.duoRemainingDebt) ?? 0,
        annualInterestRate: numberInput(values.duoAnnualInterestRate),
        remainingTermYears: numberInput(values.duoRemainingTermYears),
        currentMonthlyPayment: numberInput(values.duoCurrentMonthlyPayment),
        statutoryMonthlyPayment: numberInput(values.duoStatutoryMonthlyPayment),
        grossAnnualIncome: numberInput(values.duoGrossAnnualIncome),
        partnerGrossAnnualIncome: numberInput(values.duoPartnerGrossAnnualIncome),
      },
    },
    usedSources: [
      "bankMortgage",
      "familyLoan",
      "oneTimeGift",
      "recurringGift",
      "ownFunds",
      "duoDebt",
    ],
    assumptions: [],
    includesFutureGifts: values.recurringGiftEnabled,
  };
}

export function buildNoRecurringGiftScenario(values: FamilyHomeFormState): FinancingScenario {
  return {
    ...buildFinancingScenario({
      ...values,
      recurringGiftEnabled: false,
    }),
    id: "familiehulp-eerste-woning-zonder-periodieke-schenking",
    title: "Familiehulp eerste woning zonder periodieke schenking",
    description:
      "Vergelijkingsscenario zonder periodieke schenking; eenmalige schenking en overige inputs blijven gelijk.",
    includesFutureGifts: false,
  };
}

export function validateFamilyHomeForm(values: FamilyHomeFormState): {
  errors: FamilyHomeValidationErrors;
  parsedValues: FamilyHomeFormState | null;
} {
  const errors: FamilyHomeValidationErrors = {};

  const purchasePrice = numberInput(values.purchasePrice);
  const acquisitionCosts = numberInput(values.acquisitionCosts);
  const ownFunds = numberInput(values.ownFunds);
  const minimumBuffer = numberInput(values.minimumBuffer);
  const bankMortgagePrincipal = numberInput(values.bankMortgagePrincipal);
  const bankMortgageAnnualRate = numberInput(values.bankMortgageAnnualRate);
  const bankMortgageTermYears = numberInput(values.bankMortgageTermYears);
  const duoRemainingDebt = numberInput(values.duoRemainingDebt);
  const duoAnnualInterestRate = numberInput(values.duoAnnualInterestRate);
  const duoRemainingTermYears = numberInput(values.duoRemainingTermYears);
  const duoCurrentMonthlyPayment = numberInput(values.duoCurrentMonthlyPayment);
  const duoStatutoryMonthlyPayment = numberInput(values.duoStatutoryMonthlyPayment);
  const duoGrossAnnualIncome = numberInput(values.duoGrossAnnualIncome);
  const duoPartnerGrossAnnualIncome = numberInput(values.duoPartnerGrossAnnualIncome);
  const extraDuoRepayment = numberInput(values.extraDuoRepayment);
  const familyLoanPrincipal = numberInput(values.familyLoanPrincipal);
  const familyLoanAnnualRate = numberInput(values.familyLoanAnnualRate);
  const familyLoanTermYears = numberInput(values.familyLoanTermYears);
  const oneTimeGiftAmount = numberInput(values.oneTimeGiftAmount);
  const recurringGiftAmountPerPeriod = numberInput(values.recurringGiftAmountPerPeriod);
  const recurringGiftMaxPayments = numberInput(values.recurringGiftMaxPayments);

  if (purchasePrice === undefined || purchasePrice <= 0) {
    errors.purchasePrice = "Gebruik een woningprijs groter dan 0.";
  }
  if (acquisitionCosts !== undefined && acquisitionCosts < 0) {
    errors.acquisitionCosts = "Gebruik 0 of hogere aankoopkosten.";
  }
  if (ownFunds !== undefined && ownFunds < 0) {
    errors.ownFunds = "Gebruik 0 of meer eigen geld.";
  }
  if (minimumBuffer !== undefined && minimumBuffer < 0) {
    errors.minimumBuffer = "Gebruik 0 of een hogere buffer.";
  }
  if (bankMortgagePrincipal !== undefined && bankMortgagePrincipal < 0) {
    errors.bankMortgagePrincipal = "Gebruik 0 of een hogere hypotheekhoofdsom.";
  }
  if (bankMortgageAnnualRate !== undefined && bankMortgageAnnualRate < 0) {
    errors.bankMortgageAnnualRate = "Gebruik 0% of een hogere hypotheekrente.";
  }
  if (bankMortgageTermYears !== undefined && bankMortgageTermYears <= 0) {
    errors.bankMortgageTermYears = "Gebruik een looptijd groter dan 0 jaar.";
  }
  if (duoRemainingDebt !== undefined && duoRemainingDebt < 0) {
    errors.duoRemainingDebt = "Gebruik 0 of een hogere studieschuld.";
  }
  if (duoAnnualInterestRate !== undefined && duoAnnualInterestRate < 0) {
    errors.duoAnnualInterestRate = "Gebruik 0% of een hogere DUO-rente.";
  }
  if (duoRemainingTermYears !== undefined && duoRemainingTermYears <= 0) {
    errors.duoRemainingTermYears = "Gebruik een resterende looptijd groter dan 0 jaar.";
  }
  if (duoCurrentMonthlyPayment !== undefined && duoCurrentMonthlyPayment < 0) {
    errors.duoCurrentMonthlyPayment = "Gebruik 0 of een hoger DUO-maandbedrag.";
  }
  if (duoStatutoryMonthlyPayment !== undefined && duoStatutoryMonthlyPayment < 0) {
    errors.duoStatutoryMonthlyPayment = "Gebruik 0 of een hoger wettelijk maandbedrag.";
  }
  if (duoGrossAnnualIncome !== undefined && duoGrossAnnualIncome < 0) {
    errors.duoGrossAnnualIncome = "Gebruik 0 of een hoger bruto jaarinkomen.";
  }
  if (duoPartnerGrossAnnualIncome !== undefined && duoPartnerGrossAnnualIncome < 0) {
    errors.duoPartnerGrossAnnualIncome = "Gebruik 0 of een hoger partnerinkomen.";
  }
  if (extraDuoRepayment !== undefined && extraDuoRepayment < 0) {
    errors.extraDuoRepayment = "Gebruik 0 of een hogere extra aflossing.";
  }

  if (familyLoanPrincipal !== undefined && familyLoanPrincipal < 0) {
    errors.familyLoanPrincipal = "Gebruik 0 of een hogere familielening.";
  }
  if (familyLoanAnnualRate !== undefined && familyLoanAnnualRate < 0) {
    errors.familyLoanAnnualRate = "Gebruik 0% of een hogere familierente.";
  }
  if (familyLoanTermYears !== undefined && familyLoanTermYears <= 0) {
    errors.familyLoanTermYears = "Gebruik een familieleninglooptijd groter dan 0 jaar.";
  }

  if (oneTimeGiftAmount !== undefined && oneTimeGiftAmount < 0) {
    errors.oneTimeGiftAmount = "Gebruik 0 of een hogere eenmalige schenking.";
  }
  if (values.recurringGiftEnabled && recurringGiftAmountPerPeriod !== undefined && recurringGiftAmountPerPeriod < 0) {
    errors.recurringGiftAmountPerPeriod = "Gebruik 0 of een hogere periodieke schenking.";
  }
  if (values.recurringGiftEnabled && recurringGiftMaxPayments !== undefined && recurringGiftMaxPayments <= 0) {
    errors.recurringGiftMaxPayments = "Gebruik een maximum aantal betalingen groter dan 0.";
  }

  const parsedValues = Object.keys(errors).length === 0 ? values : null;

  return { errors, parsedValues };
}

export function calculateFamilyHomeScenario(values: FamilyHomeFormState) {
  const primaryScenario = buildFinancingScenario(values);
  const withoutRecurringGiftScenario = buildNoRecurringGiftScenario(values);
  const familyLoanInput = buildFamilyLoanInput(values);
  const familyLoanResult = familyLoanInput ? calculateFamilyLoan(familyLoanInput) : undefined;
  const familyLoanMonthlyPayment = familyLoanResult?.monthlyPayment ?? 0;

  return {
    primaryScenario: calculateFinancingScenario(primaryScenario),
    withoutRecurringGiftScenario: calculateFinancingScenario(withoutRecurringGiftScenario),
    familyLoanResult,
    familyLoanInput,
    familyLoanMonthlyPayment,
  } satisfies FamilyHomeScenarioSummary;
}

export function calculateDuoReductionPreview(values: FamilyHomeFormState) {
  const extraDuoRepayment = numberInput(values.extraDuoRepayment) ?? 0;
  const duoDebt = numberInput(values.duoRemainingDebt) ?? 0;

  return calculateDuoMonthlyPaymentAfterExtraRepayment({
    remainingDebt: duoDebt,
    annualInterestRate: numberInput(values.duoAnnualInterestRate),
    remainingTermYears: numberInput(values.duoRemainingTermYears),
    repaymentRule: values.duoRepaymentRule,
    extraRepaymentAmount: extraDuoRepayment,
  });
}
