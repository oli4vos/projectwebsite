import type {
  MortgageMaxMortgageInput,
  MortgageMaxMortgageResult,
} from "@/lib/mortgage/types";
import { calculatePresentValueFromMonthlyPayment } from "@/lib/mortgage/present-value";

export type MortgageReportLine = {
  label: string;
  value: string;
  note?: string;
};

export type MortgageCalculationTimelineStep = {
  step: number;
  title: string;
  explanation: string;
  formula?: string;
  lines: MortgageReportLine[];
  outcome: MortgageReportLine;
  sourceKeys: string[];
};

export type MortgageReportSource = {
  key: string;
  title: string;
  organization: string;
  url: string;
  appliesTo: string;
};

export type MortgageReportSection = {
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  lines?: MortgageReportLine[];
};

export type MortgagePdfReport = {
  title: string;
  subtitle: string;
  generatedAt: string;
  normYear: number;
  timeline: MortgageCalculationTimelineStep[];
  summaryLines: MortgageReportLine[];
  sections: MortgageReportSection[];
  warnings: string[];
  assumptions: string[];
  sources: MortgageReportSource[];
};

type BuildMortgagePdfReportOptions = {
  generatedAt?: Date;
};

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number, maximumFractionDigits = 1) {
  return `${new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0)}%`;
}

function formatNumber(value: number, maximumFractionDigits = 4) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatMonths(value: number) {
  return `${Math.round(Number.isFinite(value) ? value : 0)} maanden`;
}

function formatYears(value: number) {
  return `${Math.round(Number.isFinite(value) ? value : 0)} jaar`;
}

function formatBoolean(value: boolean) {
  return value ? "Ja" : "Nee";
}

function safeNumber(value: number | undefined | null) {
  return Number.isFinite(value ?? Number.NaN) ? (value as number) : 0;
}

function deriveStudentLoanBasePayment(input: MortgageMaxMortgageInput) {
  if (!input.studentLoan?.hasStudentLoan) {
    return 0;
  }

  if (input.studentLoan.status === "repaying") {
    return safeNumber(input.studentLoan.actualMonthlyPayment);
  }

  return safeNumber(input.studentLoan.statutoryMonthlyPayment);
}

function buildStudentLoanSummary(
  input: MortgageMaxMortgageInput,
  result: MortgageMaxMortgageResult,
) {
  if (!input.studentLoan?.hasStudentLoan) {
    return "Geen studieschuld opgegeven.";
  }

  const basePayment = deriveStudentLoanBasePayment(input);
  const monthlyImpact = result.breakdown.studentLoanMonthlyImpact;
  const grossUpFactor = basePayment > 0 ? monthlyImpact / basePayment : 0;

  return [
    `Status: ${input.studentLoan.status ?? "repaying"}`,
    `Basisbedrag: ${formatCurrency(basePayment, 2)} per maand`,
    `Brutering naar hypotheektoets: ${formatCurrency(monthlyImpact, 2)} per maand`,
    grossUpFactor > 0
      ? `Afgeleide bruteringfactor: ${formatNumber(grossUpFactor, 2)}x`
      : "Bruteringfactor kon niet worden afgeleid.",
  ].join(". ");
}

function limitingFactorLabel(result: MortgageMaxMortgageResult) {
  if (result.limitingFactor === "nhg") {
    return "NHG-grens";
  }
  if (result.limitingFactorDetailed === "both") {
    return "inkomen en woningwaarde";
  }
  if (result.limitingFactorDetailed === "collateral") {
    return "woningwaarde";
  }
  if (result.limitingFactorDetailed === "income") {
    return "inkomen";
  }
  return "onbekend";
}

