import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — TraumaGuard AI" },
      { name: "description", content: "Care alerts and reminders." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: items = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      (await supabase.from("notifications").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-display font-bold tracking-tight">Notifications</h1>
      </div>
      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Bell className="size-8 mx-auto mb-3 opacity-40" />
          You're all caught up.
        </div>
      )}
      {items.map((n: any) => (
        <div key={n.id} className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-xl p-4">
          <div className="font-semibold text-sm">{n.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{n.body}</div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-2">
            {new Date(n.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
