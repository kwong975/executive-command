import { AppHeader } from "@/components/AppHeader";
import { AppLayout } from "@/components/AppLayout";
import { decisions, agents, matters } from "@/data/mockData";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const urgencyStyles = {
  critical: "border-l-destructive bg-destructive/5",
  important: "border-l-warning bg-warning/5",
  normal: "border-l-border",
};

export default function TodayPage() {
  const navigate = useNavigate();
  const blockedMatters = matters.filter((m) => m.status === "blocked" || m.status === "at-risk");
  const agentWithError = agents.find((a) => a.status === "error");

  return (
    <AppLayout>
      <AppHeader title="Today" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
          {/* Decisions */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Needs Your Decision
            </h3>
            <div className="space-y-3">
              {decisions.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border-l-[3px] rounded-lg p-4 bg-surface-elevated border ${urgencyStyles[d.urgency]} cursor-pointer hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm">{d.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{d.context}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        From <span className="font-medium text-foreground">{agents.find(a => a.id === d.agentId)?.name}</span> · {d.source}
                      </p>
                    </div>
                    {d.urgency === "critical" && (
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Blockers */}
          {blockedMatters.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Blocked & At Risk
              </h3>
              <div className="space-y-2">
                {blockedMatters.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate("/matters")}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border hover:shadow-sm cursor-pointer transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${m.status === "blocked" ? "bg-destructive" : "bg-warning"}`} />
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.owner} · {m.lastActivity}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Agent alert */}
          {agentWithError && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Agent Alert
              </h3>
              <div
                onClick={() => navigate("/agents")}
                className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 cursor-pointer hover:bg-destructive/10 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-sm font-display font-bold text-destructive">
                  {agentWithError.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{agentWithError.name} is blocked</p>
                  <p className="text-xs text-muted-foreground">{agentWithError.currentTask}</p>
                </div>
              </div>
            </section>
          )}

          {/* Quick signals */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Signals
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-surface-elevated border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Active matters</span>
                </div>
                <p className="text-2xl font-display font-bold">{matters.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-elevated border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Agents online</span>
                </div>
                <p className="text-2xl font-display font-bold">{agents.filter(a => a.status !== "error").length}/{agents.length}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
