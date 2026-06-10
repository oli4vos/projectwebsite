import { describe, expect, it } from "vitest";
import { appRegistry } from "@/lib/app-registry";
import type { UserProfile } from "@/lib/user-profile";
import {
  getProfileCompleteness,
  getRecommendedAppsForProfile,
  getRecommendedAppSlugsForProfile,
} from "@/lib/profile-recommendations";

const availableSlugs = appRegistry.map((app) => app.slug);

describe("profile recommendations", () => {
  it("returns recommendation objects with slug and reason", () => {
    const recommendations = getRecommendedAppsForProfile(
      { studentDebt: { remainingDebt: 28000 } },
      { availableSlugs },
    );

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty("slug");
    expect(recommendations[0]).toHaveProperty("reason");
    expect(typeof recommendations[0].reason).toBe("string");
    expect(recommendations[0].reason.length).toBeGreaterThan(0);
  });

  it("returns volgende-euro fallback for empty profile", () => {
    const slugs = getRecommendedAppSlugsForProfile({}, { availableSlugs });
    expect(slugs).toEqual(["volgende-euro"]);
  });

  it("returns a general reason for volgende-euro fallback", () => {
    const recommendations = getRecommendedAppsForProfile({}, { availableSlugs });
    expect(recommendations).toEqual([
      {
        slug: "volgende-euro",
        reason:
          "Omdat dit een brede starttool is als je nog niet weet waar je geld het beste naartoe kan.",
      },
    ]);
  });

  it("uses manifest reasonHint as fallback reason when no profile-specific reason exists", () => {
    const recommendations = getRecommendedAppsForProfile(
      {},
      {
        availableSlugs: ["volgende-euro"],
        apps: [
          {
            slug: "volgende-euro",
            reasonHint: "Handig als je eerst breed wilt verkennen waar je volgende euro naartoe kan.",
          },
        ],
      },
    );

    expect(recommendations).toEqual([
      {
        slug: "volgende-euro",
        reason:
          "Handig als je eerst breed wilt verkennen waar je volgende euro naartoe kan.",
      },
    ]);
  });

  it("keeps profile-specific reason ahead of manifest reasonHint", () => {
    const recommendations = getRecommendedAppsForProfile(
      { studentDebt: { remainingDebt: 28000 } },
      {
        availableSlugs,
        apps: [
          {
            slug: "studieschuld-vs-beleggen",
            reasonHint: "Handig als je studieschuldscenario's wilt vergelijken.",
          },
        ],
      },
    );
    const studieschuldRecommendation = recommendations.find(
      (item) => item.slug === "studieschuld-vs-beleggen",
    );

    expect(studieschuldRecommendation?.reason).toBe(
      "Omdat je studieschuld hebt ingevuld en extra aflossen niet altijd de enige logische keuze is.",
    );
  });

  it("falls back to general reason when reasonHint is missing", () => {
    const recommendations = getRecommendedAppsForProfile(
      {},
      {
        availableSlugs: ["volgende-euro"],
        apps: [{ slug: "volgende-euro" }],
      },
    );

    expect(recommendations).toEqual([
      {
        slug: "volgende-euro",
        reason:
          "Omdat dit een brede starttool is als je nog niet weet waar je geld het beste naartoe kan.",
      },
    ]);
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

  it("adds student debt specific reason text", () => {
    const recommendations = getRecommendedAppsForProfile(
      { studentDebt: { remainingDebt: 28000 } },
      { availableSlugs },
    );
    const studieschuldRecommendation = recommendations.find(
      (item) => item.slug === "studieschuld-vs-beleggen",
    );

    expect(studieschuldRecommendation?.reason).toContain("studieschuld");
  });

  it("recommends housing tools when housing data is present", () => {
    const profile: UserProfile = {
      housing: {
        targetHomePrice: 450000,
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toContain("hypotheek-impact-studieschuld");
    expect(slugs).not.toContain("hypotheek-aflossen-vs-beleggen");
  });

  it("adds housing specific reason text", () => {
    const recommendations = getRecommendedAppsForProfile(
      { housing: { targetHomePrice: 450000 } },
      { availableSlugs },
    );
    const housingRecommendation = recommendations.find(
      (item) => item.slug === "hypotheek-impact-studieschuld",
    );

    expect(housingRecommendation?.reason).toContain("hypotheek");
  });

  it("recommends investing and tax-adjacent tools for savings profile", () => {
    const profile: UserProfile = {
      savingInvesting: {
        currentSavings: 30000,
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toEqual(["volgende-euro"]);
    expect(slugs).not.toContain("box-3-impact");
    expect(slugs).not.toContain("fire-na-belasting");
  });

  it("adds investing specific reason text", () => {
    const recommendations = getRecommendedAppsForProfile(
      { savingInvesting: { currentSavings: 30000 } },
      { availableSlugs },
    );
    const box3Recommendation = recommendations.find(
      (item) => item.slug === "box-3-impact",
    );

    expect(box3Recommendation).toBeUndefined();
    expect(recommendations[0]?.reason).toContain("brede starttool");
  });

  it("recommends zzp tool for self-employed profile", () => {
    const profile: UserProfile = {
      income: {
        employmentType: "selfEmployed",
      },
    };
    const slugs = getRecommendedAppSlugsForProfile(profile, { availableSlugs });
    expect(slugs).toEqual(["volgende-euro"]);
    expect(slugs).not.toContain("zzp-uurtarief");
  });

  it("adds zzp specific reason text", () => {
    const recommendations = getRecommendedAppsForProfile(
      { income: { employmentType: "selfEmployed" } },
      { availableSlugs },
    );
    const zzpRecommendation = recommendations.find(
      (item) => item.slug === "zzp-uurtarief",
    );

    expect(zzpRecommendation).toBeUndefined();
    expect(recommendations[0]?.reason).toContain("brede starttool");
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

  it("returns max 3 unique recommendation objects", () => {
    const recommendations = getRecommendedAppsForProfile(
      {
        studentDebt: { remainingDebt: 25000 },
        housing: { targetHomePrice: 500000 },
        savingInvesting: { currentSavings: 50000 },
        income: { employmentType: "selfEmployed" },
      },
      { availableSlugs },
    );

    const slugs = recommendations.map((item) => item.slug);
    expect(recommendations.length).toBeLessThanOrEqual(3);
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

  it("filters recommendation objects against available list", () => {
    const recommendations = getRecommendedAppsForProfile(
      { studentDebt: { remainingDebt: 1000 } },
      { availableSlugs: ["volgende-euro"] },
    );

    expect(recommendations).toEqual([
      {
        slug: "volgende-euro",
        reason:
          "Omdat dit een brede starttool is als je nog niet weet waar je geld het beste naartoe kan.",
      },
    ]);
  });

  it("keeps backward compatibility for slug-only helper", () => {
    const slugs = getRecommendedAppSlugsForProfile(
      { studentDebt: { remainingDebt: 1000 } },
      { availableSlugs },
    );

    expect(slugs.every((slug) => typeof slug === "string")).toBe(true);
    expect(slugs).toContain("studieschuld-vs-beleggen");
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
