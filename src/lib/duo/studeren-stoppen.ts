import {
  getDuoRateForRule,
  getDuoDefaultTermForRule,
} from "@/lib/financial-constants";
import type {
  DuoIncomeBasedMonthlyPaymentResult,
  RepaymentRule,
} from "@/lib/duo/types";
import {
  calculateIndicativeIncomeBasedMonthlyPayment,
  calculateStatutoryDuoMonthlyPayment,
  sanitizeDuoPercent,
} from "@/lib/duo/calculations";

export type StudyLevel = "mbo34" | "hbo" | "university";

export type StudyDebtComponentKey =
  | "loan"
  | "collegegeldkrediet"
  | "basisbeurs"
  | "aanvullendeBeurs"
  | "reisproduct";

export type StudyStopScenarioKey =
  | "stop-now-no-diploma"
  | "stop-now-later-diploma"
  | "continue-to-diploma";

export type StudyStopInput = {
  calculationMonth?: string;
  studyLevel?: StudyLevel;
  currentLoanDebt?: number;
  currentCollegegeldkredietDebt?: number;
  currentBasisbeursDebt?: number;
  currentAanvullendeBeursDebt?: number;
  currentReisproductDebt?: number;
  monthlyLoan?: number;
  monthlyCollegegeldkrediet?: number;
  monthlyBasisbeurs?: number;
  monthlyAanvullendeBeurs?: number;
  monthlyReisproduct?: number;
  monthsUntilLaterDiploma?: number;
  monthsUntilContinueDiploma?: number;
  remainingDiplomaTermMonths?: number;
  repaymentRule?: RepaymentRule;
  duoRateYear?: number;
  annualStudyInterestRate?: number;
  annualRepaymentInterestRate?: number;
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  oneTimeExtraRepayment?: number;
  monthlyExtraRepayment?: number;
  aflosvrijeMonths?: number;
};

export type StudyDebtComponentState = {
  key: StudyDebtComponentKey;
  label: string;
  balance: number;
  giftEligible: boolean;
};

export type StudyDebtSnapshot = {
  loan: number;
  collegegeldkrediet: number;
  basisbeurs: number;
  aanvullendeBeurs: number;
  reisproduct: number;
  total: number;
  alwaysRepayable: number;
  prestatiebeurs: number;
  giftConvertible: number;
  uncertain: number;
};

export type StudyDebtTimelinePoint = {
  month: number;
  date: string;
  phase: "study" | "aanloop" | "repayment" | "gift-conversion";
  openingDebt: number;
  interest: number;
  studyAdditions: number;
  giftConversion: number;
  payment: number;
  closingDebt: number;
};

export type StudyRepaymentResult = {
  statutoryMonthlyPayment: number;
  incomeBasedMonthlyPayment?: number;
  usedMonthlyPayment: number;
  extraMonthlyRepayment: number;
  oneTimeExtraRepayment: number;
  aflosvrijeMonthsUsed: number;
  monthsToDebtFree: number;
  payoffDate: string | null;
  restschuld: number;
  finalDebt: number;
  totalPaid: number;
  totalInterest: number;
  timeline: StudyDebtTimelinePoint[];
};

export type StudyStopScenarioResult = {
  key: StudyStopScenarioKey;
  title: string;
  stopMonth: string;
  diplomaMonth?: string;
  diplomaDeadlineMonth?: string;
  monthsUntilStop: number;
  monthsUntilDiploma?: number;
  debtAtStop: StudyDebtSnapshot;
  debtAtRepaymentStart: StudyDebtSnapshot;
  debtAtDiploma?: StudyDebtSnapshot;
  timeline: StudyDebtTimelinePoint[];
  repayment: StudyRepaymentResult;
  warnings: string[];
  assumptions: string[];
};

export type StudyStopCalculationResult = {
  calculationMonth: string;
  studyLevel: StudyLevel;
  repaymentRule: RepaymentRule;
  duoRateYear: number;
  ruleVersion: string;
  annualStudyInterestRate: number;
  annualRepaymentInterestRate: number;
  remainingDiplomaTermMonths: number;
  diplomaDeadlineMonth: string;
  currentBalances: StudyDebtSnapshot;
  monthlyStudyAdditions: StudyDebtSnapshot;
  incomeBasedMonthlyPayment?: DuoIncomeBasedMonthlyPaymentResult;
  statutoryMonthlyPayment: number;
  scenarios: StudyStopScenarioResult[];
  warnings: string[];
  assumptions: string[];
  sources: Array<{
    key: string;
    title: string;
    organization: string;
    url: string;
    appliesTo: string;
    validityDate: string;
    consultedAt: string;
    regulation: string;
    ruleVersion: string;
    uncertainties: string[];
  }>;
};

export const STUDY_STOP_ENGINE_VERSION = "1.0.0";
export const STUDY_STOP_SOURCE_CHECKED_AT = "2026-07-13";

type YearMonth = {
  year: number;
  month: number;
};

const COMPONENT_LABELS: Record<StudyDebtComponentKey, string> = {
  loan: "Rentedragende lening",
  collegegeldkrediet: "Collegegeldkrediet",
  basisbeurs: "Basisbeurs",
  aanvullendeBeurs: "Aanvullende beurs",
  reisproduct: "Studentenreisproduct",
};

