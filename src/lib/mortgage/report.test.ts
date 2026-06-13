import { describe, expect, it } from "vitest";

import { calculateIndicativeMaxMortgage } from "@/lib/mortgage";
import { buildMortgagePdfReport, mortgageReportFileName } from "@/lib/mortgage/report";

describe("mortgage PDF report", () => {
  const input = {
    grossAnnualHouseholdIncome: 80_000,
    grossAnnualPartnerIncome: 0,
    annualMortgageRate: 4.5,
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
    expect(report.summaryLines.some((line) => line.label === "Einduitkomst")).toBe(true);
    expect(report.sections.some((section) => section.title === "3. Inkomensberekening")).toBe(true);
    expect(report.sections.some((section) => section.title === "4. Woningwaarde- en koopbudgetberekening")).toBe(true);
    expect(report.sections.some((section) => section.title === "6. Waarschuwingen")).toBe(true);
    expect(report.sections.some((section) => section.title === "7. Aannames")).toBe(true);

    const studentLoanLine = report.sections
      .find((section) => section.title === "3. Inkomensberekening")
      ?.lines?.find((line) => line.label === "Maandlast studieschuld");

    expect(studentLoanLine?.note).toContain("Brutering");
    expect(report.warnings.length).toBeGreaterThan(0);
    expect(report.assumptions.length).toBeGreaterThan(0);
  });

  it("creates a stable filename from the final mortgage amount", () => {
    const result = calculateIndicativeMaxMortgage(input);
    expect(mortgageReportFileName(result)).toMatch(/^hypotheek-rapport-\d{4}-\d+\.pdf$/);
  });
});
