import { AppHeader } from "@/components/AppHeader";
import { AppLayout } from "@/components/AppLayout";
import { goals, matters } from "@/data/mockData";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";

export default function StrategyPage() {
  const longTerm = goals.filter((g) => g.type === "long-term");
  const annual = goals.filter((g) => g.type === "annual");

  const GoalCard = ({ goal, index }: { goal: typeof goals[0]; index: number }) => {
    const linkedMatters = matters.filter((m) => goal.linkedMatterIds.includes(m.id));

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="rounded-lg border bg-surface-elevated p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-display font-semibold text-sm">{goal.title}</p>
          <span className="text-xs font-medium text-muted-foreground shrink-0">{goal.progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="h-full bg-accent rounded-full"
          />
        </div>

        {/* Linked matters */}
        {linkedMatters.length > 0 && (
          <div className="mt-3 space-y-1">
            {linkedMatters.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" />
                <span>{m.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {linkedMatters.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3 italic">No linked matters</p>
        )}
      </motion.div>
    );
  };

  return (
    <AppLayout>
      <AppHeader title="Strategy" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Long-Term Direction
            </h3>
            <div className="space-y-2">
              {longTerm.map((g, i) => (
                <GoalCard key={g.id} goal={g} index={i} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Annual Goals
            </h3>
            <div className="space-y-2">
              {annual.map((g, i) => (
                <GoalCard key={g.id} goal={g} index={i} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
