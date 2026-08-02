"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/types";
import type { CompanyMember } from "@/features/team-management";
import type { ApiKey } from "@/features/api-access";
import { TeamManagement } from "@/features/team-management/components/team-management";
import { ApiAccessPanel } from "@/features/api-access/components/api-access-panel";
import { IntegrationsPanel } from "@/features/integrations/components/integrations-panel";
import { BillingPanel } from "@/features/integrations/components/billing-panel";
import { cn } from "@/lib/utils";

const TABS = ["Company", "Users", "Billing", "Notifications", "Integrations", "API Access", "Security"] as const;
type Tab = (typeof TABS)[number];

export function SettingsTabs({
  company,
  isOwner,
  members,
  apiKeys,
}: {
  company: Company;
  isOwner: boolean;
  members: CompanyMember[];
  apiKeys: ApiKey[];
}) {
  const [tab, setTab] = useState<Tab>("Company");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              tab === t ? "bg-dark text-white" : "bg-surface text-muted border border-border"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Company" && <CompanySettings company={company} />}
        {tab === "Users" && <TeamManagement companyId={company.id} initialMembers={members} isOwner={isOwner} />}
        {tab === "Billing" && <BillingPanel />}
        {tab === "Notifications" && <NotificationsInfo />}
        {tab === "Integrations" && <IntegrationsPanel companyId={company.id} initialWebhookUrl={company.webhook_url} />}
        {tab === "API Access" && <ApiAccessPanel companyId={company.id} initialKeys={apiKeys} />}
        {tab === "Security" && <PlaceholderSettings tab={tab} />}
      </div>
    </div>
  );
}

function CompanySettings({ company }: { company: Company }) {
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [country, setCountry] = useState(company.country);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("companies")
      .update({ name, industry, country })
      .eq("id", company.id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={handleSave} className="max-w-lg rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
      <h2 className="text-sm font-semibold text-dark">Company details</h2>
      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-dark">Company name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-dark">Industry</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-dark">Country</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}
      {saved && <p className="mt-3 rounded-lg bg-success-light px-3 py-2 text-sm text-success">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-5 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

function NotificationsInfo() {
  return (
    <div className="max-w-lg rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-6 text-sm text-muted">
      Notifications are real and already active — check the bell icon in the top bar. This tab is reserved for
      future notification preferences (e.g. email digests), which aren&apos;t built yet.
    </div>
  );
}

/**
 * Honest placeholder: Security (2FA, session management, audit logs) isn't
 * wired up yet, so this says so plainly rather than faking it.
 */
function PlaceholderSettings({ tab }: { tab: Tab }) {
  return (
    <div className="max-w-lg rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
      {tab} settings aren&apos;t built yet — this is the next module to wire up.
    </div>
  );
}