function roundMoney(value: number) {
  return Math.round(Math.max(Number.isFinite(value) ? value : 0, 0) * 100) / 100;
}

function createCurrentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function parseYearMonth(value?: string): YearMonth {
  const fallback = createCurrentYearMonth();

  if (!value) {
    return fallback;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return fallback;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return fallback;
  }

  return { year, month };
}

function formatYearMonth(value: YearMonth) {
  return `${value.year}-${String(value.month).padStart(2, "0")}`;
}

function addMonths(value: YearMonth, months: number): YearMonth {
  const date = new Date(value.year, value.month - 1 + months, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function monthsBetween(start: YearMonth, end: YearMonth) {
  return (end.year - start.year) * 12 + (end.month - start.month);
}

function resolveStudyInterestRate(input: StudyStopInput, repaymentRule: RepaymentRule) {
  if (input.annualStudyInterestRate !== undefined) {
    return sanitizeDuoPercent(input.annualStudyInterestRate);
  }

  return sanitizeDuoPercent(getDuoRateForRule(repaymentRule, input.duoRateYear));
}

function resolveRepaymentInterestRate(input: StudyStopInput, repaymentRule: RepaymentRule) {
  if (input.annualRepaymentInterestRate !== undefined) {
    return sanitizeDuoPercent(input.annualRepaymentInterestRate);
  }

  return sanitizeDuoPercent(getDuoRateForRule(repaymentRule, input.duoRateYear));
}

function resolveRemainingTermYears(repaymentRule: RepaymentRule, duoRateYear?: number) {
  return getDuoDefaultTermForRule(repaymentRule, duoRateYear);
}

function createComponentState(input: {
  key: StudyDebtComponentKey;
  balance?: number;
  giftEligible: boolean;
}): StudyDebtComponentState {
  return {
    key: input.key,
    label: COMPONENT_LABELS[input.key],
    balance: roundMoney(input.balance ?? 0),
    giftEligible: input.giftEligible,
  };
}

function cloneStates(states: StudyDebtComponentState[]) {
  return states.map((state) => ({ ...state }));
}

function getSnapshot(states: StudyDebtComponentState[]): StudyDebtSnapshot {
  const loan = roundMoney(states.find((state) => state.key === "loan")?.balance ?? 0);
  const collegegeldkrediet = roundMoney(
    states.find((state) => state.key === "collegegeldkrediet")?.balance ?? 0,
  );
  const basisbeurs = roundMoney(states.find((state) => state.key === "basisbeurs")?.balance ?? 0);
  const aanvullendeBeurs = roundMoney(
    states.find((state) => state.key === "aanvullendeBeurs")?.balance ?? 0,
  );
  const reisproduct = roundMoney(states.find((state) => state.key === "reisproduct")?.balance ?? 0);
  const total = roundMoney(loan + collegegeldkrediet + basisbeurs + aanvullendeBeurs + reisproduct);
  const alwaysRepayable = roundMoney(loan + collegegeldkrediet);
  const prestatiebeurs = roundMoney(basisbeurs + aanvullendeBeurs + reisproduct);

  return {
    loan,
    collegegeldkrediet,
    basisbeurs,
    aanvullendeBeurs,
    reisproduct,
    total,
    alwaysRepayable,
    prestatiebeurs,
    giftConvertible: prestatiebeurs,
    uncertain: prestatiebeurs,
  };
}

function applyMonthlyInterest(balance: number, annualRate: number) {
  const monthlyRate = annualRate / 100 / 12;
  return roundMoney(balance * monthlyRate);
}

function applyInterest(states: StudyDebtComponentState[], annualRate: number) {
  let interest = 0;
  const nextStates = states.map((state) => {
    if (state.balance <= 0) {
      return { ...state };
    }

    const componentInterest = applyMonthlyInterest(state.balance, annualRate);
    interest = roundMoney(interest + componentInterest);
    return {
      ...state,
      balance: roundMoney(state.balance + componentInterest),
    };
  });

  return { interest, states: nextStates };
}

function addStudyFunding(
  states: StudyDebtComponentState[],
  monthlyAmounts: StudyDebtSnapshot,
) {
  let studyAdditions = 0;
  const nextStates = states.map((state) => {
    const addition =
      state.key === "loan"
        ? monthlyAmounts.loan
        : state.key === "collegegeldkrediet"
          ? monthlyAmounts.collegegeldkrediet
          : state.key === "basisbeurs"
            ? monthlyAmounts.basisbeurs
            : state.key === "aanvullendeBeurs"
              ? monthlyAmounts.aanvullendeBeurs
              : state.key === "reisproduct"
                ? monthlyAmounts.reisproduct
                : 0;

    if (addition <= 0) {
      return { ...state };
    }

    studyAdditions = roundMoney(studyAdditions + addition);
    return {
      ...state,
      balance: roundMoney(state.balance + addition),
    };
  });

  return { studyAdditions, states: nextStates };
}

function giftConvertPrestatiebeurs(states: StudyDebtComponentState[]) {
  let giftConversion = 0;
  const nextStates = states.map((state) => {
    if (!state.giftEligible || state.balance <= 0) {
      return { ...state };
    }

    giftConversion = roundMoney(giftConversion + state.balance);
    return { ...state, balance: 0 };
  });

  return { giftConversion, states: nextStates };
}

function allocatePayment(
  states: StudyDebtComponentState[],
  payment: number,
) {
  let remainingPayment = roundMoney(Math.max(payment, 0));
  const nextStates = states.map((state) => {
    if (remainingPayment <= 0 || state.balance <= 0) {
      return { ...state };
    }

    const applied = roundMoney(Math.min(remainingPayment, state.balance));
    remainingPayment = roundMoney(remainingPayment - applied);
    return {
      ...state,
      balance: roundMoney(state.balance - applied),
    };
  });

  return { paymentApplied: roundMoney(payment - remainingPayment), states: nextStates };
}

function getRepaymentStartMonth(stopMonth: YearMonth) {
  return { year: stopMonth.year + 3, month: 1 };
}

function buildSources() {
  const sources = [
    {
      key: "duo-gift-or-repay",
      title: "Gift of terugbetalen",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studiefinanciering/gift-of-terugbetalen.jsp",
      appliesTo:
        "Prestatiebeurs, rentedragende lening, collegegeldkrediet en de 10-jaarstermijn voor mbo 3/4, hbo en universiteit.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO studiefinanciering en terugbetalen",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Afhankelijk van opleidingstype en diplomamoment; DUO kan aanvullende uitzonderingen hanteren bij studievertraging.",
      ],
    },
    {
      key: "duo-rente-studenten",
      title: "Rente voor studenten",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp",
      appliesTo:
        "Rente tijdens de studie, maandelijkse rente-op-rente en de koppeling met de terugbetalingsregel.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO studierente",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "De publicatie noemt actuele percentages; de berekening gebruikt de ingevoerde DUO-rente of de centrale rentejaren.",
      ],
    },
    {
      key: "duo-rente-stoppen",
      title: "Rente als uw studiefinanciering stopt",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/rente/rente-als-uw-studiefinanciering-stopt.jsp",
      appliesTo:
        "Rentevastzetting na stoppen met studeren, aanloopfase en rente op de prestatiebeurs.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO stopzetting studiefinanciering",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Aanloopfase en rentevastzetting kunnen per startmoment verschillen; de tool modelleert ze in maanden.",
      ],
    },
    {
      key: "duo-berekening-maandbedrag",
      title: "Berekening maandbedrag",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp",
      appliesTo:
        "Wettelijk maandbedrag, draagkracht en meer aflossen dan het vastgestelde bedrag.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO terugbetalen naar draagkracht",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Indicatieve draagkracht hangt af van inkomen, partnerinkomen en eventuele peiljaarverlegging.",
      ],
    },
    {
      key: "duo-terugbetalingsregels",
      title: "Terugbetalingsregels",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studieschuld-terugbetalen/terugbetalingsregels.jsp",
      appliesTo:
        "SF15, SF35, looptijd, rentevastperiode en regels voor terugbetalers.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO terugbetalingsregels",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Regels verschillen per terugbetalingsregime en kunnen bij normwijziging wijzigen.",
      ],
    },
    {
      key: "duo-aflosvrije-periode",
      title: "Aflosvrije periode",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/minder-of-niets-aflossen/aflosvrije-periode.jsp",
      appliesTo:
        "Maximaal 60 maanden aflosvrij, doorlopende rente en verlenging van de terugbetalingsperiode.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO minder of niets aflossen",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Aflosvrije periode wordt in maanden geteld en verlengt de terugbetalingsduur modelmatig.",
      ],
    },
    {
      key: "duo-u-studeert-nog",
      title: "U studeert nog",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/minder-of-niets-aflossen/u-studeert-nog.jsp",
      appliesTo:
        "Stopzetting van aflossing bij opnieuw studeren en het begin van de aanloopfase.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO opnieuw studeren",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Nieuwe studie kan invloed hebben op het moment waarop aflossen weer start.",
      ],
    },
    {
      key: "duo-studievertraging",
      title: "Alle regelingen op een rij",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studievertraging/",
      appliesTo:
        "Verlenging van prestatiebeurs, diplomatermijn, omzetting naar gift en nieuwe aanspraak.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO studievertraging",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Studievertraging kan gevolgen hebben voor diploma- en prestatiebeursregels; individuele situaties verschillen.",
      ],
    },
    {
      key: "duo-hoelang-recht",
      title: "Hoelang recht",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studiefinanciering/hoelang-recht.jsp",
      appliesTo:
        "Diplomatermijn van 10 jaar voor mbo 3/4, hbo en universiteit.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO duur van recht op studiefinanciering",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "De 10-jaarsperiode kan bij overstap van mbo naar hbo opnieuw starten volgens DUO-uitleg.",
      ],
    },
    {
      key: "duo-studentenreisproduct",
      title: "Hoelang recht – Studentenreisproduct",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/ov-en-reizen/hoelang-recht.jsp",
      appliesTo:
        "Studentenreisproduct, diplomatermijn en opnieuw recht bij overstap.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO studentenreisproduct",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Het reisproduct heeft eigen voorwaarden voor omzetting of terugbetalingsgevolgen; de tool volgt de hoofdlijnen.",
      ],
    },
    {
      key: "duo-lenen",
      title: "Lenen",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studiefinanciering/lenen.jsp",
      appliesTo: "Rentedragende lening en collegegeldkrediet.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO lenen binnen studiefinanciering",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Collegegeldkrediet hangt af van opleiding, collegegeldsoort en actuele DUO-bedragen.",
      ],
    },
    {
      key: "duo-bedragen",
      title: "Bedragen",
      organization: "DUO",
      url: "https://www.duo.nl/particulier/studiefinanciering/bedragen.jsp",
      appliesTo: "Actuele studiefinancieringsbedragen per studiejaar.",
      validityDate: "Actuele DUO-pagina geraadpleegd op 2026-07-13",
      consultedAt: STUDY_STOP_SOURCE_CHECKED_AT,
      regulation: "Uitvoeringsinformatie DUO studiefinancieringsbedragen",
      ruleVersion: STUDY_STOP_ENGINE_VERSION,
      uncertainties: [
        "Bedragen wijzigen per studiejaar en soms per periode binnen een jaar.",
      ],
    },
  ];

  return sources.map((source) => ({
    ...source,
    validityDate:
      source.validityDate ?? "Actuele DUO-pagina geraadpleegd op 2026-07-13",
    consultedAt: source.consultedAt ?? STUDY_STOP_SOURCE_CHECKED_AT,
    regulation: source.regulation ?? "Uitvoeringsinformatie DUO studieschuld en terugbetalen",
    ruleVersion: source.ruleVersion ?? STUDY_STOP_ENGINE_VERSION,
    uncertainties: source.uncertainties ?? [],
  }));
}

