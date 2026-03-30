import { useState } from "react";
import { type Agent, matters, unassignedThreads } from "@/data/mockData";
import { MessageSquare, Play, Pause, Circle, ChevronRight, Check, AlertTriangle, X, Zap } from "lucide-react";

type Tab = "overview" | "activity" | "skills" | "automation" | "work" | "logs";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "skills", label: "Skills" },
  { id: "automation", label: "Automation" },
  { id: "work", label: "Work" },
  { id: "logs", label: "Logs" },
];

const statusColor = {
  active: "bg-success",
  idle: "bg-muted-foreground",
  error: "bg-destructive",
};

const statusText = {
  active: "Active",
  idle: "Idle",
  error: "Error",
};

export function AgentDetailView({ agent, onOpenChat }: { agent: Agent; onOpenChat: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [expandedCron, setExpandedCron] = useState<string | null>(null);

  const agentMatters = matters.filter((m) => m.ownerAgentId === agent.id);
  const blockedMatters = agentMatters.filter((m) => m.status === "blocked");
  const activeMatters = agentMatters.filter((m) => m.status !== "blocked");

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Agent header */}
      <div className="border-b px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center text-xs font-mono font-semibold text-foreground">
            {agent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">{agent.name}</h1>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{agent.role}</span>
              <div className="flex items-center gap-1.5 ml-1">
                <div className={`h-1.5 w-1.5 rounded-full ${statusColor[agent.status]}`} />
                <span className={`text-xs ${agent.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                  {statusText[agent.status]}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            Chat
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
            <Play className="h-3 w-3" />
            Run Task
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Pause className="h-3 w-3" />
            Pause
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b px-5 flex items-center gap-0 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 max-w-3xl">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <section>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Purpose</h3>
                <p className="text-sm text-foreground/90">{agent.purpose}</p>
              </section>

              <section>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Currently Working On</h3>
                <div className="space-y-1">
                  {agent.currentItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-3 w-3 mt-1 text-accent shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Key Signals</h3>
                <div className="space-y-1.5">
                  {agent.status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Agent is in error state — {agent.currentTask}</span>
                    </div>
                  )}
                  {agent.cronJobs.filter(j => j.status === "failed").map((j, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{j.name} — last run failed</span>
                    </div>
                  ))}
                  {agent.skills.filter(s => s.status === "degraded").map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{s.name} — degraded</span>
                    </div>
                  ))}
                  {blockedMatters.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <Circle className="h-3 w-3 fill-destructive" />
                      <span>{blockedMatters.length} matter{blockedMatters.length > 1 ? "s" : ""} blocked</span>
                    </div>
                  )}
                  {agent.status === "active" && agent.cronJobs.every(j => j.status === "ok") && agent.skills.every(s => s.status === "active") && blockedMatters.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <Check className="h-3 w-3" />
                      <span>All systems nominal</span>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Responsibilities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {agent.responsibilities.map((r) => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">{r}</span>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-0">
              {agent.activity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted-foreground font-mono w-20 shrink-0 pt-0.5">{entry.timestamp}</span>
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {entry.outcome === "success" && <Check className="h-3 w-3 text-success" />}
                    {entry.outcome === "failure" && <X className="h-3 w-3 text-destructive" />}
                    {entry.outcome === "pending" && <Circle className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm">{entry.action}</span>
                    {entry.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-0">
              {agent.skills.map((skill) => (
                <div key={skill.id} className="border-b border-border/50 last:border-0">
                  <button
                    onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                    className="w-full flex items-center justify-between py-2.5 text-left hover:bg-secondary/30 transition-colors -mx-2 px-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono">{skill.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        skill.status === "active" ? "bg-success/10 text-success" :
                        skill.status === "degraded" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {skill.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{skill.executionCount} runs</span>
                      <ChevronRight className={`h-3 w-3 transition-transform ${expandedSkill === skill.id ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                  {expandedSkill === skill.id && (
                    <div className="pb-3 pl-2 space-y-3">
                      <p className="text-sm text-foreground/80">{skill.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block mb-1">Inputs</span>
                          {skill.inputs.map(i => <span key={i} className="block font-mono text-foreground/70">{i}</span>)}
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Outputs</span>
                          {skill.outputs.map(o => <span key={o} className="block font-mono text-foreground/70">{o}</span>)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last run: {skill.lastExecution} · {skill.lastOutcome === "success" ? "✓" : "✗"} {skill.lastOutcome}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                          {skill.status === "disabled" ? "Enable" : "Disable"}
                        </button>
                        <button className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Run Test
                        </button>
                        <button className="text-xs px-2 py-1 rounded border text-muted-foreground hover:text-foreground transition-colors">
                          History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "automation" && (
            <div className="space-y-0">
              {agent.cronJobs.map((job, i) => (
                <div key={i} className="border-b border-border/50 last:border-0">
                  <button
                    onClick={() => setExpandedCron(expandedCron === job.name ? null : job.name)}
                    className="w-full flex items-center justify-between py-2.5 text-left hover:bg-secondary/30 transition-colors -mx-2 px-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-1.5 w-1.5 rounded-full ${job.status === "ok" ? "bg-success" : job.status === "failed" ? "bg-destructive" : "bg-muted-foreground"}`} />
                      <span className="text-sm">{job.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">{job.schedule}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{job.lastRun}</span>
                      <ChevronRight className={`h-3 w-3 transition-transform ${expandedCron === job.name ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                  {expandedCron === job.name && (
                    <div className="pb-3 pl-6 space-y-3">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>Triggers skill:</span>
                          <span className="font-mono text-foreground/80">
                            {agent.skills.find(s => s.id === job.skillId)?.name || job.skillId}
                          </span>
                        </div>
                        {job.nextRun && (
                          <div className="text-muted-foreground">Next run: {job.nextRun}</div>
                        )}
                      </div>
                      {job.recentRuns && (
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Recent runs</span>
                          {job.recentRuns.map((run, ri) => (
                            <div key={ri} className="flex items-center gap-2 text-xs py-0.5">
                              {run.status === "ok" ? <Check className="h-3 w-3 text-success" /> : <X className="h-3 w-3 text-destructive" />}
                              <span className="text-muted-foreground">{run.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          Run Now
                        </button>
                        <button className="text-xs px-2 py-1 rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
                          <Pause className="h-3 w-3" />
                          {job.status === "paused" ? "Resume" : "Pause"}
                        </button>
                        <button className="text-xs px-2 py-1 rounded border text-muted-foreground hover:text-foreground transition-colors">
                          Edit Schedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "work" && (
            <div className="space-y-5">
              {activeMatters.length > 0 && (
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Active</h3>
                  <div className="space-y-1">
                    {activeMatters.map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${m.status === "healthy" ? "bg-success" : m.status === "at-risk" ? "bg-warning" : "bg-destructive"}`} />
                          <span className="text-sm">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{m.commitments.length} commitments</span>
                          <span>{m.lastActivity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {blockedMatters.length > 0 && (
                <section>
                  <h3 className="text-xs font-medium text-destructive uppercase tracking-wider mb-2">Blocked</h3>
                  <div className="space-y-1">
                    {blockedMatters.map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                          <span className="text-sm">{m.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{m.lastActivity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {agentMatters.length === 0 && (
                <p className="text-sm text-muted-foreground">No matters assigned to this agent.</p>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-0 font-mono text-xs">
              {agent.activity.map((entry) => (
                <div key={entry.id} className="flex gap-3 py-1.5 text-muted-foreground border-b border-border/30 last:border-0">
                  <span className="text-foreground/50 w-16 shrink-0">{entry.timestamp}</span>
                  <span className={entry.outcome === "failure" ? "text-destructive" : entry.outcome === "success" ? "text-foreground/70" : "text-muted-foreground"}>
                    [{entry.outcome.toUpperCase()}]
                  </span>
                  <span className="text-foreground/70">{entry.action}</span>
                  {entry.detail && <span className="text-muted-foreground">— {entry.detail}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
