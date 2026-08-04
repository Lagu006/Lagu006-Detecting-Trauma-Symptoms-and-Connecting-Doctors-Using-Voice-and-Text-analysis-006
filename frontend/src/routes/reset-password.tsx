import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — TraumaGuard AI" },
      { name: "description", content: "Set a new password for your TraumaGuard AI account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 space-y-4"
      >
        <h1 className="font-display font-bold text-xl">Set a new password</h1>
        <input
          type="password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="New password"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
        <button
          disabled={loading}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
        >
          Update password
        </button>
      </form>
    </div>
  );
}
