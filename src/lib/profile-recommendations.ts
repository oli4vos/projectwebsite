import type { UserProfile } from "@/lib/user-profile";

type ProfileSection =
  | "income"
  | "studentDebt"
  | "housing"
  | "savingInvesting"
  | "tax"
  | "employment";

export type ProfileCompleteness = {
  hasProfile: boolean;
  usefulSections: ProfileSection[];
  missingSections: ProfileSection[];
  score: number;
};

const defaultRecommendation = "volgende-euro";

function hasPositiveNumber(value: number | undefined) {
  return Number.isFinite(value) && (value ?? 0) > 0;
}

function dedupeSlugs(slugs: string[]) {
  return Array.from(new Set(slugs));
}

export function getProfileCompleteness(profile: UserProfile): ProfileCompleteness {
  const usefulSections: ProfileSection[] = [];

  if (
    hasPositiveNumber(profile.income?.grossAnnualIncome) ||
    hasPositiveNumber(profile.income?.partnerGrossAnnualIncome)
  ) {
    usefulSections.push("income");
  }

  if (
    hasPositiveNumber(profile.studentDebt?.remainingDebt) ||
    hasPositiveNumber(profile.studentDebt?.currentMonthlyPayment) ||
    hasPositiveNumber(profile.studentDebt?.statutoryMonthlyPayment)
  ) {
    usefulSections.push("studentDebt");
  }

  if (
    hasPositiveNumber(profile.housing?.targetHomePrice) ||
    hasPositiveNumber(profile.housing?.mortgageRate) ||
    hasPositiveNumber(profile.housing?.ownFunds)
  ) {
    usefulSections.push("housing");
  }

  if (
    hasPositiveNumber(profile.savingInvesting?.currentSavings) ||
    hasPositiveNumber(profile.savingInvesting?.expectedAnnualReturn) ||
    hasPositiveNumber(profile.savingInvesting?.monthlyFreeCashflow)
  ) {
    usefulSections.push("savingInvesting");
  }

  if (
    hasPositiveNumber(profile.tax?.preferredTaxYear) ||
    profile.tax?.hasFiscalPartner === true
  ) {
    usefulSections.push("tax");
  }

  if (profile.income?.employmentType === "selfEmployed") {
    usefulSections.push("employment");
  }

  const uniqueUsefulSections = dedupeSlugs(usefulSections) as ProfileSection[];
  const allSections: ProfileSection[] = [
    "income",
    "studentDebt",
    "housing",
    "savingInvesting",
    "tax",
    "employment",
  ];
  const missingSections = allSections.filter(
    (section) => !uniqueUsefulSections.includes(section),
  );

  return {
    hasProfile: uniqueUsefulSections.length > 0,
    usefulSections: uniqueUsefulSections,
    missingSections,
    score: Math.round((uniqueUsefulSections.length / allSections.length) * 100),
  };
}

export function getRecommendedAppSlugsForProfile(
  profile: UserProfile,
  options?: {
    availableSlugs?: string[];
    max?: number;
  },
) {
  const max = options?.max ?? 3;
  const availableSlugs = options?.availableSlugs ?? [];
  const slugs: string[] = [];

  if (hasPositiveNumber(profile.studentDebt?.remainingDebt)) {
    slugs.push("studieschuld-vs-beleggen", "hypotheek-impact-studieschuld");
  }

  if (
    hasPositiveNumber(profile.housing?.targetHomePrice) ||
    hasPositiveNumber(profile.housing?.mortgageRate)
  ) {
    slugs.push("hypotheek-impact-studieschuld", "hypotheek-aflossen-vs-beleggen");
  }

  if (
    hasPositiveNumber(profile.savingInvesting?.currentSavings) ||
    hasPositiveNumber(profile.savingInvesting?.expectedAnnualReturn)
  ) {
    slugs.push("box-3-impact", "fire-na-belasting", "jaarruimte-vs-vrij-beleggen");
  }

  if (profile.income?.employmentType === "selfEmployed") {
    slugs.push("zzp-uurtarief");
  }

  if (slugs.length === 0) {
    slugs.push(defaultRecommendation);
  }

  const uniqueSlugs = dedupeSlugs(slugs);
  const filteredSlugs =
    availableSlugs.length > 0
      ? uniqueSlugs.filter((slug) => availableSlugs.includes(slug))
      : uniqueSlugs;

  if (filteredSlugs.length === 0 && availableSlugs.includes(defaultRecommendation)) {
    return [defaultRecommendation];
  }

  return filteredSlugs.slice(0, Math.max(1, max));
}
