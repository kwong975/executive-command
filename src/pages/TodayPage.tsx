import { useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SectionLabel, StatusDot, StatusPill, DenseRow, InlineAction } from "@/components/shared";
import { ResolutionDrawer, type ResolutionItem } from "@/components/ResolutionDrawer";
import { useToday } from "@/hooks/useToday";
import { useHealth } from "@/hooks/useStatus";
import {
  AlertTriangle, ArrowRight, UserPlus, Check, Zap,
  Clock, Archive, Loader2, Inbox
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const urgencyBorderMap: Record<string, "critical" | "high" | undefined> = {
  critical: "critical",
  warning: "high",
};

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
    // For resolve/snooze — remove from view
    if (["resolve", "snooze"].includes(action)) {
      setRemovedIds(prev => new Set(prev).add(itemId));
    }
  }, [navigate]);

  const isRemoved = (id: string) => removedIds.has(id);

  if (isLoading) {
    return (
      <AppLayout title="Today">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-[13px]">Loading...</span>
        </div>
      </AppLayout>
    );
  }

  if (isError && !data) {
    return (
      <AppLayout title="Today">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <AlertTriangle className="h-4 w-4" /><span className="text-[13px]">No data available yet.</span>
        </div>
      </AppLayout>
    );
  }

  const actionIcon: Record<string, React.ReactNode> = {
    open_matter: <ArrowRight className="h-3 w-3" />,
    assign_owner: <UserPlus className="h-3 w-3" />,
    escalate: <Zap className="h-3 w-3" />,
    run_cleanup: <Archive className="h-3 w-3" />,
  };
  const actionLabel: Record<string, string> = {
    open_matter: "Open",
    assign_owner: "Assign",
    escalate: "Escalate",
    run_cleanup: "Cleanup",
  };

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* DECISION STACK */}
        {decisions.length > 0 && (
          <div className="border-b border-border/30 bg-card/50 px-4 py-3.5 shrink-0">
            <div className="flex items-center gap-2.5 mb-3">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">Decide Now</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/15 text-accent font-semibold tabular-nums">{decisions.length}</span>
            </div>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(decisions.length, 3)}, 1fr)` }}>
              {decisions.filter(d => !isRemoved((d.matter_id as string) || "")).map((d, i) => (
                <div
                  key={i}
                  onClick={() => setDrawerItem(decisionToItem(d))}
                  className="border border-border/30 rounded-lg px-4 py-3 bg-card hover:border-accent/30 hover:bg-card/80 transition-all duration-150 group cursor-pointer"
                >
                  <div className="text-[13px] font-medium text-foreground leading-snug">{d.title as string}</div>
                  <div className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{d.context as string}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-accent font-medium">{d.action as string}</span>
                    <div className="flex items-center gap-1">
                      {((d.actions as string[]) || []).map(a => (
                        <button
                          key={a}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (a === "open_matter" && d.matter_id) navigate(`/matters`);
                            if (a === "run_cleanup") navigate("/matters");
                          }}
                          className="px-2 py-1 text-[10px] font-medium rounded-md bg-secondary hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-all duration-100 flex items-center gap-1"
                        >
                          {actionIcon[a]}
                          {actionLabel[a]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THREE COLUMNS */}
        <div className="flex flex-1 overflow-hidden">
          {/* COLUMN 1 — Needs Your Attention */}
          <div className="flex-1 border-r border-border/20 overflow-y-auto">
            <div className="py-3">
              <SectionLabel count={attention.length + ceoOverdue.length} accent="destructive">Needs Your Attention</SectionLabel>
              <div className="space-y-px">
                {attention.filter(item => !isRemoved(item.id as string)).map((item, i) => (
                  <DenseRow
                    key={`attn-${i}`}
                    urgencyBorder={urgencyBorderMap[item.urgency as string]}
                    onClick={() => setDrawerItem(attentionToItem(item))}
                    selected={drawerItem?.id === (item.id as string)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <StatusDot status={item.type === "blocked" ? "blocked" : "at-risk"} />
                      <span className="text-[13px] truncate">{item.title as string}</span>
                      {(item.overdue as number) > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive shrink-0 font-semibold tabular-nums">{item.overdue as number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-muted-foreground">{(item.owner as string) || ""}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </DenseRow>
                ))}

                {/* CEO overdue */}
                {ceoOverdue.filter(c => !isRemoved(c.title as string)).length > 0 && (
                  <>
                    <div className="px-3 pt-3 pb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-destructive font-semibold">Your Overdue</span>
                    </div>
                    {ceoOverdue.filter(c => !isRemoved(c.title as string)).map((c, i) => (
                      <DenseRow
                        key={`ceo-${i}`}
                        urgencyBorder="critical"
                        onClick={() => setDrawerItem(commitmentToItem(c, "ceo_overdue"))}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-[11px] text-destructive shrink-0">◎</span>
                          <span className="text-[13px] truncate">{c.title as string}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground">{c.due_at as string}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{(c.matter_title as string)?.slice(0, 20)}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </DenseRow>
                    ))}
                  </>
                )}

                {/* Deadlines */}
                {deadlines.length > 0 && (
                  <>
                    <div className="px-3 pt-4 pb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-warning font-semibold">Due Soon</span>
                    </div>
                    {deadlines.map((d, i) => (
                      <DenseRow
                        key={`dl-${i}`}
                        onClick={() => setDrawerItem(commitmentToItem(d, "deadline"))}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Clock className="h-3 w-3 text-warning shrink-0" />
                          <span className="text-[13px] truncate">{d.title as string}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-warning">{d.due_at as string}</span>
                          <span className="text-[11px] text-muted-foreground">{d.owner_person_key as string}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </DenseRow>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2 — Waiting / Aging */}
          <div className="flex-1 border-r border-border/20 overflow-y-auto">
            <div className="py-3 space-y-5">
              <section>
                <SectionLabel count={waitingOverdue.length} accent="warning">Waiting On Others (Overdue)</SectionLabel>
                <div className="space-y-px">
                  {waitingOverdue.map((w, i) => (
                    <DenseRow
                      key={`wo-${i}`}
                      onClick={() => setDrawerItem(commitmentToItem(w, "waiting_overdue"))}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Clock className="h-3 w-3 text-destructive shrink-0" />
                        <span className="text-[13px] flex-1 min-w-0 truncate">{w.title as string}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-muted-foreground">{w.owner_person_key as string}</span>
                        <span className="text-[11px] text-destructive">{w.due_at as string}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <InlineAction icon={<Zap className="h-3 w-3" />} label="Nudge" accent onClick={e => e.stopPropagation()} />
                        </div>
                      </div>
                    </DenseRow>
                  ))}
                  {waitingOverdue.length === 0 && <div className="text-[13px] text-muted-foreground/60 px-3 py-2.5">Nothing overdue</div>}
                </div>
              </section>

              <section>
                <SectionLabel count={waitingAging.length}>Waiting / Aging</SectionLabel>
                <div className="space-y-px">
                  {waitingAging.map((w, i) => (
                    <DenseRow
                      key={`wa-${i}`}
                      onClick={() => setDrawerItem(commitmentToItem(w, "waiting_aging"))}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                        <span className="text-[13px] flex-1 min-w-0 truncate">{w.title as string}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-muted-foreground">{w.owner_person_key as string}</span>
                        {w.due_at && <span className="text-[11px] text-muted-foreground">{w.due_at as string}</span>}
                        <span className="text-[11px] text-muted-foreground">{(w.matter_title as string)?.slice(0, 20)}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </DenseRow>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* COLUMN 3 — Cleanup + System */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-3 space-y-5">
              <section>
                <SectionLabel>Cleanup Queue</SectionLabel>
                <div className="space-y-px">
                  <DenseRow onClick={() => setDrawerItem({
                    id: "cleanup-unassigned",
                    type: "system",
                    title: "Unassigned Threads",
                    status: "warning",
                    reasons: [`${cleanup.unassigned_threads || 0} threads have no matter assignment`, `${cleanup.unassigned_with_commits || 0} have open commitments`],
                    openCount: cleanup.unassigned_threads as number || 0,
                  })}>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Inbox className="h-3 w-3 text-warning shrink-0" />
                      <span className="text-[13px]">Unassigned threads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-warning tabular-nums">{cleanup.unassigned_threads as number || 0}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </DenseRow>

                  {(cleanup.unassigned_with_commits as number) > 0 && (
                    <DenseRow onClick={() => setDrawerItem({
                      id: "cleanup-commits",
                      type: "system",
                      title: "Unassigned with Commitments",
                      status: "warning",
                      reasons: ["These threads have open commitments but no matter assignment", "Commitments may be lost or untracked"],
                      openCount: cleanup.unassigned_with_commits as number,
                    })}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                        <span className="text-[13px]">...with open commitments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-warning tabular-nums">{cleanup.unassigned_with_commits as number}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </DenseRow>
                  )}

                  {noAccountable.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1.5">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">No Owner</span>
                      </div>
                      {noAccountable.map((m, i) => (
                        <DenseRow
                          key={`no-${i}`}
                          onClick={() => setDrawerItem(cleanupToItem(m))}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <UserPlus className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[13px] truncate">{m.title as string}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <InlineAction
                              icon={<UserPlus className="h-3 w-3" />}
                              label="Assign"
                              accent
                              onClick={e => { e.stopPropagation(); setDrawerItem(cleanupToItem(m)); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        </DenseRow>
                      ))}
                    </>
                  )}
                </div>
              </section>

              {/* Recently Resolved */}
              {recentlyResolved.length > 0 && (
                <section>
                  <SectionLabel count={recentlyResolved.length}>Recently Resolved</SectionLabel>
                  <div className="space-y-px">
                    {recentlyResolved.map((r, i) => (
                      <DenseRow key={`res-${i}`}>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Check className="h-3 w-3 text-success shrink-0" />
                          <span className="text-[13px] text-muted-foreground truncate">{r.canonical_title as string}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{r.closed_reason as string}</span>
                      </DenseRow>
                    ))}
                  </div>
                </section>
              )}

              {/* System Confidence */}
              <section>
                <SectionLabel>System Confidence</SectionLabel>
                <div className="mx-3 px-3 py-2.5 bg-secondary/40 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
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
                    <div key={row.label} className="flex items-center justify-between text-[13px]">
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

      {/* Resolution Drawer */}
      <ResolutionDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onAction={handleAction}
      />
    </AppLayout>
  );
}
