import { describe, expect, it } from "vitest";
import { createDuoDebtPartFormValue } from "@/lib/duo/debt-parts-form";
import { calculateDuoMonthlyPaymentView } from "./logic";
import { buildDuoMonthlyPaymentPdfReport, duoMonthlyPaymentReportFileName } from "./report";

describe("duo-maandbedrag pdf report", () => {
  it("builds report data from the same monthly-payment view", () => {
    const input = {
      remainingDebt: "42000",
      repaymentRule: "SF35" as const,
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      assessmentIncome: "30000",
      householdSituation: "single" as const,
    };
    const view = calculateDuoMonthlyPaymentView(input);
    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");

    const report = buildDuoMonthlyPaymentPdfReport(input, view, new Date("2026-07-13T10:15:00.000Z"));

    expect(report.title).toContain("DUO-maandbedrag");
    expect(report.sections[0].title).toBe("Invoer");
    expect(report.sources).toHaveLength(3);
    expect(report.summaryLines.some((line) => line.label === "Wettelijke maandtermijn")).toBe(true);
  });

  it("creates a stable report filename", () => {
    const view = calculateDuoMonthlyPaymentView({
      remainingDebt: "42000",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      assessmentIncome: "",
      householdSituation: "single",
    });
    expect(duoMonthlyPaymentReportFileName(view)).toBe("duo-maandbedrag-2026.pdf");
  });
});
