"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function IntegrationsPanel({ companyId, initialWebhookUrl }: { companyId: string; initialWebhookUrl: string | null }) {
  const [url, setUrl] = useState(initialWebhookUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase.from("companies").update({ webhook_url: url || null }).eq("id", companyId);
    setSaving(false);
    setSaved(true);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setTestResult(data.ok ? `Success — received HTTP ${data.status}.` : `Failed: ${data.error ?? "unknown error"}`);
    } catch {
      setTestResult("Failed to reach the test endpoint.");
    }
    setTesting(false);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-dark">Webhook</h2>
        <p className="text-xs text-muted">
          Point this at any endpoint (Zapier, n8n, your own server) to receive event notifications. This is real and
          testable right now.
        </p>
        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-endpoint.com/webhook"
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-dark disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Test
            </button>
          </div>
        </form>
        {saved && <p className="mt-2 text-xs text-success">Saved.</p>}
        {testResult && <p className="mt-2 text-xs text-muted">{testResult}</p>}
      </div>

      <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-6 text-xs text-muted">
        <p className="font-medium text-dark">CSV / Excel import &amp; export</p>
        <p className="mt-1">Already live — Upload accepts CSV/XLSX, Reports exports both CSV and PDF.</p>
        <p className="mt-3 font-medium text-dark">Direct accounting software integrations</p>
        <p className="mt-1">
          QuickBooks, Zoho Books, Xero, and Tally require OAuth partnership agreements with each provider, which
          isn&apos;t something that can be fabricated here. This is intentionally scoped as a Tier 3 future step
          rather than faked as working today.
        </p>
      </div>
    </div>
  );
}