function buildSources(result: MortgageMaxMortgageResult): MortgageReportSource[] {
  const sources: MortgageReportSource[] = [
    {
      key: "mortgage-regulation",
      title: "Wijzigingsregeling hypothecair krediet 2026",
      organization: "Ministerie van Financiën / Staatscourant",
      url:
        result.breakdown.financingLoadTableSourceUrl ??
        "https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html",
      appliesTo:
        "Financieringslastpercentages, inkomensnorm en energiebedragen voor normjaar 2026.",
    },
    {
      key: "lti-explanation",
      title: "Maximale hypotheek op basis van inkomen (LTI)",
      organization: "Volkshuisvesting Nederland",
      url: "https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-inkomen",
      appliesTo: "Toetsinkomen, annuïtaire toetsing en financiële verplichtingen.",
    },
    {
      key: "afm-test-rate",
      title: "Hypothecair krediet en toetsrente",
      organization: "Autoriteit Financiële Markten",
      url: "https://www.afm.nl/nl-nl/sector/themas/dienstverlening-aan-consumenten/financiele-producten/hypothecair-krediet",
      appliesTo: "Toetsrente bij een rentevaste periode korter dan tien jaar.",
    },
    {
      key: "student-loan",
      title: "Hoe zwaar telt mijn studieschuld mee voor mijn hypotheek?",
      organization: "Rijksoverheid",
      url: "https://www.rijksoverheid.nl/vraag-en-antwoord/huis-kopen/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek",
      appliesTo: "Gebruik van actuele of wettelijke DUO-maandlast in de hypotheektoets.",
    },
    {
      key: "ltv",
      title: "Maximale hypotheek op basis van woningwaarde (LTV)",
      organization: "Volkshuisvesting Nederland",
      url: "https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-woningwaarde-ltv",
      appliesTo: "Onderpandgrens en de uitzondering voor energiebesparende voorzieningen.",
    },
    {
      key: "nhg",
      title: "Een hypotheek met NHG",
      organization: "Nationale Hypotheek Garantie",
      url: "https://www.nhg.nl/het-product-nhg/een-hypotheek-met-nhg/",
      appliesTo: "NHG-grens en aanvullende voorwaarden.",
    },
  ];

  return sources;
}

