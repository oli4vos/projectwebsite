import { describe, expect, it } from "vitest";

import { calculateDuoAdditionalGrant } from "@/lib/duo/additional-grant";
import {
  createAdditionalGrantView,
  defaultValues,
  emptyValues,
  mapFormToAdditionalGrantInput,
  validateAdditionalGrantForm,
} from "./logic";

describe("duo-aanvullende-beurs logic", () => {
  it("maps concrete form values to the central additional-grant engine input", () => {
    const input = mapFormToAdditionalGrantInput({
      ...defaultValues,
      educationType: "university",
      residence: "living-away",
      familySituation: "two-parents",
      parent1Income: "25000",
      parent2Income: "26000",
      parent1AnnualDuoRepaymentTerms: "1200",
      parent2OtherQualifyingChildren: "2",
      parent1ChildrenWithAdditionalGrant: "2",
      parent2ChildrenWithAdditionalGrant: "2",
      calculationMonth: "7",
    });

    expect(input).toMatchObject({
      calculationYear: 2026,
      educationType: "university",
      residence: "living-away",
      familySituation: "two-parents",
      calculationMonth: 7,
      tuitionDue: true,
      standardReferenceYearInput: {
        parent1Income: 25000,
        parent2Income: 26000,
        parent1AnnualDuoRepaymentTerms: 1200,
        parent2OtherQualifyingChildren: 2,
        parent1ChildrenWithAdditionalGrant: 2,
        parent2ChildrenWithAdditionalGrant: 2,
      },
      specialCases: [],
    });
  });

  it("does not call the calculation path with unresolved required intake fields", () => {
    const errors = validateAdditionalGrantForm(emptyValues);
    const view = createAdditionalGrantView(emptyValues);

    expect(errors.educationType).toBeDefined();
    expect(errors.parent1Income).toBeDefined();
    expect(view.isValid).toBe(false);
    if (view.isValid) throw new Error("expected invalid view");
    expect("result" in view).toBe(false);
  });

  it("uses the central engine result for public monthly and annual values", () => {
    const view = createAdditionalGrantView(defaultValues);
    const direct = calculateDuoAdditionalGrant(mapFormToAdditionalGrantInput(defaultValues));

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(direct.estimatedMonthlyGrant).toBe(394.75);
    expect(view.result).toEqual(direct);
    expect(view.monthlyGrantLabel).toBe("€ 394,75");
    expect(view.annualGrantLabel).toBe("€ 4.737,00");
    expect(view.probablyEligibleLabel).toBe("Ja, waarschijnlijk");
    expect(view.reasonMessages.join(" ")).not.toContain("duo-additional-grant-calculated");
  });

  it("shows likely no grant when the central engine returns zero", () => {
    const view = createAdditionalGrantView({
      ...defaultValues,
      parent1Income: "60000",
      parent2Income: "60000",
    });

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.result.estimatedMonthlyGrant).toBe(0);
    expect(view.probablyEligibleLabel).toBe("Waarschijnlijk niet");
    expect(view.statusLabel).toBe("Waarschijnlijk geen aanvullende beurs");
  });

  it("passes special cases to the central engine instead of applying the regular formula", () => {
    const view = createAdditionalGrantView({
      ...defaultValues,
      specialCase: "parent-deceased",
    });

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.result.status).toBe("special-case");
    expect(view.monthlyGrantLabel).toBe("Niet berekend");
    expect(view.warningMessages.join(" ")).toContain("DUO blijft leidend");
  });
});
