import {
  Brain,
  LineChart,
  Scissors,
  Sparkles,
  Users,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import { features } from "../data";

const icons: Record<string, LucideIcon> = {
  "explainable-ai": Brain,
  "cash-flow-prediction": LineChart,
  "expense-optimization": Scissors,
  "revenue-opportunities": Sparkles,
  "hiring-investment": Users,
  "ceo-brief": Sunrise,
};

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl">
            Built for the decisions that actually move the business
          </h2>
          <p className="mt-4 text-muted">
            Not another dashboard of numbers you have to interpret yourself.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = icons[feature.id] ?? Sparkles;
            return (
              <div
                key={feature.id}
                className="rounded-[var(--radius-card)] border border-border bg-background p-6 transition-shadow hover:shadow-soft"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-dark">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