function buildAssumptions(repaymentRule: RepaymentRule, studyLevel: StudyLevel) {
  return [
    `De berekening gebruikt huidige DUO-rente en maandbedragen als invoer; actuele bedragen uit Mijn DUO blijven leidend.`,
    `Scenario's zijn maandgebaseerd: rente wordt elke maand toegevoegd voordat een nieuwe studiebijdrage of betaling wordt verwerkt.`,
    `De prestatiebeurs wordt in dit model als afzonderlijk saldo gevolgd totdat een diploma op tijd wordt gehaald.`,
    `De aflosvrije periode kan maximaal 60 maanden duren en verlengt de looptijd.`,
    `Onder ${studyLevel} met ${repaymentRule} gebruikt het model de wettelijke DUO-looptijd en het renteprofiel van de gekozen regeling.`,
  ];
}

function createBaseComponents(input: StudyStopInput) {
  return [
    createComponentState({
      key: "loan",
      balance: input.currentLoanDebt,
      giftEligible: false,
    }),
    createComponentState({
      key: "collegegeldkrediet",
      balance: input.currentCollegegeldkredietDebt,
      giftEligible: false,
    }),
    createComponentState({
      key: "basisbeurs",
      balance: input.currentBasisbeursDebt,
      giftEligible: true,
    }),
    createComponentState({
      key: "aanvullendeBeurs",
      balance: input.currentAanvullendeBeursDebt,
      giftEligible: true,
    }),
    createComponentState({
      key: "reisproduct",
      balance: input.currentReisproductDebt,
      giftEligible: true,
    }),
  ];
}

