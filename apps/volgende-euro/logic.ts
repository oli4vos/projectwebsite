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

export type PriorityApplicability = "relevant" | "insufficientData" | "notApplicable";

export type PriorityPlanStatus =
  | "nu doen"
  | "daarna"
  | "alleen bij extra ruimte"
  | "niet relevant";

export type PriorityPlanStep = {
  rank: number;
  key: PriorityOptionKey;
  title: string;
  actionLabel: string;
  currentAmount?: number;
  targetAmount?: number;
  amountNeeded?: number;
  allocatedAmount?: number;
  remainingAfterStep?: number;
  status: PriorityPlanStatus;
  whyThisStep: string;
  whyBeforeNext: string;
  nextTrigger: string;
  applicability: PriorityApplicability;
  missingFields?: string[];
};

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
  applicability: PriorityApplicability;
  missingFields?: string[];
};

export type VolgendeEuroResult = {
  year: number;
  topRecommendation: PriorityOption | null;
  topThree: PriorityOption[];
  priorities: PriorityOption[];
  priorityPlan: PriorityPlanStep[];
  duoContext: {
    assumedRate: number;
    estimatedStatutoryMonthlyPayment: number;
  };
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  missingDataHints: string[];
  warnings: string[];
};

type Candidate = {
  key: PriorityOptionKey;
  title: string;
  score: number;
  whyThisStep: string;
  whyBeforeNext: string;
  nextTrigger: string;
  actionLabel: string;
  amountNeeded?: number;
  currentAmount?: number;
  targetAmount?: number;
  applicability: PriorityApplicability;
  missingFields?: string[];
};

const TITLES: Record<PriorityOptionKey, string> = {
  buffer: "Buffer aanvullen",
  expensiveDebt: "Dure schuld aflossen",
  studentDebtExtra: "Studieschuld extra aflossen",
  mortgagePrepay: "Hypotheek extra aflossen",
  pensionJaarruimte: "Jaarruimte benutten",
  freeInvesting: "Vrij beleggen",
  housingOwnFunds: "Eigen geld voor woning",
};

function hasValue(value: unknown) {
  return value !== undefined && value !== null;
}

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(value as number, 0);
}
function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) return undefined;
  return Math.min(Math.max(value as number, 0), 100);
}
function sanitizeYears(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.round(value as number), 0), 60);
}
function sanitizeYear(value: number | undefined) {
  if (!Number.isFinite(value)) return getDefaultFinancialYear();
  const rounded = Math.round(value as number);
  return rounded < 2000 || rounded > 2200 ? getDefaultFinancialYear() : rounded;
}
function roundMoney(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(Math.round(value as number), 0);
}
function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.round(value), 0), 100);
}
function toBucket(score: number): PriorityBucket {
  if (score >= 80) return "eerst doen";
  if (score >= 60) return "daarna overwegen";
  if (score >= 40) return "alleen als...";
  return "minder logisch nu";
}
function getRiskAdjustment(riskProfile: RiskProfile | undefined) {
  if (riskProfile === "conservative") return { investing: -10, pension: 4 };
  if (riskProfile === "offensive") return { investing: 10, pension: -2 };
  return { investing: 0, pension: 0 };
}
function byScoreDesc(a: Candidate, b: Candidate) {
  if (b.score !== a.score) return b.score - a.score;
  return a.title.localeCompare(b.title, "nl-NL");
}
function getLegacyRiskNote(key: PriorityOptionKey) {
  if (key === "buffer") return "Hoge flexibiliteit: direct beschikbaar geld.";
  if (key === "expensiveDebt") return "Zekere kostenbesparing door dure rente te stoppen.";
  if (key === "freeInvesting") return "Meer groeipotentieel, maar ook marktrisico.";
  if (key === "pensionJaarruimte") return "Fiscaal voordeel kan sterk zijn, flexibiliteit is lager.";
  return "Gebruik dit als routehulp en reken daarna verder door.";
}

