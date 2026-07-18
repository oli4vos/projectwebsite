import { describe, expect, it } from "vitest";

import { MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK } from "@/lib/mortgage/external-rate-links";

describe("mortgage external rate links", () => {
  it("keeps the current-rate reference as an external inspiration link only", () => {
    expect(MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK).toMatchObject({
      id: "geldnl-current-mortgage-rates-inspiration",
      label: "Bekijk actuele hypotheekrentes ter inspiratie",
      url: "https://www.geld.nl/hypotheek/hypotheekrente",
      sourceName: "Geld.nl hypotheekrente vergelijken",
      purpose: "inspiration",
      lastVerifiedAt: "2026-07-19",
    });
    expect(MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK.url).not.toContain("?");
    expect(MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK.explanation).toContain(
      "Vul het percentage daarna zelf in.",
    );
  });
});
