import { AppLayout } from "@/components/AppLayout";
import { decisions, agents, matters } from "@/data/mockData";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TodayPage() {
  const navigate = useNavigate();
  const blockedMatters = matters.filter((m) => m.status === "blocked" || m.status === "at-risk");
  const errorAgent = agents.find((a) => a.status === "error");

  return (
    <AppLayout title="Today">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Decisions */}
          <section>
            <SectionLabel>Needs Your Decision</SectionLabel>
            {decisions.map((d) => (
              <div
                key={d.id}
                className={`flex items-start gap-2 py-2 border-b border-border/40 last:border-0 cursor-pointer hover:bg-secondary/30 -mx-1 px-1 rounded transition-colors ${
                  d.urgency === "critical" ? "border-l-2 border-l-destructive pl-2" : ""
                }`}
              >
                {d.urgency === "critical" && <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium">{d.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{d.context}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {agents.find(a => a.id === d.agentId)?.name} · {d.source}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Execution risk */}
          {(blockedMatters.length > 0 || errorAgent) && (
            <section>
              <SectionLabel>Execution Risk</SectionLabel>
              {blockedMatters.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate("/matters")}
                  className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-secondary/30 -mx-1 px-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${m.status === "blocked" ? "bg-destructive" : "bg-warning"}`} />
                    <span className="text-[11px]">{m.title}</span>
                    <span className="text-[10px] text-muted-foreground">{m.owner}</span>
                  </div>
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              ))}
              {errorAgent && (
                <div
                  onClick={() => navigate("/agents")}
                  className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-secondary/30 -mx-1 px-1 rounded transition-colors"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span className="text-[11px]">{errorAgent.name} — {errorAgent.currentTask}</span>
                </div>
              )}
            </section>
          )}

          {/* Quick read */}
          <section>
            <SectionLabel>Status</SectionLabel>
            <div className="flex gap-6 text-[11px]">
              <div>
                <span className="text-muted-foreground text-[10px] block">Matters</span>
                <span className="font-semibold">{matters.length} active</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Agents</span>
                <span className="font-semibold">{agents.filter(a => a.status !== "error").length}/{agents.length} online</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Blocked</span>
                <span className="font-semibold text-destructive">{blockedMatters.filter(m => m.status === "blocked").length}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{children}</div>;
}
