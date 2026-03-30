import { type Matter } from "@/data/mockData";
import { ArrowLeft } from "lucide-react";

const commitmentStatusStyles = {
  "on-track": "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  done: "bg-muted text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
  "at-risk": "bg-warning/10 text-warning",
};

export function MatterDetail({ matter, onBack }: { matter: Matter; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${
            matter.status === "healthy" ? "bg-success" : matter.status === "blocked" ? "bg-destructive" : "bg-warning"
          }`} />
          <h2 className="text-sm font-semibold">{matter.title}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{matter.description}</p>
        <p className="text-xs text-muted-foreground mt-1">{matter.owner} · {matter.lastActivity}</p>
      </div>

      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Commitments</h3>
        <div className="space-y-0">
          {matter.commitments.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${c.status === "done" ? "bg-muted-foreground" : c.status === "on-track" ? "bg-success" : "bg-destructive"}`} />
                <span className="text-sm">{c.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{c.dueDate}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${commitmentStatusStyles[c.status]}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Threads</h3>
        <div className="space-y-0">
          {matter.threads.map((t) => (
            <div key={t.id} className="py-2 border-b border-border/50 last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.summary}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.source} · {t.timestamp}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
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
