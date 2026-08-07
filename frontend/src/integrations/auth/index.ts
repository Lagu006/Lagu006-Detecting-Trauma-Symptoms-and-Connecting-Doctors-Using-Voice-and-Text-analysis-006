import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  scopes?: string;
  extraParams?: Record<string, string>;
};

export const authProvider = {
  auth: {
    signInWithOAuth: async (provider: string, opts?: SignInOptions) => {
      const result = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: opts?.redirect_uri,
          queryParams: opts?.extraParams,
          scopes: opts?.scopes,
        }
      });
      return result;
    },
  },
};