export function calculateVolgendeEuroPriorities(input: VolgendeEuroInput): VolgendeEuroResult {
  const year = sanitizeYear(input.year);
  const constants = getFinancialConstants(year);
  const extraAmount = roundMoney(sanitizeMoney(input.extraAmount));
  const currentBuffer = roundMoney(sanitizeMoney(input.currentBuffer));
  const targetBuffer = roundMoney(sanitizeMoney(input.targetBuffer));
  const hasExpensiveDebt = Boolean(input.hasExpensiveDebt);
  const expensiveDebtRate = sanitizePercent(input.expensiveDebtRate) ?? 0;
  const expensiveDebtAmount = roundMoney(sanitizeMoney(input.expensiveDebtAmount));
  const studentDebtAmount = roundMoney(sanitizeMoney(input.studentDebtAmount));
  const duoRate = sanitizePercent(input.duoRate) ?? getDuoRateForRule("SF35", year);
  const mortgageRate = sanitizePercent(input.mortgageRate) ?? 0;
  const availableJaarruimte = roundMoney(sanitizeMoney(input.availableJaarruimte));
  const horizonYears = sanitizeYears(input.horizonYears);
  const expectedAnnualReturn = sanitizePercent(input.expectedAnnualReturn) ?? 0;
  const hasHousingGoal = Boolean(input.hasHousingGoal);
  const riskProfile = input.riskProfile ?? "neutral";
  const targetHomePrice = roundMoney(sanitizeMoney(input.targetHomePrice));
  const ownFunds = roundMoney(sanitizeMoney(input.ownFunds));
  const riskAdjustment = getRiskAdjustment(riskProfile);

  const estimatedStatutoryMonthlyPayment =
    studentDebtAmount > 0
      ? calculateStatutoryDuoMonthlyPayment({
          remainingDebt: studentDebtAmount,
          annualInterestRate: duoRate,
          remainingTermYears: 35,
          repaymentRule: "SF35",
        })
      : 0;

  const candidates: Candidate[] = [];
  const missingHints = new Set<string>();

  const bufferCurrentGiven = hasValue(input.currentBuffer);
  const bufferTargetGiven = hasValue(input.targetBuffer);
  if (bufferCurrentGiven && bufferTargetGiven) {
    const gap = Math.max(targetBuffer - currentBuffer, 0);
    candidates.push({
      key: "buffer",
      title: TITLES.buffer,
      score: gap > 0 ? 96 : 30,
      amountNeeded: gap,
      currentAmount: currentBuffer,
      targetAmount: targetBuffer,
      applicability: "relevant",
      actionLabel:
        gap > 0
          ? `Vul je buffer aan tot €${targetBuffer.toLocaleString("nl-NL")}`
          : "Houd je buffer op peil",
      whyThisStep:
        gap > 0
          ? "Je buffer zit onder je doel. Zonder buffer kunnen onverwachte kosten je hele plan verstoren."
          : "Je buffer is op orde. Deze stap blijft als behoudsstap onder beleggings- of afloskeuzes.",
      whyBeforeNext:
        gap > 0
          ? "Eerst buffer maakt de rest stabieler, omdat je niet direct hoeft te lenen of beleggingen te verkopen."
          : "Omdat je buffer al op orde is, hoeft deze stap nu niet vooraan te staan.",
      nextTrigger: gap > 0 ? "Ga door zodra je bufferdoel is gehaald." : "Controleer periodiek of je buffer op peil blijft.",
    });
  } else if (bufferCurrentGiven || bufferTargetGiven) {
    candidates.push({
      key: "buffer",
      title: TITLES.buffer,
      score: 0,
      applicability: "insufficientData",
      missingFields: [
        !bufferCurrentGiven ? "huidige buffer" : "",
        !bufferTargetGiven ? "gewenste buffer" : "",
      ].filter(Boolean),
      actionLabel: "Vul huidige en gewenste buffer in",
      whyThisStep: "Buffer is nog niet goed te beoordelen.",
      whyBeforeNext: "Zonder buffercontext is de prioriteitenvolgorde minder betrouwbaar.",
      nextTrigger: "Vul beide buffervelden in.",
    });
    missingHints.add("Vul huidige en gewenste buffer in.");
  }

  const debtRateGiven = hasValue(input.expensiveDebtRate);
  const debtAmountGiven = hasValue(input.expensiveDebtAmount);
  if (hasExpensiveDebt) {
    if (debtRateGiven || debtAmountGiven) {
      const score = clampScore(84 + (expensiveDebtRate >= 8 ? 10 : 0));
      candidates.push({
        key: "expensiveDebt",
        title: TITLES.expensiveDebt,
        score,
        applicability: expensiveDebtAmount > 0 ? "relevant" : "insufficientData",
        missingFields: expensiveDebtAmount > 0 ? undefined : ["bedrag dure schuld"],
        amountNeeded: expensiveDebtAmount > 0 ? expensiveDebtAmount : undefined,
        targetAmount: expensiveDebtAmount > 0 ? 0 : undefined,
        currentAmount: expensiveDebtAmount > 0 ? expensiveDebtAmount : undefined,
        actionLabel: "Los je dure schuld af tot €0",
        whyThisStep: `Dure schuld met ${expensiveDebtRate.toFixed(1)}% rente is een zekere kostenpost.`,
        whyBeforeNext: "Deze rente stopt direct als je aflost; dat effect is vaak zekerder dan verwacht beleggingsrendement.",
        nextTrigger: "Ga door naar volgende stap zodra deze schuld is afgebouwd.",
      });
      if (!(expensiveDebtAmount > 0)) {
        missingHints.add("Vul het bedrag van je dure schuld in.");
      }
    } else {
      candidates.push({
        key: "expensiveDebt",
        title: TITLES.expensiveDebt,
        score: 0,
        applicability: "insufficientData",
        missingFields: ["rente dure schuld", "bedrag dure schuld"],
        actionLabel: "Vul rente en bedrag van je dure schuld in",
        whyThisStep: "Je gaf aan dat je dure schuld hebt, maar gegevens ontbreken.",
        whyBeforeNext: "Zonder rente/bedrag kunnen we deze stap niet goed plaatsen.",
        nextTrigger: "Vul rente of schuldbedrag in.",
      });
      missingHints.add("Vul rente en bedrag van je dure schuld in.");
    }
  }

  if (hasValue(input.studentDebtAmount)) {
    if (studentDebtAmount > 0) {
      const score = clampScore(44 + (duoRate >= 4 ? 10 : duoRate <= 2.5 ? -8 : 0) + (hasHousingGoal ? 6 : 0));
      candidates.push({
        key: "studentDebtExtra",
        title: TITLES.studentDebtExtra,
        score,
        applicability: "relevant",
        currentAmount: studentDebtAmount,
        actionLabel: "Overweeg extra aflossen boven je verplichte DUO-bedrag",
        whyThisStep:
          duoRate <= 2.5
            ? `Bij lage DUO-rente (${duoRate.toFixed(2)}%) is extra aflossen niet automatisch de eerste stap.`
            : `Met DUO-rente van ${duoRate.toFixed(2)}% kan extra aflossen relevanter worden.`,
        whyBeforeNext: "Je verplichte DUO-betaling loopt sowieso door; de keuze gaat alleen over vrijwillig extra aflossen.",
        nextTrigger: `Je indicatieve wettelijke DUO-bedrag is ongeveer €${roundMoney(estimatedStatutoryMonthlyPayment).toLocaleString("nl-NL")} per maand.`,
      });
    }
  }

  if (hasValue(input.mortgageRate) && mortgageRate > 0) {
    candidates.push({
      key: "mortgagePrepay",
      title: TITLES.mortgagePrepay,
      score: clampScore(48 + (mortgageRate >= 5 ? 8 : 0)),
      applicability: "relevant",
      actionLabel: "Overweeg extra aflossen op je hypotheek",
      whyThisStep: `Met hypotheekrente van ${mortgageRate.toFixed(2)}% kan extra aflossen interessant zijn.`,
      whyBeforeNext: "Deze stap vraagt vergelijking met flexibiliteit, renteaftrek en alternatieven zoals beleggen.",
      nextTrigger: "Vul ook hypotheekschuld in een verdiepende tool voor een scherpere vergelijking.",
    });
  }

  if (hasValue(input.availableJaarruimte)) {
    if (availableJaarruimte > 0) {
      candidates.push({
        key: "pensionJaarruimte",
        title: TITLES.pensionJaarruimte,
        score: clampScore(56 + riskAdjustment.pension),
        applicability: "relevant",
        amountNeeded: availableJaarruimte,
        targetAmount: availableJaarruimte,
        currentAmount: 0,
        actionLabel: `Benut je jaarruimte tot €${availableJaarruimte.toLocaleString("nl-NL")}`,
        whyThisStep: "Jaarruimte kan nu fiscaal voordeel geven, maar het geld is minder flexibel beschikbaar.",
        whyBeforeNext: "Gebruik dit vooral nadat basisveiligheid (zoals buffer) op orde is.",
        nextTrigger: "Ga daarna verder met beleggen of andere doelen.",
      });
    }
  }

  const investingRelevant =
    (extraAmount > 0 || sanitizeMoney(input.monthlyFreeRoom) > 0) &&
    hasValue(input.horizonYears) &&
    hasValue(input.expectedAnnualReturn) &&
    horizonYears > 0;
  if (investingRelevant) {
    candidates.push({
      key: "freeInvesting",
      title: TITLES.freeInvesting,
      score: clampScore(52 + (horizonYears >= 15 ? 10 : 4) + (expectedAnnualReturn >= 6 ? 6 : 0) + riskAdjustment.investing),
      applicability: "relevant",
      actionLabel: "Beleg resterende ruimte voor de lange termijn",
      whyThisStep: "Beleggen wordt vooral logisch bij langere horizon en als basisveiligheid op orde is.",
      whyBeforeNext: "Potentieel hoger rendement gaat samen met marktrisico, dus deze stap komt vaak na buffer en dure schuld.",
      nextTrigger: "Gebruik deze stap zodra eerdere prioriteiten voldoende zijn gevuld.",
    });
  } else if (
    hasValue(input.horizonYears) ||
    hasValue(input.expectedAnnualReturn) ||
    extraAmount > 0 ||
    sanitizeMoney(input.monthlyFreeRoom) > 0
  ) {
    candidates.push({
      key: "freeInvesting",
      title: TITLES.freeInvesting,
      score: 0,
      applicability: "insufficientData",
      missingFields: [
        !hasValue(input.horizonYears) ? "beleggingshorizon" : "",
        !hasValue(input.expectedAnnualReturn) ? "verwacht rendement" : "",
      ].filter(Boolean),
      actionLabel: "Vul horizon en verwacht rendement in",
      whyThisStep: "Voor beleggen missen nog kerngegevens.",
      whyBeforeNext: "Zonder horizon en rendement blijft deze stap te algemeen.",
      nextTrigger: "Vul beide velden in voor een bruikbare belegstap.",
    });
    if (!hasValue(input.horizonYears) || !hasValue(input.expectedAnnualReturn)) {
      missingHints.add("Vul beleggingshorizon en verwacht rendement in.");
    }
  }

  const homePriceGiven = hasValue(input.targetHomePrice);
  const ownFundsGiven = hasValue(input.ownFunds);
  if (hasHousingGoal && homePriceGiven && ownFundsGiven) {
    if (targetHomePrice > ownFunds) {
      const targetOwnFunds = roundMoney(targetHomePrice * 0.1);
      const needed = Math.max(targetOwnFunds - ownFunds, 0);
      candidates.push({
        key: "housingOwnFunds",
        title: TITLES.housingOwnFunds,
        score: clampScore(58 + (needed > 0 ? 10 : 0)),
        applicability: "relevant",
        targetAmount: targetOwnFunds,
        currentAmount: ownFunds,
        amountNeeded: needed,
        actionLabel: `Bouw eigen geld op richting €${targetOwnFunds.toLocaleString("nl-NL")}`,
        whyThisStep: "Voor koop heb je vaak eigen geld nodig voor kosten en financiële ruimte.",
        whyBeforeNext: "Als je koopmoment dichterbij komt, weegt beschikbaar eigen geld vaak zwaarder dan extra risico nemen.",
        nextTrigger: "Dit doel is indicatief op 10% van je doelkoopprijs.",
      });
    }
  } else if (hasHousingGoal && (homePriceGiven || ownFundsGiven)) {
    candidates.push({
      key: "housingOwnFunds",
      title: TITLES.housingOwnFunds,
      score: 0,
      applicability: "insufficientData",
      missingFields: [
        !homePriceGiven ? "doel koopprijs" : "",
        !ownFundsGiven ? "eigen geld nu" : "",
      ].filter(Boolean),
      actionLabel: "Vul doel koopprijs en eigen geld in",
      whyThisStep: "Voor woningdoel missen nog kerngegevens.",
      whyBeforeNext: "Zonder beide velden is geen zinvolle inschatting mogelijk.",
      nextTrigger: "Vul beide velden in om deze stap mee te nemen.",
    });
    missingHints.add("Vul doel koopprijs en eigen geld in.");
  }

  const relevant = candidates.filter((item) => item.applicability === "relevant").sort(byScoreDesc);
  const nonRelevant = candidates.filter((item) => item.applicability !== "relevant");
  const priorityPlan: PriorityPlanStep[] = [];
  let remaining = extraAmount;

  for (const item of relevant) {
    const needed = item.amountNeeded !== undefined ? roundMoney(item.amountNeeded) : undefined;
    let allocated = 0;
    if (remaining > 0) {
      if (needed !== undefined) allocated = Math.min(remaining, needed);
      else if (item.key === "freeInvesting") allocated = remaining;
    }
    remaining = roundMoney(remaining - allocated);
    const rank = priorityPlan.length + 1;
    priorityPlan.push({
      rank,
      key: item.key,
      title: item.title,
      actionLabel: item.actionLabel,
      currentAmount: item.currentAmount !== undefined ? roundMoney(item.currentAmount) : undefined,
      targetAmount: item.targetAmount !== undefined ? roundMoney(item.targetAmount) : undefined,
      amountNeeded: needed,
      allocatedAmount: allocated,
      remainingAfterStep: remaining,
      status: allocated > 0 ? (rank === 1 ? "nu doen" : "daarna") : "alleen bij extra ruimte",
      whyThisStep: item.whyThisStep,
      whyBeforeNext: item.whyBeforeNext,
      nextTrigger: item.nextTrigger,
      applicability: "relevant",
    });
  }

  const priorities: PriorityOption[] = [
    ...priorityPlan.map((step) => {
      const score = clampScore(92 - (step.rank - 1) * 10);
      return {
        key: step.key,
        label: step.title,
        score,
        bucket: toBucket(score),
        reason: step.whyThisStep,
        riskFlexNote: getLegacyRiskNote(step.key),
        applicability: "relevant" as const,
      };
    }),
    ...nonRelevant.map((item) => ({
      key: item.key,
      label: item.title,
      score: 0,
      bucket: "minder logisch nu" as const,
      reason: item.whyThisStep,
      riskFlexNote: getLegacyRiskNote(item.key),
      applicability: item.applicability,
      missingFields: item.missingFields,
    })),
  ];

  const topRecommendation = priorities.find((item) => item.applicability === "relevant") ?? null;

  return {
    year,
    topRecommendation,
    topThree: priorities.filter((item) => item.applicability === "relevant").slice(0, 3),
    priorities,
    priorityPlan,
    duoContext: {
      assumedRate: duoRate,
      estimatedStatutoryMonthlyPayment: roundMoney(estimatedStatutoryMonthlyPayment),
    },
    assumptions: {
      sourceLabel: constants.mortgage.meta.sourceLabel,
      lastChecked: constants.mortgage.meta.lastChecked,
      status: constants.mortgage.meta.status,
    },
    missingDataHints: Array.from(missingHints).slice(0, 3),
    warnings: [
      "Deze beslis-tool is educatief en geeft geen persoonlijk financieel advies.",
      "Gebruik dit stappenplan als startpunt en reken belangrijke keuzes daarna door in de verdiepende tools.",
    ],
  };
}
