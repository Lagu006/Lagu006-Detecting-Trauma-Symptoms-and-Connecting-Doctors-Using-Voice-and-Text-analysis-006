import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Activity,
  Heart,
  Brain,
  ShieldAlert,
  Zap,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Trash2,
  Share2,
  Wind,
  Smile,
  AlertTriangle,
  Flame,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/records")({
  head: () => ({
    meta: [
      { title: "Clinical Journal & Check-Ins — TraumaGuard AI" },
      { name: "description", content: "Interactive somatic check-in and trauma stability journal." },
    ],
  }),
  component: RecordsPage,
});

// Preset Trauma Triggers
const TRIGGER_OPTIONS = [
  { id: "flashback", label: "Sensory Flashback", icon: "⚡" },
  { id: "noise", label: "Loud / Sudden Noise", icon: "🔊" },
  { id: "crowd", label: "Crowded Space", icon: "👥" },
  { id: "sleep", label: "Nightmare / Insomnia", icon: "🌙" },
  { id: "pain", label: "Physical Tension / Pain", icon: "🤕" },
  { id: "social", label: "Interpersonal Stress", icon: "💔" },
  { id: "work", label: "Cognitive Overwhelm", icon: "💼" },
];

// Preset Somatic Symptoms
const SYMPTOM_OPTIONS = [
  { id: "heart", label: "Rapid Pulse / Palpitations" },
  { id: "breath", label: "Shallow Breathing / Chest Tightness" },
  { id: "tremor", label: "Shaking / Muscle Tremors" },
  { id: "numb", label: "Dissociation / Emotional Numbing" },
  { id: "headache", label: "Migraine / Cranial Pressure" },
  { id: "nausea", label: "Stomach Clenching / Nausea" },
];

// Preset Coping Mechanisms
const COPING_OPTIONS = [
  { id: "breathing", label: "Box Breathing (4-4-4)", icon: "🌬️" },
  { id: "grounding", label: "5-4-3-2-1 Sensory Grounding", icon: "🧘" },
  { id: "walk", label: "Cold Water / Sensory Reset", icon: "🧊" },
  { id: "contact", label: "Contacted Care Circle", icon: "📞" },
  { id: "therapy", label: "Trauma Specialist Session", icon: "🩺" },
  { id: "rest", label: "Safe Space & Quiet Rest", icon: "🛡️" },
];

// Clinical Distress Zones
function getDistressZone(score: number) {
  if (score <= 20) {
    return {
      title: "Grounded & Regulated",
      subtitle: "Ventral Vagal (Safe & Social)",
      color: "emerald",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accent: "#10b981",
      icon: Smile,
      recommendation: "Your nervous system is well-regulated. Continue current grounding habits.",
    };
  }
  if (score <= 40) {
    return {
      title: "Mild Nervous Activation",
      subtitle: "Low-grade Alertness",
      color: "amber",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accent: "#f59e0b",
      icon: Activity,
      recommendation: "Minor sympathetic arousal. Try 2 minutes of relaxed diaphragm breathing.",
    };
  }
  if (score <= 65) {
    return {
      title: "Elevated Distress",
      subtitle: "Sympathetic Fight/Flight",
      color: "orange",
      badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      accent: "#f97316",
      icon: AlertTriangle,
      recommendation: "Heightened distress detected. Implement sensory grounding (5 things you can see, 4 you can touch).",
    };
  }
  if (score <= 85) {
    return {
      title: "Severe Panic / Triggered",
      subtitle: "Acute Hyperarousal",
      color: "rose",
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      accent: "#f43f5e",
      icon: Flame,
      recommendation: "High sympathetic crisis. Please pause in a quiet space, use cold water grounding, or open AI Crisis Support.",
    };
  }
  return {
    title: "Acute Trauma Shock / Dissociation",
    subtitle: "Dorsal Vagal Freeze / Emergency",
    color: "red",
    badgeClass: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 animate-pulse",
    accent: "#ef4444",
    icon: ShieldAlert,
    recommendation: "Critical distress level. Consider activating the 24/7 SOS protocol or reaching out to a certified trauma specialist.",
  };
}

