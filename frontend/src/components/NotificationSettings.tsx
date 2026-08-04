import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Siren, BellRing, Clock, Send, Loader2 } from "lucide-react";

type Prefs = {
  emergency_alerts: boolean;
  crisis_escalation: boolean;
  emergency_contact_phone: string;
  daily_checkin: boolean;
  daily_checkin_time: string;
  weekly_report: boolean;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  channel_in_app: boolean;
  channel_email: boolean;
  channel_sms: boolean;
};

const DEFAULTS: Prefs = {
  emergency_alerts: true,
  crisis_escalation: true,
  emergency_contact_phone: "",
  daily_checkin: true,
  daily_checkin_time: "09:00",
  weekly_report: true,
  appointment_reminders: true,
  medication_reminders: false,
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
  channel_in_app: true,
  channel_email: true,
  channel_sms: false,
};

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      // 1. Try local storage first
      try {
        const local = localStorage.getItem("traumaguard_notif_prefs");
        if (local) {
          setPrefs(JSON.parse(local));
        }
      } catch {}

      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setLoading(false);
      try {
        const { data } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", u.user.id)
          .maybeSingle();
        if (data) {
          setPrefs({
            ...DEFAULTS,
            ...data,
            emergency_contact_phone: data.emergency_contact_phone ?? "",
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setSaving(true);

    // 1. Save to local storage
    try {
      localStorage.setItem("traumaguard_notif_prefs", JSON.stringify(prefs));
    } catch {}

    // 2. Try to sync to Supabase
    try {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await supabase
          .from("notification_preferences")
          .upsert({ user_id: u.user.id, ...prefs }, { onConflict: "user_id" });
      }
    } catch (e) {
      console.warn("Could not sync notif prefs to Supabase", e);
    }
    
    setSaving(false);
    toast.success("Notification preferences saved successfully!");
  }

  if (loading) {
    return (
      <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading notification settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section icon={<Siren className="size-4 text-destructive" />} title="Emergency alerts">
        <Toggle
          label="Emergency SOS alerts"
          hint="Notify me and my contact whenever an SOS is triggered"
          checked={prefs.emergency_alerts}
          onChange={(v) => set("emergency_alerts", v)}
        />
        <Toggle
          label="High-risk crisis escalation"
          hint="Alert me when the AI detects severe or high-risk symptoms"
          checked={prefs.crisis_escalation}
          onChange={(v) => set("crisis_escalation", v)}
        />
        <Field label="Emergency contact phone">
          <input
            value={prefs.emergency_contact_phone}
            onChange={(e) => set("emergency_contact_phone", e.target.value)}
            placeholder="+91 00000-00000"
            className="ns-input"
          />
        </Field>
      </Section>

      <Section icon={<BellRing className="size-4 text-primary" />} title="Reminders">
        <Toggle
          label="Daily check-in reminder"
          hint="A gentle nudge to log how you're feeling"
          checked={prefs.daily_checkin}
          onChange={(v) => set("daily_checkin", v)}
        />
        {prefs.daily_checkin && (
          <Field label="Check-in time">
            <input
              type="time"
              value={prefs.daily_checkin_time}
              onChange={(e) => set("daily_checkin_time", e.target.value)}
              className="ns-input"
            />
          </Field>
        )}
        <Toggle
          label="Weekly progress report"
          hint="A summary of your risk trend every week"
          checked={prefs.weekly_report}
          onChange={(v) => set("weekly_report", v)}
        />
        <Toggle
          label="Appointment reminders"
          hint="Reminders before doctor consultations"
          checked={prefs.appointment_reminders}
          onChange={(v) => set("appointment_reminders", v)}
        />
        <Toggle
          label="Medication reminders"
          checked={prefs.medication_reminders}
          onChange={(v) => set("medication_reminders", v)}
        />
      </Section>

      <Section icon={<Clock className="size-4 text-primary" />} title="Quiet hours">
        <Toggle
          label="Pause non-urgent notifications"
          hint="Emergency alerts are always delivered"
          checked={prefs.quiet_hours_enabled}
          onChange={(v) => set("quiet_hours_enabled", v)}
        />
        {prefs.quiet_hours_enabled && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <input
                type="time"
                value={prefs.quiet_hours_start}
                onChange={(e) => set("quiet_hours_start", e.target.value)}
                className="ns-input"
              />
            </Field>
            <Field label="To">
              <input
                type="time"
                value={prefs.quiet_hours_end}
                onChange={(e) => set("quiet_hours_end", e.target.value)}
                className="ns-input"
              />
            </Field>
          </div>
        )}
      </Section>

      <Section icon={<Send className="size-4 text-primary" />} title="Delivery channels">
        <Toggle
          label="In-app notifications"
          checked={prefs.channel_in_app}
          onChange={(v) => set("channel_in_app", v)}
        />
        <Toggle
          label="Email"
          checked={prefs.channel_email}
          onChange={(v) => set("channel_email", v)}
        />
        <Toggle label="SMS" checked={prefs.channel_sms} onChange={(v) => set("channel_sms", v)} />
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
      >
        {saving && <Loader2 className="size-4 animate-spin" />}
        Save notification preferences
      </button>

      <style>{`.ns-input { width: 100%; padding: 0.5rem 0.75rem; background: var(--background); border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; outline: none; }`}</style>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="space-y-4">{children}</div>
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
