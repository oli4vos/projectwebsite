import { afterEach, describe, expect, it } from "vitest";
import {
  consumeToolHandoff,
  createToolHandoff,
  getToolHandoffIdFromUrl,
} from "@/lib/tool-handoff";

function createSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("tool handoff", () => {
  it("stores, sanitizes and consumes a one-time profile patch", () => {
    (globalThis as { window?: unknown }).window = {
      sessionStorage: createSessionStorage(),
    };
    const created = createToolHandoff({
      sourceTool: "duo-maandbedrag",
      targetTool: "hypotheek-impact-studieschuld",
      profilePatch: {
        studentDebt: {
          remainingDebt: 22000,
          statutoryMonthlyPayment: 92,
          duoInterestRate: 2.33,
          duoRateYear: 2026,
          repaymentRule: "SF35",
        },
      },
      fieldLabels: ["resterende studieschuld", "wettelijk maandbedrag"],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(
      getToolHandoffIdFromUrl(`?toolHandoff=${created.data.transferId}`),
    ).toBe(created.data.transferId);
    const consumed = consumeToolHandoff(
      created.data.transferId,
      "hypotheek-impact-studieschuld",
    );
    expect(consumed.ok).toBe(true);
    if (!consumed.ok) return;
    expect(consumed.data.profilePatch.studentDebt?.remainingDebt).toBe(22000);
    expect(
      consumeToolHandoff(
        created.data.transferId,
        "hypotheek-impact-studieschuld",
      ).ok,
    ).toBe(false);
  });

  it("rejects a transfer for another target", () => {
    (globalThis as { window?: unknown }).window = {
      sessionStorage: createSessionStorage(),
    };
    const created = createToolHandoff({
      sourceTool: "duo-maandbedrag",
      targetTool: "duo-extra-aflossen",
      profilePatch: { studentDebt: { remainingDebt: 22000 } },
      fieldLabels: ["resterende studieschuld"],
    });
    if (!created.ok) throw new Error("expected transfer");

    expect(
      consumeToolHandoff(
        created.data.transferId,
        "hypotheek-impact-studieschuld",
      ).ok,
    ).toBe(false);
  });
});
