import { ArrowRight, PlayCircle, TrendingUp } from "lucide-react";
import { ConfidenceRing } from "@/components/ui/confidence-ring";
import { heroRecommendation } from "../data";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--color-primary-light) 0%, var(--color-background) 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-soft">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Explainable financial decision intelligence
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-dark sm:text-6xl">
            Every Financial Decision,
            <br className="hidden sm:block" /> Backed by AI You Can Trust.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            FinPilot AI reads your business&apos;s real financial data and tells you the
            single best decision to make today — with the reasoning, the confidence
            score, and the alternatives it ruled out.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-dark transition-colors hover:bg-primary-light sm:w-auto"
            >
              <PlayCircle className="h-4 w-4" />
              See how it works
            </a>
          </div>
        </div>

        {/* Signature element: a live AI recommendation, not a generic chart mockup */}
        <div className="mx-auto mt-16 max-w-2xl animate-fade-up [animation-delay:150ms] opacity-0">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-elevated sm:p-8">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-dark">
                Today&apos;s recommendation
              </span>
              <span className="text-xs font-medium text-muted">Cash Flow</span>
            </div>

            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
              <ConfidenceRing value={heroRecommendation.confidence} className="mx-auto sm:mx-0 shrink-0" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-dark">{heroRecommendation.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{heroRecommendation.reasoning}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success-light px-2.5 py-1 text-xs font-semibold text-success">
                  +${heroRecommendation.impact.amount.toLocaleString()} projected impact
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
