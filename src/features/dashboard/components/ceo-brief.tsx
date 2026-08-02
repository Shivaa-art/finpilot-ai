import { Newspaper, AlertTriangle } from "lucide-react";
import type { AIRecommendation } from "@/types";

export function CEOBrief({
  topRecommendation,
  daysUntilNegative,
}: {
  topRecommendation: AIRecommendation | null;
  daysUntilNegative: number | null;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-dark p-6 text-white shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium text-white/70">
        <Newspaper className="h-4 w-4" />
        Today&apos;s CEO Brief
      </div>

      {topRecommendation ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-white/90">{topRecommendation.title}.</p>
          {daysUntilNegative !== null && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs leading-relaxed text-white/80">
                Cash position is projected to turn negative in {daysUntilNegative} days — this needs a decision soon.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Upload your transaction data to generate today&apos;s brief.
        </p>
      )}
    </div>
  );
}
