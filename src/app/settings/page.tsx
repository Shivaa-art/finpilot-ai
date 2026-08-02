import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/services/company";
import { listMembers } from "@/features/team-management";
import { listApiKeys } from "@/features/api-access";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopNavbar } from "@/features/dashboard/components/top-navbar";
import { SettingsTabs } from "@/features/settings/components/settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);
  if (!company) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === company.user_id;

  const members = await listMembers(supabase, company.id);
  const apiKeys = await listApiKeys(supabase, company.id);

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNavbar companyName={company.name} companyId={company.id} />
        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-dark">Settings</h1>
            <p className="text-sm text-muted">Manage your company profile and workspace.</p>
          </div>
          <SettingsTabs company={company} isOwner={isOwner} members={members} apiKeys={apiKeys} />
        </main>
      </div>
    </div>
  );
}
