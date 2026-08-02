"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { listNotifications, markAllRead } from "@/features/notifications";
import type { AppNotification } from "@/features/notifications";

export function NotificationBell({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    listNotifications(supabase, companyId).then((n) => {
      setNotifications(n);
      setLoaded(true);
    });
  }, [companyId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      const supabase = createClient();
      await markAllRead(supabase, companyId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:text-dark"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-elevated">
          <p className="px-2 py-1.5 text-xs font-medium text-muted">Notifications</p>
          {loaded && notifications.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted">No notifications yet.</p>
          )}
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg px-2 py-2 text-xs text-dark hover:bg-background">
                {n.message}
                <p className="mt-0.5 text-[10px] text-muted">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
