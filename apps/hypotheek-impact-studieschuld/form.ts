import {
  getAvailableDuoRateYears,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  createDefaultDuoDebtPartFormValues,
  type DuoDebtPartFormValue,
  validateDuoDebtPartFormValues,
} from "@/lib/duo/debt-parts-form";
import {
  parseOptionalDecimalInput,
  parseRequiredDecimalInput,
} from "@/lib/number-input";
import {
  type DuoSituation,
  type HypotheekImpactInput,
  type PaymentSource,
  type RepaymentRule,
} from "./logic";

const FINANCIAL_CONSTANTS = getFinancialConstants(2026);

export type FormState = {
  situation: DuoSituation;
  repaymentRule: RepaymentRule;
  actualMonthlyPayment: string;
  statutoryMonthlyPayment: string;
  remainingStudentDebt: string;
  duoRateYear: string;
  useDebtParts: boolean;
  debtParts: DuoDebtPartFormValue[];
  remainingTermYears: string;
  extraRepayment: string;
  grossIncomeUser: string;
  grossIncomePartner: string;
  desiredHomePrice: string;
  ownMoney: string;
  maxMortgageWithoutStudentDebt: string;
  mortgageRate: string;
  mortgageTermYears: string;
  showAdvancedAssumptions: boolean;
};

export type ValidationErrors = Partial<Record<keyof FormState | "debtParts", string>>;

export function getDefaultDuoRateYear() {
  return getAvailableDuoRateYears(1)[0] ?? FINANCIAL_CONSTANTS.year;
}

export const exampleValues: FormState = {
  situation: "repaying",
  repaymentRule: "SF35",
  actualMonthlyPayment: "150",
  statutoryMonthlyPayment: "",
  remainingStudentDebt: "22000",
  duoRateYear: String(getDefaultDuoRateYear()),
  useDebtParts: false,
  debtParts: createDefaultDuoDebtPartFormValues(),
  remainingTermYears: String(FINANCIAL_CONSTANTS.duo.defaultTerms.SF35),
  extraRepayment: "",
  grossIncomeUser: "48000",
  grossIncomePartner: "",
  desiredHomePrice: "375000",
  ownMoney: "25000",
  maxMortgageWithoutStudentDebt: "",
  mortgageRate: String(FINANCIAL_CONSTANTS.mortgage.defaultMortgageRate),
  mortgageTermYears: String(FINANCIAL_CONSTANTS.mortgage.defaultMortgageTermYears),
  showAdvancedAssumptions: false,
};

export const defaultValues: FormState = {
  situation: "repaying",
  repaymentRule: "SF35",
  actualMonthlyPayment: "",
  statutoryMonthlyPayment: "",
  remainingStudentDebt: "",
  duoRateYear: String(getDefaultDuoRateYear()),
  useDebtParts: false,
  debtParts: createDefaultDuoDebtPartFormValues(),
  remainingTermYears: "",
  extraRepayment: "",
  grossIncomeUser: "",
  grossIncomePartner: "",
  desiredHomePrice: "",
  ownMoney: "",
  maxMortgageWithoutStudentDebt: "",
  mortgageRate: "",
  mortgageTermYears: "",
  showAdvancedAssumptions: false,
};

export const situationLabels: Record<DuoSituation, string> = {
  repaying: "Ik betaal al maandelijks aan DUO",
  gracePeriod: "Ik zit in de aanloopfase",
  incomeBasedReduction: "Mijn maandbedrag is verlaagd door draagkracht",
  paymentPause: "Ik gebruik een aflossingsvrije periode",
  unknown: "Ik weet het niet",
};

export const ruleLabels: Record<RepaymentRule, string> = {
  SF35: "SF35",
  SF15: "SF15",
  SF15_OLD: "SF15-oud",
  SF15_LLLK: "SF15-lllk",
  UNKNOWN: "Onbekend",
};

export const paymentSourceLabels: Record<PaymentSource, string> = {
  actual: "Feitelijke betaling",
  statutory: "Wettelijk maandbedrag",
  estimated: "Geschat maandbedrag",
  incomeBased: "Draagkracht-scenario",
  mixed: "Combinatie van feitelijk en wettelijk/geschat",
};

function parseOptionalNumber(value: string) {
  return parseOptionalDecimalInput(value);
}

