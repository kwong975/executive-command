import { AppLayout } from "@/components/AppLayout";
import { decisions, agents, matters } from "@/data/mockData";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const urgencyStyles = {
  critical: "border-l-destructive",
  important: "border-l-warning",
  normal: "border-l-border",
};

export default function TodayPage() {
  const navigate = useNavigate();
  const blockedMatters = matters.filter((m) => m.status === "blocked" || m.status === "at-risk");
  const agentWithError = agents.find((a) => a.status === "error");

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Needs Your Decision
            </h3>
            <div className="space-y-1">
              {decisions.map((d) => (
                <div
                  key={d.id}
                  className={`border-l-2 rounded pl-3 pr-3 py-2.5 bg-surface-elevated border cursor-pointer hover:bg-secondary/50 transition-colors ${urgencyStyles[d.urgency]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.context}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {agents.find(a => a.id === d.agentId)?.name} · {d.source}
                      </p>
                    </div>
                    {d.urgency === "critical" && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {blockedMatters.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Blocked & At Risk
              </h3>
              <div className="space-y-1">
                {blockedMatters.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate("/matters")}
                    className="flex items-center justify-between py-2 px-3 rounded bg-surface-elevated border hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${m.status === "blocked" ? "bg-destructive" : "bg-warning"}`} />
                      <div>
                        <p className="text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.owner} · {m.lastActivity}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {agentWithError && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Agent Alert
              </h3>
              <div
                onClick={() => navigate("/agents")}
                className="flex items-center gap-2.5 py-2 px-3 rounded bg-destructive/5 border border-destructive/20 cursor-pointer hover:bg-destructive/10 transition-colors"
              >
                <div className="h-6 w-6 rounded bg-destructive/10 flex items-center justify-center text-[10px] font-mono font-semibold text-destructive">
                  {agentWithError.avatar}
                </div>
                <div>
                  <p className="text-sm">{agentWithError.name} is blocked</p>
                  <p className="text-xs text-muted-foreground">{agentWithError.currentTask}</p>
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Signals</h3>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Active matters</span>
                <p className="text-lg font-semibold">{matters.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Agents online</span>
                <p className="text-lg font-semibold">{agents.filter(a => a.status !== "error").length}/{agents.length}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
