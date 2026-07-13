import { getAvailableDuoRateYears, getDefaultFinancialYear } from "@/lib/financial-constants";
import {
  calculateStudyStopScenarios,
  createEmptyStudyStopValues,
  createStudyStopDefaultValues,
  type StudyLevel,
  type StudyStopCalculationResult,
  type StudyStopInput,
  type StudyStopScenarioKey,
} from "@/lib/duo/studeren-stoppen";
import type { RepaymentRule } from "@/lib/duo/types";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type StudyStopFormValues = {
  calculationMonth: string;
  studyLevel: StudyLevel;
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
  monthsUntilLaterDiploma: string;
  monthsUntilContinueDiploma: string;
  remainingDiplomaTermMonths: string;
  repaymentRule: RepaymentRule;
  duoRateYear: string;
  annualStudyInterestRate: string;
  annualRepaymentInterestRate: string;
  grossAnnualIncome: string;
  partnerGrossAnnualIncome: string;
  hasPartner: boolean;
  oneTimeExtraRepayment: string;
  monthlyExtraRepayment: string;
  aflosvrijeMonths: string;
};

export type StudyStopValidationErrors = Partial<Record<keyof StudyStopFormValues, string>>;

export type StudyStopComparisonRow = {
  key: StudyStopScenarioKey;
  label: string;
  note: string;
  debtAtStop: number;
  debtAtRepaymentStart: number;
  debtAtDiploma?: number;
  usedMonthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  monthsToDebtFree: number;
  payoffDate: string | null;
  finalDebt: number;
  restschuld: number;
};

export type StudyStopView =
  | {
      isValid: false;
      errors: StudyStopValidationErrors;
      year: number;
    }
  | {
      isValid: true;
      errors: StudyStopValidationErrors;
      year: number;
      input: StudyStopInput;
      result: StudyStopCalculationResult;
      comparisonRows: StudyStopComparisonRow[];
    };

export const repaymentRuleOptions: RepaymentRule[] = [
  "SF35",
  "SF15",
  "SF15_OLD",
  "SF15_LLLK",
  "UNKNOWN",
];

export const studyLevelOptions: Array<{ label: string; value: StudyLevel; helper: string }> = [
  {
    label: "Mbo 3/4",
    value: "mbo34",
    helper: "10 jaar diplomatermijn voor prestatiebeurs en reisproduct.",
  },
  {
    label: "Hbo",
    value: "hbo",
    helper: "10 jaar diplomatermijn voor prestatiebeurs en reisproduct.",
  },
  {
    label: "Universiteit",
    value: "university",
    helper: "10 jaar diplomatermijn voor prestatiebeurs en reisproduct.",
  },
];

function normalizeMonthValue(value: string) {
  return /^(\d{4})-(\d{2})$/.test(value.trim()) ? value.trim() : "";
}

function parsePositiveOrZero(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }
  const parsed = parseOptionalDecimalInput(value);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

function getCurrentDebtTotal(values: StudyStopFormValues) {
  return (
    (parsePositiveOrZero(values.currentLoanDebt) ?? 0) +
    (parsePositiveOrZero(values.currentCollegegeldkredietDebt) ?? 0) +
    (parsePositiveOrZero(values.currentBasisbeursDebt) ?? 0) +
    (parsePositiveOrZero(values.currentAanvullendeBeursDebt) ?? 0) +
    (parsePositiveOrZero(values.currentReisproductDebt) ?? 0)
  );
}

function validateMoneyField(
  values: StudyStopFormValues,
  field: keyof StudyStopFormValues,
  label: string,
  errors: StudyStopValidationErrors,
) {
  const value = values[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    return;
  }
  const parsed = parseOptionalDecimalInput(value);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < 0) {
    errors[field] = `Gebruik 0 of een hoger bedrag voor ${label.toLowerCase()}.`;
  }
}

function validateIntegerField(
  values: StudyStopFormValues,
  field: keyof StudyStopFormValues,
  label: string,
  errors: StudyStopValidationErrors,
) {
  const value = values[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    return;
  }
  const parsed = parseOptionalDecimalInput(value);
  if (
    parsed === undefined ||
    !Number.isFinite(parsed) ||
    parsed < 0 ||
    !Number.isInteger(parsed)
  ) {
    errors[field] = `Gebruik een heel aantal maanden voor ${label.toLowerCase()}.`;
  }
}

