import type { StudyStopCalculationResult, StudyStopInput, StudyStopScenarioResult } from "@/lib/duo/studeren-stoppen";

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
    options?: {
      maxWidth?: number;
      align?: "left" | "center" | "right";
      baseline?: "top" | "middle" | "bottom" | "alphabetic" | "ideographic";
    },
  ) => PdfDocument;
  splitTextToSize: (text: string, size: number) => string[];
  save: (filename: string) => void;
};

type PdfLineItem = {
  label: string;
  value: string;
  note?: string;
};

type PdfScenarioComparisonRow = {
  label: string;
  note?: string;
  debtAtStop: number;
  debtAtRepaymentStart: number;
  usedMonthlyPayment: number;
  totalInterest: number;
  payoffDate?: string;
  finalDebt: number;
};

type PdfSection = {
  title: string;
  subtitle?: string;
  lines?: PdfLineItem[];
  paragraphs?: string[];
};

type PdfReportScenario = {
  key: StudyStopCalculationResult["scenarios"][number]["key"];
  title: string;
  note: string;
  metrics: PdfLineItem[];
  timeline: StudyStopCalculationResult["scenarios"][number]["timeline"];
};

export type StudyStopPdfReport = {
  title: string;
  subtitle: string;
  generatedAt: string;
  purpose: string;
  ruleVersion: string;
  sourceVersion: string;
  disclaimer: string;
  inputSections: PdfSection[];
  summarySections: PdfSection[];
  scenarioComparison: PdfScenarioComparisonRow[];
  scenarios: PdfReportScenario[];
  rules: string[];
  assumptions: string[];
  actionPoints: string[];
  warnings: string[];
  sources: StudyStopCalculationResult["sources"];
};

const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 108;
const LINE_HEIGHT = 15;
const SECTION_GAP = 16;
const VALUE_COLUMN_RATIO = 0.42;

const PDF_COLORS = {
  paper: [246, 246, 244] as const,
  card: [255, 255, 255] as const,
  ink: [23, 23, 23] as const,
  ink2: [51, 51, 49] as const,
  muted: [104, 104, 100] as const,
  soft: [155, 155, 150] as const,
  hair: [222, 222, 217] as const,
  accent: [72, 105, 155] as const,
  accentSoft: [230, 236, 244] as const,
  pos: [54, 102, 76] as const,
  posSoft: [235, 245, 239] as const,
  warn: [138, 100, 32] as const,
  warnSoft: [249, 243, 226] as const,
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

function drawPageBackground(doc: PdfDocument) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  setFillColor(doc, PDF_COLORS.paper);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}

function drawRoundedPanel(
  doc: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: readonly [number, number, number],
  border: readonly [number, number, number] = PDF_COLORS.hair,
  radius = 12,
) {
  setFillColor(doc, fill);
  setDrawColor(doc, border);
  doc.roundedRect(x, y, width, height, radius, radius, "FD");
}

function formatPageLabel(pageNumber: number, totalPages: number) {
  return `Pagina ${pageNumber} van ${totalPages}`;
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
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) {
    return value;
  }
  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function formatScenarioTitle(title: string) {
  return title;
}

function renderSectionTitle(doc: PdfDocument, title: string, subtitle: string | undefined, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const subtitleWidth = contentWidth - 48;
  const subtitleLines = subtitle ? doc.splitTextToSize(subtitle, subtitleWidth) : [];
  const boxHeight = 52 + (subtitleLines.length > 0 ? subtitleLines.length * 11 + 6 : 0);

  drawRoundedPanel(doc, PAGE_MARGIN, y, contentWidth, boxHeight, PDF_COLORS.card);
  setFillColor(doc, PDF_COLORS.accent);
  doc.rect(PAGE_MARGIN + 14, y + 14, 4, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(title, PAGE_MARGIN + 28, y + 28, { maxWidth: contentWidth - 44 });

  if (subtitleLines.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, PDF_COLORS.muted);
    doc.text(subtitleLines, PAGE_MARGIN + 28, y + 43, { maxWidth: contentWidth - 44 });
  }

  return y + boxHeight + 10;
}

