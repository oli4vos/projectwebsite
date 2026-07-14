import { describe, expect, it } from "vitest";
import { calculateStudyStopScenarios } from "@/lib/duo/studeren-stoppen";
import { buildStudyStopPdfReport, studyStopReportFileName } from "./report";

const INPUT = {
  calculationMonth: "2026-07",
  studyLevel: "hbo" as const,
  currentLoanDebt: 30000,
  currentCollegegeldkredietDebt: 2000,
  currentBasisbeursDebt: 3000,
  currentAanvullendeBeursDebt: 1000,
  currentReisproductDebt: 0,
  monthlyLoan: 300,
  monthlyCollegegeldkrediet: 25,
  monthlyBasisbeurs: 100,
  monthlyAanvullendeBeurs: 50,
  monthlyReisproduct: 10,
  monthsUntilLaterDiploma: 24,
  monthsUntilContinueDiploma: 12,
  remainingDiplomaTermMonths: 120,
  repaymentRule: "SF35" as const,
  duoRateYear: 2026,
  annualStudyInterestRate: 0,
  annualRepaymentInterestRate: 0,
  grossAnnualIncome: 0,
  partnerGrossAnnualIncome: 0,
  hasPartner: false,
  oneTimeExtraRepayment: 0,
  monthlyExtraRepayment: 0,
  aflosvrijeMonths: 0,
};

describe("duo-doorlenen-of-stoppen pdf report", () => {
  it("builds a report from the same central result data as the web interface", () => {
    const result = calculateStudyStopScenarios(INPUT);
    const report = buildStudyStopPdfReport(INPUT, result);

    expect(report.title).toContain("Studeren stoppen");
    expect(report.ruleVersion).toBe(result.ruleVersion);
    expect(report.focusScenarios).toHaveLength(3);
    expect(report.focusScenarios[0].title).toContain("begin met studeren");
    expect(report.scenarioComparison).toHaveLength(3);
    expect(report.scenarios[0].metrics[0].value).toContain("€");
    expect(report.scenarios[0].timeline.length).toBe(result.scenarios[0].timeline.length);
    expect(report.sources[0].consultedAt).toBe("2026-07-13");
    expect(report.sources[0].validityDate).toContain("2026-07-13");
    expect(report.disclaimer).toContain("geen DUO-beschikking");
  });

  it("uses a stable download filename", () => {
    const result = calculateStudyStopScenarios(INPUT);

    expect(studyStopReportFileName(result)).toBe("studeren-stoppen-duo-202607.pdf");
  });
});
