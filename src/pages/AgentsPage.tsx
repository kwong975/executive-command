import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { agents, type Agent } from "@/data/mockData";
import { AgentDetailView } from "@/components/AgentDetailView";
import { AgentChatDrawer } from "@/components/AgentChatDrawer";
import { ChevronRight } from "lucide-react";

const statusColor = {
  active: "bg-success",
  idle: "bg-muted-foreground",
  error: "bg-destructive",
};

const statusText = {
  active: "Active",
  idle: "Idle",
  error: "Error",
};

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);

  return (
    <AppLayout title="Agents">
      <div className="flex flex-1 overflow-hidden">
        {/* Agent list sidebar */}
        <div className="w-56 border-r flex flex-col shrink-0 overflow-y-auto">
          <div className="px-3 py-3 border-b">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agents</span>
          </div>
          <div className="py-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors text-sm ${
                  selectedAgent.id === agent.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColor[agent.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{agent.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <AgentDetailView
          agent={selectedAgent}
          onOpenChat={() => setChatAgent(selectedAgent)}
        />

        {/* Chat drawer */}
        <AgentChatDrawer agent={chatAgent} onClose={() => setChatAgent(null)} />
      </div>
    </AppLayout>
  );
}
