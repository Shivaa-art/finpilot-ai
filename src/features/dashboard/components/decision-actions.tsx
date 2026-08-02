"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DecisionStatus } from "@/features/decision-memory-engine";

export function DecisionActions({ logId, status }: { logId: string; status: DecisionStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<DecisionStatus | null>(null);

  async function resolve(next: "accepted" | "dismissed") {
    setLoading(next);
    const supabase = createClient();
    await supabase
      .from("decision_log")
      .update({ status: next, resolved_at: new Date().toISOString() })
      .eq("id", logId);
    setLoading(null);
    router.refresh();
  }

  if (status !== "pending") {
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
          status === "accepted" ? "bg-success-light text-success" : "bg-danger-light text-danger"
        }`}
      >
        {status === "accepted" ? "Accepted" : "Dismissed"}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => resolve("accepted")}
        disabled={loading !== null}
        className="flex items-center gap-1 rounded-full bg-success-light px-3 py-1.5 text-[11px] font-medium text-success disabled:opacity-60"
      >
        {loading === "accepted" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Accept
      </button>
      <button
        onClick={() => resolve("dismissed")}
        disabled={loading !== null}
        className="flex items-center gap-1 rounded-full bg-danger-light px-3 py-1.5 text-[11px] font-medium text-danger disabled:opacity-60"
      >
        {loading === "dismissed" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        Dismiss
      </button>
    </div>
  );
}
