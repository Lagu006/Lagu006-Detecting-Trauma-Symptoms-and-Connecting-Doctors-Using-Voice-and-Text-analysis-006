import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authProvider } from "@/integrations/auth";
import { LANGUAGES, type LangCode } from "@/lib/languages";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { HeartPulse, ArrowRight, Mail, Lock, Phone, User } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { error?: string } => {
    return {
      error: search.error as string | undefined,
    };
  },
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — TraumaGuard AI" },
      { name: "description", content: "Sign in or create your TraumaGuard AI account." },
      { property: "og:title", content: "Sign in — TraumaGuard AI" },
      { property: "og:description", content: "Multilingual trauma support in your language." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (search.error) {
      toast.error(decodeURIComponent(search.error).replace(/\+/g, " "));
      // Clean up URL
      nav({ to: "/auth", replace: true, search: {} });
    }
  }, [search.error, nav]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);

    // Sync user to PostgreSQL backend
    try {
      await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: authData.user?.id,
          email: email,
          full_name: authData.user?.user_metadata?.full_name || email.split("@")[0],
          phone: authData.user?.user_metadata?.phone || "",
        }),
      });
    } catch {}

    toast.success("Welcome back");
    nav({ to: "/dashboard" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPw) return toast.error("Passwords do not match");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone, gender, language: lang },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    // Sync newly created user to PostgreSQL database
    try {
      await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: authData.user?.id,
          email: email,
          full_name: fullName,
          phone: phone,
        }),
      });
    } catch (err) {
      console.warn("Could not sync user to PostgreSQL", err);
    }

    toast.success("Account created — you're signed in");
    nav({ to: "/dashboard" });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.resetSent"));
    setMode("signin");
  }

  async function handleGoogle() {
    const r = await authProvider.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      // Always show the Google account chooser instead of silently reusing a session
      extraParams: { prompt: "select_account" },
    });
    if (r.error) toast.error(r.error.message);
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
      {/* Left: brand + language */}
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <HeartPulse className="size-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Initialization
            </div>
            <div className="text-sm font-semibold">{t("app.title")}</div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-[1.1]">
          {t("app.tagline")}
          <br />
          <span className="text-primary">TraumaGuard AI.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {t("auth.chooseLang")}. {t("auth.langHint")}
        </p>
        <div className="flex flex-wrap gap-2 max-w-md">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code as LangCode)}
              className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${l.fontClass ?? ""} ${
                lang === l.code
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-accent border-border"
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* Right: form card */}
      <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-5 animate-fade-up">
        <div className="flex bg-muted/60 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("auth.signin")}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("auth.signup")}
          </button>
        </div>

        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <Field icon={<User className="size-4" />} label={t("auth.fullName")}>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Arjun Mehta"
              />
            </Field>
            <Field icon={<Mail className="size-4" />} label={t("auth.email")}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            <Field icon={<Phone className="size-4" />} label={t("auth.phone")}>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                placeholder="+91 00000-00000"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Lock className="size-4" />} label={t("auth.password")}>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </Field>
              <Field icon={<Lock className="size-4" />} label={t("auth.confirmPassword")}>
                <input
                  required
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </Field>
            </div>
            <Field label={t("auth.gender")}>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
                <option value="male">{t("auth.male")}</option>
                <option value="female">{t("auth.female")}</option>
                <option value="other">{t("auth.other")}</option>
              </select>
            </Field>
            <button disabled={loading} className="btn-primary w-full">
              {t("auth.signup")} <ArrowRight className="size-4" />
            </button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <Field icon={<Mail className="size-4" />} label={t("auth.email")}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            <Field icon={<Lock className="size-4" />} label={t("auth.password")}>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </Field>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-primary hover:underline"
              >
                {t("auth.forgot")}
              </button>
            </div>
            <button disabled={loading} className="btn-primary w-full">
              {t("auth.signin")} <ArrowRight className="size-4" />
            </button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary font-semibold hover:underline"
              >
                Create an account
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter your email — we'll send reset instructions.
            </p>
            <Field icon={<Mail className="size-4" />} label={t("auth.email")}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            <button disabled={loading} className="btn-primary w-full">
              Send reset link
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </button>
          </form>
        )}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {t("auth.orContinue")}
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          type="button"
          className="w-full py-2.5 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <GoogleIcon /> {t("auth.google")}
        </button>

        <p className="text-[10px] text-muted-foreground text-center">{t("auth.sms.note")}</p>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s;
        }
        .input:focus { box-shadow: 0 0 0 3px var(--ring); border-color: var(--primary); }
        .btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--primary); color: var(--primary-foreground);
          border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600;
          transition: opacity 0.15s; cursor: pointer;
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
