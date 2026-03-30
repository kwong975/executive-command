import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { goals, matters, agents, businessUnits } from "@/data/mockData";
import { ChevronRight, Link2, Plus, UserPlus, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StrategyPage() {
  const [expandedBU, setExpandedBU] = useState<string | null>(businessUnits[0]);
  const navigate = useNavigate();

  return (
    <AppLayout title="Strategy">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 py-3">
          {businessUnits.map(bu => {
            const buGoals = goals.filter(g => g.businessUnit === bu);
            const ltGoals = buGoals.filter(g => g.type === "long-term");
            const annualGoals = buGoals.filter(g => g.type === "annual");
            const buMatters = matters.filter(m => m.businessUnit === bu);
            const blockedCount = buMatters.filter(m => m.status === "blocked").length;
            const atRiskCount = buMatters.filter(m => m.status === "at-risk").length;
            const unlinked = buMatters.filter(m => !buGoals.some(g => g.linkedMatterIds.includes(m.id)));
            const gapsCount = buGoals.filter(g => g.linkedMatterIds.length === 0).length;
            const isOpen = expandedBU === bu;

            return (
              <div key={bu} className="mb-0.5">
                <button
                  onClick={() => setExpandedBU(isOpen ? null : bu)}
                  className="w-full flex items-center justify-between py-1.5 px-1 text-left hover:bg-secondary/30 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    <span className="text-[12px] font-semibold font-mono">{bu}</span>
                    <span className="text-[9px] text-muted-foreground">{buGoals.length}g · {buMatters.length}m</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {blockedCount > 0 && <span className="text-[9px] px-1 py-px rounded bg-destructive/15 text-destructive">{blockedCount} blocked</span>}
                    {atRiskCount > 0 && <span className="text-[9px] px-1 py-px rounded bg-warning/15 text-warning">{atRiskCount} at risk</span>}
                    {gapsCount > 0 && <span className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground">{gapsCount} gaps</span>}
                  </div>
                </button>

                {isOpen && (
                  <div className="pl-5 pb-2 space-y-2">
                    {/* Long-term */}
                    {ltGoals.length > 0 && (
                      <div>
                        <SectionLabel>Long-Term</SectionLabel>
                        {ltGoals.map(g => <GoalRow key={g.id} goal={g} onNavigate={() => navigate("/matters")} />)}
                      </div>
                    )}

                    {/* Annual */}
                    {annualGoals.length > 0 && (
                      <div>
                        <SectionLabel>Annual Goals</SectionLabel>
                        {annualGoals.map(g => <GoalRow key={g.id} goal={g} onNavigate={() => navigate("/matters")} />)}
                      </div>
                    )}

                    {/* Unlinked matters */}
                    {unlinked.length > 0 && (
                      <div>
                        <SectionLabel accent="warning">⚠ Unlinked Matters</SectionLabel>
                        {unlinked.map(m => (
                          <div key={m.id} className="flex items-center justify-between py-0.5 group">
                            <div className="flex items-center gap-1.5">
                              <div className={`h-1.5 w-1.5 rounded-full ${m.status === "healthy" ? "bg-success" : m.status === "blocked" ? "bg-destructive" : m.status === "at-risk" ? "bg-warning" : "bg-muted-foreground"}`} />
                              <span className="text-[11px]">{m.title}</span>
                              <span className="text-[9px] text-muted-foreground">{m.owner}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent/25 flex items-center gap-0.5">
                              <Link2 className="h-2 w-2" />Link
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BU Actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-1">
                        <Plus className="h-2.5 w-2.5" />Create matter
                      </button>
                      <button className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5" />Escalate
                      </button>
                    </div>
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

function GoalRow({ goal, onNavigate }: { goal: typeof goals[0]; onNavigate: () => void }) {
  const linked = matters.filter(m => goal.linkedMatterIds.includes(m.id));
  const hasBlocked = linked.some(m => m.status === "blocked");
  const noExecution = linked.length === 0;

  return (
    <div className="py-1 border-b border-border/15 last:border-0">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">{goal.title}</span>
          {hasBlocked && <AlertTriangle className="h-2.5 w-2.5 text-destructive" />}
          {noExecution && <span className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground">no execution</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-muted-foreground">{goal.progress}%</span>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            <Plus className="h-2 w-2" />Matter
          </button>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
            <UserPlus className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
      <div className="mt-0.5 h-[2px] bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
      </div>
      {linked.length > 0 && linked.map(m => (
        <div key={m.id} className="flex items-center justify-between py-0.5 group/matter">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Link2 className="h-2.5 w-2.5" />
            <span>{m.title}</span>
            <span className="text-[9px] font-mono">{m.owner}</span>
            <span className={`text-[9px] px-1 py-px rounded ${
              m.status === "healthy" ? "bg-success/10 text-success" :
              m.status === "at-risk" ? "bg-warning/10 text-warning" :
              m.status === "blocked" ? "bg-destructive/10 text-destructive" :
              "bg-muted text-muted-foreground"
            }`}>{m.status}</span>
          </div>
          <button onClick={onNavigate} className="opacity-0 group-hover/matter:opacity-100 transition-opacity">
            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${
      accent === "warning" ? "text-warning" : "text-muted-foreground"
    }`}>
      {children}
    </div>
  );
}
