import type { ActionPlanItem } from "@/lib/regulations/types";

const URGENCY_WEIGHT = {
  "time-sensitive": 0,
  high: 1,
  medium: 2,
  low: 3,
} as const;

export function sortActionPlan(actions: readonly ActionPlanItem[]) {
  return [...actions].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    const leftUrgency = left.urgency ? URGENCY_WEIGHT[left.urgency] : 4;
    const rightUrgency = right.urgency ? URGENCY_WEIGHT[right.urgency] : 4;
    if (leftUrgency !== rightUrgency) {
      return leftUrgency - rightUrgency;
    }

    return left.actionId.localeCompare(right.actionId);
  });
}
