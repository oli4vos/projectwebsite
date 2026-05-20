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

const defaultRecommendation = "volgende-euro";
const generalReasonsBySlug: Record<string, string> = {
  "studieschuld-vs-beleggen":
    "Handig als je wilt vergelijken wat extra aflossen op je studieschuld doet ten opzichte van beleggen.",
  "hypotheek-impact-studieschuld":
    "Handig als je wilt weten welk DUO-bedrag kan meetellen bij je hypotheekruimte.",
  "box-3-impact":
    "Handig als je wilt zien wat spaargeld, beleggingen en schulden indicatief doen in box 3.",
  "fire-na-belasting":
    "Handig als je wilt zien hoe rendement, inleg, uitgaven en box 3 je financiële vrijheid beïnvloeden.",
  "jaarruimte-vs-vrij-beleggen":
    "Handig als je twijfelt tussen pensioeninleg met belastingvoordeel en flexibel vrij beleggen.",
  "hypotheek-aflossen-vs-beleggen":
    "Handig als je extra geld wilt vergelijken tussen hypotheek aflossen en vrij beleggen.",
  "zzp-uurtarief":
    "Handig als je wilt weten welk uurtarief past bij inkomen, belasting, pensioen, AOV en buffer.",
  "annuitair-lineair":
    "Handig als je annuïtaire en lineaire hypotheeklasten naast elkaar wilt zetten.",
  "volgende-euro":
    "Omdat dit een brede starttool is als je nog niet weet waar je geld het beste naartoe kan.",
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
  const max = options?.max ?? 3;
  const availableSlugs = options?.availableSlugs ?? [];
  const reasonHintsBySlug = toReasonHintMap(options?.apps);
  const recommendations: Array<{ slug: string; specificReason?: string }> = [];

  if (hasPositiveNumber(safeProfile.studentDebt?.remainingDebt)) {
    recommendations.push({
      slug: "studieschuld-vs-beleggen",
      specificReason:
        "Omdat je studieschuld hebt ingevuld en extra aflossen niet altijd de enige logische keuze is.",
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
      slug: "hypotheek-aflossen-vs-beleggen",
      specificReason:
        "Omdat je hypotheekgegevens hebt ingevuld en extra aflossen niet altijd beter is dan beleggen.",
    });
  }

  if (
    hasPositiveNumber(safeProfile.savingInvesting?.currentSavings) ||
    hasPositiveNumber(safeProfile.savingInvesting?.expectedAnnualReturn)
  ) {
    recommendations.push({
      slug: "box-3-impact",
      specificReason:
        "Omdat je spaargeld of beleggingen hebt ingevuld en box 3 je netto rendement kan beïnvloeden.",
    });
    recommendations.push({
      slug: "fire-na-belasting",
      specificReason:
        "Omdat je beleggingsgegevens hebt ingevuld en box 3 je FIRE-pad kan vertragen.",
    });
    recommendations.push({
      slug: "jaarruimte-vs-vrij-beleggen",
      specificReason:
        "Omdat pensioeninleg fiscaal gunstig kan zijn, maar minder flexibel is dan vrij beleggen.",
    });
  }

  if (safeProfile.income?.employmentType === "selfEmployed") {
    recommendations.push({
      slug: "zzp-uurtarief",
      specificReason:
        "Omdat je ZZP of zelfstandig werken hebt ingevuld en omzet geen salaris is.",
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
