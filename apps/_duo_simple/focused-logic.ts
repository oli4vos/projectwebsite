import { getAvailableDuoRateYears } from "@/lib/financial-constants";
import {
  calculateStudyStopScenarios,
  type StudyStopCalculationResult,
  type StudyStopFocusScenarioKey,
  type StudyStopInput,
} from "@/lib/duo/studeren-stoppen";
import type { RepaymentRule } from "@/lib/duo/types";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type SimpleDuoToolMode = "start-borrowing" | "stop-cost" | "monthly-impact";

export type SimpleDuoValues = {
  calculationMonth: string;
  monthsUntilDiploma: string;
  currentLoanDebt: string;
  currentCollegegeldkredietDebt: string;
  currentBasisbeursDebt: string;
  currentAanvullendeBeursDebt: string;
  currentReisproductDebt: string;
  monthlyLoan: string;
  monthlyCollegegeldkrediet: string;
  monthlyBasisbeurs: string;
  monthlyAanvullendeBeurs: string;
  monthlyReisproduct: string;
  repaymentRule: RepaymentRule;
  duoRateYear: string;
};

export type SimpleDuoErrors = Partial<Record<keyof SimpleDuoValues, string>>;

export type SimpleDuoView =
  | {
      isValid: false;
      errors: SimpleDuoErrors;
    }
  | {
      isValid: true;
      errors: SimpleDuoErrors;
      input: StudyStopInput;
      result: StudyStopCalculationResult;
      focusScenario: StudyStopCalculationResult["focusScenarios"][number];
    };

