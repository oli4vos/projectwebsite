import { calculateStatutoryDuoMonthlyPayment } from "@/lib/duo";
import {
  getDefaultFinancialYear,
  getDuoRateForRule,
  getFinancialConstants,
} from "@/lib/financial-constants";
import type { RiskProfile } from "@/lib/user-profile";

export type PriorityBucket =
  | "eerst doen"
  | "daarna overwegen"
  | "alleen als..."
  | "minder logisch nu";

export type PriorityOptionKey =
  | "buffer"
  | "expensiveDebt"
  | "studentDebtExtra"
  | "mortgagePrepay"
  | "pensionJaarruimte"
  | "freeInvesting"
  | "housingOwnFunds";

export type VolgendeEuroInput = {
  year?: number;
  extraAmount?: number;
  monthlyFreeRoom?: number;
  currentBuffer?: number;
  targetBuffer?: number;
  hasExpensiveDebt?: boolean;
  expensiveDebtRate?: number;
  expensiveDebtAmount?: number;
  studentDebtAmount?: number;
  duoRate?: number;
  mortgageRate?: number;
  availableJaarruimte?: number;
  horizonYears?: number;
  expectedAnnualReturn?: number;
  hasHousingGoal?: boolean;
  riskProfile?: RiskProfile;
  targetHomePrice?: number;
  ownFunds?: number;
};

export type PriorityOption = {
  key: PriorityOptionKey;
  label: string;
  score: number;
  bucket: PriorityBucket;
  reason: string;
  riskFlexNote: string;
};

export type VolgendeEuroResult = {
  year: number;
  topRecommendation: PriorityOption;
  topThree: PriorityOption[];
  priorities: PriorityOption[];
  duoContext: {
    assumedRate: number;
    estimatedStatutoryMonthlyPayment: number;
  };
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYears(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 10;
  }
  return Math.min(Math.max(Math.round(value as number), 1), 60);
}

function sanitizeYear(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(Math.round(value), 0);
}

function toBucket(score: number): PriorityBucket {
  if (score >= 80) {
    return "eerst doen";
  }
  if (score >= 60) {
    return "daarna overwegen";
  }
  if (score >= 40) {
    return "alleen als...";
  }
  return "minder logisch nu";
}

function byScoreDesc(left: PriorityOption, right: PriorityOption) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }
  return left.label.localeCompare(right.label, "nl-NL");
}

function getRiskAdjustment(riskProfile: RiskProfile | undefined) {
  if (riskProfile === "conservative") {
    return { investing: -12, pension: 6 };
  }
  if (riskProfile === "offensive") {
    return { investing: 10, pension: -2 };
  }
  return { investing: 0, pension: 0 };
}

