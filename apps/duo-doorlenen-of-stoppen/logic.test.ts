import { describe, expect, it } from "vitest";
import {
  createEmptyStudyStopValues,
  createStudyStopDefaultValues,
  createStudyStopView,
  mapStudyStopFormToInput,
  validateStudyStopForm,
  type StudyStopFormValues,
} from "./logic";

const CALCULATION_MONTH = "2026-07";

const validValues: StudyStopFormValues = {
  calculationMonth: CALCULATION_MONTH,
  studyLevel: "hbo",
  currentLoanDebt: "30000",
  currentCollegegeldkredietDebt: "2000",
  currentBasisbeursDebt: "3000",
  currentAanvullendeBeursDebt: "1000",
  currentReisproductDebt: "0",
  monthlyLoan: "300",
  monthlyCollegegeldkrediet: "25",
  monthlyBasisbeurs: "100",
  monthlyAanvullendeBeurs: "50",
  monthlyReisproduct: "10",
  monthsUntilLaterDiploma: "24",
  monthsUntilContinueDiploma: "12",
  remainingDiplomaTermMonths: "120",
  repaymentRule: "SF35",
  duoRateYear: "2026",
  annualStudyInterestRate: "0",
  annualRepaymentInterestRate: "0",
  grossAnnualIncome: "0",
  partnerGrossAnnualIncome: "0",
  hasPartner: false,
  oneTimeExtraRepayment: "0",
  monthlyExtraRepayment: "0",
  aflosvrijeMonths: "0",
};

describe("duo-doorlenen-of-stoppen logic", () => {
  it("creates a realistic default and empty state", () => {
    const defaults = createStudyStopDefaultValues(CALCULATION_MONTH);
    const empty = createEmptyStudyStopValues(CALCULATION_MONTH);

    expect(defaults.calculationMonth).toBe(CALCULATION_MONTH);
    expect(defaults.studyLevel).toBe("hbo");
    expect(defaults.repaymentRule).toBe("SF35");
    expect(empty.currentLoanDebt).toBe("");
    expect(empty.monthsUntilLaterDiploma).toBe("");
  });

  it("maps the form input to the central DUO stop scenario input", () => {
    const mapping = mapStudyStopFormToInput(validValues);

    expect(mapping.errors).toEqual({});
    expect(mapping.input).toMatchObject({
      calculationMonth: CALCULATION_MONTH,
      studyLevel: "hbo",
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
      repaymentRule: "SF35",
      duoRateYear: 2026,
      annualStudyInterestRate: 0,
      annualRepaymentInterestRate: 0,
      grossAnnualIncome: 0,
      partnerGrossAnnualIncome: 0,
      hasPartner: false,
      oneTimeExtraRepayment: 0,
      monthlyExtraRepayment: 0,
      aflosvrijeMonths: 0,
    });
  });

  it("validates negative and malformed input", () => {
    const errors = validateStudyStopForm({
      ...validValues,
      currentLoanDebt: "-1",
      monthsUntilLaterDiploma: "-1",
      annualStudyInterestRate: "-1",
      annualRepaymentInterestRate: "-1",
      oneTimeExtraRepayment: "40000",
      calculationMonth: "2026/07",
    });

    expect(errors.currentLoanDebt).toBeDefined();
    expect(errors.monthsUntilLaterDiploma).toBeDefined();
    expect(errors.annualStudyInterestRate).toBeDefined();
    expect(errors.annualRepaymentInterestRate).toBeDefined();
    expect(errors.oneTimeExtraRepayment).toBeDefined();
    expect(errors.calculationMonth).toBeDefined();
  });

  it("produces the stop-now scenarios and timeline for a valid submission", () => {
    const view = createStudyStopView(validValues);

    expect(view.isValid).toBe(true);
    if (!view.isValid) {
      throw new Error("view should be valid");
    }

    expect(view.result.scenarios).toHaveLength(3);
    expect(view.comparisonRows).toHaveLength(3);
    expect(view.result.currentBalances.total).toBe(36000);
    expect(view.result.scenarios[0].debtAtStop.total).toBe(36000);
    expect(view.result.scenarios[1].diplomaMonth).toBe("2028-07");
    expect(view.result.scenarios[2].debtAtStop.alwaysRepayable).toBeGreaterThan(
      view.result.scenarios[0].debtAtStop.alwaysRepayable,
    );
    expect(view.result.scenarios[0].timeline.length).toBeGreaterThan(0);
  });
});
