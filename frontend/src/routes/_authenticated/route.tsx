import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Mock user for bypass
      data = { user: { id: "00000000-0000-0000-0000-000000000000", email: "guest@traumaguard.local" } as any };
    }

    // Sync logged in user to PostgreSQL
    try {
      fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Trauma Patient",
          phone: data.user.user_metadata?.phone || "",
        }),
      }).catch(() => {});
    } catch {}

    return { user: data.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
