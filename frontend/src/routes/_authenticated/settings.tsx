import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES, type LangCode } from "@/lib/languages";
import { toast } from "sonner";
import { NotificationSettings } from "@/components/NotificationSettings";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TraumaGuard AI" },
      { name: "description", content: "Manage your profile and language preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");

  useEffect(() => {
    (async () => {
      // 1. Try local storage first for instant load
      try {
        const local = localStorage.getItem("traumaguard_profile");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.full_name) setFullName(parsed.full_name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.gender) setGender(parsed.gender);
        }
      } catch {}

      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      // 2. Load from auth metadata
      const meta = u.user.user_metadata || {};
      if (meta.full_name && !fullName) setFullName(meta.full_name);
      if (meta.phone && !phone) setPhone(meta.phone);
      if (meta.gender && !gender) setGender(meta.gender);
      if (meta.language) setLang(meta.language as LangCode);

      // 3. Try to load from Supabase profiles table
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.user.id)
          .maybeSingle();
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
          if (data.gender) setGender(data.gender);
          if (data.language) setLang(data.language as LangCode);
        }
      } catch {}
    })();
  }, []);

  async function save() {
    const profileData = { full_name: fullName, phone, gender, language: lang };

    // 1. Save to localStorage immediately
    try {
      localStorage.setItem("traumaguard_profile", JSON.stringify(profileData));
    } catch {}

    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      // 2. Always update user metadata in Supabase Auth (always works!)
      try {
        await supabase.auth.updateUser({
          data: profileData,
        });
      } catch {}

      // 3. Try to upsert in profiles table
      try {
        await supabase
          .from("profiles")
          .upsert({ id: u.user.id, ...profileData });
      } catch (e) {
        console.warn("Could not sync to profiles table", e);
      }
    }

    toast.success("Profile saved successfully!");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-display font-bold tracking-tight">{t("settings.title")}</h1>
      </div>
      <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">{t("settings.profile")}</h2>
        <Field label={t("auth.fullName")}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
        </Field>
        <Field label={t("auth.phone")}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </Field>
        <Field label={t("auth.gender")}>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
            <option value="male">{t("auth.male")}</option>
            <option value="female">{t("auth.female")}</option>
            <option value="other">{t("auth.other")}</option>
          </select>
        </Field>
      </div>
      <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold">{t("settings.language")}</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code as LangCode)}
              className={`px-3 py-1.5 rounded-md border text-sm ${l.fontClass ?? ""} ${lang === l.code ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-accent"}`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={save}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
      >
        {t("settings.save")}
      </button>

      <div className="border-b border-border pb-2 pt-4">
        <h2 className="text-xl font-display font-bold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Control emergency alerts, reminders and how you're contacted.
        </p>
      </div>
      <NotificationSettings />

      <style>{`.input { width: 100%; padding: 0.5rem 0.75rem; background: var(--background); border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; outline: none; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      {children}
    </label>
  );
}