function renderLineItem(doc: PdfDocument, label: string, value: string, note: string | undefined, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const labelWidth = Math.floor(contentWidth * (1 - VALUE_COLUMN_RATIO));
  const valueWidth = contentWidth - labelWidth - 12;
  const labelLines = doc.splitTextToSize(label, labelWidth);
  const valueLines = doc.splitTextToSize(value, valueWidth);
  const baseHeight = Math.max(labelLines.length, valueLines.length) * LINE_HEIGHT + 6;
  const noteHeight = note ? doc.splitTextToSize(note, contentWidth).length * 11 + 4 : 0;
  const totalHeight = baseHeight + noteHeight + 4;

  drawRoundedPanel(doc, PAGE_MARGIN, y, contentWidth, totalHeight, PDF_COLORS.card);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(labelLines, PAGE_MARGIN + 8, y + 14, { maxWidth: labelWidth - 8 });

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  setTextColor(doc, PDF_COLORS.ink2);
  doc.text(valueLines, PAGE_MARGIN + 8 + labelWidth + 12, y + 14, { maxWidth: valueWidth });

  if (note) {
    const noteLines = doc.splitTextToSize(note, contentWidth - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setTextColor(doc, PDF_COLORS.muted);
    doc.text(noteLines, PAGE_MARGIN + 8, y + totalHeight - 8, { maxWidth: contentWidth - 16 });
  }

  return totalHeight;
}

function renderParagraph(doc: PdfDocument, text: string, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const lines = doc.splitTextToSize(text, contentWidth);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setTextColor(doc, PDF_COLORS.ink2);
  doc.text(lines, PAGE_MARGIN, y + 12, { maxWidth: contentWidth });
  return lines.length * 12 + 2;
}

function renderBulletList(doc: PdfDocument, items: string[], y: number) {
  let currentY = y;
  for (const item of items) {
    currentY += renderParagraph(doc, `• ${item}`, currentY) + 2;
  }
  return currentY - y;
}

function renderHeader(doc: PdfDocument, report: StudyStopPdfReport) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  drawPageBackground(doc);
  drawRoundedPanel(doc, PAGE_MARGIN, PAGE_MARGIN, contentWidth, HEADER_HEIGHT, PDF_COLORS.card);

  setFillColor(doc, PDF_COLORS.accentSoft);
  doc.roundedRect(PAGE_MARGIN + 16, PAGE_MARGIN + 16, 126, 22, 11, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.accent);
  doc.text("DUO STUDIESCHULD", PAGE_MARGIN + 79, PAGE_MARGIN + 30, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(report.title, PAGE_MARGIN + 18, PAGE_MARGIN + 54, { maxWidth: contentWidth - 190 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setTextColor(doc, PDF_COLORS.ink2);
  doc.text(report.subtitle, PAGE_MARGIN + 18, PAGE_MARGIN + 73, { maxWidth: contentWidth - 190 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.muted);
  doc.text(`Gegenereerd op ${report.generatedAt}`, PAGE_MARGIN + 18, PAGE_MARGIN + 92);

  setFillColor(doc, PDF_COLORS.paper);
  setDrawColor(doc, PDF_COLORS.hair);
  doc.roundedRect(pageWidth - PAGE_MARGIN - 116, PAGE_MARGIN + 16, 98, 22, 11, 11, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text("Regelversie", pageWidth - PAGE_MARGIN - 67, PAGE_MARGIN + 30, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.muted);
  doc.text(report.ruleVersion, pageWidth - PAGE_MARGIN - 67, PAGE_MARGIN + 43, { align: "center" });

  setDrawColor(doc, PDF_COLORS.hair);
  doc.setLineWidth(1);
  doc.line(
    PAGE_MARGIN + 18,
    PAGE_MARGIN + HEADER_HEIGHT - 18,
    pageWidth - PAGE_MARGIN - 18,
    PAGE_MARGIN + HEADER_HEIGHT - 18,
  );
}

function renderScenarioComparisonTable(doc: PdfDocument, report: StudyStopPdfReport, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const rowHeight = 112;
  const totalHeight = 44 + report.scenarioComparison.length * (rowHeight + 8);

  drawRoundedPanel(doc, PAGE_MARGIN, y, contentWidth, totalHeight, PDF_COLORS.card);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text("Scenariovergelijking", PAGE_MARGIN + 16, y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, PDF_COLORS.muted);
  doc.text("Alle bedragen komen uit dezelfde centrale studieschuldlaag.", PAGE_MARGIN + 16, y + 38);

  let currentY = y + 48;
  for (const row of report.scenarioComparison) {
    const innerHeight = rowHeight;
    drawRoundedPanel(doc, PAGE_MARGIN + 14, currentY, contentWidth - 28, innerHeight, PDF_COLORS.paper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setTextColor(doc, PDF_COLORS.ink);
    doc.text(formatScenarioTitle(row.label), PAGE_MARGIN + 24, currentY + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setTextColor(doc, PDF_COLORS.muted);
    doc.text(row.note ?? "", PAGE_MARGIN + 24, currentY + 28, { maxWidth: contentWidth - 56 });

    const values = [
      formatCurrency(row.debtAtStop, 0),
      formatCurrency(row.debtAtRepaymentStart, 0),
      formatCurrency(row.usedMonthlyPayment, 2),
      formatCurrency(row.totalInterest, 0),
      row.payoffDate ?? "n.v.t.",
      formatCurrency(row.finalDebt, 0),
    ];
    const labels = [
      "Schuld op stopdatum",
      "Schuld bij aflossen",
      "Maandtermijn",
      "Totale rente",
      "Schuldenvrij",
      "Restschuld",
    ];

    const startX = PAGE_MARGIN + 24;
    let metricX = startX;
    const metricWidth = (contentWidth - 56) / 3;
    for (let index = 0; index < labels.length; index += 1) {
      const column = index % 3;
      const rowOffset = index < 3 ? 52 : 80;
      metricX = startX + column * metricWidth;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setTextColor(doc, PDF_COLORS.muted);
      doc.text(labels[index], metricX, currentY + rowOffset);
      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      setTextColor(doc, PDF_COLORS.ink2);
      doc.text(values[index], metricX, currentY + rowOffset + 12);
    }

    currentY += innerHeight + 8;
  }

  return currentY - y + 2;
}

function selectTimelineMilestones(points: StudyStopScenarioResult["timeline"]) {
  if (points.length <= 12) {
    return points;
  }

  const selected = new Map<number, (typeof points)[number]>();
  points.slice(0, 6).forEach((point) => selected.set(point.month, point));
  points.slice(-4).forEach((point) => selected.set(point.month, point));
  points
    .filter((point) => point.month % 12 === 0)
    .forEach((point) => selected.set(point.month, point));

  return Array.from(selected.values()).sort((left, right) => left.month - right.month);
}

function timelineEntryHeight(doc: PdfDocument, point: StudyStopScenarioResult["timeline"][number]) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const textWidth = contentWidth - 58;
  const primaryHeight = doc.splitTextToSize(
    `${point.date} · ${point.phase} · begin ${formatCurrency(point.openingDebt, 2)}`,
    textWidth,
  ).length * 10 + 18;
  const secondaryHeight = doc.splitTextToSize(
    `Rente ${formatCurrency(point.interest, 2)} · toevoegen ${formatCurrency(point.studyAdditions, 2)} · gift ${formatCurrency(point.giftConversion, 2)} · betalen ${formatCurrency(point.payment, 2)} · einde ${formatCurrency(point.closingDebt, 2)}`,
    textWidth,
  ).length * 10 + 16;

  return primaryHeight + secondaryHeight + 12;
}

function renderTimelineEntry(doc: PdfDocument, point: StudyStopScenarioResult["timeline"][number], y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const textX = PAGE_MARGIN + 48;
  const textWidth = contentWidth - 58;
  const totalHeight = timelineEntryHeight(doc, point);

  drawRoundedPanel(doc, PAGE_MARGIN, y, contentWidth, totalHeight, PDF_COLORS.card);
  setFillColor(doc, PDF_COLORS.accent);
  doc.rect(PAGE_MARGIN + 12, y + 12, 4, totalHeight - 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(String(point.month), PAGE_MARGIN + 29, y + 29, { align: "center" });

  let currentY = y + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(point.date, textX, currentY, { maxWidth: textWidth });
  currentY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, PDF_COLORS.ink2);
  doc.text(
    `${point.phase} · begin ${formatCurrency(point.openingDebt, 2)}`,
    textX,
    currentY,
    { maxWidth: textWidth },
  );
  currentY += 12;
  doc.text(
    `Rente ${formatCurrency(point.interest, 2)} · toevoeging ${formatCurrency(point.studyAdditions, 2)} · gift ${formatCurrency(point.giftConversion, 2)} · betaling ${formatCurrency(point.payment, 2)}`,
    textX,
    currentY,
    { maxWidth: textWidth },
  );
  currentY += 12;
  doc.text(`Einde ${formatCurrency(point.closingDebt, 2)}`, textX, currentY, { maxWidth: textWidth });

  return totalHeight;
}

function renderSourceSection(doc: PdfDocument, report: StudyStopPdfReport, y: number) {
  let currentY = y;
  currentY = renderSectionTitle(
    doc,
    "Toegepaste regels en bronversie",
    "Hier staat de normlaag die aan de berekening hangt.",
    currentY,
  );

  const ruleLines = [
    `Regelversie: ${report.ruleVersion}`,
    `Bronversie: ${report.sourceVersion}`,
    ...report.rules.map((rule) => `Regel: ${rule}`),
  ];
  currentY += renderBulletList(doc, ruleLines, currentY) + 6;

  currentY += SECTION_GAP;
  currentY = renderSectionTitle(
    doc,
    "Officiële bronnen",
    "Alle bronvermeldingen bevatten titel, URL, consultatiedatum en onzekerheden.",
    currentY,
  );

  for (const source of report.sources) {
    const sourceText = `${source.key} — ${source.organization}: ${source.title}. ${source.appliesTo}`;
    const note = `Regeling: ${source.regulation}. Geldigheid: ${source.validityDate}. Geraadpleegd: ${source.consultedAt}. Regelversie: ${source.ruleVersion}. URL: ${source.url}. Onzekerheden: ${source.uncertainties.join(" ")}`;
    currentY += renderLineItem(doc, sourceText, source.url, note, currentY) + 6;
  }

  return currentY;
}

function renderStudyStopPdfDocument(doc: PdfDocument, report: StudyStopPdfReport) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = PAGE_MARGIN + HEADER_HEIGHT + 18;

  const drawHeader = () => {
    renderHeader(doc, report);
  };

  const drawFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setTextColor(doc, PDF_COLORS.muted);
      setDrawColor(doc, PDF_COLORS.hair);
      doc.line(PAGE_MARGIN, pageHeight - 32, pageWidth - PAGE_MARGIN, pageHeight - 32);
      doc.text("DUO studeren stoppen", PAGE_MARGIN, pageHeight - 18);
      doc.text(formatPageLabel(page, totalPages), pageWidth - PAGE_MARGIN, pageHeight - 22, {
        align: "right",
      });
    }
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight <= pageHeight - PAGE_MARGIN - 24) {
      return;
    }
    doc.addPage();
    drawHeader();
    y = PAGE_MARGIN + HEADER_HEIGHT + 18;
  };

  drawHeader();

  ensureSpace(120);
  y = renderSectionTitle(
    doc,
    "Doel en samenvatting",
    "Een compacte uitleg van wat stoppen, later een diploma halen of doorstuderen financieel betekent.",
    y,
  );
  ensureSpace(80);
  y += renderParagraph(doc, report.purpose, y) + 6;
  report.summarySections.forEach((section) => {
    section.lines?.forEach((line) => {
      const lineHeight = doc.splitTextToSize(line.value, pageWidth - PAGE_MARGIN * 2 - 220 - 12).length * 12 + 8;
      ensureSpace(lineHeight + 10);
      y += renderLineItem(doc, line.label, line.value, line.note, y) + 6;
    });
    section.paragraphs?.forEach((paragraph) => {
      const paragraphHeight = doc.splitTextToSize(paragraph, pageWidth - PAGE_MARGIN * 2).length * 12 + 2;
      ensureSpace(paragraphHeight + 8);
      y += renderParagraph(doc, paragraph, y) + 6;
    });
  });

  ensureSpace(140);
  y += SECTION_GAP;
  y = renderSectionTitle(doc, "Invoer", "Alle gegevens gegroepeerd per onderwerp.", y);
  report.inputSections.forEach((section) => {
    ensureSpace(80);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, section.title, section.subtitle, y);
    section.paragraphs?.forEach((paragraph) => {
      const paragraphHeight = doc.splitTextToSize(paragraph, pageWidth - PAGE_MARGIN * 2).length * 12 + 2;
      ensureSpace(paragraphHeight + 8);
      y += renderParagraph(doc, paragraph, y) + 6;
    });
    section.lines?.forEach((line) => {
      const lineHeight = doc.splitTextToSize(line.value, pageWidth - PAGE_MARGIN * 2 - 220 - 12).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderLineItem(doc, line.label, line.value, line.note, y) + 6;
    });
  });

  ensureSpace(220);
  y += SECTION_GAP;
  y = renderSectionTitle(doc, "Scenariovergelijking", "De drie scenario's naast elkaar.", y);
  y += renderScenarioComparisonTable(doc, report, y) + 8;

  report.scenarios.forEach((scenario) => {
    ensureSpace(260);
    y += SECTION_GAP;
    y = renderSectionTitle(
      doc,
      formatScenarioTitle(scenario.title),
      scenario.note,
      y,
    );
    scenario.metrics.forEach((metric) => {
      const lineHeight = doc.splitTextToSize(metric.value, pageWidth - PAGE_MARGIN * 2 - 220 - 12).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderLineItem(doc, metric.label, metric.value, metric.note, y) + 6;
    });
    const milestones = selectTimelineMilestones(scenario.timeline);
    const timelineParagraph =
      milestones.length > 0
        ? `Tijdlijn met ${milestones.length} geselecteerde maandpunten op basis van de centrale maandelijkse simulatie.`
        : "Geen tijdlijnpunten beschikbaar.";
    ensureSpace(120);
    y += renderParagraph(doc, timelineParagraph, y) + 6;
    for (const point of milestones) {
      const requiredHeight = timelineEntryHeight(doc, point);
      ensureSpace(requiredHeight + 8);
      y += renderTimelineEntry(doc, point, y) + 6;
    }
  });

  ensureSpace(180);
  y += SECTION_GAP;
  y = renderSourceSection(doc, report, y);

  if (report.warnings.length > 0) {
    ensureSpace(120);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Waarschuwingen", "Belangrijke beperkingen van deze berekening.", y);
    report.warnings.forEach((warning) => {
      const lineHeight = doc.splitTextToSize(warning, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${warning}`, y) + 4;
    });
  }

  if (report.assumptions.length > 0) {
    ensureSpace(120);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Aannames", "De centrale laag rekent met maandstappen en de ingevoerde DUO-bedragen.", y);
    report.assumptions.forEach((assumption) => {
      const lineHeight = doc.splitTextToSize(assumption, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${assumption}`, y) + 4;
    });
  }

  if (report.actionPoints.length > 0) {
    ensureSpace(120);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Praktische controle- en actiepunten", "Wat je nog kunt nalopen in Mijn DUO of elders.", y);
    report.actionPoints.forEach((item) => {
      const lineHeight = doc.splitTextToSize(item, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${item}`, y) + 4;
    });
  }

  ensureSpace(120);
  y += SECTION_GAP;
  y = renderSectionTitle(doc, "Disclaimer", "Geen beschikking en geen persoonlijk financieel advies.", y);
  y += renderParagraph(doc, report.disclaimer, y) + 6;

  drawFooter();
}

export function buildStudyStopPdfReport(
  input: StudyStopInput,
  result: StudyStopCalculationResult,
): StudyStopPdfReport {
  const primaryScenario = result.scenarios[0];

  return {
    title: "Studeren stoppen en DUO",
    subtitle: "Scenariovergelijking voor stoppen, later een diploma halen of doorstuderen tot diploma.",
    generatedAt: new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date()),
    purpose:
      "Dit rapport laat zien wat stoppen met studeren financieel betekent en hoe de prestatiebeurs, lening, collegegeldkrediet en studentenreisproduct doorwerken.",
    ruleVersion: result.ruleVersion,
    sourceVersion: result.sources
      .map((source) => source.ruleVersion)
      .filter((value, index, array) => array.indexOf(value) === index)
      .join(", "),
    disclaimer:
      "Deze PDF is een indicatieve berekening op basis van de ingevoerde gegevens en centrale DUO-bronnen. Het is geen DUO-beschikking en geen persoonlijk financieel advies. Controleer altijd je actuele bedragen, rente en diplomatermijn in Mijn DUO.",
    inputSections: [
      {
        title: "Huidige schuld",
        subtitle: "Wat je in Mijn DUO ziet bij de openstaande bedragen.",
        lines: [
          { label: "Rentedragende lening", value: formatCurrency(input.currentLoanDebt ?? 0, 0), note: "Mijn DUO > studieschuld > lening." },
          { label: "Collegegeldkrediet", value: formatCurrency(input.currentCollegegeldkredietDebt ?? 0, 0), note: "Mijn DUO > studieschuld > collegegeldkrediet." },
          { label: "Basisbeurs", value: formatCurrency(input.currentBasisbeursDebt ?? 0, 0), note: "Alleen terug te betalen als de prestatiebeurs niet op tijd wordt omgezet in gift." },
          { label: "Aanvullende beurs", value: formatCurrency(input.currentAanvullendeBeursDebt ?? 0, 0), note: "Zelfde prestatiebeurslogica als de basisbeurs." },
          { label: "Studentenreisproduct", value: formatCurrency(input.currentReisproductDebt ?? 0, 0), note: "Bij studieschuld en reisproduct kan een terugbetalingsgevolg horen als de voorwaarden niet zijn gehaald." },
        ],
      },
      {
        title: "Maandelijkse opbouw",
        subtitle: "Wat je per maand toevoegt tijdens studeren.",
        lines: [
          { label: "Lening", value: formatCurrency(input.monthlyLoan ?? 0, 2) },
          { label: "Collegegeldkrediet", value: formatCurrency(input.monthlyCollegegeldkrediet ?? 0, 2) },
          { label: "Basisbeurs", value: formatCurrency(input.monthlyBasisbeurs ?? 0, 2) },
          { label: "Aanvullende beurs", value: formatCurrency(input.monthlyAanvullendeBeurs ?? 0, 2) },
          { label: "Studentenreisproduct", value: formatCurrency(input.monthlyReisproduct ?? 0, 2) },
        ],
      },
      {
        title: "Scenario en rente",
        subtitle: "Timing en regels die de simulatie sturen.",
        lines: [
          { label: "Berekeningsmaand", value: formatMonth(result.calculationMonth) },
          { label: "Opleidingsniveau", value: input.studyLevel ?? "hbo" },
          { label: "Terugbetalingsregel", value: result.repaymentRule },
          { label: "DUO-rentejaar", value: String(result.duoRateYear) },
          { label: "Diplomatermijn", value: `${result.remainingDiplomaTermMonths} maanden` },
          { label: "Studierente", value: `${formatPercent(result.annualStudyInterestRate)}%` },
          { label: "Terugbetalingsrente", value: `${formatPercent(result.annualRepaymentInterestRate)}%` },
        ],
      },
    ],
    summarySections: [
      {
        title: "Kernuitkomst",
        lines: [
          {
            label: "Huidig totaal",
            value: formatCurrency(result.currentBalances.total, 0),
            note: "Openstaande schuld op de berekeningsmaand.",
          },
          {
            label: "Altijd terug te betalen",
            value: formatCurrency(result.currentBalances.alwaysRepayable, 0),
            note: "Lening en collegegeldkrediet vallen hier altijd onder.",
          },
          {
            label: "Prestatiebeurs",
            value: formatCurrency(result.currentBalances.prestatiebeurs, 0),
            note: "Basisbeurs, aanvullende beurs en studentenreisproduct worden hier apart gevolgd.",
          },
          {
            label: "Schuldenvrij bij scenario 1",
            value: primaryScenario.repayment.payoffDate ?? "n.v.t.",
            note: "Indicatieve datum op basis van de wettelijke terugbetalingsregels.",
          },
        ],
      },
    ],
    scenarioComparison: result.scenarios.map((scenario) => ({
      label: scenario.title,
      note:
        scenario.key === "stop-now-no-diploma"
          ? "Geen diploma betekent dat de prestatiebeurs niet omgezet wordt in gift."
          : scenario.key === "stop-now-later-diploma"
            ? "Bij tijdig diploma kan de prestatiebeurs alsnog gift worden."
            : "Doorstuderen vergroot de schuld, maar kan prestatiebeurs later alsnog gift maken.",
      debtAtStop: scenario.debtAtStop.total,
      debtAtRepaymentStart: scenario.debtAtRepaymentStart.total,
      usedMonthlyPayment: scenario.repayment.usedMonthlyPayment,
      totalInterest: scenario.repayment.totalInterest,
      payoffDate: scenario.repayment.payoffDate ?? undefined,
      finalDebt: scenario.repayment.restschuld,
    })),
    scenarios: result.scenarios.map((scenario) => ({
      key: scenario.key,
      title: formatScenarioTitle(scenario.title),
      note:
        scenario.key === "stop-now-no-diploma"
          ? "Stop nu en geen diploma meer."
          : scenario.key === "stop-now-later-diploma"
            ? "Stop nu en haal later alsnog op tijd een diploma."
            : "Doorstuderen tot diploma.",
      metrics: [
        { label: "Schuld op stopdatum", value: formatCurrency(scenario.debtAtStop.total, 0) },
        {
          label: "Schuld bij aanvang terugbetaling",
          value: formatCurrency(scenario.debtAtRepaymentStart.total, 0),
        },
        {
          label: "Maandbedrag",
          value: formatCurrency(scenario.repayment.usedMonthlyPayment, 2),
          note:
            scenario.repayment.incomeBasedMonthlyPayment !== undefined
              ? `Draagkrachtindicatie ${formatCurrency(scenario.repayment.incomeBasedMonthlyPayment, 2)}.`
              : undefined,
        },
        { label: "Totale rente", value: formatCurrency(scenario.repayment.totalInterest, 0) },
        { label: "Totaal betaald", value: formatCurrency(scenario.repayment.totalPaid, 0) },
        { label: "Restschuld", value: formatCurrency(scenario.repayment.restschuld, 0) },
        { label: "Schuldenvrij", value: scenario.repayment.payoffDate ?? "n.v.t." },
        { label: "Maanden tot schuldenvrij", value: String(scenario.repayment.monthsToDebtFree) },
      ],
      timeline: scenario.timeline,
    })),
    rules: [
      "Rentedragende lening en collegegeldkrediet blijven altijd terug te betalen.",
      "Basisbeurs, aanvullende beurs en studentenreisproduct zijn prestatiebeursdelen die bij een diploma binnen de diplomatermijn mogelijk een gift worden.",
      "Tijdens een aflosvrije periode blijft rente doorlopen en schuift de einddatum door.",
      "Meer aflossen verhoogt de schuld niet en maakt de schuldenvrije datum niet later.",
      "De centrale laag rekent per maand en houdt de onderdelen van de studieschuld apart herleidbaar.",
    ],
    assumptions: [
      "De maandstappen zijn afgerond op twee decimalen en sluiten aan op de centrale DUO-rekenlaag.",
      "De prestatiebeurs wordt apart gevolgd totdat de diplomatermijn is gehaald of verstrijkt.",
      "De aanloopfase en aflosvrije periode zijn indicatief gemodelleerd op maandbasis.",
      "Bij een latere diploma-uitreiking na de diplomatermijn kan de prestatiebeurs niet meer als gift worden omgezet.",
    ],
    actionPoints: [
      "Controleer de openstaande bedragen in Mijn DUO per onderdeel: lening, collegegeldkrediet, basisbeurs, aanvullende beurs en studentenreisproduct.",
      "Controleer de datum waarop je diplomatermijn eindigt en of je binnen die termijn een diploma verwacht.",
      "Controleer de gekozen terugbetalingsregel en het rentejaar in Mijn DUO voordat je de indicatie gebruikt.",
      "Overweeg extra aflossing of een aflosvrije periode alleen nadat je je maandruimte hebt gecontroleerd.",
    ],
    warnings: result.warnings,
    sources: result.sources,
  };
}

export function studyStopReportFileName(result: StudyStopCalculationResult) {
  const month = result.calculationMonth.replace("-", "");
  return `studeren-stoppen-duo-${month}.pdf`;
}

export async function downloadStudyStopPdfReport(
  input: StudyStopInput,
  result: StudyStopCalculationResult,
) {
  const { jsPDF } = await import("jspdf");
  const report = buildStudyStopPdfReport(input, result);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  renderStudyStopPdfDocument(doc as unknown as PdfDocument, report);
  doc.save(studyStopReportFileName(result));
}
