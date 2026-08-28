import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.hash && location.hash.includes("error")) {
      const params = new URLSearchParams(location.hash.substring(1));
      const errorDesc = params.get("error_description") || "OAuth Error";
      throw redirect({ to: "/auth", search: { error: errorDesc } });
    }
    // If coming from OAuth redirect, don't redirect yet to allow Supabase to process the hash
    if (location.hash && location.hash.includes("access_token")) {
      return;
    }
    
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/chat" });
    throw redirect({ to: "/chat" });
  },
  component: () => null,
});
