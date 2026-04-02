import { useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction, SectionLabel, StatusPill, DenseRow } from "@/components/shared";
import { workbenchQueue, allThreads, allMatters, type WorkbenchItem } from "@/lib/command-data";
import { showActionToast } from "@/components/ActionToast";
import {
  X, AlertTriangle, ChevronRight, FileText, Link2, Pencil,
  Plus, Archive, Merge, Split, Eye, Inbox, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

type PanelItem = WorkbenchItem | null;

export default function WorkbenchPage() {
  const [selectedItem, setSelectedItem] = useState<PanelItem>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [showHeavy, setShowHeavy] = useState(false);

  const queue = workbenchQueue.filter(i => !removedIds.has(i.id));

  // Group queue
  const attentionItems = queue.filter(i => i.badge === "attention");
  const reviewItems = queue.filter(i => i.badge === "review");
  const singletons = queue.filter(i => i.badge === "singleton");
  const titleItems = queue.filter(i => i.badge === "title");

  const handleResolve = useCallback((id: string, label: string) => {
    showActionToast("success", label);
    setRemovedIds(prev => new Set(prev).add(id));
    if (selectedItem?.id === id) setSelectedItem(null);
  }, [selectedItem]);

  return (
    <AppLayout title="Workbench">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Queue */}
        <div className={cn(
          "overflow-y-auto border-r border-border/30 flex flex-col",
          selectedItem ? "w-[380px] shrink-0" : "flex-1 max-w-2xl mx-auto"
        )}>
          <div className="px-4 py-4 space-y-4">
            {/* ATTENTION */}
            {attentionItems.length > 0 && (
              <section>
                <SectionLabel count={attentionItems.length} accent="destructive">Attention</SectionLabel>
                <div className="space-y-px">
                  {attentionItems.map(item => (
                    <QueueRow key={item.id} item={item} selected={selectedItem?.id === item.id} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </section>
            )}

            {/* REVIEW */}
            {reviewItems.length > 0 && (
              <section>
                <SectionLabel count={reviewItems.length} accent="warning">Review</SectionLabel>
                <div className="space-y-px">
                  {reviewItems.map(item => (
                    <QueueRow key={item.id} item={item} selected={selectedItem?.id === item.id} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </section>
            )}

            {/* SINGLETONS */}
            {singletons.length > 0 && (
              <section>
                <SectionLabel count={singletons.length}>Singleton Threads</SectionLabel>
                <div className="space-y-px">
                  {singletons.map(item => (
                    <QueueRow key={item.id} item={item} selected={selectedItem?.id === item.id} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </section>
            )}

            {/* TITLE UPGRADES */}
            {titleItems.length > 0 && (
              <section>
                <SectionLabel count={titleItems.length}>Title Upgrades</SectionLabel>
                <div className="space-y-px">
                  {titleItems.map(item => (
                    <QueueRow key={item.id} item={item} selected={selectedItem?.id === item.id} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </section>
            )}

            {queue.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                <div className="text-sm">Workbench is clear</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Review Panel */}
        {selectedItem && (
          <div className="flex-1 overflow-y-auto bg-card/30">
            <ReviewPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onResolve={handleResolve}
              showHeavy={showHeavy}
              setShowHeavy={setShowHeavy}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── Queue Row ──

function QueueRow({ item, selected, onClick }: { item: WorkbenchItem; selected: boolean; onClick: () => void }) {
  const badgeColors: Record<string, string> = {
    attention: "bg-destructive/15 text-destructive",
    review: "bg-warning/15 text-warning",
    singleton: "bg-accent/10 text-accent",
    title: "bg-secondary text-muted-foreground",
  };

  return (
    <DenseRow selected={selected} onClick={onClick} urgencyBorder={item.badge === "attention" ? "critical" : item.badge === "review" ? "high" : undefined}>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase", badgeColors[item.badge])}>
          {item.badge === "singleton" ? "S" : item.badge === "title" ? "T" : item.badge[0].toUpperCase()}
        </span>
        <span className="text-sm truncate">{item.title}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {item.thread_count && (
          <span className="text-xs text-muted-foreground tabular-nums">{item.thread_count} threads</span>
        )}
        {item.coherence && (
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
            item.coherence === "high" ? "text-success bg-success/10" :
            item.coherence === "medium" ? "text-warning bg-warning/10" :
            "text-destructive bg-destructive/10"
          )}>{item.coherence}</span>
        )}
        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
      </div>
    </DenseRow>
  );
}

// ── Review Panel ──

function ReviewPanel({ item, onClose, onResolve, showHeavy, setShowHeavy }: {
  item: WorkbenchItem;
  onClose: () => void;
  onResolve: (id: string, label: string) => void;
  showHeavy: boolean;
  setShowHeavy: (v: boolean) => void;
}) {
  const relatedThreads = allThreads.filter(t => t.matter_id === item.matter_id);
  const matter = allMatters.find(m => m.id === item.matter_id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/30 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold">{item.title}</div>
            {item.coherence && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">Coherence:</span>
                <StatusPill status={item.coherence === "high" ? "active" : item.coherence === "medium" ? "warning" : "error"} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        {item.why_joined && (
          <div className="mt-3 text-sm text-foreground/70 leading-relaxed bg-secondary/30 rounded-md px-3 py-2">
            {item.why_joined}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Threads */}
        {(item.type === "attention_matter" || item.type === "review_matter") && (
          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Threads</div>
            <div className="space-y-1">
              {relatedThreads.map(t => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary/40 group">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{t.title}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                      t.confidence === "high" ? "text-success bg-success/10" :
                      t.confidence === "medium" ? "text-warning bg-warning/10" :
                      "text-destructive bg-destructive/10"
                    )}>{t.confidence}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <InlineAction icon={<Link2 className="h-3 w-3" />} label="Reassign" onClick={() => showActionToast("info", "Reassigning thread...")} />
                    <InlineAction icon={<X className="h-3 w-3" />} label="Detach" onClick={() => showActionToast("info", "Detaching thread...")} />
                  </div>
                </div>
              ))}
              {relatedThreads.length === 0 && (
                <div className="text-sm text-muted-foreground px-3 py-2">No threads found</div>
              )}
            </div>
          </section>
        )}

        {/* Secondary candidates */}
        {item.secondary_candidates && item.secondary_candidates.length > 0 && (
          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Secondary Candidates</div>
            {item.secondary_candidates.map((c, i) => (
              <div key={i} className="text-sm text-muted-foreground px-3 py-1.5 rounded-md bg-warning/5 border border-warning/20">
                <AlertTriangle className="h-3 w-3 text-warning inline mr-1.5" />
                Could also belong to: <span className="font-medium text-foreground">{c}</span>
              </div>
            ))}
          </section>
        )}

        {/* Singleton actions */}
        {item.type === "singleton_thread" && (
          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Suggested Action</div>
            {item.suggested_matter ? (
              <div className="px-3 py-2.5 rounded-md border border-border/40 bg-secondary/20">
                <div className="text-sm">Attach to: <span className="font-medium text-foreground">{item.suggested_matter}</span></div>
                <div className="flex gap-2 mt-2">
                  <InlineAction icon={<Link2 className="h-3 w-3" />} label="Attach" accent onClick={() => onResolve(item.id, `Thread attached to "${item.suggested_matter}"`)} />
                  <InlineAction icon={<Plus className="h-3 w-3" />} label="New matter" onClick={() => showActionToast("info", "Creating new matter...")} />
                </div>
              </div>
            ) : (
              <div className="px-3 py-2.5 rounded-md border border-border/40 bg-secondary/20">
                <div className="text-sm text-muted-foreground">No suggested matter — create or defer</div>
                <div className="flex gap-2 mt-2">
                  <InlineAction icon={<Plus className="h-3 w-3" />} label="Create matter" accent onClick={() => showActionToast("info", "Creating new matter...")} />
                  <InlineAction label="Mark as OK" onClick={() => onResolve(item.id, "Thread marked as OK")} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Title upgrade */}
        {item.type === "title_upgrade" && (
          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Title Upgrade</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current:</span>
                <span className="line-through text-muted-foreground">{item.current_title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Suggested:</span>
                <span className="font-medium text-foreground">{item.suggested_title}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <InlineAction icon={<Pencil className="h-3 w-3" />} label="Accept" accent onClick={() => onResolve(item.id, `Title updated to "${item.suggested_title}"`)} />
                <InlineAction label="Reject" onClick={() => onResolve(item.id, "Title upgrade rejected")} />
              </div>
            </div>
          </section>
        )}

        {/* Matter details */}
        {matter && (item.type === "attention_matter" || item.type === "review_matter") && (
          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Matter Info</div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span className={matter.owner ? "font-mono" : "text-destructive"}>{matter.owner || "Unassigned"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Goal</span><span className="truncate ml-4 text-right">{matter.goal_name || "No goal"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Commitments</span><span className="font-mono tabular-nums">{matter.commitment_count}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Overdue</span><span className={cn("font-mono tabular-nums", matter.overdue_count > 0 ? "text-destructive" : "")}>{matter.overdue_count}</span></div>
            </div>
          </section>
        )}
      </div>

      {/* Action Zone */}
      <div className="px-5 py-4 border-t border-border/30 shrink-0 space-y-3">
        {/* Standard actions */}
        {(item.type === "attention_matter" || item.type === "review_matter") && (
          <div className="flex flex-wrap gap-2">
            <InlineAction icon={<Pencil className="h-3 w-3" />} label="Rename" onClick={() => showActionToast("info", "Editing name...")} />
            <InlineAction icon={<Eye className="h-3 w-3" />} label="Set owner" accent onClick={() => showActionToast("info", "Opening owner picker...")} />
            <InlineAction icon={<Tag className="h-3 w-3" />} label="Set status" onClick={() => showActionToast("info", "Opening status picker...")} />
          </div>
        )}

        {/* Heavy actions */}
        <button
          onClick={() => setShowHeavy(!showHeavy)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showHeavy ? "Hide" : "More actions…"}
        </button>
        {showHeavy && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/30">
            <InlineAction icon={<Merge className="h-3 w-3" />} label="Merge matters" destructive onClick={() => showActionToast("info", "Opening merge preview...")} />
            <InlineAction icon={<Split className="h-3 w-3" />} label="Split thread" destructive onClick={() => showActionToast("info", "Opening split preview...")} />
            <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive" destructive onClick={() => onResolve(item.id, `"${item.title}" archived`)} />
          </div>
        )}
      </div>
    </div>
  );
}
