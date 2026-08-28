import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
<<<<<<< HEAD
    let { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Mock user for bypass
      data = { user: { id: "00000000-0000-0000-0000-000000000000", email: "guest@traumaguard.local" } as any };
    }

    // Sync logged in user to PostgreSQL
    try {
      fetch("/api/users/sync", {
=======
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Sync logged in user to PostgreSQL
    try {
      fetch("http://localhost:8000/api/users/sync", {
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
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
