import {
  LAST_CHECKED,
  type HypotheekImpactInput,
  type HypotheekImpactResult,
} from "./logic";

type PdfDocument = {
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
  addPage: () => PdfDocument;
  setPage: (pageNumber: number) => PdfDocument;
  getNumberOfPages: () => number;
  setFont: (fontName: string, fontStyle?: "normal" | "bold" | "italic") => PdfDocument;
  setFontSize: (size: number) => PdfDocument;
  setTextColor: (r: number, g?: number, b?: number) => PdfDocument;
  setDrawColor: (r: number, g?: number, b?: number) => PdfDocument;
  setFillColor: (r: number, g?: number, b?: number) => PdfDocument;
  setLineWidth: (width: number) => PdfDocument;
  rect: (x: number, y: number, width: number, height: number, style?: "S" | "F" | "FD") => PdfDocument;
  roundedRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    ry?: number,
    style?: "S" | "F" | "FD",
  ) => PdfDocument;
  line: (x1: number, y1: number, x2: number, y2: number) => PdfDocument;
  text: (
    text: string | string[],
    x: number,
    y: number,
    options?: { maxWidth?: number; align?: "left" | "center" | "right" },
  ) => PdfDocument;
  splitTextToSize: (text: string, size: number) => string[];
  save: (filename: string) => void;
};

export type HypotheekImpactPdfLine = { label: string; value: string; note?: string };
export type HypotheekImpactPdfSection = {
  title: string;
  subtitle?: string;
  lines?: HypotheekImpactPdfLine[];
  paragraphs?: string[];
};
export type HypotheekImpactPdfSource = {
  title: string;
  organization: string;
  url: string;
  appliesTo: string;
  lastChecked: string;
};

export type HypotheekImpactPdfReport = {
  title: string;
  subtitle: string;
  generatedAt: string;
  sourceVersion: string;
  disclaimer: string;
  summaryLines: HypotheekImpactPdfLine[];
  sections: HypotheekImpactPdfSection[];
  assumptions: string[];
  warnings: string[];
  sources: HypotheekImpactPdfSource[];
};

const PAGE_MARGIN = 40;
const COLORS = {
  paper: [246, 246, 244] as const,
  card: [255, 255, 255] as const,
  ink: [23, 23, 23] as const,
  ink2: [50, 50, 48] as const,
  muted: [104, 104, 100] as const,
  hair: [222, 222, 217] as const,
  accent: [72, 105, 155] as const,
  accentSoft: [230, 236, 244] as const,
  warningSoft: [252, 238, 224] as const,
};

