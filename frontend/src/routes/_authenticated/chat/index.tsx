import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const Route = createFileRoute("/_authenticated/chat/")({
  ssr: false,
  beforeLoad: async () => {
    try {
      let userId = "usr_default";
      const { data: u } = await supabase.auth.getUser();
      if (u?.user?.id) userId = u.user.id;

      // Always start the main chat entry in a fresh session.
      // Previous sessions remain available from the session history panel.
      const createRes = await fetch(`${API_URL}/api/chat/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, title: "New session" }),
      });
      if (createRes.ok) {
        const createdData = await createRes.json();
        if (createdData.thread?.id) {
          throw redirect({ to: "/chat/$threadId", params: { threadId: createdData.thread.id } });
        }
      }
    } catch (e: any) {
      if (e?.to) throw e;
    }
    // Fallback if network issue
    throw redirect({ to: "/chat/$threadId", params: { threadId: `th_${Date.now()}` } });
  },
  component: ChatIndexFallback,
});

function ChatIndexFallback() {
  const nav = useNavigate();
  useEffect(() => {
    nav({ to: "/chat/$threadId", params: { threadId: `th_${Date.now()}` }, replace: true });
  }, [nav]);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

