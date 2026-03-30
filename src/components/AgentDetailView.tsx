import { useState } from "react";
import { type Agent, matters } from "@/data/mockData";
import {
  MessageSquare, Play, Pause, Check, AlertTriangle, X, Zap,
  ChevronRight, UserPlus, Archive, RefreshCw
} from "lucide-react";

type Tab = "overview" | "activity" | "skills" | "automation" | "work" | "logs";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "skills", label: "Skills" },
  { id: "automation", label: "Cron" },
  { id: "work", label: "Work" },
  { id: "logs", label: "Logs" },
];

const sDot = { active: "bg-success", idle: "bg-muted-foreground", error: "bg-destructive" };

export function AgentDetailView({ agent, onOpenChat }: { agent: Agent; onOpenChat: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [expSkill, setExpSkill] = useState<string | null>(null);
  const [expCron, setExpCron] = useState<string | null>(null);

  const owned = matters.filter(m => m.ownerAgentId === agent.id);
  const blocked = owned.filter(m => m.status === "blocked");
  const active = owned.filter(m => m.status !== "blocked" && m.status !== "stale");
  const staleOwned = owned.filter(m => m.status === "stale");

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="h-8 border-b px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold bg-secondary px-1.5 py-0.5 rounded">{agent.avatar}</span>
          <span className="text-[11px] font-semibold">{agent.name}</span>
          <span className="text-[10px] text-muted-foreground">{agent.role}</span>
          <div className={`h-1.5 w-1.5 rounded-full ${sDot[agent.status]}`} />
          {agent.failedLast24h > 0 && (
            <span className="text-[9px] px-1 py-px rounded bg-destructive/15 text-destructive">{agent.failedLast24h} failed/24h</span>
          )}
          {agent.stalledWork > 0 && (
            <span className="text-[9px] px-1 py-px rounded bg-warning/15 text-warning">{agent.stalledWork} stalled</span>
          )}
          {agent.status === "idle" && (
            <span className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground">idle</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Btn onClick={onOpenChat} icon={<MessageSquare className="h-2.5 w-2.5" />} label="Chat" />
          <Btn icon={<Play className="h-2.5 w-2.5" />} label="Run" accent />
          <Btn icon={<Pause className="h-2.5 w-2.5" />} label="Pause" ghost />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-3 flex items-center shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1.5 text-[10px] font-medium border-b transition-colors ${
              tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.id === "work" && blocked.length > 0 && <span className="ml-1 text-[8px] text-destructive">{blocked.length}</span>}
            {t.id === "automation" && agent.cronJobs.some(j => j.status === "failed") && <span className="ml-1 text-[8px] text-destructive">!</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {tab === "overview" && (
          <div className="space-y-2 max-w-2xl">
            <div className="text-[11px] text-foreground/85">{agent.purpose}</div>

            {/* Accountability Signals */}
            <div>
              <Label>Signals</Label>
              {agent.status === "error" && <Signal type="error" text={agent.currentTask} action="Diagnose" />}
              {agent.cronJobs.filter(j => j.status === "failed").map((j, i) => (
                <Signal key={i} type="warn" text={`${j.name} — failed`} action="Rerun" />
              ))}
              {agent.skills.filter(s => s.status === "degraded").map((s, i) => (
                <Signal key={i} type="warn" text={`${s.name} — degraded`} action="Inspect" />
              ))}
              {blocked.length > 0 && <Signal type="error" text={`${blocked.length} matter${blocked.length > 1 ? "s" : ""} blocked`} />}
              {agent.stalledWork > 0 && <Signal type="warn" text={`${agent.stalledWork} stalled items — not acting`} action="Investigate" />}
              {agent.status === "idle" && agent.workingOn.length === 0 && <Signal type="warn" text="Agent idle — no assigned work" action="Assign" />}
              {agent.status === "active" && agent.cronJobs.every(j => j.status === "ok") && agent.skills.every(s => s.status === "active") && blocked.length === 0 && (
                <Signal type="ok" text="All nominal" />
              )}
            </div>

            <div>
              <Label>Working On</Label>
              {agent.workingOn.length > 0 ? agent.workingOn.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 py-0.5">
                  <ChevronRight className="h-2.5 w-2.5 text-accent shrink-0" />
                  <span className="text-[11px]">{w}</span>
                </div>
              )) : <span className="text-[11px] text-muted-foreground">No active work</span>}
            </div>

            <div>
              <Label>Responsibilities</Label>
              <div className="flex flex-wrap gap-1">
                {agent.responsibilities.map(r => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{r}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="max-w-2xl">
            {agent.activity.map(e => (
              <div key={e.id} className="flex items-start gap-2 py-1 border-b border-border/20 last:border-0">
                <span className="text-[10px] font-mono text-muted-foreground w-14 shrink-0 pt-px">{e.time}</span>
                <span className="shrink-0 pt-px">
                  {e.outcome === "success" ? <Check className="h-2.5 w-2.5 text-success" /> :
                   e.outcome === "failure" ? <X className="h-2.5 w-2.5 text-destructive" /> :
                   <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground inline-block" />}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px]">{e.action}</span>
                  {e.detail && <span className="text-[10px] text-muted-foreground ml-1.5">— {e.detail}</span>}
                </div>
                {e.outcome === "failure" && (
                  <button className="text-[9px] px-1 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 flex items-center gap-0.5">
                    <RefreshCw className="h-2 w-2" />Retry
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "skills" && (
          <div className="max-w-2xl">
            {agent.skills.map(s => (
              <div key={s.id} className="border-b border-border/20 last:border-0">
                <div
                  onClick={() => setExpSkill(expSkill === s.id ? null : s.id)}
                  className="flex items-center justify-between py-1 cursor-pointer hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono">{s.name}</span>
                    <StatusPill status={s.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">{s.runs} runs · {s.lastRun}</span>
                    {/* Inline actions always visible on hover */}
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                      <Zap className="h-2 w-2" />Run
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
                      {s.status === "disabled" ? "Enable" : "Disable"}
                    </button>
                    <ChevronRight className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${expSkill === s.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
                {expSkill === s.id && (
                  <div className="pb-1.5 pl-1 space-y-1">
                    <p className="text-[10px] text-foreground/70">{s.description}</p>
                    <div className="text-[10px] text-muted-foreground">
                      Last: {s.lastRun} · {s.lastOutcome === "success" ? "✓" : "✗"} {s.lastOutcome}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "automation" && (
          <div className="max-w-2xl">
            {agent.cronJobs.map((j, i) => (
              <div key={i} className="border-b border-border/20 last:border-0">
                <div
                  onClick={() => setExpCron(expCron === j.name ? null : j.name)}
                  className="flex items-center justify-between py-1 cursor-pointer hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${j.status === "ok" ? "bg-success" : j.status === "failed" ? "bg-destructive" : "bg-muted-foreground"}`} />
                    <span className="text-[11px]">{j.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">{j.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">{j.lastRun}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                      <Play className="h-2 w-2" />Run
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
                      {j.status === "paused" ? "Resume" : "Pause"}
                    </button>
                    <ChevronRight className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${expCron === j.name ? "rotate-90" : ""}`} />
                  </div>
                </div>
                {expCron === j.name && (
                  <div className="pb-1.5 pl-4 space-y-1">
                    <div className="text-[10px] text-muted-foreground">
                      Skill: <span className="font-mono text-foreground/70">{agent.skills.find(s => s.id === j.skillId)?.name || j.skillId}</span>
                      {j.nextRun && <span> · Next: {j.nextRun}</span>}
                    </div>
                    {j.history && j.history.map((h, hi) => (
                      <div key={hi} className="flex items-center gap-1.5 text-[10px] py-0.5">
                        {h.ok ? <Check className="h-2.5 w-2.5 text-success" /> : <X className="h-2.5 w-2.5 text-destructive" />}
                        <span className="text-muted-foreground">{h.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "work" && (
          <div className="max-w-2xl space-y-2">
            {blocked.length > 0 && (
              <div>
                <Label className="text-destructive">Blocked · {blocked.length}</Label>
                {blocked.map(m => (
                  <WorkRow key={m.id} matter={m} />
                ))}
              </div>
            )}
            {active.length > 0 && (
              <div>
                <Label>Active · {active.length}</Label>
                {active.map(m => (
                  <WorkRow key={m.id} matter={m} />
                ))}
              </div>
            )}
            {staleOwned.length > 0 && (
              <div>
                <Label>Stale</Label>
                {staleOwned.map(m => (
                  <WorkRow key={m.id} matter={m} stale />
                ))}
              </div>
            )}
            {owned.length === 0 && <span className="text-[11px] text-muted-foreground">No matters assigned.</span>}
          </div>
        )}

        {tab === "logs" && (
          <div className="max-w-2xl font-mono text-[10px]">
            {agent.activity.map(e => (
              <div key={e.id} className="flex gap-2 py-0.5 text-muted-foreground border-b border-border/15 last:border-0">
                <span className="text-foreground/40 w-14 shrink-0">{e.time}</span>
                <span className={e.outcome === "failure" ? "text-destructive" : "text-foreground/60"}>[{e.outcome.toUpperCase()}]</span>
                <span className="text-foreground/60">{e.action}</span>
                {e.detail && <span>— {e.detail}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Helpers =====

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${className || "text-muted-foreground"}`}>{children}</div>;
}

function Signal({ type, text, action }: { type: "ok" | "warn" | "error"; text: string; action?: string }) {
  const icon = type === "ok" ? <Check className="h-2.5 w-2.5 text-success" /> :
    type === "error" ? <AlertTriangle className="h-2.5 w-2.5 text-destructive" /> :
    <AlertTriangle className="h-2.5 w-2.5 text-warning" />;
  return (
    <div className="flex items-center justify-between py-0.5 group">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`text-[11px] ${type === "error" ? "text-destructive" : type === "warn" ? "text-warning" : "text-success"}`}>{text}</span>
      </div>
      {action && (
        <button className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {action}
        </button>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "active" ? "bg-success/10 text-success" :
    status === "degraded" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
  return <span className={`text-[9px] px-1 py-px rounded ${cls}`}>{status}</span>;
}

function WorkRow({ matter, stale }: { matter: typeof matters[0]; stale?: boolean }) {
  const statusDot = matter.status === "healthy" ? "bg-success" : matter.status === "at-risk" ? "bg-warning" : matter.status === "blocked" ? "bg-destructive" : "bg-muted-foreground";
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/20 last:border-0 group">
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
        <span className="text-[11px]">{matter.title}</span>
        <span className="text-[9px] text-muted-foreground font-mono">{matter.businessUnit}</span>
        {matter.overdueCount > 0 && <span className="text-[9px] px-1 py-px rounded bg-destructive/15 text-destructive">{matter.overdueCount}</span>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[9px] text-muted-foreground">{matter.lastActivity}</span>
        {stale && (
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            <Archive className="h-2 w-2" />Archive
          </button>
        )}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
          <UserPlus className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

function Btn({ label, icon, accent, ghost, onClick }: { label: string; icon: React.ReactNode; accent?: boolean; ghost?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
      accent ? "bg-accent text-accent-foreground hover:bg-accent/90" :
      ghost ? "border border-border text-muted-foreground hover:text-foreground" :
      "bg-secondary hover:bg-secondary/80"
    }`}>
      {icon}{label}
    </button>
  );
}
