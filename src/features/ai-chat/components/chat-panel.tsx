"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Loader2, Sparkles } from "lucide-react";

export function ChatPanel() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col rounded-[var(--radius-card)] border border-border bg-surface shadow-soft">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-dark">Ask about your finances</p>
            <p className="max-w-xs text-xs text-muted">
              This chat is grounded in your real Financial State and can run real scenario simulations — try
              &ldquo;Can I hire another developer at $65k/month?&rdquo; or &ldquo;What if I cut Marketing 20%?&rdquo;
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-primary text-white" : "bg-background text-dark"
                }`}
              >
                {m.parts.map((part, i) => {
                  if (part.type === "text") return <span key={i}>{part.text}</span>;
                  if (part.type === "tool-simulateScenario") {
                    return (
                      <div key={i} className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-primary">
                        <Sparkles className="h-3 w-3" />
                        {"input" in part && part.input && typeof part.input === "object"
                          ? `Simulated: ${(part.input as { category?: string }).category ?? "scenario"} ${
                              (part.input as { percentChange?: number }).percentChange ?? ""
                            }%`
                          : "Running scenario simulation..."}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          {isBusy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-background px-4 py-2.5 text-sm text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-danger-light px-4 py-3 text-xs text-danger">
            {error.message || "Something went wrong. Check that GOOGLE_GENERATIVE_AI_API_KEY is set."}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your financial state..."
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
