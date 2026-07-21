import type { DebtKind } from "@/lib/planning/debt-priority";

export const DEBT_PRIORITY_RULES_2026 = {
  kindBaseScore: {
    bnpl: 80,
    creditCard: 85,
    personalLoan: 65,
    duo: 20,
    mortgage: 25,
    other: 45,
  } satisfies Record<DebtKind, number>,
  interestRateScoreMultiplier: 10,
  duoLowRateThresholdPercent: 2.5,
  duoLowRateCorrection: -25,
  highInterestThresholdPercent: 7,
  owner: "Project Site",
  assumptionType: "indicative-rule",
  warning: "Geen wettelijke norm; alleen een indicatieve routehulp voor extra aflossen.",
} as const;
