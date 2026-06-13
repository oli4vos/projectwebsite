import type {
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
const LINE_HEIGHT = 15;
const SECTION_GAP = 16;
const VALUE_COLUMN_RATIO = 0.42;

function formatPageLabel(pageNumber: number, totalPages: number) {
  return `Pagina ${pageNumber} van ${totalPages}`;
}

function drawHeader(doc: PdfDocument, reportTitle: string, subtitle: string, generatedAt: string, normYear: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 27, 39);
  doc.text(reportTitle, PAGE_MARGIN, PAGE_MARGIN + 2, { maxWidth: contentWidth });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 104, 120);
  doc.text(subtitle, PAGE_MARGIN, PAGE_MARGIN + 20, { maxWidth: contentWidth });
  doc.text(`Gegenereerd op ${generatedAt} • normjaar ${normYear}`, PAGE_MARGIN, PAGE_MARGIN + 34, {
    maxWidth: contentWidth,
  });

  doc.setDrawColor(216, 223, 230);
  doc.setLineWidth(1);
  doc.line(PAGE_MARGIN, PAGE_MARGIN + 44, pageWidth - PAGE_MARGIN, PAGE_MARGIN + 44);
}

function renderWrappedText(
  doc: PdfDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: [number, number, number],
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y, { maxWidth: width });
  return lines.length;
}

function renderSectionTitle(doc: PdfDocument, title: string, subtitle: string | undefined, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  doc.setFillColor(20, 27, 39);
  doc.rect(PAGE_MARGIN, y - 2, 4, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 27, 39);
  doc.text(title, PAGE_MARGIN + 12, y + 10, { maxWidth: contentWidth - 12 });

  let currentY = y + 24;
  if (subtitle) {
    const linesUsed = renderWrappedText(doc, subtitle, PAGE_MARGIN + 12, currentY, contentWidth - 12, 9, [92, 104, 120]);
    currentY += linesUsed * 11 + 2;
  }

  return currentY + 4;
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

  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(255, 255, 255);
  doc.rect(PAGE_MARGIN, y, contentWidth, totalHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 27, 39);
  doc.text(labelLines, PAGE_MARGIN + 8, y + 14, { maxWidth: labelWidth - 8 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(valueLines, PAGE_MARGIN + 8 + labelWidth + 12, y + 14, { maxWidth: valueWidth });

  if (note) {
    const noteLines = doc.splitTextToSize(note, contentWidth - 16);
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
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
  doc.setTextColor(31, 41, 55);
  doc.text(lines, PAGE_MARGIN, y + 12, { maxWidth: contentWidth });
  return lines.length * 12 + 2;
}

function renderMortgagePdfDocument(doc: PdfDocument, report: MortgagePdfReport) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = PAGE_MARGIN + 56;

  const drawPageHeader = () => {
    drawHeader(doc, report.title, report.subtitle, report.generatedAt, report.normYear);
  };

  const drawFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
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
    y = PAGE_MARGIN + 56;
  };

  drawPageHeader();

  ensureSpace(120);
  y = renderSectionTitle(doc, "Samenvatting", "Belangrijkste uitkomst en beperkende factor.", y);
  report.summaryLines.forEach((line) => {
    const lineHeight = Math.max(
      doc.splitTextToSize(line.label, 220).length,
      doc.splitTextToSize(line.value, pageWidth - PAGE_MARGIN * 2 - 220 - 12).length,
    ) * LINE_HEIGHT + (line.note ? 18 : 8);
    ensureSpace(lineHeight + 8);
    y += renderLineItem(doc, line.label, line.value, line.note, y) + 6;
  });

  report.sections.forEach((section) => {
    ensureSpace(60);
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
    ensureSpace(60);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Waarschuwingen", "Meldingen die bij deze uitkomst horen.", y);
    report.warnings.forEach((warning) => {
      const lineHeight = doc.splitTextToSize(warning, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${warning}`, y) + 4;
    });
  }

  if (report.assumptions.length > 0) {
    ensureSpace(60);
    y += SECTION_GAP;
    y = renderSectionTitle(doc, "Aannames", "De centrale hypotheeklaag levert deze aannames mee.", y);
    report.assumptions.forEach((assumption) => {
      const lineHeight = doc.splitTextToSize(assumption, pageWidth - PAGE_MARGIN * 2 - 16).length * 12 + 8;
      ensureSpace(lineHeight + 8);
      y += renderParagraph(doc, `• ${assumption}`, y) + 4;
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