function buildTimeline(
  input: MortgageMaxMortgageInput,
  result: MortgageMaxMortgageResult,
): MortgageCalculationTimelineStep[] {
  const fixedRatePeriodMonths = safeNumber(input.fixedRatePeriodMonths);
  const primaryIncome = safeNumber(input.grossAnnualHouseholdIncome);
  const partnerIncome = result.breakdown.partnerIncome;
  const otherLiabilities = Math.max(
    result.breakdown.monthlyLiabilityImpact -
      result.breakdown.studentLoanMonthlyImpact,
    0,
  );
  const purchasePrice = result.breakdown.purchasePrice;
  const renovationAmount = safeNumber(input.property?.renovationAmount);
  const tableVersion =
    result.breakdown.financingLoadTableVersion ??
    (result.breakdown.financingLoadSource === "input"
      ? "handmatig percentage"
      : "indicatieve fallback");
  const ageGroup =
    result.breakdown.financingLoadAgeGroup === "fromAow"
      ? "AOW-leeftijd bereikt"
      : "AOW-leeftijd niet bereikt";

  return [
    {
      step: 1,
      title: "Normset en rekenscenario vastleggen",
      explanation:
        "De berekening begint met het normjaar, de gebruikte financieringslasttabel en het gekozen hypotheekscenario.",
      lines: [
        { label: "Normjaar engine", value: String(result.normYear) },
        { label: "Financieringslasttabel", value: tableVersion },
        { label: "Leeftijdsgroep tabel", value: ageGroup },
        { label: "Aflossingsvorm voor toetsing", value: "Annuïtair" },
      ],
      outcome: {
        label: "Uitgangspunt",
        value: `Berekening volgens normjaar ${result.normYear}`,
      },
      sourceKeys: ["mortgage-regulation", "lti-explanation"],
    },
    {
      step: 2,
      title: "Toetsinkomen bepalen",
      explanation:
        "Het primaire bruto jaarinkomen en het geaccepteerde partnerinkomen vormen samen het huishoudelijke toetsinkomen.",
      formula: "toetsinkomen = primair inkomen + partnerinkomen",
      lines: [
        { label: "Primair inkomen", value: formatCurrency(primaryIncome, 2) },
        { label: "Partnerinkomen", value: formatCurrency(partnerIncome, 2) },
      ],
      outcome: {
        label: "Toetsinkomen",
        value: formatCurrency(result.debug.toetsinkomen, 2),
      },
      sourceKeys: ["lti-explanation"],
    },
    {
      step: 3,
      title: "Toetsrente bepalen",
      explanation:
        fixedRatePeriodMonths > 0 && fixedRatePeriodMonths < 120
          ? "De rente staat korter dan tien jaar vast. Daarom is de hoogste van de werkelijke rente en de opgegeven AFM-toetsrente gebruikt."
          : "De rente staat minimaal tien jaar vast of er is geen kortere periode opgegeven. De werkelijke rente is als toetsrente gebruikt.",
      formula:
        fixedRatePeriodMonths > 0 && fixedRatePeriodMonths < 120
          ? "toetsrente = max(werkelijke rente, AFM-toetsrente)"
          : "toetsrente = werkelijke rente",
      lines: [
        {
          label: "Werkelijke rente",
          value: formatPercent(result.breakdown.annualMortgageRateUsed),
        },
        {
          label: "Rentevaste periode",
          value: fixedRatePeriodMonths > 0 ? formatMonths(fixedRatePeriodMonths) : "niet opgegeven",
        },
        {
          label: "Bron toetsrente",
          value:
            result.breakdown.testRateSource === "afm_stress_rate"
              ? "AFM-toetsrente / stressrente"
              : "werkelijke rente",
        },
      ],
      outcome: {
        label: "Toetsrente",
        value: formatPercent(result.breakdown.testRateUsed),
      },
      sourceKeys: ["afm-test-rate"],
    },
    {
      step: 4,
      title: "Financieringslastpercentage opzoeken",
      explanation:
        "Het percentage wordt opgezocht met het toetsinkomen, de toetsrente en de leeftijdsgroep. Dit percentage bepaalt welk deel van het inkomen als bruto hypotheeklast beschikbaar is.",
      formula:
        "financieringslastpercentage = lookup(normjaar, toetsinkomen, toetsrente, leeftijdsgroep)",
      lines: [
        { label: "Tabelbron", value: tableVersion },
        { label: "Toetsinkomen", value: formatCurrency(result.debug.toetsinkomen, 2) },
        { label: "Toetsrente", value: formatPercent(result.breakdown.testRateUsed) },
      ],
      outcome: {
        label: "Financieringslastpercentage",
        value: formatPercent(result.breakdown.annualHousingCostRatio),
      },
      sourceKeys: ["mortgage-regulation"],
    },
    {
      step: 5,
      title: "Maximale bruto woonlast berekenen",
      explanation:
        "Het toetsinkomen wordt vermenigvuldigd met het financieringslastpercentage. De jaarlast wordt daarna gedeeld door twaalf.",
      formula:
        "jaarbudget = toetsinkomen x percentage; maandbudget = jaarbudget / 12",
      lines: [
        { label: "Maximale jaarlijkse woonlast", value: formatCurrency(result.debug.maxAnnualHousingCost, 2) },
      ],
      outcome: {
        label: "Maandbudget vóór verplichtingen",
        value: formatCurrency(result.breakdown.monthlyHousingBudgetBeforeLiabilities, 2),
      },
      sourceKeys: ["lti-explanation", "mortgage-regulation"],
    },
    {
      step: 6,
      title: "Financiële verplichtingen verwerken",
      explanation:
        "Contractuele maandlasten verlagen eerst het beschikbare hypotheekbudget. Ze worden niet achteraf als bedrag van de maximale hypotheek afgetrokken.",
      formula:
        "beschikbaar maandbudget = woonlastbudget - studieschuldimpact - overige verplichtingen",
      lines: [
        {
          label: "Studieschuldimpact",
          value: formatCurrency(result.breakdown.studentLoanMonthlyImpact, 2),
          note: buildStudentLoanSummary(input, result),
        },
        { label: "Overige verplichtingen", value: formatCurrency(otherLiabilities, 2) },
        {
          label: "Totaal verplichtingen",
          value: formatCurrency(result.breakdown.monthlyLiabilityImpact, 2),
        },
      ],
      outcome: {
        label: "Beschikbaar maandbudget na verplichtingen",
        value: formatCurrency(result.breakdown.monthlyHousingBudgetAfterLiabilities, 2),
      },
      sourceKeys: ["lti-explanation", "student-loan"],
    },
    {
      step: 7,
      title: "Maandbudget annuïtair omrekenen naar hoofdsom",
      explanation:
        "Het resterende maandbudget wordt met de toetsrente en looptijd omgerekend naar de basislening. Daarna worden alleen de toegestane bedragen voor energielabel en verduurzaming aan de inkomensruimte toegevoegd.",
      formula:
        "inkomenslimiet = annuïtaire basislening + energielabelruimte + verduurzamingsruimte",
      lines: [
        { label: "Toetsrente", value: formatPercent(result.debug.interestRate) },
        { label: "Looptijd", value: formatMonths(result.debug.durationMonths) },
        { label: "Annuïteitsfactor", value: formatNumber(result.debug.annuityFactor) },
        { label: "Basis hypotheekruimte uit inkomen", value: formatCurrency(result.breakdown.baseMaxMortgageByIncome, 2) },
        { label: "Toegepaste extra leenruimte op inkomen door energielabel", value: formatCurrency(result.breakdown.energyLabelAllowance, 2) },
        { label: "Toegepaste extra leenruimte op inkomen voor energiebesparende maatregelen", value: formatCurrency(result.breakdown.energySavingAllowance, 2) },
      ],
      outcome: {
        label: "Maximale hypotheek op inkomen",
        value: formatCurrency(result.maxMortgageByIncome, 2),
      },
      sourceKeys: ["lti-explanation"],
    },
    {
      step: 8,
      title: "Woningwaarde en LTV toetsen",
      explanation:
        "De woningwaardelimiet bestaat uit de basislimiet op woningwaarde plus uitsluitend de daadwerkelijk toegepaste extra LTV-ruimte voor energiebesparende maatregelen. De energielabelruimte verhoogt alleen de inkomensgrens.",
      formula: "woningwaardelimiet = woningwaarde x LTV-percentage + gefinancierde energiebesparende voorzieningen",
      lines: [
        { label: "Woningwaarde", value: formatCurrency(result.breakdown.propertyValue, 2) },
        { label: "LTV-percentage", value: formatPercent(result.breakdown.ltvPercentage) },
        { label: "Basislimiet op woningwaarde", value: formatCurrency(result.breakdown.baseMaxMortgageByLtv, 2) },
        { label: "Toegepaste extra LTV-ruimte voor energiebesparende maatregelen", value: formatCurrency(result.breakdown.energySavingAllowance, 2) },
        { label: "Extra leenruimte door energielabel", value: `${formatCurrency(result.breakdown.energyLabelAllowance, 2)}; alleen toegepast op de inkomensgrens` },
      ],
      outcome: {
        label: "Maximale hypotheek op woningwaarde",
        value:
          result.maxMortgageByCollateral === null
            ? "niet berekend"
            : formatCurrency(result.maxMortgageByCollateral, 2),
      },
      sourceKeys: ["ltv", "mortgage-regulation"],
    },
    {
      step: 9,
      title: "NHG-grens controleren",
      explanation:
        input.property?.nhgRequested
          ? "Omdat NHG is aangevraagd, wordt de toepasselijke NHG-grens als afzonderlijke bovengrens meegenomen."
          : "NHG is niet aangevraagd; deze grens speelt daarom niet mee in het eindminimum.",
      lines: [
        { label: "NHG gewenst", value: formatBoolean(Boolean(input.property?.nhgRequested)) },
        {
          label: "NHG-limiet in berekening",
          value:
            result.breakdown.maxMortgageByNhg === undefined
              ? "niet van toepassing"
              : formatCurrency(result.breakdown.maxMortgageByNhg, 2),
        },
      ],
      outcome: {
        label: "NHG-toets",
        value:
          result.breakdown.maxMortgageByNhg === undefined
            ? "overgeslagen"
            : "meegenomen als bovengrens",
      },
      sourceKeys: ["nhg"],
    },
    {
      step: 10,
      title: "Laagste relevante grens kiezen",
      explanation:
        "De eindhypotheek is het minimum van de inkomensgrens, woningwaardelimiet en NHG-grens voor zover deze van toepassing zijn.",
      formula: "eindmaximum = min(inkomenslimiet, woningwaardelimiet, NHG-limiet)",
      lines: [
        { label: "Inkomenslimiet", value: formatCurrency(result.maxMortgageByIncome, 2) },
        {
          label: "Woningwaardelimiet",
          value:
            result.maxMortgageByCollateral === null
              ? "niet beschikbaar"
              : formatCurrency(result.maxMortgageByCollateral, 2),
        },
        {
          label: "NHG-limiet",
          value:
            result.breakdown.maxMortgageByNhg === undefined
              ? "niet van toepassing"
              : formatCurrency(result.breakdown.maxMortgageByNhg, 2),
        },
      ],
      outcome: {
        label: `Einduitkomst, begrensd door ${limitingFactorLabel(result)}`,
        value: formatCurrency(result.finalMaxMortgage, 2),
      },
      sourceKeys: ["lti-explanation", "ltv", "nhg"],
    },
    {
      step: 11,
      title: "Eigen middelen en financieringstekort bepalen",
      explanation:
        "Eigen geld verhoogt de inkomenslimiet niet. Het wordt gebruikt voor aankoopkosten, renovatie en het resterende verschil tussen aankoop en hypotheek.",
      formula:
        "tekort = max(koopprijs + kosten + renovatie - hypotheek - eigen geld, 0)",
      lines: [
        { label: "Koopprijs", value: formatCurrency(purchasePrice, 2) },
        { label: "Kosten koper", value: formatCurrency(result.breakdown.buyerCostsEstimate, 2) },
        { label: "Renovatie", value: formatCurrency(renovationAmount, 2) },
        { label: "Eigen geld", value: formatCurrency(result.breakdown.ownFunds, 2) },
      ],
      outcome: {
        label: "Financieringstekort",
        value: formatCurrency(result.fundingGap, 2),
      },
      sourceKeys: ["ltv"],
    },
    {
      step: 12,
      title: "Werkelijke bruto maandlast bij eindbedrag tonen",
      explanation:
        "Na het bepalen van het eindmaximum wordt de indicatieve bruto annuïtaire maandlast berekend met de werkelijke hypotheekrente.",
      formula:
        "maandlast = hoofdsom x maandrente / (1 - (1 + maandrente)^-aantalMaanden)",
      lines: [
        { label: "Eindhypotheek", value: formatCurrency(result.finalMaxMortgage, 2) },
        { label: "Werkelijke rente", value: formatPercent(result.breakdown.annualMortgageRateUsed) },
        { label: "Looptijd", value: formatMonths(result.breakdown.mortgageTermMonths) },
      ],
      outcome: {
        label: "Indicatieve bruto maandlast",
        value: formatCurrency(result.monthlyPaymentGross, 2),
      },
      sourceKeys: ["lti-explanation"],
    },
  ];
}

