import { describe, expect, it } from "vitest";
import { appRegistry } from "@/lib/app-registry";
import type { UserProfile } from "@/lib/user-profile";
import {
  getProfileCompleteness,
  getRecommendedAppSlugsForProfile,
} from "@/lib/profile-recommendations";

const availableSlugs = appRegistry.map((app) => app.slug);

describe("profile recommendations", () => {
  it("returns volgende-euro fallback for empty profile", () => {
    const slugs = getRecommendedAppSlugsForProfile({}, { availableSlugs });
    expect(slugs).toEqual(["volgende-euro"]);
  });

  it("recommends student debt tools when student debt is present", () => {
    const profile: UserProfile = {
      studentDebt: {
        remainingDebt: 28000,
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toContain("studieschuld-vs-beleggen");
    expect(slugs).toContain("hypotheek-impact-studieschuld");
  });

  it("recommends housing tools when housing data is present", () => {
    const profile: UserProfile = {
      housing: {
        targetHomePrice: 450000,
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toContain("hypotheek-impact-studieschuld");
    expect(slugs).toContain("hypotheek-aflossen-vs-beleggen");
  });

  it("recommends investing and tax-adjacent tools for savings profile", () => {
    const profile: UserProfile = {
      savingInvesting: {
        currentSavings: 30000,
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toContain("box-3-impact");
    expect(slugs).toContain("fire-na-belasting");
  });

  it("recommends zzp tool for self-employed profile", () => {
    const profile: UserProfile = {
      income: {
        employmentType: "selfEmployed",
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toContain("zzp-uurtarief");
  });

  it("returns max 3 unique slugs", () => {
    const profile: UserProfile = {
      studentDebt: { remainingDebt: 25000 },
      housing: { targetHomePrice: 500000 },
      savingInvesting: { currentSavings: 50000 },
      income: { employmentType: "selfEmployed" },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs.length).toBeLessThanOrEqual(3);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("filters out unknown slugs against available list", () => {
    const profile: UserProfile = {
      studentDebt: { remainingDebt: 1000 },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, {
      availableSlugs: ["volgende-euro"],
    });
    expect(slugs).toEqual(["volgende-euro"]);
  });
});

describe("profile completeness", () => {
  it("scores empty profile as zero", () => {
    const result = getProfileCompleteness({});
    expect(result.hasProfile).toBe(false);
    expect(result.score).toBe(0);
  });

  it("includes useful sections for filled profile values", () => {
    const profile: UserProfile = {
      income: { grossAnnualIncome: 52000, employmentType: "selfEmployed" },
      studentDebt: { remainingDebt: 20000 },
      savingInvesting: { currentSavings: 15000 },
    };
    const result = getProfileCompleteness(profile);
    expect(result.hasProfile).toBe(true);
    expect(result.usefulSections).toContain("income");
    expect(result.usefulSections).toContain("studentDebt");
    expect(result.usefulSections).toContain("savingInvesting");
    expect(result.usefulSections).toContain("employment");
  });
});
