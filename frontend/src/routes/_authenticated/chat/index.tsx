import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/chat/")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: existing } = await supabase
        .from("chat_threads")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing?.id) {
        throw redirect({ to: "/chat/$threadId", params: { threadId: existing.id } });
      }
      const { data: created } = await supabase
        .from("chat_threads")
        .insert({ user_id: u.user.id, title: "New session" })
        .select()
        .single();
      if (created?.id) {
        throw redirect({ to: "/chat/$threadId", params: { threadId: created.id } });
      }
    } catch (e: any) {
      if (e?.to) throw e;
    }
    // Fallback if table doesn't exist yet
    throw redirect({ to: "/chat/$threadId", params: { threadId: "default" } });
  },
  component: ChatIndexFallback,
});

function ChatIndexFallback() {
  const nav = useNavigate();
  useEffect(() => {
    nav({ to: "/chat/$threadId", params: { threadId: "default" }, replace: true });
  }, [nav]);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
