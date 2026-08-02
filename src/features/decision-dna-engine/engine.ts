import type { DecisionLogEntry } from "@/features/decision-memory-engine";
import type { CategoryDNA, DecisionDNAProfile } from "./types";

const MIN_HISTORY_FOR_INSIGHTS = 5;

/**
 * Builds a "Decision DNA" profile: not what the business SHOULD do
 * (that's the Opportunity Detection / Decision Optimisation engines), but
 * what it actually HAS done historically when FinPilot surfaced a
 * recommendation. This is descriptive, not prescriptive — it reads the
 * resolved decision_log entries and reports patterns, it doesn't change
 * any ranking on its own (that hook is intentionally left for a future
 * pass once there's enough real usage history to justify it).
 */
export function computeDecisionDNA(history: DecisionLogEntry[]): DecisionDNAProfile {
  const resolved = history.filter((h) => h.status === "accepted" || h.status === "dismissed");

  if (resolved.length === 0) {
    return {
      totalResolved: 0,
      overallAcceptanceRate: 0,
      byCategory: [],
      insights: [],
      sufficientHistory: false,
    };
  }

  const byCategoryMap = new Map<string, { accepted: number; dismissed: number }>();
  let totalAccepted = 0;

  for (const entry of resolved) {
    const row = byCategoryMap.get(entry.category) ?? { accepted: 0, dismissed: 0 };
    if (entry.status === "accepted") {
      row.accepted += 1;
      totalAccepted += 1;
    } else {
      row.dismissed += 1;
    }
    byCategoryMap.set(entry.category, row);
  }

  const byCategory: CategoryDNA[] = Array.from(byCategoryMap.entries())
    .map(([category, row]) => ({
      category,
      accepted: row.accepted,
      dismissed: row.dismissed,
      acceptanceRate: row.accepted + row.dismissed > 0 ? row.accepted / (row.accepted + row.dismissed) : 0,
    }))
    .sort((a, b) => b.accepted + b.dismissed - (a.accepted + a.dismissed));

  const overallAcceptanceRate = totalAccepted / resolved.length;
  const sufficientHistory = resolved.length >= MIN_HISTORY_FOR_INSIGHTS;

  const insights: string[] = [];
  if (sufficientHistory) {
    const mostAccepted = [...byCategory].sort((a, b) => b.acceptanceRate - a.acceptanceRate)[0];
    const mostDismissed = [...byCategory].sort((a, b) => a.acceptanceRate - b.acceptanceRate)[0];

    if (mostAccepted && mostAccepted.acceptanceRate > 0.6) {
      insights.push(
        `This business tends to act on ${mostAccepted.category} recommendations — ${Math.round(
          mostAccepted.acceptanceRate * 100
        )}% acceptance rate.`
      );
    }
    if (mostDismissed && mostDismissed.acceptanceRate < 0.4 && mostDismissed.category !== mostAccepted?.category) {
      insights.push(
        `${mostDismissed.category} recommendations are dismissed more often than accepted — ${Math.round(
          (1 - mostDismissed.acceptanceRate) * 100
        )}% dismissal rate.`
      );
    }
    insights.push(
      `Overall, ${Math.round(overallAcceptanceRate * 100)}% of surfaced recommendations have been accepted across ${
        resolved.length
      } resolved decisions.`
    );
  }

  return { totalResolved: resolved.length, overallAcceptanceRate, byCategory, insights, sufficientHistory };
}
