"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MobileNav } from "./mobile-nav";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

export function TopNavbar({ companyName, companyId }: { companyName: string; companyId: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">Workspace</p>
          <p className="truncate text-sm font-semibold text-dark">{companyName}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationBell companyId={companyId} />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-2 text-xs font-medium text-muted hover:text-dark sm:px-3"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
