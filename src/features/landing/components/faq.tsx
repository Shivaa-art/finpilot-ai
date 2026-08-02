"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "../data";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  return (
    <section id="faq" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-dark sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-12 divide-y divide-border rounded-[var(--radius-card)] border border-border bg-background">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-dark">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden px-6 transition-all duration-300",
                    isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  )}
                >
                  <p className="min-h-0 text-sm leading-relaxed text-muted">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
