import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
export const Route = createFileRoute("/_authenticated/chat/")({
  ssr: false,
  beforeLoad: async () => {
    try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
      }
    } catch (e: any) {
      if (e?.to) throw e;
    }
<<<<<<< HEAD
    // Fallback if network issue
    throw redirect({ to: "/chat/$threadId", params: { threadId: `th_${Date.now()}` } });
=======
    // Fallback if table doesn't exist yet
    throw redirect({ to: "/chat/$threadId", params: { threadId: "default" } });
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  },
  component: ChatIndexFallback,
});

function ChatIndexFallback() {
  const nav = useNavigate();
  useEffect(() => {
<<<<<<< HEAD
    nav({ to: "/chat/$threadId", params: { threadId: `th_${Date.now()}` }, replace: true });
=======
    nav({ to: "/chat/$threadId", params: { threadId: "default" }, replace: true });
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  }, [nav]);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
