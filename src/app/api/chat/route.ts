import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, getTransactions } from "@/services/company";
import { runAIEngine } from "@/features/ai/engine";
import { buildChatContext } from "@/features/ai-chat/lib/context";
import { createSimulateScenarioTool } from "@/features/ai-chat/lib/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages)) {
    return Response.json({ error: "Request must include a messages array." }, { status: 400 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local (or Vercel env vars) to enable AI Chat." },
      { status: 500 }
    );
  }

  // Re-derive the financial context server-side from the authenticated session
  // rather than trusting anything the client sends — the chat can only ever
  // see and simulate against the real data for the logged-in user's company.
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);

  let context = "No company found for this user. Tell them to complete onboarding first.";
  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];

  if (company) {
    transactions = await getTransactions(supabase, company.id);
    const engine = runAIEngine(transactions);
    context = buildChatContext(company.name, engine, engine.recommendations);
  }

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: context,
      messages: await convertToModelMessages(messages),
      tools: { simulateScenario: createSimulateScenarioTool(transactions) },
      stopWhen: stepCountIs(4),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json({ error: "The AI chat request failed. Check your API key and try again." }, { status: 500 });
  }
}
