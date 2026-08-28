import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  ClipboardList,
  Stethoscope,
  Bell,
  Settings,
  HeartPulse,
  Menu,
  X,
  ChevronsLeft,
  LogOut,
  ChevronRight,
  History,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/chat", key: "nav.chat", icon: MessageSquare, isChat: true },
  { to: "/chat-history", key: "nav.chat_history", icon: History, isHistory: true },
  { to: "/records", key: "nav.records", icon: FileText },
  { to: "/reports", key: "nav.reports", icon: ClipboardList },
  { to: "/doctors", key: "nav.doctors", icon: Stethoscope },
  { to: "/notifications", key: "nav.notifications", icon: Bell },
  { to: "/settings", key: "nav.settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isNavActive = (item: (typeof NAV)[number]) => {
    if ((item as any).isHistory) {
      return pathname === "/chat-history";
    }
    if ((item as any).isChat) {
      return pathname === "/chat" || pathname.startsWith("/chat/");
    }
    return pathname === item.to || pathname.startsWith(item.to + "/");
  };

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2">
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-7 rounded bg-primary text-primary-foreground grid place-items-center">
            <HeartPulse className="size-4" />
          </div>
          <span className="font-display font-bold">TraumaGuard</span>
        </div>
        <div className="size-5" />
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside
          className={`hidden lg:flex flex-col border-r border-border bg-card sticky top-0 h-screen transition-[width] ${collapsed ? "w-16" : "w-64"}`}
        >
          <div className="p-4 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <HeartPulse className="size-4" />
              </div>
              {!collapsed && (
                <div>
                  <div className="font-display font-bold text-sm">TraumaGuard</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    AI
                  </div>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <ChevronsLeft
                className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <nav className="flex-1 px-2 space-y-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{t(item.key)}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="p-2 space-y-1 border-t border-border">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
            >
              <LogOut className="size-4" />
              {!collapsed && <span>{t("auth.signout")}</span>}
            </button>
          </div>
        </aside>

        {/* Sidebar - mobile drawer */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <aside
              className="absolute inset-y-0 left-0 w-72 bg-card p-4 flex flex-col animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                    <HeartPulse className="size-4" />
                  </div>
                  <span className="font-display font-bold">TraumaGuard</span>
                </div>
                <button onClick={() => setOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>
              <nav className="space-y-0.5 flex-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent"}`}
                    >
                      <Icon className="size-4" />
                      <span>{t(item.key)}</span>
                      <ChevronRight className="size-4 ml-auto" />
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={signOut}
                className="mt-2 flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent cursor-pointer"
              >
                <LogOut className="size-4" /> {t("auth.signout")}
              </button>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 lg:pb-8 animate-fade-up">{children}</main>
        


      </div>
    </div>
  );
}
