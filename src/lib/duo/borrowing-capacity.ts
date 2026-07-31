import { getDuoStudentFinanceAmountsForDate } from "@/lib/financial-constants";
import type { DuoEducationTrack, DuoResidence } from "@/lib/financial-constants";

export type DuoBorrowingCapacityInput = {
  readonly asOf: string;
  readonly educationTrack: DuoEducationTrack;
  readonly residence: DuoResidence;
  readonly phase?: "grant" | "loan";
  readonly actualAdditionalGrant?: number;
  readonly tuitionDue?: boolean;
};

export type DuoBorrowingCapacityResult = {
  readonly regularLoanMax: number;
  readonly additionalLoanForGrantShortfallMax: number;
  readonly totalInterestBearingLoanMax: number;
  readonly basicGrantMax: number;
  readonly additionalGrantMax: number;
  readonly tuitionCreditMax: number;
  readonly periodId: string;
};

function money(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateDuoBorrowingCapacity(
  input: DuoBorrowingCapacityInput,
): DuoBorrowingCapacityResult {
  const amounts = getDuoStudentFinanceAmountsForDate({
    asOf: input.asOf,
    educationTrack: input.educationTrack,
  });
  const residenceAmounts = amounts.amountsByResidence[input.residence];

  if (input.phase === "loan") {
    return Object.freeze({
      regularLoanMax: amounts.loanPhaseRegularLoanMax,
      additionalLoanForGrantShortfallMax: 0,
      totalInterestBearingLoanMax: amounts.loanPhaseRegularLoanMax,
      basicGrantMax: 0,
      additionalGrantMax: 0,
      tuitionCreditMax: amounts.tuitionCreditMax ?? 0,
      periodId: amounts.id,
    });
  }

  const maximumAdditionalGrant = input.tuitionDue === false
    ? amounts.additionalGrantMaxWithoutTuitionDue?.[input.residence]
      ?? residenceAmounts.additionalGrantMax
    : residenceAmounts.additionalGrantMax;
  const actualAdditionalGrant = Math.min(
    Math.max(Number.isFinite(input.actualAdditionalGrant) ? input.actualAdditionalGrant ?? 0 : 0, 0),
    maximumAdditionalGrant,
  );
  const additionalLoanForGrantShortfallMax = money(maximumAdditionalGrant - actualAdditionalGrant);
  const totalInterestBearingLoanMax = money(
    residenceAmounts.regularLoanMax + additionalLoanForGrantShortfallMax,
  );

  return Object.freeze({
    regularLoanMax: residenceAmounts.regularLoanMax,
    additionalLoanForGrantShortfallMax,
    totalInterestBearingLoanMax,
    basicGrantMax: residenceAmounts.basicGrantMax,
    additionalGrantMax: maximumAdditionalGrant,
    tuitionCreditMax: amounts.tuitionCreditMax ?? 0,
    periodId: amounts.id,
  });
}
