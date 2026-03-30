import { AppLayout } from "@/components/AppLayout";
import {
  attentionItems, meetings, waitingItems, cleanupItems,
  systemHealth, matters, agents
} from "@/data/mockData";
import { SectionLabel, StatusDot, StatusPill, DenseRow, InlineAction } from "@/components/shared";
import {
  AlertTriangle, ArrowRight, UserPlus, Check, Play, Zap,
  Clock, MailWarning, Link2, Archive
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const typeIcon: Record<string, string> = {
  email: "✉", commitment: "◎", matter: "■", thread: "≡", system: "⚙",
};

export default function TodayPage() {
  const navigate = useNavigate();
  const errorAgents = agents.filter(a => a.status === "error");
  const failedCrons = agents.flatMap(a =>
    a.cronJobs.filter(j => j.status === "failed").map(j => ({ agent: a.name, job: j }))
  );

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* COLUMN 1 — Needs Your Attention */}
          <div className="flex-1 border-r border-border/30 overflow-y-auto">
            <div className="px-1 py-2">
              <SectionLabel count={attentionItems.length}>Needs Your Attention</SectionLabel>
              <div className="space-y-px">
                {attentionItems.map(item => (
                  <DenseRow key={item.id} urgencyBorder={item.urgency === "critical" ? "critical" : item.urgency === "high" ? "high" : undefined}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[11px] w-4 text-center text-muted-foreground shrink-0">{typeIcon[item.type]}</span>
                      <span className="text-[13px] truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.owner && <span className="text-[11px] font-mono text-muted-foreground">{item.owner}</span>}
                      <span className="text-[11px] text-muted-foreground">{item.age}</span>
                      {item.suggestedAction && (
                        <InlineAction
                          icon={<Zap className="h-3 w-3" />}
                          label={item.suggestedAction}
                          accent
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      {item.matterId && (
                        <InlineAction
                          icon={<ArrowRight className="h-3 w-3" />}
                          onClick={() => navigate("/matters")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      <InlineAction
                        icon={<UserPlus className="h-3 w-3" />}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </DenseRow>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2 — Meetings + Waiting/Aging */}
          <div className="flex-1 border-r border-border/30 overflow-y-auto">
            <div className="px-1 py-2 space-y-4">
              {/* Meetings */}
              <section>
                <SectionLabel count={meetings.length}>Meetings Today</SectionLabel>
                <div className="space-y-px">
                  {meetings.map(mt => {
                    const linkedMatters = matters.filter(m => mt.matterIds.includes(m.id));
                    return (
                      <div key={mt.id} className="py-1.5 px-2.5 group hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-mono text-accent w-12 shrink-0">{mt.time}</span>
                            <span className="text-[13px] font-medium">{mt.title}</span>
                            <span className="text-[11px] text-muted-foreground">{mt.participants.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <InlineAction icon={<Play className="h-3 w-3" />} label="Prep" accent />
                            <InlineAction icon={<ArrowRight className="h-3 w-3" />} onClick={() => navigate("/matters")} />
                          </div>
                        </div>
                        {linkedMatters.map(m => (
                          <div key={m.id} className="flex items-center gap-2 ml-14 mt-1 text-[11px] text-muted-foreground">
                            <Link2 className="h-3 w-3" />
                            <span>{m.title}</span>
                            <StatusPill status={m.status} />
                          </div>
                        ))}
                        {mt.overdueParticipants.map(op => (
                          <div key={op.name} className="flex items-center gap-2 ml-14 mt-1 text-[11px] text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{op.name} — {op.count} overdue</span>
                            <InlineAction
                              icon={<MailWarning className="h-3 w-3" />}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Waiting / Aging */}
              <section>
                <SectionLabel count={waitingItems.length}>Waiting / Aging</SectionLabel>
                <div className="space-y-px">
                  {waitingItems.map(w => (
                    <DenseRow key={w.id}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-[13px] flex-1 min-w-0 truncate">{w.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-muted-foreground">{w.owner}</span>
                        <span className="text-[11px] text-warning">{w.waitingSince}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <InlineAction icon={<Zap className="h-3 w-3" />} label="Nudge" accent />
                          <InlineAction icon={<UserPlus className="h-3 w-3" />} />
                          {w.matterId && (
                            <InlineAction icon={<ArrowRight className="h-3 w-3" />} onClick={() => navigate("/matters")} />
                          )}
                        </div>
                      </div>
                    </DenseRow>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* COLUMN 3 — Cleanup + System */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-1 py-2 space-y-4">
              {/* Cleanup Queue */}
              <section>
                <SectionLabel count={cleanupItems.length}>Cleanup Queue</SectionLabel>
                <div className="space-y-px">
                  {cleanupItems.map(cl => (
                    <DenseRow key={cl.id}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 font-medium">{cl.type}</span>
                        <span className="text-[13px] flex-1 min-w-0 truncate">{cl.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-muted-foreground">{cl.age}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Assign" accent />
                          <InlineAction icon={<Link2 className="h-3 w-3" />} label="Link" />
                          <InlineAction icon={<Archive className="h-3 w-3" />} destructive />
                        </div>
                      </div>
                    </DenseRow>
                  ))}
                </div>
              </section>

              {/* System Confidence */}
              <section>
                <SectionLabel>System Confidence</SectionLabel>
                <div className="px-2.5 py-2 bg-secondary/30 rounded space-y-1">
                  {systemHealth.issues.filter(i => i.severity !== "ok").map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 group">
                      <div className="flex items-center gap-2 text-[12px]">
                        {issue.severity === "error"
                          ? <AlertTriangle className="h-3 w-3 text-destructive" />
                          : <AlertTriangle className="h-3 w-3 text-warning" />
                        }
                        <span className={issue.severity === "error" ? "text-destructive" : "text-warning"}>{issue.label}</span>
                      </div>
                      {issue.action && (
                        <InlineAction label="Fix" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  ))}
                  {errorAgents.length === 0 && failedCrons.length === 0 && systemHealth.issues.every(i => i.severity === "ok") && (
                    <div className="flex items-center gap-2 text-[12px] text-success">
                      <Check className="h-3 w-3" /> All systems nominal
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
