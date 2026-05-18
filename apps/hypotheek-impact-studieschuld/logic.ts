export const LAST_CHECKED = "2026-05-18";

export type DuoSituation =
  | "repaying"
  | "gracePeriod"
  | "incomeBasedReduction"
  | "paymentPause"
  | "unknown";

export type RepaymentRule =
  | "SF35"
  | "SF15"
  | "SF15_OLD"
  | "SF15_LLLK"
  | "UNKNOWN";

export type PaymentSource = "actual" | "statutory" | "estimated" | "mixed";

export const DEFAULT_DUO_RATES_2026: Record<RepaymentRule, number> = {
  SF35: 2.33,
  SF15: 2.29,
  SF15_OLD: 2.29,
  SF15_LLLK: 2.33,
  UNKNOWN: 2.33,
};

export const DEFAULT_TERMS: Record<RepaymentRule, number> = {
  SF35: 35,
  SF15: 15,
  SF15_OLD: 15,
  SF15_LLLK: 15,
  UNKNOWN: 35,
};

export const BRUTERING_FACTORS = [
  { minRate: 0, maxRate: 2.0, factor: 1.05, label: "2,0% of lager" },
  { minRate: 2.0, maxRate: 2.5, factor: 1.1, label: "2,0% tot 2,5%" },
  { minRate: 2.5, maxRate: 3.0, factor: 1.15, label: "2,5% tot 3,0%" },
  { minRate: 3.0, maxRate: 3.5, factor: 1.2, label: "3,0% tot 3,5%" },
  { minRate: 3.5, maxRate: 4.0, factor: 1.2, label: "3,5% tot 4,0%" },
  { minRate: 4.0, maxRate: 4.5, factor: 1.25, label: "4,0% tot 4,5%" },
  { minRate: 4.5, maxRate: 5.0, factor: 1.3, label: "4,5% tot 5,0%" },
  { minRate: 5.0, maxRate: 5.5, factor: 1.3, label: "5,0% tot 5,5%" },
  { minRate: 5.5, maxRate: 6.0, factor: 1.35, label: "5,5% tot 6,0%" },
  { minRate: 6.0, maxRate: Number.POSITIVE_INFINITY, factor: 1.4, label: "6,0% of hoger" },
] as const;

export const QUICK_RULE_SCENARIOS = [
  { key: "careful", label: "Voorzichtig", factor: 4.5 },
  { key: "middle", label: "Midden", factor: 5.0 },
  { key: "wide", label: "Ruim", factor: 5.5 },
] as const;

export type QuickRuleScenarioKey = (typeof QUICK_RULE_SCENARIOS)[number]["key"];

export type RelevantDuoPaymentResult = {
  primaryNetMonthlyPayment: number;
  optimisticNetMonthlyPayment: number;
  conservativeNetMonthlyPayment: number;
  estimatedStatutoryPayment: number;
  source: PaymentSource;
  explanation: string;
  warnings: string[];
};

export type MortgageImpactResult = {
  netDuoMonthlyPayment: number;
  bruteringFactor: number;
  bruteringLabel: string;
  grossDuoMonthlyImpact: number;
  principalImpact: number;
  optimisticPrincipalImpact: number;
  conservativePrincipalImpact: number;
  assumptions: string[];
  warnings: string[];
};

export type ExtraRepaymentScenarioResult = {
  extraRepaymentUsed: number;
  newStudentDebt: number;
  oldEstimatedMonthlyPayment: number;
  newEstimatedMonthlyPayment: number;
  monthlyPaymentReduction: number;
  grossMonthlyImpactReduction: number;
  extraMortgageRoomIndicative: number;
  ratio: number | null;
  warnings: string[];
};

export type HousingTargetSummary = {
  desiredHomePrice: number;
  ownMoney: number;
  neededMortgage: number;
  indicativeMortgageNeedWithStudentDebt: number;
  maxMortgageWithoutStudentDebt?: number;
  maxMortgageWithStudentDebtIndicative?: number;
  gapToTargetIfMaxProvided?: number;
  ownMoneyCoversHomePrice: boolean;
};

export type QuickRuleImpactScenario = {
  key: QuickRuleScenarioKey;
  label: string;
  factor: number;
  impact: number;
};

