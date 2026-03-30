import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { goals, matters, businessUnits, type BusinessUnit } from "@/data/mockData";
import { Link2, ChevronRight } from "lucide-react";

export default function StrategyPage() {
  const [expandedBU, setExpandedBU] = useState<string | null>(businessUnits[0]);

  return (
    <AppLayout title="Strategy">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {businessUnits.map((bu) => {
            const buGoals = goals.filter(g => g.businessUnit === bu);
            const ltGoals = buGoals.filter(g => g.type === "long-term");
            const annualGoals = buGoals.filter(g => g.type === "annual");
            const buMatters = matters.filter(m => m.businessUnit === bu);
            const isOpen = expandedBU === bu;

            return (
              <div key={bu} className="mb-1">
                <button
                  onClick={() => setExpandedBU(isOpen ? null : bu)}
                  className="w-full flex items-center justify-between py-2 px-1 text-left hover:bg-secondary/30 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    <span className="text-[12px] font-semibold font-mono">{bu}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {buGoals.length} goals · {buMatters.length} matters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {buMatters.some(m => m.status === "blocked") && (
                      <span className="text-[9px] px-1 py-px rounded bg-destructive/10 text-destructive">blocked</span>
                    )}
                    {buMatters.some(m => m.status === "at-risk") && (
                      <span className="text-[9px] px-1 py-px rounded bg-warning/10 text-warning">at risk</span>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="pl-5 pb-3 space-y-3">
                    {/* Long-term */}
                    {ltGoals.length > 0 && (
                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Long-Term</div>
                        {ltGoals.map((g) => <GoalRow key={g.id} goal={g} />)}
                      </div>
                    )}

                    {/* Annual */}
                    {annualGoals.length > 0 && (
                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Annual Goals</div>
                        {annualGoals.map((g) => <GoalRow key={g.id} goal={g} />)}
                      </div>
                    )}

                    {/* Unlinked matters */}
                    {buMatters.filter(m => !buGoals.some(g => g.linkedMatterIds.includes(m.id))).length > 0 && (
                      <div>
                        <div className="text-[10px] font-medium text-warning uppercase tracking-wider mb-1">⚠ Unlinked Matters</div>
                        {buMatters.filter(m => !buGoals.some(g => g.linkedMatterIds.includes(m.id))).map(m => (
                          <div key={m.id} className="flex items-center gap-2 py-0.5 text-[11px]">
                            <div className={`h-1.5 w-1.5 rounded-full ${m.status === "healthy" ? "bg-success" : m.status === "blocked" ? "bg-destructive" : m.status === "at-risk" ? "bg-warning" : "bg-muted-foreground"}`} />
                            <span>{m.title}</span>
                            <span className="text-[10px] text-muted-foreground">— not linked to any goal</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </AppLayout>
  );
}

function GoalRow({ goal }: { goal: typeof goals[0] }) {
  const linked = matters.filter(m => goal.linkedMatterIds.includes(m.id));
  return (
    <div className="py-1.5 border-b border-border/20 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px]">{goal.title}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{goal.progress}%</span>
      </div>
      <div className="mt-1 h-[3px] bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
      </div>
      {linked.length > 0 && (
        <div className="mt-1">
          {linked.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Link2 className="h-2.5 w-2.5" />
              <span>{m.title}</span>
              <span className={`text-[9px] px-1 py-px rounded ${
                m.status === "healthy" ? "bg-success/10 text-success" :
                m.status === "at-risk" ? "bg-warning/10 text-warning" :
                m.status === "blocked" ? "bg-destructive/10 text-destructive" :
                "bg-muted text-muted-foreground"
              }`}>{m.status}</span>
            </div>
          ))}
        </div>
      )}
      {linked.length === 0 && <div className="text-[10px] text-muted-foreground/40 mt-1">No linked matters</div>}
    </div>
  );
}