export function calculateVolgendeEuroPriorities(
  input: VolgendeEuroInput,
): VolgendeEuroResult {
  const year = sanitizeYear(input.year);
  const constants = getFinancialConstants(year);
  const extraAmount = sanitizeMoney(input.extraAmount);
  const monthlyFreeRoom = sanitizeMoney(input.monthlyFreeRoom);
  const currentBuffer = sanitizeMoney(input.currentBuffer);
  const targetBuffer = sanitizeMoney(input.targetBuffer);
  const hasExpensiveDebt = Boolean(input.hasExpensiveDebt);
  const expensiveDebtRate = sanitizePercent(input.expensiveDebtRate) ?? 0;
  const expensiveDebtAmount = sanitizeMoney(input.expensiveDebtAmount);
  const studentDebtAmount = sanitizeMoney(input.studentDebtAmount);
  const duoRate = sanitizePercent(input.duoRate) ?? getDuoRateForRule("SF35", year);
  const mortgageRate = sanitizePercent(input.mortgageRate) ?? 0;
  const availableJaarruimte = sanitizeMoney(input.availableJaarruimte);
  const horizonYears = sanitizeYears(input.horizonYears);
  const expectedAnnualReturn = sanitizePercent(input.expectedAnnualReturn) ?? 5;
  const hasHousingGoal = Boolean(input.hasHousingGoal);
  const riskProfile = input.riskProfile ?? "neutral";
  const targetHomePrice = sanitizeMoney(input.targetHomePrice);
  const ownFunds = sanitizeMoney(input.ownFunds);
  const riskAdjustment = getRiskAdjustment(riskProfile);

  const bufferGap = Math.max(targetBuffer - currentBuffer, 0);
  const hasBufferGap = bufferGap > 0;
  const housingOwnFundsGap =
    hasHousingGoal && targetHomePrice > 0
      ? Math.max(targetHomePrice * 0.1 - ownFunds, 0)
      : 0;

  const estimatedStatutoryMonthlyPayment =
    studentDebtAmount > 0
      ? calculateStatutoryDuoMonthlyPayment({
          remainingDebt: studentDebtAmount,
          annualInterestRate: duoRate,
          remainingTermYears: 35,
          repaymentRule: "SF35",
        })
      : 0;

  const options: PriorityOption[] = [];

  const bufferScore = hasBufferGap
    ? clampScore(78 + Math.min((bufferGap / Math.max(extraAmount, 1)) * 15, 20))
    : clampScore(30 + (monthlyFreeRoom > 0 ? 5 : 0));
  options.push({
    key: "buffer",
    label: "Buffer aanvullen",
    score: bufferScore,
    bucket: toBucket(bufferScore),
    reason: hasBufferGap
      ? `Je buffer ligt circa ${Math.round(bufferGap)} euro onder je doel; dat maakt tegenvallers direct risicovoller.`
      : "Je buffer zit rond of boven je doel; behoud is wel belangrijk.",
    riskFlexNote:
      "Hoge flexibiliteit: direct beschikbaar geld voorkomt dat je bij tegenvallers moet verkopen of lenen.",
  });

  const expensiveDebtIsRelevant = hasExpensiveDebt && expensiveDebtAmount > 0;
  const expensiveDebtScore = expensiveDebtIsRelevant
    ? clampScore(62 + expensiveDebtRate * 4 + (expensiveDebtRate >= 8 ? 10 : 0))
    : 18;
  options.push({
    key: "expensiveDebt",
    label: "Dure schuld aflossen",
    score: expensiveDebtScore,
    bucket: toBucket(expensiveDebtScore),
    reason: expensiveDebtIsRelevant
      ? `Je hebt dure schuld met circa ${expensiveDebtRate.toFixed(2)}% rente; dat drukt vaak harder dan verwacht beleggingsrendement.`
      : "Geen duidelijke dure consumptieve schuld ingevuld.",
    riskFlexNote:
      "Aflossen verlaagt renterisico direct, maar geld is daarna minder vrij opneembaar.",
  });

  const studentDebtScore =
    studentDebtAmount > 0
      ? clampScore(
          34 +
            (duoRate >= 4 ? 12 : duoRate <= 2.5 ? -8 : 0) +
            (hasBufferGap ? -14 : 0) +
            (hasHousingGoal ? 8 : 0),
        )
      : 10;
  options.push({
    key: "studentDebtExtra",
    label: "Studieschuld extra aflossen",
    score: studentDebtScore,
    bucket: toBucket(studentDebtScore),
    reason:
      studentDebtAmount > 0
        ? `Bij circa ${duoRate.toFixed(2)}% DUO-rente is extra aflossen niet automatisch top; indicatief wettelijk maandbedrag is ongeveer ${Math.round(estimatedStatutoryMonthlyPayment)} euro.`
        : "Geen studieschuld ingevuld; extra aflossen is dan nu niet relevant.",
    riskFlexNote:
      "Extra aflossen verlaagt schuld, maar verkleint je vrije cash voor andere doelen.",
  });

  const mortgageScore =
    mortgageRate > 0
      ? clampScore(
          30 +
            mortgageRate * 7 +
            (mortgageRate >= 5 ? 10 : 0) +
            (hasBufferGap ? -10 : 0),
        )
      : 16;
  options.push({
    key: "mortgagePrepay",
    label: "Hypotheek extra aflossen",
    score: mortgageScore,
    bucket: toBucket(mortgageScore),
    reason:
      mortgageRate > 0
        ? `Met een hypotheekrente rond ${mortgageRate.toFixed(2)}% kan aflossen interessant zijn, maar vergelijk altijd met fiscale effecten en flexibiliteit.`
        : "Geen hypotheekrente ingevuld; prioriteit blijft hierdoor laag.",
    riskFlexNote:
      "Aflossen verlaagt maandlasten op termijn, maar geld zit vast in stenen.",
  });

  const pensionScore =
    availableJaarruimte > 0
      ? clampScore(
          45 +
            (expectedAnnualReturn >= 5 ? 6 : 0) +
            riskAdjustment.pension +
            (hasBufferGap ? -15 : 0),
        )
      : 22;
  options.push({
    key: "pensionJaarruimte",
    label: "Jaarruimte / pensioeninleg",
    score: pensionScore,
    bucket: toBucket(pensionScore),
    reason:
      availableJaarruimte > 0
        ? `Beschikbare jaarruimte is ingevuld (${Math.round(availableJaarruimte)} euro), dus fiscaal voordeel kan meespelen.`
        : "Geen beschikbare jaarruimte ingevuld; zonder ruimte is deze route beperkt.",
    riskFlexNote:
      "Fiscaal vaak sterk, maar lage flexibiliteit: geld staat vast tot latere uitkering.",
  });

  const investingScore = clampScore(
    32 +
      (horizonYears >= 15 ? 18 : horizonYears >= 8 ? 8 : 0) +
      (expectedAnnualReturn >= 6 ? 8 : 0) +
      riskAdjustment.investing +
      (hasBufferGap ? -20 : 0) +
      (expensiveDebtIsRelevant && expensiveDebtRate >= 7 ? -16 : 0),
  );
  options.push({
    key: "freeInvesting",
    label: "Vrij beleggen",
    score: investingScore,
    bucket: toBucket(investingScore),
    reason: `Horizon ${horizonYears} jaar en verwacht rendement ${expectedAnnualReturn.toFixed(2)}% maken beleggen vooral logisch als je buffer op orde is.`,
    riskFlexNote:
      "Hoge flexibiliteit en groeipotentieel, maar ook koersrisico en box 3-impact.",
  });

  const housingScore = hasHousingGoal
    ? clampScore(
        50 +
          (housingOwnFundsGap > 0 ? 20 : 0) +
          (hasBufferGap ? -12 : 0) +
          (targetHomePrice > 0 ? 5 : 0),
      )
    : 20;
  options.push({
    key: "housingOwnFunds",
    label: "Woningdoel / eigen geld",
    score: housingScore,
    bucket: toBucket(housingScore),
    reason: hasHousingGoal
      ? housingOwnFundsGap > 0
        ? `Voor je woningdoel lijkt indicatief nog circa ${Math.round(housingOwnFundsGap)} euro aan eigen geld te missen.`
        : "Je hebt een woningdoel en je eigen geldpositie lijkt al redelijk op koers."
      : "Geen woningdoel aangezet; andere doelen kunnen nu belangrijker zijn.",
    riskFlexNote:
      "Spaargeld voor woningdoel houdt keuzevrijheid richting koopmoment.",
  });

  const priorities = options.sort(byScoreDesc);
  const topRecommendation = priorities[0] ?? {
    key: "buffer" as const,
    label: "Buffer aanvullen",
    score: 0,
    bucket: "minder logisch nu" as const,
    reason: "Onvoldoende invoer voor een duidelijke prioriteit.",
    riskFlexNote: "Vul meer gegevens in voor een scherpere indicatie.",
  };
  const topThree = priorities.slice(0, 3);

  return {
    year,
    topRecommendation,
    topThree,
    priorities,
    duoContext: {
      assumedRate: duoRate,
      estimatedStatutoryMonthlyPayment: roundMoney(estimatedStatutoryMonthlyPayment),
    },
    assumptions: {
      sourceLabel: constants.mortgage.meta.sourceLabel,
      lastChecked: constants.mortgage.meta.lastChecked,
      status: constants.mortgage.meta.status,
    },
    warnings: [
      "Deze beslis-tool is educatief en geeft geen persoonlijk financieel advies.",
      "Gebruik de volgorde als indicatie en laat belangrijke beslissingen controleren door een adviseur.",
    ],
  };
}
