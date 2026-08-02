import type { AIRecommendation } from "@/types";
import type { FinancialState } from "@/features/financial-state-engine";
import type { DecisionDNAProfile } from "@/features/decision-dna-engine";

export interface ReportSection {
  heading: string;
  paragraphs: string[];
}

export interface NarrativeReport {
  title: string;
  subtitle: string;
  sections: ReportSection[];
}

function trendPhrase(state: FinancialState): string {
  if (state.trendSlope > 0) return "an improving cash flow trend";
  if (state.trendSlope < 0) return "a softening cash flow trend that is worth monitoring";
  return "a flat, stable cash flow trend";
}

function runwayPhrase(state: FinancialState): string {
  if (state.daysUntilNegative === null) return "cash position stays positive across the full 90-day forecast";
  return `cash position is projected to turn negative in ${state.daysUntilNegative} days on current trajectory`;
}

/**
 * Investor Update — framed for an outside reader who doesn't see the
 * day-to-day operations: leads with the growth story and health signal,
 * not the internal operational detail.
 */
export function buildInvestorReport(
  companyName: string,
  state: FinancialState,
  recommendations: AIRecommendation[]
): NarrativeReport {
  const topRevenue = recommendations.find((r) => r.category === "revenue");
  const topRisk = recommendations.find((r) => r.impact.direction === "negative");

  const sections: ReportSection[] = [
    {
      heading: "Financial Health",
      paragraphs: [
        `${companyName}'s Financial Health Score currently stands at ${state.healthScore}/100, computed from ${state.dataQuality.transactionCount} transactions over the last ${state.dataQuality.daySpan} days. This reading reflects ${trendPhrase(
          state
        )}, and ${runwayPhrase(state)}.`,
        `Net profit over the reporting period was $${Math.round(state.netProfit).toLocaleString()}, on total income of $${Math.round(
          state.totalIncome
        ).toLocaleString()} against total expenses of $${Math.round(state.totalExpenses).toLocaleString()}.`,
      ],
    },
    {
      heading: "Growth Signal",
      paragraphs: topRevenue
        ? [topRevenue.reasoning, `Confidence in this signal: ${topRevenue.confidence}/100 (${state.confidenceBreakdown.label}).`]
        : ["No standout revenue growth category was detected this period."],
    },
    {
      heading: "Risk Disclosure",
      paragraphs: topRisk
        ? [topRisk.reasoning]
        : ["No material cash flow or expense risk was detected in the current reporting period."],
    },
    {
      heading: "Data Basis & Confidence",
      paragraphs: [
        `This report is generated entirely from uploaded transaction data — no figure here is estimated or inferred beyond what the underlying transactions support. Overall confidence in this analysis is ${state.confidence}/100 (${state.confidenceBreakdown.label}), based on transaction volume, history span, and cash flow stability.`,
      ],
    },
  ];

  return {
    title: `${companyName} — Investor Update`,
    subtitle: `Generated ${new Date().toLocaleDateString()} · Financial Health ${state.healthScore}/100`,
    sections,
  };
}

/** CEO Weekly Brief — short, decision-focused, meant to be read in under two minutes. */
export function buildCEOWeeklyBrief(
  companyName: string,
  state: FinancialState,
  recommendations: AIRecommendation[]
): NarrativeReport {
  const top = recommendations[0];
  const rest = recommendations.slice(1, 4);

  const sections: ReportSection[] = [
    {
      heading: "This Week's Priority",
      paragraphs: top
        ? [`${top.title}. ${top.reasoning}`]
        : ["No recommendations available yet — upload more transaction data to activate the engine."],
    },
    {
      heading: "Also Worth Knowing",
      paragraphs:
        rest.length > 0
          ? rest.map((r) => `${r.title} (confidence ${r.confidence}%, impact ${r.impact.direction === "negative" ? "-" : "+"}$${r.impact.amount.toLocaleString()}).`)
          : ["Nothing else flagged this cycle."],
    },
    {
      heading: "Numbers at a Glance",
      paragraphs: [
        `Health ${state.healthScore}/100 · Cash position $${Math.round(state.cashPosition).toLocaleString()} · ${runwayPhrase(
          state
        )}.`,
      ],
    },
  ];

  return {
    title: `${companyName} — CEO Weekly Brief`,
    subtitle: `Week of ${new Date().toLocaleDateString()}`,
    sections,
  };
}

/** Board Meeting Report — the most complete version: full state, every recommendation, and the decision-making pattern behind them. */
export function buildBoardReport(
  companyName: string,
  state: FinancialState,
  recommendations: AIRecommendation[],
  dna: DecisionDNAProfile
): NarrativeReport {
  const sections: ReportSection[] = [
    {
      heading: "Executive Summary",
      paragraphs: [
        `${companyName} reports a Financial Health Score of ${state.healthScore}/100 this period, with ${trendPhrase(
          state
        )} and ${runwayPhrase(state)}. Net profit stands at $${Math.round(state.netProfit).toLocaleString()}.`,
      ],
    },
    {
      heading: "Category Breakdown",
      paragraphs: state.categories
        .slice(0, 5)
        .map((c) => `${c.category} (${c.type}): $${Math.round(c.total).toLocaleString()}, ${Math.round(c.share * 100)}% of ${c.type}.`),
    },
    {
      heading: "AI Recommendations This Period",
      paragraphs:
        recommendations.length > 0
          ? recommendations.map(
              (r, i) =>
                `${i + 1}. ${r.title} — ${r.reasoning} (Confidence ${r.confidence}%, impact ${
                  r.impact.direction === "negative" ? "-" : "+"
                }$${r.impact.amount.toLocaleString()}.)`
            )
          : ["No recommendations generated this period."],
    },
    {
      heading: "Decision-Making Pattern",
      paragraphs: dna.sufficientHistory
        ? dna.insights
        : [`Not enough resolved decision history yet (${dna.totalResolved} resolved) to report a pattern.`],
    },
  ];

  return {
    title: `${companyName} — Board Meeting Report`,
    subtitle: `Prepared ${new Date().toLocaleDateString()}`,
    sections,
  };
}