export function validateStudyStopForm(values: StudyStopFormValues): StudyStopValidationErrors {
  const errors: StudyStopValidationErrors = {};
  const supportedRateYears = new Set(getAvailableDuoRateYears());

  if (values.calculationMonth.trim().length > 0 && !normalizeMonthValue(values.calculationMonth)) {
    errors.calculationMonth = "Gebruik een maand in de vorm jjjj-mm.";
  }

  if (!studyLevelOptions.some((option) => option.value === values.studyLevel)) {
    errors.studyLevel = "Kies een geldige opleidingssoort.";
  }

  if (!repaymentRuleOptions.includes(values.repaymentRule)) {
    errors.repaymentRule = "Kies een geldige terugbetalingsregel.";
  }

  validateMoneyField(values, "currentLoanDebt", "de rentedragende lening", errors);
  validateMoneyField(values, "currentCollegegeldkredietDebt", "het collegegeldkrediet", errors);
  validateMoneyField(values, "currentBasisbeursDebt", "de basisbeurs", errors);
  validateMoneyField(values, "currentAanvullendeBeursDebt", "de aanvullende beurs", errors);
  validateMoneyField(values, "currentReisproductDebt", "het studentenreisproduct", errors);
  validateMoneyField(values, "monthlyLoan", "de maandelijkse lening", errors);
  validateMoneyField(
    values,
    "monthlyCollegegeldkrediet",
    "het maandelijkse collegegeldkrediet",
    errors,
  );
  validateMoneyField(values, "monthlyBasisbeurs", "de maandelijkse basisbeurs", errors);
  validateMoneyField(
    values,
    "monthlyAanvullendeBeurs",
    "de maandelijkse aanvullende beurs",
    errors,
  );
  validateMoneyField(values, "monthlyReisproduct", "het maandelijkse reisproduct", errors);
  validateMoneyField(values, "annualStudyInterestRate", "de studie-rente", errors);
  validateMoneyField(values, "annualRepaymentInterestRate", "de terugbetalingsrente", errors);
  validateMoneyField(values, "grossAnnualIncome", "het toetsingsinkomen", errors);
  validateMoneyField(values, "partnerGrossAnnualIncome", "het partnerinkomen", errors);
  validateMoneyField(values, "oneTimeExtraRepayment", "de eenmalige extra aflossing", errors);
  validateMoneyField(values, "monthlyExtraRepayment", "de extra maandaflossing", errors);

  validateIntegerField(values, "monthsUntilLaterDiploma", "het aantal maanden tot het latere diploma", errors);
  validateIntegerField(
    values,
    "monthsUntilContinueDiploma",
    "het aantal maanden extra studeren",
    errors,
  );
  validateIntegerField(values, "remainingDiplomaTermMonths", "de diplomatermijn in maanden", errors);
  validateIntegerField(values, "aflosvrijeMonths", "de aflosvrije periode in maanden", errors);

  if (values.duoRateYear.trim().length > 0) {
    const parsedRateYear = Number.parseInt(values.duoRateYear, 10);
    if (!Number.isInteger(parsedRateYear) || !supportedRateYears.has(parsedRateYear)) {
      errors.duoRateYear = "Kies een DUO-rentejaar uit de centrale 5-jaarsreeks.";
    }
  }

  if (values.oneTimeExtraRepayment.trim().length > 0) {
    const parsed = parseOptionalDecimalInput(values.oneTimeExtraRepayment);
    const currentDebt = getCurrentDebtTotal(values);
    if (parsed !== undefined && parsed > currentDebt && currentDebt > 0) {
      errors.oneTimeExtraRepayment =
        "De eenmalige extra aflossing kan niet hoger zijn dan de huidige openstaande schuld.";
    }
  }

  return errors;
}

