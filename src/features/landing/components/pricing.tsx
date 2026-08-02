import { Check } from "lucide-react";
import { pricingPlans } from "../data";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl">
          Pricing that scales with your decisions, not your headcount
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-[var(--radius-card)] border p-8",
              plan.highlighted
                ? "border-primary bg-dark text-white shadow-elevated lg:-translate-y-3"
                : "border-border bg-surface shadow-soft"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
                Most popular
              </span>
            )}

            <h3 className={cn("text-sm font-semibold", plan.highlighted ? "text-white" : "text-dark")}>
              {plan.name}
            </h3>
            <div className="mt-3 flex items-end gap-1">
              <span className={cn("text-3xl font-semibold tracking-tight", plan.highlighted ? "text-white" : "text-dark")}>
                {plan.price}
              </span>
              {plan.cadence && (
                <span className={cn("mb-1 text-sm", plan.highlighted ? "text-white/60" : "text-muted")}>
                  {plan.cadence}
                </span>
              )}
            </div>
            <p className={cn("mt-3 text-sm", plan.highlighted ? "text-white/70" : "text-muted")}>
              {plan.description}
            </p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check
                    className={cn("mt-0.5 h-4 w-4 shrink-0", plan.highlighted ? "text-success" : "text-primary")}
                  />
                  <span className={plan.highlighted ? "text-white/90" : "text-dark"}>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className={cn(
                "mt-8 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]",
                plan.highlighted ? "bg-white text-dark" : "bg-dark text-white"
              )}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