function createMonthlyStudyAdditions(input: StudyStopInput) {
  return {
    loan: roundMoney(input.monthlyLoan ?? 0),
    collegegeldkrediet: roundMoney(input.monthlyCollegegeldkrediet ?? 0),
    basisbeurs: roundMoney(input.monthlyBasisbeurs ?? 0),
    aanvullendeBeurs: roundMoney(input.monthlyAanvullendeBeurs ?? 0),
    reisproduct: roundMoney(input.monthlyReisproduct ?? 0),
    total: 0,
    alwaysRepayable: 0,
    prestatiebeurs: 0,
    giftConvertible: 0,
    uncertain: 0,
  };
}

function calculateMinimumMonthlyPayment(input: {
  remainingDebt: number;
  repaymentRule: RepaymentRule;
  duoRateYear?: number;
  remainingTermYears: number;
  annualInterestRate: number;
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
}) {
  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    repaymentRule: input.repaymentRule,
    remainingDebt: input.remainingDebt,
    annualInterestRate: input.annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears: input.remainingTermYears,
  });
  const incomeBasedMonthlyPayment =
    input.grossAnnualIncome !== undefined || input.partnerGrossAnnualIncome !== undefined
      ? calculateIndicativeIncomeBasedMonthlyPayment({
          grossAnnualIncome: input.grossAnnualIncome,
          partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
          hasPartner: input.hasPartner,
          repaymentRule: input.repaymentRule,
          statutoryMonthlyPayment,
        })
      : undefined;
  const usedMonthlyPayment = roundMoney(
    Math.min(
      statutoryMonthlyPayment,
      incomeBasedMonthlyPayment?.requiredMonthlyPayment ?? statutoryMonthlyPayment,
    ),
  );

  return {
    statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
    incomeBasedMonthlyPayment,
    usedMonthlyPayment,
  };
}

