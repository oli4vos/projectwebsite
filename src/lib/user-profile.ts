export const USER_PROFILE_STORAGE_KEY = "project-site:user-profile:v1";
export const USER_PROFILE_STORAGE_EVENT = "project-site:user-profile:changed";

export type HouseholdType = "single" | "withPartner" | "family" | "unknown";
export type ProfileRepaymentRule =
  | "SF35"
  | "SF15"
  | "SF15_OLD"
  | "SF15_LLLK"
  | "UNKNOWN";
export type ProfileDuoSituation =
  | "repaying"
  | "gracePeriod"
  | "incomeBasedReduction"
  | "paymentPause"
  | "unknown";
export type RiskProfile = "conservative" | "neutral" | "offensive";

export type UserProfile = {
  updatedAt?: string;
  income?: {
    grossAnnualIncome?: number;
    partnerGrossAnnualIncome?: number;
    householdType?: HouseholdType;
  };
  studentDebt?: {
    remainingDebt?: number;
    currentMonthlyPayment?: number;
    statutoryMonthlyPayment?: number;
    repaymentRule?: ProfileRepaymentRule;
    duoSituation?: ProfileDuoSituation;
    duoInterestRate?: number;
    remainingTermYears?: number;
  };
  housing?: {
    targetHomePrice?: number;
    ownFunds?: number;
    mortgageRate?: number;
    mortgageTermYears?: number;
    maxMortgageWithoutStudentDebt?: number;
  };
  savingInvesting?: {
    currentSavings?: number;
    targetEmergencyFund?: number;
    monthlyFreeCashflow?: number;
    expectedAnnualReturn?: number;
    investmentHorizonYears?: number;
    riskProfile?: RiskProfile;
  };
};

export const defaultUserProfile: UserProfile = {};

const householdTypes = new Set<HouseholdType>([
  "single",
  "withPartner",
  "family",
  "unknown",
]);

const repaymentRules = new Set<ProfileRepaymentRule>([
  "SF35",
  "SF15",
  "SF15_OLD",
  "SF15_LLLK",
  "UNKNOWN",
]);

const duoSituations = new Set<ProfileDuoSituation>([
  "repaying",
  "gracePeriod",
  "incomeBasedReduction",
  "paymentPause",
  "unknown",
]);

const riskProfiles = new Set<RiskProfile>([
  "conservative",
  "neutral",
  "offensive",
]);

function sanitizeFiniteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function sanitizeNonNegativeNumber(value?: number) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return Math.max(sanitizeFiniteNumber(value, 0), 0);
}

function sanitizePercentNumber(value?: number) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return Math.min(Math.max(sanitizeFiniteNumber(value, 0), 0), 100);
}

function sanitizePositiveYears(value?: number) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitizedValue = sanitizeFiniteNumber(value, 0);

  if (sanitizedValue <= 0) {
    return undefined;
  }

  return sanitizedValue;
}

function sanitizeEnum<T extends string>(value: unknown, allowed: Set<T>) {
  if (typeof value !== "string") {
    return undefined;
  }

  return allowed.has(value as T) ? (value as T) : undefined;
}

function hasSectionValues(section?: Record<string, unknown>) {
  if (!section) {
    return false;
  }

  return Object.values(section).some((value) => value !== undefined);
}

