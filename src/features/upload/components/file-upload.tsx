"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { parseFinancialFile } from "../lib/parse";
import type { ParsedTransactionRow } from "@/types";

type Status = "idle" | "parsing" | "preview" | "importing" | "done" | "error";

export function FileUpload({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedTransactionRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("parsing");
    const result = await parseFinancialFile(file);
    setRows(result.rows);
    setErrors(result.errors);
    setStatus(result.rows.length > 0 ? "preview" : "error");
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  async function confirmImport() {
    setStatus("importing");
    const supabase = createClient();

    const payload = rows.map((r) => ({
      company_id: companyId,
      txn_date: r.date,
      description: r.description,
      category: r.category,
      amount: r.amount,
      type: r.type,
    }));

    // Supabase has a practical payload size limit per insert — chunk large files.
    const chunkSize = 500;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const { error } = await supabase.from("transactions").insert(chunk);
      if (error) {
        setErrors([error.message]);
        setStatus("error");
        return;
      }
    }

    setStatus("done");
    router.refresh();
  }

  function reset() {
    setStatus("idle");
    setFileName(null);
    setRows([]);
    setErrors([]);
  }

  return (
    <div className="flex flex-col gap-5">
      {status === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed px-6 py-16 text-center transition-colors ${
            dragOver ? "border-primary bg-primary-light" : "border-border bg-surface hover:bg-primary-light/40"
          }`}
        >
          <UploadCloud className="h-10 w-10 text-primary" />
          <div>
            <p className="text-sm font-semibold text-dark">Drag & drop your CSV or Excel file</p>
            <p className="mt-1 text-xs text-muted">or click to browse — .csv, .xlsx, .xls</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {status === "parsing" && (
        <div className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface py-16 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading {fileName}...
        </div>
      )}

      {(status === "preview" || status === "importing") && (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-dark">{fileName}</span>
            </div>
            <span className="rounded-full bg-success-light px-2.5 py-1 text-xs font-medium text-success">
              {rows.length} valid rows
            </span>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 rounded-xl bg-warning-light px-4 py-3 text-xs text-warning">
              <p className="font-medium">{errors.length} row(s) skipped:</p>
              <ul className="mt-1 list-disc pl-4">
                {errors.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-background text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-2">{r.description}</td>
                    <td className="px-3 py-2">{r.category}</td>
                    <td className="px-3 py-2 capitalize">{r.type}</td>
                    <td className="px-3 py-2 text-right">{r.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <p className="mt-2 text-xs text-muted">Showing first 50 of {rows.length} rows.</p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={reset}
              disabled={status === "importing"}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-dark disabled:opacity-50"
            >
              Choose a different file
            </button>
            <button
              onClick={confirmImport}
              disabled={status === "importing"}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {status === "importing" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "importing" ? "Importing..." : `Import ${rows.length} transactions`}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface py-14 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-sm font-semibold text-dark">Import complete</p>
          <p className="max-w-xs text-xs text-muted">
            {rows.length} transactions were added. Your dashboard and AI recommendations are now based on real data.
          </p>
          <div className="mt-2 flex gap-3">
            <button onClick={reset} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-dark">
              Upload another file
            </button>
            <a href="/dashboard" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
              Go to dashboard
            </a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface py-14 text-center">
          <AlertTriangle className="h-10 w-10 text-danger" />
          <p className="text-sm font-semibold text-dark">Couldn&apos;t import this file</p>
          <ul className="max-w-sm list-disc pl-4 text-left text-xs text-muted">
            {errors.slice(0, 8).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <button onClick={reset} className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
