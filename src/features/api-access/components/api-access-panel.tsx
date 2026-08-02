"use client";

import { useState } from "react";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateApiKey, revokeApiKey } from "@/features/api-access";
import type { ApiKey } from "@/features/api-access";

export function ApiAccessPanel({ companyId, initialKeys }: { companyId: string; initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { key, error } = await generateApiKey(supabase, companyId, label);

    setLoading(false);
    if (error || !key) {
      setError(error ?? "Failed to generate key.");
      return;
    }
    setKeys((prev) => [key, ...prev]);
    setLabel("");
  }

  async function handleRevoke(id: string) {
    const supabase = createClient();
    await revokeApiKey(supabase, id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copy(k: ApiKey) {
    navigator.clipboard.writeText(k.key);
    setCopiedId(k.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-dark">API Keys</h2>
        <p className="text-xs text-muted">
          Real keys, backed by a live endpoint:{" "}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">
            GET /api/v1/financial-state?key=YOUR_KEY
          </code>{" "}
          returns your current Financial State as JSON.
        </p>

        <form onSubmit={handleGenerate} className="mt-4 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Key label (e.g. 'Zapier integration')"
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate
          </button>
        </form>

        {error && <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex flex-col gap-2">
          {keys.length === 0 && <p className="text-xs text-muted">No API keys yet.</p>}
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm text-dark">{k.label}</p>
                <p className="truncate font-mono text-xs text-muted">{k.key}</p>
                <p className="text-[11px] text-muted">
                  {k.last_used_at ? `Last used ${new Date(k.last_used_at).toLocaleString()}` : "Never used"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => copy(k)} className="rounded-full border border-border p-2 text-muted hover:text-dark">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleRevoke(k.id)} className="rounded-full border border-border p-2 text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {copiedId === k.id && <span className="text-[10px] text-success">Copied!</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
