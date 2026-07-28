import type {
  ProfileDuoDebtPart,
  ProfileDuoSituation,
  ProfileRepaymentRule,
  UserProfile,
} from "@/lib/user-profile";

export type StudentDebtProfileResult = {
  remainingDebt: number;
  statutoryMonthlyPayment: number;
  mortgageAssessmentMonthlyPayment: number;
  repaymentRule: ProfileRepaymentRule;
  duoInterestRate: number;
  remainingTermYears: number;
  currentMonthlyPayment?: number;
  duoSituation?: ProfileDuoSituation;
  debtParts?: ProfileDuoDebtPart[];
};

export function createStudentDebtProfilePatch(
  result: StudentDebtProfileResult,
): Partial<UserProfile> {
  return {
    studentDebt: {
      remainingDebt: result.remainingDebt,
      statutoryMonthlyPayment: result.statutoryMonthlyPayment,
      mortgageAssessmentMonthlyPayment:
        result.mortgageAssessmentMonthlyPayment,
      repaymentRule: result.repaymentRule,
      duoInterestRate: result.duoInterestRate,
      remainingTermYears: result.remainingTermYears,
      ...(result.currentMonthlyPayment !== undefined
        ? { currentMonthlyPayment: result.currentMonthlyPayment }
        : {}),
      ...(result.duoSituation !== undefined
        ? { duoSituation: result.duoSituation }
        : {}),
      debtParts:
        result.debtParts && result.debtParts.length > 0
          ? result.debtParts.map((part) => ({ ...part }))
          : undefined,
    },
  };
}