export function buildMortgagePdfReport(
  input: MortgageMaxMortgageInput,
  result: MortgageMaxMortgageResult,
  options: BuildMortgagePdfReportOptions = {},
): MortgagePdfReport {
  const generatedAt = options.generatedAt ?? new Date();
  const generatedAtLabel = new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(generatedAt);
  const ownFunds = safeNumber(input.ownFunds);
  const purchasePrice = safeNumber(result.breakdown.purchasePrice);
  const renovationAmount = safeNumber(input.property?.renovationAmount);
  const propertyValue = safeNumber(
    input.property?.propertyValue ??
      input.property?.marketValue ??
      input.property?.purchasePrice,
  );
  const studentLoanImpactOnLeencapaciteit =
    result.breakdown.studentLoanMonthlyImpact > 0
      ? calculatePresentValueFromMonthlyPayment({
          monthlyPayment: result.breakdown.studentLoanMonthlyImpact,
          annualRate: result.debug.interestRate,
          years: result.debug.durationMonths / 12,
        })
      : 0;

  const summaryLines: MortgageReportLine[] = [
    { label: "Maximale hypotheek op inkomen", value: formatCurrency(result.maxMortgageByIncome, 2) },
    {
      label: "Maximale hypotheek op woningwaarde",
      value:
        result.maxMortgageByCollateral === null
          ? "n.v.t."
          : formatCurrency(result.maxMortgageByCollateral, 2),
    },
    { label: "Einduitkomst", value: formatCurrency(result.finalMaxMortgage, 2) },
    {
      label: "Maximaal koopbudget",
      value: result.maxHomeBudget === null ? "n.v.t." : formatCurrency(result.maxHomeBudget, 2),
    },
    {
      label: "Financieringstekort",
      value: formatCurrency(result.fundingGap, 2),
      note: result.fundingGap > 0 ? "Er is indicatief extra eigen geld nodig." : "Geen tekort zichtbaar.",
    },
    { label: "Bruto maandlast", value: formatCurrency(result.monthlyPaymentGross, 2) },
    {
      label: "Impact op leencapaciteit",
      value: formatCurrency(studentLoanImpactOnLeencapaciteit, 2),
      note:
        result.breakdown.studentLoanMonthlyImpact > 0
          ? "Contante waarde van de bruto DUO-maandlast; dit verlaagt de leencapaciteit indicatief."
          : "Geen DUO-impact zichtbaar op de leencapaciteit.",
    },
    {
      label: "Limiterend",
      value: limitingFactorLabel(result),
      note: `Betrouwbaarheid: ${result.confidence}.`,
    },
  ];

  const sections: MortgageReportSection[] = [
    {
      title: "Resultatentabel",
      subtitle: "De belangrijkste uitkomsten nadat alle tijdlijnstappen zijn uitgevoerd.",
      lines: summaryLines,
    },
    {
      title: "Gebruikte invoer",
      lines: [
        { label: "Huishoudinkomen", value: formatCurrency(result.breakdown.householdIncome, 2) },
        { label: "Partnerinkomen", value: formatCurrency(result.breakdown.partnerIncome, 2) },
        { label: "Hypotheekrente", value: formatPercent(result.breakdown.annualMortgageRateUsed) },
        { label: "Toetsrente", value: formatPercent(result.breakdown.testRateUsed) },
        { label: "Rentevaste periode", value: safeNumber(input.fixedRatePeriodMonths) > 0 ? formatMonths(safeNumber(input.fixedRatePeriodMonths)) : "niet opgegeven" },
        { label: "Looptijd", value: formatYears(input.mortgageTermYears ?? 0) },
        { label: "Koopprijs", value: formatCurrency(purchasePrice, 2) },
        { label: "Woningwaarde", value: propertyValue > 0 ? formatCurrency(propertyValue, 2) : "n.v.t." },
        { label: "Eigen geld", value: formatCurrency(ownFunds, 2) },
        { label: "NHG gewenst", value: formatBoolean(Boolean(input.property?.nhgRequested)) },
      ],
    },
    {
      title: "Inkomens- en verplichtingentabel",
      subtitle: "Controlewaarden voor de berekening op inkomen.",
      lines: [
        { label: "Financieringslastpercentage", value: formatPercent(result.breakdown.annualHousingCostRatio) },
        { label: "Tabelversie", value: result.breakdown.financingLoadTableVersion ?? result.breakdown.financingLoadSource },
        { label: "Maximale jaarlijkse woonlast", value: formatCurrency(result.debug.maxAnnualHousingCost, 2) },
        { label: "Maandbudget vóór verplichtingen", value: formatCurrency(result.breakdown.monthlyHousingBudgetBeforeLiabilities, 2) },
        { label: "Studieschuldimpact", value: formatCurrency(result.breakdown.studentLoanMonthlyImpact, 2), note: buildStudentLoanSummary(input, result) },
        { label: "Totale verplichtingen", value: formatCurrency(result.breakdown.monthlyLiabilityImpact, 2) },
        { label: "Maandbudget na verplichtingen", value: formatCurrency(result.breakdown.monthlyHousingBudgetAfterLiabilities, 2) },
        { label: "Annuïteitsfactor", value: formatNumber(result.debug.annuityFactor) },
        { label: "Basis hypotheekruimte uit inkomen", value: formatCurrency(result.breakdown.baseMaxMortgageByIncome, 2) },
        { label: "Toegepaste extra leenruimte op inkomen door energielabel", value: formatCurrency(result.breakdown.energyLabelAllowance, 2) },
        { label: "Toegepaste extra leenruimte op inkomen voor energiebesparende maatregelen", value: formatCurrency(result.breakdown.energySavingAllowance, 2) },
      ],
    },
    {
      title: "Woningwaarde, NHG en eigen middelen",
      lines: [
        { label: "Woningwaarde voor toetsing", value: formatCurrency(result.breakdown.propertyValue, 2) },
        { label: "LTV-percentage", value: formatPercent(result.breakdown.ltvPercentage) },
        { label: "Basislimiet op woningwaarde", value: formatCurrency(result.breakdown.baseMaxMortgageByLtv, 2) },
        { label: "Toegepaste extra LTV-ruimte voor energiebesparende maatregelen", value: formatCurrency(result.breakdown.energySavingAllowance, 2) },
        { label: "Maximale hypotheek op woningwaarde", value: result.maxMortgageByCollateral === null ? "n.v.t." : formatCurrency(result.maxMortgageByCollateral, 2) },
        { label: "NHG-limiet", value: result.breakdown.maxMortgageByNhg === undefined ? "n.v.t." : formatCurrency(result.breakdown.maxMortgageByNhg, 2) },
        { label: "Extra leenruimte door energielabel", value: `${formatCurrency(result.breakdown.energyLabelAllowance, 2)}; niet opgenomen in de woningwaardelimiet` },
        { label: "Kosten koper", value: formatCurrency(result.breakdown.buyerCostsEstimate, 2) },
        { label: "Verbouwing / renovatie", value: formatCurrency(renovationAmount, 2) },
        { label: "Benodigde eigen middelen", value: formatCurrency(result.breakdown.requiredOwnFunds, 2) },
      ],
    },
  ];

  return {
    title: "Maximale hypotheek",
    subtitle:
      "Volledige rekenvolgorde, uitkomsten, controlewaarden, aannames en bronnen.",
    generatedAt: generatedAtLabel,
    normYear: result.normYear,
    timeline: buildTimeline(input, result),
    summaryLines,
    sections,
    warnings: result.warnings.map((warning) => warning.message),
    assumptions: [...result.assumptions],
    sources: buildSources(result),
  };
}

export function mortgageReportFileName(result: MortgageMaxMortgageResult) {
  const amount = Math.round(
    Number.isFinite(result.finalMaxMortgage) ? result.finalMaxMortgage : 0,
  );
  return `hypotheek-rapport-${result.normYear}-${amount}.pdf`;
}
