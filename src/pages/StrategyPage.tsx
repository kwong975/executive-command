import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { goals, matters, businessUnits } from "@/data/mockData";
import { ColLabel, StatusDot, StatusPill, InlineAction, DenseRow } from "@/components/shared";
import {
  Link2, Plus, UserPlus, AlertTriangle,
  ArrowRight, Zap, X
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* BU Tabs */}
        <div className="border-b border-border/30 px-4 flex items-center gap-1 shrink-0">
          {businessUnits.map(bu => {
            const buBlocked = matters.filter(m => m.businessUnit === bu && m.status === "blocked").length;
            return (
              <button
                key={bu}
                onClick={() => setActiveBU(bu)}
                className={`px-4 py-2 text-[13px] font-mono font-medium border-b-2 transition-colors ${
                  activeBU === bu ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {bu}
                {buBlocked > 0 && <span className="ml-1.5 text-[10px] text-destructive font-medium">{buBlocked}</span>}
              </button>
            );
          })}
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground py-1">
            {blockedCount > 0 && <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium">{blockedCount} blocked</span>}
            {gapsCount > 0 && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{gapsCount} gaps</span>}
            <span>{buMatters.length} matters</span>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Long-term Strategy */}
          <div className="flex-1 border-r border-border/30 overflow-y-auto px-4 py-3">
            <ColLabel>Long-Term Strategy</ColLabel>
            {ltGoals.length > 0 ? ltGoals.map(g => (
              <GoalBlock key={g.id} goal={g} onNavigate={() => navigate("/matters")} />
            )) : (
              <div className="text-[12px] text-muted-foreground py-2">No long-term goals defined</div>
            )}
          </div>

          {/* Annual Goals */}
          <div className="flex-1 border-r border-border/30 overflow-y-auto px-4 py-3">
            <ColLabel>Annual Goals</ColLabel>
            {annualGoals.length > 0 ? annualGoals.map(g => (
              <GoalBlock key={g.id} goal={g} onNavigate={() => navigate("/matters")} />
            )) : (
              <div className="text-[12px] text-muted-foreground py-2">No annual goals defined</div>
            )}
          </div>

          {/* Execution / Matters */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <ColLabel>Execution — Matters</ColLabel>
            {buMatters.map(m => (
              <DenseRow key={m.id}>
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={m.status} />
                  <span className="text-[13px] truncate">{m.title}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{m.owner}</span>
                  {m.overdueCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium">{m.overdueCount}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate("/matters")} className="p-1 rounded hover:bg-secondary"><ArrowRight className="h-3 w-3 text-muted-foreground" /></button>
                  <button className="p-1 rounded hover:bg-secondary"><UserPlus className="h-3 w-3 text-muted-foreground" /></button>
                  <button className="p-1 rounded hover:bg-secondary"><Link2 className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              </DenseRow>
            ))}

            {unlinkedMatters.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-warning uppercase tracking-wider mb-1">⚠ Unlinked</div>
                {unlinkedMatters.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-1 group">
                    <span className="text-[13px] text-muted-foreground">{m.title}</span>
                    <InlineAction
                      icon={<Link2 className="h-3 w-3" />}
                      label="Link"
                      accent
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/30">
              <InlineAction icon={<Plus className="h-3 w-3" />} label="Create matter" accent />
              <InlineAction icon={<Zap className="h-3 w-3" />} label="Escalate" />
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
    <div className="py-2 border-b border-border/15 last:border-0">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px]">{goal.title}</span>
          {hasBlocked && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
          {noExec && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 font-medium">no execution</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground">{goal.progress}%</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <InlineAction icon={<Plus className="h-3 w-3" />} label="Matter" />
            <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Assign" />
            <InlineAction icon={<Zap className="h-3 w-3" />} label="Escalate" />
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-1 h-[3px] bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
      </div>
      {/* Linked matters */}
      {linked.map(m => (
        <div key={m.id} className="flex items-center justify-between py-0.5 group/m mt-1">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground ml-1">
            <Link2 className="h-3 w-3" />
            <span>{m.title}</span>
            <span className="text-[11px] font-mono">{m.owner}</span>
            <StatusPill status={m.status} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover/m:opacity-100 transition-opacity">
            <button onClick={onNavigate} className="p-1 rounded hover:bg-secondary"><ArrowRight className="h-3 w-3 text-muted-foreground" /></button>
            <button className="p-1 rounded hover:bg-secondary"><X className="h-3 w-3 text-muted-foreground" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
