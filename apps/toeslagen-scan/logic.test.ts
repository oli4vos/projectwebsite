import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateOfficialAllowanceScan2026 } from "@/lib/allowances/official-calculations";
import {
  createAllowanceQuestionFlowView,
  createAllowanceScanView,
  defaultValues,
  exampleValues,
  mapFormToAllowanceScanInput,
  mapFormToPublicAllowanceScanInput,
  validateAllowanceScanForm,
} from "./logic";

describe("toeslagen-scan adapter", () => {
  it("maps a complete form state to the central allowance scan input", () => {
    const input = mapFormToAllowanceScanInput(exampleValues);

    expect(input).toMatchObject({
      year: 2026,
      age: 34,
      partnerStatus: "no",
      assessmentIncome: 30000,
      assets: 12000,
      healthcare: { hasDutchHealthInsurance: true },
      rent: {
        tenure: "rent",
        independentHome: true,
        basicRent: 850,
        hasCoResidents: false,
      },
      childBudget: {
        hasChildren: true,
        childAges: [6],
        receivesChildBenefit: true,
        childLivesWithApplicant: true,
      },
      childcare: {
        hasChildren: true,
        usesChildcare: true,
        registeredChildcare: true,
        paysOwnContribution: true,
        hoursPerMonth: 80,
        applicantHasQualifyingActivity: true,
        partnerHasQualifyingActivity: "not-applicable",
      },
    });
  });

  it("maps childcare contract fields to the public central calculation input", () => {
    const input = mapFormToPublicAllowanceScanInput(exampleValues);

    expect(input.childcare.contracts).toEqual([
      {
        childId: "child-1",
        careType: "after-school",
        hoursPerMonth: 80,
        hourlyRate: 8.5,
        isLrkRegistered: true,
        paysOwnContribution: true,
      },
    ]);
  });

  it("formats public component rows without currency for percentages, counts or internal ids", () => {
    const view = createAllowanceScanView(exampleValues, {
      generatedAt: "2026-07-24T10:00:00.000Z",
    });
    const childcareCard = view.result?.cards.find((card) => card.kind === "childcare");

    expect(childcareCard?.components).toEqual(
      expect.arrayContaining([
        { label: "Vergoedingspercentage eerste kind", value: "96%" },
        { label: "Vergoedingspercentage volgende kinderen", value: "96%" },
        { label: "Aantal begrensde opvangregels", value: "0" },
        { label: "Eerste kind volgens opvangregel", value: "Kind 1" },
      ]),
    );
    expect(JSON.stringify(childcareCard?.components)).not.toContain("child-1");
    expect(
      childcareCard?.components.find((row) => row.label === "Vergoedingspercentage eerste kind")?.value,
    ).not.toContain("€");
    expect(
      childcareCard?.components.find((row) => row.label === "Aantal begrensde opvangregels")?.value,
    ).not.toContain("€");
  });

  it("ignores hidden stale rent, partner and childcare fields", () => {
    const input = mapFormToAllowanceScanInput({
      ...exampleValues,
      partnerStatus: "no",
      jointAssessmentIncome: "999999",
      jointAssets: "999999",
      tenure: "owner",
      basicRent: "850",
      hasCoResidents: "yes",
      householdIncome: "12345",
      householdAssets: "12345",
      hasChildren: "no",
      usesChildcare: "yes",
      registeredChildcare: "yes",
      paysOwnContribution: "yes",
      childcareCareType: "daycare",
      childcareHoursPerMonth: "80",
      childcareHourlyRate: "9",
    });

    expect(input.jointAssessmentIncome).toBeUndefined();
    expect(input.jointAssets).toBeUndefined();
    expect(input.rent?.basicRent).toBe(0);
    expect(input.rent?.householdIncome).toBeUndefined();
    expect(input.childcare?.hasChildren).toBe(false);
    expect(input.childcare?.usesChildcare).toBe(false);
    expect(input.childcare?.registeredChildcare).toBe(false);
    expect(input.childcare?.hoursPerMonth).toBe(0);
  });

  it("does not validate hidden stale fields after progressive-disclosure changes", () => {
    const values = {
      ...exampleValues,
      partnerStatus: "no" as const,
      jointAssessmentIncome: "niet zichtbaar",
      jointAssets: "-1",
      tenure: "owner" as const,
      basicRent: "geen huur",
      hasCoResidents: "yes" as const,
      householdIncome: "ook verborgen",
      householdAssets: "-2",
      hasChildren: "no" as const,
      usesChildcare: "yes" as const,
      childcareHoursPerMonth: "veel",
      childcareHourlyRate: "ook verborgen",
    };
    const errors = validateAllowanceScanForm(values);
    const input = mapFormToAllowanceScanInput(values);

    expect(errors.jointAssessmentIncome).toBeUndefined();
    expect(errors.jointAssets).toBeUndefined();
    expect(errors.basicRent).toBeUndefined();
    expect(errors.householdIncome).toBeUndefined();
    expect(errors.householdAssets).toBeUndefined();
    expect(errors.childcareHoursPerMonth).toBeUndefined();
    expect(errors.childcareHourlyRate).toBeUndefined();
    expect(input.jointAssessmentIncome).toBeUndefined();
    expect(input.rent?.householdIncome).toBeUndefined();
    expect(input.childcare?.hoursPerMonth).toBe(0);
  });

  it("keeps unknown answers as insufficient-information signals instead of validation errors", () => {
    const errors = validateAllowanceScanForm(defaultValues);
    const view = createAllowanceScanView(defaultValues);

    expect(errors).toEqual({});
    expect(view.isValid).toBe(true);
    expect(view.result?.cards.some((card) => card.status === "incomplete")).toBe(true);
  });

  it("blocks technically invalid input without silently clamping", () => {
    const errors = validateAllowanceScanForm({
      ...defaultValues,
      age: "121",
      assessmentIncome: "-1",
      assets: "niet-getal",
      hasChildren: "yes",
      childAges: "6, oud",
    });

    expect(errors.age).toBeDefined();
    expect(errors.assessmentIncome).toBeDefined();
    expect(errors.assets).toBeDefined();
    expect(errors.childAges).toBeDefined();
  });

  it("preserves fixed result order, source links and safe public amount fields", () => {
    const view = createAllowanceScanView(exampleValues, {
      generatedAt: "2026-07-20T12:34:56.000Z",
    });

    expect(view.isValid).toBe(true);
    expect(view.result?.cards.map((card) => card.kind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    for (const card of view.result?.cards ?? []) {
      expect(card.sourceLinks.length).toBeGreaterThan(0);
      expect(card.sourceLinks.every((link) => link.href.startsWith("https://www.belastingdienst.nl/"))).toBe(true);
      expect("amount" in card).toBe(false);
      expect(card.statusLabel).not.toBe(card.status);
      expect(card.reliabilityDisplayLabel).not.toBe(card.reliabilityLabel);
      expect(JSON.stringify(card).toLowerCase()).not.toContain("je hebt recht");
    }
    expect(view.result?.cards.find((card) => card.kind === "healthcare")?.monthlyAmountLabel).toBeDefined();
    expect(view.result?.cards.find((card) => card.kind === "rent")?.monthlyAmountLabel).toBe("€ 342");
    expect(view.result?.cards.find((card) => card.kind === "child-budget")?.monthlyAmountLabel).toBe("€ 497");
    expect(view.result?.cards.find((card) => card.kind === "childcare")?.monthlyAmountLabel).toBe("€ 652");
    expect(view.result?.report.generatedAt).toBe("2026-07-20T12:34:56.000Z");
  });

  it("keeps manifest copy aligned with public amount support", () => {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "apps/toeslagen-scan/app.json"), "utf8"),
    ) as { description: string; reasonHint: string };
    const publicCopy = `${manifest.description} ${manifest.reasonHint}`.toLowerCase();

    expect(publicCopy).toContain("zorgtoeslag");
    expect(publicCopy).toContain("2026");
    expect(publicCopy).toContain("huurtoeslag");
    expect(publicCopy).toContain("kindgebonden budget");
    expect(publicCopy).toContain("kinderopvangtoeslag");
    expect(publicCopy).toContain("bedragindicatie");
    expect(publicCopy).not.toContain("zonder bedragen");
    expect(publicCopy).not.toContain("zonder totaalbedrag");
  });

  it("matches the central engine entrypoint output metadata", () => {
    const input = mapFormToAllowanceScanInput(exampleValues);
    const direct = calculateOfficialAllowanceScan2026({ ...input, calculationYear: 2026 });
    const view = createAllowanceScanView(exampleValues);

    expect(direct.ok).toBe(true);
    if (!direct.ok) return;
    expect(view.result?.datasetId).toBe(direct.value.datasetId);
    expect(view.result?.datasetVersion).toBe(direct.value.datasetVersion);
    expect(view.result?.ruleYear).toBe(2026);
  });

  it("uses the central question flow to pick the next unanswered question", () => {
    const flow = createAllowanceQuestionFlowView(defaultValues);

    expect(flow.isValid).toBe(true);
    expect(flow.decisionReason).toBe("next-pending");
    expect(flow.nextFieldLabel).toBe("Leeftijd");
    expect(flow.questionStatuses.age).toBe("active");
    expect(flow.totalRelevant).toBeGreaterThan(0);
    expect(flow.answered).toBeGreaterThanOrEqual(1);
    expect(flow.remaining).toBeGreaterThan(0);
    expect(flow.percentage).toBeLessThan(100);
    expect(flow.reporting.answeredFieldLabels).toContain("Kalenderjaar");
  });

  it("computes progress from the central question flow", () => {
    const empty = createAllowanceQuestionFlowView(defaultValues);
    const example = createAllowanceQuestionFlowView(exampleValues);

    expect(example.completed).toBeGreaterThan(empty.completed);
    expect(example.percentage).toBeGreaterThan(empty.percentage);
    expect(example.answered).toBeGreaterThan(empty.answered);
    expect(example.inferred).toBeGreaterThanOrEqual(0);
    expect(example.skipped).toBeGreaterThanOrEqual(0);
    expect(example.items.map((item) => item.allowanceKind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    expect(example.items.every((item) => item.recommendationIds.length > 0)).toBe(true);
  });

  it("keeps inferred answers visible as inferred", () => {
    const flow = createAllowanceQuestionFlowView({
      ...exampleValues,
      hasChildren: "unknown",
      childAges: "5",
    });

    expect(flow.questionStatuses["children.hasChildren"]).toBe("inferred");
    expect(flow.items.some((item) => item.inferredFieldLabels.includes("Kinderen"))).toBe(true);
    expect(flow.reporting.inferredFieldLabels).toContain("Kinderen");
  });

  it("supports skipped and not-applicable questions from the central flow", () => {
    const flow = createAllowanceQuestionFlowView({
      ...exampleValues,
      partnerStatus: "no",
      tenure: "owner",
      hasChildren: "no",
    });

    expect(flow.questionStatuses["rent.basicRent"]).toBe("skipped");
    expect(flow.questionStatuses["childcare.partnerHasQualifyingActivity"]).toBe("not-applicable");
    expect(flow.items.some((item) => item.skippedFieldLabels.length > 0)).toBe(true);
    expect(flow.items.some((item) => item.notApplicableFieldLabels.length > 0)).toBe(true);
    expect(flow.reporting.skippedFieldLabels).toContain("Kale huur per maand");
    expect(flow.reporting.notApplicableFieldLabels).toContain("Activiteit toeslagpartner");
  });

  it("honours central blocking decisions without turning regular allowance unknowns into blockers", () => {
    const flow = createAllowanceQuestionFlowView(defaultValues);

    expect(flow.blocked).toBe(0);
    expect(flow.items.flatMap((item) => item.blockingFieldLabels)).toEqual([]);
    expect(flow.reporting.blockingFieldLabels).toEqual([]);
    expect(flow.decisionReason).not.toBe("blocked");
  });

  it("does not change public scan results when the question flow is built", () => {
    const before = createAllowanceScanView(exampleValues, {
      generatedAt: "2026-07-20T07:00:00.000Z",
    });
    const flow = createAllowanceQuestionFlowView(exampleValues);
    const after = createAllowanceScanView(exampleValues, {
      generatedAt: "2026-07-20T07:00:00.000Z",
    });

    expect(flow.isValid).toBe(true);
    expect(after).toEqual(before);
  });

  it("keeps reporting metadata available from the same calculation result as the screen", () => {
    const flow = createAllowanceQuestionFlowView(exampleValues);

    expect(flow.reporting.answeredFieldLabels).toContain("Geschat toetsingsinkomen");
    expect(flow.reporting.confidenceLabels.length).toBeGreaterThan(0);
    expect(flow.reporting.officialVerificationRequired).toBe(true);
    expect(flow.reporting.recommendationIds.length).toBeGreaterThan(0);
    expect(JSON.stringify(flow.reporting).toLowerCase()).not.toContain("amount");
  });

  it("fills report answered inputs from relevant non-stale form answers", () => {
    const view = createAllowanceScanView({
      ...exampleValues,
      partnerStatus: "no",
      jointAssessmentIncome: "999999",
      jointAssets: "999999",
      tenure: "owner",
      basicRent: "850",
      hasCoResidents: "yes",
      householdIncome: "12345",
      householdAssets: "12345",
      hasChildren: "no",
      usesChildcare: "yes",
      childcareHoursPerMonth: "80",
      childcareHourlyRate: "9",
    }, {
      generatedAt: new Date("2026-07-20T08:00:00.000Z"),
    });

    const report = view.result?.report;
    expect(report?.generatedAt).toBe("2026-07-20T08:00:00.000Z");
    expect(report?.answeredInputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Geschat toetsingsinkomen",
          value: "30000",
          inputState: "answered",
          sourceFieldId: "assessmentIncome",
        }),
        expect.objectContaining({
          label: "Woonsituatie",
          value: "Koopwoning",
          inputState: "answered",
          sourceFieldId: "rent.tenure",
        }),
      ]),
    );
    expect(report?.answeredInputs.some((line) => line.sourceFieldId === "jointAssessmentIncome")).toBe(false);
    expect(report?.answeredInputs.some((line) => line.sourceFieldId === "rent.basicRent")).toBe(false);
    expect(report?.answeredInputs.some((line) => line.sourceFieldId === "childcare.hoursPerMonth")).toBe(false);
  });

  it("marks inferred, pending-confirmation and missing report inputs explicitly", () => {
    const view = createAllowanceScanView({
      ...exampleValues,
      age: "",
      hasChildren: "unknown",
      childAges: "5",
    }, {
      generatedAt: "2026-07-20T09:00:00.000Z",
    });
    const report = view.result?.report;

    expect(report?.missingInputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Ontbrekend gegeven",
          value: "Leeftijd",
          inputState: "missing",
          sourceFieldId: "age",
        }),
      ]),
    );
    expect(report?.inferredInputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          inputState: "inferred",
          value: expect.stringContaining("Kinderen is afgeleid"),
        }),
        expect.objectContaining({
          inputState: "pending-confirmation",
          value: expect.stringContaining("Controleer kinderen"),
        }),
      ]),
    );
  });

  it("uses the same calculation result for visible cards and report amounts", () => {
    const view = createAllowanceScanView(exampleValues, {
      generatedAt: "2026-07-20T10:00:00.000Z",
    });
    const healthcareCard = view.result?.cards.find((card) => card.kind === "healthcare");
    const healthcareReport = view.result?.report.results.find((item) => item.allowanceKind === "healthcare");
    const rentCard = view.result?.cards.find((card) => card.kind === "rent");
    const rentReport = view.result?.report.results.find((item) => item.allowanceKind === "rent");
    const childBudgetCard = view.result?.cards.find((card) => card.kind === "child-budget");
    const childBudgetReport = view.result?.report.results.find((item) => item.allowanceKind === "child-budget");
    const childcareCard = view.result?.cards.find((card) => card.kind === "childcare");
    const childcareReport = view.result?.report.results.find((item) => item.allowanceKind === "childcare");

    expect(healthcareReport?.monthlyAmountLabel).toBe(healthcareCard?.monthlyAmountLabel);
    expect(healthcareReport?.yearlyAmountLabel).toBe(healthcareCard?.annualAmountLabel);
    expect(rentReport?.monthlyAmountLabel).toBe(rentCard?.monthlyAmountLabel);
    expect(rentReport?.yearlyAmountLabel).toBe(rentCard?.annualAmountLabel);
    expect(childBudgetReport?.monthlyAmountLabel).toBe(childBudgetCard?.monthlyAmountLabel);
    expect(childBudgetReport?.yearlyAmountLabel).toBe(childBudgetCard?.annualAmountLabel);
    expect(childcareReport?.monthlyAmountLabel).toBe(childcareCard?.monthlyAmountLabel);
    expect(childcareReport?.yearlyAmountLabel).toBe(childcareCard?.annualAmountLabel);
    expect(view.result?.totalMonthlyAmount).toBe(
      view.result?.cards.reduce((sum, card) => sum + (card.monthlyAmount ?? 0), 0),
    );
    expect(view.result?.totalAnnualAmount).toBe(
      view.result?.cards.reduce((sum, card) => sum + (card.annualAmount ?? 0), 0),
    );
    expect(view.result?.totalIncludedAllowanceTitles).toContain("Kinderopvangtoeslag");
    expect(healthcareReport?.calculationYear).toBe(view.result?.ruleYear);
    expect(rentReport?.reasons.map((line) => line.value)).toEqual(rentCard?.reasonMessages);
    expect(childBudgetReport?.reasons.map((line) => line.value)).toEqual(childBudgetCard?.reasonMessages);
    expect(JSON.stringify(rentReport?.reasons)).not.toContain("huurtoeslag-inkomenstabellen");
    expect(JSON.stringify(childBudgetReport?.reasons)).not.toContain("kindgebonden budgetbedragen");
  });
});