export type HypotheekImpactInput = {
  situation: DuoSituation;
  repaymentRule: RepaymentRule;
  actualMonthlyPayment?: number;
  statutoryMonthlyPayment?: number;
  remainingStudentDebt?: number;
  duoInterestRate?: number;
  remainingTermYears?: number;
  extraRepayment?: number;
  grossIncomeUser: number;
  grossIncomePartner: number;
  desiredHomePrice?: number;
  ownMoney?: number;
  maxMortgageWithoutStudentDebt?: number;
  mortgageRate: number;
  mortgageTermYears: number;
};

export type HypotheekImpactResult = {
  duoPayment: RelevantDuoPaymentResult;
  mortgageImpact: MortgageImpactResult;
  extraRepaymentScenario: ExtraRepaymentScenarioResult;
  grossIncomeTotal: number;
  debtToIncomeRatio?: number;
  housingTarget?: HousingTargetSummary;
  quickRuleImpactScenarios: QuickRuleImpactScenario[];
  duoRateUsed: number;
  duoTermYearsUsed: number;
  remainingStudentDebt: number;
  assumptions: string[];
  warnings: string[];
};

function sanitizeFiniteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function roundRatio(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value * 10000) / 10000;
}

function sanitizeYears(value: number, fallback = 0) {
  const safeValue = sanitizeFiniteNumber(value, fallback);

  if (safeValue <= 0) {
    return fallback > 0 ? fallback : 0;
  }

  return safeValue;
}

function sanitizeOptionalMoney(value?: number) {
  if (value === undefined) {
    return undefined;
  }

  return sanitizeMoney(value);
}

function safeRatio(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return undefined;
  }

  return roundRatio(numerator / denominator);
}

function getEffectiveDuoRate(input: {
  repaymentRule: RepaymentRule;
  duoInterestRate?: number;
}) {
  return input.duoInterestRate === undefined
    ? getDefaultDuoRate(input.repaymentRule)
    : sanitizePercent(input.duoInterestRate);
}

function getEffectiveDuoTerm(input: {
  repaymentRule: RepaymentRule;
  remainingTermYears?: number;
}) {
  return input.remainingTermYears === undefined
    ? getDefaultTerm(input.repaymentRule)
    : Math.max(sanitizeYears(input.remainingTermYears, 0), 0);
}

export function sanitizeMoney(value: number): number {
  return Math.max(sanitizeFiniteNumber(value, 0), 0);
}

export function sanitizePercent(value: number): number {
  return Math.min(Math.max(sanitizeFiniteNumber(value, 0), 0), 100);
}

export function getDefaultDuoRate(rule: RepaymentRule): number {
  return DEFAULT_DUO_RATES_2026[rule] ?? DEFAULT_DUO_RATES_2026.UNKNOWN;
}

export function getDefaultTerm(rule: RepaymentRule): number {
  return DEFAULT_TERMS[rule] ?? DEFAULT_TERMS.UNKNOWN;
}

export function calculateAnnuityPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  const safePrincipal = sanitizeMoney(principal);
  const safeAnnualRate = sanitizePercent(annualRate);
  const safeYears = sanitizeYears(years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (safePrincipal === 0 || months === 0) {
    return 0;
  }

  if (safeAnnualRate === 0) {
    return roundMoney(safePrincipal / months);
  }

  const monthlyRate = safeAnnualRate / 100 / 12;
  const denominator = 1 - (1 + monthlyRate) ** -months;

  if (denominator <= 0) {
    return 0;
  }

  return roundMoney((safePrincipal * monthlyRate) / denominator);
}

export function calculatePresentValueFromMonthlyPayment(
  monthlyPayment: number,
  annualRate: number,
  years: number,
): number {
  const safeMonthlyPayment = sanitizeMoney(monthlyPayment);
  const safeAnnualRate = sanitizePercent(annualRate);
  const safeYears = sanitizeYears(years, 0);
  const months = Math.max(Math.round(safeYears * 12), 0);

  if (safeMonthlyPayment === 0 || months === 0) {
    return 0;
  }

  if (safeAnnualRate === 0) {
    return roundMoney(safeMonthlyPayment * months);
  }

  const monthlyRate = safeAnnualRate / 100 / 12;

  return roundMoney(
    safeMonthlyPayment * (1 - (1 + monthlyRate) ** -months) / monthlyRate,
  );
}

export function getBruteringFactor(mortgageRate: number): {
  factor: number;
  label: string;
} {
  const safeMortgageRate = sanitizePercent(mortgageRate);
  const band =
    BRUTERING_FACTORS.find(
      (item) =>
        safeMortgageRate >= item.minRate && safeMortgageRate < item.maxRate,
    ) ?? BRUTERING_FACTORS[BRUTERING_FACTORS.length - 1];

  return {
    factor: band.factor,
    label: band.label,
  };
}

