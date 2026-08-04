import { createFileRoute, useNavigate, useParams, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { fontClassFor } from "@/lib/languages";
import { toast } from "sonner";
import {
  Send,
  Mic,
  Plus,
  MessageSquare,
  Loader2,
  MicOff,
  Sparkles,
  Volume2,
  Square,
  History,
  X,
  HeartPulse,
  Wind,
  Moon,
  ShieldAlert,
  Stethoscope,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useSpeech } from "@/lib/speech";

const SUGGESTED_QUERIES = [
  {
    id: "calm",
    icon: Wind,
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40",
    title: "Grounding & Calm",
    badge: "5-4-3-2-1",
    description: "Guide me through a calming breathing or grounding exercise.",
    prompt: "Can you guide me through a 5-4-3-2-1 grounding exercise to calm my anxiety and distress?",
  },
  {
    id: "panic",
    icon: HeartPulse,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40",
    title: "Panic & Overwhelm",
    badge: "Immediate Coping",
    description: "I feel overwhelmed, restless, or panicked right now.",
    prompt: "I am feeling extremely overwhelmed and anxious right now. What immediate steps can I take to feel safe?",
  },
  {
    id: "sleep",
    icon: Moon,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40",
    title: "Sleep & Nightmares",
    badge: "Night Routine",
    description: "Trouble sleeping or having disturbing dreams after trauma.",
    prompt: "I have difficulty falling asleep and disturbing thoughts keep me awake. How can I manage this?",
  },
  {
    id: "flashbacks",
    icon: ShieldAlert,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
    title: "Trauma Triggers",
    badge: "Flashback Care",
    description: "Coping with sudden intrusive memories or emotional triggers.",
    prompt: "I am experiencing sudden emotional triggers and flashbacks from past trauma. How can I feel safe in this moment?",
  },
  {
    id: "doctor",
    icon: Stethoscope,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
    title: "Consulting a Doctor",
    badge: "Professional Care",
    description: "When should I see a mental health professional or counselor?",
    prompt: "What symptoms indicate that I should consult a doctor, psychiatrist, or counselor for trauma?",
  },
  {
    id: "other",
    icon: HelpCircle,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
    title: "Other / Custom Concern",
    badge: "Any Topic",
    description: "Ask anything else or share whatever is currently on your mind.",
    prompt: "",
    isCustom: true,
  },
];

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Chat — TraumaGuard AI" },
      { name: "description", content: "Threaded AI support conversation in your language." },
    ],
  }),
  component: ChatPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };

