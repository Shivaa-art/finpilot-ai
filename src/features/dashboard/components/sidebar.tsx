"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UploadCloud, FileBarChart, Settings, Sparkles, SlidersHorizontal, MessageCircle } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: UploadCloud },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Scenario", href: "/scenario", icon: SlidersHorizontal },
  { label: "AI Chat", href: "/chat", icon: MessageCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
      <Link href="/" className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-dark">FinPilot AI</span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-primary-light text-primary-dark" : "text-muted hover:bg-primary-light hover:text-primary-dark"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