export function determineRelevantDuoPayment(
  input: Pick<
    HypotheekImpactInput,
    | "situation"
    | "repaymentRule"
    | "actualMonthlyPayment"
    | "statutoryMonthlyPayment"
    | "remainingStudentDebt"
    | "duoInterestRate"
    | "remainingTermYears"
  >,
): RelevantDuoPaymentResult {
  const actualMonthlyPayment = sanitizeOptionalMoney(input.actualMonthlyPayment);
  const statutoryMonthlyPayment = sanitizeOptionalMoney(
    input.statutoryMonthlyPayment,
  );
  const remainingStudentDebt = sanitizeOptionalMoney(input.remainingStudentDebt) ?? 0;
  const duoRate = getEffectiveDuoRate(input);
  const duoTermYears = getEffectiveDuoTerm(input);
  const estimatedStatutoryPayment = calculateAnnuityPayment(
    remainingStudentDebt,
    duoRate,
    duoTermYears,
  );
  const warnings: string[] = [];

  if (input.repaymentRule === "UNKNOWN") {
    warnings.push(
      "De terugbetalingsregel staat op onbekend. Deze tool rekent daarom voorlopig met SF35-aannames.",
    );
  }

  if (input.duoInterestRate === undefined) {
    warnings.push(
      `DUO-rente niet ingevuld. We gebruiken daarom voorlopig ${duoRate.toFixed(2).replace(".", ",")}% op basis van je terugbetalingsregel.`,
    );
  }

  if (input.remainingTermYears === undefined) {
    warnings.push(
      `Resterende looptijd niet ingevuld. We gebruiken daarom voorlopig ${duoTermYears} jaar.`,
    );
  }

  const actualPositive =
    actualMonthlyPayment !== undefined ? actualMonthlyPayment : undefined;
  const statutoryPositive =
    statutoryMonthlyPayment !== undefined ? statutoryMonthlyPayment : undefined;

  switch (input.situation) {
    case "repaying": {
      if (actualPositive !== undefined && actualPositive > 0) {
        return {
          primaryNetMonthlyPayment: actualPositive,
          optimisticNetMonthlyPayment: actualPositive,
          conservativeNetMonthlyPayment: actualPositive,
          estimatedStatutoryPayment,
          source: "actual",
          explanation:
            "Je betaalt al maandelijks aan DUO. Daarom nemen we je actuele DUO-maandbedrag als startpunt.",
          warnings,
        };
      }

      if (statutoryPositive !== undefined && statutoryPositive > 0) {
        warnings.push(
          "Je actuele maandbedrag ontbreekt of is 0. Daarom rekenen we met het wettelijke maandbedrag dat je hebt ingevuld.",
        );

        return {
          primaryNetMonthlyPayment: statutoryPositive,
          optimisticNetMonthlyPayment: statutoryPositive,
          conservativeNetMonthlyPayment: statutoryPositive,
          estimatedStatutoryPayment,
          source: "statutory",
          explanation:
            "Je maandelijkse terugbetaling loopt al, maar zonder actueel DUO-bedrag is het wettelijke maandbedrag het veiligste startpunt.",
          warnings,
        };
      }

      warnings.push(
        "Zonder actueel of wettelijk DUO-bedrag schakelt de tool terug naar een schatting op basis van schuld, rente en resterende looptijd.",
      );

      return {
        primaryNetMonthlyPayment: estimatedStatutoryPayment,
        optimisticNetMonthlyPayment: estimatedStatutoryPayment,
        conservativeNetMonthlyPayment: estimatedStatutoryPayment,
        estimatedStatutoryPayment,
        source: "estimated",
        explanation:
          "Je betaalt waarschijnlijk al, maar omdat er geen bruikbaar DUO-bedrag is ingevuld, schatten we het wettelijke maandbedrag.",
        warnings,
      };
    }

    case "gracePeriod": {
      const fallbackPayment =
        statutoryPositive !== undefined && statutoryPositive > 0
          ? statutoryPositive
          : estimatedStatutoryPayment;

      warnings.push(
        "Je zit in de aanloopfase. Een hypotheekverstrekker kijkt dan vaak niet naar wat je nu betaalt, maar naar wat je straks moet betalen.",
      );

      return {
        primaryNetMonthlyPayment: fallbackPayment,
        optimisticNetMonthlyPayment: fallbackPayment,
        conservativeNetMonthlyPayment: fallbackPayment,
        estimatedStatutoryPayment,
        source:
          statutoryPositive !== undefined && statutoryPositive > 0
            ? "statutory"
            : "estimated",
        explanation:
          "Omdat je nog niet echt aan het aflossen bent, nemen we het wettelijke of geschatte maandbedrag dat straks waarschijnlijk relevant wordt.",
        warnings,
      };
    }

    case "incomeBasedReduction": {
      const optimistic =
        actualPositive !== undefined && actualPositive >= 0
          ? actualPositive
          : estimatedStatutoryPayment;
      const conservative =
        statutoryPositive !== undefined && statutoryPositive > 0
          ? statutoryPositive
          : estimatedStatutoryPayment;

      warnings.push(
        "Je maandbedrag is verlaagd op basis van draagkracht. Een geldverstrekker kan soms toch naar een hoger wettelijk bedrag kijken.",
      );

      if (statutoryPositive === undefined || statutoryPositive === 0) {
        warnings.push(
          "Het wettelijke maandbedrag ontbreekt. Daarom gebruiken we daarvoor een schatting op basis van schuld, rente en resterende looptijd.",
        );
      }

      return {
        primaryNetMonthlyPayment: conservative,
        optimisticNetMonthlyPayment: optimistic,
        conservativeNetMonthlyPayment: conservative,
        estimatedStatutoryPayment,
        source: "mixed",
        explanation:
          "Bij draagkrachtverlaging laten we twee lezingen zien: optimistisch het feitelijke lagere bedrag, voorzichtig het wettelijke of geschatte bedrag.",
        warnings,
      };
    }

    case "paymentPause": {
      const actualPayment = actualPositive ?? 0;
      const fallbackPayment =
        statutoryPositive !== undefined && statutoryPositive > 0
          ? statutoryPositive
          : estimatedStatutoryPayment;

      warnings.push(
        "Een aflossingsvrije periode maakt je studieschuld niet onzichtbaar. €0 betalen is meestal niet de juiste hypotheekbasis.",
      );

      return {
        primaryNetMonthlyPayment: fallbackPayment,
        optimisticNetMonthlyPayment: actualPayment,
        conservativeNetMonthlyPayment: fallbackPayment,
        estimatedStatutoryPayment,
        source: "mixed",
        explanation:
          "Je feitelijke betaling kan tijdelijk laag of nul zijn, maar voor de hypotheekimpact rekenen we voorzichtig met wat je zou moeten betalen.",
        warnings,
      };
    }

    case "unknown":
    default: {
      warnings.push(
        "Je situatie staat op onbekend. Mijn DUO blijft leidend, maar deze tool maakt alvast een veilige schatting.",
      );

      return {
        primaryNetMonthlyPayment: estimatedStatutoryPayment,
        optimisticNetMonthlyPayment: estimatedStatutoryPayment,
        conservativeNetMonthlyPayment: estimatedStatutoryPayment,
        estimatedStatutoryPayment,
        source: "estimated",
        explanation:
          "Omdat nog niet duidelijk is welk DUO-bedrag echt leidend is, schatten we een wettelijk maandbedrag op basis van schuld, rente en looptijd.",
        warnings,
      };
    }
  }
}