function ChatPage() {
  const { threadId } = useParams({ from: "/_authenticated/chat/$threadId" });
  const nav = useNavigate();
  const qc = useQueryClient();
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);
  const voiceTurnRef = useRef(false);
  const { speak, stop, speakingId } = useSpeech(lang);

  const { data: threads } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_threads")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      return (data ?? []) as Msg[];
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function newThread() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: u.user.id, title: "New session", language: lang })
      .select()
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["threads"] });
    nav({ to: "/chat/$threadId", params: { threadId: data.id } });
  }

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    const spokenTurn = voiceTurnRef.current;
    voiceTurnRef.current = false;
    setInput("");
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSending(false);
      return;
    }

    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    qc.setQueryData<Msg[]>(["messages", threadId], (prev = []) => [...prev, userMsg]);

    try {
      await supabase
        .from("chat_messages")
        .insert({ thread_id: threadId, user_id: u.user.id, role: "user", content: text });
    } catch (e) {
      console.warn("Could not sync message to Supabase", e);
    }

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const r = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language: lang }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "AI failed" }));
        if (r.status === 429) toast.error("Rate limited — please wait a moment.");
        else if (r.status === 402) toast.error("AI credits exhausted. Please add credits.");
        else toast.error(err.error ?? "AI failed");
        return;
      }
      const { text: reply } = (await r.json()) as { text: string };
      const assistantMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<Msg[]>(["messages", threadId], (prev = []) => [...prev, assistantMsg]);

      try {
        await supabase
          .from("chat_messages")
          .insert({ thread_id: threadId, user_id: u.user.id, role: "assistant", content: reply });
        await supabase
          .from("chat_threads")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", threadId);

        // Log a mood entry approximated from severity for the dashboard trend.
        const sev = /Severity:\s*HIGH/i.test(reply)
          ? 85
          : /Severity:\s*MODERATE/i.test(reply)
            ? 55
            : 25;
        await supabase.from("mood_logs").insert({ user_id: u.user.id, risk_score: sev }).select();
      } catch (e) {
        console.warn("Could not sync assistant reply to Supabase", e);
      }

      // Voice turn (or voice mode) → answer out loud instead of text only.
      if (spokenTurn || voiceMode) void speak(reply, "latest");
    } finally {
      setSending(false);
    }
  }

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input is not supported in this browser.");
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    stop();
    const r = new SR();
    r.lang = lang === "en" ? "en-IN" : `${lang}-IN`;
    r.interimResults = true;
    r.continuous = false;
    let finalText = "";
    r.onresult = (e: any) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      finalText = s;
      setInput(s);
    };
    r.onend = () => {
      setListening(false);
      // Voice in → voice out: send automatically and speak the reply.
      if (finalText.trim()) {
        voiceTurnRef.current = true;
        void send(finalText);
      }
    };
    r.onerror = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  }

  const fc = fontClassFor(lang);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSelectQuery(q: (typeof SUGGESTED_QUERIES)[0]) {
    if (q.isCustom) {
      inputRef.current?.focus();
      return;
    }
    void send(q.prompt);
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-6rem)]">
      {/* Threads */}
      <aside className="hidden lg:flex flex-col bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-3">
        <button
          onClick={newThread}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-sm"
        >
          <Plus className="size-4" /> {t("chat.new")}
        </button>
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-4 px-2">
          {t("chat.threads")}
        </div>
        <div className="flex-1 overflow-y-auto mt-1 space-y-0.5">
          {threads?.map((th) => (
            <button
              key={th.id}
              onClick={() => nav({ to: "/chat/$threadId", params: { threadId: th.id } })}
              className={`w-full text-left px-3 py-2 rounded-md text-sm truncate flex items-center gap-2 ${
                th.id === threadId
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <MessageSquare className="size-3.5 shrink-0" />
              <span className="truncate">{th.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex flex-col bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl min-h-0">
        {/* Mobile toolbar */}
        <div className="lg:hidden flex items-center gap-2 border-b border-border p-2">
          <button
            onClick={() => setShowThreads(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold"
          >
            <History className="size-4" /> {t("chat.threads")}
          </button>
          <button
            onClick={newThread}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus className="size-4" /> {t("chat.new")}
          </button>
          <button
            onClick={() => {
              setVoiceMode((v) => !v);
              stop();
            }}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${voiceMode ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}
          >
            <Volume2 className="size-4" /> Voice reply
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="py-6 max-w-2xl mx-auto space-y-6 animate-fade-up">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1 ring-1 ring-primary/20 shadow-sm">
                  <Sparkles className="size-7" />
                </div>
                <h3 className="font-display font-bold text-2xl tracking-tight">
                  {t("chat.empty")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  TraumaGuard provides supportive, confidential guidance. Choose a quick topic below or ask your own question:
                </p>
              </div>

              {/* Suggested Query Cards */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {SUGGESTED_QUERIES.map((q) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuery(q)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between ${q.color} bg-card`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-lg bg-background/80 ring-1 ring-black/5 dark:ring-white/10 shrink-0">
                            <Icon className="size-4" />
                          </span>
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {q.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-background/80 text-muted-foreground border border-border/50 shrink-0">
                          {q.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {q.description}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{q.isCustom ? "Write custom message" : "Start session"}</span>
                        <ChevronRight className="size-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${fc} ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                    : "bg-accent text-accent-foreground rounded-bl-sm"
                }`}
              >
                {m.content}
                <SeverityBadge text={m.content} role={m.role} />
                {m.role === "assistant" && (
                  <button
                    onClick={() => (speakingId === m.id ? stop() : speak(m.content, m.id))}
                    className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:opacity-80"
                  >
                    {speakingId === m.id ? (
                      <Square className="size-3.5" />
                    ) : (
                      <Volume2 className="size-3.5" />
                    )}
                    {speakingId === m.id ? "Stop" : "Listen"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-accent rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> TraumaGuard is thinking…
              </div>
            </div>
          )}
        </div>

        {/* Quick Queries Horizontal Chips (Accessible always) */}
        <div className="px-3 pt-2 border-t border-border/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground shrink-0 pl-1">
            Quick:
          </span>
          {SUGGESTED_QUERIES.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                onClick={() => handleSelectQuery(q)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
              >
                <Icon className="size-3" />
                <span>{q.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Input bar */}
        <div className="p-3 md:p-4">
          <div className="flex items-end gap-2">
            <button
              onClick={toggleVoice}
              className={`shrink-0 size-11 rounded-xl grid place-items-center transition-colors ${listening ? "bg-emergency text-emergency-foreground animate-pulse-red" : "bg-accent text-accent-foreground hover:bg-primary/10"}`}
            >
              {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={listening ? "Listening… speak now" : t("chat.placeholder")}
              rows={1}
              className={`flex-1 resize-none px-4 py-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 ${fc}`}
            />
            <button
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              className="shrink-0 size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 shadow-sm"
            >
              <Send className="size-5" />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {listening
              ? "Recording — the reply will be spoken aloud."
              : "Tap a quick query above or type your thoughts freely."}
          </p>
        </div>
      </div>

      {/* Mobile previous-sessions panel */}
      {showThreads && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowThreads(false)} />
          <div className="relative bg-card w-72 max-w-[85%] h-full p-3 flex flex-col animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {t("chat.threads")}
              </div>
              <button
                onClick={() => setShowThreads(false)}
                className="p-1 rounded-md hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setShowThreads(false);
                newThread();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus className="size-4" /> {t("chat.new")}
            </button>
            <div className="flex-1 overflow-y-auto mt-3 space-y-0.5">
              {threads?.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    setShowThreads(false);
                    nav({ to: "/chat/$threadId", params: { threadId: th.id } });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                    th.id === threadId
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <MessageSquare className="size-3.5 shrink-0" />
                  <span className="truncate">{th.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeverityBadge({ text, role }: { text: string; role: string }) {
  if (role !== "assistant") return null;
  const m = /Severity:\s*(LOW|MODERATE|HIGH)/i.exec(text);
  if (!m) return null;
  const level = m[1].toUpperCase();
  const color =
    level === "HIGH"
      ? "bg-emergency text-emergency-foreground"
      : level === "MODERATE"
        ? "bg-warning/20 text-warning"
        : "bg-success/20 text-success";
  return (
    <div
      className={`mt-3 inline-flex text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded ${color}`}
    >
      {level} SEVERITY
    </div>
  );
}
