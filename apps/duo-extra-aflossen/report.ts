import type { DuoExtraRepaymentFormValues, DuoExtraRepaymentView } from "./logic";

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
  text: (text: string | string[], x: number, y: number, options?: { maxWidth?: number; align?: "left" | "center" | "right" }) => PdfDocument;
  splitTextToSize: (text: string, size: number) => string[];
  save: (filename: string) => void;
};

type PdfLine = { label: string; value: string; note?: string };
type PdfSection = { title: string; subtitle?: string; lines?: PdfLine[]; paragraphs?: string[] };

export type DuoExtraRepaymentPdfReport = {
  title: string;
  subtitle: string;
  generatedAt: string;
  ruleVersion: string;
  sourceVersion: string;
  disclaimer: string;
  summaryLines: PdfLine[];
  sections: PdfSection[];
  warnings: string[];
  assumptions: string[];
  actionPoints: string[];
  sources: { title: string; organization: string; url: string; appliesTo: string }[];
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
function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}
function formatPercent(value: number) {
  return `${new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;
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
function drawPanel(doc: PdfDocument, x: number, y: number, width: number, height: number, fill = COLORS.card) {
  setFillColor(doc, fill);
  setDrawColor(doc, COLORS.hair);
  doc.roundedRect(x, y, width, height, 12, 12, "FD");
}
function renderTitle(doc: PdfDocument, title: string, subtitle?: string, y = PAGE_MARGIN) {
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const subtitleLines = subtitle ? doc.splitTextToSize(subtitle, width - 40) : [];
  const height = 56 + subtitleLines.length * 11;
  drawPanel(doc, PAGE_MARGIN, y, width, height);
  setFillColor(doc, COLORS.accentSoft);
  doc.roundedRect(PAGE_MARGIN + 14, y + 14, 4, 26, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setTextColor(doc, COLORS.ink);
  doc.text(title, PAGE_MARGIN + 28, y + 28, { maxWidth: width - 44 });
  if (subtitleLines.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setTextColor(doc, COLORS.muted);
    doc.text(subtitleLines, PAGE_MARGIN + 28, y + 44, { maxWidth: width - 44 });
  }
  return y + height + 10;
}
function renderParagraph(doc: PdfDocument, text: string, y: number) {
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const lines = doc.splitTextToSize(text, width);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setTextColor(doc, COLORS.ink2);
  doc.text(lines, PAGE_MARGIN, y + 12, { maxWidth: width });
  return lines.length * 12 + 2;
}
function renderSection(doc: PdfDocument, section: PdfSection, y: number) {
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const lines = section.lines ?? [];
  const paragraphs = section.paragraphs ?? [];
  const height = 48 + lines.length * 48 + paragraphs.length * 30;
  drawPanel(doc, PAGE_MARGIN, y, width, Math.max(height, 72));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, COLORS.ink);
  doc.text(section.title, PAGE_MARGIN + 16, y + 22);
  if (section.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, COLORS.muted);
    doc.text(doc.splitTextToSize(section.subtitle, width - 32), PAGE_MARGIN + 16, y + 36, {
      maxWidth: width - 32,
    });
  }

  let currentY = y + 52;
  paragraphs.forEach((paragraph) => {
    currentY += renderParagraph(doc, paragraph, currentY);
  });
  lines.forEach((line) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setTextColor(doc, COLORS.ink);
    doc.text(line.label, PAGE_MARGIN + 16, currentY + 11);
    doc.setFont("courier", "normal");
    setTextColor(doc, COLORS.ink2);
    doc.text(line.value, PAGE_MARGIN + width * 0.5, currentY + 11, { maxWidth: width * 0.45 });
    if (line.note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setTextColor(doc, COLORS.muted);
      doc.text(doc.splitTextToSize(line.note, width - 32), PAGE_MARGIN + 16, currentY + 24, {
        maxWidth: width - 32,
      });
    }
    currentY += 48;
  });
  return y + Math.max(height, currentY - y) + 10;
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
    doc.text("DUO studieschuld", PAGE_MARGIN, height - 18);
    doc.text(formatPageLabel(page, total), width - PAGE_MARGIN, height - 18, { align: "right" });
  }
}

export function buildDuoExtraRepaymentPdfReport(
  input: DuoExtraRepaymentFormValues,
  view: Extract<DuoExtraRepaymentView, { isValid: true }>,
  generatedAt = new Date(),
): DuoExtraRepaymentPdfReport {
  const before = view.result.timelineBefore;
  const after = view.result.timelineAfter;
  return {
    title: "Wat doet extra aflossen?",
    subtitle: "Vergelijk de huidige situatie met extra aflossen binnen dezelfde centrale DUO-resultaten.",
    generatedAt: new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(
      generatedAt,
    ),
    ruleVersion: view.normVersion,
    sourceVersion: view.duoRateYear ? String(view.duoRateYear) : view.normVersion,
    disclaimer:
      "Deze PDF is een indicatieve berekening op basis van de ingevoerde gegevens en DUO-bronnen. Het is geen DUO-beschikking en geen persoonlijk financieel advies.",
    summaryLines: [
      { label: "Openstaande schuld", value: formatCurrency(Number(input.remainingDebt || 0), 0) },
      { label: "Wettelijke termijn", value: formatCurrency(view.statutoryMonthlyPayment, 2) },
      { label: "Extra eenmalig", value: formatCurrency(view.result.extraRepaymentUsed, 0) },
      { label: "Extra per maand", value: formatCurrency(view.result.extraMonthlyAmountUsed, 0) },
      { label: "Oude einddatum", value: before.payoffDate ?? "Onbekend" },
      { label: "Nieuwe einddatum", value: after.payoffDate ?? "Onbekend" },
    ],
    sections: [
      {
        title: "Invoer",
        lines: [
          { label: "Openstaande studieschuld", value: formatCurrency(Number(input.remainingDebt || 0), 0) },
          { label: "Terugbetalingsregel", value: input.repaymentRule },
          { label: "DUO-rentejaar", value: input.duoRateYear },
          { label: "Huidige maandtermijn", value: input.currentMonthlyPayment.trim() ? formatCurrency(Number(input.currentMonthlyPayment), 2) : "Niet ingevuld" },
          { label: "Eenmalig extra aflossen", value: formatCurrency(Number(input.oneTimeExtraRepayment || 0), 0) },
          { label: "Extra per maand", value: formatCurrency(Number(input.monthlyExtraRepayment || 0), 0) },
          { label: "Strategie", value: input.strategy === "lowerMonthlyPayment" ? "Lagere maandlast" : "Kortere looptijd" },
          { label: "Leningdelen", value: input.useDebtParts ? `${input.debtParts.length} delen` : "Niet gebruikt" },
        ],
      },
      {
        title: "Resultaten",
        lines: [
          { label: "Gewogen DUO-rente", value: formatPercent(view.annualInterestRate) },
          { label: "Wettelijke maandtermijn", value: formatCurrency(view.statutoryMonthlyPayment, 2) },
          { label: "Nieuwe verplichte maandtermijn", value: formatCurrency(view.result.newRequiredMonthlyPayment, 2) },
          { label: "Indicatieve rentebesparing", value: formatCurrency(view.result.interestSaved, 0) },
          { label: "Maanden bespaard", value: String(view.result.payoffImpact.monthsSaved) },
          { label: "Nieuwe resterende schuld", value: formatCurrency(view.result.newRemainingDebt, 0) },
        ],
      },
      {
        title: "Toelichting",
        paragraphs: [
          "Het wettelijke maandbedrag blijft de basis. Alles daarboven is vrijwillig extra aflossen. De tijdlijn laat zien dat rente doorloopt, ook wanneer je tijdelijk aflost of een andere strategie kiest.",
        ],
      },
    ],
    warnings: view.result.warnings,
    assumptions: [
      "De tool rekent op maandbasis en gebruikt de centrale DUO-rente- en termijndata.",
      "Extra aflossen is boetevrij en verlaagt de schuld niet onder nul.",
    ],
    actionPoints: [
      "Controleer je actuele DUO-schuld en maandbedrag in Mijn DUO.",
      "Bekijk of een eenmalige aflossing of maandelijkse aflossing beter past bij je buffer.",
    ],
    sources: [
      {
        title: "Berekening maandbedrag studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp",
        appliesTo: "Wettelijke maandtermijn en rentelogica.",
      },
      {
        title: "Terugbetalingsregels studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/terugbetalingsregels.jsp",
        appliesTo: "Aflossing, rente en looptijd.",
      },
      {
        title: "Terugbetalen studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/",
        appliesTo: "Algemene toelichting op aflossen en extra betalen.",
      },
    ],
  };
}

function renderReport(doc: PdfDocument, report: DuoExtraRepaymentPdfReport) {
  drawBackground(doc);
  let y = PAGE_MARGIN;
  y = renderTitle(doc, report.title, report.subtitle, y);
  y = renderSection(
    doc,
    {
      title: "Samenvatting",
      lines: report.summaryLines,
    },
    y,
  );
  report.sections.forEach((section) => {
    if (y > doc.internal.pageSize.getHeight() - 140) {
      doc.addPage();
      drawBackground(doc);
      y = PAGE_MARGIN;
    }
    y = renderSection(doc, section, y);
  });
  y = renderSection(
    doc,
    {
      title: "Bronnen, aannames en waarschuwingen",
      paragraphs: [
        `Bronversie: ${report.sourceVersion}`,
        `Regelversie: ${report.ruleVersion}`,
        report.disclaimer,
        ...report.warnings,
        ...report.assumptions,
        ...report.actionPoints,
      ],
      lines: report.sources.map((source) => ({
        label: source.organization,
        value: source.title,
        note: `${source.appliesTo}. ${source.url}`,
      })),
    },
    y,
  );
  void y;
  renderFooter(doc);
}

export function duoExtraRepaymentReportFileName(view: DuoExtraRepaymentView) {
  const year = view.isValid ? view.duoRateYear : 0;
  return `duo-extra-aflossen-${year}.pdf`;
}

export async function downloadDuoExtraRepaymentPdfReport(
  input: DuoExtraRepaymentFormValues,
  view: Extract<DuoExtraRepaymentView, { isValid: true }>,
) {
  const { jsPDF } = await import("jspdf");
  const report = buildDuoExtraRepaymentPdfReport(input, view);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  renderReport(doc as unknown as PdfDocument, report);
  doc.save(duoExtraRepaymentReportFileName(view));
}
