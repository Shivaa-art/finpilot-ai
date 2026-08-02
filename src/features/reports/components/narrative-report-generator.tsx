"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { FileText, Download } from "lucide-react";
import type { NarrativeReport } from "../lib/narrative-reports";

type ReportKind = "investor" | "ceo-brief" | "board";

const REPORT_LABELS: Record<ReportKind, string> = {
  investor: "Investor Update",
  "ceo-brief": "CEO Weekly Brief",
  board: "Board Meeting Report",
};

export function NarrativeReportGenerator({
  reports,
}: {
  reports: Record<ReportKind, NarrativeReport>;
}) {
  const [active, setActive] = useState<ReportKind>("investor");
  const report = reports[active];

  function exportPDF() {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text(report.title, 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(report.subtitle, 14, y);
    y += 12;

    for (const section of report.sections) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text(section.heading, 14, y);
      y += 7;

      doc.setFontSize(10);
      doc.setTextColor(20);
      for (const para of section.paragraphs) {
        const lines = doc.splitTextToSize(para, 180);
        for (const line of lines) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 14, y);
          y += 5.5;
        }
        y += 2;
      }
      y += 4;
    }

    doc.save(`${report.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(REPORT_LABELS) as ReportKind[]).map((kind) => (
          <button
            key={kind}
            onClick={() => setActive(kind)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              active === kind ? "border-primary bg-primary-light text-primary-dark" : "border-border bg-surface text-muted"
            }`}
          >
            {REPORT_LABELS[kind]}
          </button>
        ))}
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-dark">{report.title}</p>
            <p className="text-xs text-muted">{report.subtitle}</p>
          </div>
          <button
            onClick={exportPDF}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {report.sections.map((section) => (
            <div key={section.heading}>
              <p className="flex items-center gap-1.5 text-sm font-medium text-dark">
                <FileText className="h-3.5 w-3.5 text-primary" />
                {section.heading}
              </p>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-xs leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
