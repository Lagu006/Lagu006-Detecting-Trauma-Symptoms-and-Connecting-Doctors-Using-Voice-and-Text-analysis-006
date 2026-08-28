import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  scopes?: string;
  extraParams?: Record<string, string>;
};

export const authProvider = {
  auth: {
    signInWithOAuth: async (provider: string, opts?: SignInOptions) => {
      // Mock OAuth to bypass paused Supabase
      console.warn("Supabase is paused. Simulating Google OAuth login...");
      
      const dummySession = {
        access_token: "dummy-token-google",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "dummy-refresh-google",
        user: {
          id: "dummy-google-user",
          email: "googleuser@example.com",
          user_metadata: { full_name: "Google User" },
          app_metadata: { provider: "google" }
        }
      };
      
      // Store dummy session so getSession() can find it if we mock it, or just use localStorage
      localStorage.setItem("traumaguard_dummy_session", JSON.stringify(dummySession));
      
      // Force reload to dashboard
      window.location.href = "/dashboard";
      return { data: { provider: provider as any, url: "" }, error: null };
    },
  },
};
