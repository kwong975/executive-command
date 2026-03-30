import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppLayout } from "@/components/AppLayout";
import { agents, type Agent } from "@/data/mockData";
import { AgentChatDrawer } from "@/components/AgentChatDrawer";
import { motion } from "framer-motion";
import { ChevronRight, Circle } from "lucide-react";

const statusDot = {
  active: "bg-success",
  idle: "bg-muted-foreground",
  error: "bg-destructive",
};

const statusLabel = {
  active: "Active",
  idle: "Idle",
  error: "Error",
};

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetail, setShowDetail] = useState<Agent | null>(null);

  return (
    <AppLayout>
      <AppHeader title="Agents" />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="space-y-2">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setShowDetail(showDetail?.id === agent.id ? null : agent)}
                  className={`rounded-lg border bg-surface-elevated p-4 cursor-pointer hover:shadow-sm transition-all ${
                    showDetail?.id === agent.id ? "ring-1 ring-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                        {agent.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display font-semibold text-sm">{agent.name}</p>
                          <div className={`h-1.5 w-1.5 rounded-full ${statusDot[agent.status]}`} />
                          <span className="text-xs text-muted-foreground">{statusLabel[agent.status]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showDetail?.id === agent.id ? "rotate-90" : ""}`} />
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">{agent.currentTask}</p>

                  {showDetail?.id === agent.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t space-y-4"
                    >
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Purpose</p>
                        <p className="text-sm">{agent.purpose}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Responsibilities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.responsibilities.map((r) => (
                            <span key={r} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{r}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.skills.map((s) => (
                            <span key={s} className="text-xs px-2 py-1 rounded-md bg-accent/10 text-accent">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recent Work</p>
                        <div className="space-y-1.5">
                          {agent.recentWork.map((w, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <Circle className={`h-2 w-2 mt-1.5 shrink-0 ${w.outcome === "success" ? "fill-success text-success" : "fill-destructive text-destructive"}`} />
                              <div>
                                <span>{w.description}</span>
                                <span className="text-xs text-muted-foreground ml-2">{w.timestamp}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cron Jobs</p>
                        <div className="space-y-1.5">
                          {agent.cronJobs.map((j, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${j.status === "ok" ? "bg-success" : "bg-destructive"}`} />
                                <span>{j.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{j.schedule} · {j.lastRun}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); }}
                        className="w-full mt-2 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Chat with {agent.name}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        <AgentChatDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      </div>
    </AppLayout>
  );
}
