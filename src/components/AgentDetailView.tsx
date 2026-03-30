import { useState } from "react";
import { type Agent } from "@/data/mockData";
import { StatusDot, StatusPill, Signal, Label, InlineAction, DenseRow } from "@/components/shared";
import {
  MessageSquare, Play, Pause, Check, X, Zap,
  ChevronRight, UserPlus, Archive, RefreshCw
} from "lucide-react";
import { useRunCron, useToggleCron } from "@/hooks/useAgentsLive";
import { useMatters } from "@/hooks/useMatters";
import { adaptMatterListItem } from "@/lib/matters-adapter";

type Tab = "overview" | "activity" | "skills" | "automation" | "work" | "logs";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "automation", label: "Cron" },
  { id: "work", label: "Work" },
];

export function AgentDetailView({ agent, onOpenChat }: { agent: Agent; onOpenChat: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [expSkill, setExpSkill] = useState<string | null>(null);
  const [expCron, setExpCron] = useState<string | null>(null);
  const runCron = useRunCron();
  const toggleCron = useToggleCron();

  // Live matters for the Work tab
  const { data: mattersData } = useMatters();
  const allMatters = (mattersData?.matters || []).map(adaptMatterListItem);
  const owned = allMatters.filter(m => m.owner === agent.name.toLowerCase() || m.owner === agent.id);
  const blocked = owned.filter(m => m.status === "blocked");
  const active = owned.filter(m => m.status !== "blocked" && m.status !== "stale");
  const staleOwned = owned.filter(m => m.status === "stale");

  const handleRunCron = (cronName: string) => {
    runCron.mutate(cronName);
  };

  const handleToggleCron = (cronName: string, currentlyPaused: boolean) => {
    toggleCron.mutate({ cronId: cronName, enabled: currentlyPaused });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="h-10 border-b px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-mono font-semibold bg-secondary px-2 py-0.5 rounded">{agent.avatar}</span>
          <span className="text-sm font-semibold">{agent.name}</span>
          <span className="text-[13px] text-muted-foreground truncate max-w-[200px]">{agent.role}</span>
          <StatusDot status={agent.status} size="md" />
          {agent.failedLast24h > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium">{agent.failedLast24h} failed/24h</span>
          )}
          {agent.stalledWork > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-medium">{agent.stalledWork} stalled</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <InlineAction onClick={onOpenChat} icon={<MessageSquare className="h-3 w-3" />} label="Chat" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4 flex items-center shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-[13px] font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.id === "work" && blocked.length > 0 && <span className="ml-1 text-[11px] text-destructive">{blocked.length}</span>}
            {t.id === "automation" && agent.cronJobs.some(j => j.status === "failed") && <span className="ml-1 text-[11px] text-destructive">!</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === "overview" && (
          <div className="space-y-3 max-w-2xl">
            <div className="text-sm text-foreground/85">{agent.purpose}</div>

            <div>
              <Label>Signals</Label>
              {agent.cronJobs.filter(j => j.status === "failed").map((j, i) => (
                <Signal key={i} type="warn" text={`${j.name} — failed`} action="Rerun" />
              ))}
              {agent.skills.filter(s => s.status === "degraded").map((s, i) => (
                <Signal key={i} type="warn" text={`${s.name} — degraded`} action="Inspect" />
              ))}
              {blocked.length > 0 && <Signal type="error" text={`${blocked.length} matter${blocked.length > 1 ? "s" : ""} blocked`} />}
              {agent.status === "idle" && agent.workingOn.length === 0 && <Signal type="warn" text="Agent idle — no assigned work" action="Assign" />}
              {agent.cronJobs.every(j => j.status !== "failed") && agent.skills.every(s => s.status === "active") && blocked.length === 0 && (
                <Signal type="ok" text="All nominal" />
              )}
            </div>

            <div>
              <Label>Responsibilities</Label>
              <div className="flex flex-wrap gap-1.5">
                {agent.responsibilities.map(r => (
                  <span key={r} className="text-[12px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{r}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "skills" && (
          <div className="max-w-2xl">
            {agent.skills.length === 0 && <span className="text-sm text-muted-foreground">No skills discovered</span>}
            {agent.skills.map(s => (
              <div key={s.id} className="border-b border-border/20 last:border-0">
                <div
                  onClick={() => setExpSkill(expSkill === s.id ? null : s.id)}
                  className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-mono">{s.name}</span>
                    <StatusPill status={s.status} />
                  </div>
                  <div className="flex items-center gap-2.5">
                    {s.runs > 0 && <span className="text-[12px] text-muted-foreground">{s.runs} runs</span>}
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${expSkill === s.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
                {expSkill === s.id && s.description && (
                  <div className="pb-2 pl-1.5">
                    <p className="text-[13px] text-foreground/70">{s.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "automation" && (
          <div className="max-w-2xl">
            {agent.cronJobs.length === 0 && <span className="text-sm text-muted-foreground">No cron jobs</span>}
            {agent.cronJobs.map((j, i) => (
              <div key={i} className="border-b border-border/20 last:border-0">
                <div
                  onClick={() => setExpCron(expCron === j.name ? null : j.name)}
                  className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <StatusDot status={j.status} />
                    <span className="text-sm">{j.name}</span>
                    <span className="text-[12px] font-mono text-muted-foreground">{j.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] text-muted-foreground">{j.lastRun}</span>
                    <InlineAction
                      icon={<Play className="h-3 w-3" />}
                      label="Run"
                      accent
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleRunCron(j.name); }}
                    />
                    <InlineAction
                      label={j.status === "paused" ? "Resume" : "Pause"}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleToggleCron(j.name, j.status === "paused"); }}
                    />
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${expCron === j.name ? "rotate-90" : ""}`} />
                  </div>
                </div>
                {expCron === j.name && (
                  <div className="pb-2 pl-5 space-y-1">
                    {j.nextRun && <div className="text-[13px] text-muted-foreground">Next: {j.nextRun}</div>}
                    {j.history && j.history.map((h, hi) => (
                      <div key={hi} className="flex items-center gap-2 text-[12px] py-0.5">
                        {h.ok ? <Check className="h-3 w-3 text-success" /> : <X className="h-3 w-3 text-destructive" />}
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
          <div className="max-w-2xl space-y-3">
            {blocked.length > 0 && (
              <div>
                <Label className="text-destructive">Blocked · {blocked.length}</Label>
                {blocked.map(m => <WorkRow key={m.id} matter={m} />)}
              </div>
            )}
            {active.length > 0 && (
              <div>
                <Label>Active · {active.length}</Label>
                {active.map(m => <WorkRow key={m.id} matter={m} />)}
              </div>
            )}
            {staleOwned.length > 0 && (
              <div>
                <Label>Stale</Label>
                {staleOwned.map(m => <WorkRow key={m.id} matter={m} stale />)}
              </div>
            )}
            {owned.length === 0 && <span className="text-sm text-muted-foreground">No matters assigned to this agent.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkRow({ matter, stale }: { matter: { id: string; title: string; status: string; businessUnit: string; overdueCount: number; lastActivity: string }; stale?: boolean }) {
  return (
    <DenseRow>
      <div className="flex items-center gap-2">
        <StatusDot status={matter.status} />
        <span className="text-sm">{matter.title}</span>
        {matter.businessUnit && <span className="text-[12px] text-muted-foreground font-mono">{matter.businessUnit}</span>}
        {matter.overdueCount > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium">{matter.overdueCount}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {matter.lastActivity && <span className="text-[12px] text-muted-foreground">{matter.lastActivity}</span>}
        {stale && (
          <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive" className="opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </DenseRow>
  );
}
