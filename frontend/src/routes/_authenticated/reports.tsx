import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { FileDown, Sparkles, TrendingDown, TrendingUp, Activity, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — TraumaGuard AI" },
      { name: "description", content: "Weekly and monthly stability reports." },
    ],
  }),
  component: ReportsPage,
});

interface InsightsData {
  trajectory: string;
  trajectory_description: string;
  avg_score: number;
  peak_score: number;
  total_entries: number;
  risk_level: string;
  identified_themes: string[];
  recommendation: string;
}

function ReportsPage() {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const { data: logs = [] } = useQuery({
    queryKey: ["reportLogs"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mood/logs");
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
          .order("logged_at", { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch {}
      try {
        const local = localStorage.getItem("traumaguard_mood_logs");
        if (local) return JSON.parse(local).reverse();
      } catch {}
      return [];
    },
  });

  // Fetch AI insights from Django backend
  useEffect(() => {
    (async () => {
      if (!logs || logs.length === 0) return;
      setLoadingInsights(true);
      try {
        const res = await fetch("http://localhost:8000/api/insights/analyze/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs }),
        });
        if (res.ok) {
          const data = await res.json();
          setInsights(data);
        }
      } catch (e) {
        console.warn("Could not load backend AI insights:", e);
      } finally {
        setLoadingInsights(false);
      }
    })();
  }, [logs]);

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      let patientName = "TraumaGuard Patient";
      let patientPhone = "Not provided";
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user?.user_metadata?.full_name) {
          patientName = u.user.user_metadata.full_name;
        }
        if (u?.user?.user_metadata?.phone) {
          patientPhone = u.user.user_metadata.phone;
        }
      } catch {}

      const res = await fetch("http://localhost:8000/api/reports/pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: patientName,
          patient_phone: patientPhone,
          logs: logs,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TraumaGuard_Clinical_Report_${patientName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("📄 Clinical PDF report downloaded successfully!");
    } catch (e: any) {
      toast.error("Failed to generate PDF report from backend.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const buckets: Record<string, { day: string; total: number; count: number }> = {};
  logs.forEach((l: any) => {
    const d = new Date(l.logged_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    buckets[d] ??= { day: d, total: 0, count: 0 };
    buckets[d].total += Number(l.risk_score);
    buckets[d].count += 1;
  });
  const data = Object.values(buckets)
    .map((b) => ({ day: b.day, avg: b.total / b.count }))
    .slice(-14);

  const avg = data.length ? data.reduce((s, d) => s + d.avg, 0) / data.length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Clinical Reports & Trends</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official stability metrics and clinician-ready summary export.
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPdf}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition active:scale-95 disabled:opacity-50"
        >
          {downloadingPdf ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="size-4" /> Download Doctor PDF
            </>
          )}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Avg. Distress" value={avg.toFixed(0)} unit="/100" />
        <Stat label="Total Check-ins" value={logs.length.toString()} unit="entries" />
        <Stat label="Days Tracked" value={data.length.toString()} unit="days" />
      </div>

      {/* AI Trend & Trajectory Insights from Backend */}
      {insights && (
        <div className="bg-card ring-1 ring-primary/20 rounded-2xl p-6 border-l-4 border-l-primary space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Sparkles className="size-5 text-primary" />
              AI Clinical Trajectory & Pattern Analysis
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                insights.trajectory === "improving"
                  ? "bg-success/15 text-success"
                  : insights.trajectory === "elevated"
                  ? "bg-emergency/15 text-emergency"
                  : "bg-primary/15 text-primary"
              }`}
            >
              Trajectory: {insights.trajectory}
            </span>
          </div>

          <p className="text-sm text-foreground/90 font-medium">
            {insights.trajectory_description}
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Identified Focus Areas:</span>
              <div className="flex flex-wrap gap-1.5">
                {insights.identified_themes.map((theme, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-background border border-border text-foreground font-medium">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="font-semibold text-primary block mb-1">Clinical Guidance:</span>
              <p className="text-muted-foreground leading-relaxed">{insights.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Average Chart */}
      <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Daily Distress Level Trend (14 Days)</h2>
        {data.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl text-muted-foreground">
            <Activity className="size-8 text-primary/60 mb-2" />
            <p className="font-medium text-foreground">No check-ins recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Log your distress check-ins on the Dashboard or Records tab to begin building your real-time recovery graph.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="avg" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-card ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-5">
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        {label}
      </div>
      <div className="mt-1 font-display font-bold text-3xl">
        {value}
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}

