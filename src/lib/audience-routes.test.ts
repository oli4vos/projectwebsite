import { describe, expect, it } from "vitest";
import type { AppManifest } from "@/lib/app-types";
import {
  audienceRoutes,
  filterGroupsForAudience,
  getAudienceRoute,
  getAudienceRouteAnchorId,
  getAudienceRouteApps,
  visibleAudienceRoutes,
} from "@/lib/audience-routes";
import { appRegistryBySlug } from "@/lib/app-registry";
import { knowledgeTopics } from "@/lib/knowledge-base";
import { toolGroups } from "@/lib/tool-groups";

const baseApp: Omit<AppManifest, "slug" | "title"> = {
  description: "Test app",
  enabled: true,
  type: "frontend",
  category: "Beleggen",
  tags: ["test"],
  status: "active",
  visibility: "public",
  reasonHint: "Test",
  assumptionsUsed: ["investment"],
  calculationDomains: ["investing"],
  riskLevel: "medium",
  disclaimerType: "financialEducation",
  outputType: "singleResult",
  entry: "Calculator.tsx",
};

function app(slug: string, title = slug): AppManifest {
  return {
    ...baseApp,
    slug,
    title,
  };
}

describe("audience routes", () => {
  it("uses stable unique route ids", () => {
    const ids = audienceRoutes.map((route) => route.id);

    expect(ids).toContain("all");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("falls back to all for unknown routes", () => {
    expect(getAudienceRoute("unknown").id).toBe("all");
    expect(getAudienceRoute(undefined).id).toBe("all");
  });

  it("exposes only currently active audience routes", () => {
    expect(visibleAudienceRoutes.map((route) => route.id)).toEqual([
      "all",
      "starter-studieschuld",
      "koopstarter-familiehulp",
    ]);
  });

  it("filters tool groups by route", () => {
    const groups = [
      { title: "Wonen" },
      { title: "Studieschuld" },
      { title: "Werk & ZZP" },
    ];

    expect(filterGroupsForAudience(groups, "all")).toHaveLength(3);
    expect(filterGroupsForAudience(groups, "woningzoeker").map((group) => group.title)).toEqual([
      "Wonen",
      "Studieschuld",
    ]);
  });

  it("returns an anchor for the first relevant group", () => {
    expect(getAudienceRouteAnchorId("all")).toBe("apps");
    expect(getAudienceRouteAnchorId("starter-studieschuld")).toBe(
      "groep-studieschuld",
    );
    expect(getAudienceRouteAnchorId("koopstarter-familiehulp")).toBe("groep-studieschuld");
  });

  it("returns route apps in configured order", () => {
    const apps = [
      app("duo-schuld-bij-starten-lenen", "Starten"),
      app("duo-stoppen-kosten-prestatiebeurs", "Stoppen"),
      app("duo-leenbedrag-impact", "Leenbedrag"),
      app("duo-aanvullende-beurs", "Aanvullende beurs"),
      app("duo-extra-aflossen", "Extra aflossen"),
      app("duo-maandbedrag", "Maandbedrag"),
      app("familiehulp-eerste-woning", "Familiehulp"),
      app("artifact-hypotheek-wonen-maximale-hypotheek", "Maximale hypotheek"),
      app("hypotheek-impact-studieschuld", "Hypotheek"),
    ];

    expect(getAudienceRouteApps("starter-studieschuld", apps).map((item) => item.slug)).toEqual([
      "duo-schuld-bij-starten-lenen",
      "duo-stoppen-kosten-prestatiebeurs",
      "duo-leenbedrag-impact",
      "duo-aanvullende-beurs",
      "duo-maandbedrag",
      "duo-extra-aflossen",
      "hypotheek-impact-studieschuld",
    ]);

    expect(getAudienceRouteApps("koopstarter-familiehulp", apps).map((item) => item.slug)).toEqual([
      "hypotheek-impact-studieschuld",
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "familiehulp-eerste-woning",
      "duo-leenbedrag-impact",
    ]);
  });

  it("only resolves primary routes through public registry apps", () => {
    for (const route of visibleAudienceRoutes) {
      const resolvedSlugs = getAudienceRouteApps(route.id, Object.values(appRegistryBySlug)).map((app) => app.slug);
      expect(resolvedSlugs).not.toContain("familiehulp-eerste-woning");
    }
  });

  it("keeps visible knowledge links filtered through public registry apps", () => {
    for (const topic of knowledgeTopics) {
      if (topic.visibility === "hidden") {
        continue;
      }

      const resolvedSlugs = topic.relatedTools.filter((slug) => appRegistryBySlug[slug]);
      expect(resolvedSlugs).not.toContain("familiehulp-eerste-woning");
    }
  });

  it("keeps visible tool groups resolvable through public registry apps", () => {
    for (const group of toolGroups) {
      const resolvedSlugs = group.slugs.filter((slug) => appRegistryBySlug[slug]);
      expect(resolvedSlugs.length, group.title).toBeGreaterThan(0);
      expect(resolvedSlugs).not.toContain("familiehulp-eerste-woning");
    }
  });
});
