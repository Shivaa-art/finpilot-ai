"use client";

import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/types";
import { buildReportSummary, filterByPeriod, type ReportPeriod } from "../lib/summary";
import { cn } from "@/lib/utils";

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "monthly", label: "Monthly Report" },
  { id: "quarterly", label: "Quarterly Report" },
  { id: "all", label: "All Time" },
];

export function ReportView({ companyName, transactions }: { companyName: string; transactions: Transaction[] }) {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");

  const filtered = useMemo(() => filterByPeriod(transactions, period), [transactions, period]);
  const summary = useMemo(() => buildReportSummary(filtered, period), [filtered, period]);

  function exportCSV() {
    const csv = Papa.unparse(
      filtered.map((t) => ({
        date: t.txn_date,
        description: t.description,
        category: t.category,
        type: t.type,
        amount: t.amount,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, "-").toLowerCase()}-${period}-transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${companyName} — Financial Summary`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${PERIODS.find((p) => p.id === period)?.label} · Generated ${new Date().toLocaleDateString()}`, 14, 25);

    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(`Total income: $${summary.totalIncome.toLocaleString()}`, 14, 36);
    doc.text(`Total expenses: $${summary.totalExpense.toLocaleString()}`, 14, 43);
    doc.text(`Net profit: $${summary.netProfit.toLocaleString()}`, 14, 50);
    doc.text(`Transactions: ${summary.transactionCount}`, 14, 57);

    autoTable(doc, {
      startY: 66,
      head: [["Date", "Description", "Category", "Type", "Amount"]],
      body: filtered
        .slice(0, 200)
        .map((t) => [t.txn_date, t.description, t.category, t.type, `$${t.amount.toLocaleString()}`]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${companyName.replace(/\s+/g, "-").toLowerCase()}-${period}-report.pdf`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                period === p.id ? "border-primary bg-primary-light text-primary-dark" : "border-border bg-surface text-muted"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-dark disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No transactions in this period.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
              <p className="text-xs font-medium text-muted">Total income</p>
              <p className="mt-2 text-2xl font-semibold text-success">${summary.totalIncome.toLocaleString()}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
              <p className="text-xs font-medium text-muted">Total expenses</p>
              <p className="mt-2 text-2xl font-semibold text-danger">${summary.totalExpense.toLocaleString()}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
              <p className="text-xs font-medium text-muted">Net profit</p>
              <p className={cn("mt-2 text-2xl font-semibold", summary.netProfit >= 0 ? "text-success" : "text-danger")}>
                ${summary.netProfit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
              <p className="text-sm font-medium text-dark">Top expense categories</p>
              <ul className="mt-3 flex flex-col gap-2">
                {summary.topExpenseCategories.map((c) => (
                  <li key={c.category} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{c.category}</span>
                    <span className="font-medium text-dark">${c.total.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
              <p className="text-sm font-medium text-dark">Top income categories</p>
              <ul className="mt-3 flex flex-col gap-2">
                {summary.topIncomeCategories.map((c) => (
                  <li key={c.category} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{c.category}</span>
                    <span className="font-medium text-dark">${c.total.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
