import {
  getAvailableDuoRateYears,
  getDuoStudentFinanceAmounts,
  getDuoStudentFinanceAmountsForDate,
} from "@/lib/financial-constants";
import {
  calculateStudyStopScenarios,
  type StudyStopCalculationResult,
  type StudyStopFocusScenarioKey,
  type StudyStopInput,
} from "@/lib/duo/studeren-stoppen";
import type { RepaymentRule } from "@/lib/duo/types";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type SimpleDuoToolMode = "start-borrowing" | "stop-cost" | "monthly-impact";
export type SimpleDuoOutcomeKey =
  | "standard"
  | "max-borrowing-no-diploma";

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

export type SimpleDuoMonthlyLimits = Readonly<{
  monthlyLoan: number;
  monthlyCollegegeldkrediet: number;
  regularTuitionCredit: number;
  annualStatutoryTuitionFee: number;
  monthlyBasisbeurs: number;
  monthlyBasisbeursLivingAtHome: number;
  monthlyBasisbeursLivingAway: number;
  monthlyAanvullendeBeurs: number;
  monthlyReisproduct: number;
  totalExcludingTuitionCredit: number;
  periodId: string;
}>;

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

function formatMaximum(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function monthRange(from: string, to: string) {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  const months: string[] = [];
  let year = fromYear;
  let month = fromMonth;

  while (year < toYear || (year === toYear && month <= toMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month === 13) {
      year += 1;
      month = 1;
    }
  }

  return months;
}

export function getSimpleDuoSupportedCalculationMonths() {
  const amounts = getDuoStudentFinanceAmounts();
  const months = amounts.periods
    .filter((period) => period.educationTrack === "hbo-university")
    .flatMap((period) => monthRange(period.effectiveFrom.slice(0, 7), period.effectiveTo.slice(0, 7)));

  return Object.freeze([...new Set(months)].sort());
}

export function getSimpleDuoMonthlyLimits(
  calculationMonth: string,
): SimpleDuoMonthlyLimits | null {
  if (!/^(\d{4})-(\d{2})$/.test(calculationMonth)) {
    return null;
  }

  try {
    const amounts = getDuoStudentFinanceAmountsForDate({
      asOf: `${calculationMonth}-01`,
      educationTrack: "hbo-university",
    });
    const residenceAmounts = Object.values(amounts.amountsByResidence);
    const livingAtHome = amounts.amountsByResidence["living-at-home"];
    const livingAway = amounts.amountsByResidence["living-away"];

    return Object.freeze({
      monthlyLoan: amounts.loanPhaseRegularLoanMax,
      monthlyCollegegeldkrediet: amounts.tuitionCreditMax ?? 0,
      regularTuitionCredit: amounts.tuitionCreditMax ?? 0,
      annualStatutoryTuitionFee: amounts.annualStatutoryTuitionFee ?? 0,
      monthlyBasisbeurs: Math.max(
        ...residenceAmounts.map((residence) => residence.basicGrantMax),
      ),
      monthlyBasisbeursLivingAtHome: livingAtHome.basicGrantMax,
      monthlyBasisbeursLivingAway: livingAway.basicGrantMax,
      monthlyAanvullendeBeurs: Math.max(
        ...residenceAmounts.map((residence) => residence.additionalGrantMax),
      ),
      monthlyReisproduct: amounts.travelProductMonthlyDebtValue,
      totalExcludingTuitionCredit: Math.max(
        amounts.loanPhaseRegularLoanMax,
        ...residenceAmounts.map(
          (residence) => residence.totalExcludingTuitionCreditMax,
        ),
      ),
      periodId: amounts.id,
    });
  } catch {
    return null;
  }
}

export function calculateAvailableSimpleDuoMonthlyLoan(
  values: Pick<SimpleDuoValues, "monthlyBasisbeurs" | "monthlyAanvullendeBeurs">,
  limits: SimpleDuoMonthlyLimits,
) {
  const usedGrantSpace =
    (parseMoney(values.monthlyBasisbeurs) ?? 0) +
    (parseMoney(values.monthlyAanvullendeBeurs) ?? 0);
  const available = Math.min(
    limits.monthlyLoan,
    Math.max(limits.totalExcludingTuitionCredit - usedGrantSpace, 0),
  );

  return Math.round(available * 100) / 100;
}

function validateMonthlyMaximum(
  values: SimpleDuoValues,
  field:
    | "monthlyLoan"
    | "monthlyCollegegeldkrediet"
    | "monthlyBasisbeurs"
    | "monthlyAanvullendeBeurs"
    | "monthlyReisproduct",
  maximum: number,
  errors: SimpleDuoErrors,
) {
  if (errors[field]) return;

  const value = parseMoney(values[field]);
  if (value !== undefined && value > maximum) {
    errors[field] = `Gebruik maximaal ${formatMaximum(maximum)} per maand.`;
  }
}

export function defaultSimpleDuoValues(mode: SimpleDuoToolMode): SimpleDuoValues {
  const higherEducationAmounts = getDuoStudentFinanceAmountsForDate({
    asOf: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
    educationTrack: "hbo-university",
  });
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
    monthlyBasisbeurs: mode === "start-borrowing"
      ? String(higherEducationAmounts.amountsByResidence["living-at-home"].basicGrantMax)
      : "0",
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

export function maxBorrowingWithoutDiplomaValues(
  values: SimpleDuoValues,
): SimpleDuoValues {
  const defaults = defaultSimpleDuoValues("start-borrowing");
  const calculationMonth = getSimpleDuoMonthlyLimits(values.calculationMonth)
    ? values.calculationMonth
    : defaults.calculationMonth;
  const amounts = getDuoStudentFinanceAmountsForDate({
    asOf: `${calculationMonth}-01`,
    educationTrack: "hbo-university",
  });
  const livingAway = amounts.amountsByResidence["living-away"];
  const monthsUntilStop = parseMonths(values.monthsUntilDiploma);
  const supportedRateYears = new Set(getAvailableDuoRateYears());
  const rateYear = Number.parseInt(values.duoRateYear, 10);

  return {
    ...values,
    calculationMonth,
    monthsUntilDiploma:
      monthsUntilStop !== undefined && monthsUntilStop > 0
        ? String(monthsUntilStop)
        : defaults.monthsUntilDiploma,
    currentLoanDebt: "0",
    currentCollegegeldkredietDebt: "0",
    currentBasisbeursDebt: "0",
    currentAanvullendeBeursDebt: "0",
    currentReisproductDebt: "0",
    monthlyLoan: String(livingAway.regularLoanMax),
    monthlyCollegegeldkrediet: String(amounts.tuitionCreditMax ?? 0),
    monthlyBasisbeurs: String(livingAway.basicGrantMax),
    monthlyAanvullendeBeurs: String(livingAway.additionalGrantMax),
    monthlyReisproduct: String(amounts.travelProductMonthlyDebtValue),
    repaymentRule: "SF35",
    duoRateYear: supportedRateYears.has(rateYear)
      ? String(rateYear)
      : defaults.duoRateYear,
  };
}

export function validateSimpleDuoValues(mode: SimpleDuoToolMode, values: SimpleDuoValues) {
  const errors: SimpleDuoErrors = {};
  const supportedRateYears = new Set(getAvailableDuoRateYears());

  if (!/^(\d{4})-(\d{2})$/.test(values.calculationMonth)) {
    errors.calculationMonth = "Gebruik een maand in de vorm jjjj-mm.";
  }

  if (mode !== "stop-cost" && parseMonths(values.monthsUntilDiploma) === undefined) {
    errors.monthsUntilDiploma = "Vul een heel aantal maanden in.";
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

  if (mode !== "stop-cost") {
    const limits = getSimpleDuoMonthlyLimits(values.calculationMonth);
    if (!limits) {
      errors.calculationMonth =
        "Voor deze maand zijn geen centrale DUO-maximumbedragen beschikbaar.";
    } else {
      validateMonthlyMaximum(values, "monthlyLoan", limits.monthlyLoan, errors);
      validateMonthlyMaximum(
        values,
        "monthlyCollegegeldkrediet",
        limits.monthlyCollegegeldkrediet,
        errors,
      );
      validateMonthlyMaximum(
        values,
        "monthlyBasisbeurs",
        limits.monthlyBasisbeurs,
        errors,
      );
      validateMonthlyMaximum(
        values,
        "monthlyAanvullendeBeurs",
        limits.monthlyAanvullendeBeurs,
        errors,
      );
      validateMonthlyMaximum(
        values,
        "monthlyReisproduct",
        limits.monthlyReisproduct,
        errors,
      );

      const totalExcludingTuitionCredit = [
        values.monthlyLoan,
        values.monthlyBasisbeurs,
        values.monthlyAanvullendeBeurs,
      ].reduce((total, value) => total + (parseMoney(value) ?? 0), 0);
      if (
        !errors.monthlyLoan &&
        totalExcludingTuitionCredit > limits.totalExcludingTuitionCredit
      ) {
        const availableMonthlyLoan = calculateAvailableSimpleDuoMonthlyLoan(
          values,
          limits,
        );
        errors.monthlyLoan =
          `Lening, basisbeurs en aanvullende beurs zijn samen maximaal ${formatMaximum(limits.totalExcludingTuitionCredit)} per maand. Met deze beursbedragen kun je maximaal ${formatMaximum(availableMonthlyLoan)} per maand lenen.`;
      }
    }
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

export function createSimpleDuoView(
  mode: SimpleDuoToolMode,
  values: SimpleDuoValues,
  outcome: SimpleDuoOutcomeKey = "standard",
): SimpleDuoView {
  const errors = validateSimpleDuoValues(mode, values);

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  const input = {
    ...mapSimpleDuoValuesToInput(mode, values),
    includeContinueWithoutDiplomaScenario:
      mode === "start-borrowing" && outcome === "max-borrowing-no-diploma",
  };
  const result = calculateStudyStopScenarios(input);
  const focusKey = outcome === "max-borrowing-no-diploma"
    ? "max-borrowing-no-diploma"
    : modeToFocusKey[mode];
  const focusScenario =
    result.focusScenarios.find((scenario) => scenario.key === focusKey) ??
    result.focusScenarios[0];

  return {
    isValid: true,
    errors,
    input,
    result,
    focusScenario,
  };
}
