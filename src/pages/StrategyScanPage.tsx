import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction } from "@/components/shared";
import { strategyScanCards, strategyScanGoals, type BUGoalDetail } from "@/lib/command-data";
import { useNavigate } from "react-router-dom";
import {
  Target, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StrategyScanPage() {
  const navigate = useNavigate();
  const [expandedBU, setExpandedBU] = useState<string | null>(null);

  return (
    <AppLayout title="Strategy Scan">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-5">
          {/* BU Card Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {strategyScanCards.map(card => {
              const isExpanded = expandedBU === card.bu_code;
              return (
                <button
                  key={card.bu_code}
                  onClick={() => setExpandedBU(isExpanded ? null : card.bu_code)}
                  className={cn(
                    "text-left border rounded-lg px-4 py-3 transition-all",
                    isExpanded ? "border-accent bg-card shadow-sm" : "border-border/40 hover:border-border hover:bg-secondary/20"
                  )}
                >
                  <div className="text-lg font-semibold tabular-nums">{card.goal_count}</div>
                  <div className="text-sm font-medium mt-0.5">{card.bu_label}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{card.linked_matters} linked</span>
                    <CoverageDot coverage={card.coverage} />
                    {card.unlinked_count > 0 && (
                      <span className="text-warning">{card.unlinked_count} unlinked</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded BU */}
          {expandedBU && (
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-secondary/20 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold">{strategyScanCards.find(c => c.bu_code === expandedBU)?.bu_label} Goals</span>
                </div>
                <InlineAction
                  label="Fix gaps"
                  accent
                  onClick={() => navigate("/goal-linking")}
                />
              </div>
              <div className="divide-y divide-border/20">
                {(strategyScanGoals[expandedBU] || []).map(goal => (
                  <GoalRow key={goal.id} goal={goal} onFix={() => navigate("/goal-linking")} />
                ))}
              </div>
            </div>
          )}

          {/* No mutations message */}
          <div className="text-xs text-muted-foreground text-center mt-6">
            Strategy Scan is read-only. Use <button onClick={() => navigate("/goal-linking")} className="text-accent hover:underline">Goal Linking</button> to fix gaps.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function GoalRow({ goal, onFix }: { goal: BUGoalDetail; onFix: () => void }) {
  const health = goal.blocked > 0 ? "blocked" : goal.at_risk > 0 ? "at-risk" : goal.linked_matters > 0 ? "active" : "idle";
  return (
    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/20 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <StatusDot status={health} />
        <div className="min-w-0">
          <div className="text-sm truncate">{goal.title}</div>
          <div className="text-xs text-muted-foreground">{goal.owner}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-center">
          <div className={cn("text-sm font-semibold tabular-nums", goal.linked_matters === 0 ? "text-warning" : "")}>{goal.linked_matters}</div>
          <div className="text-[10px] text-muted-foreground">matters</div>
        </div>
        {goal.blocked > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold tabular-nums text-destructive">{goal.blocked}</div>
            <div className="text-[10px] text-muted-foreground">blocked</div>
          </div>
        )}
        {goal.linked_matters === 0 && (
          <InlineAction
            label="Fix"
            accent
            onClick={onFix}
            className="opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  );
}

function CoverageDot({ coverage }: { coverage: "strong" | "emerging" | "weak" }) {
  const color = coverage === "strong" ? "bg-success" : coverage === "emerging" ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-1">
      <div className={cn("h-2 w-2 rounded-full", color)} />
      <span className="text-[10px]">{coverage}</span>
    </div>
  );
}
