import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  calculateHypotheekImpact,
  type HypotheekImpactInput,
} from "./logic";
import {
  buildHypotheekImpactPdfReport,
  formatHypotheekImpactCurrency,
  formatHypotheekImpactPercent,
  hypotheekImpactReportFileName,
} from "./report";

const submittedInput: HypotheekImpactInput = {
  situation: "repaying",
  repaymentRule: "SF35",
  actualMonthlyPayment: 150,
  remainingStudentDebt: 22000,
  duoRateYear: 2026,
  remainingTermYears: 35,
  extraRepayment: 3000,
  grossIncomeUser: 48000,
  grossIncomePartner: 0,
  desiredHomePrice: 375000,
  ownMoney: 25000,
  mortgageRate: 4.2,
  mortgageTermYears: 30,
};

function findLine(
  report: ReturnType<typeof buildHypotheekImpactPdfReport>,
  sectionTitle: string,
  label: string,
) {
  const section = report.sections.find((item) => item.title === sectionTitle);
  return section?.lines?.find((line) => line.label === label);
}

describe("hypotheek-impact-studieschuld PDF report", () => {
  it("uses the submitted input and calculated screen result as report data", () => {
    const result = calculateHypotheekImpact(submittedInput);
    const report = buildHypotheekImpactPdfReport(
      submittedInput,
      result,
      new Date("2026-07-18T10:15:00.000Z"),
    );

    expect(report.title).toBe("Hypotheek-impact van je studieschuld");
    expect(report.summaryLines).toEqual([
      {
        label: "Verplicht DUO-bedrag",
        value: formatHypotheekImpactCurrency(
          result.duoMandatoryPayment.requiredMonthlyPayment,
        ),
      },
      {
        label: "Bruto DUO-maandlast hypotheek",
        value: formatHypotheekImpactCurrency(result.mortgageImpact.grossDuoMonthlyImpact),
      },
      {
        label: "Impact op leencapaciteit",
        value: formatHypotheekImpactCurrency(result.mortgageImpact.principalImpact),
      },
      {
        label: "Schuld na extra aflossen",
        value: formatHypotheekImpactCurrency(result.extraRepaymentScenario.newStudentDebt),
      },
    ]);
    expect(findLine(report, "Invoer: studieschuld", "Resterende studieschuld")).toMatchObject({
      value: formatHypotheekImpactCurrency(result.remainingStudentDebt),
    });
    expect(findLine(report, "Invoer: studieschuld", "DUO-rente")).toMatchObject({
      value: formatHypotheekImpactPercent(result.duoRateUsed),
    });
    expect(findLine(report, "Invoer: inkomen en woning", "Bruto jaarinkomen")).toMatchObject({
      value: formatHypotheekImpactCurrency(submittedInput.grossIncomeUser, 0),
    });
    expect(findLine(report, "Resultaten: hypotheekimpact", "Impact op leencapaciteit")).toMatchObject({
      value: formatHypotheekImpactCurrency(result.mortgageImpact.principalImpact),
    });
  });

  it("includes assumptions, warnings, sources and Mijn DUO context", () => {
    const input: HypotheekImpactInput = {
      ...submittedInput,
      situation: "incomeBasedReduction",
      actualMonthlyPayment: 90,
      statutoryMonthlyPayment: 180,
    };
    const result = calculateHypotheekImpact(input);
    const report = buildHypotheekImpactPdfReport(input, result);

    expect(report.assumptions.join(" ")).toContain("studieschuldbrutering");
    expect(report.assumptions.join(" ")).toContain("Mijn DUO");
    expect(report.sections.find((section) => section.title === "Waarschuwingen")).toBeDefined();
    expect(report.sources.map((source) => source.organization)).toEqual([
      "Rijksoverheid",
      "DUO",
      "DUO",
    ]);
    expect(report.sources.every((source) => source.lastChecked.length > 0)).toBe(true);
    expect(report.disclaimer).toContain("geen hypotheekadvies");
  });

  it("keeps split debt parts visible without changing the submitted result", () => {
    const input: HypotheekImpactInput = {
      ...submittedInput,
      remainingStudentDebt: 0,
      duoDebtParts: [
        { remainingDebt: 16000, rateYear: 2026 },
        { remainingDebt: 9000, rateYear: 2024 },
      ],
    };
    const result = calculateHypotheekImpact(input);
    const report = buildHypotheekImpactPdfReport(input, result);
    const debtLine = findLine(report, "Invoer: studieschuld", "Resterende studieschuld");
    const rateLine = findLine(report, "Invoer: studieschuld", "DUO-rente");

    expect(result.debtPortfolio.usesDebtParts).toBe(true);
    expect(debtLine).toMatchObject({
      value: formatHypotheekImpactCurrency(result.remainingStudentDebt),
      note: "Gebaseerd op 2 leningdelen uit de invoer.",
    });
    expect(rateLine?.note).toContain("Gewogen rente");
  });

  it("has a stable report file name", () => {
    expect(hypotheekImpactReportFileName(new Date("2026-07-18T10:15:00.000Z"))).toBe(
      "hypotheek-impact-studieschuld-2026-07.pdf",
    );
  });

  it("does not introduce a separate report calculation path", () => {
    const reportSource = fs.readFileSync(path.join(__dirname, "report.ts"), "utf8");

    expect(reportSource).not.toContain("calculateHypotheekImpact");
    expect(reportSource).not.toContain("calculateMortgageImpact");
    expect(reportSource).not.toContain("calculateExtraRepaymentScenario");
  });
});
