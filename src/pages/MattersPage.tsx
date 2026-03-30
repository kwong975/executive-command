import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { matters, type Matter } from "@/data/mockData";
import { MatterDetail } from "@/components/MatterDetail";
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
      <AppLayout title="Matters">
        <main className="flex-1 overflow-y-auto">
          <MatterDetail matter={selected} onBack={() => setSelected(null)} />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Matters">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6">
          <div className="space-y-1">
            {matters.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                className="flex items-center justify-between py-2.5 px-3 rounded bg-surface-elevated border cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${statusStyles[m.status].dot}`} />
                  <div>
                    <p className="text-sm">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.owner} · {statusStyles[m.status].label} · {m.lastActivity}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
