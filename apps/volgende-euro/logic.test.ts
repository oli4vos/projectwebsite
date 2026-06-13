import { describe, expect, it } from "vitest";
import {
  calculateVolgendeEuroPriorities,
  combineNonDuoDebt,
  type PriorityOptionKey,
  type PriorityPlanStep,
} from "./logic";

type TestResult = ReturnType<typeof calculateVolgendeEuroPriorities>;
type TestPriority = TestResult["priorities"][number];

function getStep(result: TestResult, key: PriorityOptionKey) {
  return result.priorityPlan.find((step: PriorityPlanStep) => step.key === key);
}
function getStepIndex(result: TestResult, key: PriorityOptionKey) {
  return result.priorityPlan.findIndex((step: PriorityPlanStep) => step.key === key);
}
function expectStepBefore(
  result: TestResult,
  leftKey: PriorityOptionKey,
  rightKey: PriorityOptionKey,
) {
  const leftIndex = getStepIndex(result, leftKey);
  const rightIndex = getStepIndex(result, rightKey);
  expect(leftIndex).toBeGreaterThanOrEqual(0);
  expect(rightIndex).toBeGreaterThanOrEqual(0);
  expect(leftIndex).toBeLessThan(rightIndex);
}
function expectFiniteNonNegative(value: number | undefined) {
  if (value === undefined) return;
  expect(Number.isFinite(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(0);
}

describe("calculateVolgendeEuroPriorities", () => {
  it("combines non-DUO debt centrally", () => {
    const result = combineNonDuoDebt({
      hasPrimaryNonDuoDebt: true,
      primaryDebtAmount: 2500,
      primaryDebtRate: 7,
      hasOtherDebt: true,
      otherDebtAmount: 1500,
      otherDebtRate: 9,
    });

    expect(result.amount).toBe(4000);
    expect(result.rate).toBe(9);
  });

  it("returns the single non-DUO debt when only one exists", () => {
    const result = combineNonDuoDebt({
      hasPrimaryNonDuoDebt: false,
      primaryDebtAmount: 2500,
      primaryDebtRate: 7,
      hasOtherDebt: true,
      otherDebtAmount: 1500,
      otherDebtRate: 9,
    });

    expect(result.amount).toBe(1500);
    expect(result.rate).toBe(9);
  });

  describe("priorityPlan", () => {
    it("returns no top recommendation for empty input", () => {
      const result = calculateVolgendeEuroPriorities({});
      expect(result.topRecommendation).toBeNull();
      expect(result.priorityPlan).toHaveLength(0);
      expect(result.missingDataHints.length).toBeGreaterThan(0);
    });

    it("starts with buffer until the target amount when there is a clear buffer gap", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 1000,
        targetBuffer: 10000,
      });
      const buffer = getStep(result, "buffer");
      expect(result.priorityPlan[0]?.key).toBe("buffer");
      expect(buffer?.amountNeeded).toBe(9000);
      expect(buffer?.allocatedAmount).toBe(1000);
      expect(buffer?.remainingAfterStep).toBe(0);
      expect(buffer?.targetAmount).toBe(10000);
      expect(buffer?.currentAmount).toBe(1000);
    });

    it("allocates the available amount across expensive debt and buffer when debt outpaces return", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 15000,
        currentBuffer: 1000,
        targetBuffer: 10000,
        hasExpensiveDebt: true,
        expensiveDebtAmount: 6000,
        expensiveDebtRate: 18,
        horizonYears: 20,
        expectedAnnualReturn: 7,
      });
      const buffer = getStep(result, "buffer");
      const debt = getStep(result, "expensiveDebt");
      expectStepBefore(result, "expensiveDebt", "buffer");
      expectStepBefore(result, "expensiveDebt", "freeInvesting");
      expect(debt?.allocatedAmount).toBe(6000);
      expect(debt?.remainingAfterStep).toBe(9000);
      expect(buffer?.allocatedAmount).toBe(9000);
      expect(buffer?.remainingAfterStep).toBe(0);
    });

    it("puts expensive debt before investing when interest is high and buffer is sufficient", () => {
      const result = calculateVolgendeEuroPriorities({
        currentBuffer: 12000,
        targetBuffer: 12000,
        hasExpensiveDebt: true,
        expensiveDebtAmount: 6000,
        expensiveDebtRate: 18,
        horizonYears: 20,
        expectedAnnualReturn: 7,
        riskProfile: "offensive",
        extraAmount: 1000,
      });
      expectStepBefore(result, "expensiveDebt", "freeInvesting");
      expect(getStep(result, "expensiveDebt")?.whyThisStep.toLowerCase()).toMatch(/rente|schuld/);
    });

    it("puts student debt first when duo rate is above risk-adjusted expected return", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 20000,
        targetBuffer: 12000,
        studentDebtAmount: 30000,
        duoRate: 7,
        expectedAnnualReturn: 6,
        horizonYears: 20,
        riskProfile: "neutral",
      });
      expect(result.priorityPlan[0]?.key).toBe("studentDebtExtra");
      expect(getStep(result, "studentDebtExtra")?.whyThisStep.toLowerCase()).toMatch(
        /risicogecorrigeerde rendement/,
      );
    });

    it("applies risk-profile correction in debt-vs-return comparison", () => {
      const conservative = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 20000,
        targetBuffer: 12000,
        studentDebtAmount: 20000,
        duoRate: 5,
        expectedAnnualReturn: 6,
        horizonYears: 20,
        riskProfile: "conservative",
      });
      const offensive = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 20000,
        targetBuffer: 12000,
        studentDebtAmount: 20000,
        duoRate: 5,
        expectedAnnualReturn: 6,
        horizonYears: 20,
        riskProfile: "offensive",
      });
      expect(conservative.priorityPlan[0]?.key).toBe("studentDebtExtra");
      expect(offensive.priorityPlan[0]?.key).not.toBe("studentDebtExtra");
    });

    it("puts investing higher when buffer is sufficient, debt is absent and horizon is long", () => {
      const result = calculateVolgendeEuroPriorities({
        currentBuffer: 20000,
        targetBuffer: 12000,
        hasExpensiveDebt: false,
        studentDebtAmount: 0,
        horizonYears: 20,
        expectedAnnualReturn: 7,
        riskProfile: "offensive",
        extraAmount: 1000,
      });
      expect(getStep(result, "freeInvesting")).toBeDefined();
      expect(getStep(result, "buffer")).toBeUndefined();
      expect(getStep(result, "freeInvesting")?.allocatedAmount).toBe(1000);
    });

    it("does not make low-rate student debt the first step by default", () => {
      const result = calculateVolgendeEuroPriorities({
        currentBuffer: 15000,
        targetBuffer: 12000,
        studentDebtAmount: 30000,
        duoRate: 2.1,
        expectedAnnualReturn: 6,
        horizonYears: 15,
        extraAmount: 1000,
      });
      expect(getStep(result, "studentDebtExtra")).toBeDefined();
      expect(result.priorityPlan[0]?.key).not.toBe("studentDebtExtra");
    });

    it("includes pension jaarruimte only when jaarruimte is provided", () => {
      const withPension = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 18000,
        targetBuffer: 12000,
        availableJaarruimte: 5000,
      });
      const withoutPension = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 18000,
        targetBuffer: 12000,
      });
      const step = getStep(withPension, "pensionJaarruimte");
      expect(step).toBeDefined();
      expect(step?.amountNeeded ?? step?.targetAmount).toBe(5000);
      expect(step?.whyThisStep.toLowerCase()).toMatch(/fiscaal|jaarruimte/);
      expect(getStep(withoutPension, "pensionJaarruimte")).toBeUndefined();
    });

    it("only includes relevant options based on provided input", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 5000,
        targetBuffer: 10000,
      });
      const keys = result.priorityPlan.map((step: PriorityPlanStep) => step.key);
      expect(keys).toContain("buffer");
      expect(keys).not.toContain("expensiveDebt");
      expect(keys).not.toContain("studentDebtExtra");
      expect(keys).not.toContain("mortgagePrepay");
      expect(keys).not.toContain("pensionJaarruimte");
      expect(keys).not.toContain("housingOwnFunds");
    });

    it("does not mark buffer as relevant when the target is already met", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 15000,
        targetBuffer: 12000,
      });
      const bufferPriority = result.priorities.find((item: TestPriority) => item.key === "buffer");
      expect(bufferPriority?.applicability).toBe("notApplicable");
      expect(result.priorityPlan.some((step: PriorityPlanStep) => step.key === "buffer")).toBe(false);
    });

    it("creates a concrete housing own-funds step when a housing goal is provided", () => {
      const result = calculateVolgendeEuroPriorities({
        hasHousingGoal: true,
        targetHomePrice: 400000,
        ownFunds: 20000,
        extraAmount: 10000,
        currentBuffer: 15000,
        targetBuffer: 12000,
      });
      const housing = getStep(result, "housingOwnFunds");
      expect(housing).toBeDefined();
      expect(housing?.targetAmount).toBe(40000);
      expect(housing?.currentAmount).toBe(20000);
      expect(housing?.amountNeeded).toBe(20000);
      expect(housing?.allocatedAmount).toBe(10000);
    });

    it("does not create a hard mortgage target without a mortgage debt amount", () => {
      const result = calculateVolgendeEuroPriorities({
        mortgageRate: 4.5,
        extraAmount: 1000,
        currentBuffer: 15000,
        targetBuffer: 12000,
      });
      const mortgage = getStep(result, "mortgagePrepay");
      expect(mortgage).toBeDefined();
      expect(mortgage?.targetAmount).toBeUndefined();
      expect(mortgage?.amountNeeded).toBeUndefined();
    });

    it("uses sequential unique ranks", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 2000,
        currentBuffer: 5000,
        targetBuffer: 12000,
        hasExpensiveDebt: true,
        expensiveDebtAmount: 4000,
        expensiveDebtRate: 14,
        horizonYears: 15,
        expectedAnnualReturn: 6,
      });
      const ranks = result.priorityPlan.map((step: PriorityPlanStep) => step.rank);
      expect(ranks).toEqual(Array.from({ length: ranks.length }, (_, i) => i + 1));
      expect(new Set(ranks).size).toBe(ranks.length);
    });

    it("always returns readable explanation fields for every step", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 1000,
        targetBuffer: 10000,
      });
      for (const step of result.priorityPlan) {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.actionLabel.trim().length).toBeGreaterThan(0);
        expect(step.whyThisStep.trim().length).toBeGreaterThan(0);
        expect(step.whyBeforeNext.trim().length).toBeGreaterThan(0);
        expect(step.nextTrigger.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("sanitizing and backwards compatibility", () => {
    it("sanitizes negative input and avoids NaN/Infinity in priorities and priorityPlan", () => {
      const result = calculateVolgendeEuroPriorities({
        year: 3026,
        extraAmount: -1000,
        monthlyFreeRoom: -300,
        currentBuffer: -5000,
        targetBuffer: -10000,
        hasExpensiveDebt: true,
        expensiveDebtRate: -8,
        expensiveDebtAmount: -7000,
        studentDebtAmount: -32000,
        duoRate: -2.33,
        mortgageRate: -4,
        availableJaarruimte: -3000,
        horizonYears: -12,
        expectedAnnualReturn: -6,
        hasHousingGoal: true,
        targetHomePrice: -400000,
        ownFunds: -20000,
        riskProfile: "neutral",
      });
      expect(Number.isFinite(result.year)).toBe(true);
      expect(result.duoContext.assumedRate).toBeGreaterThanOrEqual(0);
      for (const p of result.priorities) {
        expect(Number.isFinite(p.score)).toBe(true);
        expect(p.score).toBeGreaterThanOrEqual(0);
        expect(p.score).toBeLessThanOrEqual(100);
      }
      for (const step of result.priorityPlan) {
        expectFiniteNonNegative(step.currentAmount);
        expectFiniteNonNegative(step.targetAmount);
        expectFiniteNonNegative(step.amountNeeded);
        expectFiniteNonNegative(step.allocatedAmount);
        expectFiniteNonNegative(step.remainingAfterStep);
      }
    });

    it("keeps the legacy topRecommendation and priorities usable while priorityPlan becomes primary", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 2000,
        currentBuffer: 1000,
        targetBuffer: 10000,
      });
      expect(result.priorityPlan.length).toBeGreaterThan(0);
      expect(result.priorities.length).toBeGreaterThan(0);
      expect(result.topRecommendation?.key).toBe(result.priorityPlan[0]?.key);
    });

    it("ensures topRecommendation only comes from relevant options", () => {
      const result = calculateVolgendeEuroPriorities({
        currentBuffer: 15000,
        targetBuffer: 12000,
      });
      expect(result.topRecommendation).toBeNull();
      expect(result.priorities.some((item: TestPriority) => item.applicability === "relevant")).toBe(false);
    });

    it("marks free investing as insufficientData when horizon or return is missing", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1500,
      });
      const investing = result.priorities.find((item: TestPriority) => item.key === "freeInvesting");
      expect(investing?.applicability).toBe("insufficientData");
      expect(investing?.missingFields).toContain("beleggingshorizon");
      expect(investing?.missingFields).toContain("verwacht rendement");
    });

    it("limits topThree to relevant options only", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 2500,
        currentBuffer: 4000,
        targetBuffer: 12000,
        hasExpensiveDebt: true,
        expensiveDebtAmount: 6000,
        expensiveDebtRate: 14,
        horizonYears: 20,
        expectedAnnualReturn: 6,
      });
      expect(result.topThree.length).toBeGreaterThan(0);
      expect(result.topThree.every((item: TestPriority) => item.applicability === "relevant")).toBe(true);
      expect(result.topThree.length).toBeLessThanOrEqual(3);
    });

    it("returns topThree with available relevant count when fewer than three items exist", () => {
      const result = calculateVolgendeEuroPriorities({
        extraAmount: 1000,
        currentBuffer: 1000,
        targetBuffer: 5000,
      });
      expect(result.topThree.length).toBe(1);
    });
  });
});
