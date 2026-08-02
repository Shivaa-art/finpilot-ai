"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const INDUSTRIES = ["Retail", "E-commerce", "Manufacturing", "Services", "Food & Beverage", "Technology", "Other"];
const EMPLOYEE_RANGES = ["1-5", "6-20", "21-50", "51-200", "200+"];
const REVENUE_RANGES = ["< $100K", "$100K-$500K", "$500K-$2M", "$2M-$10M", "$10M+"];
const GOAL_OPTIONS = [
  "Improve cash flow visibility",
  "Cut unnecessary expenses",
  "Plan hiring with confidence",
  "Find new revenue opportunities",
  "Prepare for fundraising",
];

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [country, setCountry] = useState("India");
  const [employees, setEmployees] = useState(EMPLOYEE_RANGES[0]);
  const [annualRevenue, setAnnualRevenue] = useState(REVENUE_RANGES[0]);
  const [financialSoftware, setFinancialSoftware] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleGoal(goal: string) {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session expired — please log in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("companies").insert({
      user_id: user.id,
      name,
      industry,
      country,
      employees,
      annual_revenue: annualRevenue,
      financial_software: financialSoftware || null,
      goals,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push("/upload");
    router.refresh();
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary";
  const labelClass = "text-sm font-medium text-dark";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="companyName" className={labelClass}>
          Company name
        </label>
        <input
          id="companyName"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Acme Retail Pvt Ltd"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="industry" className={labelClass}>
            Industry
          </label>
          <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>
            Country
          </label>
          <input id="country" required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="employees" className={labelClass}>
            Employees
          </label>
          <select
            id="employees"
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            className={inputClass}
          >
            {EMPLOYEE_RANGES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="revenue" className={labelClass}>
            Annual revenue
          </label>
          <select
            id="revenue"
            value={annualRevenue}
            onChange={(e) => setAnnualRevenue(e.target.value)}
            className={inputClass}
          >
            {REVENUE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="software" className={labelClass}>
          Current financial software (optional)
        </label>
        <input
          id="software"
          value={financialSoftware}
          onChange={(e) => setFinancialSoftware(e.target.value)}
          className={inputClass}
          placeholder="Tally, Zoho Books, QuickBooks..."
        />
      </div>

      <div>
        <span className={labelClass}>What are you hoping to get out of FinPilot?</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => {
            const active = goals.includes(goal);
            return (
              <button
                type="button"
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary-light text-primary-dark"
                    : "border-border bg-surface text-muted hover:text-dark"
                }`}
              >
                {goal}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Saving..." : "Continue to upload data"}
      </button>
    </form>
  );
}