export function calculateMortgageImpact(
  input: Pick<
    HypotheekImpactInput,
    | "situation"
    | "repaymentRule"
    | "actualMonthlyPayment"
    | "statutoryMonthlyPayment"
    | "remainingStudentDebt"
    | "duoInterestRate"
    | "remainingTermYears"
    | "mortgageRate"
    | "mortgageTermYears"
  >,
): MortgageImpactResult {
  const duoPayment = determineRelevantDuoPayment(input);
  const mortgageRate = sanitizePercent(input.mortgageRate);
  const mortgageTermYears = sanitizeYears(input.mortgageTermYears, 30);
  const brutering = getBruteringFactor(mortgageRate);
  const netDuoMonthlyPayment = roundMoney(duoPayment.primaryNetMonthlyPayment);
  const grossDuoMonthlyImpact = roundMoney(netDuoMonthlyPayment * brutering.factor);
  const principalImpact = calculatePresentValueFromMonthlyPayment(
    grossDuoMonthlyImpact,
    mortgageRate,
    mortgageTermYears,
  );
  const optimisticPrincipalImpact = calculatePresentValueFromMonthlyPayment(
    roundMoney(duoPayment.optimisticNetMonthlyPayment * brutering.factor),
    mortgageRate,
    mortgageTermYears,
  );
  const conservativePrincipalImpact = calculatePresentValueFromMonthlyPayment(
    roundMoney(duoPayment.conservativeNetMonthlyPayment * brutering.factor),
    mortgageRate,
    mortgageTermYears,
  );

  return {
    netDuoMonthlyPayment,
    bruteringFactor: brutering.factor,
    bruteringLabel: brutering.label,
    grossDuoMonthlyImpact,
    principalImpact,
    optimisticPrincipalImpact,
    conservativePrincipalImpact,
    assumptions: [
      "We gebruiken een indicatieve bruteringsstaffel om een netto DUO-last om te rekenen naar een bruto vergelijkbare maandlast.",
      `Voor de hypotheekimpact rekenen we met ${mortgageRate.toFixed(2).replace(".", ",")}% hypotheekrente en ${mortgageTermYears} jaar looptijd.`,
      "De hoofdsom-impact volgt uit de contante waarde van die gebruteerde maandlast als annuïteit.",
    ],
    warnings: duoPayment.warnings,
  };
}

