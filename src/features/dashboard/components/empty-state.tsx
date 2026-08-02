import Link from "next/link";
import { UploadCloud } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-20 text-center">
      <UploadCloud className="h-10 w-10 text-primary" />
      <div>
        <p className="text-sm font-semibold text-dark">No financial data yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Upload a CSV or Excel export of your transactions to activate your Financial Health Score, cash flow
          forecast, and AI recommendations.
        </p>
      </div>
      <Link href="/upload" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
        Upload transactions
      </Link>
    </div>
  );
}