function setTextColor(doc: PdfDocument, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: PdfDocument, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function setFillColor(doc: PdfDocument, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

export function formatHypotheekImpactCurrency(value: number, digits = 2) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatHypotheekImpactPercent(value: number, digits = 2) {
  return `${new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`;
}

function formatOptionalCurrency(value?: number) {
  return value === undefined ? "Niet ingevuld" : formatHypotheekImpactCurrency(value);
}

function formatOptionalYears(value?: number) {
  return value === undefined ? "Standaardlooptijd gebruikt" : `${value} jaar`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatPageLabel(page: number, total: number) {
  return `Pagina ${page} van ${total}`;
}

function drawBackground(doc: PdfDocument) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  setFillColor(doc, COLORS.paper);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}

function drawPanel(
  doc: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: readonly [number, number, number] = COLORS.card,
) {
  setFillColor(doc, fill);
  setDrawColor(doc, COLORS.hair);
  doc.roundedRect(x, y, width, height, 12, 12, "FD");
}

function splitLine(doc: PdfDocument, text: string, width: number) {
  return doc.splitTextToSize(text, width);
}

function estimateSectionHeight(doc: PdfDocument, section: HypotheekImpactPdfSection) {
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const contentWidth = width - 32;
  const valueWidth = width * 0.43;
  const subtitleLines = section.subtitle ? splitLine(doc, section.subtitle, contentWidth) : [];
  const paragraphHeight = (section.paragraphs ?? []).reduce((total, paragraph) => {
    return total + splitLine(doc, paragraph, contentWidth).length * 12 + 8;
  }, 0);
  const lineHeight = (section.lines ?? []).reduce((total, line) => {
    const valueLines = splitLine(doc, line.value, valueWidth).length;
    const noteLines = line.note ? splitLine(doc, line.note, contentWidth).length : 0;
    return total + Math.max(28, valueLines * 11 + noteLines * 10 + 12);
  }, 0);

  return Math.max(72, 38 + subtitleLines.length * 10 + paragraphHeight + lineHeight);
}

function ensureSpace(doc: PdfDocument, y: number, neededHeight: number) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (y + neededHeight <= pageHeight - PAGE_MARGIN - 24) {
    return y;
  }

  doc.addPage();
  drawBackground(doc);
  return PAGE_MARGIN;
}

function renderTitle(doc: PdfDocument, report: HypotheekImpactPdfReport, y = PAGE_MARGIN) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = pageWidth - PAGE_MARGIN * 2;
  const subtitleLines = splitLine(doc, report.subtitle, width - 40);
  const height = 78 + subtitleLines.length * 11;
  drawPanel(doc, PAGE_MARGIN, y, width, height);
  setFillColor(doc, COLORS.accentSoft);
  doc.roundedRect(PAGE_MARGIN + 14, y + 14, 4, 26, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setTextColor(doc, COLORS.ink);
  doc.text(report.title, PAGE_MARGIN + 28, y + 28, { maxWidth: width - 44 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setTextColor(doc, COLORS.muted);
  doc.text(subtitleLines, PAGE_MARGIN + 28, y + 44, { maxWidth: width - 44 });
  doc.text(`Gemaakt op ${report.generatedAt}`, PAGE_MARGIN + 28, y + height - 16, {
    maxWidth: width - 44,
  });
  return y + height + 10;
}

function renderSection(doc: PdfDocument, section: HypotheekImpactPdfSection, y: number) {
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const contentWidth = width - 32;
  const valueX = PAGE_MARGIN + width * 0.52;
  const valueWidth = width * 0.43;
  const estimatedHeight = estimateSectionHeight(doc, section);
  const topY = ensureSpace(doc, y, estimatedHeight);
  drawPanel(
    doc,
    PAGE_MARGIN,
    topY,
    width,
    estimatedHeight,
    section.title.includes("Waarschuwingen") ? COLORS.warningSoft : COLORS.card,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, COLORS.ink);
  doc.text(section.title, PAGE_MARGIN + 16, topY + 22, { maxWidth: contentWidth });

  let currentY = topY + 38;
  if (section.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, COLORS.muted);
    const subtitleLines = splitLine(doc, section.subtitle, contentWidth);
    doc.text(subtitleLines, PAGE_MARGIN + 16, currentY, { maxWidth: contentWidth });
    currentY += subtitleLines.length * 10 + 10;
  }

  (section.paragraphs ?? []).forEach((paragraph) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setTextColor(doc, COLORS.ink2);
    const lines = splitLine(doc, paragraph, contentWidth);
    doc.text(lines, PAGE_MARGIN + 16, currentY, { maxWidth: contentWidth });
    currentY += lines.length * 12 + 8;
  });

  (section.lines ?? []).forEach((line) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setTextColor(doc, COLORS.ink);
    doc.text(line.label, PAGE_MARGIN + 16, currentY + 10, { maxWidth: width * 0.45 });
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    setTextColor(doc, COLORS.ink2);
    const valueLines = splitLine(doc, line.value, valueWidth);
    doc.text(valueLines, valueX, currentY + 10, { maxWidth: valueWidth });
    currentY += Math.max(22, valueLines.length * 11 + 8);

    if (line.note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setTextColor(doc, COLORS.muted);
      const noteLines = splitLine(doc, line.note, contentWidth);
      doc.text(noteLines, PAGE_MARGIN + 16, currentY, { maxWidth: contentWidth });
      currentY += noteLines.length * 10 + 8;
    }
  });

  return topY + Math.max(estimatedHeight, currentY - topY + 12) + 10;
}

