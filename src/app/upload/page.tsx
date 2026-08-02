import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/services/company";
import { FileUpload } from "@/features/upload/components/file-upload";

export default async function UploadPage() {
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);

  if (!company) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-dark">Upload your financial data</h1>
        <p className="mt-2 text-sm text-muted">
          For <span className="font-medium text-dark">{company.name}</span>. FinPilot reads real transactions —
          the more history you upload, the higher the confidence on every recommendation.
        </p>
        <a
          href="/sample-transactions.csv"
          download
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Download className="h-3.5 w-3.5" />
          Download a sample CSV to try it
        </a>
      </div>

      <div className="mt-8 rounded-[var(--radius-card)] border border-border bg-background p-4 text-xs text-muted">
        Required columns: <code className="font-mono text-dark">date, description, category, amount, type</code>.{" "}
        <code className="font-mono text-dark">type</code> must be <code className="font-mono text-dark">income</code>{" "}
        or <code className="font-mono text-dark">expense</code>.
      </div>

      <div className="mt-6">
        <FileUpload companyId={company.id} />
      </div>
    </div>
  );
}
