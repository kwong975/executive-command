import { AppLayout } from "@/components/AppLayout";
import { goals, matters } from "@/data/mockData";
import { Link2 } from "lucide-react";

export default function StrategyPage() {
  const longTerm = goals.filter((g) => g.type === "long-term");
  const annual = goals.filter((g) => g.type === "annual");

  const GoalRow = ({ goal }: { goal: typeof goals[0] }) => {
    const linkedMatters = matters.filter((m) => goal.linkedMatterIds.includes(m.id));
    return (
      <div className="py-2.5 px-3 rounded border bg-surface-elevated">
        <div className="flex items-center justify-between">
          <span className="text-sm">{goal.title}</span>
          <span className="text-xs font-mono text-muted-foreground">{goal.progress}%</span>
        </div>
        <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${goal.progress}%` }} />
        </div>
        {linkedMatters.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {linkedMatters.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" />
                <span>{m.title}</span>
                <span className={`text-[10px] px-1 py-0.5 rounded ${
                  m.status === "healthy" ? "bg-success/10 text-success" :
                  m.status === "at-risk" ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                }`}>{m.status}</span>
              </div>
            ))}
          </div>
        )}
        {linkedMatters.length === 0 && (
          <p className="text-xs text-muted-foreground/50 mt-2">No linked matters</p>
        )}
      </div>
    );
  };

  return (
    <AppLayout title="Strategy">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Long-Term Direction</h3>
            <div className="space-y-1">
              {longTerm.map((g) => <GoalRow key={g.id} goal={g} />)}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Annual Goals</h3>
            <div className="space-y-1">
              {annual.map((g) => <GoalRow key={g.id} goal={g} />)}
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