function simulateRepaymentPhase(input: {
  states: StudyDebtComponentState[];
  startMonth: YearMonth;
  annualInterestRate: number;
  repaymentRule: RepaymentRule;
  duoRateYear?: number;
  remainingTermYears: number;
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  monthlyExtraRepayment?: number;
  oneTimeExtraRepayment?: number;
  aflosvrijeMonths?: number;
  maxMonths?: number;
  giftConversionMonth?: number;
  remainingDiplomaTermMonths?: number;
}) {
  const nextStates = cloneStates(input.states);
  const repaymentPayment = calculateMinimumMonthlyPayment({
    remainingDebt: getSnapshot(nextStates).total,
    repaymentRule: input.repaymentRule,
    duoRateYear: input.duoRateYear,
    remainingTermYears: input.remainingTermYears,
    annualInterestRate: input.annualInterestRate,
    grossAnnualIncome: input.grossAnnualIncome,
    partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
    hasPartner: input.hasPartner,
  });
  const monthlyExtraRepayment = roundMoney(input.monthlyExtraRepayment ?? 0);
  const oneTimeExtraRepayment = roundMoney(input.oneTimeExtraRepayment ?? 0);
  const aflosvrijeMonths = Math.min(Math.max(Math.round(input.aflosvrijeMonths ?? 0), 0), 60);
  const maxMonths = input.maxMonths ?? Math.max(Math.round(input.remainingTermYears * 12), 0);
  const timeline: StudyDebtTimelinePoint[] = [];
  let giftConversionSnapshot: StudyDebtSnapshot | undefined;
  let totalPaid = 0;
  let totalInterest = 0;
  let oneTimeApplied = false;

  for (let month = 1; month <= maxMonths; month += 1) {
    const currentMonth = addMonths(input.startMonth, month);
    const openingDebt = getSnapshot(nextStates).total;

    if (openingDebt <= 0) {
      break;
    }

    const interestStep = applyInterest(nextStates, input.annualInterestRate);
    nextStates.splice(0, nextStates.length, ...interestStep.states);

    let payment = 0;
    const isAflosvrij = month <= aflosvrijeMonths;
    if (!isAflosvrij) {
      payment = repaymentPayment.usedMonthlyPayment;
    }
    payment = roundMoney(payment + monthlyExtraRepayment);
    if (!oneTimeApplied && oneTimeExtraRepayment > 0) {
      payment = roundMoney(payment + oneTimeExtraRepayment);
      oneTimeApplied = true;
    }

    const paymentStep = allocatePayment(nextStates, payment);
    nextStates.splice(0, nextStates.length, ...paymentStep.states);

    let giftConversion = 0;
    if (
      input.giftConversionMonth !== undefined &&
      month === input.giftConversionMonth &&
      month <= (input.remainingDiplomaTermMonths ?? Number.POSITIVE_INFINITY)
    ) {
      const conversion = giftConvertPrestatiebeurs(nextStates);
      nextStates.splice(0, nextStates.length, ...conversion.states);
      giftConversion = conversion.giftConversion;
      giftConversionSnapshot = getSnapshot(nextStates);
    }

    const closingDebt = getSnapshot(nextStates).total;
    totalPaid = roundMoney(totalPaid + paymentStep.paymentApplied);
    totalInterest = roundMoney(totalInterest + interestStep.interest);

    timeline.push({
      month,
      date: formatYearMonth(currentMonth),
      phase: isAflosvrij ? "aanloop" : "repayment",
      openingDebt,
      interest: interestStep.interest,
      studyAdditions: 0,
      giftConversion,
      payment: paymentStep.paymentApplied,
      closingDebt,
    });

    if (closingDebt <= 0) {
      break;
    }
  }

  const finalDebt = getSnapshot(nextStates).total;
  const payoffDate = finalDebt <= 0 && timeline.length > 0 ? timeline[timeline.length - 1].date : null;
  return {
    repaymentPayment,
    monthsToDebtFree: timeline.length,
    payoffDate,
    restschuld: roundMoney(Math.max(finalDebt, 0)),
    finalDebt: roundMoney(finalDebt),
    totalPaid: roundMoney(totalPaid),
    totalInterest: roundMoney(totalInterest),
    timeline,
    giftConversionSnapshot,
  };
}

