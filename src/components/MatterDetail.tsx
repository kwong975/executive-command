import { type Matter } from "@/data/mockData";
import { ArrowLeft } from "lucide-react";

const cStatus: Record<string, string> = {
  "on-track": "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  done: "bg-muted text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
  "at-risk": "bg-warning/10 text-warning",
};

const cDot: Record<string, string> = {
  "on-track": "bg-success",
  overdue: "bg-destructive",
  done: "bg-muted-foreground",
  blocked: "bg-destructive",
  "at-risk": "bg-warning",
};

export function MatterDetail({ matter, onBack }: { matter: Matter; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-4">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-2.5 w-2.5" /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${
            matter.status === "healthy" ? "bg-success" : matter.status === "blocked" ? "bg-destructive" : matter.status === "at-risk" ? "bg-warning" : "bg-muted-foreground"
          }`} />
          <span className="text-[12px] font-semibold">{matter.title}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{matter.businessUnit}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{matter.description}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{matter.owner} · {matter.lastActivity}</p>
      </div>

      <div>
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Commitments</div>
        {matter.commitments.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${cDot[c.status]}`} />
              <span className="text-[11px]">{c.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{c.dueDate}</span>
              <span className={`text-[9px] px-1 py-px rounded ${cStatus[c.status]}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Threads</div>
        {matter.threads.map((t) => (
          <div key={t.id} className="py-1.5 border-b border-border/30 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px]">{t.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{t.summary}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{t.source} · {t.timestamp}</div>
              </div>
              <span className={`text-[9px] px-1 py-px rounded shrink-0 ${
                t.status === "resolved" ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"
              }`}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