export function mapStudyStopFormToInput(
  values: StudyStopFormValues,
): { input: StudyStopInput; errors: StudyStopValidationErrors } {
  const errors = validateStudyStopForm(values);
  const calculationMonth = normalizeMonthValue(values.calculationMonth);
  const duoRateYear = values.duoRateYear.trim().length > 0 ? Number.parseInt(values.duoRateYear, 10) : undefined;

  return {
    errors,
    input: {
      calculationMonth: calculationMonth || undefined,
      studyLevel: values.studyLevel,
      currentLoanDebt: parsePositiveOrZero(values.currentLoanDebt),
      currentCollegegeldkredietDebt: parsePositiveOrZero(values.currentCollegegeldkredietDebt),
      currentBasisbeursDebt: parsePositiveOrZero(values.currentBasisbeursDebt),
      currentAanvullendeBeursDebt: parsePositiveOrZero(values.currentAanvullendeBeursDebt),
      currentReisproductDebt: parsePositiveOrZero(values.currentReisproductDebt),
      monthlyLoan: parsePositiveOrZero(values.monthlyLoan),
      monthlyCollegegeldkrediet: parsePositiveOrZero(values.monthlyCollegegeldkrediet),
      monthlyBasisbeurs: parsePositiveOrZero(values.monthlyBasisbeurs),
      monthlyAanvullendeBeurs: parsePositiveOrZero(values.monthlyAanvullendeBeurs),
      monthlyReisproduct: parsePositiveOrZero(values.monthlyReisproduct),
      monthsUntilLaterDiploma: parsePositiveOrZero(values.monthsUntilLaterDiploma),
      monthsUntilContinueDiploma: parsePositiveOrZero(values.monthsUntilContinueDiploma),
      remainingDiplomaTermMonths: parsePositiveOrZero(values.remainingDiplomaTermMonths),
      repaymentRule: values.repaymentRule,
      duoRateYear: Number.isInteger(duoRateYear ?? NaN) ? duoRateYear : undefined,
      annualStudyInterestRate: parsePositiveOrZero(values.annualStudyInterestRate),
      annualRepaymentInterestRate: parsePositiveOrZero(values.annualRepaymentInterestRate),
      grossAnnualIncome: parsePositiveOrZero(values.grossAnnualIncome),
      partnerGrossAnnualIncome: parsePositiveOrZero(values.partnerGrossAnnualIncome),
      hasPartner: values.hasPartner,
      oneTimeExtraRepayment: parsePositiveOrZero(values.oneTimeExtraRepayment),
      monthlyExtraRepayment: parsePositiveOrZero(values.monthlyExtraRepayment),
      aflosvrijeMonths: parsePositiveOrZero(values.aflosvrijeMonths),
    },
  };
}

export function buildStudyStopComparisonRows(result: StudyStopCalculationResult): StudyStopComparisonRow[] {
  return result.scenarios.map((scenario) => {
    return {
      key: scenario.key,
      label: scenario.title,
      note:
        scenario.key === "stop-now-no-diploma"
          ? "Stop nu en haal geen diploma meer."
          : scenario.key === "stop-now-later-diploma"
            ? "Stop nu en laat de prestatiebeurs mogelijk later omzetten."
            : "Doorstuderen tot diploma en daarna pas aflossen.",
      debtAtStop: scenario.debtAtStop.total,
      debtAtRepaymentStart: scenario.debtAtRepaymentStart.total,
      debtAtDiploma: scenario.debtAtDiploma?.total,
      usedMonthlyPayment: scenario.repayment.usedMonthlyPayment,
      totalPaid: scenario.repayment.totalPaid,
      totalInterest: scenario.repayment.totalInterest,
      monthsToDebtFree: scenario.repayment.monthsToDebtFree,
      payoffDate: scenario.repayment.payoffDate,
      finalDebt: scenario.repayment.finalDebt,
      restschuld: scenario.repayment.restschuld,
    };
  });
}

export function createStudyStopView(values: StudyStopFormValues): StudyStopView {
  const { input, errors } = mapStudyStopFormToInput(values);
  const year = Number.parseInt(values.calculationMonth.slice(0, 4), 10) || getDefaultFinancialYear();

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
      year,
    };
  }

  const result = calculateStudyStopScenarios(input);

  return {
    isValid: true,
    errors,
    year,
    input,
    result,
    comparisonRows: buildStudyStopComparisonRows(result),
  };
}

export {
  createEmptyStudyStopValues,
  createStudyStopDefaultValues,
};
