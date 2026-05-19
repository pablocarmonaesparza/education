import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { DIMENSIONS } from "@/lib/simulador/config";
import { reportCopy } from "@/lib/simulador/copy/report";
import {
  BAND_DISPLAY,
  capFirst,
  computeOverall,
  humanRiskType,
  redactSensitiveEvidence,
  severityLabel,
  type ReportPayload,
} from "@/lib/simulador/reports/model";

interface GenerateReportPdfOptions {
  sessionId: string;
  generatedAt?: string | null;
  shared?: boolean;
}

const COLORS = {
  ink: "#111827",
  muted: "#6b7280",
  hairline: "#e5e7eb",
  accent: "#1472ff",
  softBlue: "#eef5ff",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  paper: "#ffffff",
};

const PAGE_MARGIN = 54;
const CONTENT_WIDTH = 487;

function collect(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function addHeader(doc: PDFKit.PDFDocument) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text("itera", PAGE_MARGIN, 28, { continued: true })
    .font("Helvetica")
    .fillColor(COLORS.muted)
    .text("  reporte ejecutivo", { continued: false });
  doc
    .moveTo(PAGE_MARGIN, 48)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, 48)
    .strokeColor(COLORS.hairline)
    .lineWidth(1)
    .stroke();
  doc.y = 72;
}

function addPageNumbers(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `pagina ${index + 1} de ${range.count}`,
        PAGE_MARGIN,
        doc.page.height - 38,
        {
          align: "right",
          width: CONTENT_WIDTH,
        },
      );
  }
}

function ensureSpace(doc: PDFKit.PDFDocument, height = 90) {
  if (doc.y + height <= doc.page.height - 70) return;
  doc.addPage();
  addHeader(doc);
}

function sectionTitle(doc: PDFKit.PDFDocument, eyebrow: string, title: string) {
  ensureSpace(doc, 90);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.accent)
    .text(eyebrow.toUpperCase(), PAGE_MARGIN, doc.y, {
      characterSpacing: 1.1,
      width: CONTENT_WIDTH,
    });
  doc
    .moveDown(0.35)
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLORS.ink)
    .text(title, { width: CONTENT_WIDTH });
  doc.moveDown(0.8);
}

function pill(doc: PDFKit.PDFDocument, label: string, color: string) {
  const x = doc.x;
  const y = doc.y;
  const width = Math.max(58, doc.widthOfString(label) + 18);
  doc
    .roundedRect(x, y, width, 19, 9)
    .fillOpacity(0.12)
    .fill(color)
    .fillOpacity(1);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(color)
    .text(label, x + 9, y + 5, { width: width - 18 });
  doc.x = x + width + 8;
  doc.y = y;
}

function severityColor(severity: "low" | "medium" | "high") {
  if (severity === "high") return COLORS.red;
  if (severity === "medium") return COLORS.amber;
  return COLORS.muted;
}

function bandColor(band: string) {
  if (band === "A") return COLORS.green;
  if (band === "M") return COLORS.amber;
  return COLORS.red;
}

function bullet(doc: PDFKit.PDFDocument, text: string, index?: number) {
  ensureSpace(doc, 46);
  const y = doc.y;
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(index ? String(index).padStart(2, "0") : "•", PAGE_MARGIN, y, {
      width: 24,
    });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(capFirst(text), PAGE_MARGIN + 30, y, {
      width: CONTENT_WIDTH - 30,
      lineGap: 2,
    });
  doc.moveDown(0.55);
}