function renderFooter(doc: PdfDocument) {
  const total = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    setDrawColor(doc, COLORS.hair);
    doc.line(PAGE_MARGIN, height - 32, width - PAGE_MARGIN, height - 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setTextColor(doc, COLORS.muted);
    doc.text("Hypotheek-impact studieschuld", PAGE_MARGIN, height - 18);
    doc.text(formatPageLabel(page, total), width - PAGE_MARGIN, height - 18, {
      align: "right",
    });
  }
}

function buildInputLines(input: HypotheekImpactInput, result: HypotheekImpactResult) {
  return [
    { label: "DUO-situatie", value: input.situation },
    { label: "Terugbetalingsregel", value: input.repaymentRule },
    {
      label: "Huidig DUO-maandbedrag",
      value: formatOptionalCurrency(input.actualMonthlyPayment),
    },
    {
      label: "Wettelijk DUO-maandbedrag",
      value: formatOptionalCurrency(input.statutoryMonthlyPayment),
    },
    {
      label: "Resterende studieschuld",
      value: formatHypotheekImpactCurrency(result.remainingStudentDebt),
      note: input.duoDebtParts?.length
        ? `Gebaseerd op ${input.duoDebtParts.length} leningdelen uit de invoer.`
        : "Gebaseerd op het ingevulde bedrag.",
    },
    {
      label: "DUO-rente",
      value: formatHypotheekImpactPercent(result.duoRateUsed),
      note: input.duoDebtParts?.length
        ? "Gewogen rente uit de opgegeven leningdelen."
        : `Rentejaar ${input.duoRateYear ?? result.debtPortfolio.rateYearUsed}.`,
    },
    { label: "Resterende looptijd", value: formatOptionalYears(input.remainingTermYears) },
    {
      label: "Extra aflossen",
      value: formatHypotheekImpactCurrency(input.extraRepayment ?? 0),
    },
  ];
}

function buildHousingLines(input: HypotheekImpactInput, result: HypotheekImpactResult) {
  return [
    { label: "Bruto jaarinkomen", value: formatHypotheekImpactCurrency(input.grossIncomeUser, 0) },
    {
      label: "Bruto partnerinkomen",
      value: formatHypotheekImpactCurrency(input.grossIncomePartner, 0),
    },
    { label: "Totaal inkomen", value: formatHypotheekImpactCurrency(result.grossIncomeTotal, 0) },
    { label: "Woningprijs", value: formatOptionalCurrency(input.desiredHomePrice) },
    { label: "Eigen geld", value: formatOptionalCurrency(input.ownMoney) },
    {
      label: "Max hypotheek zonder studieschuld",
      value: formatOptionalCurrency(input.maxMortgageWithoutStudentDebt),
    },
    { label: "Hypotheekrente", value: formatHypotheekImpactPercent(input.mortgageRate) },
    { label: "Hypotheeklooptijd", value: `${input.mortgageTermYears} jaar` },
  ];
}