function simulateScenario(input: {
  key: StudyStopScenarioKey;
  title: string;
  calculationMonth: YearMonth;
  stopMonths: number;
  diplomaMonths?: number;
  annualStudyInterestRate: number;
  annualRepaymentInterestRate: number;
  repaymentRule: RepaymentRule;
  duoRateYear?: number;
  remainingTermYears: number;
  currentStates: StudyDebtComponentState[];
  monthlyStudyAdditions: StudyDebtSnapshot;
  remainingDiplomaTermMonths: number;
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  monthlyExtraRepayment?: number;
  oneTimeExtraRepayment?: number;
  aflosvrijeMonths?: number;
}) {
  const stopMonth = addMonths(input.calculationMonth, input.stopMonths);
  const repaymentStartMonth = getRepaymentStartMonth(stopMonth);
  const monthsToRepaymentStart = Math.max(
    monthsBetween(input.calculationMonth, repaymentStartMonth),
    0,
  );
  const monthsToDiploma = input.diplomaMonths;
  const diplomaDeadlineMonth = addMonths(
    input.calculationMonth,
    Math.max(input.remainingDiplomaTermMonths, 0),
  );
  const states = cloneStates(input.currentStates);
  const timeline: StudyDebtTimelinePoint[] = [];

  let currentStates = states;
  let diplomaConverted = false;
  let diplomaAtMonth: string | undefined;
  let diplomaDebtSnapshot: StudyDebtSnapshot | undefined;
  let stopDebtSnapshot: StudyDebtSnapshot = getSnapshot(currentStates);

  for (let month = 1; month <= monthsToRepaymentStart; month += 1) {
    const currentMonth = addMonths(input.calculationMonth, month);
    const openingDebt = getSnapshot(currentStates).total;
    if (openingDebt <= 0) {
      break;
    }

    const interestStep = applyInterest(currentStates, input.annualStudyInterestRate);
    currentStates = interestStep.states;
    let studyAdditions = 0;
    if (month <= input.stopMonths) {
      const additions = addStudyFunding(currentStates, input.monthlyStudyAdditions);
      currentStates = additions.states;
      studyAdditions = additions.studyAdditions;
    }

    let giftConversion = 0;
    if (
      !diplomaConverted &&
      monthsToDiploma !== undefined &&
      month === monthsToDiploma &&
      month <= input.remainingDiplomaTermMonths
    ) {
      const conversion = giftConvertPrestatiebeurs(currentStates);
      currentStates = conversion.states;
      giftConversion = conversion.giftConversion;
      diplomaConverted = true;
      diplomaAtMonth = formatYearMonth(currentMonth);
      diplomaDebtSnapshot = getSnapshot(currentStates);
    }

    const closingDebt = getSnapshot(currentStates).total;
    if (month === input.stopMonths) {
      stopDebtSnapshot = getSnapshot(currentStates);
    }
    timeline.push({
      month,
      date: formatYearMonth(currentMonth),
      phase:
        month <= input.stopMonths
          ? "study"
          : month <= monthsToRepaymentStart
            ? "aanloop"
            : "repayment",
      openingDebt,
      interest: interestStep.interest,
      studyAdditions,
      giftConversion,
      payment: 0,
      closingDebt,
    });
  }

  const debtAtStop = stopDebtSnapshot;
  const debtAtRepaymentStart = getSnapshot(currentStates);

  const repayment = simulateRepaymentPhase({
    states: currentStates,
    startMonth: repaymentStartMonth,
    annualInterestRate: input.annualRepaymentInterestRate,
    repaymentRule: input.repaymentRule,
    duoRateYear: input.duoRateYear,
    remainingTermYears: input.remainingTermYears,
    grossAnnualIncome: input.grossAnnualIncome,
    partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
    hasPartner: input.hasPartner,
    monthlyExtraRepayment: input.monthlyExtraRepayment,
    oneTimeExtraRepayment: input.oneTimeExtraRepayment,
    aflosvrijeMonths: input.aflosvrijeMonths,
    giftConversionMonth:
      monthsToDiploma !== undefined && monthsToDiploma > monthsToRepaymentStart
        ? monthsToDiploma - monthsToRepaymentStart
        : undefined,
    remainingDiplomaTermMonths: input.remainingDiplomaTermMonths,
  });

  const debtAtDiploma =
    diplomaDebtSnapshot ?? repayment.giftConversionSnapshot;

  return {
    stopMonth: formatYearMonth(stopMonth),
    repaymentStartMonth: formatYearMonth(repaymentStartMonth),
    diplomaAtMonth,
    diplomaDeadlineMonth: formatYearMonth(diplomaDeadlineMonth),
    monthsToRepaymentStart,
    debtAtStop,
    debtAtRepaymentStart,
    debtAtDiploma,
    repayment,
    timeline,
  };
}

function summarizeScenario(
  input: StudyStopInput,
  base: ReturnType<typeof simulateScenario>,
  key: StudyStopScenarioKey,
  title: string,
  monthlyStudyAdditions: StudyDebtSnapshot,
  remainingDiplomaTermMonths: number,
  monthsUntilStop: number,
  monthsUntilDiploma?: number,
) {
  const repaymentRule = input.repaymentRule ?? "SF35";
  const annualRepaymentInterestRate = resolveRepaymentInterestRate(input, repaymentRule);
  const remainingTermYears = resolveRemainingTermYears(repaymentRule, input.duoRateYear);
  const monthlyPayment = calculateMinimumMonthlyPayment({
    remainingDebt: base.repayment.finalDebt,
    repaymentRule,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
    annualInterestRate: annualRepaymentInterestRate,
    grossAnnualIncome: input.grossAnnualIncome,
    partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
    hasPartner: input.hasPartner,
  });
  const warnings: string[] = [];
  const assumptions = buildAssumptions(repaymentRule, input.studyLevel ?? "hbo");

  if (base.debtAtRepaymentStart.prestatiebeurs > 0 && base.diplomaAtMonth === undefined && key !== "stop-now-no-diploma") {
    warnings.push(
      "De prestatiebeurs blijft voorlopig als schuld staan totdat het diploma op tijd wordt behaald.",
    );
  }

  if (base.diplomaAtMonth && base.diplomaAtMonth > base.diplomaDeadlineMonth) {
    warnings.push(
      "Het diploma valt buiten de diplomatermijn. In dat geval wordt de prestatiebeurs niet automatisch een gift.",
    );
  }

  return {
    key,
    title,
    stopMonth: base.stopMonth,
    diplomaMonth: base.diplomaAtMonth,
    diplomaDeadlineMonth: base.diplomaDeadlineMonth,
    monthsUntilStop,
    monthsUntilDiploma,
    debtAtStop: base.debtAtStop,
    debtAtRepaymentStart: base.debtAtRepaymentStart,
    debtAtDiploma: base.debtAtDiploma,
    timeline: [
      ...base.timeline,
      ...base.repayment.timeline.map((point) => ({
        ...point,
        month: point.month + base.monthsToRepaymentStart,
      })),
    ],
    repayment: {
      statutoryMonthlyPayment: roundMoney(monthlyPayment.statutoryMonthlyPayment),
      incomeBasedMonthlyPayment: monthlyPayment.incomeBasedMonthlyPayment?.requiredMonthlyPayment,
      usedMonthlyPayment: roundMoney(monthlyPayment.usedMonthlyPayment),
      extraMonthlyRepayment: roundMoney(input.monthlyExtraRepayment ?? 0),
      oneTimeExtraRepayment: roundMoney(input.oneTimeExtraRepayment ?? 0),
      aflosvrijeMonthsUsed: Math.min(Math.max(Math.round(input.aflosvrijeMonths ?? 0), 0), 60),
      monthsToDebtFree: base.repayment.monthsToDebtFree,
      payoffDate: base.repayment.payoffDate,
      restschuld: base.repayment.restschuld,
      finalDebt: base.repayment.finalDebt,
      totalPaid: base.repayment.totalPaid,
      totalInterest: base.repayment.totalInterest,
      timeline: base.repayment.timeline,
    },
    warnings,
    assumptions,
  };
}

