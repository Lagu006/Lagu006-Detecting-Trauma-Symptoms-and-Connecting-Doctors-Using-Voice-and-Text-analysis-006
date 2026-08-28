import { createFileRoute, useNavigate, useParams, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
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
  VolumeX,
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
  Trash2,
  Clock,
  Search,
  Calendar,
  FileText,
  Download,
  FolderArchive,
  ArrowUpRight,
  MessageCircle,
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
      { title: "AI Chat & Recent Sessions — TraumaGuard AI" },
      { name: "description", content: "Threaded AI support conversation and separate session history in your language." },
    ],
  }),
  component: ChatPage,
});

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Msg = { 
  id: string | number; 
  thread_id?: string;
  role: "user" | "assistant"; 
  content: string; 
  matched_condition?: string;
  severity?: string;
  created_at?: string;
};

type Thread = {
  id: string;
  user_id: string;
  title: string;
  message_count?: number;
  last_message?: string;
  created_at: string;
  updated_at: string;
};

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
  const [activeView, setActiveView] = useState<"chat" | "history">("chat");
  const [searchHistory, setSearchHistory] = useState("");
  const [selectedArchiveThreadId, setSelectedArchiveThreadId] = useState<string>(threadId);
  const [currentUserId, setCurrentUserId] = useState("usr_default");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);
  const voiceTurnRef = useRef(false);
  const { speak, stop, speakingId } = useSpeech(lang);

  // Sync current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  // Fetch all chat session threads for user
  const { data: threads = [] } = useQuery<Thread[]>({
    queryKey: ["threads", currentUserId],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/threads?user_id=${currentUserId}`);
        if (res.ok) {
          const json = await res.json();
          return json.threads || [];
        }
      } catch (err) {
        console.warn("Failed to fetch chat threads from API", err);
      }
      return [];
    },
  });

  // Fetch chronological messages for active session thread
  const { data: messages = [] } = useQuery<Msg[]>({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/threads/${threadId}/messages`);
        if (res.ok) {
          const json = await res.json();
          if (json.messages && json.messages.length > 0) return json.messages;
        }
      } catch (err) {
        console.warn("Failed to fetch thread messages from API", err);
      }
      
      // Fallback for demo threads if backend fails or doesn't have them
      if (threadId?.startsWith("th_demo_")) {
        return [
          {
            id: "m1",
            role: "assistant",
            content: `Hello there, I am here with you. Take a steady breath. How are you feeling right now?`,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "m2",
            role: "user",
            content: "I started feeling sudden chest tightness and intrusive thoughts about the incident.",
            created_at: new Date(Date.now() - 3500000).toISOString(),
          },
          {
            id: "m3",
            role: "assistant",
            content: "I hear you, and you are completely safe in this moment. Let's do a 4-second box breath together: Inhale gently for 4... Hold for 4... Exhale for 4.",
            created_at: new Date(Date.now() - 3400000).toISOString(),
          },
          {
            id: "m4",
            role: "user",
            content: "Doing the breath now. My shoulders feel a bit looser.",
            created_at: new Date(Date.now() - 3300000).toISOString(),
          },
          {
            id: "m5",
            role: "assistant",
            content: "Wonderful. Notice how your body responded to safety signals. You did great.",
            created_at: new Date(Date.now() - 3200000).toISOString(),
          },
        ];
      }
      
      return [];
    },
  });

  // Fetch messages for inspected archive thread
  const { data: archiveMessages = [] } = useQuery<Msg[]>({
    queryKey: ["messages", selectedArchiveThreadId],
    enabled: !!selectedArchiveThreadId && activeView === "history",
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/threads/${selectedArchiveThreadId}/messages`);
        if (res.ok) {
          const json = await res.json();
          return json.messages || [];
        }
      } catch (err) {
        console.warn("Failed to fetch archive messages", err);
      }
      return [];
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function newThread() {
    try {
      const res = await fetch(`${API_URL}/api/chat/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, title: "New session" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.thread?.id) {
          await qc.invalidateQueries({ queryKey: ["threads"] });
          setActiveView("chat");
          nav({ to: "/chat/$threadId", params: { threadId: data.thread.id } });
          toast.success("New chat session started");
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }
    const newId = `th_${Date.now()}`;
    setActiveView("chat");
    nav({ to: "/chat/$threadId", params: { threadId: newId } });
  }

  async function deleteThread(tId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/chat/threads/${tId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Session deleted");
        await qc.invalidateQueries({ queryKey: ["threads"] });
        if (tId === threadId) {
          const remaining = (threads || []).filter((t) => t.id !== tId);
          if (remaining.length > 0) {
            nav({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
          } else {
            newThread();
          }
        }
      }
    } catch (err) {
      toast.error("Could not delete session");
    }
  }

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    const spokenTurn = voiceTurnRef.current;
    voiceTurnRef.current = false;
    setInput("");
    setSending(true);

    const userMsg: Msg = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    qc.setQueryData<Msg[]>(["messages", threadId], (prev = []) => [...prev, userMsg]);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const r = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          user_id: currentUserId,
          messages: history,
          message: text,
          language: lang,
        }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "AI failed" }));
        if (r.status === 429) toast.error("Rate limited — please wait a moment.");
        else if (r.status === 402) toast.error("AI credits exhausted. Please add credits.");
        else toast.error(err.error ?? "AI failed");
        return;
      }

      const resData = await r.json();
      const reply = resData.text || resData.reply || "";

      const assistantMsg: Msg = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: reply,
        matched_condition: resData.matched_condition,
        severity: resData.severity,
        created_at: new Date().toISOString(),
      };

      qc.setQueryData<Msg[]>(["messages", threadId], (prev = []) => [...prev, assistantMsg]);
      qc.invalidateQueries({ queryKey: ["threads"] });

      // Voice turn → answer out loud instead of text only
      if (spokenTurn || voiceMode) void speak(reply, "latest");
    } catch (e: any) {
      toast.error(e.message || "Failed to reach AI service");
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

  // Filter threads based on search input
  const filteredThreads = useMemo(() => {
    if (!searchHistory.trim()) return threads;
    const q = searchHistory.toLowerCase();
    return threads.filter(
      (th) =>
        th.title?.toLowerCase().includes(q) ||
        th.last_message?.toLowerCase().includes(q) ||
        th.id?.toLowerCase().includes(q)
    );
  }, [threads, searchHistory]);

  function renderMessage(m: Msg) {
    const isUser = m.role === "user";
    return (
      <div
        key={m.id}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
              : "bg-accent text-accent-foreground rounded-bl-sm"
          }`}
        >
          {m.content}
          <SeverityBadge text={m.content} role={m.role} />
          {m.role === "assistant" && (
            <button
              onClick={() => (speakingId === m.id ? stop() : speak(m.content, m.id))}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:opacity-80 cursor-pointer"
            >
              {speakingId === m.id ? (
                <>
                  <VolumeX className="size-3.5" /> Stop voice
                </>
              ) : (
                <>
                  <Volume2 className="size-3.5" /> Listen voice
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)]">
        {/* Main Container */}
        <div className="flex flex-col h-full bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl border border-border/40 shadow-xs overflow-hidden">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between border-b border-border/60 p-2.5 px-4 bg-muted/20">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <MessageSquare className="size-4 text-primary" /> 
              Active Session
            </div>

            <div className="flex items-center gap-2">
              {/* New Session Button */}
              <button
                onClick={newThread}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="size-3.5" /> {t("chat.new")}
              </button>

              {/* Mobile History Drawer Button */}
              <button
                onClick={() => setShowThreads(true)}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold"
              >
                <History className="size-3.5" /> ({threads.length})
              </button>

              {/* Voice Reply Mode Toggle */}
              <button
                onClick={() => {
                  setVoiceMode((v) => !v);
                  stop();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  voiceMode ? "bg-primary text-primary-foreground shadow-xs" : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
              >
                <Volume2 className="size-3.5" /> Voice reply
              </button>
            </div>
          </div>

          {/* ACTIVE CHAT CONVERSATION */}
          <div className="flex-1 flex flex-col min-h-0">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.length === 0 && !sending && (
                <div className="py-6 max-w-2xl mx-auto space-y-6 animate-fade-up">
                  <div className="text-center p-8 mt-4 bg-card rounded-2xl border border-border/40 shadow-sm">
                    <p className="text-lg font-medium text-foreground">
                      Hello Sir/Madam, how can I help you today?
                    </p>
                  </div>
                </div>
              )}
              {messages.map((m) => renderMessage(m))}
              {sending && (
                <div className="flex justify-start opacity-0 animate-fade-in">
                  <div className="bg-accent text-accent-foreground rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span className="text-xs font-medium">Analyzing & responding...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Input Area */}
            <div className="p-4 bg-card border-t border-border/40 shrink-0">
              <div className="flex items-end gap-3 max-w-3xl mx-auto relative">
                <button
                  onClick={() => {
                    setVoiceMode(false);
                    toggleVoice();
                  }}
                  className={`shrink-0 p-3 rounded-full transition-all cursor-pointer mb-0.5 ${
                    listening
                      ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  disabled={sending}
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
                  placeholder={
                    listening ? "Listening to your voice..." : "Type your message here..."
                  }
                  disabled={sending || listening}
                  rows={1}
                  className={`flex-1 resize-none px-4 py-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 ${fc}`}
                />
                <button
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  className="shrink-0 size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 shadow-sm cursor-pointer"
                >
                  <Send className="size-5" />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                {listening
                  ? "Recording — the reply will be spoken aloud."
                  : "Tap a quick query above or type your thoughts freely."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile previous-sessions panel */}
      {showThreads && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowThreads(false)} />
          <div className="relative bg-card w-80 max-w-[85%] h-full p-4 flex flex-col animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <History className="size-4 text-primary" /> {t("chat.threads")} ({threads?.length || 0})
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
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold mb-3 cursor-pointer"
            >
              <Plus className="size-4" /> {t("chat.new")}
            </button>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {threads?.map((th) => {
                const isActive = th.id === threadId;
                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      setShowThreads(false);
                      nav({ to: "/chat/$threadId", params: { threadId: th.id } });
                    }}
                    className={`group relative w-full text-left p-2.5 rounded-xl text-sm flex items-start gap-2.5 border cursor-pointer ${
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                        : "border-transparent text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <MessageSquare className="size-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-semibold">{th.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {th.updated_at ? th.updated_at.split(" ")[0] : "Recent"}
                      </div>
                    </div>
                    <button
                      title="Delete session"
                      onClick={(e) => deleteThread(th.id, e)}
                      className="p-1 rounded-md text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );

  function renderSidebarThreadItem(th: Thread) {
    const isActive = th.id === threadId && activeView === "chat";
    return (
      <div
        key={th.id}
        onClick={() => {
          setActiveView("chat");
          nav({ to: "/chat/$threadId", params: { threadId: th.id } });
        }}
        className={`group relative w-full text-left p-2.5 rounded-xl text-sm flex items-start gap-2.5 transition-all cursor-pointer border ${
          isActive
            ? "bg-primary/10 border-primary/30 text-primary font-medium shadow-xs"
            : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <MessageSquare className={`size-3.5 shrink-0 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          <div className="truncate text-xs font-semibold leading-snug">
            {th.title || "Support Session"}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
            <Clock className="size-2.5 shrink-0" />
            <span className="truncate">
              {th.updated_at ? th.updated_at.split(" ")[0] : "Recent"}
            </span>
            {typeof th.message_count === "number" && th.message_count > 0 && (
              <span className="ml-auto text-[9px] px-1 rounded bg-muted">
                {th.message_count} msgs
              </span>
            )}
          </div>
        </div>
        <button
          title="Delete session"
          onClick={(e) => deleteThread(th.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-opacity"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    );
  }
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
