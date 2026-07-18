import { calculateIndicativeMaxMortgage, type MortgageMaxMortgageInput, type MortgageMaxMortgageResult } from "@/lib/mortgage";
import { getMortgageAfmTestRateForQuarter } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";

type MortgageEnergyLabel = NonNullable<NonNullable<MortgageMaxMortgageInput["property"]>["energyLabel"]>;

const DEFAULT_AFM_TEST_RATE = getMortgageAfmTestRateForQuarter("2026-Q3", 2026).rate;
const DEFAULT_AFM_TEST_RATE_INPUT = String(DEFAULT_AFM_TEST_RATE);

export type MortgageFormState = {
  grossAnnualHouseholdIncome: string;
  grossAnnualPartnerIncome: string;
  annualMortgageRate: string;
  fixedRatePeriodMonths: string;
  mortgageTermYears: string;
  purchasePrice: string;
  marketValue: string;
  ownFunds: string;
  monthlyDebtPayments: string;
  hasStudentLoan: boolean;
  studentLoanStatus: "repaying" | "start_phase" | "reduced_capacity" | "payment_pause" | "unknown";
  actualMonthlyPayment: string;
  statutoryMonthlyPayment: string;
  nhgRequested: boolean;
  energyLabel: string;
  energySavingMeasuresAmount: string;
  renovationAmount: string;
  afmStressAnnualRate: string;
};

export type MortgageValidationErrors = Partial<Record<keyof MortgageFormState, string>>;

export const exampleValues: MortgageFormState = {
  grossAnnualHouseholdIncome: "80000",
  grossAnnualPartnerIncome: "0",
  annualMortgageRate: "4,5",
  fixedRatePeriodMonths: "120",
  mortgageTermYears: "30",
  purchasePrice: "350000",
  marketValue: "350000",
  ownFunds: "30000",
  monthlyDebtPayments: "0",
  hasStudentLoan: true,
  studentLoanStatus: "repaying",
  actualMonthlyPayment: "165",
  statutoryMonthlyPayment: "0",
  nhgRequested: true,
  energyLabel: "A",
  energySavingMeasuresAmount: "0",
  renovationAmount: "0",
  afmStressAnnualRate: DEFAULT_AFM_TEST_RATE_INPUT,
};

export const defaultValues: MortgageFormState = {
  grossAnnualHouseholdIncome: "",
  grossAnnualPartnerIncome: "",
  annualMortgageRate: "",
  fixedRatePeriodMonths: "120",
  mortgageTermYears: "30",
  purchasePrice: "",
  marketValue: "",
  ownFunds: "",
  monthlyDebtPayments: "",
  hasStudentLoan: false,
  studentLoanStatus: "repaying",
  actualMonthlyPayment: "",
  statutoryMonthlyPayment: "",
  nhgRequested: true,
  energyLabel: "unknown",
  energySavingMeasuresAmount: "",
  renovationAmount: "",
  afmStressAnnualRate: DEFAULT_AFM_TEST_RATE_INPUT,
};