export function calculateExtraRepaymentScenario(
  input: Pick<
    HypotheekImpactInput,
    | "repaymentRule"
    | "remainingStudentDebt"
    | "duoInterestRate"
    | "remainingTermYears"
    | "extraRepayment"
    | "mortgageRate"
    | "mortgageTermYears"
  >,
): ExtraRepaymentScenarioResult {
  const remainingStudentDebt = sanitizeOptionalMoney(input.remainingStudentDebt) ?? 0;
  const duoRate = getEffectiveDuoRate(input);
  const duoTermYears = getEffectiveDuoTerm(input);
  const mortgageRate = sanitizePercent(input.mortgageRate);
  const mortgageTermYears = sanitizeYears(input.mortgageTermYears, 30);
  const extraRepaymentInput = sanitizeOptionalMoney(input.extraRepayment) ?? 0;
  const extraRepaymentUsed = Math.min(extraRepaymentInput, remainingStudentDebt);
  const newStudentDebt = roundMoney(
    Math.max(remainingStudentDebt - extraRepaymentUsed, 0),
  );
  const oldEstimatedMonthlyPayment = calculateAnnuityPayment(
    remainingStudentDebt,
    duoRate,
    duoTermYears,
  );
  const newEstimatedMonthlyPayment = calculateAnnuityPayment(
    newStudentDebt,
    duoRate,
    duoTermYears,
  );
  const monthlyPaymentReduction = roundMoney(
    Math.max(oldEstimatedMonthlyPayment - newEstimatedMonthlyPayment, 0),
  );
  const brutering = getBruteringFactor(mortgageRate);
  const grossMonthlyImpactReduction = roundMoney(
    monthlyPaymentReduction * brutering.factor,
  );
  const extraMortgageRoomIndicative = calculatePresentValueFromMonthlyPayment(
    grossMonthlyImpactReduction,
    mortgageRate,
    mortgageTermYears,
  );
  const warnings: string[] = [];

  if (remainingStudentDebt === 0) {
    warnings.push(
      "Zonder resterende studieschuld kunnen we geen effect van extra aflossen schatten.",
    );
  }

  if (extraRepaymentInput > remainingStudentDebt && remainingStudentDebt > 0) {
    warnings.push(
      "Extra aflossen is begrensd op je ingevulde resterende studieschuld.",
    );
  }

  if (extraRepaymentUsed > 0) {
    warnings.push(
      "Dit effect ontstaat alleen als DUO je maandbedrag na extra aflossen daadwerkelijk verlaagt.",
    );
    warnings.push(
      "Vraag na extra aflossen altijd een nieuw DUO-overzicht op voordat je een hypotheekgesprek ingaat.",
    );
    warnings.push(
      "Extra aflossen is niet automatisch slim: buffer, aankoopkosten, verduurzaming of lagere hypotheek kunnen ook waardevoller zijn.",
    );
  }

  return {
    extraRepaymentUsed,
    newStudentDebt,
    oldEstimatedMonthlyPayment,
    newEstimatedMonthlyPayment,
    monthlyPaymentReduction,
    grossMonthlyImpactReduction,
    extraMortgageRoomIndicative,
    ratio:
      extraRepaymentUsed > 0
        ? roundRatio(extraMortgageRoomIndicative / extraRepaymentUsed)
        : null,
    warnings,
  };
}