export function calculateStudyStopScenarios(
  input: StudyStopInput,
): StudyStopCalculationResult {
  const calculationMonth = parseYearMonth(input.calculationMonth);
  const repaymentRule = input.repaymentRule ?? "SF35";
  const duoRateYear = input.duoRateYear ?? calculationMonth.year;
  const annualStudyInterestRate = resolveStudyInterestRate({ ...input, duoRateYear }, repaymentRule);
  const annualRepaymentInterestRate = resolveRepaymentInterestRate(
    { ...input, duoRateYear },
    repaymentRule,
  );
  const remainingDiplomaTermMonths = Math.max(
    Math.round(input.remainingDiplomaTermMonths ?? 120),
    0,
  );
  const currentStates = createBaseComponents(input);
  const monthlyStudyAdditions = createMonthlyStudyAdditions(input);
  const currentBalances = getSnapshot(currentStates);
  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt: currentBalances.total,
    repaymentRule,
    annualInterestRate: annualRepaymentInterestRate,
    duoRateYear,
    remainingTermYears: resolveRemainingTermYears(repaymentRule, duoRateYear),
  });
  const incomeBasedMonthlyPayment =
    input.grossAnnualIncome !== undefined || input.partnerGrossAnnualIncome !== undefined
      ? calculateIndicativeIncomeBasedMonthlyPayment({
          grossAnnualIncome: input.grossAnnualIncome,
          partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
          hasPartner: input.hasPartner,
          repaymentRule,
          statutoryMonthlyPayment,
        })
      : undefined;

  const stopNowBase = simulateScenario({
    key: "stop-now-no-diploma",
    title: "Nu stoppen en geen diploma meer halen",
    calculationMonth,
    stopMonths: 0,
    annualStudyInterestRate,
    annualRepaymentInterestRate,
    repaymentRule,
    duoRateYear,
    remainingTermYears: resolveRemainingTermYears(repaymentRule, duoRateYear),
    currentStates,
    monthlyStudyAdditions,
    remainingDiplomaTermMonths,
    grossAnnualIncome: input.grossAnnualIncome,
    partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
    hasPartner: input.hasPartner,
    monthlyExtraRepayment: input.monthlyExtraRepayment,
    oneTimeExtraRepayment: input.oneTimeExtraRepayment,
    aflosvrijeMonths: input.aflosvrijeMonths,
  });

  const laterDiplomaBase = simulateScenario({
    key: "stop-now-later-diploma",
    title: "Nu stoppen en later alsnog een diploma halen",
    calculationMonth,
    stopMonths: 0,
    diplomaMonths: Math.max(Math.round(input.monthsUntilLaterDiploma ?? 0), 0),
    annualStudyInterestRate,
    annualRepaymentInterestRate,
    repaymentRule,
    duoRateYear,
    remainingTermYears: resolveRemainingTermYears(repaymentRule, duoRateYear),
    currentStates,
    monthlyStudyAdditions,
    remainingDiplomaTermMonths,
    grossAnnualIncome: input.grossAnnualIncome,
    partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
    hasPartner: input.hasPartner,
    monthlyExtraRepayment: input.monthlyExtraRepayment,
    oneTimeExtraRepayment: input.oneTimeExtraRepayment,
    aflosvrijeMonths: input.aflosvrijeMonths,
  });

  const continueBase = simulateScenario({
    key: "continue-to-diploma",
    title: "Doorstuderen tot diploma",
    calculationMonth,
    stopMonths: Math.max(Math.round(input.monthsUntilContinueDiploma ?? 0), 0),
    diplomaMonths: Math.max(Math.round(input.monthsUntilContinueDiploma ?? 0), 0),
    annualStudyInterestRate,
    annualRepaymentInterestRate,
    repaymentRule,
    duoRateYear,
    remainingTermYears: resolveRemainingTermYears(repaymentRule, duoRateYear),
    currentStates,
    monthlyStudyAdditions,
    remainingDiplomaTermMonths,
    grossAnnualIncome: input.grossAnnualIncome,
    partnerGrossAnnualIncome: input.partnerGrossAnnualIncome,
    hasPartner: input.hasPartner,
    monthlyExtraRepayment: input.monthlyExtraRepayment,
    oneTimeExtraRepayment: input.oneTimeExtraRepayment,
    aflosvrijeMonths: input.aflosvrijeMonths,
  });

  const scenarios = [
    summarizeScenario(
      input,
      stopNowBase,
      "stop-now-no-diploma",
      "Nu stoppen en geen diploma meer halen",
      monthlyStudyAdditions,
      remainingDiplomaTermMonths,
      0,
      undefined,
    ),
    summarizeScenario(
      input,
      laterDiplomaBase,
      "stop-now-later-diploma",
      "Nu stoppen en later alsnog een diploma halen",
      monthlyStudyAdditions,
      remainingDiplomaTermMonths,
      0,
      Math.max(Math.round(input.monthsUntilLaterDiploma ?? 0), 0),
    ),
    summarizeScenario(
      input,
      continueBase,
      "continue-to-diploma",
      "Doorstuderen tot diploma",
      monthlyStudyAdditions,
      remainingDiplomaTermMonths,
      Math.max(Math.round(input.monthsUntilContinueDiploma ?? 0), 0),
      Math.max(Math.round(input.monthsUntilContinueDiploma ?? 0), 0),
    ),
  ] as StudyStopScenarioResult[];

  return {
    calculationMonth: formatYearMonth(calculationMonth),
    studyLevel: input.studyLevel ?? "hbo",
    repaymentRule,
    duoRateYear,
    annualStudyInterestRate,
    annualRepaymentInterestRate,
    remainingDiplomaTermMonths,
    diplomaDeadlineMonth: formatYearMonth(addMonths(calculationMonth, remainingDiplomaTermMonths)),
    currentBalances,
    monthlyStudyAdditions,
    incomeBasedMonthlyPayment,
    statutoryMonthlyPayment: roundMoney(statutoryMonthlyPayment),
    ruleVersion: STUDY_STOP_ENGINE_VERSION,
    scenarios,
    warnings: [
      "Dit model gebruikt jouw ingevoerde My DUO-bedragen als uitgangspunt. Het is geen DUO-beschikking.",
      "De prestatiebeurs kan alleen een gift worden als de toepasselijke diplomatermijn en voorwaarden zijn gehaald.",
    ],
    assumptions: buildAssumptions(repaymentRule, input.studyLevel ?? "hbo"),
    sources: buildSources(),
  };
}

