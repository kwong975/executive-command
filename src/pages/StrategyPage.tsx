import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { goals, matters, agents, businessUnits } from "@/data/mockData";
import {
  ChevronRight, Link2, Plus, UserPlus, AlertTriangle,
  ArrowRight, Zap, X, GitMerge, Archive
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StrategyPage() {
  const [activeBU, setActiveBU] = useState<string>(businessUnits[0]);
  const navigate = useNavigate();

  const buGoals = goals.filter(g => g.businessUnit === activeBU);
  const ltGoals = buGoals.filter(g => g.type === "long-term");
  const annualGoals = buGoals.filter(g => g.type === "annual");
  const buMatters = matters.filter(m => m.businessUnit === activeBU);
  const linkedMatterIds = new Set(buGoals.flatMap(g => g.linkedMatterIds));
  const unlinkedMatters = buMatters.filter(m => !linkedMatterIds.has(m.id));
  const gapsCount = buGoals.filter(g => g.linkedMatterIds.length === 0).length;
  const blockedCount = buMatters.filter(m => m.status === "blocked").length;

  return (
    <AppLayout title="Strategy">
      <main className="flex-1 overflow-y-auto">
        {/* BU Tabs */}
        <div className="border-b border-border/30 px-3 flex items-center gap-0.5">
          {businessUnits.map(bu => {
            const buBlocked = matters.filter(m => m.businessUnit === bu && m.status === "blocked").length;
            return (
              <button
                key={bu}
                onClick={() => setActiveBU(bu)}
                className={`px-3 py-1.5 text-[11px] font-mono font-medium border-b-2 transition-colors ${
                  activeBU === bu ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {bu}
                {buBlocked > 0 && <span className="ml-1 text-[8px] text-destructive">{buBlocked}</span>}
              </button>
            );
          })}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground py-1">
            {blockedCount > 0 && <span className="px-1 py-px rounded bg-destructive/15 text-destructive">{blockedCount} blocked</span>}
            {gapsCount > 0 && <span className="px-1 py-px rounded bg-muted text-muted-foreground">{gapsCount} gaps</span>}
            <span>{buMatters.length} matters</span>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Long-term Strategy */}
          <div className="flex-1 border-r border-border/30 overflow-y-auto px-3 py-2">
            <ColLabel>Long-Term Strategy</ColLabel>
            {ltGoals.length > 0 ? ltGoals.map(g => (
              <GoalBlock key={g.id} goal={g} onNavigate={() => navigate("/matters")} />
            )) : (
              <div className="text-[10px] text-muted-foreground py-2">No long-term goals defined</div>
            )}
          </div>

          {/* Annual Goals */}
          <div className="flex-1 border-r border-border/30 overflow-y-auto px-3 py-2">
            <ColLabel>Annual Goals</ColLabel>
            {annualGoals.length > 0 ? annualGoals.map(g => (
              <GoalBlock key={g.id} goal={g} onNavigate={() => navigate("/matters")} />
            )) : (
              <div className="text-[10px] text-muted-foreground py-2">No annual goals defined</div>
            )}
          </div>

          {/* Execution / Matters */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <ColLabel>Execution — Matters</ColLabel>
            {buMatters.map(m => (
              <div key={m.id} className="flex items-center justify-between py-1 border-b border-border/15 last:border-0 group">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    m.status === "healthy" ? "bg-success" : m.status === "blocked" ? "bg-destructive" : m.status === "at-risk" ? "bg-warning" : "bg-muted-foreground"
                  }`} />
                  <span className="text-[11px] truncate">{m.title}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{m.owner}</span>
                  {m.overdueCount > 0 && <span className="text-[8px] px-1 py-px rounded bg-destructive/15 text-destructive">{m.overdueCount}</span>}
                </div>
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate("/matters")} className="p-0.5 rounded hover:bg-secondary"><ArrowRight className="h-2.5 w-2.5 text-muted-foreground" /></button>
                  <button className="p-0.5 rounded hover:bg-secondary"><UserPlus className="h-2.5 w-2.5 text-muted-foreground" /></button>
                  <button className="p-0.5 rounded hover:bg-secondary"><Link2 className="h-2.5 w-2.5 text-muted-foreground" /></button>
                </div>
              </div>
            ))}

            {/* Unlinked matters */}
            {unlinkedMatters.length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-0.5">⚠ Unlinked</div>
                {unlinkedMatters.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-0.5 group">
                    <span className="text-[11px] text-muted-foreground">{m.title}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent/25 flex items-center gap-0.5">
                      <Link2 className="h-2 w-2" />Link
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 mt-2 pt-1 border-t border-border/30">
              <button className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5">
                <Plus className="h-2 w-2" />Create matter
              </button>
              <button className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                <Zap className="h-2 w-2" />Escalate
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

function GoalBlock({ goal, onNavigate }: { goal: typeof goals[0]; onNavigate: () => void }) {
  const linked = matters.filter(m => goal.linkedMatterIds.includes(m.id));
  const hasBlocked = linked.some(m => m.status === "blocked");
  const noExec = linked.length === 0;

  return (
    <div className="py-1.5 border-b border-border/15 last:border-0">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px]">{goal.title}</span>
          {hasBlocked && <AlertTriangle className="h-2.5 w-2.5 text-destructive shrink-0" />}
          {noExec && <span className="text-[8px] px-1 py-px rounded bg-muted text-muted-foreground shrink-0">no execution</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] font-mono text-muted-foreground">{goal.progress}%</span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
              <Plus className="h-2 w-2" />Matter
            </button>
            <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
              <UserPlus className="h-2 w-2" />Assign
            </button>
            <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
              <Zap className="h-2 w-2" />Escalate
            </button>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-0.5 h-[2px] bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
      </div>
      {/* Linked matters */}
      {linked.map(m => (
        <div key={m.id} className="flex items-center justify-between py-0.5 group/m">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground ml-1">
            <Link2 className="h-2.5 w-2.5" />
            <span>{m.title}</span>
            <span className="text-[9px] font-mono">{m.owner}</span>
            <span className={`text-[8px] px-1 py-px rounded ${
              m.status === "healthy" ? "bg-success/10 text-success" :
              m.status === "at-risk" ? "bg-warning/10 text-warning" :
              m.status === "blocked" ? "bg-destructive/10 text-destructive" :
              "bg-muted text-muted-foreground"
            }`}>{m.status}</span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover/m:opacity-100 transition-opacity">
            <button onClick={onNavigate} className="p-0.5 rounded hover:bg-secondary"><ArrowRight className="h-2.5 w-2.5 text-muted-foreground" /></button>
            <button className="p-0.5 rounded hover:bg-secondary"><X className="h-2.5 w-2.5 text-muted-foreground" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ColLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{children}</div>;
}
