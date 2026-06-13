import type {
  MortgageCalculationTimelineStep,
  MortgageMaxMortgageInput,
  MortgageMaxMortgageResult,
  MortgagePdfReport,
} from "@/lib/mortgage";
import {
  buildMortgagePdfReport,
  mortgageReportFileName,
} from "@/lib/mortgage/report";

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

const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 104;
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
  hair2: [207, 207, 200] as const,
  deep: [22, 22, 22] as const,
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

function drawHeader(doc: PdfDocument, reportTitle: string, subtitle: string, generatedAt: string, normYear: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  drawPageBackground(doc);
  drawRoundedPanel(doc, PAGE_MARGIN, PAGE_MARGIN, contentWidth, HEADER_HEIGHT, PDF_COLORS.card);

  setFillColor(doc, PDF_COLORS.accentSoft);
  doc.roundedRect(PAGE_MARGIN + 16, PAGE_MARGIN + 16, 108, 22, 11, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.accent);
  doc.text("HYPOTHEEKRAPPORT", PAGE_MARGIN + 70, PAGE_MARGIN + 30, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(reportTitle, PAGE_MARGIN + 18, PAGE_MARGIN + 54, {
    maxWidth: contentWidth - 170,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setTextColor(doc, PDF_COLORS.ink2);
  doc.text(subtitle, PAGE_MARGIN + 18, PAGE_MARGIN + 73, {
    maxWidth: contentWidth - 170,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.muted);
  doc.text(`Gegenereerd op ${generatedAt}`, PAGE_MARGIN + 18, PAGE_MARGIN + 92, {
    maxWidth: contentWidth - 170,
  });

  setFillColor(doc, PDF_COLORS.paper);
  setDrawColor(doc, PDF_COLORS.hair);
  doc.roundedRect(pageWidth - PAGE_MARGIN - 110, PAGE_MARGIN + 16, 92, 22, 11, 11, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(`Normjaar ${normYear}`, pageWidth - PAGE_MARGIN - 64, PAGE_MARGIN + 30, {
    align: "center",
  });

  setDrawColor(doc, PDF_COLORS.hair);
  doc.setLineWidth(1);
  doc.line(
    PAGE_MARGIN + 18,
    PAGE_MARGIN + HEADER_HEIGHT - 18,
    pageWidth - PAGE_MARGIN - 18,
    PAGE_MARGIN + HEADER_HEIGHT - 18,
  );
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

function timelineStepHeight(
  doc: PdfDocument,
  step: MortgageCalculationTimelineStep,
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = pageWidth - PAGE_MARGIN * 2 - 52;
  let height = 34;
  height += doc.splitTextToSize(step.explanation, textWidth).length * 11 + 8;
  if (step.formula) {
    height += doc.splitTextToSize(step.formula, textWidth - 16).length * 11 + 18;
  }
  for (const line of step.lines) {
    const value = `${line.label}: ${line.value}${line.note ? ` — ${line.note}` : ""}`;
    height += doc.splitTextToSize(value, textWidth).length * 10 + 5;
  }
  const outcome = `${step.outcome.label}: ${step.outcome.value}`;
  height += doc.splitTextToSize(outcome, textWidth - 16).length * 11 + 22;
  if (step.sourceKeys.length > 0) {
    height += 18;
  }
  return height;
}

function renderTimelineStep(
  doc: PdfDocument,
  step: MortgageCalculationTimelineStep,
  y: number,
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const textX = PAGE_MARGIN + 52;
  const textWidth = contentWidth - 52;
  const totalHeight = timelineStepHeight(doc, step);

  drawRoundedPanel(doc, PAGE_MARGIN, y, contentWidth, totalHeight, PDF_COLORS.card);

  setFillColor(doc, PDF_COLORS.accent);
  doc.rect(PAGE_MARGIN + 12, y + 12, 4, totalHeight - 24, "F");

  setFillColor(doc, PDF_COLORS.deep);
  doc.roundedRect(PAGE_MARGIN + 18, y + 12, 30, 24, 12, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, [255, 255, 255]);
  doc.text(String(step.step), PAGE_MARGIN + 33, y + 29, { align: "center" });

  let currentY = y + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, PDF_COLORS.ink);
  doc.text(step.title, textX, currentY, { maxWidth: textWidth });
  currentY += 18;

  const explanationLines = doc.splitTextToSize(step.explanation, textWidth);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, PDF_COLORS.ink2);
  doc.text(explanationLines, textX, currentY, { maxWidth: textWidth });
  currentY += explanationLines.length * 11 + 8;

  if (step.formula) {
    const formulaLines = doc.splitTextToSize(step.formula, textWidth - 16);
    const formulaHeight = formulaLines.length * 11 + 12;
    drawRoundedPanel(doc, textX, currentY - 4, textWidth, formulaHeight, PDF_COLORS.paper, PDF_COLORS.hair, 10);
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    setTextColor(doc, PDF_COLORS.ink2);
    doc.text(formulaLines, textX + 8, currentY + 7, {
      maxWidth: textWidth - 16,
    });
    currentY += formulaHeight + 6;
  }

  for (const line of step.lines) {
    const value = `${line.label}: ${line.value}${line.note ? ` — ${line.note}` : ""}`;
    const valueLines = doc.splitTextToSize(value, textWidth);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setTextColor(doc, PDF_COLORS.ink2);
    doc.text(valueLines, textX, currentY, { maxWidth: textWidth });
    currentY += valueLines.length * 10 + 5;
  }

  const outcome = `${step.outcome.label}: ${step.outcome.value}`;
  const outcomeLines = doc.splitTextToSize(outcome, textWidth - 16);
  const outcomeHeight = outcomeLines.length * 11 + 12;
  drawRoundedPanel(doc, textX, currentY - 4, textWidth, outcomeHeight, PDF_COLORS.posSoft, [201, 226, 209], 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor(doc, PDF_COLORS.pos);
  doc.text(outcomeLines, textX + 8, currentY + 7, {
    maxWidth: textWidth - 16,
  });
  currentY += outcomeHeight + 5;

  if (step.sourceKeys.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    setTextColor(doc, PDF_COLORS.muted);
    doc.text(`Bronnen: ${step.sourceKeys.join(", ")}`, textX, currentY + 5, {
      maxWidth: textWidth,
    });
  }

  return totalHeight;
}

function renderMortgagePdfDocument(doc: PdfDocument, report: MortgagePdfReport) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = PAGE_MARGIN + HEADER_HEIGHT + 18;

  const drawPageHeader = () => {
    drawHeader(doc, report.title, report.subtitle, report.generatedAt, report.normYear);
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
      doc.text("Maximale hypotheek", PAGE_MARGIN, pageHeight - 18);
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
    drawPageHeader();
    y = PAGE_MARGIN + HEADER_HEIGHT + 18;
  };

  drawPageHeader();

  ensureSpace(110);
  y = renderSectionTitle(
    doc,
    "Berekeningsvolgorde",
    "De stappen hieronder staan in dezelfde volgorde als waarin de engine de hypotheekindicatie opbouwt.",
    y,
  );

  report.timeline.forEach((step) => {
    const requiredHeight = timelineStepHeight(doc, step);
    ensureSpace(requiredHeight + 10);
    y += renderTimelineStep(doc, step, y) + 10;
  });

  report.sections.forEach((section) => {
    ensureSpace(90);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, section.title, section.subtitle, y);

    section.paragraphs?.forEach((paragraph) => {
      const paragraphHeight = doc.splitTextToSize(paragraph, pageWidth - PAGE_MARGIN * 2).length * 12 + 2;
      ensureSpace(paragraphHeight + 8);
      y += renderParagraph(doc, paragraph, y) + 6;
    });

    section.lines?.forEach((line) => {
      const labelLines = doc.splitTextToSize(line.label, 220).length;
      const valueLines = doc.splitTextToSize(line.value, pageWidth - PAGE_MARGIN * 2 - 220 - 12).length;
      const lineHeight = Math.max(labelLines, valueLines) * LINE_HEIGHT + (line.note ? 18 : 8);
      ensureSpace(lineHeight + 8);
      y += renderLineItem(doc, line.label, line.value, line.note, y) + 6;
    });
  });

  if (report.warnings.length > 0) {
    ensureSpace(90);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Waarschuwingen", "Meldingen die bij deze uitkomst horen.", y);
    report.warnings.forEach((warning) => {
      const lineHeight = doc.splitTextToSize(warning, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${warning}`, y) + 4;
    });
  }

  if (report.assumptions.length > 0) {
    ensureSpace(90);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Aannames", "De centrale hypotheeklaag levert deze aannames mee.", y);
    report.assumptions.forEach((assumption) => {
      const lineHeight = doc.splitTextToSize(assumption, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${assumption}`, y) + 4;
    });
  }

  if (report.sources.length > 0) {
    ensureSpace(90);
    y += SECTION_GAP;
    y = renderSectionTitle(
      doc,
      "Bronnenregister",
      "De broncodes in de tijdlijn verwijzen naar deze publicaties.",
      y,
    );
    report.sources.forEach((source) => {
      const sourceText = `${source.key} — ${source.organization}: ${source.title}. ${source.appliesTo} ${source.url}`;
      const sourceHeight = doc.splitTextToSize(
        sourceText,
        pageWidth - PAGE_MARGIN * 2,
      ).length * 12 + 8;
      ensureSpace(sourceHeight + 8);
      y += renderParagraph(doc, sourceText, y) + 6;
    });
  }

  drawFooter();
}

export async function downloadMortgagePdfReport(
  input: MortgageMaxMortgageInput,
  result: MortgageMaxMortgageResult,
) {
  const { jsPDF } = await import("jspdf");
  const report = buildMortgagePdfReport(input, result);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  renderMortgagePdfDocument(doc as unknown as PdfDocument, report);
  doc.save(mortgageReportFileName(result));
}
