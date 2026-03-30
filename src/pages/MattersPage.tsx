import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { matters, unassignedThreads, agents, type Matter } from "@/data/mockData";
import { MatterDetail } from "@/components/MatterDetail";
import { CommandDrawer } from "@/components/CommandDrawer";
import { UserPlus, Archive, ArrowRight, X, MessageSquare } from "lucide-react";

type Filter = "all" | "blocked" | "at-risk" | "stale" | "unassigned";

const statusDot: Record<string, string> = {
  healthy: "bg-success",
  blocked: "bg-destructive",
  "at-risk": "bg-warning",
  stale: "bg-muted-foreground",
};

export default function MattersPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Matter | null>(null);
  const [threads, setThreads] = useState(unassignedThreads);
  const [chatAgent, setChatAgent] = useState<ReturnType<typeof agents.find>>(undefined);

  const filtered = filter === "unassigned" ? [] :
    filter === "all" ? matters :
    matters.filter((m) => m.status === filter);

  const blockedCount = matters.filter(m => m.status === "blocked").length;
  const atRiskCount = matters.filter(m => m.status === "at-risk").length;
  const staleCount = matters.filter(m => m.status === "stale").length;

  if (selected) {
    return (
      <AppLayout title="Matters">
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <MatterDetail matter={selected} onBack={() => setSelected(null)} />
          </main>
          <CommandDrawer agent={chatAgent || null} onClose={() => setChatAgent(undefined)} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Matters">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-3">
            {/* Filters */}
            <div className="flex items-center gap-1 mb-3">
              {(["all", "blocked", "at-risk", "stale", "unassigned"] as Filter[]).map((f) => {
                const count = f === "blocked" ? blockedCount : f === "at-risk" ? atRiskCount : f === "stale" ? staleCount : f === "unassigned" ? threads.length : matters.length;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                      filter === f ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "all" ? "All" : f === "at-risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
                    {count > 0 && <span className="ml-1 text-muted-foreground">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Matter rows */}
            {filter !== "unassigned" && filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                className="flex items-center justify-between py-1.5 border-b border-border/30 cursor-pointer hover:bg-secondary/30 -mx-1 px-1 rounded transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[m.status]}`} />
                  <span className="text-[11px] truncate">{m.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{m.businessUnit}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{m.owner}</span>
                  <span className="text-[10px] text-muted-foreground">{m.lastActivity}</span>
                  {m.commitments.some(c => c.status === "blocked" || c.status === "overdue") && (
                    <span className="text-[9px] px-1 py-px rounded bg-destructive/10 text-destructive">
                      {m.commitments.filter(c => c.status === "blocked" || c.status === "overdue").length} blocked
                    </span>
                  )}
                  {m.status === "stale" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="text-[10px] px-1.5 py-0.5 rounded border text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                    >
                      <Archive className="h-2.5 w-2.5" /> Archive
                    </button>
                  )}
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}

            {/* Unassigned threads */}
            {(filter === "all" || filter === "unassigned") && threads.length > 0 && (
              <div className={filter === "all" ? "mt-4" : ""}>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Unassigned · {threads.length}
                </div>
                {threads.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border/30 group -mx-1 px-1 rounded hover:bg-secondary/30 transition-colors">
                    <div className="min-w-0">
                      <div className="text-[11px]">{t.title}</div>
                      <div className="text-[10px] text-muted-foreground">{t.source} · {t.timestamp}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setThreads(prev => prev.filter(th => th.id !== t.id))}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground hover:bg-secondary/80 flex items-center gap-1"
                      >
                        <UserPlus className="h-2.5 w-2.5" /> Assign
                      </button>
                      <button className="text-[10px] px-1.5 py-0.5 rounded border text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <X className="h-2.5 w-2.5" /> Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <CommandDrawer agent={chatAgent || null} onClose={() => setChatAgent(undefined)} />
      </div>
    </AppLayout>
  );
}
