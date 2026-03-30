import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { agents, type Agent } from "@/data/mockData";
import { AgentDetailView } from "@/components/AgentDetailView";
import { CommandDrawer } from "@/components/CommandDrawer";
import { StatusDot } from "@/components/shared";

export default function AgentsPage() {
  const [selected, setSelected] = useState<Agent>(agents[0]);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);

  return (
    <AppLayout title="Agents">
      <div className="flex flex-1 overflow-hidden">
        {/* Agent list */}
        <div className="w-52 border-r flex flex-col shrink-0 overflow-y-auto">
          <div className="py-1">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
                  selected.id === a.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <StatusDot status={a.status} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <AgentDetailView agent={selected} onOpenChat={() => setChatAgent(selected)} />
        <CommandDrawer agent={chatAgent} onClose={() => setChatAgent(null)} />
      </div>
    </AppLayout>
  );
}
