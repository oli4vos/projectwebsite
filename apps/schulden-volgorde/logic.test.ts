import { describe, expect, it } from "vitest";
import { calculateDebtPriority } from "./logic";

describe("calculateDebtPriority", () => {
  it("puts high-interest debt before low-rate DUO debt", () => {
    const result = calculateDebtPriority({
      extraAmount: 500,
      debts: [
        { kind: "duo", amount: 20000, interestRate: 2.1 },
        { kind: "bnpl", amount: 800, interestRate: 12 },
      ],
    });

    expect(result.steps[0]?.kind).toBe("bnpl");
    expect(result.steps[1]?.kind).toBe("duo");
  });

  it("ignores empty or negative debts", () => {
    const result = calculateDebtPriority({
      debts: [
        { kind: "creditCard", amount: 0, interestRate: 18 },
        { kind: "other", amount: -100, interestRate: 10 },
      ],
    });

    expect(result.steps).toHaveLength(0);
    expect(result.ignoredCount).toBe(2);
  });
});
