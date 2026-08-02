import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(req: Request) {
  let body: { messages?: UIMessage[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, context } = body;
  if (!Array.isArray(messages)) {
    return Response.json({ error: "Request must include a messages array." }, { status: 400 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local (or Vercel env vars) to enable AI Chat." },
      { status: 500 }
    );
  }

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: context ?? "You are FinPilot AI's financial assistant.",
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json({ error: "The AI chat request failed. Check your API key and try again." }, { status: 500 });
  }
}
