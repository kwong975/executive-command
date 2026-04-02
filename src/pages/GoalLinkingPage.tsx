import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction, DenseRow } from "@/components/shared";
import { goalLinkingQueue, type GoalLinkItem } from "@/lib/command-data";
import { showActionToast } from "@/components/ActionToast";
import {
  Link2, Check, AlertTriangle, ChevronDown, X, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoalLinkingPage() {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = goalLinkingQueue.filter(i => !removedIds.has(i.id));
  const highConfidence = queue.filter(i => i.confidence === "high");

  const resolve = (id: string, msg: string) => {
    setRemovedIds(prev => new Set(prev).add(id));
    showActionToast("success", msg);
    if (expandedId === id) setExpandedId(null);
  };

  const batchAcceptHigh = () => {
    highConfidence.forEach(i => {
      setRemovedIds(prev => new Set(prev).add(i.id));
    });
    showActionToast("success", `Accepted ${highConfidence.length} high-confidence links`);
  };

  if (queue.length === 0) {
    return (
      <AppLayout title="Goal Linking">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Check className="h-8 w-8 text-success mx-auto" />
            <div className="text-lg font-semibold">All linked</div>
            <div className="text-sm text-muted-foreground">No matters need strategy linking</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Goal Linking">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm text-muted-foreground">{queue.length} matter{queue.length !== 1 ? "s" : ""} need linking</div>
            {highConfidence.length > 0 && (
              <InlineAction
                icon={<Zap className="h-3 w-3" />}
                label={`Accept all HIGH (${highConfidence.length})`}
                accent
                onClick={batchAcceptHigh}
              />
            )}
          </div>

          {/* Queue */}
          <div className="space-y-2">
            {queue.map(item => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className={cn(
                  "border border-border/40 rounded-lg transition-all",
                  item.warning && "border-l-2 border-l-warning"
                )}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase",
                      item.confidence === "high" ? "bg-success/15 text-success" :
                      item.confidence === "medium" ? "bg-warning/15 text-warning" :
                      "bg-destructive/15 text-destructive"
                    )}>{item.confidence}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.matter_title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.current_goal ? `Current: ${item.current_goal}` : "No goal"} → <span className="text-foreground">{item.recommended_goal}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">{item.margin}% margin</span>
                      {item.warning && <AlertTriangle className="h-3 w-3 text-warning" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3 animate-in fade-in duration-150">
                      {item.warning && (
                        <div className="text-sm text-warning bg-warning/5 px-3 py-2 rounded-md">
                          <AlertTriangle className="h-3 w-3 inline mr-1.5" />{item.warning}
                        </div>
                      )}

                      {item.alternatives.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Alternatives</div>
                          {item.alternatives.map((alt, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-secondary/30 rounded-md">
                              <span className="text-sm">{alt.goal}</span>
                              <InlineAction
                                label="Choose"
                                onClick={() => resolve(item.id, `"${item.matter_title}" linked to "${alt.goal}"`)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <InlineAction
                          icon={<Link2 className="h-3 w-3" />}
                          label="Accept recommendation"
                          accent
                          onClick={() => resolve(item.id, `"${item.matter_title}" linked to "${item.recommended_goal}"`)}
                        />
                        <InlineAction
                          label="Leave unlinked"
                          onClick={() => resolve(item.id, `"${item.matter_title}" left unlinked`)}
                        />
                        <InlineAction
                          label="Feedback"
                          onClick={() => showActionToast("info", "Opening feedback...")}
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
