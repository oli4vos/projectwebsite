import { describe, expect, it } from "vitest";

import { calculateIndicativeMaxMortgage } from "@/lib/mortgage";
import { buildMortgagePdfReport, mortgageReportFileName } from "@/lib/mortgage/report";

describe("mortgage PDF report", () => {
  const input = {
    grossAnnualHouseholdIncome: 80_000,
    grossAnnualPartnerIncome: 0,
    annualMortgageRate: 4.01,
    fixedRatePeriodMonths: 120,
    mortgageTermYears: 30,
    monthlyDebtPayments: 0,
    ownFunds: 30_000,
    property: {
      purchasePrice: 350_000,
      marketValue: 350_000,
      nhgRequested: true,
      energyLabel: "A" as const,
      energySavingMeasuresAmount: 0,
      renovationAmount: 0,
    },
    studentLoan: {
      hasStudentLoan: true,
      status: "repaying" as const,
      actualMonthlyPayment: 165,
    },
    afmStressAnnualRate: 5,
  };

  it("builds a report with summary, calculation sections, warnings and assumptions", () => {
    const result = calculateIndicativeMaxMortgage(input);
    const report = buildMortgagePdfReport(input, result, {
      generatedAt: new Date("2026-06-13T10:15:00.000Z"),
    });

    expect(report.title).toContain("Maximale hypotheek");
    expect(report.timeline).toHaveLength(12);
    expect(report.timeline[0].title).toContain("Normset");
    expect(report.timeline[1].title).toContain("Toetsinkomen");
    expect(report.timeline[2].title).toContain("Toetsrente");
    expect(report.timeline[3].title).toContain("Financieringslastpercentage");
    expect(report.timeline[9].formula).toContain("min(");
    expect(report.timeline[11].outcome.label).toContain("bruto maandlast");
    expect(report.sources.some((source) => source.key === "mortgage-regulation")).toBe(true);
    expect(report.sources.some((source) => source.key === "student-loan")).toBe(true);
    expect(report.sections[0].title).toBe("Resultatentabel");
    expect(report.summaryLines.some((line) => line.label === "Einduitkomst")).toBe(true);
    expect(report.summaryLines.some((line) => line.label === "Impact op leencapaciteit")).toBe(true);
    expect(report.sections.some((section) => section.title === "Inkomens- en verplichtingentabel")).toBe(true);
    expect(report.sections.some((section) => section.title === "Woningwaarde, NHG en eigen middelen")).toBe(true);
    expect(
      report.timeline[2].lines.some((line) => line.label === "Werkelijke rente" && line.value === "4,01%"),
    ).toBe(true);

    const ltvStep = report.timeline.find((step) => step.title === "Woningwaarde en LTV toetsen");
    expect(ltvStep?.lines.some(
      (line) =>
        line.label === "Toegepaste extra LTV-ruimte voor energiebesparende maatregelen" &&
        line.value.includes("0,00"),
    )).toBe(true);
    expect(ltvStep?.lines.some(
      (line) =>
        line.label === "Extra leenruimte door energielabel" &&
        line.value.includes("alleen toegepast op de inkomensgrens"),
    )).toBe(true);

    const studentLoanLine = report.sections
      .find((section) => section.title === "Inkomens- en verplichtingentabel")
      ?.lines?.find((line) => line.label === "Studieschuldimpact");

    expect(studentLoanLine?.note).toContain("Brutering");
    expect(report.warnings.length).toBeGreaterThan(0);
    expect(report.assumptions.length).toBeGreaterThan(0);
  });

  it("documents the AFM test-rate path before the financing-load lookup", () => {
    const shortFixedRateInput = {
      ...input,
      annualMortgageRate: 3.8,
      fixedRatePeriodMonths: 60,
      afmStressAnnualRate: 5,
    };
    const result = calculateIndicativeMaxMortgage(shortFixedRateInput);
    const report = buildMortgagePdfReport(shortFixedRateInput, result);

    expect(result.breakdown.testRateUsed).toBe(5);
    expect(result.debug.interestRate).toBe(5);
    expect(report.timeline[2].formula).toContain("max(");
    expect(report.timeline[3].lines.some((line) => line.value === "5,00%")).toBe(true);
  });

  it("creates a stable filename from the final mortgage amount", () => {
    const result = calculateIndicativeMaxMortgage(input);
    expect(mortgageReportFileName(result)).toMatch(/^hypotheek-rapport-\d{4}-\d+\.pdf$/);
  });
});
