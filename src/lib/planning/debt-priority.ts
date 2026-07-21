import { DEBT_PRIORITY_RULES_2026 } from "@/lib/planning/debt-priority-rules";

export type DebtKind =
  | "bnpl"
  | "creditCard"
  | "personalLoan"
  | "duo"
  | "mortgage"
  | "other";

export type DebtPriorityInputItem = {
  kind: DebtKind;
  label?: string;
  amount?: number;
  interestRate?: number;
  minimumPayment?: number;
};

export type DebtPriorityInput = {
  debts?: DebtPriorityInputItem[];
  extraAmount?: number;
};

export type DebtPriorityStep = {
  rank: number;
  kind: DebtKind;
  label: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  priorityScore: number;
  allocatedAmount: number;
  remainingAfterStep: number;
  actionLabel: string;
  explanation: string;
};

export type DebtPriorityResult = {
  extraAmount: number;
  steps: DebtPriorityStep[];
  ignoredCount: number;
  warnings: string[];
};

const kindLabels: Record<DebtKind, string> = {
  bnpl: "Achteraf betalen",
  creditCard: "Creditcard",
  personalLoan: "Persoonlijke lening",
  duo: "DUO-schuld",
  mortgage: "Hypotheek",
  other: "Overige schuld",
};

function sanitizeNumber(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value as number, 0);
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function priorityScore(kind: DebtKind, interestRate: number) {
  const rateScore = interestRate * DEBT_PRIORITY_RULES_2026.interestRateScoreMultiplier;
  const duoCorrection =
    kind === "duo" && interestRate <= DEBT_PRIORITY_RULES_2026.duoLowRateThresholdPercent
      ? DEBT_PRIORITY_RULES_2026.duoLowRateCorrection
      : 0;

  return Math.max(DEBT_PRIORITY_RULES_2026.kindBaseScore[kind] + rateScore + duoCorrection, 0);
}

function explanationFor(kind: DebtKind, interestRate: number) {
  if (kind === "duo" && interestRate <= 2.5) {
    return "DUO heeft vaak meer flexibiliteit en bij lage rente is extra aflossen niet automatisch de eerste stap.";
  }

  if (kind === "mortgage") {
    return "Hypotheek aflossen kan rust geven, maar vergelijk renteaftrek, flexibiliteit en alternatief rendement.";
  }

  if (interestRate >= DEBT_PRIORITY_RULES_2026.highInterestThresholdPercent) {
    return "Deze schuld heeft een hoge rente. Aflossen levert een zekere besparing op voordat je risico neemt met andere keuzes.";
  }

  return "Deze schuld telt mee in je maandruimte. Zet hem naast andere schulden op basis van rente en flexibiliteit.";
}

export function calculateDebtPriority(
  input: DebtPriorityInput,
): DebtPriorityResult {
  const extraAmount = roundMoney(sanitizeNumber(input.extraAmount));
  const debts = input.debts ?? [];
  const usableDebts = debts
    .map((debt) => {
      const amount = roundMoney(sanitizeNumber(debt.amount));
      const interestRate = Math.round(sanitizeNumber(debt.interestRate) * 100) / 100;
      const minimumPayment = roundMoney(sanitizeNumber(debt.minimumPayment));
      const score = priorityScore(debt.kind, interestRate);

      return {
        ...debt,
        amount,
        interestRate,
        minimumPayment,
        priorityScore: score,
      };
    })
    .filter((debt) => debt.amount > 0)
    .sort((left, right) => right.priorityScore - left.priorityScore);

  let remaining = extraAmount;
  const steps = usableDebts.map((debt, index) => {
    const allocatedAmount = roundMoney(Math.min(remaining, debt.amount));
    remaining = roundMoney(Math.max(remaining - allocatedAmount, 0));
    const label = debt.label?.trim() || kindLabels[debt.kind];

    return {
      rank: index + 1,
      kind: debt.kind,
      label,
      amount: debt.amount,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment,
      priorityScore: debt.priorityScore,
      allocatedAmount,
      remainingAfterStep: remaining,
      actionLabel: `Los extra af op op ${label}`,
      explanation: explanationFor(debt.kind, debt.interestRate),
    };
  });

  return {
    extraAmount,
    steps,
    ignoredCount: Math.max(debts.length - usableDebts.length, 0),
    warnings: [
      "Betaal altijd minimaal verplichte maandbedragen; deze volgorde gaat alleen over extra aflossen.",
      "Dit is een routehulp. Boeterente, contractvoorwaarden en betalingsregelingen kunnen de volgorde veranderen.",
    ],
  };
}
