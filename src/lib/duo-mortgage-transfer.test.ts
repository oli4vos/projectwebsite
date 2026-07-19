import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachDuoMortgageTransferCandidate,
  consumeDuoMortgageTransfer,
  createDuoMortgageTransfer,
  getDuoMortgageTransferIdFromUrl,
  readDuoMortgageTransfer,
} from "@/lib/duo-mortgage-transfer";

type SessionStorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createWindowMock(overrides: Partial<SessionStorageMock> = {}) {
  const values = new Map<string, string>();
  const sessionStorage: SessionStorageMock = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
    ...overrides,
  };

  return {
    sessionStorage,
    __values: values,
  };
}

function installWindowMock(overrides: Partial<SessionStorageMock> = {}) {
  const windowMock = createWindowMock(overrides);
  (globalThis as { window?: unknown }).window = windowMock;
  return windowMock;
}

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(globalThis, "window");
});

describe("duo mortgage transfer", () => {
  it("stores and reads an allowlisted transfer without financial data in the URL", () => {
    installWindowMock();
    const created = createDuoMortgageTransfer({
      sourceTool: "hypotheek-impact-studieschuld",
      targetTool: "duo-maandbedrag",
      returnPath: "/apps/hypotheek-impact-studieschuld",
      returnStep: "duo-bedragen",
      returnAnchor: "duo-bedragen",
      draft: { actualMonthlyPayment: "150", grossIncomeUser: "48000" },
    });

    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("expected transfer");

    const transferId = getDuoMortgageTransferIdFromUrl(
      `?duoMortgageTransfer=${created.data.transferId}&actualMonthlyPayment=999`,
    );
    expect(transferId).toBe(created.data.transferId);

    const loaded = readDuoMortgageTransfer(transferId, {
      sourceTool: "hypotheek-impact-studieschuld",
      targetTool: "duo-maandbedrag",
    });

    expect(loaded.ok).toBe(true);
    if (!loaded.ok) throw new Error("expected loaded transfer");
    expect(loaded.data.draft).toEqual({
      actualMonthlyPayment: "150",
      grossIncomeUser: "48000",
    });
    expect(loaded.data.returnPath).toBe("/apps/hypotheek-impact-studieschuld");
  });

  it("rejects corrupt JSON and missing storage", () => {
    const windowMock = installWindowMock();
    windowMock.__values.set("project-site:duo-mortgage-transfer:v1:transfer-corrupt", "{nope");

    const corrupt = readDuoMortgageTransfer("transfer-corrupt");
    expect(corrupt.ok).toBe(false);
    if (corrupt.ok) throw new Error("expected corrupt transfer error");
    expect(corrupt.error).toBe("corrupt-transfer");

    Reflect.deleteProperty(globalThis, "window");
    const missingStorage = readDuoMortgageTransfer("transfer-corrupt");
    expect(missingStorage.ok).toBe(false);
    if (missingStorage.ok) throw new Error("expected storage error");
    expect(missingStorage.error).toBe("storage-unavailable");
  });

  it("rejects expired and consumed transfers", () => {
    installWindowMock();
    const now = new Date("2026-07-19T10:00:00.000Z");
    const created = createDuoMortgageTransfer(
      {
        sourceTool: "hypotheek-impact-studieschuld",
        targetTool: "duo-maandbedrag",
        returnPath: "/apps/hypotheek-impact-studieschuld",
        draft: {},
      },
      now,
    );

    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("expected transfer");

    expect(
      readDuoMortgageTransfer(
        created.data.transferId,
        { targetTool: "duo-maandbedrag" },
        new Date("2026-07-19T10:44:59.000Z"),
      ).ok,
    ).toBe(true);
    const expired = readDuoMortgageTransfer(
      created.data.transferId,
      { targetTool: "duo-maandbedrag" },
      new Date("2026-07-19T10:45:00.000Z"),
    );
    expect(expired.ok).toBe(false);
    if (expired.ok) throw new Error("expected expired transfer");
    expect(expired.error).toBe("expired-transfer");

    const consumed = consumeDuoMortgageTransfer(created.data.transferId, now);
    expect(consumed.ok).toBe(true);
    const consumedRead = readDuoMortgageTransfer(created.data.transferId, {}, now);
    expect(consumedRead.ok).toBe(false);
    if (consumedRead.ok) throw new Error("expected consumed transfer");
    expect(consumedRead.error).toBe(
      "consumed-transfer",
    );
  });

  it("attaches a candidate only after a valid active transfer", () => {
    installWindowMock();
    const created = createDuoMortgageTransfer({
      sourceTool: "hypotheek-impact-studieschuld",
      targetTool: "duo-maandbedrag",
      returnPath: "/apps/hypotheek-impact-studieschuld",
      draft: {},
    });

    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("expected transfer");

    const updated = attachDuoMortgageTransferCandidate(created.data.transferId, {
      createdAt: "2026-07-19T10:00:00.000Z",
      sourceSituation: "statutory-payment",
      recommendedMonthlyAssessmentPayment: 123.45,
      assessment: {
        recommendedMonthlyAssessmentPayment: 123.45,
        basis: "statutoryPayment",
        situation: "statutory-payment",
        reasonCode: "collected-equals-statutory",
        usedDebtParts: false,
        warnings: [],
        missingFields: [],
        uncertainty: "low",
        providerDependent: true,
        userConfirmationRequired: ["confirm-statutory-payment-in-mijn-duo"],
        assumptions: [],
      },
    });

    expect(updated.ok).toBe(true);
    if (!updated.ok) throw new Error("expected updated transfer");
    expect(updated.data.status).toBe("candidate-ready");
    const readWithoutCandidateFlag = readDuoMortgageTransfer(updated.data.transferId, {
      targetTool: "duo-maandbedrag",
    });
    expect(readWithoutCandidateFlag.ok).toBe(false);
    if (readWithoutCandidateFlag.ok) {
      throw new Error("expected candidate-ready transfer to be rejected");
    }
    expect(readWithoutCandidateFlag.error).toBe("invalid-transfer");
    expect(
      readDuoMortgageTransfer(updated.data.transferId, {
        targetTool: "duo-maandbedrag",
        allowCandidateReady: true,
      }).ok,
    ).toBe(true);
  });

  it("reports storage write failures", () => {
    installWindowMock({
      setItem: () => {
        throw new Error("quota");
      },
    });

    const created = createDuoMortgageTransfer({
      sourceTool: "hypotheek-impact-studieschuld",
      targetTool: "duo-maandbedrag",
      returnPath: "/apps/hypotheek-impact-studieschuld",
      draft: {},
    });

    expect(created.ok).toBe(false);
    if (created.ok) throw new Error("expected storage write error");
    expect(created.error).toBe("storage-write-failed");
  });
});
