import type { AppManifest } from "@/lib/app-types";
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

export type ProfileRecommendation = {
  slug: string;
  reason: string;
};

const defaultRecommendation = "duo-maandbedrag";
const generalReasonsBySlug: Record<string, string> = {
  "duo-maandbedrag":
    "Handig als je eerst wilt begrijpen welk DUO-maandbedrag bij je schuld hoort.",
  "duo-extra-aflossen":
    "Handig als je wilt zien wat extra aflossen bij DUO verandert in maandlast en looptijd.",
  "duo-doorlenen-of-stoppen":
    "Handig als je wilt zien wat stoppen met studeren, doorstuderen of later een diploma halen met je DUO-schuld doet.",
  "hypotheek-impact-studieschuld":
    "Handig als je wilt weten welk DUO-bedrag kan meetellen bij je hypotheekruimte.",
  "artifact-hypotheek-wonen-maximale-hypotheek":
    "Handig als je daarna je maximale hypotheek indicatief wilt inschatten.",
  "familiehulp-eerste-woning":
    "Handig als je eigen geld, DUO en hulp van familie samen wilt bekijken.",
  "schulden-volgorde":
    "Handig als je meerdere schulden feitelijk naast elkaar wilt zetten.",
};

type RecommendationAppMetadata = Pick<AppManifest, "slug" | "reasonHint">;

function hasPositiveNumber(value: number | undefined) {
  return Number.isFinite(value) && (value ?? 0) > 0;
}

function dedupeSlugs(slugs: string[]) {
  return Array.from(new Set(slugs));
}

function dedupeRecommendations(recommendations: ProfileRecommendation[]) {
  const seen = new Set<string>();
  const deduped: ProfileRecommendation[] = [];

  for (const recommendation of recommendations) {
    if (seen.has(recommendation.slug)) {
      continue;
    }
    seen.add(recommendation.slug);
    deduped.push(recommendation);
  }

  return deduped;
}

function toReasonHintMap(apps: RecommendationAppMetadata[] | undefined) {
  const reasonHints = new Map<string, string>();
  if (!apps) {
    return reasonHints;
  }

  for (const app of apps) {
    const hint = app.reasonHint?.trim();
    if (hint) {
      reasonHints.set(app.slug, hint);
    }
  }

  return reasonHints;
}

function resolveRecommendationReason(
  slug: string,
  specificReason: string | undefined,
  reasonHintsBySlug: Map<string, string>,
) {
  if (specificReason) {
    return specificReason;
  }

  const hint = reasonHintsBySlug.get(slug);
  if (hint) {
    return hint;
  }

  return generalReasonsBySlug[slug] ?? generalReasonsBySlug[defaultRecommendation];
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

export function getRecommendedAppsForProfile(
  profile: UserProfile | null | undefined,
  options?: {
    availableSlugs?: string[];
    apps?: RecommendationAppMetadata[];
    max?: number;
  },
) {
  const safeProfile = profile ?? {};
  const max = options?.max ?? 4;
  const availableSlugs = options?.availableSlugs ?? [];
  const reasonHintsBySlug = toReasonHintMap(options?.apps);
  const recommendations: Array<{ slug: string; specificReason?: string }> = [];

  if (hasPositiveNumber(safeProfile.studentDebt?.remainingDebt)) {
    recommendations.push({
      slug: "duo-doorlenen-of-stoppen",
      specificReason:
        "Omdat je studieschuld hebt ingevuld en wilt zien wat stoppen, doorstuderen of later een diploma halen betekent.",
    });
    recommendations.push({
      slug: "duo-maandbedrag",
      specificReason:
        "Omdat je studieschuld hebt ingevuld en eerst je wettelijke DUO-maandbedrag wilt begrijpen.",
    });
    recommendations.push({
      slug: "duo-extra-aflossen",
      specificReason:
        "Omdat je studieschuld hebt ingevuld en extra aflossen je maandbedrag of looptijd kan veranderen.",
    });
    recommendations.push({
      slug: "hypotheek-impact-studieschuld",
      specificReason:
        "Omdat je studieschuld of woningdoel hebt ingevuld en DUO invloed kan hebben op je hypotheekruimte.",
    });
  }

  if (
    hasPositiveNumber(safeProfile.housing?.targetHomePrice) ||
    hasPositiveNumber(safeProfile.housing?.mortgageRate)
  ) {
    recommendations.push({
      slug: "hypotheek-impact-studieschuld",
      specificReason:
        "Omdat je studieschuld of woningdoel hebt ingevuld en DUO invloed kan hebben op je hypotheekruimte.",
    });
    recommendations.push({
      slug: "artifact-hypotheek-wonen-maximale-hypotheek",
      specificReason:
        "Omdat je woninggegevens hebt ingevuld en je maximale hypotheek indicatief wilt inschatten.",
    });
  }

  if (
    hasPositiveNumber(safeProfile.savingInvesting?.currentSavings) ||
    hasPositiveNumber(safeProfile.savingInvesting?.expectedAnnualReturn)
  ) {
    recommendations.push({
      slug: "duo-maandbedrag",
      specificReason:
        "Omdat je buffer of maandruimte hebt ingevuld en je DUO-maandbedrag daar eerst naast wilt zetten.",
    });
  }

  if (safeProfile.income?.employmentType === "selfEmployed") {
    recommendations.push({
      slug: "duo-maandbedrag",
      specificReason:
        "Omdat wisselend inkomen invloed kan hebben op je DUO-draagkrachtindicatie.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({ slug: defaultRecommendation });
  }

  const uniqueRecommendations = dedupeRecommendations(
    recommendations.map((recommendation) => ({
      slug: recommendation.slug,
      reason: resolveRecommendationReason(
        recommendation.slug,
        recommendation.specificReason,
        reasonHintsBySlug,
      ),
    })),
  );
  const filteredRecommendations =
    availableSlugs.length > 0
      ? uniqueRecommendations.filter((item) => availableSlugs.includes(item.slug))
      : uniqueRecommendations;

  if (
    filteredRecommendations.length === 0 &&
    availableSlugs.includes(defaultRecommendation)
  ) {
    return [
      {
        slug: defaultRecommendation,
        reason: resolveRecommendationReason(
          defaultRecommendation,
          undefined,
          reasonHintsBySlug,
        ),
      },
    ];
  }

  return filteredRecommendations.slice(0, Math.max(1, max));
}

export function getRecommendedAppSlugsForProfile(
  profile: UserProfile,
  options?: {
    availableSlugs?: string[];
    max?: number;
  },
) {
  return getRecommendedAppsForProfile(profile, options).map((item) => item.slug);
}