export function createStudyStopDefaultValues(calculationMonth = formatYearMonth(createCurrentYearMonth())) {
  return {
    calculationMonth,
    studyLevel: "hbo" as StudyLevel,
    currentLoanDebt: "18000",
    currentCollegegeldkredietDebt: "2000",
    currentBasisbeursDebt: "1500",
    currentAanvullendeBeursDebt: "2500",
    currentReisproductDebt: "1200",
    monthlyLoan: "315.17",
    monthlyCollegegeldkrediet: "216.75",
    monthlyBasisbeurs: "130.21",
    monthlyAanvullendeBeurs: "0",
    monthlyReisproduct: "0",
    monthsUntilLaterDiploma: "24",
    monthsUntilContinueDiploma: "36",
    remainingDiplomaTermMonths: "120",
    repaymentRule: "SF35" as RepaymentRule,
    duoRateYear: String(parseYearMonth(calculationMonth).year),
    annualStudyInterestRate: String(getDuoRateForRule("SF35", parseYearMonth(calculationMonth).year)),
    annualRepaymentInterestRate: String(getDuoRateForRule("SF35", parseYearMonth(calculationMonth).year)),
    grossAnnualIncome: "",
    partnerGrossAnnualIncome: "",
    hasPartner: false,
    oneTimeExtraRepayment: "0",
    monthlyExtraRepayment: "0",
    aflosvrijeMonths: "0",
  };
}

export function createEmptyStudyStopValues(calculationMonth = formatYearMonth(createCurrentYearMonth())) {
  return {
    calculationMonth,
    studyLevel: "hbo" as StudyLevel,
    currentLoanDebt: "",
    currentCollegegeldkredietDebt: "",
    currentBasisbeursDebt: "",
    currentAanvullendeBeursDebt: "",
    currentReisproductDebt: "",
    monthlyLoan: "",
    monthlyCollegegeldkrediet: "",
    monthlyBasisbeurs: "",
    monthlyAanvullendeBeurs: "",
    monthlyReisproduct: "",
    monthsUntilLaterDiploma: "",
    monthsUntilContinueDiploma: "",
    remainingDiplomaTermMonths: "",
    repaymentRule: "SF35" as RepaymentRule,
    duoRateYear: String(parseYearMonth(calculationMonth).year),
    annualStudyInterestRate: "",
    annualRepaymentInterestRate: "",
    grossAnnualIncome: "",
    partnerGrossAnnualIncome: "",
    hasPartner: false,
    oneTimeExtraRepayment: "",
    monthlyExtraRepayment: "",
    aflosvrijeMonths: "",
  };
}
