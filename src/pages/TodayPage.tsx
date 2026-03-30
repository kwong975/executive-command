import { AppLayout } from "@/components/AppLayout";
import { decisions, agents, matters } from "@/data/mockData";
import { AlertTriangle, ArrowRight, UserPlus, Check, Play, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TodayPage() {
  const navigate = useNavigate();
  const blockedMatters = matters.filter(m => m.status === "blocked" || m.status === "at-risk");
  const errorAgents = agents.filter(a => a.status === "error");
  const failedCrons = agents.flatMap(a => a.cronJobs.filter(j => j.status === "failed").map(j => ({ agent: a.name, job: j })));

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 py-3 space-y-3">
          {/* Decisions */}
          <section>
            <SectionLabel>Needs Your Decision</SectionLabel>
            {decisions.map(d => {
              const agent = agents.find(a => a.id === d.agentId);
              return (
                <div
                  key={d.id}
                  className={`flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0 group ${
                    d.urgency === "critical" ? "border-l-2 border-l-destructive pl-2" : ""
                  }`}
                >
                  {d.urgency === "critical" && <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-px" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium">{d.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{d.context}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{agent?.name} · {d.source}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.suggestedAction && (
                      <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5" />{d.suggestedAction}
                      </button>
                    )}
                    {d.matterId && (
                      <button onClick={() => navigate("/matters")} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowRight className="h-2.5 w-2.5" />Open
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Execution Risk */}
          <section>
            <SectionLabel>Execution Risk Today</SectionLabel>
            {blockedMatters.map(m => (
              <div key={m.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0 group">
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${m.status === "blocked" ? "bg-destructive" : "bg-warning"}`} />
                  <span className="text-[11px]">{m.title}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">{m.owner}</span>
                  {m.overdueCount > 0 && (
                    <span className="text-[9px] px-1 py-px rounded bg-destructive/15 text-destructive">{m.overdueCount} overdue</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                    <UserPlus className="h-2.5 w-2.5" />
                  </button>
                  <button onClick={() => navigate("/matters")} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}
            {errorAgents.map(a => (
              <div key={a.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0 group">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span className="text-[11px]">{a.name} — {a.currentTask}</span>
                </div>
                <button onClick={() => navigate("/agents")} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {failedCrons.map((fc, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0 group">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                  <span className="text-[11px]">{fc.agent} · {fc.job.name} — failed</span>
                  <span className="text-[9px] text-muted-foreground">{fc.job.lastRun}</span>
                </div>
                <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Play className="h-2.5 w-2.5" />Rerun
                </button>
              </div>
            ))}
          </section>

          {/* Quick Status */}
          <section>
            <SectionLabel>Pulse</SectionLabel>
            <div className="flex gap-4 text-[10px]">
              <Stat label="Matters" value={`${matters.length} active`} />
              <Stat label="Agents" value={`${agents.filter(a => a.status !== "error").length}/${agents.length}`} sub={errorAgents.length > 0 ? `${errorAgents.length} error` : undefined} />
              <Stat label="Blocked" value={String(blockedMatters.filter(m => m.status === "blocked").length)} destructive />
              <Stat label="Overdue" value={String(matters.reduce((s, m) => s + m.overdueCount, 0))} destructive />
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{children}</div>;
}

function Stat({ label, value, sub, destructive }: { label: string; value: string; sub?: string; destructive?: boolean }) {
  return (
    <div>
      <span className="text-muted-foreground block">{label}</span>
      <span className={`font-semibold text-[11px] ${destructive ? "text-destructive" : ""}`}>{value}</span>
      {sub && <span className="text-destructive ml-1 text-[9px]">{sub}</span>}
    </div>
  );
}
