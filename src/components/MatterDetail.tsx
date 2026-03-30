import { type Matter } from "@/data/mockData";
import { ArrowLeft, Circle } from "lucide-react";

const commitmentStatusStyles = {
  "on-track": "bg-success",
  overdue: "bg-destructive",
  done: "bg-muted-foreground",
  blocked: "bg-destructive",
  "at-risk": "bg-warning",
};

export function MatterDetail({ matter, onBack }: { matter: Matter; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Back + Title */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Matters
        </button>
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${
            matter.status === "healthy" ? "bg-success" : matter.status === "blocked" ? "bg-destructive" : "bg-warning"
          }`} />
          <h2 className="text-xl font-display font-bold">{matter.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{matter.description}</p>
        <p className="text-xs text-muted-foreground mt-2">Owned by <span className="font-medium text-foreground">{matter.owner}</span> · Last activity {matter.lastActivity}</p>
      </div>

      {/* Commitments */}
      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Commitments</h3>
        <div className="space-y-2">
          {matter.commitments.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-surface-elevated">
              <div className="flex items-center gap-2.5">
                <div className={`h-1.5 w-1.5 rounded-full ${commitmentStatusStyles[c.status]}`} />
                <span className="text-sm">{c.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{c.dueDate}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  c.status === "done" ? "bg-muted text-muted-foreground" :
                  c.status === "on-track" ? "bg-success/10 text-success" :
                  "bg-destructive/10 text-destructive"
                }`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Threads */}
      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Threads</h3>
        <div className="space-y-2">
          {matter.threads.map((t) => (
            <div key={t.id} className="p-3 rounded-lg border bg-surface-elevated">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">{t.source} · {t.timestamp}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                  t.status === "resolved" ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"
                }`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
