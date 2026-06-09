import type {
  GiftCashflowResult,
  GiftCashflowRow,
  GiftInput,
  RecurringGiftInput,
} from "@/lib/family-financing/types";

function safeFinite(value: number | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeMoney(value: number | undefined) {
  return Math.max(safeFinite(value, 0), 0);
}

function roundMoney(value: number | undefined) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function safeDate(date?: string) {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatYearMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function frequencyToMonths(frequency: RecurringGiftInput["frequency"]) {
  switch (frequency) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "yearly":
      return 12;
  }
}

function countRecurringPayments(input: RecurringGiftInput) {
  const maxPayments = input.maxPayments;
  if (typeof maxPayments === "number" && Number.isFinite(maxPayments) && maxPayments > 0) {
    return Math.floor(maxPayments);
  }

  const startDate = safeDate(input.startDate);
  const endDate = safeDate(input.endDate);
  const stepMonths = frequencyToMonths(input.frequency);

  if (startDate && endDate && endDate.getTime() >= startDate.getTime()) {
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return Math.floor(months / stepMonths) + 1;
  }

  return 12;
}

function buildOneTimeGiftResult(input: Extract<GiftInput, { kind: "one-time" }>): GiftCashflowResult {
  const amount = roundMoney(sanitizeMoney(input.amount));
  const scheduledAt = safeDate(input.transferDate);
  const schedule: GiftCashflowRow[] = [
    {
      period: 1,
      amount,
      scheduledAt: scheduledAt ? formatYearMonth(scheduledAt) : undefined,
      guaranteed: false,
    },
  ];

  return {
    input,
    kind: input.kind,
    periods: 1,
    schedule,
    totalAmount: amount,
    monthlyEquivalent: 0,
    guaranteed: false,
    warnings: amount === 0 ? ["Eenmalige schenking is nul of ongeldig; geen cashflow opgenomen."] : [],
  };
}

function buildRecurringGiftResult(
  input: Extract<GiftInput, { kind: "recurring" }>,
): GiftCashflowResult {
  const amountPerPeriod = roundMoney(sanitizeMoney(input.amountPerPeriod));
  const periods = Math.max(countRecurringPayments(input), 0);
  const stepMonths = frequencyToMonths(input.frequency);
  const startDate = safeDate(input.startDate);
  const schedule: GiftCashflowRow[] = [];
  let totalAmount = 0;
  const warnings: string[] = [];

  if (!input.maxPayments && !(input.startDate && input.endDate)) {
    warnings.push(
      "Periodieke schenking zonder eindmoment of maxPayments is indicatief op 12 perioden gezet.",
    );
  }

  if (periods === 0) {
    warnings.push("Periodieke schenking heeft geen geldige looptijd.");
  }

  for (let period = 1; period <= periods; period += 1) {
    const scheduledAt = startDate ? formatYearMonth(addMonths(startDate, (period - 1) * stepMonths)) : undefined;
    schedule.push({
      period,
      amount: amountPerPeriod,
      scheduledAt,
      guaranteed: false,
    });
    totalAmount = roundMoney(totalAmount + amountPerPeriod);
  }

  const monthlyEquivalent = roundMoney(amountPerPeriod / stepMonths);

  return {
    input,
    kind: input.kind,
    periods,
    schedule,
    totalAmount,
    monthlyEquivalent,
    guaranteed: false,
    warnings,
  };
}

export function calculateGiftCashflows(input: GiftInput): GiftCashflowResult {
  if (input.kind === "one-time") {
    return buildOneTimeGiftResult(input);
  }

  return buildRecurringGiftResult(input);
}
