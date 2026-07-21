import { ALLOWANCE_CALCULATION_RULES_2026 } from "@/lib/financial-constants/allowance-calculation-rules-2026";
import type { ChildcarePercentageBand } from "@/lib/financial-constants/allowance-calculation-rules-2026";

export type ChildcareCareType = "daycare" | "out-of-school-care" | "childminder-care";

export type ChildcareContractInput = {
  readonly childId: string;
  readonly careType: ChildcareCareType;
  readonly hoursPerMonth: number;
  readonly hourlyRate: number;
};

export type ChildcareSubsidisableContract = ChildcareContractInput & {
  readonly cappedHours: number;
  readonly cappedHourlyRate: number;
  readonly subsidisableCosts: number;
};

export type ChildcareFirstChildSelection = {
  readonly firstChildId: string;
  readonly childSummaries: readonly {
    readonly childId: string;
    readonly subsidisableHours: number;
    readonly subsidisableCosts: number;
    readonly isFirstChild: boolean;
  }[];
};

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function hourlyCap(careType: ChildcareCareType) {
  const rules = ALLOWANCE_CALCULATION_RULES_2026.childcare;
  if (careType === "daycare") return Number(rules.maxHourlyRateDaycare.value);
  if (careType === "out-of-school-care") return Number(rules.maxHourlyRateOutOfSchoolCare.value);
  return Number(rules.maxHourlyRateChildminderCare.value);
}

export function lookupChildcarePercentageBand2026(income: number): ChildcarePercentageBand | undefined {
  if (!Number.isFinite(income) || income < 0) return undefined;
  return ALLOWANCE_CALCULATION_RULES_2026.childcare.percentageTable.find((band) =>
    income >= band.incomeFrom && income <= band.incomeTo,
  );
}

export function capChildcareContract2026(
  input: ChildcareContractInput,
): ChildcareSubsidisableContract {
  const maxHours = Number(ALLOWANCE_CALCULATION_RULES_2026.childcare.maxHoursPerMonth.value);
  const cappedHours = Math.min(Math.max(input.hoursPerMonth, 0), maxHours);
  const cappedHourlyRate = Math.min(Math.max(input.hourlyRate, 0), hourlyCap(input.careType));
  return deepFreeze({
    ...input,
    cappedHours,
    cappedHourlyRate,
    subsidisableCosts: money(cappedHours * cappedHourlyRate),
  });
}

export function selectFirstChildForChildcare2026(
  contracts: readonly ChildcareContractInput[],
): ChildcareFirstChildSelection | undefined {
  const byChild = new Map<string, { childId: string; subsidisableHours: number; subsidisableCosts: number }>();
  for (const contract of contracts) {
    const capped = capChildcareContract2026(contract);
    const existing = byChild.get(contract.childId);
    byChild.set(contract.childId, {
      childId: contract.childId,
      subsidisableHours: (existing?.subsidisableHours ?? 0) + capped.cappedHours,
      subsidisableCosts: money((existing?.subsidisableCosts ?? 0) + capped.subsidisableCosts),
    });
  }
  const sorted = [...byChild.values()].sort((left, right) =>
    right.subsidisableHours - left.subsidisableHours ||
    right.subsidisableCosts - left.subsidisableCosts ||
    left.childId.localeCompare(right.childId),
  );
  const first = sorted[0];
  if (!first) return undefined;

  return deepFreeze({
    firstChildId: first.childId,
    childSummaries: sorted.map((child) => ({
      ...child,
      isFirstChild: child.childId === first.childId,
    })),
  });
}