export async function generateReportPdf(
  payload: ReportPayload,
  options: GenerateReportPdfOptions,
) {
  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE_MARGIN,
    bufferPages: true,
    info: {
      Title: "Itera reporte ejecutivo",
      Author: "Itera",
      Subject: `Session ${options.sessionId}`,
    },
  });
  const done = collect(doc);
  addHeader(doc);

  const overall = computeOverall(payload);
  const generatedDate = options.generatedAt
    ? new Date(options.generatedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(COLORS.ink)
    .text("Diagnostico operativo", { width: CONTENT_WIDTH });
  doc
    .moveDown(0.4)
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.muted)
    .text(
      `${options.sessionId.slice(0, 8).toUpperCase()} · ${generatedDate} · ${payload.case_version}`,
      { width: CONTENT_WIDTH },
    );

  doc.moveDown(1);
  const heroY = doc.y;
  doc
    .roundedRect(PAGE_MARGIN, heroY, CONTENT_WIDTH, 116, 16)
    .fill(COLORS.softBlue);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.accent)
    .text("RECOMENDACION", PAGE_MARGIN + 22, heroY + 18);
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(COLORS.ink)
    .text(capFirst(payload.recommendation.action), PAGE_MARGIN + 22, heroY + 34, {
      width: 170,
    });
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.ink)
    .text(capFirst(payload.recommendation.reason), PAGE_MARGIN + 210, heroY + 24, {
      width: CONTENT_WIDTH - 232,
      lineGap: 3,
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(21)
    .fillColor(bandColor(overall.band))
    .text(`${overall.score}/100`, PAGE_MARGIN + 22, heroY + 75);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(`Banda ${BAND_DISPLAY[overall.band]}`, PAGE_MARGIN + 112, heroY + 81);
  doc.y = heroY + 142;

  sectionTitle(doc, "Dimensiones", "Las cinco dimensiones");
  for (const dimension of DIMENSIONS) {
    const result = payload.dimensions.find((item) => item.id === dimension.id);
    const band = result?.band ?? "M";
    ensureSpace(doc, 72);
    const rowY = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(COLORS.ink)
      .text(capFirst(dimension.label), PAGE_MARGIN, rowY, { width: 145 });
    doc.x = PAGE_MARGIN + 155;
    doc.y = rowY;
    pill(doc, `Banda ${BAND_DISPLAY[band]}`, bandColor(band));
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(COLORS.muted)
      .text(capFirst(result?.rationale ?? dimension.description), PAGE_MARGIN + 235, rowY, {
        width: CONTENT_WIDTH - 235,
        lineGap: 2,
      });
    doc.y = Math.max(doc.y, rowY + 54);
  }

  sectionTitle(doc, reportCopy.risk_events.eyebrow, "Eventos de riesgo");
  if (payload.risk_events.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted).text(reportCopy.risk_events.empty_state);
    doc.moveDown(1);
  } else {
    for (const event of payload.risk_events) {
      ensureSpace(doc, 105);
      const boxY = doc.y;
      doc
        .roundedRect(PAGE_MARGIN, boxY, CONTENT_WIDTH, 92, 12)
        .strokeColor(COLORS.hairline)
        .lineWidth(1)
        .stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(severityColor(event.severity))
        .text(
          `${severityLabel(event.severity)} · paso ${event.step_ordinal}`,
          PAGE_MARGIN + 16,
          boxY + 14,
        );
      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor(COLORS.ink)
        .text(humanRiskType(event.type), PAGE_MARGIN + 16, boxY + 31, {
          width: CONTENT_WIDTH - 32,
        });
      doc
        .font("Helvetica-Oblique")
        .fontSize(9.5)
        .fillColor(COLORS.muted)
        .text(
          `«${capFirst(redactSensitiveEvidence(event.evidence_text, event.severity))}»`,
          PAGE_MARGIN + 16,
          boxY + 52,
          { width: CONTENT_WIDTH - 32, lineGap: 2 },
        );
      doc.y = boxY + 110;
    }
  }

  sectionTitle(doc, reportCopy.gaps.eyebrow, "Gaps identificados");
  if (payload.gaps.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted).text(reportCopy.gaps.empty_state);
    doc.moveDown(1);
  } else {
    for (const gap of payload.gaps) {
      ensureSpace(doc, 96);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(severityColor(gap.severity))
        .text(`Severidad ${severityLabel(gap.severity)}`);
      doc
        .moveDown(0.25)
        .font("Helvetica")
        .fontSize(10)
        .fillColor(COLORS.ink)
        .text(capFirst(gap.observed), { width: CONTENT_WIDTH, lineGap: 2 });
      doc
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.muted)
        .text(capFirst(gap.why_matters), { width: CONTENT_WIDTH, lineGap: 2 });
      doc.moveDown(0.9);
    }
  }

  sectionTitle(doc, reportCopy.strengths.eyebrow, "Fortalezas");
  if (payload.strengths.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted).text(reportCopy.strengths.empty_state);
    doc.moveDown(1);
  } else {
    payload.strengths.forEach((strength) => bullet(doc, strength));
  }

  sectionTitle(doc, reportCopy.next_actions.eyebrow, "Proximos 7 dias");
  payload.recommendation.next_week_actions.forEach((action, index) =>
    bullet(doc, action, index + 1),
  );

  sectionTitle(doc, reportCopy.audit_metadata.eyebrow, "Auditoria tecnica");
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(
      [
        `Judge: ${payload.judge_model}`,
        `Rubrica: ${payload.rubric_version}`,
        `Caso: ${payload.case_version}`,
        `Variante: ${payload.variant}`,
        `Duracion judge: ${(payload.duration_ms / 1000).toFixed(1)}s`,
        options.shared ? "Render: link compartible con evidencias anonimizadas" : "Render: PDF ejecutivo",
      ].join(" · "),
      { width: CONTENT_WIDTH, lineGap: 2 },
    );

  addPageNumbers(doc);
  doc.end();
  return done;
}
