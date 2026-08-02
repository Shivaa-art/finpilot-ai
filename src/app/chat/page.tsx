import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, getTransactions } from "@/services/company";
import { runAIEngine } from "@/features/ai/engine";
import { buildChatContext } from "@/features/ai-chat/lib/context";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopNavbar } from "@/features/dashboard/components/top-navbar";
import { ChatPanel } from "@/features/ai-chat/components/chat-panel";

export default async function ChatPage() {
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);
  if (!company) redirect("/onboarding");

  const transactions = await getTransactions(supabase, company.id);
  const engine = runAIEngine(transactions);
  const context = buildChatContext(company.name, engine, engine.recommendations);

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNavbar companyName={company.name} companyId={company.id} />
        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-dark">AI Chat</h1>
            <p className="text-sm text-muted">Grounded in your real Financial State — powered by Gemini.</p>
          </div>
          <ChatPanel context={context} />
        </main>
      </div>
    </div>
  );
}