function asPositiveNumber(value: string | undefined) {
  const parsed = parseOptionalDecimalInput(value);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export function validateMortgageForm(values: MortgageFormState) {
  const errors: MortgageValidationErrors = {};

  const grossAnnualHouseholdIncome = asPositiveNumber(values.grossAnnualHouseholdIncome);
  if (grossAnnualHouseholdIncome === undefined || grossAnnualHouseholdIncome <= 0) {
    errors.grossAnnualHouseholdIncome = "Vul je bruto jaarinkomen in.";
  }

  const annualMortgageRate = asPositiveNumber(values.annualMortgageRate);
  if (annualMortgageRate === undefined || annualMortgageRate > 25) {
    errors.annualMortgageRate = "Gebruik een rente tussen 0 en 25 procent.";
  }

  const fixedRatePeriodMonths = asPositiveNumber(values.fixedRatePeriodMonths);
  if (fixedRatePeriodMonths === undefined || fixedRatePeriodMonths < 1 || fixedRatePeriodMonths > 360) {
    errors.fixedRatePeriodMonths = "Kies een rentevaste periode tussen 1 en 360 maanden.";
  }

  const mortgageTermYears = asPositiveNumber(values.mortgageTermYears);
  if (mortgageTermYears === undefined || mortgageTermYears < 1 || mortgageTermYears > 40) {
    errors.mortgageTermYears = "Kies een looptijd tussen 1 en 40 jaar.";
  }

  const purchasePrice = asPositiveNumber(values.purchasePrice);
  if (purchasePrice === undefined || purchasePrice <= 0) {
    errors.purchasePrice = "Vul een koopprijs in groter dan 0.";
  }

  const marketValue = values.marketValue.trim().length > 0 ? asPositiveNumber(values.marketValue) : purchasePrice;
  if (marketValue === undefined || marketValue <= 0) {
    errors.marketValue = "Vul een geldige woningwaarde in.";
  }

  const ownFunds = asPositiveNumber(values.ownFunds);
  if (ownFunds === undefined) {
    errors.ownFunds = "Gebruik 0 of een hoger bedrag.";
  }

  const monthlyDebtPayments = asPositiveNumber(values.monthlyDebtPayments);
  if (monthlyDebtPayments === undefined) {
    errors.monthlyDebtPayments = "Gebruik 0 of een hoger bedrag.";
  }

  const afmStressAnnualRate = asPositiveNumber(values.afmStressAnnualRate);
  if (afmStressAnnualRate === undefined || afmStressAnnualRate < 0 || afmStressAnnualRate > 25) {
    errors.afmStressAnnualRate = "Gebruik een toetsrente tussen 0 en 25 procent.";
  }

  if (values.hasStudentLoan) {
    if (values.studentLoanStatus === "repaying") {
      const actualMonthlyPayment = asPositiveNumber(values.actualMonthlyPayment);
      if (actualMonthlyPayment === undefined || actualMonthlyPayment <= 0) {
        errors.actualMonthlyPayment = "Vul het actuele DUO-maandbedrag in.";
      }
    } else {
      const statutoryMonthlyPayment = asPositiveNumber(values.statutoryMonthlyPayment);
      if (statutoryMonthlyPayment === undefined || statutoryMonthlyPayment <= 0) {
        errors.statutoryMonthlyPayment = "Vul het wettelijke DUO-maandbedrag in.";
      }
    }
  }

  return {
    errors,
    parsed:
      Object.keys(errors).length === 0
        ? buildMortgageCalculationInput(values)
        : null,
  };
}

export function buildMortgageCalculationInput(values: MortgageFormState): MortgageMaxMortgageInput {
  const purchasePrice = asPositiveNumber(values.purchasePrice) ?? 0;
  const marketValue =
    values.marketValue.trim().length > 0
      ? (asPositiveNumber(values.marketValue) ?? purchasePrice)
      : purchasePrice;

  return {
    grossAnnualHouseholdIncome: asPositiveNumber(values.grossAnnualHouseholdIncome) ?? 0,
    grossAnnualPartnerIncome: asPositiveNumber(values.grossAnnualPartnerIncome),
    annualMortgageRate: asPositiveNumber(values.annualMortgageRate) ?? 0,
    fixedRatePeriodMonths: asPositiveNumber(values.fixedRatePeriodMonths) ?? 120,
    mortgageTermYears: asPositiveNumber(values.mortgageTermYears) ?? 30,
    ownFunds: asPositiveNumber(values.ownFunds) ?? 0,
    monthlyDebtPayments: asPositiveNumber(values.monthlyDebtPayments),
    studentLoan: values.hasStudentLoan
      ? {
          hasStudentLoan: true,
          status: values.studentLoanStatus,
          actualMonthlyPayment: asPositiveNumber(values.actualMonthlyPayment),
          statutoryMonthlyPayment: asPositiveNumber(values.statutoryMonthlyPayment),
        }
      : { hasStudentLoan: false },
    property: {
      purchasePrice,
      marketValue,
      nhgRequested: values.nhgRequested,
      energyLabel: values.energyLabel as MortgageEnergyLabel,
      energySavingMeasuresAmount: asPositiveNumber(values.energySavingMeasuresAmount),
      renovationAmount: asPositiveNumber(values.renovationAmount),
    },
    afmStressAnnualRate: asPositiveNumber(values.afmStressAnnualRate) ?? DEFAULT_AFM_TEST_RATE,
  };
}

export function calculateMortgageScenario(values: MortgageFormState): MortgageMaxMortgageResult {
  return calculateIndicativeMaxMortgage(buildMortgageCalculationInput(values));
}
