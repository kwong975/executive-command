import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction, TabBar, DenseRow } from "@/components/shared";
import { allCommitments, personLoads, type CommitmentItem } from "@/lib/command-data";
import { showActionToast } from "@/components/ActionToast";
import {
  AlertTriangle, UserPlus, Clock, Zap, CheckCircle2,
  ArrowDown, RefreshCw, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "active", label: "Active" },
  { id: "overdue", label: "Overdue" },
  { id: "escalated", label: "Escalated" },
  { id: "done", label: "Done" },
];

export default function ExecutionPage() {
  const [activeTab, setActiveTab] = useState("overdue");
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<CommitmentItem | null>(null);

  const filtered = useMemo(() => {
    let items = allCommitments.filter(c => !removedIds.has(c.id));
    if (activeTab === "active") items = items.filter(c => c.status === "open");
    else if (activeTab === "overdue") items = items.filter(c => c.status === "overdue");
    else if (activeTab === "escalated") items = items.filter(c => c.status === "escalated");
    else if (activeTab === "done") items = items.filter(c => c.status === "done");
    if (ownerFilter) items = items.filter(c => c.owner === ownerFilter);
    return items;
  }, [activeTab, ownerFilter, removedIds]);

  const tabCounts = useMemo(() => {
    const base = allCommitments.filter(c => !removedIds.has(c.id));
    return {
      active: base.filter(c => c.status === "open").length,
      overdue: base.filter(c => c.status === "overdue").length,
      escalated: base.filter(c => c.status === "escalated").length,
      done: base.filter(c => c.status === "done").length,
    };
  }, [removedIds]);

  const tabs = TABS.map(t => ({
    ...t,
    count: tabCounts[t.id as keyof typeof tabCounts],
    alert: t.id === "overdue" && tabCounts.overdue > 0,
  }));

  const handleAction = (action: string, item: CommitmentItem) => {
    if (action === "resolve" || action === "drop") {
      setPreviewItem(null);
      setRemovedIds(prev => new Set(prev).add(item.id));
      showActionToast("success", action === "resolve" ? `"${item.title}" resolved` : `"${item.title}" dropped`);
    } else if (action === "escalate") {
      showActionToast("warning", `"${item.title}" escalated`);
    } else if (action === "reassign") {
      showActionToast("info", `Reassigning "${item.title}"...`);
    } else if (action === "update_date") {
      showActionToast("info", `Updating due date for "${item.title}"...`);
    } else if (action === "accept_todoist") {
      showActionToast("success", `Accepted Todoist status for "${item.title}"`);
    }
  };

  return (
    <AppLayout title="Execution">
      <div className="flex flex-col flex-1 overflow-hidden">
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="flex flex-1 overflow-hidden">
          {/* Main list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3">
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-12">
                  No commitments in this view
                  {ownerFilter && <span> for <span className="font-mono">{ownerFilter}</span></span>}
                </div>
              ) : (
                <div className="space-y-px">
                  {filtered.map(item => (
                    <CommitmentRow
                      key={item.id}
                      item={item}
                      onAction={handleAction}
                      onPreview={() => setPreviewItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ownership Sidebar */}
          <div className="w-52 border-l border-border/30 overflow-y-auto shrink-0">
            <div className="px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">Ownership</div>
              {personLoads.map(p => (
                <button
                  key={p.person_key}
                  onClick={() => setOwnerFilter(ownerFilter === p.person_key ? null : p.person_key)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                    ownerFilter === p.person_key
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{p.display_name}</span>
                    {p.overloaded && <AlertTriangle className="h-3 w-3 text-warning" />}
                  </div>
                  <span className={cn(
                    "text-xs tabular-nums font-mono",
                    p.overloaded ? "text-warning font-semibold" : ""
                  )}>{p.commitment_count}</span>
                </button>
              ))}
              {ownerFilter && (
                <button
                  onClick={() => setOwnerFilter(null)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground mt-2 px-2"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview-required action panel */}
        {previewItem && (
          <div className="border-t border-border/30 px-5 py-3 bg-card/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{previewItem.title}</span>
                <span className="text-xs text-muted-foreground font-mono">{previewItem.owner_display}</span>
              </div>
              <div className="flex items-center gap-2">
                <InlineAction
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  label="Resolve"
                  accent
                  onClick={() => handleAction("resolve", previewItem)}
                />
                <InlineAction
                  icon={<ArrowDown className="h-3 w-3" />}
                  label="Drop"
                  destructive
                  onClick={() => handleAction("drop", previewItem)}
                />
                <button onClick={() => setPreviewItem(null)} className="p-1 rounded hover:bg-secondary">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── Commitment Row ──

function CommitmentRow({ item, onAction, onPreview }: {
  item: CommitmentItem;
  onAction: (action: string, item: CommitmentItem) => void;
  onPreview: () => void;
}) {
  const statusMap: Record<string, string> = {
    open: "active",
    overdue: "overdue",
    escalated: "error",
    done: "done",
  };

  return (
    <DenseRow
      urgencyBorder={item.status === "overdue" ? "critical" : item.status === "escalated" ? "critical" : undefined}
      onClick={onPreview}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <StatusDot status={statusMap[item.status] || "active"} />
        <div className="min-w-0 flex-1">
          <div className="text-sm truncate">{item.title}</div>
          <div className="text-xs text-muted-foreground truncate">{item.matter_title}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Owner */}
        <span className="text-xs font-mono text-muted-foreground w-20 text-right">{item.owner_display}</span>

        {/* Due */}
        <span className={cn(
          "text-xs tabular-nums w-20 text-right",
          item.status === "overdue" ? "text-destructive font-semibold" : "text-muted-foreground"
        )}>{item.due_date}</span>

        {/* Sync badge */}
        {item.sync_status === "drift" && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-medium" title="Todoist: done, System: open">
            <RefreshCw className="h-2.5 w-2.5 inline mr-0.5" />drift
          </span>
        )}

        {/* Escalation */}
        {item.escalation && (
          <span className="text-destructive text-xs font-bold">!</span>
        )}

        {/* Inline actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <InlineAction
            icon={<Clock className="h-3 w-3" />}
            label="Date"
            onClick={(e) => { e?.stopPropagation(); onAction("update_date", item); }}
          />
          <InlineAction
            icon={<UserPlus className="h-3 w-3" />}
            label="Reassign"
            onClick={(e) => { e?.stopPropagation(); onAction("reassign", item); }}
          />
          {item.status !== "escalated" && (
            <InlineAction
              icon={<Zap className="h-3 w-3" />}
              label="Escalate"
              destructive
              onClick={(e) => { e?.stopPropagation(); onAction("escalate", item); }}
            />
          )}
        </div>
      </div>
    </DenseRow>
  );
}
