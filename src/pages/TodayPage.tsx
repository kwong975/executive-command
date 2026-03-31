import { useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SectionLabel, StatusDot, DenseRow, InlineAction } from "@/components/shared";
import { ResolutionDrawer, type ResolutionItem } from "@/components/ResolutionDrawer";
import { useToday } from "@/hooks/useToday";
import { useHealth } from "@/hooks/useStatus";
import {
  AlertTriangle, ArrowRight, UserPlus, Check, Zap,
  Clock, Loader2, Inbox, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Helpers to build ResolutionItem from raw data ──

function attentionToItem(d: Record<string, unknown>): ResolutionItem {
  const overdue = (d.overdue as number) || 0;
  const open = (d.open as number) || 0;
  const owner = (d.owner as string) || "unassigned";
  const reasons: string[] = [];
  if (owner === "unassigned") reasons.push("No owner assigned — cannot progress");
  if (overdue > 0) reasons.push(`${overdue} overdue commitment${overdue > 1 ? "s" : ""}`);
  if ((d.type as string) === "blocked") reasons.push("Matter is blocked");
  if ((d.type as string) === "overloaded") reasons.push("Owner is overloaded with work");
  if (reasons.length === 0) reasons.push("Surfaced by urgency score");

  return {
    id: (d.id as string) || Math.random().toString(36).slice(2),
    type: "matter",
    title: d.title as string,
    status: (d.type as string) || "at-risk",
    owner,
    overdueCount: overdue,
    openCount: open,
    reasons,
    objective: "Linked to active strategy objective",
  };
}

function decisionToItem(d: Record<string, unknown>): ResolutionItem {
  return {
    id: (d.matter_id as string) || Math.random().toString(36).slice(2),
    type: d.matter_id ? "matter" : "system",
    title: d.title as string,
    status: "blocked",
    owner: "unassigned",
    reasons: [d.context as string],
    objective: d.action as string,
  };
}

function commitmentToItem(d: Record<string, unknown>, section: string): ResolutionItem {
  const reasons: string[] = [];
  if (section === "ceo_overdue") reasons.push("This is your personal overdue commitment");
  if (section === "deadline") reasons.push("Due date approaching");
  if (section === "waiting_overdue") reasons.push("Delegated and now overdue");
  if (section === "waiting_aging") reasons.push("Waiting with no recent progress");

  return {
    id: Math.random().toString(36).slice(2),
    type: "commitment",
    title: d.title as string,
    status: section.includes("overdue") ? "overdue" : "at-risk",
    owner: (d.owner_person_key as string) || undefined,
    matterTitle: d.matter_title as string,
    dueDate: d.due_at as string,
    reasons,
  };
}

function cleanupToItem(d: Record<string, unknown>): ResolutionItem {
  return {
    id: (d.id as string) || Math.random().toString(36).slice(2),
    type: "matter",
    title: d.title as string,
    status: "stale",
    owner: "unassigned",
    openCount: (d.open as number) || 0,
    reasons: ["No accountable owner assigned", "Work may be stalling without ownership"],
  };
}

export default function TodayPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useToday();
  const { data: healthData } = useHealth();
  const [drawerItem, setDrawerItem] = useState<ResolutionItem | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const decisions = (data?.decisions as Array<Record<string, unknown>>) || [];
  const attention = (data?.attention as Array<Record<string, unknown>>) || [];
  const deadlines = (data?.deadlines as Array<Record<string, unknown>>) || [];
  const ceoOverdue = (data?.ceo_overdue as Array<Record<string, unknown>>) || [];
  const waitingOverdue = (data?.waiting_overdue as Array<Record<string, unknown>>) || [];
  const waitingAging = (data?.waiting_aging as Array<Record<string, unknown>>) || [];
  const cleanup = (data?.cleanup as Record<string, unknown>) || {};
  const noAccountable = (cleanup.no_accountable as Array<Record<string, unknown>>) || [];
  const recentlyResolved = (data?.recently_resolved as Array<Record<string, unknown>>) || [];
  const system = (data?.system as Record<string, unknown>) || {};

  const gatewayOk = healthData?.gateway_connected ?? false;

  const handleAction = useCallback((action: string, itemId: string) => {
    if (action === "open_matter") {
      navigate("/matters");
      return;
    }
    if (["resolve", "snooze"].includes(action)) {
      setRemovedIds(prev => new Set(prev).add(itemId));
    }
  }, [navigate]);

  const isRemoved = (id: string) => removedIds.has(id);

  if (isLoading) {
    return (
      <AppLayout title="Today">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      </AppLayout>
    );
  }

  if (isError && !data) {
    return (
      <AppLayout title="Today">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <AlertTriangle className="h-4 w-4" /><span className="text-sm">No data available yet.</span>
        </div>
      </AppLayout>
    );
  }

  const actionIcon: Record<string, React.ReactNode> = {
    open_matter: <ArrowRight className="h-3 w-3" />,
    assign_owner: <UserPlus className="h-3 w-3" />,
    escalate: <Zap className="h-3 w-3" />,
    run_cleanup: <Inbox className="h-3 w-3" />,
  };
  const actionLabel: Record<string, string> = {
    open_matter: "Open matter",
    assign_owner: "Assign owner",
    escalate: "Escalate",
    run_cleanup: "Run cleanup",
  };

  // Needs Push: combine attention, waiting, cleanup into grouped sections
  const needsPushNoOwner = noAccountable.filter(m => !isRemoved(m.id as string));
  const needsPushBlocked = attention.filter(item => !isRemoved(item.id as string) && ((item.type as string) === "blocked"));
  const needsPushAtRisk = attention.filter(item => !isRemoved(item.id as string) && ((item.type as string) !== "blocked"));
  const needsPushWaiting = [...waitingOverdue, ...waitingAging];
  const needsPushTotal = needsPushNoOwner.length + needsPushBlocked.length + needsPushAtRisk.length + needsPushWaiting.length;

  // Commitments summary
  const overdueCount = ceoOverdue.filter(c => !isRemoved(c.title as string)).length;
  const dueSoonCount = deadlines.length;

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* TWO COLUMNS: 70/30 */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT COLUMN — 70% */}
          <div className="flex-[7] overflow-y-auto border-r border-border/30">
            <div className="p-4 space-y-6">

              {/* 1. DECIDE NOW */}
              {decisions.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">Decide Now</h2>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-accent/15 text-accent font-semibold tabular-nums">{decisions.length}</span>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(decisions.length, 3)}, 1fr)` }}>
                    {decisions.filter(d => !isRemoved((d.matter_id as string) || "")).map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setDrawerItem(decisionToItem(d))}
                        className="text-left border border-border/50 rounded-lg px-4 py-3 bg-card hover:border-accent/40 hover:bg-card/80 transition-all duration-150 group cursor-pointer"
                      >
                        <div className="text-sm font-medium text-foreground leading-snug">{d.title as string}</div>
                        <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{d.context as string}</div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-accent font-medium">{d.action as string}</span>
                          <div className="flex items-center gap-1">
                            {((d.actions as string[]) || []).map(a => (
                              <span
                                key={a}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (a === "open_matter" && d.matter_id) navigate(`/matters`);
                                  if (a === "run_cleanup") navigate("/matters");
                                }}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-secondary hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-all duration-100 flex items-center gap-1 cursor-pointer"
                              >
                                {actionIcon[a]}
                                {actionLabel[a]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* 2. NEEDS PUSH */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-warning">Needs Push</h2>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-warning/15 text-warning font-semibold tabular-nums">{needsPushTotal}</span>
                </div>

                {/* No Owner */}
                {needsPushNoOwner.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">No Owner</div>
                    <div className="space-y-px">
                      {needsPushNoOwner.map((m, i) => (
                        <DenseRow key={`no-${i}`} onClick={() => setDrawerItem(cleanupToItem(m))}>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <UserPlus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{m.title as string}</span>
                          </div>
                          <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Assign owner" accent onClick={e => { e.stopPropagation(); setDrawerItem(cleanupToItem(m)); }} />
                        </DenseRow>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blocked / At Risk */}
                {needsPushBlocked.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-destructive mb-1.5 px-1">Blocked</div>
                    <div className="space-y-px">
                      {needsPushBlocked.map((item, i) => (
                        <DenseRow key={`bl-${i}`} urgencyBorder="critical" onClick={() => setDrawerItem(attentionToItem(item))}>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <StatusDot status="blocked" />
                            <span className="text-sm truncate">{item.title as string}</span>
                            {(item.overdue as number) > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive shrink-0 font-semibold tabular-nums">{item.overdue as number} overdue</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono text-muted-foreground">{(item.owner as string) || ""}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </DenseRow>
                      ))}
                    </div>
                  </div>
                )}

                {needsPushAtRisk.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-warning mb-1.5 px-1">Execution Gaps</div>
                    <div className="space-y-px">
                      {needsPushAtRisk.map((item, i) => (
                        <DenseRow key={`ar-${i}`} urgencyBorder="high" onClick={() => setDrawerItem(attentionToItem(item))}>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <StatusDot status="at-risk" />
                            <span className="text-sm truncate">{item.title as string}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono text-muted-foreground">{(item.owner as string) || ""}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </DenseRow>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Load */}
                {needsPushWaiting.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">Waiting / Stalled</div>
                    <div className="space-y-px">
                      {needsPushWaiting.map((w, i) => (
                        <DenseRow key={`wp-${i}`} onClick={() => setDrawerItem(commitmentToItem(w, i < waitingOverdue.length ? "waiting_overdue" : "waiting_aging"))}>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{w.title as string}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono text-muted-foreground">{w.owner_person_key as string}</span>
                            {w.due_at && <span className="text-xs text-muted-foreground">{w.due_at as string}</span>}
                            <InlineAction icon={<Zap className="h-3 w-3" />} label="Nudge" accent onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100" />
                          </div>
                        </DenseRow>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unassigned threads */}
                {((cleanup.unassigned_threads as number) || 0) > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">System Load</div>
                    <DenseRow onClick={() => setDrawerItem({
                      id: "cleanup-unassigned",
                      type: "system",
                      title: "Unassigned Threads",
                      status: "warning",
                      reasons: [`${cleanup.unassigned_threads || 0} threads have no matter assignment`, `${cleanup.unassigned_with_commits || 0} have open commitments`],
                      openCount: cleanup.unassigned_threads as number || 0,
                    })}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Inbox className="h-3.5 w-3.5 text-warning shrink-0" />
                        <span className="text-sm">{cleanup.unassigned_threads as number} unassigned threads</span>
                      </div>
                      <InlineAction label="Delegate" accent onClick={e => e.stopPropagation()} />
                    </DenseRow>
                  </div>
                )}

                {needsPushTotal === 0 && (
                  <div className="text-sm text-muted-foreground px-1 py-2">Nothing needs a push right now.</div>
                )}
              </section>

              {/* 3. COMMITMENTS */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Commitments</h2>
                </div>
                <div className="flex items-center gap-6 px-1">
                  {overdueCount > 0 && (
                    <button
                      onClick={() => ceoOverdue[0] && setDrawerItem(commitmentToItem(ceoOverdue[0], "ceo_overdue"))}
                      className="flex items-center gap-2 text-sm text-destructive hover:underline cursor-pointer"
                    >
                      <span className="font-semibold tabular-nums">{overdueCount}</span> overdue
                    </button>
                  )}
                  {dueSoonCount > 0 && (
                    <button
                      onClick={() => deadlines[0] && setDrawerItem(commitmentToItem(deadlines[0], "deadline"))}
                      className="flex items-center gap-2 text-sm text-warning hover:underline cursor-pointer"
                    >
                      <span className="font-semibold tabular-nums">{dueSoonCount}</span> due soon
                    </button>
                  )}
                  {overdueCount === 0 && dueSoonCount === 0 && (
                    <span className="text-sm text-muted-foreground">All clear</span>
                  )}
                </div>
                {/* Show first overdue example */}
                {ceoOverdue.filter(c => !isRemoved(c.title as string)).length > 0 && (
                  <div className="mt-2">
                    {ceoOverdue.filter(c => !isRemoved(c.title as string)).slice(0, 1).map((c, i) => (
                      <DenseRow key={`ceo-${i}`} urgencyBorder="critical" onClick={() => setDrawerItem(commitmentToItem(c, "ceo_overdue"))}>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-destructive shrink-0 text-xs">◎</span>
                          <span className="text-sm truncate">{c.title as string}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{c.due_at as string}</span>
                          <span className="text-xs font-mono text-muted-foreground">{(c.matter_title as string)?.slice(0, 20)}</span>
                        </div>
                      </DenseRow>
                    ))}
                  </div>
                )}
              </section>

              {/* Recently Resolved */}
              {recentlyResolved.length > 0 && (
                <section>
                  <SectionLabel count={recentlyResolved.length}>Recently Resolved</SectionLabel>
                  <div className="space-y-px">
                    {recentlyResolved.map((r, i) => (
                      <DenseRow key={`res-${i}`}>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Check className="h-3.5 w-3.5 text-success shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">{r.canonical_title as string}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.closed_reason as string}</span>
                      </DenseRow>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — 30% — SIGNALS */}
          <div className="flex-[3] overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Signals */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Signals</h2>
                </div>
                <div className="space-y-2">
                  {attention.filter(item => !isRemoved(item.id as string)).slice(0, 5).map((item, i) => (
                    <div key={`sig-${i}`} className="text-sm text-foreground/80 leading-relaxed py-1.5 border-b border-border/30 last:border-0">
                      {item.title as string}
                      {(item.overdue as number) > 0 && <span className="text-destructive ml-1 text-xs font-semibold">· {item.overdue as number} overdue</span>}
                    </div>
                  ))}
                  {attention.filter(item => !isRemoved(item.id as string)).length === 0 && (
                    <div className="text-sm text-muted-foreground">No signals</div>
                  )}
                </div>
              </section>

              {/* System Confidence */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">System</h2>
                </div>
                <div className="px-3 py-3 bg-secondary/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gateway</span>
                    <div className="flex items-center gap-2">
                      <StatusDot status={gatewayOk ? "active" : "error"} />
                      <span className={gatewayOk ? "text-success" : "text-destructive"}>
                        {gatewayOk ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                  {[
                    { label: "Active matters", value: system.active_matters as number || 0 },
                    { label: "Open commitments", value: system.open_commitments as number || 0 },
                    { label: "Attention queue", value: system.queue_size as number || 0 },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-mono tabular-nums text-foreground/80">{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <ResolutionDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onAction={handleAction}
      />
    </AppLayout>
  );
}
