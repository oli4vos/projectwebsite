import type {
  MortgageMaxMortgageInput,
  MortgageMaxMortgageResult,
} from "@/lib/mortgage/types";

export type MortgageReportLine = {
  label: string;
  value: string;
  note?: string;
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
  summaryLines: MortgageReportLine[];
  sections: MortgageReportSection[];
  warnings: string[];
  assumptions: string[];
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
      ? `Afgeleide bruteringfactor: ${new Intl.NumberFormat("nl-NL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(grossUpFactor)}x`
      : "Bruteringfactor kon niet worden afgeleid.",
  ].join(". ");
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
    input.property?.propertyValue ?? input.property?.marketValue ?? input.property?.purchasePrice,
  );

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
    {
      label: "Bruto maandlast",
      value: formatCurrency(result.monthlyPaymentGross, 2),
    },
    {
      label: "Limiterend",
      value:
        result.limitingFactorDetailed === "both"
          ? "inkomen en woningwaarde"
          : result.limitingFactorDetailed === "collateral"
            ? "woningwaarde"
            : result.limitingFactorDetailed === "income"
              ? "inkomen"
              : "onbekend",
      note: `Confidence: ${result.confidence}.`,
    },
  ];

  const sections: MortgageReportSection[] = [
    {
      title: "1. Uitkomst in het kort",
      subtitle: "De einduitkomst is de strengste van de inkomens- en woningwaardelimieten.",
      lines: summaryLines,
    },
    {
      title: "2. Invoer die is gebruikt",
      lines: [
        { label: "Huishoudinkomen", value: formatCurrency(result.breakdown.householdIncome, 2) },
        { label: "Partnerinkomen", value: formatCurrency(result.breakdown.partnerIncome, 2) },
        { label: "Hypotheekrente", value: formatPercent(result.breakdown.annualMortgageRateUsed) },
        { label: "Toetsrente", value: formatPercent(result.breakdown.testRateUsed) },
        { label: "Rentevaste periode", value: formatMonths(result.breakdown.mortgageTermMonths) },
        { label: "Looptijd", value: formatYears(input.mortgageTermYears ?? 0) },
        { label: "Koopprijs", value: formatCurrency(purchasePrice, 2) },
        { label: "Woningwaarde", value: propertyValue > 0 ? formatCurrency(propertyValue, 2) : "n.v.t." },
        { label: "Eigen geld", value: formatCurrency(ownFunds, 2) },
        { label: "Bruto maandlast overige schulden", value: formatCurrency(safeNumber(input.monthlyDebtPayments), 2) },
        { label: "NHG gewenst", value: formatBoolean(Boolean(input.property?.nhgRequested)) },
      ],
    },
    {
      title: "3. Inkomensberekening",
      subtitle: "Dit deel bepaalt hoeveel maandlasten het inkomen draagt.",
      lines: [
        { label: "Financieringslastpercentage", value: formatPercent(result.breakdown.annualHousingCostRatio) },
        { label: "Maximale jaarlijkse woonlast", value: formatCurrency(result.debug.maxAnnualHousingCost, 2) },
        {
          label: "Maandbudget vóór schulden",
          value: formatCurrency(result.breakdown.monthlyHousingBudgetBeforeLiabilities, 2),
        },
        {
          label: "Maandlast studieschuld",
          value: formatCurrency(result.breakdown.studentLoanMonthlyImpact, 2),
          note: buildStudentLoanSummary(input, result),
        },
        {
          label: "Totale maandlast overige verplichtingen",
          value: formatCurrency(result.breakdown.monthlyLiabilityImpact, 2),
          note: "Deze last wordt afgetrokken van het woonbudget vóór brutering.",
        },
        {
          label: "Beschikbaar maandbudget na schulden",
          value: formatCurrency(result.breakdown.monthlyHousingBudgetAfterLiabilities, 2),
        },
        {
          label: "Annuïteitsfactor",
          value: new Intl.NumberFormat("nl-NL", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }).format(result.debug.annuityFactor),
        },
        {
          label: "Maximale hypotheek op inkomen",
          value: formatCurrency(result.maxMortgageByIncome, 2),
          note:
            "Formule: beschikbaar maandbudget × annuïteitsfactor. Dit is de pure inkomenslimiet.",
        },
      ],
    },
    {
      title: "4. Woningwaarde- en koopbudgetberekening",
      subtitle: "Dit deel begrenst de hypotheek op basis van het onderpand en de aankoopkosten.",
      lines: [
        { label: "Woningwaarde voor toetsing", value: formatCurrency(result.breakdown.propertyValue, 2) },
        { label: "LTV-percentage", value: formatPercent(result.breakdown.ltvPercentage) },
        { label: "Maximale hypotheek op woningwaarde", value: result.maxMortgageByCollateral === null ? "n.v.t." : formatCurrency(result.maxMortgageByCollateral, 2) },
        { label: "Energieruimte", value: formatCurrency(result.breakdown.energySavingAllowance, 2) },
        { label: "Kosten koper", value: formatCurrency(result.breakdown.buyerCostsEstimate, 2) },
        { label: "Verbouwing / renovatie", value: formatCurrency(renovationAmount, 2) },
        {
          label: "Benodigde eigen middelen",
          value: formatCurrency(result.breakdown.requiredOwnFunds, 2),
          note: "Eigen geld verlaagt de benodigde externe financiering, maar verhoogt niet de inkomenslimiet.",
        },
        {
          label: "Maximaal koopbudget",
          value: result.maxHomeBudget === null ? "n.v.t." : formatCurrency(result.maxHomeBudget, 2),
          note: "Koopbudget = hypotheek + eigen geld - kosten koper - renovatie.",
        },
      ],
    },
    {
      title: "5. Debug- en tracewaarden",
      subtitle: "Deze waarden laten zien hoe de engine intern tot de uitkomst komt.",
      lines: [
        { label: "Toetsinkomen", value: formatCurrency(result.debug.toetsinkomen, 2) },
        { label: "Primair inkomen", value: formatCurrency(result.debug.primaryIncome, 2) },
        { label: "Partnerinkomen", value: formatCurrency(result.debug.partnerIncome, 2) },
        { label: "Maximale jaarlijkse woonlast", value: formatCurrency(result.debug.maxAnnualHousingCost, 2) },
        { label: "Maximale maandlast vóór schulden", value: formatCurrency(result.debug.maxMonthlyHousingCost, 2) },
        { label: "Maandlast van verplichtingen", value: formatCurrency(result.debug.monthlyObligations, 2) },
        {
          label: "Beschikbaar maandbudget na verplichtingen",
          value: formatCurrency(result.debug.availableMortgageMonthlyCost, 2),
        },
        { label: "Rente voor toetsing", value: formatPercent(result.debug.interestRate) },
        { label: "Toetsduur", value: formatMonths(result.debug.durationMonths) },
        {
          label: "Onderpandwaarde",
          value: result.debug.collateralValue === null ? "n.v.t." : formatCurrency(result.debug.collateralValue, 2),
        },
        {
          label: "LTV-percentage",
          value: result.debug.ltvPercentage === null ? "n.v.t." : formatPercent(result.debug.ltvPercentage),
        },
      ],
    },
    {
      title: "6. Waarschuwingen",
      subtitle: "De tool geeft hier expliciet aan waar de uitkomst indicatief of beperkt is.",
      lines:
        result.warnings.length > 0
          ? result.warnings.map((warning) => ({
              label: warning.code,
              value: warning.message,
            }))
          : [{ label: "Geen waarschuwingen", value: "De berekening liep zonder blokkades of extra waarschuwingen." }],
    },
    {
      title: "7. Aannames",
      subtitle: "Deze aannames komen uit de centrale hypotheeklaag en de gekozen invoer.",
      lines:
        result.assumptions.length > 0
          ? result.assumptions.map((assumption, index) => ({
              label: `Aanname ${index + 1}`,
              value: assumption,
            }))
          : [{ label: "Geen aannames", value: "Er zijn geen expliciete aannames beschikbaar." }],
    },
  ];

  return {
    title: "Maximale hypotheek - gedetailleerd PDF-rapport",
    subtitle:
      "Indicatieve uitleg van invoer, afleidingen, limieten en aannames voor de maximale hypotheektool.",
    generatedAt: generatedAtLabel,
    normYear: result.normYear,
    summaryLines,
    sections,
    warnings: result.warnings.map((warning) => warning.message),
    assumptions: [...result.assumptions],
  };
}

export function mortgageReportFileName(result: MortgageMaxMortgageResult) {
  const amount = Math.round(Number.isFinite(result.finalMaxMortgage) ? result.finalMaxMortgage : 0);
  return `hypotheek-rapport-${result.normYear}-${amount}.pdf`;
}
