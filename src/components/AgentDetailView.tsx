import { useState } from "react";
import { type Agent, matters } from "@/data/mockData";
import { MessageSquare, Play, Pause, Check, AlertTriangle, X, Zap, ChevronRight } from "lucide-react";

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

  const owned = matters.filter((m) => m.ownerAgentId === agent.id);
  const blocked = owned.filter((m) => m.status === "blocked");
  const active = owned.filter((m) => m.status !== "blocked");

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header bar */}
      <div className="h-8 border-b px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold bg-secondary px-1.5 py-0.5 rounded">{agent.avatar}</span>
          <span className="text-[11px] font-semibold">{agent.name}</span>
          <span className="text-[10px] text-muted-foreground">{agent.role}</span>
          <div className={`h-1.5 w-1.5 rounded-full ${sDot[agent.status]}`} />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onOpenChat} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-secondary hover:bg-secondary/80 transition-colors">
            <MessageSquare className="h-2.5 w-2.5" /> Chat
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
            <Play className="h-2.5 w-2.5" /> Run
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border text-muted-foreground hover:text-foreground transition-colors">
            <Pause className="h-2.5 w-2.5" /> Pause
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-3 flex items-center gap-0 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1.5 text-[10px] font-medium border-b transition-colors ${
              tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tab === "overview" && (
          <div className="space-y-3 max-w-2xl">
            <Row label="Purpose" value={agent.purpose} />

            <div>
              <Label>Working On</Label>
              {agent.workingOn.length > 0 ? agent.workingOn.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 py-0.5">
                  <ChevronRight className="h-2.5 w-2.5 mt-0.5 text-accent shrink-0" />
                  <span className="text-[11px]">{w}</span>
                </div>
              )) : <span className="text-[11px] text-muted-foreground">No active work</span>}
            </div>

            <div>
              <Label>Signals</Label>
              {agent.status === "error" && <Signal type="error" text={`Agent error — ${agent.currentTask}`} />}
              {agent.cronJobs.filter(j => j.status === "failed").map((j, i) => (
                <Signal key={i} type="warn" text={`${j.name} — last run failed`} />
              ))}
              {agent.skills.filter(s => s.status === "degraded").map((s, i) => (
                <Signal key={i} type="warn" text={`${s.name} — degraded`} />
              ))}
              {blocked.length > 0 && <Signal type="error" text={`${blocked.length} matter${blocked.length > 1 ? "s" : ""} blocked`} />}
              {agent.status === "active" && agent.cronJobs.every(j => j.status === "ok") && agent.skills.every(s => s.status === "active") && blocked.length === 0 && (
                <Signal type="ok" text="All systems nominal" />
              )}
            </div>

            <div>
              <Label>Responsibilities</Label>
              <div className="flex flex-wrap gap-1">
                {agent.responsibilities.map((r) => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{r}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="max-w-2xl">
            {agent.activity.map((e) => (
              <div key={e.id} className="flex items-start gap-2 py-1 border-b border-border/30 last:border-0">
                <span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0 pt-px">{e.time}</span>
                <span className="shrink-0 pt-px">
                  {e.outcome === "success" ? <Check className="h-2.5 w-2.5 text-success" /> :
                   e.outcome === "failure" ? <X className="h-2.5 w-2.5 text-destructive" /> :
                   <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground inline-block" />}
                </span>
                <div className="min-w-0">
                  <span className="text-[11px]">{e.action}</span>
                  {e.detail && <span className="text-[10px] text-muted-foreground ml-1.5">— {e.detail}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "skills" && (
          <div className="max-w-2xl">
            {agent.skills.map((s) => (
              <div key={s.id} className="border-b border-border/30 last:border-0">
                <button
                  onClick={() => setExpSkill(expSkill === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between py-1.5 text-left hover:bg-secondary/30 transition-colors rounded -mx-1 px-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono">{s.name}</span>
                    <StatusPill status={s.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{s.runs} runs</span>
                    <ChevronRight className={`h-2.5 w-2.5 transition-transform ${expSkill === s.id ? "rotate-90" : ""}`} />
                  </div>
                </button>
                {expSkill === s.id && (
                  <div className="pb-2 pl-1 space-y-2">
                    <p className="text-[11px] text-foreground/80">{s.description}</p>
                    <div className="text-[10px] text-muted-foreground">
                      Last: {s.lastRun} · {s.lastOutcome === "success" ? "✓" : "✗"} {s.lastOutcome}
                    </div>
                    <div className="flex gap-1.5">
                      <InlineBtn label={s.status === "disabled" ? "Enable" : "Disable"} />
                      <InlineBtn label="Run Test" accent icon={<Zap className="h-2.5 w-2.5" />} />
                      <InlineBtn label="History" />
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
              <div key={i} className="border-b border-border/30 last:border-0">
                <button
                  onClick={() => setExpCron(expCron === j.name ? null : j.name)}
                  className="w-full flex items-center justify-between py-1.5 text-left hover:bg-secondary/30 transition-colors rounded -mx-1 px-1"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${j.status === "ok" ? "bg-success" : j.status === "failed" ? "bg-destructive" : "bg-muted-foreground"}`} />
                    <span className="text-[11px]">{j.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{j.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{j.lastRun}</span>
                    <ChevronRight className={`h-2.5 w-2.5 transition-transform ${expCron === j.name ? "rotate-90" : ""}`} />
                  </div>
                </button>
                {expCron === j.name && (
                  <div className="pb-2 pl-4 space-y-2">
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <div>Skill: <span className="font-mono text-foreground/70">{agent.skills.find(s => s.id === j.skillId)?.name || j.skillId}</span></div>
                      {j.nextRun && <div>Next: {j.nextRun}</div>}
                    </div>
                    {j.history && (
                      <div>
                        {j.history.map((h, hi) => (
                          <div key={hi} className="flex items-center gap-1.5 text-[10px] py-0.5">
                            {h.ok ? <Check className="h-2.5 w-2.5 text-success" /> : <X className="h-2.5 w-2.5 text-destructive" />}
                            <span className="text-muted-foreground">{h.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <InlineBtn label="Run Now" accent icon={<Play className="h-2.5 w-2.5" />} />
                      <InlineBtn label={j.status === "paused" ? "Resume" : "Pause"} icon={<Pause className="h-2.5 w-2.5" />} />
                      <InlineBtn label="Edit" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "work" && (
          <div className="max-w-2xl space-y-3">
            {active.length > 0 && (
              <div>
                <Label>Active</Label>
                {active.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${m.status === "healthy" ? "bg-success" : m.status === "at-risk" ? "bg-warning" : m.status === "stale" ? "bg-muted-foreground" : "bg-destructive"}`} />
                      <span className="text-[11px]">{m.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.businessUnit}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.lastActivity}</span>
                  </div>
                ))}
              </div>
            )}
            {blocked.length > 0 && (
              <div>
                <Label className="text-destructive">Blocked</Label>
                {blocked.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      <span className="text-[11px]">{m.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.lastActivity}</span>
                  </div>
                ))}
              </div>
            )}
            {owned.length === 0 && <span className="text-[11px] text-muted-foreground">No matters assigned.</span>}
          </div>
        )}

        {tab === "logs" && (
          <div className="max-w-2xl font-mono text-[10px]">
            {agent.activity.map((e) => (
              <div key={e.id} className="flex gap-2 py-0.5 text-muted-foreground border-b border-border/20 last:border-0">
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

// Helpers
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${className || "text-muted-foreground"}`}>{children}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-[11px] text-foreground/85">{value}</p>
    </div>
  );
}

function Signal({ type, text }: { type: "ok" | "warn" | "error"; text: string }) {
  const icon = type === "ok" ? <Check className="h-2.5 w-2.5 text-success" /> :
    type === "error" ? <AlertTriangle className="h-2.5 w-2.5 text-destructive" /> :
    <AlertTriangle className="h-2.5 w-2.5 text-warning" />;
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {icon}
      <span className={`text-[11px] ${type === "error" ? "text-destructive" : type === "warn" ? "text-warning" : "text-success"}`}>{text}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "active" ? "bg-success/10 text-success" :
    status === "degraded" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
  return <span className={`text-[9px] px-1 py-px rounded ${cls}`}>{status}</span>;
}

function InlineBtn({ label, accent, icon }: { label: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <button className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
      accent ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-secondary text-foreground hover:bg-secondary/80"
    }`}>
      {icon}{label}
    </button>
  );
}
