"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  FileBarChart,
  Settings,
  Sparkles,
  SlidersHorizontal,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: UploadCloud },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Scenario", href: "/scenario", icon: SlidersHorizontal },
  { label: "AI Chat", href: "/chat", icon: MessageCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 max-w-[80vw] flex-col bg-surface p-5 shadow-elevated">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] font-semibold tracking-tight text-dark">FinPilot AI</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-primary-light text-primary-dark" : "text-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
