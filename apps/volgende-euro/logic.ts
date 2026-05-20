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
};

export type VolgendeEuroResult = {
  year: number;
  topRecommendation: PriorityOption;
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
  warnings: string[];
};

type InternalCandidate = {
  key: PriorityOptionKey;
  title: string;
  score: number;
  amountNeeded?: number;
  currentAmount?: number;
  targetAmount?: number;
  whyThisStep: string;
  whyBeforeNext: string;
  nextTrigger: string;
};

const STEP_TITLES: Record<PriorityOptionKey, string> = {
  buffer: "Buffer aanvullen",
  expensiveDebt: "Dure schuld aflossen",
  studentDebtExtra: "Studieschuld extra aflossen",
  mortgagePrepay: "Hypotheek extra aflossen",
  pensionJaarruimte: "Jaarruimte benutten",
  freeInvesting: "Vrij beleggen",
  housingOwnFunds: "Eigen geld voor woning",
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

function roundMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(Math.round(value as number), 0);
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

function getRiskAdjustment(riskProfile: RiskProfile | undefined) {
  if (riskProfile === "conservative") {
    return { investing: -10, pension: 4 };
  }
  if (riskProfile === "offensive") {
    return { investing: 10, pension: -2 };
  }
  return { investing: 0, pension: 0 };
}

function getStatus(allocatedAmount: number, rank: number): PriorityPlanStatus {
  if (allocatedAmount > 0 && rank === 1) {
    return "nu doen";
  }
  if (allocatedAmount > 0) {
    return "daarna";
  }
  return "alleen bij extra ruimte";
}

function buildActionLabel(step: InternalCandidate) {
  const target = step.targetAmount;
  switch (step.key) {
    case "buffer":
      if (target !== undefined) {
        return `Vul je buffer aan tot €${target.toLocaleString("nl-NL")}`;
      }
      return "Vul je buffer aan";
    case "expensiveDebt":
      return "Los je dure schuld af tot €0";
    case "studentDebtExtra":
      return "Overweeg extra aflossen op je studieschuld";
    case "mortgagePrepay":
      return "Overweeg extra aflossen op je hypotheek";
    case "pensionJaarruimte":
      if (target !== undefined) {
        return `Vul je jaarruimte tot €${target.toLocaleString("nl-NL")}`;
      }
      return "Overweeg pensioeninleg via jaarruimte";
    case "freeInvesting":
      return "Beleg het resterende bedrag voor de lange termijn";
    case "housingOwnFunds":
      if (target !== undefined) {
        return `Bouw eigen geld op richting €${target.toLocaleString("nl-NL")}`;
      }
      return "Bouw eigen geld op voor je woningdoel";
    default:
      return "Kies de volgende logische stap";
  }
}

function getLegacyRiskNote(step: PriorityPlanStep) {
  if (step.key === "buffer") {
    return "Hoge flexibiliteit: direct beschikbaar geld.";
  }
  if (step.key === "expensiveDebt") {
    return "Zekere kostenbesparing door dure rente te stoppen.";
  }
  if (step.key === "freeInvesting") {
    return "Meer groeipotentieel, maar ook meer marktrisico.";
  }
  if (step.key === "pensionJaarruimte") {
    return "Fiscaal voordeel kan sterk zijn, flexibiliteit is lager.";
  }
  return "Gebruik dit als startpunt en reken daarna verder door.";
}

function planToPriorityOption(step: PriorityPlanStep): PriorityOption {
  const impliedScore =
    step.status === "nu doen"
      ? 90 - (step.rank - 1) * 8
      : step.status === "daarna"
        ? 70 - (step.rank - 1) * 6
        : 45 - (step.rank - 1) * 4;
  const score = clampScore(impliedScore);
  return {
    key: step.key,
    label: step.title,
    score,
    bucket: toBucket(score),
    reason: step.whyThisStep,
    riskFlexNote: getLegacyRiskNote(step),
  };
}

function byCandidatePriority(a: InternalCandidate, b: InternalCandidate) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  return a.title.localeCompare(b.title, "nl-NL");
}

