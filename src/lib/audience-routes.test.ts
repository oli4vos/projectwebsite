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
      app("familiehulp-eerste-woning", "Familiehulp"),
      app("hypotheek-impact-studieschuld", "Hypotheek"),
      app("volgende-euro", "Volgende euro"),
      app("studieschuld-vs-beleggen", "Studieschuld"),
      app("schulden-volgorde", "Schulden volgorde"),
    ];

    expect(getAudienceRouteApps("starter-studieschuld", apps).map((item) => item.slug)).toEqual([
      "schulden-volgorde",
      "volgende-euro",
      "studieschuld-vs-beleggen",
      "hypotheek-impact-studieschuld",
    ]);

    expect(getAudienceRouteApps("koopstarter-familiehulp", apps).map((item) => item.slug)).toEqual([
      "familiehulp-eerste-woning",
      "hypotheek-impact-studieschuld",
      "studieschuld-vs-beleggen",
      "schulden-volgorde",
      "volgende-euro",
    ]);
  });

  it("only points primary routes to public registry apps", () => {
    for (const route of visibleAudienceRoutes) {
      for (const slug of route.primaryToolSlugs) {
        expect(appRegistryBySlug[slug], `${route.id} -> ${slug}`).toBeDefined();
      }
    }
  });
});
