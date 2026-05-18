export const COMPENSATION_CONFIG = {
  lastChecked: "2026-05-18",
  baseRateDiploma2025OrEarlier: 34.17,
  baseRateDiploma2026: 35.31,
  additionalMonthlyRate: 44.5,
  additionalCompensationLabel: "Aangekondigd/verwacht vanaf april 2027",
  studyVoucherAmount: 2167.34,
} as const;

export type DiplomaStatus = "yes" | "no" | "uncertain";
export type DiplomaYearBucket =
  | "2025-or-earlier"
  | "2026"
  | "2027-or-later-or-unknown";

export type CompensationInput = {
  monthsUnderLoanSystem: number;
  diplomaStatus: DiplomaStatus;
  diplomaYearBucket: DiplomaYearBucket;
  remainingStudentDebt?: number;
  includeStudyVoucherScenario: boolean;
  includeAdditionalCompensation: boolean;
};

export type DebtSettlementSummary = {
  currentStudentDebt: number;
  debtReduction: number;
  possiblePayout: number;
  remainingDebtAfterSettlement: number;
};

export type CompensationResult = {
  monthsUnderLoanSystem: number;
  diplomaStatus: DiplomaStatus;
  diplomaYearBucket: DiplomaYearBucket;
  baseMonthlyRate: number;
  baseCompensation: number;
  baseRateLabel: string;
  usesProvisionalBaseRate: boolean;
  eligibilityDependsOnDuo: boolean;
  additionalCompensation: number;
  includeAdditionalCompensation: boolean;
  studyVoucherScenario: number;
  includeStudyVoucherScenario: boolean;
  totalIndicative: number;
  debtSettlement?: DebtSettlementSummary;
};

function sanitizeFiniteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function clampNonNegative(value: number) {
  return Math.max(sanitizeFiniteNumber(value, 0), 0);
}

function clampMonths(value: number) {
  return Math.min(clampNonNegative(value), 84);
}

function sanitizeOptionalNonNegative(value?: number) {
  if (value === undefined) {
    return undefined;
  }

  return clampNonNegative(value);
}

function roundToCents(value: number) {
  return Math.round(clampNonNegative(value) * 100) / 100;
}

function resolveBaseRate(
  diplomaStatus: DiplomaStatus,
  diplomaYearBucket: DiplomaYearBucket,
) {
  if (diplomaStatus === "yes") {
    if (diplomaYearBucket === "2025-or-earlier") {
      return {
        rate: COMPENSATION_CONFIG.baseRateDiploma2025OrEarlier,
        label: "Diploma in 2025 of eerder",
        usesProvisionalRate: false,
      };
    }

    if (diplomaYearBucket === "2026") {
      return {
        rate: COMPENSATION_CONFIG.baseRateDiploma2026,
        label: "Diploma in 2026",
        usesProvisionalRate: false,
      };
    }
  }

  return {
    rate: COMPENSATION_CONFIG.baseRateDiploma2026,
    label: "Voorlopig scenario",
    usesProvisionalRate: true,
  };
}

export function calculateCompensation(
  input: CompensationInput,
): CompensationResult {
  const monthsUnderLoanSystem = clampMonths(input.monthsUnderLoanSystem);
  const remainingStudentDebt = sanitizeOptionalNonNegative(input.remainingStudentDebt);
  const includeStudyVoucherScenario = Boolean(input.includeStudyVoucherScenario);
  const includeAdditionalCompensation = Boolean(input.includeAdditionalCompensation);

  const baseRate = resolveBaseRate(input.diplomaStatus, input.diplomaYearBucket);
  const baseCompensation = roundToCents(monthsUnderLoanSystem * baseRate.rate);
  const additionalCompensation = includeAdditionalCompensation
    ? roundToCents(
        monthsUnderLoanSystem * COMPENSATION_CONFIG.additionalMonthlyRate,
      )
    : 0;
  const studyVoucherScenario = includeStudyVoucherScenario
    ? roundToCents(COMPENSATION_CONFIG.studyVoucherAmount)
    : 0;
  const totalIndicative = roundToCents(
    baseCompensation + additionalCompensation + studyVoucherScenario,
  );

  const debtSettlement =
    remainingStudentDebt !== undefined
      ? {
          currentStudentDebt: remainingStudentDebt,
          debtReduction: roundToCents(
            Math.min(totalIndicative, remainingStudentDebt),
          ),
          possiblePayout: roundToCents(
            Math.max(0, totalIndicative - remainingStudentDebt),
          ),
          remainingDebtAfterSettlement: roundToCents(
            Math.max(0, remainingStudentDebt - totalIndicative),
          ),
        }
      : undefined;

  return {
    monthsUnderLoanSystem,
    diplomaStatus: input.diplomaStatus,
    diplomaYearBucket: input.diplomaYearBucket,
    baseMonthlyRate: baseRate.rate,
    baseCompensation,
    baseRateLabel: baseRate.label,
    usesProvisionalBaseRate: baseRate.usesProvisionalRate,
    eligibilityDependsOnDuo: input.diplomaStatus !== "yes",
    additionalCompensation,
    includeAdditionalCompensation,
    studyVoucherScenario,
    includeStudyVoucherScenario,
    totalIndicative,
    debtSettlement,
  };
}