const modeToFocusKey: Record<SimpleDuoToolMode, StudyStopFocusScenarioKey> = {
  "start-borrowing": "start-study-borrowing",
  "stop-cost": "stop-performance-grant-cost",
  "monthly-impact": "change-monthly-loan-impact",
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function parseMoney(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsed = parseOptionalDecimalInput(value);
  return parsed !== undefined && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseMonths(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsed = parseOptionalDecimalInput(value);
  return parsed !== undefined && Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function validateMoney(values: SimpleDuoValues, field: keyof SimpleDuoValues, errors: SimpleDuoErrors) {
  const value = values[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    return;
  }

  if (parseMoney(value) === undefined) {
    errors[field] = "Gebruik 0 of een positief bedrag.";
  }
}

export function defaultSimpleDuoValues(mode: SimpleDuoToolMode): SimpleDuoValues {
  const shared = {
    calculationMonth: currentMonth(),
    monthsUntilDiploma: mode === "stop-cost" ? "0" : "36",
    currentLoanDebt: mode === "start-borrowing" ? "0" : "18000",
    currentCollegegeldkredietDebt: mode === "start-borrowing" ? "0" : "2000",
    currentBasisbeursDebt: mode === "start-borrowing" ? "0" : "1500",
    currentAanvullendeBeursDebt: mode === "start-borrowing" ? "0" : "2500",
    currentReisproductDebt: mode === "start-borrowing" ? "0" : "1200",
    monthlyLoan: mode === "stop-cost" ? "0" : "300",
    monthlyCollegegeldkrediet: mode === "stop-cost" ? "0" : "0",
    monthlyBasisbeurs: mode === "start-borrowing" ? "130.21" : "0",
    monthlyAanvullendeBeurs: "0",
    monthlyReisproduct: "0",
    repaymentRule: "SF35" as RepaymentRule,
    duoRateYear: String(getAvailableDuoRateYears()[0] ?? new Date().getFullYear()),
  };

  if (mode === "monthly-impact") {
    return {
      ...shared,
      monthlyLoan: "150",
      monthlyCollegegeldkrediet: "0",
    };
  }

  return shared;
}

export function emptySimpleDuoValues(mode: SimpleDuoToolMode): SimpleDuoValues {
  return {
    ...defaultSimpleDuoValues(mode),
    monthsUntilDiploma: mode === "stop-cost" ? "0" : "",
    currentLoanDebt: "",
    currentCollegegeldkredietDebt: "",
    currentBasisbeursDebt: "",
    currentAanvullendeBeursDebt: "",
    currentReisproductDebt: "",
    monthlyLoan: "",
    monthlyCollegegeldkrediet: "",
    monthlyBasisbeurs: "",
    monthlyAanvullendeBeurs: "",
    monthlyReisproduct: "",
  };
}

export function validateSimpleDuoValues(mode: SimpleDuoToolMode, values: SimpleDuoValues) {
  const errors: SimpleDuoErrors = {};
  const supportedRateYears = new Set(getAvailableDuoRateYears());

  if (!/^(\d{4})-(\d{2})$/.test(values.calculationMonth)) {
    errors.calculationMonth = "Gebruik een maand in de vorm jjjj-mm.";
  }

  if (mode !== "stop-cost" && parseMonths(values.monthsUntilDiploma) === undefined) {
    errors.monthsUntilDiploma = "Vul het aantal maanden tot je diploma in.";
  }

  for (const field of [
    "currentLoanDebt",
    "currentCollegegeldkredietDebt",
    "currentBasisbeursDebt",
    "currentAanvullendeBeursDebt",
    "currentReisproductDebt",
    "monthlyLoan",
    "monthlyCollegegeldkrediet",
    "monthlyBasisbeurs",
    "monthlyAanvullendeBeurs",
    "monthlyReisproduct",
  ] as const) {
    validateMoney(values, field, errors);
  }

  const parsedRateYear = Number.parseInt(values.duoRateYear, 10);
  if (!Number.isInteger(parsedRateYear) || !supportedRateYears.has(parsedRateYear)) {
    errors.duoRateYear = "Kies een DUO-rentejaar uit de lijst.";
  }

  return errors;
}

export function mapSimpleDuoValuesToInput(mode: SimpleDuoToolMode, values: SimpleDuoValues): StudyStopInput {
  const monthsUntilDiploma = parseMonths(values.monthsUntilDiploma) ?? 0;

  return {
    calculationMonth: values.calculationMonth,
    studyLevel: "hbo",
    currentLoanDebt: mode === "start-borrowing" ? 0 : parseMoney(values.currentLoanDebt),
    currentCollegegeldkredietDebt:
      mode === "start-borrowing" ? 0 : parseMoney(values.currentCollegegeldkredietDebt),
    currentBasisbeursDebt: mode === "start-borrowing" ? 0 : parseMoney(values.currentBasisbeursDebt),
    currentAanvullendeBeursDebt:
      mode === "start-borrowing" ? 0 : parseMoney(values.currentAanvullendeBeursDebt),
    currentReisproductDebt: mode === "start-borrowing" ? 0 : parseMoney(values.currentReisproductDebt),
    monthlyLoan: mode === "stop-cost" ? 0 : parseMoney(values.monthlyLoan),
    monthlyCollegegeldkrediet: mode === "stop-cost" ? 0 : parseMoney(values.monthlyCollegegeldkrediet),
    monthlyBasisbeurs: mode === "stop-cost" ? 0 : parseMoney(values.monthlyBasisbeurs),
    monthlyAanvullendeBeurs: mode === "stop-cost" ? 0 : parseMoney(values.monthlyAanvullendeBeurs),
    monthlyReisproduct: mode === "stop-cost" ? 0 : parseMoney(values.monthlyReisproduct),
    monthsUntilLaterDiploma: 0,
    monthsUntilContinueDiploma: mode === "stop-cost" ? 0 : monthsUntilDiploma,
    remainingDiplomaTermMonths: 120,
    repaymentRule: "SF35",
    duoRateYear: Number.parseInt(values.duoRateYear, 10),
    hasPartner: false,
    oneTimeExtraRepayment: 0,
    monthlyExtraRepayment: 0,
    aflosvrijeMonths: 0,
  };
}

export function createSimpleDuoView(mode: SimpleDuoToolMode, values: SimpleDuoValues): SimpleDuoView {
  const errors = validateSimpleDuoValues(mode, values);

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  const input = mapSimpleDuoValuesToInput(mode, values);
  const result = calculateStudyStopScenarios(input);
  const focusScenario =
    result.focusScenarios.find((scenario) => scenario.key === modeToFocusKey[mode]) ??
    result.focusScenarios[0];

  return {
    isValid: true,
    errors,
    input,
    result,
    focusScenario,
  };
}