function parseRequiredNumber(value: string) {
  return parseRequiredDecimalInput(value);
}

export function validateForm(values: FormState) {
  const errors: ValidationErrors = {};

  const actualMonthlyPayment = parseOptionalNumber(values.actualMonthlyPayment);
  const statutoryMonthlyPayment = parseOptionalNumber(values.statutoryMonthlyPayment);
  const remainingStudentDebtInput = parseOptionalNumber(values.remainingStudentDebt);
  const duoRateYear = Number.parseInt(values.duoRateYear, 10);
  const remainingTermYears = parseOptionalNumber(values.remainingTermYears);
  const extraRepayment = parseOptionalNumber(values.extraRepayment);
  const grossIncomeUser = parseRequiredNumber(values.grossIncomeUser);
  const grossIncomePartner = parseOptionalNumber(values.grossIncomePartner);
  const desiredHomePrice = parseOptionalNumber(values.desiredHomePrice);
  const ownMoney = parseOptionalNumber(values.ownMoney);
  const maxMortgageWithoutStudentDebt = parseOptionalNumber(
    values.maxMortgageWithoutStudentDebt,
  );
  const mortgageRate = parseRequiredNumber(values.mortgageRate);
  const mortgageTermYears = parseRequiredNumber(values.mortgageTermYears);
  const debtPartsValidation = validateDuoDebtPartFormValues(values.debtParts);
  const remainingStudentDebt = values.useDebtParts
    ? debtPartsValidation.totalDebt
    : remainingStudentDebtInput;

  const showActualField =
    values.situation === "repaying" ||
    values.situation === "incomeBasedReduction" ||
    values.situation === "paymentPause";
  const showStatutoryField =
    values.situation === "gracePeriod" ||
    values.situation === "incomeBasedReduction" ||
    values.situation === "paymentPause" ||
    values.situation === "unknown";
  const canEstimateFromDebt = values.useDebtParts
    ? debtPartsValidation.totalDebt > 0
    : remainingStudentDebt !== undefined && Number.isFinite(remainingStudentDebt);

  if (showActualField) {
    if (
      actualMonthlyPayment !== undefined &&
      (!Number.isFinite(actualMonthlyPayment) || actualMonthlyPayment < 0)
    ) {
      errors.actualMonthlyPayment =
        "Gebruik 0 of een hoger DUO-maandbedrag.";
    }
  }

  if (showStatutoryField) {
    if (
      statutoryMonthlyPayment !== undefined &&
      (!Number.isFinite(statutoryMonthlyPayment) || statutoryMonthlyPayment < 0)
    ) {
      errors.statutoryMonthlyPayment =
        "Gebruik 0 of een hoger wettelijk maandbedrag.";
    }
  }

  if (
    !values.useDebtParts &&
    remainingStudentDebt !== undefined &&
    (!Number.isFinite(remainingStudentDebt) || remainingStudentDebt < 0)
  ) {
    errors.remainingStudentDebt =
      "Gebruik 0 of een hogere resterende studieschuld.";
  }

  if (!values.useDebtParts) {
    const supportedRateYears = new Set(getAvailableDuoRateYears());
    if (!Number.isInteger(duoRateYear) || !supportedRateYears.has(duoRateYear)) {
      errors.duoRateYear = "Kies een DUO-rentejaar uit de laatste 5 jaar.";
    }
  } else if (debtPartsValidation.sanitizedParts.length === 0) {
    errors.debtParts = "Voeg minimaal één leningdeel toe met bedrag en rentejaar.";
  }

  if (
    remainingTermYears !== undefined &&
    (!Number.isFinite(remainingTermYears) || remainingTermYears <= 0)
  ) {
    errors.remainingTermYears = "Gebruik een resterende looptijd groter dan 0.";
  }

  if (
    extraRepayment !== undefined &&
    (!Number.isFinite(extraRepayment) || extraRepayment < 0)
  ) {
    errors.extraRepayment = "Gebruik 0 of een hoger bedrag voor extra aflossen.";
  }

  if (!Number.isFinite(grossIncomeUser) || grossIncomeUser < 0) {
    errors.grossIncomeUser = "Gebruik 0 of een hoger bruto jaarinkomen.";
  }

  if (
    grossIncomePartner !== undefined &&
    (!Number.isFinite(grossIncomePartner) || grossIncomePartner < 0)
  ) {
    errors.grossIncomePartner = "Gebruik 0 of een hoger partnerinkomen.";
  }

  if (
    desiredHomePrice !== undefined &&
    (!Number.isFinite(desiredHomePrice) || desiredHomePrice < 0)
  ) {
    errors.desiredHomePrice = "Gebruik 0 of een hogere woningprijs.";
  }

  if (ownMoney !== undefined && (!Number.isFinite(ownMoney) || ownMoney < 0)) {
    errors.ownMoney = "Gebruik 0 of een hoger bedrag aan eigen geld.";
  }

  if (
    maxMortgageWithoutStudentDebt !== undefined &&
    (!Number.isFinite(maxMortgageWithoutStudentDebt) ||
      maxMortgageWithoutStudentDebt < 0)
  ) {
    errors.maxMortgageWithoutStudentDebt =
      "Gebruik 0 of een hogere maximale hypotheek.";
  }

  if (!Number.isFinite(mortgageRate) || mortgageRate < 0) {
    errors.mortgageRate = "Gebruik 0% of een hogere hypotheekrente.";
  }

  if (!Number.isFinite(mortgageTermYears) || mortgageTermYears <= 0) {
    errors.mortgageTermYears = "Gebruik een hypotheeklooptijd groter dan 0.";
  }

  if (
    values.situation === "repaying" &&
    actualMonthlyPayment === undefined &&
    statutoryMonthlyPayment === undefined &&
    !canEstimateFromDebt
  ) {
    errors.actualMonthlyPayment =
      "Vul je actuele DUO-bedrag in, of geef minimaal je resterende schuld op zodat we kunnen schatten.";
  }

  if (values.situation === "incomeBasedReduction") {
    if (actualMonthlyPayment === undefined) {
      errors.actualMonthlyPayment =
        "Vul het lagere draagkrachtbedrag in dat je nu feitelijk betaalt.";
    }

    if (statutoryMonthlyPayment === undefined && !canEstimateFromDebt) {
      errors.statutoryMonthlyPayment =
        "Vul ook je wettelijke maandbedrag in, of geef je resterende schuld op zodat we dit kunnen schatten.";
    }
  }

  if (
    (values.situation === "gracePeriod" ||
      values.situation === "paymentPause" ||
      values.situation === "unknown") &&
    statutoryMonthlyPayment === undefined &&
    !canEstimateFromDebt
  ) {
    errors.remainingStudentDebt =
      "Vul je resterende studieschuld in, of geef een wettelijk maandbedrag op zodat we een veilige schatting kunnen maken.";
  }

  if (
    extraRepayment !== undefined &&
    extraRepayment > 0 &&
    (remainingStudentDebt === undefined ||
      !Number.isFinite(remainingStudentDebt) ||
      remainingStudentDebt <= 0)
  ) {
    errors.extraRepayment =
      "Vul ook je resterende studieschuld in om extra aflossen te kunnen schatten.";
  }

  if (
    extraRepayment !== undefined &&
    remainingStudentDebt !== undefined &&
    extraRepayment > remainingStudentDebt
  ) {
    errors.extraRepayment =
      "Extra aflossen kan in deze tool niet hoger zijn dan je resterende studieschuld.";
  }

  const parsedValues: HypotheekImpactInput | null =
    Object.keys(errors).length === 0
      ? {
          situation: values.situation,
          repaymentRule: values.repaymentRule,
          actualMonthlyPayment,
          statutoryMonthlyPayment,
          remainingStudentDebt,
          duoRateYear: Number.parseInt(values.duoRateYear, 10) || getDefaultDuoRateYear(),
          duoDebtParts: values.useDebtParts ? debtPartsValidation.sanitizedParts : undefined,
          remainingTermYears,
          extraRepayment,
          grossIncomeUser,
          grossIncomePartner: grossIncomePartner ?? 0,
          desiredHomePrice,
          ownMoney,
          maxMortgageWithoutStudentDebt,
          mortgageRate,
          mortgageTermYears,
        }
      : null;

  return {
    errors,
    parsedValues,
    debtPartErrors: debtPartsValidation.errorsById,
    debtPartsTotal: debtPartsValidation.totalDebt,
  };
}