export function calculateVolgendeEuroPriorities(
  input: VolgendeEuroInput,
): VolgendeEuroResult {
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
  const expectedAnnualReturn = sanitizePercent(input.expectedAnnualReturn) ?? 5;
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

  const candidates: InternalCandidate[] = [];

  const hasBufferContext = input.currentBuffer !== undefined || input.targetBuffer !== undefined;
  const bufferGap = Math.max(targetBuffer - currentBuffer, 0);
  if (hasBufferContext) {
    const bufferScore = clampScore(
      bufferGap > 0 ? 96 + Math.min(Math.round((bufferGap / Math.max(extraAmount, 1)) * 8), 4) : 38,
    );
    candidates.push({
      key: "buffer",
      title: STEP_TITLES.buffer,
      score: bufferScore,
      currentAmount: currentBuffer,
      targetAmount: targetBuffer,
      amountNeeded: bufferGap,
      whyThisStep:
        bufferGap > 0
          ? "Je buffer zit onder je doelbedrag. Zonder buffer kunnen onverwachte kosten je plan direct verstoren."
          : "Je buffer is al op orde. Je hoeft hier nu niet als eerste extra geld te plaatsen.",
      whyBeforeNext:
        bufferGap > 0
          ? "Een stabiele buffer voorkomt dat je later moet lenen of beleggingen op een slecht moment verkoopt."
          : "Omdat je buffer op orde is, kan je extra geld daarna sneller naar schuldafbouw of groei gaan.",
      nextTrigger:
        bufferGap > 0
          ? `Ga door naar de volgende stap zodra je buffer ongeveer €${targetBuffer.toLocaleString("nl-NL")} is.`
          : "Volgende stap: kijk naar dure schuld, studieschuld of langetermijndoelen.",
    });
  }

  const expensiveDebtRelevant = hasExpensiveDebt && expensiveDebtAmount > 0;
  if (expensiveDebtRelevant) {
    const debtScore = clampScore(88 + (expensiveDebtRate >= 8 ? 8 : expensiveDebtRate >= 7 ? 4 : 0));
    candidates.push({
      key: "expensiveDebt",
      title: STEP_TITLES.expensiveDebt,
      score: debtScore,
      currentAmount: expensiveDebtAmount,
      targetAmount: 0,
      amountNeeded: expensiveDebtAmount,
      whyThisStep:
        expensiveDebtRate >= 8
          ? `Je dure schuld kost ongeveer ${expensiveDebtRate.toFixed(1)}% rente. Dat is een zekere en hoge kostenpost.`
          : `Je dure schuld kost ongeveer ${expensiveDebtRate.toFixed(1)}% rente en drukt je maandruimte.`,
      whyBeforeNext:
        "Rente op dure schuld is direct verlies. Eerst aflossen geeft meestal een zekerder effect dan beleggen.",
      nextTrigger: "Als deze schuld is afgebouwd, kun je het volgende bedrag inzetten voor groei of andere doelen.",
    });
  }

  if (studentDebtAmount > 0) {
    const studentDebtScore = clampScore(
      48 + (duoRate >= 4 ? 10 : duoRate <= 2.5 ? -8 : 0) + (hasHousingGoal ? 6 : 0),
    );
    candidates.push({
      key: "studentDebtExtra",
      title: STEP_TITLES.studentDebtExtra,
      score: studentDebtScore,
      currentAmount: studentDebtAmount,
      whyThisStep:
        duoRate <= 2.5
          ? `Je DUO-rente is laag (${duoRate.toFixed(2)}%). Extra aflossen is daarom niet automatisch je eerste stap.`
          : `Je DUO-rente is ${duoRate.toFixed(2)}%. Extra aflossen kan dan sneller interessant worden.`,
      whyBeforeNext:
        hasHousingGoal
          ? "Bij een woningdoel kan minder studieschuld helpen, maar houd eerst je basisbuffer en dure schuld in de gaten."
          : "Deze stap komt vaak na buffer en dure schuld, omdat die meestal directer effect hebben.",
      nextTrigger: `Indicatief wettelijk DUO-bedrag is ongeveer €${roundMoney(
        estimatedStatutoryMonthlyPayment,
      ).toLocaleString("nl-NL")} per maand; extra aflossen is daarboven vrijwillig.`,
    });
  }

  if (mortgageRate > 0) {
    const mortgageScore = clampScore(44 + (mortgageRate >= 5 ? 8 : mortgageRate >= 4 ? 4 : 0));
    candidates.push({
      key: "mortgagePrepay",
      title: STEP_TITLES.mortgagePrepay,
      score: mortgageScore,
      whyThisStep: `Je hypotheekrente is ongeveer ${mortgageRate.toFixed(
        2,
      )}%. Extra aflossen kan rust en lagere rentelasten geven.`,
      whyBeforeNext:
        "Deze stap hangt af van je flexibiliteit: aflossen geeft zekerheid, beleggen houdt je geld vrij opneembaar.",
      nextTrigger: "Reken deze keuze door met je hypotheekschuld, renteaftrek en gewenste buffer.",
    });
  }

  if (availableJaarruimte > 0) {
    const pensionScore = clampScore(58 + riskAdjustment.pension - (bufferGap > 0 ? 14 : 0));
    candidates.push({
      key: "pensionJaarruimte",
      title: STEP_TITLES.pensionJaarruimte,
      score: pensionScore,
      currentAmount: 0,
      targetAmount: availableJaarruimte,
      amountNeeded: availableJaarruimte,
      whyThisStep:
        "Jaarruimte kan fiscaal voordeel geven doordat je nu mogelijk minder belasting betaalt op inleg.",
      whyBeforeNext:
        bufferGap > 0
          ? "Eerst je buffer op orde houden is meestal veiliger; daarna wordt pensioeninleg logischer."
          : "Als je basis op orde is, kan jaarruimte een sterke vervolgstap zijn naast vrij beleggen.",
      nextTrigger: `Deze stap loopt tot ongeveer €${availableJaarruimte.toLocaleString(
        "nl-NL",
      )} inleg binnen je beschikbare jaarruimte.`,
    });
  }

  const investingSignal =
    (input.horizonYears !== undefined && horizonYears > 0) ||
    input.expectedAnnualReturn !== undefined ||
    input.riskProfile !== undefined;
  if (investingSignal) {
    const investingScore = clampScore(
      42 +
        (horizonYears >= 15 ? 16 : horizonYears >= 10 ? 8 : 2) +
        (expectedAnnualReturn >= 6 ? 8 : 2) +
        riskAdjustment.investing +
        (bufferGap > 0 ? -16 : 0) +
        (expensiveDebtRelevant && expensiveDebtRate >= 7 ? -14 : 0),
    );
    candidates.push({
      key: "freeInvesting",
      title: STEP_TITLES.freeInvesting,
      score: investingScore,
      whyThisStep:
        "Vrij beleggen is vooral logisch voor de lange termijn, nadat je buffer en dure schuld op orde zijn.",
      whyBeforeNext:
        "Beleggen kan meer opleveren, maar heeft risico. Daarom staat het meestal niet vóór basisveiligheid.",
      nextTrigger: `Met een horizon van ${horizonYears} jaar kun je resterende ruimte daarna gericht spreiden naar beleggingen.`,
    });
  }

  const housingInputPresent =
    hasHousingGoal && (input.targetHomePrice !== undefined || input.ownFunds !== undefined);
  if (housingInputPresent) {
    const targetOwnFunds = roundMoney(targetHomePrice * 0.1);
    const housingGap = Math.max(targetOwnFunds - ownFunds, 0);
    const housingScore = clampScore(56 + (housingGap > 0 ? 12 : 0) - (bufferGap > 0 ? 8 : 0));
    candidates.push({
      key: "housingOwnFunds",
      title: STEP_TITLES.housingOwnFunds,
      score: housingScore,
      currentAmount: ownFunds,
      targetAmount: targetOwnFunds,
      amountNeeded: housingGap,
      whyThisStep:
        housingGap > 0
          ? "Voor een woning heb je meestal eigen geld nodig. Deze stap helpt dat doel gericht op te bouwen."
          : "Je eigen geld lijkt al dicht bij je indicatieve doel voor aankoopkosten te liggen.",
      whyBeforeNext:
        "Als je binnen enkele jaren wilt kopen, geeft extra eigen geld vaak meer onderhandelruimte en lagere maandlasten.",
      nextTrigger:
        housingGap > 0
          ? `Indicatief doel eigen geld: ongeveer €${targetOwnFunds.toLocaleString("nl-NL")} (10% van koopprijs).`
          : "Volgende stap: houd je buffer op peil en weeg daarna beleggen of aflossen.",
    });
  }

  const sortedCandidates = candidates.sort(byCandidatePriority);
  const priorityPlan: PriorityPlanStep[] = [];
  let remaining = extraAmount;

  for (const candidate of sortedCandidates) {
    const needed = candidate.amountNeeded !== undefined ? roundMoney(candidate.amountNeeded) : undefined;
    let allocated = 0;
    if (remaining > 0) {
      if (needed !== undefined) {
        allocated = Math.min(remaining, needed);
      } else if (candidate.key === "freeInvesting") {
        allocated = remaining;
      }
    }
    remaining = roundMoney(remaining - allocated);
    const rank = priorityPlan.length + 1;
    const status = getStatus(allocated, rank);

    priorityPlan.push({
      rank,
      key: candidate.key,
      title: candidate.title,
      actionLabel: buildActionLabel(candidate),
      currentAmount: candidate.currentAmount !== undefined ? roundMoney(candidate.currentAmount) : undefined,
      targetAmount: candidate.targetAmount !== undefined ? roundMoney(candidate.targetAmount) : undefined,
      amountNeeded: needed,
      allocatedAmount: allocated,
      remainingAfterStep: remaining,
      status,
      whyThisStep: candidate.whyThisStep,
      whyBeforeNext: candidate.whyBeforeNext,
      nextTrigger: candidate.nextTrigger,
    });
  }

  const fallbackStep: PriorityPlanStep = {
    rank: 1,
    key: "buffer",
    title: STEP_TITLES.buffer,
    actionLabel: "Vul eerst basisgegevens in om je prioriteiten te zien",
    allocatedAmount: 0,
    remainingAfterStep: extraAmount,
    status: "niet relevant",
    whyThisStep: "Er is nog te weinig relevante invoer om een prioriteitenladder te maken.",
    whyBeforeNext: "Vul minimaal je buffer, schuld of horizon in voor een bruikbare volgorde.",
    nextTrigger: "Start met het veld 'huidige buffer' en 'gewenste buffer'.",
  };

  const effectivePlan = priorityPlan.length > 0 ? priorityPlan : [fallbackStep];
  const priorities = effectivePlan.map(planToPriorityOption);
  const topRecommendation = priorities[0];

  return {
    year,
    topRecommendation,
    topThree: priorities.slice(0, 3),
    priorities,
    priorityPlan: effectivePlan,
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
      "Gebruik dit stappenplan als startpunt en reken belangrijke keuzes daarna door in de verdiepende tools.",
    ],
  };
}
