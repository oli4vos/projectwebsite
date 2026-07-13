import type {
  DuoMonthlyPaymentFormValues,
  DuoMonthlyPaymentView,
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
  text: (text: string | string[], x: number, y: number, options?: { maxWidth?: number; align?: "left" | "center" | "right" }) => PdfDocument;
  splitTextToSize: (text: string, size: number) => string[];
  save: (filename: string) => void;
};

type PdfLine = { label: string; value: string; note?: string };
type PdfSection = { title: string; subtitle?: string; lines?: PdfLine[]; paragraphs?: string[] };
type PdfSource = { title: string; organization: string; url: string; appliesTo: string };

export type DuoMonthlyPaymentPdfReport = {
  title: string;
  subtitle: string;
  generatedAt: string;
  ruleVersion: string;
  sourceVersion: string;
  disclaimer: string;
  sections: PdfSection[];
  summaryLines: PdfLine[];
  warnings: string[];
  assumptions: string[];
  actionPoints: string[];
  sources: PdfSource[];
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
  return `${new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
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
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = pageWidth - PAGE_MARGIN * 2;
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
  const height = 48 + lines.length * 50 + paragraphs.length * 30;
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
    doc.text(line.value, PAGE_MARGIN + width * 0.52, currentY + 11, { maxWidth: width * 0.43 });
    if (line.note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setTextColor(doc, COLORS.muted);
      doc.text(doc.splitTextToSize(line.note, width - 32), PAGE_MARGIN + 16, currentY + 24, {
        maxWidth: width - 32,
      });
    }
    currentY += 50;
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

export function buildDuoMonthlyPaymentPdfReport(
  input: DuoMonthlyPaymentFormValues,
  view: Extract<DuoMonthlyPaymentView, { isValid: true }>,
  generatedAt = new Date(),
): DuoMonthlyPaymentPdfReport {
  return {
    title: "Wat wordt mijn DUO-maandbedrag?",
    subtitle: "Wettelijke termijn en draagkrachtindicatie op basis van dezelfde centrale DUO-data.",
    generatedAt: new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(
      generatedAt,
    ),
    ruleVersion: view.normVersion,
    sourceVersion: view.year ? String(view.year) : view.normVersion,
    disclaimer:
      "Deze PDF is een indicatieve berekening op basis van de ingevoerde gegevens en DUO-bronnen. Het is geen DUO-beschikking en geen persoonlijk financieel advies.",
    sections: [
      {
        title: "Invoer",
        subtitle: "Gegevens die in Mijn DUO of via een eigen schatting zijn ingevuld.",
        lines: [
          { label: "Openstaande studieschuld", value: formatCurrency(Number(input.remainingDebt || 0), 0) },
          { label: "Terugbetalingsregel", value: input.repaymentRule },
          { label: "DUO-rentejaar", value: input.duoRateYear },
          { label: "Toetsingsinkomen", value: input.assessmentIncome.trim() ? formatCurrency(Number(input.assessmentIncome), 0) : "Niet ingevuld" },
          { label: "Huishoudsituatie", value: input.householdSituation === "partner" ? "Met partner of alleenstaande ouder" : "Alleenstaand" },
          { label: "Leningdelen", value: input.useDebtParts ? `${input.debtParts.length} delen` : "Niet gebruikt" },
        ],
      },
      {
        title: "Kernresultaten",
        subtitle: "Dezelfde bedragen als in de webinterface.",
        lines: [
          { label: "Wettelijke maandtermijn", value: formatCurrency(view.statutoryMonthlyPayment, 2) },
          { label: "Gewogen DUO-rente", value: `${formatPercent(view.annualInterestRate)} ` },
          { label: "Looptijd", value: `${view.termYears} jaar` },
          {
            label: "Draagkrachtindicatie",
            value: view.incomeBased ? formatCurrency(view.incomeBased.requiredMonthlyPayment, 2) : "Niet beschikbaar",
          },
          {
            label: "Te betalen bedrag",
            value: view.duoMonthlyPaymentUsed ? formatCurrency(view.duoMonthlyPaymentUsed, 2) : formatCurrency(view.statutoryMonthlyPayment, 2),
            note: view.incomeBased
              ? "DUO gebruikt het laagste bedrag van wettelijke termijn en draagkrachtindicatie."
              : "Alleen wettelijke termijn berekend.",
          },
          { label: "Normversie", value: view.normVersion },
        ],
      },
      {
        title: "Toelichting",
        paragraphs: [
          "Het wettelijke maandbedrag is de basis voor terugbetalen. Als een draagkrachtindicatie lager uitvalt, gebruikt DUO het laagste bedrag. Bedragen uit leningdelen worden apart herleidbaar gehouden.",
        ],
      },
    ],
    summaryLines: [
      { label: "Openstaande schuld", value: formatCurrency(Number(input.remainingDebt || 0), 0) },
      { label: "Wettelijke maandtermijn", value: formatCurrency(view.statutoryMonthlyPayment, 2) },
      {
        label: "Indicatief te betalen",
        value: view.duoMonthlyPaymentUsed ? formatCurrency(view.duoMonthlyPaymentUsed, 2) : formatCurrency(view.statutoryMonthlyPayment, 2),
      },
    ],
    warnings: view.warnings,
    assumptions: [
      "De tool rekent op maandbasis en gebruikt de centrale DUO-rente- en termijndata.",
      "Draagkracht blijft indicatief; DUO kan in bijzondere gevallen anders beslissen.",
    ],
    actionPoints: [
      "Controleer je openstaande schuld en rentjaar in Mijn DUO.",
      "Vergelijk het wettelijke maandbedrag met je draagkracht voordat je extra aflost.",
    ],
    sources: [
      {
        title: "Berekening maandbedrag studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp",
        appliesTo: "Wettelijk maandbedrag en DUO-maandtermijn.",
      },
      {
        title: "Terugbetalingsregels studieschuld",
        organization: "DUO",
        url: "https://duo.nl/particulier/studieschuld-terugbetalen/terugbetalingsregels.jsp",
        appliesTo: "Rente, looptijd en terugbetalingsregels.",
      },
      {
        title: "Hoe zwaar telt mijn studieschuld mee voor mijn hypotheek?",
        organization: "Rijksoverheid",
        url: "https://www.rijksoverheid.nl/vraag-en-antwoord/huis-kopen/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek",
        appliesTo: "Toelichting op de manier waarop studieschuld meeweegt.",
      },
    ],
  };
}

function renderReport(doc: PdfDocument, report: DuoMonthlyPaymentPdfReport) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  let y = PAGE_MARGIN;

  drawBackground(doc);
  y = renderTitle(doc, report.title, report.subtitle, y);
  y = renderSection(doc, { title: "Samenvatting", lines: report.summaryLines }, y);
  report.sections.forEach((section) => {
    y = renderSection(doc, section, y);
    if (y > height - 120) {
      doc.addPage();
      drawBackground(doc);
      y = PAGE_MARGIN;
    }
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
  void width;
  renderFooter(doc);
}

export function duoMonthlyPaymentReportFileName(view: DuoMonthlyPaymentView) {
  const year = view.isValid ? view.duoRateYear : 0;
  return `duo-maandbedrag-${year}.pdf`;
}

export async function downloadDuoMonthlyPaymentPdfReport(
  input: DuoMonthlyPaymentFormValues,
  view: Extract<DuoMonthlyPaymentView, { isValid: true }>,
) {
  const { jsPDF } = await import("jspdf");
  const report = buildDuoMonthlyPaymentPdfReport(input, view);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  renderReport(doc as unknown as PdfDocument, report);
  doc.save(duoMonthlyPaymentReportFileName(view));
}
