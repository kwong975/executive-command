import { useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction, SectionLabel } from "@/components/shared";
import { attentionQueue, type AttentionQueueItem } from "@/lib/command-data";
import { showActionToast } from "@/components/ActionToast";
import {
  AlertTriangle, ChevronDown, ChevronRight, UserPlus, Clock, Zap,
  CheckCircle2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodayPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const queue = attentionQueue.filter(i => !removedIds.has(i.id));

  const handleAction = useCallback((action: string, item: AttentionQueueItem) => {
    const labels: Record<string, string> = {
      acknowledge: `"${item.title}" acknowledged`,
      defer: `"${item.title}" deferred until tomorrow`,
      escalate: `"${item.title}" escalated`,
    };
    showActionToast("success", labels[action] || `Action completed`);
    if (action === "acknowledge" || action === "defer") {
      setRemovedIds(prev => new Set(prev).add(item.id));
      if (expandedId === item.id) setExpandedId(null);
    }
  }, [expandedId]);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  // Empty state
  if (queue.length === 0) {
    return (
      <AppLayout title="Today">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <div className="text-lg font-semibold text-foreground">All clear</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{attentionQueue.length} matters reviewed</div>
              <div>No items need attention right now</div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Today">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-5">
          {/* Header summary */}
          <div className="text-sm text-muted-foreground mb-5">
            {queue.length} item{queue.length !== 1 ? "s" : ""} need your attention
          </div>

          {/* Attention Queue */}
          <div className="space-y-px">
            {queue.map(item => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "border border-border/40 rounded-lg transition-all duration-150",
                    isExpanded ? "bg-card shadow-sm" : "hover:bg-secondary/30",
                    item.health === "blocked" && "border-l-2 border-l-destructive",
                    item.health === "at-risk" && "border-l-2 border-l-warning",
                    "mb-2"
                  )}
                >
                  {/* Collapsed view */}
                  <button
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <StatusDot status={item.health} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.key_metric}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground/80 max-w-[200px] truncate hidden md:block">
                        {item.why}
                      </span>
                      {isExpanded
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </div>
                  </button>

                  {/* Expanded view */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-3 animate-in fade-in duration-150">
                      {/* Why */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          <span className="text-xs font-semibold uppercase tracking-widest text-warning">Why this is here</span>
                        </div>
                        <ul className="space-y-1 ml-4">
                          {item.why_expanded.map((r, i) => (
                            <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                              <span className="text-muted-foreground/50 mt-0.5 shrink-0">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Top commitments */}
                      {item.top_commitments.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Top Commitments</div>
                          <div className="space-y-1">
                            {item.top_commitments.map((c, i) => (
                              <div key={i} className="flex items-center justify-between text-sm py-1 px-2 rounded-md hover:bg-secondary/30">
                                <div className="flex items-center gap-2 min-w-0">
                                  <StatusDot status={c.status} />
                                  <span className="truncate">{c.title}</span>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground shrink-0">{c.owner}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent activity */}
                      <div className="text-xs text-muted-foreground">{item.recent_activity}</div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <InlineAction
                          icon={<CheckCircle2 className="h-3 w-3" />}
                          label="Acknowledge"
                          accent
                          onClick={() => handleAction("acknowledge", item)}
                        />
                        <InlineAction
                          icon={<Clock className="h-3 w-3" />}
                          label="Defer"
                          onClick={() => handleAction("defer", item)}
                        />
                        <InlineAction
                          icon={<Zap className="h-3 w-3" />}
                          label="Escalate"
                          destructive
                          onClick={() => handleAction("escalate", item)}
                        />

                        <div className="flex-1" />

                        {/* Drill-down */}
                        <InlineAction
                          icon={<ArrowRight className="h-3 w-3" />}
                          label="Review"
                          onClick={() => showActionToast("info", `Opening ${item.title} in Workbench`)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
