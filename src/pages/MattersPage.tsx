import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppLayout } from "@/components/AppLayout";
import { matters, type Matter } from "@/data/mockData";
import { MatterDetail } from "@/components/MatterDetail";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const statusStyles = {
  healthy: { dot: "bg-success", label: "Healthy" },
  blocked: { dot: "bg-destructive", label: "Blocked" },
  "at-risk": { dot: "bg-warning", label: "At Risk" },
};

export default function MattersPage() {
  const [selected, setSelected] = useState<Matter | null>(null);

  if (selected) {
    return (
      <AppLayout>
        <AppHeader title="Matters" />
        <main className="flex-1 overflow-y-auto">
          <MatterDetail matter={selected} onBack={() => setSelected(null)} />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AppHeader title="Matters" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="space-y-2">
            {matters.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(m)}
                className="rounded-lg border bg-surface-elevated p-4 cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${statusStyles[m.status].dot}`} />
                    <div>
                      <p className="font-display font-semibold text-sm">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.owner} · {statusStyles[m.status].label} · {m.lastActivity}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {m.commitments.some((c) => c.status === "overdue" || c.status === "blocked") && (
                  <div className="mt-2 flex gap-2">
                    {m.commitments.filter(c => c.status === "overdue" || c.status === "blocked").map((c) => (
                      <span key={c.id} className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                        {c.title} — {c.status}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
