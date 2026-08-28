import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/chat" });
  },
  component: () => null,
});

function DashboardPage() {
  const { t } = useI18n();

  const { data: moods } = useQuery({
    queryKey: ["moodLogs"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/mood/logs");
        if (res.ok) {
          const json = await res.json();
          if (json.logs && json.logs.length > 0) {
            return [...json.logs].reverse();
          }
        }
      } catch {}
      try {
        const { data, error } = await supabase
          .from("mood_logs")
          .select("*")
          .order("logged_at", { ascending: true })
          .limit(30);
        if (!error && data && data.length > 0) return data;
      } catch {}
      try {
        const local = localStorage.getItem("traumaguard_mood_logs");
        if (local) return JSON.parse(local).reverse();
      } catch {}
      return [];
    },
  });

  const { data: lastThread } = useQuery({
    queryKey: ["lastThread"],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_threads")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Real mood trend data based exclusively on user check-ins
  const trendData = (moods || []).map((m: any) => ({
    t: new Date(m.logged_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    risk: Number(m.risk_score),
  }));

  const latest = trendData.length > 0 ? trendData[trendData.length - 1].risk : 0;
  const first = trendData[0]?.risk ?? 0;
  const delta = latest - first;
  const improving = delta < 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{t("nav.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("dash.protocolActive")} •{" "}
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} IST
          </p>
        </div>
        <div className="hidden md:flex gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" /> Risk Trend
          </span>
          <span className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-emergency" /> Critical
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                {t("dash.risk")}
              </span>
              <div className="text-3xl font-display font-bold mt-1">
                {latest.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ 100</span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${improving ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950" : "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950"}`}
            >
              <TrendingUp className={`size-3 ${improving ? "" : "rotate-180"}`} />{" "}
              {improving ? t("dash.improving") : "Watch"}
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <QuickCard
            icon={<MessageSquare className="size-4" />}
            label={t("dash.recentSession")}
            value={lastThread ? new Date(lastThread.updated_at).toLocaleString() : "None yet"}
            to="/chat"
          />
          <QuickCard
            icon={<Activity className="size-4" />}
            label={t("dash.logMood")}
            value="Track today"
            to="/records"
          />
          <Link
            to="/reports"
            className="block bg-primary text-primary-foreground rounded-2xl p-5 hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="size-4" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                Clinical Reports
              </span>
            </div>
            <div className="font-display font-bold">Generate Medical PDF</div>
            <div className="text-xs opacity-80">Export patient progress summary</div>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ActionTile
          to="/chat"
          icon={<MessageSquare className="size-5" />}
          title={t("dash.startChat")}
          sub="Text or voice, in your language"
        />
        <ActionTile
          to="/chat"
          icon={<Mic className="size-5" />}
          title={t("chat.voice")}
          sub="Speak — we transcribe & respond"
        />
        <ActionTile
          to="/doctors"
          icon={<Stethoscope className="size-5" />}
          title={t("dash.viewDoctors")}
          sub="Connect with trauma specialists"
        />
      </div>
    </div>
  );
}

function QuickCard({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="block bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-5 hover:ring-primary/30 transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div className="text-sm font-semibold truncate">{value}</div>
        </div>
      </div>
    </Link>
  );
}

function ActionTile({
  to,
  icon,
  title,
  sub,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-5 hover:ring-primary/30 flex items-start gap-4 transition-shadow"
    >
      <div className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </Link>
  );
}
