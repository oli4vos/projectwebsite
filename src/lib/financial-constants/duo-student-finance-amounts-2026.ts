export type DuoEducationTrack = "mbo" | "hbo-university";
export type DuoResidence = "living-at-home" | "living-away";

export type DuoStudentFinancePeriod = {
  readonly id: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string;
  readonly educationTrack: DuoEducationTrack;
  readonly amountsByResidence: Readonly<Record<DuoResidence, {
    readonly basicGrantMax: number;
    readonly additionalGrantMax: number;
    readonly regularLoanMax: number;
    readonly totalExcludingTuitionCreditMax: number;
  }>>;
  readonly additionalGrantMaxWithoutTuitionDue?: Readonly<Record<DuoResidence, number>>;
  readonly annualStatutoryTuitionFee?: number;
  readonly annualInstitutionalTuitionCreditCap?: number;
  readonly tuitionCreditMax?: number;
  readonly institutionalTuitionCreditMax?: number;
};

export type DuoStudentFinanceAmounts = {
  readonly year: 2026;
  readonly sourceUrl: string;
  readonly tuitionFeeSourceUrl: string;
  readonly travelProductSourceUrl: string;
  readonly loanPhaseRegularLoanMax: number;
  readonly travelProductMonthlyDebtValue: number;
  readonly periods: readonly DuoStudentFinancePeriod[];
};

export function calculateMonthlyTuitionCreditMaximum(annualTuitionFee: number) {
  if (!Number.isFinite(annualTuitionFee) || annualTuitionFee < 0) {
    throw new Error("Jaarlijks collegegeld moet nul of een positief bedrag zijn.");
  }

  return Math.round((annualTuitionFee / 12) * 100) / 100;
}

const STATUTORY_TUITION_FEE_2025_2026 = 2_601;
const STATUTORY_TUITION_FEE_2026_2027 = 2_694;
const INSTITUTIONAL_TUITION_CREDIT_CAP_2025_2026 = 13_005;
const INSTITUTIONAL_TUITION_CREDIT_CAP_2026_2027 = 13_470;

export const DUO_STUDENT_FINANCE_AMOUNTS_2026: DuoStudentFinanceAmounts = {
  year: 2026,
  sourceUrl: "https://www.duo.nl/particulier/studiefinanciering/bedragen.jsp",
  tuitionFeeSourceUrl: "https://www.duo.nl/particulier/collegegeld.jsp",
  travelProductSourceUrl: "https://www.duo.nl/particulier/studiefinanciering/ov.jsp",
  loanPhaseRegularLoanMax: 1_213.95,
  travelProductMonthlyDebtValue: 110.95,
  periods: [
    {
      id: "mbo-2026-jan-jul",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-07-31",
      educationTrack: "mbo",
      amountsByResidence: {
        "living-at-home": {
          basicGrantMax: 107.26,
          additionalGrantMax: 438.08,
          regularLoanMax: 233.65,
          totalExcludingTuitionCreditMax: 778.99,
        },
        "living-away": {
          basicGrantMax: 350.03,
          additionalGrantMax: 466.4,
          regularLoanMax: 233.65,
          totalExcludingTuitionCreditMax: 1_050.08,
        },
      },
      additionalGrantMaxWithoutTuitionDue: {
        "living-at-home": 316.58,
        "living-away": 344.9,
      },
    },
    {
      id: "mbo-2026-aug-dec",
      effectiveFrom: "2026-08-01",
      effectiveTo: "2026-12-31",
      educationTrack: "mbo",
      amountsByResidence: {
        "living-at-home": {
          basicGrantMax: 107.26,
          additionalGrantMax: 442.5,
          regularLoanMax: 233.65,
          totalExcludingTuitionCreditMax: 783.41,
        },
        "living-away": {
          basicGrantMax: 350.03,
          additionalGrantMax: 470.82,
          regularLoanMax: 233.65,
          totalExcludingTuitionCreditMax: 1_054.5,
        },
      },
      additionalGrantMaxWithoutTuitionDue: {
        "living-at-home": 316.58,
        "living-away": 344.9,
      },
    },
    {
      id: "higher-education-2026-jan-aug",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-08-31",
      educationTrack: "hbo-university",
      amountsByResidence: {
        "living-at-home": {
          basicGrantMax: 130.21,
          additionalGrantMax: 491.08,
          regularLoanMax: 315.17,
          totalExcludingTuitionCreditMax: 936.46,
        },
        "living-away": {
          basicGrantMax: 324.52,
          additionalGrantMax: 491.08,
          regularLoanMax: 315.17,
          totalExcludingTuitionCreditMax: 1_130.77,
        },
      },
      annualStatutoryTuitionFee: STATUTORY_TUITION_FEE_2025_2026,
      annualInstitutionalTuitionCreditCap: INSTITUTIONAL_TUITION_CREDIT_CAP_2025_2026,
      tuitionCreditMax: calculateMonthlyTuitionCreditMaximum(
        STATUTORY_TUITION_FEE_2025_2026,
      ),
      institutionalTuitionCreditMax: calculateMonthlyTuitionCreditMaximum(
        INSTITUTIONAL_TUITION_CREDIT_CAP_2025_2026,
      ),
    },
    {
      id: "higher-education-2026-sep-dec",
      effectiveFrom: "2026-09-01",
      effectiveTo: "2026-12-31",
      educationTrack: "hbo-university",
      amountsByResidence: {
        "living-at-home": {
          basicGrantMax: 130.21,
          additionalGrantMax: 491.08,
          regularLoanMax: 315.17,
          totalExcludingTuitionCreditMax: 936.46,
        },
        "living-away": {
          basicGrantMax: 324.52,
          additionalGrantMax: 491.08,
          regularLoanMax: 315.17,
          totalExcludingTuitionCreditMax: 1_130.77,
        },
      },
      annualStatutoryTuitionFee: STATUTORY_TUITION_FEE_2026_2027,
      annualInstitutionalTuitionCreditCap: INSTITUTIONAL_TUITION_CREDIT_CAP_2026_2027,
      tuitionCreditMax: calculateMonthlyTuitionCreditMaximum(
        STATUTORY_TUITION_FEE_2026_2027,
      ),
      institutionalTuitionCreditMax: calculateMonthlyTuitionCreditMaximum(
        INSTITUTIONAL_TUITION_CREDIT_CAP_2026_2027,
      ),
    },
  ],
};

export function getDuoStudentFinancePeriod2026(
  educationTrack: DuoEducationTrack,
  asOf: string,
) {
  const period = DUO_STUDENT_FINANCE_AMOUNTS_2026.periods.find((candidate) =>
    candidate.educationTrack === educationTrack &&
    asOf >= candidate.effectiveFrom &&
    asOf <= candidate.effectiveTo
  );
  if (!period) throw new Error(`Geen DUO-bedragen voor ${educationTrack} op ${asOf}.`);
  return period;
}