function getLocalLogs() {
  try {
    const raw = localStorage.getItem("traumaguard_mood_logs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(logs: any[]) {
  try {
    localStorage.setItem("traumaguard_mood_logs", JSON.stringify(logs.slice(0, 100)));
  } catch {}
}

function RecordsPage() {
  const qc = useQueryClient();
  const [score, setScore] = useState(30);
  const [note, setNote] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const zone = getDistressZone(score);

  const { data: logs = [] } = useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      try {
<<<<<<< HEAD
        const res = await fetch("/api/mood/logs");
=======
        const res = await fetch("http://localhost:8000/api/mood/logs");
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        if (res.ok) {
          const json = await res.json();
          if (json.logs && json.logs.length > 0) {
            saveLocalLogs(json.logs);
            return json.logs;
          }
        }
      } catch {}
      try {
        const { data, error } = await supabase
          .from("mood_logs")
          .select("*")
          .order("logged_at", { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          saveLocalLogs(data);
          return data;
        }
      } catch {}
      return getLocalLogs();
    },
  });

  const toggleTrigger = (id: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleCoping = (id: string) => {
    setSelectedCoping((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  async function submit() {
    setIsSubmitting(true);

    // Assemble rich clinical payload
    const triggersText = selectedTriggers.map(t => TRIGGER_OPTIONS.find(o => o.id === t)?.label || t).join(", ");
    const symptomsText = selectedSymptoms.map(s => SYMPTOM_OPTIONS.find(o => o.id === s)?.label || s).join(", ");
    const copingText = selectedCoping.map(c => COPING_OPTIONS.find(o => o.id === c)?.label || c).join(", ");

    let formattedNote = note.trim();
    const metadataParts = [];
    if (triggersText) metadataParts.push(`Triggers: [${triggersText}]`);
    if (symptomsText) metadataParts.push(`Symptoms: [${symptomsText}]`);
    if (copingText) metadataParts.push(`Coping: [${copingText}]`);
    
    if (metadataParts.length > 0) {
      formattedNote = formattedNote ? `${formattedNote} | ${metadataParts.join(" • ")}` : metadataParts.join(" • ");
    }

    const newEntry = {
      id: crypto.randomUUID(),
      risk_score: score,
      mood: zone.title,
      note: formattedNote,
      logged_at: new Date().toISOString(),
    };

    // 1. Optimistic Local Save
    const existing = getLocalLogs();
    const updated = [newEntry, ...existing];
    saveLocalLogs(updated);
    qc.setQueryData(["records"], updated);
    qc.setQueryData(["moodLogs"], updated);
    qc.setQueryData(["reportLogs"], updated);

    toast.success(`Check-in recorded: ${zone.title} (${score}/100)`);
    
    // Reset Form
    setNote("");
    setSelectedTriggers([]);
    setSelectedSymptoms([]);
    setSelectedCoping([]);
    setIsSubmitting(false);

    // 2. Save to PostgreSQL Backend
    try {
<<<<<<< HEAD
      await fetch("/api/mood/logs", {
=======
      await fetch("http://localhost:8000/api/mood/logs", {
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          risk_score: score,
          mood: zone.title,
          note: newEntry.note,
        }),
      });
      qc.invalidateQueries({ queryKey: ["records"] });
      qc.invalidateQueries({ queryKey: ["reportLogs"] });
      qc.invalidateQueries({ queryKey: ["moodLogs"] });
    } catch (e) {
      console.warn("Could not sync mood log to backend", e);
    }

    // 3. Supabase fallback
    try {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await supabase
          .from("mood_logs")
          .insert({ user_id: u.user.id, risk_score: score, note: newEntry.note });
      }
    } catch {}
  }

  const handleDelete = (id: string | number) => {
    const updated = logs.filter((l: any) => l.id !== id);
    saveLocalLogs(updated);
    qc.setQueryData(["records"], updated);
    qc.setQueryData(["moodLogs"], updated);
    qc.setQueryData(["reportLogs"], updated);
    toast.info("Record removed from history.");
  };

  // Filter and search
  const filteredLogs = useMemo(() => {
    return logs.filter((l: any) => {
      const s = Number(l.risk_score) || 0;
      if (severityFilter === "calm" && s > 40) return false;
      if (severityFilter === "moderate" && (s <= 40 || s > 70)) return false;
      if (severityFilter === "high" && s <= 70) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${l.note || ""} ${l.mood || ""} ${l.risk_score}`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });
  }, [logs, severityFilter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <Brain className="size-3.5" />
            <span>Somatic Stability & Clinical Check-in</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Clinical Records</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quantify nervous system regulation, document triggers, and review real-time trauma recovery trajectory.
          </p>
        </div>

        {/* Quick Grounding Button */}
        <button
          onClick={() => setShowBreathingGuide(!showBreathingGuide)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showBreathingGuide
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card hover:bg-muted border-border text-foreground"
          }`}
        >
          <Wind className="size-4 animate-pulse" />
          <span>{showBreathingGuide ? "Hide Breathing Guide" : "Interactive Box Breathing"}</span>
        </button>
      </div>

      {/* Interactive Box Breathing Visualizer Banner */}
      {showBreathingGuide && (
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
              <Wind className="size-5 text-primary" />
              <span>4-4-4-4 Box Breathing Somatic Reset</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Inhale 4s • Hold 4s • Exhale 4s • Hold 4s to trigger parasympathetic vagal stimulation.
            </p>
            <div className="size-28 mx-auto rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
              <span className="font-mono text-sm font-bold text-primary">Breathe</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Check-In Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
        {/* 1. Dynamic Distress Gauge */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Clinical Scale</span>
              <h2 className="text-lg font-bold text-foreground">Distress & Hyperarousal Level</h2>
            </div>
            
            {/* Live Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${zone.badgeClass}`}>
              <zone.icon className="size-4" />
              <span>{zone.title}</span>
              <span className="font-mono font-bold ml-1">{score}/100</span>
            </div>
          </div>

          {/* Slider with Gradient Visualizer */}
          <div className="space-y-2 pt-2">
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #f59e0b 35%, #f97316 65%, #ef4444 100%)`,
              }}
            />
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground px-1">
              <span>0 (Grounded)</span>
              <span>25 (Mild)</span>
              <span>50 (Distressed)</span>
              <span>75 (Panic)</span>
              <span>100 (Crisis)</span>
            </div>
          </div>

          {/* AI Micro-Recommendation based on slider */}
          <div className="bg-secondary/40 border border-border/50 rounded-xl p-3.5 flex items-start gap-3 text-xs">
            <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">AI Clinical Note: </span>
              <span className="text-muted-foreground">{zone.recommendation}</span>
            </div>
          </div>
        </div>

        {/* 2. Interactive Trigger Chips */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <span>Identified Triggers</span>
            </label>
            <span className="text-xs text-muted-foreground">Select all that apply</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_OPTIONS.map((trig) => {
              const isSelected = selectedTriggers.includes(trig.id);
              return (
                <button
                  key={trig.id}
                  type="button"
                  onClick={() => toggleTrigger(trig.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs scale-105"
                      : "bg-secondary/50 hover:bg-secondary border-border/60 text-muted-foreground"
                  }`}
                >
                  <span>{trig.icon}</span>
                  <span>{trig.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Somatic Physical Symptoms */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Heart className="size-4 text-rose-500" />
              <span>Somatic Physical Sensations</span>
            </label>
            <span className="text-xs text-muted-foreground">Body manifestations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.id);
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => toggleSymptom(sym.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-xs scale-105"
                      : "bg-secondary/50 hover:bg-secondary border-border/60 text-muted-foreground"
                  }`}
                >
                  <span>•</span>
                  <span>{sym.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Coping Applied */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Stabilization & Coping Applied</span>
            </label>
            <span className="text-xs text-muted-foreground">What brought grounding?</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COPING_OPTIONS.map((cop) => {
              const isSelected = selectedCoping.includes(cop.id);
              return (
                <button
                  key={cop.id}
                  type="button"
                  onClick={() => toggleCoping(cop.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs scale-105"
                      : "bg-secondary/50 hover:bg-secondary border-border/60 text-muted-foreground"
                  }`}
                >
                  <span>{cop.icon}</span>
                  <span>{cop.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Qualitative Journaling Note */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <label className="text-sm font-semibold text-foreground flex items-center justify-between">
            <span>Qualitative Clinical Reflection</span>
            <span className="text-xs font-normal text-muted-foreground">Optional detailed notes</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe emotional context, environment, intrusive thoughts, or bodily reactions..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Synchronizes instantly with PostgreSQL clinical database.
          </span>
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            <span>{isSubmitting ? "Recording..." : "Save Clinical Check-in"}</span>
          </button>
        </div>
      </div>

      {/* History & Timeline Section */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              <span>Somatic Timeline History</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredLogs.length} verified check-in record{filteredLogs.length === 1 ? "" : "s"}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes / triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary w-44"
              />
            </div>

            {/* Severity Filter Pills */}
            <div className="inline-flex rounded-xl bg-secondary/50 p-1 border border-border">
              {["all", "calm", "moderate", "high"].map((f) => (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${
                    severityFilter === f
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "high" ? "Critical" : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center space-y-3">
            <div className="size-12 rounded-full bg-muted grid place-items-center mx-auto text-muted-foreground">
              <Activity className="size-6" />
            </div>
            <h3 className="font-semibold text-base">No Records Matching Filter</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {logs.length === 0
                ? "You have not recorded any somatic check-ins yet. Use the tool above to log your first entry for today."
                : "No check-ins match your search keywords or severity filter. Try adjusting your filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((l: any) => {
              const rawScore = Number(l.risk_score) || 0;
              const logZone = getDistressZone(rawScore);

              return (
                <div
                  key={l.id}
                  className="bg-card border border-border/70 hover:border-border rounded-2xl p-5 transition-all shadow-xs space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Score and Status */}
                    <div className="flex items-center gap-3">
                      <div
                        className="size-12 rounded-2xl grid place-items-center font-mono text-base font-bold shadow-xs shrink-0"
                        style={{
                          backgroundColor: `${logZone.accent}15`,
                          color: logZone.accent,
                          border: `1px solid ${logZone.accent}30`,
                        }}
                      >
                        {rawScore}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{l.mood || logZone.title}</span>
                          <span
                            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${logZone.accent}15`,
                              color: logZone.accent,
                            }}
                          >
                            {rawScore <= 20 ? "Optimal" : rawScore <= 60 ? "Elevated" : "High Alert"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Calendar className="size-3" />
                          <span>{new Date(l.logged_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(l.id)}
                        title="Delete entry"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes & Metadata Tags */}
                  {l.note && (
                    <div className="bg-secondary/30 rounded-xl p-3 text-xs text-foreground/90 border border-border/40 space-y-2">
                      <p className="leading-relaxed whitespace-pre-wrap">{l.note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