function buildResultSections(result: HypotheekImpactResult): HypotheekImpactPdfSection[] {
  const sections: HypotheekImpactPdfSection[] = [
    {
      title: "Resultaten: DUO-bedrag",
      subtitle: "Dezelfde resultaatdata als de webinterface gebruikt na submit.",
      lines: [
        {
          label: "Verplicht DUO-bedrag",
          value: formatHypotheekImpactCurrency(
            result.duoMandatoryPayment.requiredMonthlyPayment,
          ),
        },
        {
          label: "Feitelijk of relevant DUO-bedrag",
          value: formatHypotheekImpactCurrency(result.duoPayment.primaryNetMonthlyPayment),
          note: result.duoPayment.explanation,
        },
        {
          label: "Geschatte wettelijke termijn",
          value: formatHypotheekImpactCurrency(result.duoPayment.estimatedStatutoryPayment),
        },
        {
          label: "Keuzezone boven verplichting",
          value: formatHypotheekImpactCurrency(
            result.duoMandatoryPayment.remainingChoiceBudgetMonthly,
          ),
        },
      ],
    },
    {
      title: "Resultaten: hypotheekimpact",
      subtitle: "Netto DUO-last, bruteringsbasis en annuïtaire vertaling naar hoofdsom.",
      lines: [
        {
          label: "Bruteringsbasis",
          value: formatHypotheekImpactCurrency(
            result.mortgageImpact.bruteringBaseMonthlyPayment,
          ),
        },
        {
          label: "Bruteringsfactor",
          value: result.mortgageImpact.bruteringFactor.toLocaleString("nl-NL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          note: result.mortgageImpact.bruteringLabel,
        },
        {
          label: "Bruto DUO-maandlast",
          value: formatHypotheekImpactCurrency(result.mortgageImpact.grossDuoMonthlyImpact),
        },
        {
          label: "Impact op leencapaciteit",
          value: formatHypotheekImpactCurrency(result.mortgageImpact.principalImpact),
        },
      ],
    },
    {
      title: "Scenario extra aflossen",
      subtitle: "Alleen het effect op de DUO-maandlast; de PDF rekent dit niet opnieuw uit.",
      lines: [
        {
          label: "Extra aflossing gebruikt",
          value: formatHypotheekImpactCurrency(
            result.extraRepaymentScenario.extraRepaymentUsed,
          ),
        },
        {
          label: "Schuld na extra aflossen",
          value: formatHypotheekImpactCurrency(result.extraRepaymentScenario.newStudentDebt),
        },
        {
          label: "Lagere DUO-maandtermijn",
          value: formatHypotheekImpactCurrency(
            result.extraRepaymentScenario.monthlyPaymentReduction,
          ),
        },
        {
          label: "Indicatieve extra hypotheekruimte",
          value: formatHypotheekImpactCurrency(
            result.extraRepaymentScenario.extraMortgageRoomIndicative,
          ),
        },
      ],
    },
    {
      title: "Indicatieve inkomensruimte",
      lines: [
        {
          label: "Max hypotheek op inkomen",
          value: formatHypotheekImpactCurrency(
            result.incomeCapacity.incomeBasedMaxMortgageIndicative,
          ),
        },
        {
          label: "Max hypotheek na studieschuld",
          value: formatHypotheekImpactCurrency(
            result.incomeCapacity.incomeBasedMaxMortgageWithStudentDebtIndicative,
          ),
        },
      ],
    },
  ];

  if (result.housingTarget) {
    sections.push({
      title: "Woningdoel",
      lines: [
        {
          label: "Benodigde hypotheek",
          value: formatHypotheekImpactCurrency(result.housingTarget.neededMortgage),
        },
        {
          label: "Indicatieve hypotheekbehoefte incl. studieschuld",
          value: formatHypotheekImpactCurrency(
            result.housingTarget.indicativeMortgageNeedWithStudentDebt,
          ),
        },
        {
          label: "Resterend gat bij max hypotheek",
          value:
            result.housingTarget.gapToTargetIfMaxProvided === undefined
              ? "Niet ingevuld"
              : formatHypotheekImpactCurrency(result.housingTarget.gapToTargetIfMaxProvided),
        },
      ],
    });
  }

  return sections;
}

export function buildHypotheekImpactPdfReport(
  input: HypotheekImpactInput,
  result: HypotheekImpactResult,
  generatedAt = new Date(),
): HypotheekImpactPdfReport {
  const assumptions = [
    ...result.assumptions,
    ...result.mortgageImpact.assumptions,
    "De studieschuldbrutering is een indicatieve projectaanname en geen bindend acceptatiebeleid van een geldverstrekker.",
    "Controleer je openstaande schuld, rentejaar, maandbedrag en eventuele leningdelen in Mijn DUO voordat je deze PDF gebruikt in een hypotheekgesprek.",
  ].filter((item, index, all) => item.trim().length > 0 && all.indexOf(item) === index);
  const warnings = [
    ...result.warnings,
    ...result.duoMandatoryPayment.warnings,
    ...result.extraRepaymentScenario.warnings,
  ].filter((item, index, all) => item.trim().length > 0 && all.indexOf(item) === index);

  return {
    title: "Hypotheek-impact van je studieschuld",
    subtitle:
      "PDF-overzicht op basis van dezelfde gevalideerde invoer, domeinberekening en resultaatdata als de webinterface.",
    generatedAt: formatDateTime(generatedAt),
    sourceVersion: LAST_CHECKED,
    disclaimer:
      "Deze PDF is een indicatieve berekening op basis van de ingevoerde gegevens en centrale brondata. Het is geen hypotheekadvies, geen DUO-beschikking en geen bindende acceptatie van een geldverstrekker.",
    summaryLines: [
      {
        label: "Verplicht DUO-bedrag",
        value: formatHypotheekImpactCurrency(
          result.duoMandatoryPayment.requiredMonthlyPayment,
        ),
      },
      {
        label: "Bruto DUO-maandlast hypotheek",
        value: formatHypotheekImpactCurrency(result.mortgageImpact.grossDuoMonthlyImpact),
      },
      {
        label: "Impact op leencapaciteit",
        value: formatHypotheekImpactCurrency(result.mortgageImpact.principalImpact),
      },
      {
        label: "Schuld na extra aflossen",
        value: formatHypotheekImpactCurrency(result.extraRepaymentScenario.newStudentDebt),
      },
    ],
    sections: [
      {
        title: "Invoer: studieschuld",
        subtitle: "Controleer deze waarden in Mijn DUO bij je schuld, rente en maandbedrag.",
        lines: buildInputLines(input, result),
      },
      {
        title: "Invoer: inkomen en woning",
        subtitle: "Deze bedragen komen uit de ingediende formulierwaarden.",
        lines: buildHousingLines(input, result),
      },
      ...buildResultSections(result),
      {
        title: "Aannames",
        paragraphs: assumptions,
      },
      {
        title: "Waarschuwingen",
        paragraphs: warnings.length > 0 ? warnings : ["Geen aanvullende waarschuwingen."],
      },
    ],
    assumptions,
    warnings,
    sources: [
      {
        title: "Hoe zwaar telt mijn studieschuld mee voor mijn hypotheek?",
        organization: "Rijksoverheid",
        url: "https://www.rijksoverheid.nl/vraag-en-antwoord/huis-kopen/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek",
        appliesTo: "Publieke toelichting op studieschuld en hypotheek.",
        lastChecked: LAST_CHECKED,
      },
      {
        title: "Berekening maandbedrag studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp",
        appliesTo: "Wettelijk maandbedrag, draagkracht en Mijn DUO-verwijzing.",
        lastChecked: LAST_CHECKED,
      },
      {
        title: "Terugbetalingsregels studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/terugbetalingsregels.jsp",
        appliesTo: "Terugbetalingsregels, looptijden en rentecontext.",
        lastChecked: LAST_CHECKED,
      },
    ],
  };
}

function renderReport(doc: PdfDocument, report: HypotheekImpactPdfReport) {
  let y = PAGE_MARGIN;

  drawBackground(doc);
  y = renderTitle(doc, report, y);
  y = renderSection(doc, { title: "Samenvatting", lines: report.summaryLines }, y);
  report.sections.forEach((section) => {
    y = renderSection(doc, section, y);
  });
  y = renderSection(
    doc,
    {
      title: "Bronnen en disclaimer",
      paragraphs: [
        `Bronversie: ${report.sourceVersion}`,
        report.disclaimer,
        "Geraadpleegde brondata staan hieronder per organisatie vermeld.",
      ],
      lines: report.sources.map((source) => ({
        label: source.organization,
        value: source.title,
        note: `${source.appliesTo}. Laatst gecontroleerd: ${source.lastChecked}. ${source.url}`,
      })),
    },
    y,
  );
  void y;
  renderFooter(doc);
}

export function hypotheekImpactReportFileName(generatedAt = new Date()) {
  const parts = new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Europe/Amsterdam",
  }).formatToParts(generatedAt);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const yearMonth = `${year}-${month}`;
  return `hypotheek-impact-studieschuld-${yearMonth}.pdf`;
}

export async function downloadHypotheekImpactPdfReport(
  input: HypotheekImpactInput,
  result: HypotheekImpactResult,
) {
  const { jsPDF } = await import("jspdf");
  const report = buildHypotheekImpactPdfReport(input, result);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  renderReport(doc as unknown as PdfDocument, report);
  doc.save(hypotheekImpactReportFileName());
}
