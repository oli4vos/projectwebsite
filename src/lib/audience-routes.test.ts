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
      app("duo-doorlenen-of-stoppen", "Doorlenen"),
      app("duo-extra-aflossen", "Extra aflossen"),
      app("duo-maandbedrag", "Maandbedrag"),
      app("familiehulp-eerste-woning", "Familiehulp"),
      app("artifact-hypotheek-wonen-maximale-hypotheek", "Maximale hypotheek"),
      app("hypotheek-impact-studieschuld", "Hypotheek"),
    ];

    expect(getAudienceRouteApps("starter-studieschuld", apps).map((item) => item.slug)).toEqual([
      "duo-doorlenen-of-stoppen",
      "duo-maandbedrag",
      "duo-extra-aflossen",
      "hypotheek-impact-studieschuld",
    ]);

    expect(getAudienceRouteApps("koopstarter-familiehulp", apps).map((item) => item.slug)).toEqual([
      "hypotheek-impact-studieschuld",
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "familiehulp-eerste-woning",
      "duo-doorlenen-of-stoppen",
    ]);
  });

  it("only points primary routes to public registry apps", () => {
    for (const route of visibleAudienceRoutes) {
      for (const slug of route.primaryToolSlugs) {
        expect(appRegistryBySlug[slug], `${route.id} -> ${slug}`).toBeDefined();
      }
    }
  });

  it("keeps visible knowledge links pointed at public registry apps", () => {
    for (const topic of knowledgeTopics) {
      if (topic.visibility === "hidden") {
        continue;
      }

      for (const slug of topic.relatedTools) {
        expect(appRegistryBySlug[slug], `${topic.id} -> ${slug}`).toBeDefined();
      }
    }
  });

  it("keeps visible tool groups pointed at public registry apps", () => {
    for (const group of toolGroups) {
      for (const slug of group.slugs) {
        expect(appRegistryBySlug[slug], `${group.title} -> ${slug}`).toBeDefined();
      }
    }
  });
});