function calculateQuickRuleScenarios(
  netMonthlyPayment: number,
): QuickRuleImpactScenario[] {
  const duoYearlyPayment = sanitizeMoney(netMonthlyPayment) * 12;

  return QUICK_RULE_SCENARIOS.map((scenario) => ({
    ...scenario,
    impact: roundMoney(duoYearlyPayment * scenario.factor),
  }));
}

export function calculateHypotheekImpact(
  input: HypotheekImpactInput,
): HypotheekImpactResult {
  const grossIncomeUser = sanitizeMoney(input.grossIncomeUser);
  const grossIncomePartner = sanitizeMoney(input.grossIncomePartner);
  const grossIncomeTotal = roundMoney(grossIncomeUser + grossIncomePartner);
  const remainingStudentDebt = sanitizeOptionalMoney(input.remainingStudentDebt) ?? 0;
  const desiredHomePrice = sanitizeOptionalMoney(input.desiredHomePrice);
  const ownMoney = sanitizeOptionalMoney(input.ownMoney) ?? 0;
  const maxMortgageWithoutStudentDebt = sanitizeOptionalMoney(
    input.maxMortgageWithoutStudentDebt,
  );
  const duoRateUsed = getEffectiveDuoRate(input);
  const duoTermYearsUsed = getEffectiveDuoTerm(input);
  const duoPayment = determineRelevantDuoPayment({
    ...input,
    duoInterestRate: duoRateUsed,
    remainingTermYears: duoTermYearsUsed,
  });
  const mortgageImpact = calculateMortgageImpact({
    ...input,
    duoInterestRate: duoRateUsed,
    remainingTermYears: duoTermYearsUsed,
  });
  const extraRepaymentScenario = calculateExtraRepaymentScenario({
    ...input,
    duoInterestRate: duoRateUsed,
    remainingTermYears: duoTermYearsUsed,
  });
  const quickRuleImpactScenarios = calculateQuickRuleScenarios(
    duoPayment.primaryNetMonthlyPayment,
  );
  const debtToIncomeRatio =
    remainingStudentDebt > 0
      ? safeRatio(remainingStudentDebt, grossIncomeTotal)
      : undefined;

  const housingTarget = (() => {
    if (desiredHomePrice === undefined) {
      return undefined;
    }

    const neededMortgage = roundMoney(Math.max(desiredHomePrice - ownMoney, 0));
    const ownMoneyCoversHomePrice = ownMoney >= desiredHomePrice;
    const indicativeMortgageNeedWithStudentDebt = ownMoneyCoversHomePrice
      ? 0
      : roundMoney(neededMortgage + mortgageImpact.principalImpact);

    const summary: HousingTargetSummary = {
      desiredHomePrice,
      ownMoney,
      neededMortgage,
      indicativeMortgageNeedWithStudentDebt,
      ownMoneyCoversHomePrice,
    };

    if (maxMortgageWithoutStudentDebt !== undefined) {
      summary.maxMortgageWithoutStudentDebt = maxMortgageWithoutStudentDebt;
      summary.maxMortgageWithStudentDebtIndicative = roundMoney(
        Math.max(
          maxMortgageWithoutStudentDebt - mortgageImpact.principalImpact,
          0,
        ),
      );
      summary.gapToTargetIfMaxProvided = roundMoney(
        Math.max(
          neededMortgage - (summary.maxMortgageWithStudentDebtIndicative ?? 0),
          0,
        ),
      );
    }

    return summary;
  })();

  const assumptions = [
    `Bedragen en aannames gecontroleerd op ${LAST_CHECKED}.`,
    `Voor ${input.repaymentRule === "UNKNOWN" ? "de onbekende terugbetalingsregel" : input.repaymentRule} rekenen we standaard met ${duoRateUsed.toFixed(2).replace(".", ",")}% DUO-rente en ${duoTermYearsUsed} jaar als je geen eigen waarden invult.`,
    "De hoofdconclusie gebruikt netto DUO-last -> brutering -> indicatieve annuïtaire hypotheekimpact, niet alleen een grove jaarfactor.",
  ];

  const warnings = [
    ...duoPayment.warnings,
    ...mortgageImpact.warnings,
    ...extraRepaymentScenario.warnings,
  ].filter((warning, index, all) => all.indexOf(warning) === index);

  return {
    duoPayment,
    mortgageImpact,
    extraRepaymentScenario,
    grossIncomeTotal,
    debtToIncomeRatio,
    housingTarget,
    quickRuleImpactScenarios,
    duoRateUsed,
    duoTermYearsUsed,
    remainingStudentDebt,
    assumptions,
    warnings,
  };
}
