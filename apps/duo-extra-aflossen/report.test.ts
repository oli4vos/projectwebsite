import { describe, expect, it } from "vitest";
import { createDuoDebtPartFormValue } from "@/lib/duo/debt-parts-form";
import { calculateDuoExtraRepaymentView } from "./logic";
import { buildDuoExtraRepaymentPdfReport, duoExtraRepaymentReportFileName } from "./report";

describe("duo-extra-aflossen pdf report", () => {
  it("builds report data from the same extra-repayment view", () => {
    const input = {
      remainingDebt: "30000",
      repaymentRule: "SF35" as const,
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      currentMonthlyPayment: "120",
      oneTimeExtraRepayment: "1000",
      monthlyExtraRepayment: "50",
      strategy: "shortenTerm" as const,
    };
    const view = calculateDuoExtraRepaymentView(input);
    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");

    const report = buildDuoExtraRepaymentPdfReport(input, view, new Date("2026-07-13T10:15:00.000Z"));

    expect(report.title).toContain("extra aflossen");
    expect(report.sections[0].title).toBe("Invoer");
    expect(report.sources.length).toBeGreaterThanOrEqual(3);
    expect(report.summaryLines.some((line) => line.label === "Nieuwe einddatum")).toBe(true);
  });

  it("creates a stable report filename", () => {
    const view = calculateDuoExtraRepaymentView({
      remainingDebt: "30000",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      currentMonthlyPayment: "",
      oneTimeExtraRepayment: "1000",
      monthlyExtraRepayment: "",
      strategy: "shortenTerm",
    });
    expect(duoExtraRepaymentReportFileName(view)).toBe("duo-extra-aflossen-2026.pdf");
  });
});