export function sanitizeUserProfile(profile: UserProfile): UserProfile {
  const income = {
    grossAnnualIncome: sanitizeNonNegativeNumber(profile.income?.grossAnnualIncome),
    partnerGrossAnnualIncome: sanitizeNonNegativeNumber(
      profile.income?.partnerGrossAnnualIncome,
    ),
    householdType: sanitizeEnum(profile.income?.householdType, householdTypes),
  };

  const studentDebt = {
    remainingDebt: sanitizeNonNegativeNumber(profile.studentDebt?.remainingDebt),
    currentMonthlyPayment: sanitizeNonNegativeNumber(
      profile.studentDebt?.currentMonthlyPayment,
    ),
    statutoryMonthlyPayment: sanitizeNonNegativeNumber(
      profile.studentDebt?.statutoryMonthlyPayment,
    ),
    repaymentRule: sanitizeEnum(profile.studentDebt?.repaymentRule, repaymentRules),
    duoSituation: sanitizeEnum(profile.studentDebt?.duoSituation, duoSituations),
    duoInterestRate: sanitizePercentNumber(profile.studentDebt?.duoInterestRate),
    remainingTermYears: sanitizePositiveYears(profile.studentDebt?.remainingTermYears),
  };

  const housing = {
    targetHomePrice: sanitizeNonNegativeNumber(profile.housing?.targetHomePrice),
    ownFunds: sanitizeNonNegativeNumber(profile.housing?.ownFunds),
    mortgageRate: sanitizePercentNumber(profile.housing?.mortgageRate),
    mortgageTermYears: sanitizePositiveYears(profile.housing?.mortgageTermYears),
    maxMortgageWithoutStudentDebt: sanitizeNonNegativeNumber(
      profile.housing?.maxMortgageWithoutStudentDebt,
    ),
  };

  const savingInvesting = {
    currentSavings: sanitizeNonNegativeNumber(profile.savingInvesting?.currentSavings),
    targetEmergencyFund: sanitizeNonNegativeNumber(
      profile.savingInvesting?.targetEmergencyFund,
    ),
    monthlyFreeCashflow: sanitizeNonNegativeNumber(
      profile.savingInvesting?.monthlyFreeCashflow,
    ),
    expectedAnnualReturn: sanitizePercentNumber(
      profile.savingInvesting?.expectedAnnualReturn,
    ),
    investmentHorizonYears: sanitizePositiveYears(
      profile.savingInvesting?.investmentHorizonYears,
    ),
    riskProfile: sanitizeEnum(profile.savingInvesting?.riskProfile, riskProfiles),
  };

  return {
    updatedAt:
      typeof profile.updatedAt === "string" && profile.updatedAt.trim().length > 0
        ? profile.updatedAt
        : undefined,
    income: hasSectionValues(income) ? income : undefined,
    studentDebt: hasSectionValues(studentDebt) ? studentDebt : undefined,
    housing: hasSectionValues(housing) ? housing : undefined,
    savingInvesting: hasSectionValues(savingInvesting)
      ? savingInvesting
      : undefined,
  };
}

export function profileHasValues(profile: UserProfile) {
  return Boolean(
    hasSectionValues(profile.income) ||
      hasSectionValues(profile.studentDebt) ||
      hasSectionValues(profile.housing) ||
      hasSectionValues(profile.savingInvesting),
  );
}

export function mergeProfilePatch(
  profile: UserProfile,
  patch: Partial<UserProfile>,
): UserProfile {
  return sanitizeUserProfile({
    ...profile,
    ...patch,
    income: {
      ...profile.income,
      ...patch.income,
    },
    studentDebt: {
      ...profile.studentDebt,
      ...patch.studentDebt,
    },
    housing: {
      ...profile.housing,
      ...patch.housing,
    },
    savingInvesting: {
      ...profile.savingInvesting,
      ...patch.savingInvesting,
    },
  });
}

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return defaultUserProfile;
  }

  try {
    const rawValue = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);

    if (!rawValue) {
      return defaultUserProfile;
    }

    const parsedValue = JSON.parse(rawValue) as UserProfile;
    return sanitizeUserProfile(parsedValue);
  } catch {
    return defaultUserProfile;
  }
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  const sanitizedProfile = sanitizeUserProfile({
    ...profile,
    updatedAt: new Date().toISOString(),
  });

  if (typeof window === "undefined") {
    return sanitizedProfile;
  }

  if (!profileHasValues(sanitizedProfile)) {
    window.localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    window.dispatchEvent(new Event(USER_PROFILE_STORAGE_EVENT));
    return defaultUserProfile;
  }

  window.localStorage.setItem(
    USER_PROFILE_STORAGE_KEY,
    JSON.stringify(sanitizedProfile),
  );
  window.dispatchEvent(new Event(USER_PROFILE_STORAGE_EVENT));

  return sanitizedProfile;
}

export function clearUserProfile() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  window.dispatchEvent(new Event(USER_PROFILE_STORAGE_EVENT));
}
