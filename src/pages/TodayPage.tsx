import { AppLayout } from "@/components/AppLayout";
import {
  attentionItems, meetings, waitingItems, cleanupItems,
  systemHealth, matters, agents
} from "@/data/mockData";
import {
  AlertTriangle, ArrowRight, UserPlus, Check, Play, Zap,
  Clock, Trash2, MailWarning, Link2, Archive, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const urgencyBorder: Record<string, string> = {
  critical: "border-l-2 border-l-destructive",
  high: "border-l-2 border-l-warning",
  medium: "",
};

const typeIcon: Record<string, string> = {
  email: "✉",
  commitment: "◎",
  matter: "■",
  thread: "≡",
  system: "⚙",
};

export default function TodayPage() {
  const navigate = useNavigate();
  const errorAgents = agents.filter(a => a.status === "error");
  const failedCrons = agents.flatMap(a =>
    a.cronJobs.filter(j => j.status === "failed").map(j => ({ agent: a.name, job: j }))
  );

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 py-2 space-y-3">

          {/* 1. NEEDS YOUR ATTENTION */}
          <section>
            <SectionLabel count={attentionItems.length}>Needs Your Attention</SectionLabel>
            <div className="space-y-px">
              {attentionItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 py-1.5 px-2 group hover:bg-secondary/40 transition-colors ${urgencyBorder[item.urgency]}`}
                >
                  <span className="text-[9px] w-3 text-center text-muted-foreground shrink-0">{typeIcon[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px]">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.owner && <span className="text-[9px] font-mono text-muted-foreground">{item.owner}</span>}
                    <span className="text-[9px] text-muted-foreground">{item.age}</span>
                    {item.suggestedAction && (
                      <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <Zap className="h-2 w-2" />{item.suggestedAction}
                      </button>
                    )}
                    {item.matterId && (
                      <button onClick={() => navigate("/matters")} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    )}
                    <button className="text-[9px] px-1 py-0.5 rounded hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <UserPlus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. MEETINGS TODAY */}
          <section>
            <SectionLabel count={meetings.length}>Meetings Today</SectionLabel>
            <div className="space-y-px">
              {meetings.map(mt => {
                const linkedMatters = matters.filter(m => mt.matterIds.includes(m.id));
                return (
                  <div key={mt.id} className="py-1.5 px-2 group hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-accent w-10 shrink-0">{mt.time}</span>
                        <span className="text-[11px] font-medium">{mt.title}</span>
                        <span className="text-[9px] text-muted-foreground">{mt.participants.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5">
                          <Play className="h-2 w-2" />Prep
                        </button>
                        <button onClick={() => navigate("/matters")} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                    {/* Linked matters */}
                    {linkedMatters.map(m => (
                      <div key={m.id} className="flex items-center gap-1.5 ml-12 mt-0.5 text-[10px] text-muted-foreground">
                        <Link2 className="h-2 w-2" />
                        <span>{m.title}</span>
                        <span className={`text-[9px] px-1 py-px rounded ${
                          m.status === "blocked" ? "bg-destructive/10 text-destructive" :
                          m.status === "at-risk" ? "bg-warning/10 text-warning" :
                          "bg-success/10 text-success"
                        }`}>{m.status}</span>
                      </div>
                    ))}
                    {/* Overdue participants */}
                    {mt.overdueParticipants.map(op => (
                      <div key={op.name} className="flex items-center gap-1.5 ml-12 mt-0.5 text-[10px] text-destructive">
                        <AlertTriangle className="h-2 w-2" />
                        <span>{op.name} — {op.count} overdue</span>
                        <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MailWarning className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. WAITING / AGING */}
          <section>
            <SectionLabel count={waitingItems.length}>Waiting / Aging</SectionLabel>
            <div className="space-y-px">
              {waitingItems.map(w => (
                <div key={w.id} className="flex items-center gap-2 py-1 px-2 group hover:bg-secondary/40 transition-colors">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  <span className="text-[11px] flex-1 min-w-0 truncate">{w.title}</span>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">{w.owner}</span>
                  <span className="text-[9px] text-warning shrink-0">{w.waitingSince}</span>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5">
                      <Zap className="h-2 w-2" />Nudge
                    </button>
                    <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                      <UserPlus className="h-2.5 w-2.5" />
                    </button>
                    {w.matterId && (
                      <button onClick={() => navigate("/matters")} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                        <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. CLEANUP QUEUE */}
          <section>
            <SectionLabel count={cleanupItems.length}>Cleanup Queue</SectionLabel>
            <div className="space-y-px">
              {cleanupItems.map(cl => (
                <div key={cl.id} className="flex items-center gap-2 py-1 px-2 group hover:bg-secondary/40 transition-colors">
                  <span className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground shrink-0">{cl.type}</span>
                  <span className="text-[11px] flex-1 min-w-0 truncate">{cl.title}</span>
                  <span className="text-[9px] text-muted-foreground shrink-0">{cl.age}</span>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5">
                      <UserPlus className="h-2 w-2" />Assign
                    </button>
                    <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                      <Link2 className="h-2 w-2" />Link
                    </button>
                    <button className="text-[9px] px-1 py-0.5 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                      <Archive className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. SYSTEM CONFIDENCE */}
          <section>
            <SectionLabel>System Confidence</SectionLabel>
            <div className="flex items-center gap-3 px-2 py-1.5 bg-secondary/30 rounded">
              {systemHealth.issues.filter(i => i.severity !== "ok").map((issue, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[10px]">
                  {issue.severity === "error"
                    ? <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                    : <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                  }
                  <span className={issue.severity === "error" ? "text-destructive" : "text-warning"}>{issue.label}</span>
                  {issue.action && (
                    <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground ml-0.5">
                      Fix
                    </button>
                  )}
                </div>
              ))}
              {errorAgents.length === 0 && failedCrons.length === 0 && systemHealth.issues.every(i => i.severity === "ok") && (
                <div className="flex items-center gap-1 text-[10px] text-success">
                  <Check className="h-2.5 w-2.5" /> All systems nominal
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </AppLayout>
  );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-0.5 px-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{children}</span>
      {count !== undefined && <span className="text-[9px] font-mono text-muted-foreground">{count}</span>}
    </div>
  );
}
