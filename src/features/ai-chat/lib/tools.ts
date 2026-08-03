import { tool } from "ai";
import { z } from "zod";
import { simulateScenario } from "@/features/scenario-simulation-engine";
import type { Transaction } from "@/types";

/**
 * Wraps the real Scenario Simulation Engine as a tool the chat model can
 * call. The model never computes the financial effect itself — it only
 * decides WHAT to simulate (category, type, percent change) and the tool
 * runs the actual deterministic engine (the same one behind /scenario) to
 * get a real answer, which the model then explains in words.
 */
export function createSimulateScenarioTool(transactions: Transaction[]) {
  return tool({
    description:
      "Simulate a hypothetical percentage change to one financial category (e.g. Payroll, Marketing, Rent) and see the real effect on the 90-day cash flow projection and runway. Always call this for any 'what if' / hiring / spending question rather than estimating the answer yourself.",
    inputSchema: z.object({
      category: z.string().describe("The exact category name from the CATEGORY BREAKDOWN in the system context, e.g. 'Payroll'"),
      type: z.enum(["income", "expense"]).describe("Whether this category is income or expense"),
      percentChange: z
        .number()
        .describe("Percent change to apply, e.g. 15 for a 15% increase, -20 for a 20% cut. Convert any dollar amount to this percent using the category's current total from the context."),
    }),
    execute: async ({ category, type, percentChange }) => {
      if (transactions.length === 0) {
        return { error: "No transaction data available to simulate against." };
      }

      const result = simulateScenario(transactions, [{ category, type, percentChange }]);

      return {
        category,
        type,
        percentChange,
        baselineDaysUntilNegative: result.baselineDaysUntilNegative,
        scenarioDaysUntilNegative: result.scenarioDaysUntilNegative,
        baselineDay90Position: Math.round(result.baselineDay90),
        scenarioDay90Position: Math.round(result.scenarioDay90),
        day90Delta: Math.round(result.scenarioDay90 - result.baselineDay90),
      };
    },
  });
}
